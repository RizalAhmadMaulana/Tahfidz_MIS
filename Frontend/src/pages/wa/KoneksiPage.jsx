import { useState, useEffect } from "react";
import io from "socket.io-client";
import DashboardLayout from "../../components/templates/DashboardLayout";
import { 
  BiPlus, 
  BiDevices, 
  BiCheckCircle, 
  BiLoaderAlt, 
  BiTrash, 
  BiRefresh,
  BiQrScan,
  BiTerminal,
  BiInfoCircle,
  BiWifi,
  BiWifiOff,
  BiHash
} from "react-icons/bi";

const SOCKET_URL = "https://laporan.mentariku.org";

const KoneksiPage = () => {
  const [sessions, setSessions] = useState([]);
  const [clientId, setClientId] = useState("admin_mis");
  const [description, setDescription] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("init", (data) => {
      setSessions(data.map(s => ({ 
        ...s, 
        qr: null, 
        logs: s.ready ? ["Whatsapp is Ready!"] : ["Waiting for connection..."] 
      })));
    });

    newSocket.on("qr", (data) => {
      setSessions(prev => prev.map(s => s.id === data.id ? { ...s, qr: data.src, logs: ["QR Received, scan now!"] } : s));
    });

    newSocket.on("ready", (data) => {
      setSessions(prev => prev.map(s => s.id === data.id ? { ...s, ready: true, qr: null, logs: ["Whatsapp is Ready!"] } : s));
    });

    newSocket.on("message", (data) => {
      setSessions(prev => prev.map(s => s.id === data.id ? { ...s, logs: [...(s.logs || []), data.text] } : s));
    });

    newSocket.on("re-init", (id) => {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, ready: false, qr: null, logs: ["Restarting engine..."] } : s));
    });

    newSocket.on("remove-session", (id) => {
      setSessions(prev => prev.filter(s => s.id !== id));
    });

    return () => newSocket.close();
  }, []);

  const handleDisconnect = (sessionId) => {
    if (window.confirm(`Hapus koneksi perangkat ${sessionId}? Anda harus scan ulang nanti.`)) {
        socket.emit("logout-session", { id: sessionId });
    }
  };

  const handleDelete = (sessionId) => {
    if (window.confirm(`Hapus sesi ${sessionId} secara permanen?`)) {
        socket.emit("delete-session", { id: sessionId });
    }
  };

  const handleCreateSession = (e) => {
    e.preventDefault();
    if (!description) return alert("Deskripsi wajib diisi!");
    if (sessions.find(s => s.id === clientId)) return alert("Sesi ini sudah aktif!");

    const newSession = { id: clientId, description: description, ready: false, qr: null, logs: ["Launching..."] };
    setSessions(prev => [...prev, newSession]);
    socket.emit("create-session", { id: clientId, description: description });
    setDescription("");
  };

  return (
    <DashboardLayout title="Koneksi Perangkat">
      {/* PERBAIKAN: Kontainer Utama Adaptif (Mobile: Scroll Luar | Desktop: No Scroll) */}
      <div className="flex flex-col lg:flex-row gap-4 lg:h-[calc(100vh-140px)] w-full overflow-y-auto lg:overflow-hidden custom-scrollbar">
        
        {/* PANEL KIRI: Konfigurasi */}
        <div className="w-full lg:w-72 flex flex-col gap-3 flex-shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="bg-[#1B4332] px-4 py-2.5 flex items-center gap-2">
              <BiDevices className="text-white text-lg" />
              <h5 className="text-white font-bold text-[0.65rem] uppercase tracking-widest">Gateway Setup</h5>
            </div>

            <form onSubmit={handleCreateSession} className="p-4 space-y-4">
              <div>
                <label className="text-[0.6rem] font-bold text-slate-400 uppercase mb-1 block">Sender ID (Locked)</label>
                <input 
                  type="text" 
                  className="w-full px-2 py-2 bg-slate-100 border border-slate-200 rounded-md outline-none text-[0.7rem] font-mono text-slate-500 cursor-not-allowed"
                  value={clientId}
                  readOnly 
                  required
                />
              </div>
              <div>
                <label className="text-[0.6rem] font-bold text-slate-400 uppercase mb-1 block">Description</label>
                <textarea 
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none h-20 text-xs resize-none focus:border-[#1B4332]"
                  placeholder="Keterangan penggunaan..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={sessions.length > 0}
                className={`w-full font-bold py-2.5 rounded-lg transition-all text-xs flex items-center justify-center gap-2 ${sessions.length > 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-[#1B4332] hover:bg-[#2ECC71] text-white shadow-sm'}`}
              >
                <BiPlus className="text-base" /> {sessions.length > 0 ? "Gateway Active" : "Create Device"}
              </button>
            </form>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex gap-2 items-start">
            <BiInfoCircle className="text-emerald-600 text-sm shrink-0 mt-0.5" />
            <p className="text-[0.62rem] text-emerald-800 leading-snug">
              Pastikan WA di HP dalam mode <b>Perangkat Tertaut</b>. Scan QR saat muncul dan tunggu status <b>CONNECTED</b>.
            </p>
          </div>
        </div>

        {/* PANEL KANAN: Konten Utama (Otomatis tampil di bawah pada Mobile) */}
        <div className="flex-1 min-h-[500px] lg:min-h-0 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {sessions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                <BiQrScan className="text-3xl text-slate-200" />
              </div>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No Active Sessions</p>
              <p className="text-slate-300 text-[0.65rem] mt-1">Configure your device on the left to start.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              <div className="flex-1 lg:overflow-y-auto custom-scrollbar p-3 md:p-4">
                <div className="grid grid-cols-1 gap-4 h-full">
                  {sessions.map((session) => (
                    <div key={session.id} className="border border-slate-100 rounded-2xl flex flex-col bg-slate-50/30 overflow-hidden h-full">
                      
                      {/* Sub-Header Card */}
                      <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {session.ready ? <BiWifi className="text-emerald-500" /> : <BiWifiOff className="text-amber-500" />}
                          <span className="text-[0.65rem] font-black text-slate-600 uppercase">Instance: {session.id}</span>
                        </div>
                        <button onClick={() => handleDelete(session.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                          <BiTrash className="text-lg" />
                        </button>
                      </div>

                      {/* AREA QR: ELEMEN UTAMA */}
                      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white/50">
                        {!session.ready ? (
                          <div className="flex flex-col items-center">
                            {session.qr ? (
                              <div className="group relative text-center">
                                <div className="p-3 md:p-5 bg-white border-2 border-slate-100 rounded-3xl shadow-xl transition-all inline-block">
                                   <img src={session.qr} alt="QR" className="w-48 h-48 md:w-64 md:h-64 object-contain" />
                                </div>
                                <div className="mt-4 flex items-center justify-center gap-1.5 text-emerald-600 font-black text-[0.7rem] uppercase animate-pulse">
                                  <BiQrScan className="text-lg" /> Ready to Scan
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-3">
                                <BiLoaderAlt className="text-5xl animate-spin text-[#1B4332]" />
                                <span className="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest">Launching Engine...</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center animate-[fadeIn_0.5s]">
                            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4 mx-auto border-2 border-emerald-200">
                              <BiCheckCircle className="text-6xl text-emerald-600" />
                            </div>
                            <h4 className="text-emerald-900 font-black text-2xl md:text-3xl uppercase tracking-tight">Connected</h4>
                            <p className="text-slate-400 text-[0.7rem] font-bold mt-1 uppercase mb-6">{session.description}</p>
                            <button 
                              onClick={() => handleDisconnect(session.id)}
                              className="px-6 py-2.5 bg-orange-50 text-orange-600 border border-orange-200 rounded-full text-[0.65rem] font-black hover:bg-orange-600 hover:text-white transition-all flex items-center gap-2 mx-auto active:scale-95 shadow-sm"
                            >
                              <BiRefresh className="text-lg" /> Disconnect (Scan Ulang)
                            </button>
                          </div>
                        )}
                      </div>

                      {/* AREA LOG */}
                      <div className="h-28 bg-slate-900 flex flex-col border-t border-slate-800">
                        <div className="px-3 py-1.5 flex items-center gap-2 border-b border-white/5 bg-slate-800/40">
                          <BiTerminal className="text-blue-400 text-sm" />
                          <span className="text-slate-500 text-[0.55rem] font-black uppercase tracking-widest">System Output</span>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 font-mono text-[0.6rem]">
                           {session.logs?.map((log, i) => (
                             <div key={i} className="flex gap-2 text-slate-400 mb-0.5 leading-tight">
                                <span className="text-slate-700 select-none shrink-0">[{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]</span>
                                <span className="text-blue-500/40 shrink-0"><BiHash /></span>
                                <span className="text-slate-300">{log}</span>
                             </div>
                           ))}
                           {session.logs?.length === 0 && <div className="text-slate-600 italic">Listening for events...</div>}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default KoneksiPage;
