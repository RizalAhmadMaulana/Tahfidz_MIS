import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../../components/templates/DashboardLayout";
import DashboardInput from "../../components/atoms/DashboardInput";
import ActionButton from "../../components/atoms/ActionButton";
import { 
  BiEnvelope, BiSend, BiBroadcast, BiLayerPlus, 
  BiLoaderAlt, BiUser, BiCloudUpload, BiFile, BiX 
} from "react-icons/bi";

const KirimPesanPage = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // --- STATE UMUM ---
  const [kelasList, setKelasList] = useState([]);

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
  const [mediaFile, setMediaFile] = useState(null); // State Media Opsional

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/academic/kelas/", { headers })
      .then(res => setKelasList(res.data))
      .catch(err => console.error("Gagal ambil kelas:", err));
  }, []);

  useEffect(() => {
    if (personalKelas && personalKelas !== "") {
      setFetchingSiswa(true);
      setSelectedSiswa("");
      axios.get(`http://127.0.0.1:8000/api/siswa/?kelas=${personalKelas}`, { headers })
        .then(res => {
          setPersonalSiswaList(res.data);
          setFetchingSiswa(false);
        })
        .catch(err => {
          console.error("Gagal ambil siswa:", err);
          setFetchingSiswa(false);
        });
    } else {
      setPersonalSiswaList([]);
      setSelectedSiswa("");
    }
  }, [personalKelas]);

  const handleSendPersonal = async (e) => {
    e.preventDefault();
    const siswaObj = personalSiswaList.find(s => String(s.id) === String(selectedSiswa));
    if (!siswaObj || !personalMessage) return alert("Pilih Siswa dan isi Pesan!");
    if (!siswaObj.phone_number) return alert("Nomor WA Siswa tidak ditemukan!");

    setPersonalLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/api/wa/send-message/", {
        number: siswaObj.phone_number,
        message: personalMessage,
        nama_siswa: `${siswaObj.first_name} ${siswaObj.last_name}`
      }, { headers });
      alert(`Pesan terkirim ke ${siswaObj.first_name}!`);
      setPersonalMessage("");
    } catch (err) { 
      alert("Gagal mengirim pesan."); 
    } finally { setPersonalLoading(false); }
  };

  // LOGIKA: Kirim Broadcast dengan Media (Opsional)
  const handleSendBroadcast = async () => {
    if (!broadcastMessage) return alert("Pesan tidak boleh kosong!");
    
    setBroadcastLoading(true);
    const formData = new FormData();
    formData.append('kelas', selectedBroadcastKelas);
    formData.append('message', broadcastMessage);
    formData.append('delay', delay);
    if (mediaFile) {
        formData.append('media', mediaFile);
    }

    try {
      await axios.post("http://127.0.0.1:8000/api/wa/broadcast/", formData, { 
        headers: { 
            ...headers,
            'Content-Type': 'multipart/form-data' 
        } 
      });
      alert("Broadcast sedang diproses oleh sistem!");
      setBroadcastMessage("");
      setMediaFile(null);
    } catch (err) { 
      alert("Gagal memulai broadcast."); 
    } finally { setBroadcastLoading(false); }
  };

  return (
    <DashboardLayout title="Kirim Pesan">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* PANEL KIRIM PESAN PERSONAL */}
        <div className="bg-white rounded-xl p-6 border-t-[5px] border-[#5294A9] shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6 text-[#5294A9] font-bold text-lg border-b pb-3">
            <BiUser className="text-2xl" /> KIRIM PESAN PERSONAL
          </div>
          <form onSubmit={handleSendPersonal} className="space-y-5 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DashboardInput label="1. Pilih Kelas" type="select" options={[{value: "", label: "-- Pilih --"}, ...kelasList.map(k => ({ value: k.nama_kelas, label: k.nama_kelas }))]} value={personalKelas} onChange={(e) => setPersonalKelas(e.target.value)} />
              <DashboardInput label="2. Nama Siswa" type="select" disabled={!personalKelas || fetchingSiswa} options={[{value: "", label: fetchingSiswa ? "Memuat..." : "-- Pilih --"}, ...personalSiswaList.map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name}` }))]} value={selectedSiswa} onChange={(e) => setSelectedSiswa(e.target.value)} />
            </div>
            <div className="flex-1">
              <label className="block font-bold text-slate-700 mb-2 text-sm">Isi Pesan Personal</label>
              <textarea className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium focus:ring-2 focus:ring-[#5294A9]/30 transition-all text-sm shadow-inner" placeholder="Tulis pesan..." value={personalMessage} onChange={(e) => setPersonalMessage(e.target.value)} />
            </div>
            <div className="pt-4">
              <ActionButton label={personalLoading ? "Mengirim..." : "Kirim Sekarang"} icon={personalLoading ? BiLoaderAlt : BiSend} variant="primary" className="w-full py-3.5 rounded-xl shadow-md font-bold uppercase tracking-wider" disabled={personalLoading || !selectedSiswa} />
            </div>
          </form>
        </div>

        {/* PANEL KIRIM BROADCAST MASSAL */}
        <div className="bg-white rounded-xl p-6 border-t-[5px] border-[#1B4332] shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-6 text-[#1B4332] font-bold text-lg border-b pb-3">
            <BiBroadcast className="text-2xl" /> KIRIM BROADCAST MASSAL
          </div>
          <div className="space-y-5 flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DashboardInput label="Target Kelas" type="select" options={["Semua", ...kelasList.map(k => k.nama_kelas)]} value={selectedBroadcastKelas} onChange={(e) => setSelectedBroadcastKelas(e.target.value)} />
              <DashboardInput label="Jeda (Detik)" type="number" value={delay} onChange={(e) => setDelay(e.target.value)} />
            </div>

            {/* INPUT MEDIA OPSIONAL */}
            <div>
                <label className="block font-bold text-slate-700 mb-2 text-sm">Lampiran Media (Opsional)</label>
                <div className={`relative border-2 border-dashed rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 ${mediaFile ? 'border-emerald-500 bg-emerald-50' : 'border-slate-300 bg-slate-50 hover:border-[#1B4332]'}`}>
                    {!mediaFile ? (
                        <>
                            <BiCloudUpload className="text-3xl text-slate-400" />
                            <p className="text-[0.65rem] text-slate-500 font-bold uppercase">Klik untuk Pilih Gambar/File</p>
                            <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => setMediaFile(e.target.files[0])} />
                        </>
                    ) : (
                        <div className="flex items-center justify-between w-full px-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm"><BiFile className="text-2xl text-emerald-600" /></div>
                                <div className="flex flex-col">
                                    <span className="text-[0.7rem] font-black text-slate-700 truncate max-w-[150px]">{mediaFile.name}</span>
                                    <span className="text-[0.6rem] text-slate-400">{(mediaFile.size / 1024).toFixed(1)} KB</span>
                                </div>
                            </div>
                            <button onClick={() => setMediaFile(null)} className="p-1.5 hover:bg-red-100 text-red-500 rounded-full transition-all"><BiX className="text-xl" /></button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1">
              <label className="block font-bold text-slate-700 mb-2 text-sm">Isi Pesan Broadcast</label>
              <textarea className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium focus:ring-2 focus:ring-[#1B4332]/30 transition-all text-sm shadow-inner" placeholder="Pesan pengumuman..." value={broadcastMessage} onChange={(e) => setBroadcastMessage(e.target.value)} />
            </div>
            
            <div className="pt-4">
              <ActionButton label={broadcastLoading ? "Memproses..." : "Mulai Kirim Massal"} icon={broadcastLoading ? BiLoaderAlt : BiLayerPlus} className="w-full py-3.5 rounded-xl bg-[#1B4332] hover:bg-[#2D6A4F] text-white shadow-md font-bold uppercase tracking-wider" onClick={handleSendBroadcast} disabled={broadcastLoading} />
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default KirimPesanPage;