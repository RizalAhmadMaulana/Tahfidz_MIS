const { Client, MessageMedia, LocalAuth } = require("whatsapp-web.js");
const express = require("express");
const socketIO = require("socket.io");
const qrcode = require("qrcode");
const http = require("http");
const fs = require("fs");
const { phoneNumberFormatter } = require("./helpers/formatter");
const fileUpload = require("express-fileupload");
const axios = require("axios");

const HOST = process.env.HOST || 'localhost';
const PORT = process.env.PORT || 6969;

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: ["http://localhost:5173", "https://laporan.mentariku.org"],
    methods: ["GET", "POST"],
    credentials: true
  }
})

app.use(express.json({limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(fileUpload({ debug: false }));
app.use('/assets', express.static('assets'));

app.get("/", (req, res) => {
    res.sendFile("views/index.html", { root: __dirname });
});

app.get("/broadcast", (req, res) => {
    res.sendFile("views/broadcast.html", { root: __dirname });
});

let sessions = []; // Gunakan let agar bisa dimodifikasi
const SESSIONS_FILE = "./whatsapp-sessions.json";

// Inisialisasi file session
if (!fs.existsSync(SESSIONS_FILE)) {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify([]));
}

const setSessionsFile = (sessionsData) => {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessionsData));
};

const getSessionsFile = () => {
    return JSON.parse(fs.readFileSync(SESSIONS_FILE));
};

/**
 * LOGIKA DIPERBARUI: Menambahkan pengecekan status aktif 
 * untuk mencegah tabrakan folder userDataDir Puppeteer.
 *
 */
const createSession = async function (id, description) {
    // 1. PROTEKSI: Cek apakah sesi sudah ada di memori
    const existingSession = sessions.find(s => s.id === id);
    
    if (existingSession) {
        try {
            // Cek status koneksi client yang sudah ada
            const state = await existingSession.client.getState().catch(() => null);
            
            // Jika status sedang proses buka atau sudah konek, batalkan pembuatan baru
            if (state === 'CONNECTED' || state === 'OPENING' || state === 'PAIRING') {
                console.log(`Session ${id} is already active or processing (${state}). Skipping...`);
                return;
            }
            
            // Jika ada sesi tapi macet, hancurkan proses lamanya sebelum buat baru
            console.log(`Cleaning up stale session for: ${id}`);
            await existingSession.client.destroy().catch(() => {});
        } catch (err) {
            console.log("Cleanup error:", err.message);
        }
        // Hapus dari array global agar bisa diganti dengan yang baru
        sessions = sessions.filter(s => s.id !== id);
    }

    console.log("Creating session: " + id);

    const client = new Client({
        restartOnAuthFail: true,
        webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        },
        puppeteer: {
            // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', 
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process', 
                '--disable-gpu',
                // --- TAMBAHAN MODE TURBO (BIAR LEBIH NGEBUT) ---
                '--disable-extensions', 
                '--disable-component-extensions-with-background-pages',
                '--disable-default-apps',
                '--mute-audio',
                '--no-default-browser-check',
                '--autoplay-policy=user-gesture-required',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding',
                '--disable-infobars',
                '--disable-breakpad',
                '--disable-dev-shm-usage',
                '--disable-notifications',
                '--disable-offer-store-unmasked-wallet-cards',
                '--disable-offer-upload-credit-cards',
                '--disable-popup-blocking',
                '--disable-print-preview',
                '--disable-prompt-on-repost',
                '--disable-speech-api',
                '--disable-sync',
                '--hide-scrollbars',
                '--ignore-gpu-blacklist',
                '--metrics-recording-only',
                '--no-pings'
            ],
        },
        authStrategy: new LocalAuth({
            clientId: id,
        }),
    });

    // Segera tambahkan ke array sessions global
    sessions.push({
        id: id,
        description: description,
        client: client,
        ready: false // Status awal di memori
    });

    client.initialize().catch(err => {
        console.error(`Gagal inisialisasi ${id}:`, err.message);
        sessions = sessions.filter(s => s.id !== id);
    });

    client.on("qr", (qr) => {
        console.log(`QR RECEIVED for ${id}`);
        qrcode.toDataURL(qr, (err, url) => {
            io.emit("qr", { id: id, src: url });
            io.emit("message", { id: id, text: "QR Code received, scan please!" });
        });
    });

    client.on("ready", () => {
        console.log(`Whatsapp is ready for: ${id}`);
        io.emit("ready", { id: id });
        io.emit("message", { id: id, text: "Whatsapp is ready!" });

        // UPDATE STATUS DI MEMORI
        const sessionMem = sessions.find((s) => s.id == id);
        if (sessionMem) sessionMem.ready = true;

        // UPDATE STATUS DI FILE
        const savedSessions = getSessionsFile();
        const sessionIndex = savedSessions.findIndex((sess) => sess.id == id);
        if (sessionIndex !== -1) {
            savedSessions[sessionIndex].ready = true;
            setSessionsFile(savedSessions);
        }
    });

    client.on("authenticated", () => {
        io.emit("authenticated", { id: id });
        io.emit("message", { id: id, text: "Whatsapp is authenticated!" });
    });

    client.on("disconnected", (reason) => {
        console.log(`Client ${id} disconnected: ${reason}`);
        io.emit("message", { id: id, text: "Whatsapp is disconnected!" });
        client.destroy();
        
        sessions = sessions.filter(s => s.id !== id);
        
        const savedSessions = getSessionsFile().filter(s => s.id !== id);
        setSessionsFile(savedSessions);
        io.emit("remove-session", id);
    });

    const savedSessions = getSessionsFile();
    if (savedSessions.findIndex(sess => sess.id == id) == -1) {
        savedSessions.push({ id: id, description: description, ready: false });
        setSessionsFile(savedSessions);
    }
};

