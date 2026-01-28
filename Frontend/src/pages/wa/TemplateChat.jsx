import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../../components/templates/DashboardLayout";
import { BiSave, BiInfoCircle, BiLoaderAlt, BiCheckDouble, BiShow } from "react-icons/bi";

const TemplateChat = () => {
  const [template, setTemplate] = useState({ id: "", nama: "setor_hafalan", pesan: "" });
  const [loading, setLoading] = useState(true);
  const [isExist, setIsExist] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/wa/templates/setor_hafalan/");
        setTemplate(res.data);
        setLastSaved(new Date().toLocaleTimeString());
        setIsExist(true);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setIsExist(false);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, []);

  const handleSave = async () => {
    try {
      if (isExist) {
        await axios.patch(`http://127.0.0.1:8000/api/wa/templates/setor_hafalan/`, {
          pesan: template.pesan
        });
      } else {
        const res = await axios.post(`http://127.0.0.1:8000/api/wa/templates/`, {
          nama: "setor_hafalan",
          pesan: template.pesan
        });
        setIsExist(true);
        setTemplate(res.data);
      }
      setLastSaved(new Date().toLocaleTimeString());
      alert("✓ Template Berhasil Disimpan!");
    } catch (err) {
      alert("Gagal menyimpan! Pastikan server Backend aktif.");
    }
  };

  // UPDATE: Logic Simulasi Tag Baru
  const renderPreview = (text) => {
    if (!text) return "Isi template untuk melihat pratinjau...";
    return text
      .replace(/\[nama_siswa\]/g, "Ahmad Rizal")
      .replace(/\[kelas\]/g, "10-A")
      .replace(/\[tanggal\]/g, new Date().toLocaleDateString('id-ID'))
      .replace(/\[guru\]/g, "Ustadz Mansur")
      .replace(/\[surah\]/g, "Al-Mulk")
      .replace(/\[juz\]/g, "29")
      .replace(/\[ayat\]/g, "1-10")
      .replace(/\[jenis\]/g, "Ziyadah(Hafalan Baru)")
      .replace(/\[nilai\]/g, "A (Mumtaz)")
      .replace(/\[catatan\]/g, "Makhraj sudah bagus, pertahankan.")
      // DATA DUMMY UNTUK ADAB
      .replace(/\[skor_adab\]/g, "80")
      .replace(/\[predikat_adab\]/g, "BAIK (B)")
      .replace(/\[ket_adab\]/g, "Membudaya. Sering menunjukkan perilaku positif. Kadang masih melakukan kesalahan kecil.");
  };

  // DAFTAR TAG UNTUK TOMBOL
  const availableTags = [
    "nama_siswa", "kelas", "tanggal", "guru", 
    "surah", "juz", "ayat", "jenis", "nilai", "catatan",
    "skor_adab", "predikat_adab", "ket_adab" // TAG BARU
  ];

  if (loading) {
    return (
      <DashboardLayout title="Template Chat">
        <div className="flex flex-col items-center justify-center h-64 text-emerald-600">
           <BiLoaderAlt className="text-4xl animate-spin" />
           <p className="text-sm font-bold mt-2">Memuat Template...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Template Chat">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        
        {/* PANEL KIRI: EDITOR TEMPLATE */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-[#1B4332]">
              <BiInfoCircle className="text-xl" />
              <h2 className="font-bold uppercase tracking-tight text-sm">Template Setor Hafalan</h2>
            </div>
            {lastSaved && (
              <span className="text-[0.65rem] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                Tersimpan: {lastSaved}
              </span>
            )}
          </div>
          
          <div className="bg-emerald-50 p-4 text-[0.65rem] text-emerald-800 mb-5 rounded-xl border border-emerald-100 leading-relaxed">
            <p className="font-bold mb-2 uppercase tracking-wider text-[#1B4332]">Tag yang Tersedia (Klik untuk Salin):</p>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <button 
                  key={tag} 
                  onClick={() => navigator.clipboard.writeText(`[${tag}]`)}
                  className="bg-white px-2 py-1 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors font-bold font-mono text-[0.6rem]"
                >
                  [{tag}]
                </button>
              ))}
            </div>
          </div>

          <textarea 
            className="w-full h-80 border border-slate-300 p-5 rounded-xl outline-none focus:ring-2 focus:ring-[#1B4332] font-medium text-slate-700 leading-relaxed text-sm bg-slate-50 transition-all shadow-inner"
            placeholder="Tulis template pesan di sini..."
            value={template.pesan}
            onChange={(e) => setTemplate({...template, pesan: e.target.value})}
          />
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleSave} 
              className="bg-[#1B4332] hover:bg-[#2D6A4F] text-white px-10 py-3 rounded-xl flex items-center gap-2 transition-all shadow-md active:scale-95 font-bold"
            >
              <BiSave className="text-xl" /> Simpan Perubahan
            </button>
          </div>
        </div>

        {/* PANEL KANAN: PRATINJAU WHATSAPP */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#E5DDD5] rounded-2xl shadow-lg overflow-hidden border-4 border-white h-[580px] relative flex flex-col">
            <div className="bg-[#075E54] p-4 flex items-center gap-3 shrink-0">
               <div className="w-10 h-10 bg-slate-300 rounded-full flex-shrink-0" />
               <div className="flex-1">
                  <h4 className="text-white font-bold text-sm">Admin MIS</h4>
                  <p className="text-white/70 text-[0.65rem]">Online</p>
               </div>
               <BiShow className="text-white text-xl" />
            </div>

            <div className="flex-1 p-4 overflow-y-auto pattern-wa flex flex-col justify-end">
              <div className="bg-white self-start max-w-[90%] p-3 rounded-tr-xl rounded-b-xl shadow-sm relative text-sm text-slate-800 leading-relaxed whitespace-pre-wrap animate-[fadeIn_0.3s]">
                {renderPreview(template.pesan)}
                <div className="text-[0.6rem] text-slate-400 text-right mt-1">
                  {new Date().getHours().toString().padStart(2, '0')}:{new Date().getMinutes().toString().padStart(2, '0')} <BiCheckDouble className="inline text-blue-500 text-sm" />
                </div>
              </div>
              <div className="text-center my-4">
                <span className="bg-white/50 px-3 py-1 rounded-lg text-[0.6rem] font-bold text-slate-500 uppercase tracking-tighter shadow-sm border border-slate-200/50">
                  Pratinjau Pesan Terakhir
                </span>
              </div>
            </div>

            <div className="bg-[#F0F2F5] p-3 border-t border-slate-200">
               <div className="bg-white rounded-full px-4 py-2 text-slate-400 text-xs border border-slate-100 shadow-sm">
                  Ketik pesan...
               </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
             <div className="flex gap-3">
                <BiInfoCircle className="text-blue-500 text-xl shrink-0" />
                <p className="text-[0.7rem] text-blue-800 leading-relaxed">
                   <b>Tips:</b> Gunakan tag baru <b>[skor_adab]</b>, <b>[predikat_adab]</b>, dan <b>[ket_adab]</b> untuk menampilkan hasil penilaian karakter pada laporan.
                </p>
             </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default TemplateChat;