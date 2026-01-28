import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../../components/templates/DashboardLayout";
import DashboardInput from "../../components/atoms/DashboardInput";
import ActionButton from "../../components/atoms/ActionButton";
import { BiEnvelope, BiSend, BiTimeFive, BiCheckCircle, BiXCircle, BiLoaderAlt } from "react-icons/bi";

const KirimPesanPage = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [form, setForm] = useState({ number: "", message: "" });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // LOGIKA: Ambil Riwayat Pesan dari Backend
  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/wa/logs/", { headers });
      setLogs(res.data);
    } catch (err) { console.error("Gagal load log WA", err); }
    finally { setFetching(false); }
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.number || !form.message) return alert("Nomor dan Pesan wajib diisi!");
    
    setLoading(true);
    try {
      await axios.post("http://127.0.0.1:8000/api/wa/send-message/", form, { headers });
      alert("Pesan sedang diproses oleh Gateway!");
      setForm({ number: "", message: "" });
      fetchLogs();
    } catch (err) { alert("Gagal mengirim pesan."); }
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout title="Kirim Pesan">
      {/* SEKSI 1: FORM KIRIM PESAN */}
      <div className="bg-white rounded-[8px] p-6 border-t-[5px] border-[#1B4332] shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-6 text-[#1B4332] font-bold text-lg border-b pb-3">
          <BiEnvelope className="text-2xl" /> FORM KIRIM PESAN
        </div>
        
        <form onSubmit={handleSend} className="space-y-4 max-w-2xl mx-auto">
          <DashboardInput 
            label="Nomor WhatsApp (Contoh: 628xxx)" 
            placeholder="Masukkan nomor penerima..."
            value={form.number}
            onChange={(e) => setForm({...form, number: e.target.value.replace(/\D/g, "")})}
          />
          <div>
            <label className="block font-bold text-slate-700 mb-2 text-sm">Isi Pesan</label>
            <textarea 
              className="w-full h-32 p-4 bg-[#D9D9D9] border-none rounded-[4px] outline-none font-medium focus:ring-2 focus:ring-[#5294A9]/50"
              placeholder="Tulis pesan anda di sini..."
              value={form.message}
              onChange={(e) => setForm({...form, message: e.target.value})}
            />
          </div>
          <div className="flex justify-center pt-2">
            <ActionButton 
              label={loading ? "Mengirim..." : "Kirim Sekarang"} 
              icon={loading ? BiLoaderAlt : BiSend} 
              variant="primary" 
              className={`px-10 py-3 ${loading ? "animate-pulse" : ""}`}
              disabled={loading}
            />
          </div>
        </form>
      </div>

      {/* SEKSI 2: RIWAYAT PENGIRIMAN */}
      <div className="bg-white rounded-[8px] p-6 border-t-[5px] border-[#5294A9] shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-[#5294A9] font-bold text-lg border-b pb-3">
          <BiTimeFive className="text-2xl" /> RIWAYAT TERAKHIR
        </div>

        <div className="border border-black rounded-[4px] overflow-x-auto bg-white custom-scrollbar">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white">
                {["No", "Penerima", "Pesan", "Waktu", "Status"].map((h, i) => (
                  <th key={i} className="border border-black px-3 py-3 text-center font-bold text-[0.85rem] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fetching ? <tr><td colSpan={5} className="text-center p-10 text-slate-400 font-bold">Memuat riwayat...</td></tr> : 
                logs.length > 0 ? logs.map((log, idx) => (
                <tr key={log.id} className="even:bg-gray-50 text-sm">
                  <td className="border border-black p-2.5 text-center">{idx + 1}</td>
                  <td className="border border-black p-2.5 text-center font-bold">{log.penerima}</td>
                  <td className="border border-black p-2.5 max-w-xs truncate">{log.pesan}</td>
                  <td className="border border-black p-2.5 text-center">{new Date(log.timestamp).toLocaleString("id-ID")}</td>
                  <td className="border border-black p-2.5 text-center uppercase font-bold">
                    {log.status === 'terkirim' ? (
                      <span className="text-green-600 flex items-center justify-center gap-1"><BiCheckCircle /> {log.status}</span>
                    ) : log.status === 'delay' ? (
                      <span className="text-amber-500 flex items-center justify-center gap-1"><BiLoaderAlt className="animate-spin" /> {log.status}</span>
                    ) : (
                      <span className="text-red-600 flex items-center justify-center gap-1"><BiXCircle /> {log.status}</span>
                    )}
                  </td>
                </tr>
              )) : <tr><td colSpan={5} className="border border-black p-10 text-center text-slate-400">Belum ada riwayat pesan.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KirimPesanPage;