/**
 * PERBAIKAN LOGIKA INIT:
 * Mengambil status ready asli dari memori sessions agar tidak reset saat pindah menu.
 *
 */
const init = function (socket) {
    const savedSessions = getSessionsFile();
    if (savedSessions.length > 0) {
        if (socket) {
            // Map data dari file dengan status real-time di memori
            const sessionsWithStatus = savedSessions.map(sess => {
                const liveSession = sessions.find(s => s.id === sess.id);
                return {
                    ...sess,
                    ready: liveSession ? liveSession.ready : false // Ambil status asli
                };
            });
            socket.emit("init", sessionsWithStatus);
        } else {
            savedSessions.forEach((sess) => createSession(sess.id, sess.description));
        }
    }
};

init();

io.on("connection", function (socket) {
    init(socket);
    socket.on("create-session", (data) => createSession(data.id, data.description));

    /**
     * LOGIKA BARU: Logout untuk Ganti Nomor
     * Memutus koneksi tanpa menghapus sesi dari daftar UI.
     */
    socket.on("logout-session", async function (data) {
        const id = data.id;
        const session = sessions.find((s) => s.id === id);

        if (session && session.client) {
            try {
                console.log(`Logging out session for re-scan: ${id}`);
                // 1. Logout & Destroy browser lama agar folder tidak terkunci
                await session.client.logout().catch(() => {}); 
                await session.client.destroy().catch(() => {});
                
                // 2. Beritahu Frontend untuk menampilkan status "Initializing" lagi
                io.emit("re-init", id);

                // 3. Update status di file JSON tetap ada tapi ready: false
                const savedSessions = getSessionsFile();
                const sessionIndex = savedSessions.findIndex((sess) => sess.id == id);
                if (sessionIndex !== -1) {
                    savedSessions[sessionIndex].ready = false;
                    setSessionsFile(savedSessions);
                }

                // 4. Trigger inisialisasi ulang untuk memunculkan QR baru
                sessions = sessions.filter(s => s.id !== id);
                createSession(id, session.description);

            } catch (err) {
                console.log("Error during logout:", err.message);
            }
        }
    });

    socket.on("delete-session", async function (data) {
        const id = data.id;
        const session = sessions.find((s) => s.id === id);

        if (session && session.client) {
            try {
                console.log(`Logging out and destroying session: ${id}`);
                await session.client.logout().catch(() => {}); 
                await session.client.destroy().catch(() => {});
            } catch (err) {
                console.log("Error during disconnect:", err.message);
            }
        }

        sessions = sessions.filter((s) => s.id !== id);
        const savedSessions = getSessionsFile().filter((s) => s.id !== id);
        setSessionsFile(savedSessions);
        io.emit("remove-session", id);
    });
});

