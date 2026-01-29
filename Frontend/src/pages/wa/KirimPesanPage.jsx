import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../../components/templates/DashboardLayout";
import DashboardInput from "../../components/atoms/DashboardInput";
import ActionButton from "../../components/atoms/ActionButton";
import { 
  BiEnvelope, BiSend, BiBroadcast, BiLayerPlus, 
  BiLoaderAlt, BiUser, BiCloudUpload, BiFile, BiX 
} from "react-icons/bi";
// 1. IMPORT NOTIFIKASI
import SuccessNotification from "../../components/atoms/SuccessNotification";

const KirimPesanPage = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // --- STATE UMUM ---
  const [kelasList, setKelasList] = useState([]);

  // --- STATE UNTUK NOTIFIKASI ---
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // --- STATE UNTUK KIRIM PERSONAL ---
  const [personalKelas, setPersonalKelas] = useState("");
  const [personalSiswaList, setPersonalSiswaList] = useState([]);
  const [selectedSiswa, setSelectedSiswa] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [personalLoading, setPersonalLoading] = useState(false);
  const [fetchingSiswa, setFetchingSiswa] = useState(false);

  // --- STATE UNTUK KIRIM BROADCAST ---
  const [selectedBroadcastKelas, setSelectedBroadcastKelas] = useState("Semua");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [delay, setDelay] = useState(10);
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);

  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/academic/kelas/", { headers });
        setKelasList(res.data);
      } catch (err) { console.error("Gagal load kelas", err); }
    };
    fetchKelas();
  }, []);

  const fetchSiswaByKelas = async (namaKelas) => {
    setFetchingSiswa(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/siswa/?kelas=${namaKelas}`, { headers });
      setPersonalSiswaList(res.data);
    } catch (err) { console.error(err); }
    finally { setFetchingSiswa(false); }
  };

  const handleKelasChange = (e) => {
    const val = e.target.value;
    setPersonalKelas(val);
    setSelectedSiswa("");
    if (val) fetchSiswaByKelas(val);
    else setPersonalSiswaList([]);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        setMediaFile(e.target.files[0]);
    }
  };

  // 2. FUNGSI TRIGGER NOTIFIKASI
  const triggerNotification = (msg) => {
    setSuccessMsg(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // --- HANDLER KIRIM PERSONAL ---
  const handleSendPersonal = async () => {
    if (!selectedSiswa || !personalMessage) return alert("Pilih siswa dan isi pesan!");
    
    // Cari data siswa untuk dapat nomor WA
    const siswaData = personalSiswaList.find(s => String(s.id) === String(selectedSiswa));
    if (!siswaData || !siswaData.phone_number) return alert("Siswa ini tidak memiliki nomor WA.");

    setPersonalLoading(true);
    try {
       await axios.post("http://127.0.0.1:8000/api/wa/send-message/", {
         number: siswaData.phone_number,
         message: personalMessage,
         nama_siswa: `${siswaData.first_name} ${siswaData.last_name}`
       }, { headers });
       
       // GANTI ALERT DENGAN NOTIFIKASI
       triggerNotification("Pesan personal berhasil dikirim!");
       setPersonalMessage(""); // Reset pesan
    } catch (err) {
       alert("Gagal mengirim pesan. Cek koneksi WA.");
    } finally {
       setPersonalLoading(false);
    }
  };

  // --- HANDLER KIRIM BROADCAST ---
  const handleSendBroadcast = async () => {
    if (!broadcastMessage) return alert("Isi pesan broadcast!");
    
    setBroadcastLoading(true);
    const formData = new FormData();
    formData.append("kelas", selectedBroadcastKelas);
    formData.append("message", broadcastMessage);
    formData.append("delay", delay);
    if (mediaFile) {
        formData.append("media", mediaFile);
    }

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/wa/broadcast/", formData, {
        headers: { 
            ...headers,
            "Content-Type": "multipart/form-data"
        }
      });
      
      // GANTI ALERT DENGAN NOTIFIKASI
      triggerNotification(`Broadcast Selesai! Sukses: ${res.data.summary.success}, Gagal: ${res.data.summary.failed}`);
      
      setBroadcastMessage("");
      setMediaFile(null);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat broadcast.");
    } finally {
      setBroadcastLoading(false);
    }
  };

  return (
    <DashboardLayout title="Kirim Pesan">
      
      {/* 3. RENDER NOTIFIKASI DISINI */}
      {showSuccess && <SuccessNotification message={successMsg} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* --- PANEL KIRI: PERSONAL MESSAGE --- */}
        <div className="bg-white rounded-[8px] p-4 md:p-6 border-t-[5px] border-[#17CA4D] shadow-[0_4px_15px_rgba(0,0,0,0.05)]">

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                    <BiSend className="text-xl" />
                </div>
                <div>
                    <h2 className="font-bold text-lg text-slate-800">Kirim Personal</h2>
                    <p className="text-xs text-slate-500 font-medium">Kirim pesan spesifik ke satu wali murid</p>
                </div>
            </div>

            <div className="space-y-5 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                    <DashboardInput label="Pilih Kelas" type="select" options={[{value:"", label:"-- Pilih --"}, ...kelasList.map(k => ({value:k.nama_kelas, label:k.nama_kelas}))]} value={personalKelas} onChange={handleKelasChange} />
                    
                    <div className="w-full">
                        <label className="block font-bold text-slate-700 mb-2 text-sm">Pilih Siswa</label>
                        <div className="relative">
                             <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm appearance-none disabled:bg-slate-100 disabled:text-slate-400" 
                                value={selectedSiswa} 
                                onChange={(e) => setSelectedSiswa(e.target.value)}
                                disabled={!personalKelas || fetchingSiswa}
                             >
                                <option value="">{fetchingSiswa ? "Loading..." : "-- Pilih Siswa --"}</option>
                                {personalSiswaList.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                             </select>
                             <BiUser className="absolute right-4 top-3.5 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="w-full">
                    <label className="block font-bold text-slate-700 mb-2 text-sm">Isi Pesan</label>
                    <textarea 
                        className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm shadow-inner"
                        placeholder="Tulis pesan personal di sini..."
                        value={personalMessage}
                        onChange={(e) => setPersonalMessage(e.target.value)}
                    ></textarea>
                </div>

                <div className="pt-2">
                    <ActionButton 
                        label={personalLoading ? "Mengirim..." : "Kirim Pesan"} 
                        icon={personalLoading ? BiLoaderAlt : BiSend} 
                        className="w-full py-3.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white shadow-md font-bold uppercase tracking-wider"
                        onClick={handleSendPersonal}
                        disabled={personalLoading}
                    />
                </div>
            </div>
        </div>

        {/* --- PANEL KANAN: BROADCAST MESSAGE --- */}
        <div className="bg-white rounded-[8px] p-4 md:p-6 border-t-[5px] border-[#17CA4D] shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm">
                    <BiLayerPlus className="text-xl" />
                </div>
                <div>
                    <h2 className="font-bold text-lg text-slate-800">Broadcast Umum</h2>
                    <p className="text-xs text-slate-500 font-medium">Kirim pengumuman massal ke seluruh/per kelas</p>
                </div>
            </div>

            <div className="space-y-5 relative z-10">
                <div className="grid grid-cols-2 gap-4">
                     <DashboardInput label="Target Audience" type="select" options={[{value:"Semua", label:"Semua Kelas"}, ...kelasList.map(k => ({value:k.nama_kelas, label:`Kelas ${k.nama_kelas}`}))]} value={selectedBroadcastKelas} onChange={(e) => setSelectedBroadcastKelas(e.target.value)} />
                     <DashboardInput label="Delay (Detik)" type="number" value={delay} onChange={(e) => setDelay(e.target.value)} placeholder="10" />
                </div>

                {/* MEDIA UPLOAD SECTION */}
                <div className="w-full">
                    <label className="block font-bold text-slate-700 mb-2 text-sm flex justify-between">
                        <span>Lampiran Media (Gambar/PDF)</span>
                        <span className="text-xs text-slate-400 font-normal">*Opsional, Max 2MB</span>
                    </label>
                    
                    {!mediaFile ? (
                        <div className="relative group">
                            <input type="file" onChange={handleFileChange} accept="image/*,.pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 group-hover:border-[#1B4332] group-hover:text-[#1B4332] transition-all bg-slate-50">
                                <BiCloudUpload className="text-3xl mb-1" />
                                <span className="text-xs font-semibold">Klik untuk upload</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-3 px-4">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="bg-white p-2 rounded-lg text-green-600 shadow-sm"><BiFile /></div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-xs font-bold text-slate-700 truncate w-[150px]">{mediaFile.name}</span>
                                    <span className="text-[0.6rem] text-slate-400">{(mediaFile.size / 1024).toFixed(1)} KB</span>
                                </div>
                            </div>
                            <button onClick={() => setMediaFile(null)} className="p-1.5 hover:bg-red-100 text-red-500 rounded-full transition-all"><BiX className="text-xl" /></button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 mt-5">
              <label className="block font-bold text-slate-700 mb-2 text-sm">Isi Pesan Broadcast</label>
              <textarea className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium focus:ring-2 focus:ring-[#1B4332]/30 transition-all text-sm shadow-inner" placeholder="Pesan pengumuman..." value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} />
            </div>
            
            <div className="pt-4">
              <ActionButton label={broadcastLoading ? "Memproses..." : "Mulai Kirim Massal"} icon={broadcastLoading ? BiLoaderAlt : BiLayerPlus} className="w-full py-3.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white shadow-md font-bold uppercase tracking-wider" onClick={handleSendBroadcast} disabled={broadcastLoading} />
              <p className="text-center text-[0.65rem] text-slate-400 mt-2 italic">*Pesan akan dikirim antrian satu per satu sesuai delay waktu</p>
            </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default KirimPesanPage;