// API: Send Message
app.post("/send-message", async (req, res) => {
    // Tambahkan media, mimetype, dan media_name ke request body
    const { sender, number, message, media, mimetype, media_name } = req.body;
    const formattedNumber = phoneNumberFormatter(number);
    const session = sessions.find((sess) => sess.id == sender);

    if (!session || !session.client) {
        return res.status(422).json({
            status: false,
            message: `The sender: ${sender} is not found or not initialized!`,
        });
    }

    try {
        const state = await session.client.getState();
        if (state !== 'CONNECTED') throw new Error('WhatsApp Client is not connected');

        let response;

        // LOGIKA: Jika ada data media (Base64), kirim sebagai Gambar/File
        if (media && mimetype) {
            const mediaObject = new MessageMedia(mimetype, media, media_name || "attachment");
            // Kirim media dengan caption berupa pesan teks
            response = await session.client.sendMessage(formattedNumber, mediaObject, { 
                caption: message 
            });
        } else {
            // Jika tidak ada media, kirim teks biasa seperti biasa
            response = await session.client.sendMessage(formattedNumber, message);
        }

        res.status(200).json({ status: true, response: response });
    } catch (err) {
        console.error("API ERROR:", err);
        res.status(500).json({
            status: false,
            response: err.message || "An error occurred while sending the message",
        });
    }
});

// Endpoint untuk memproses Broadcast
app.post("/broadcast", async (req, res) => {
    const { sender, numbers, message, file, delay } = req.body;
    const session = sessions.find((sess) => sess.id == sender);
    
    const listNumbers = numbers.split(",").map(num => num.trim());
    const delayMs = parseInt(delay) * 1000 || 5000;

    if (!session || !session.client) {
        return res.status(422).json({ status: false, message: "Session tidak ditemukan!" });
    }

    res.status(200).json({ status: true, message: "Proses broadcast dimulai..." });

    for (const number of listNumbers) {
        try {
            const formattedNumber = phoneNumberFormatter(number);
            if (file) {
                const media = await MessageMedia.fromUrl(file);
                await session.client.sendMessage(formattedNumber, media, { caption: message });
            } else {
                await session.client.sendMessage(formattedNumber, message);
            }
            console.log(`Broadcast sukses ke: ${number}`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        } catch (err) {
            console.error(`Gagal kirim ke ${number}:`, err.message);
        }
    }
});

// Endpoint untuk mengirim media
app.post("/send-media", async (req, res) => {
    const { sender, number, caption, file } = req.body;
    const formattedNumber = phoneNumberFormatter(number);
    const session = sessions.find((sess) => sess.id == sender);

    if (!session || !session.client) {
        return res.status(422).json({ status: false, message: `Sender: ${sender} not found!` });
    }

    try {
        const media = await MessageMedia.fromUrl(file);
        const response = await session.client.sendMessage(formattedNumber, media, { caption: caption });
        res.status(200).json({ status: true, response: response });
    } catch (err) {
        console.error("MEDIA API ERROR:", err);
        res.status(500).json({ status: false, response: err.message || "Gagal mengirim media" });
    }
});

server.listen(PORT, () => {
    console.log(`Server Mutabaah MIS WA Gateway running on http://${HOST}:${PORT}`);
    const uploadsDir = __dirname + '/assets/uploads';
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
});
