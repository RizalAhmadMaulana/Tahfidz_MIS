import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/templates/DashboardLayout";
import DashboardInput from "../components/atoms/DashboardInput";
import ActionButton from "../components/atoms/ActionButton";
import { 
  BiDownload, 
  BiSearch, 
  BiBookContent, 
  BiTimeFive,
  BiCheckCircle,
  BiTargetLock
} from "react-icons/bi";

const LaporanPage = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const isWali = storedUser.role === 'WALI_MURID';

  const [kelasList, setKelasList] = useState([]);
  const [siswaListRekap, setSiswaListRekap] = useState([]);
  const [siswaListRiwayat, setSiswaListRiwayat] = useState([]);

  const [rekapFilter, setRekapFilter] = useState({
    dari_tgl: new Date().toISOString().split('T')[0],
    sampai_tgl: new Date().toISOString().split('T')[0],
    kelas: isWali ? (storedUser.kelas || "Semua") : "Semua",
    siswa: isWali ? (storedUser.id || "Semua") : "Semua"
  });

  const [riwayatFilter, setRiwayatFilter] = useState({
    kelas: isWali ? (storedUser.kelas || "Semua") : "Semua",
    siswa: isWali ? (storedUser.id || "Semua") : "Semua"
  });

  const [rekapData, setRekapData] = useState({ summary: null, details: [] });
  const [riwayatData, setRiwayatData] = useState([]);
  const [loadingRekap, setLoadingRekap] = useState(false);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);

  useEffect(() => {
    if (!isWali) {
      const fetchKelas = async () => {
        try {
          const res = await axios.get("http://127.0.0.1:8000/api/academic/kelas/", { headers });
          setKelasList(res.data);
        } catch (err) { console.error("Gagal load kelas", err); }
      };
      fetchKelas();
    }
    handleSearchRekap();
    handleSearchRiwayat("semua");
  }, []);

  const handleKelasChangeRekap = async (e) => {
    const kelas = e.target.value;
    setRekapFilter({ ...rekapFilter, kelas, siswa: "Semua" });
    if (kelas !== "Semua") {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/siswa/?kelas=${kelas}`, { headers });
        setSiswaListRekap(res.data);
      } catch (err) { console.error(err); }
    } else { setSiswaListRekap([]); }
  };

  const handleKelasChangeRiwayat = async (e) => {
    const kelas = e.target.value;
    setRiwayatFilter({ ...riwayatFilter, kelas, siswa: "Semua" });
    if (kelas !== "Semua") {
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/siswa/?kelas=${kelas}`, { headers });
        setSiswaListRiwayat(res.data);
      } catch (err) { console.error(err); }
    } else { setSiswaListRiwayat([]); }
  };

  const handleSearchRekap = async () => {
    setLoadingRekap(true);
    try {
      const { dari_tgl, sampai_tgl, kelas, siswa } = rekapFilter;
      const res = await axios.get(`http://127.0.0.1:8000/api/academic/laporan/rekap_data/?dari_tgl=${dari_tgl}&sampai_tgl=${sampai_tgl}&kelas=${kelas}&siswa=${siswa}`, { headers });
      setRekapData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingRekap(false); }
  };

  const handleDownloadPDF = async () => {
    try {
      const { dari_tgl, sampai_tgl, kelas, siswa } = rekapFilter;
      const response = await axios({
        url: `http://127.0.0.1:8000/api/academic/laporan/download_pdf/?dari_tgl=${dari_tgl}&sampai_tgl=${sampai_tgl}&kelas=${kelas}&siswa=${siswa}`,
        method: 'GET', responseType: 'blob', headers
      });
      if (response.status === 200) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `Laporan_Mutabaah_${dari_tgl}.pdf`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => { link.remove(); window.URL.revokeObjectURL(downloadUrl); }, 100);
      }
    } catch (err) { alert("Gagal mengunduh PDF."); }
  };

  const handleSearchRiwayat = async (filterWaktu = "semua") => {
    setLoadingRiwayat(true);
    try {
      const { kelas, siswa } = riwayatFilter;
      const res = await axios.get(`http://127.0.0.1:8000/api/academic/laporan/riwayat/?kelas=${kelas}&siswa=${siswa}&filter_waktu=${filterWaktu}`, { headers });
      setRiwayatData(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingRiwayat(false); }
  };

  return (
    <DashboardLayout title="Laporan Progress">
      
      {/* SEKSI 1: REKAP LAPORAN */}
      <div className="bg-white rounded-[8px] p-4 sm:p-6 border-t-[5px] border-[#1B4332] shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-6 text-[#1B4332] font-bold text-lg border-b pb-3">
          <BiBookContent className="text-2xl" /> REKAP LAPORAN
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <DashboardInput label="Dari Tanggal" type="date" value={rekapFilter.dari_tgl} onChange={(e) => setRekapFilter({...rekapFilter, dari_tgl: e.target.value})} />
          <DashboardInput label="Sampai Tanggal" type="date" value={rekapFilter.sampai_tgl} onChange={(e) => setRekapFilter({...rekapFilter, sampai_tgl: e.target.value})} />
          
          <DashboardInput 
            label="Kelas" type="select" 
            options={isWali ? [rekapFilter.kelas] : ["Semua", ...kelasList.map(k => k.nama_kelas)]} 
            value={rekapFilter.kelas} 
            disabled={isWali}
            onChange={handleKelasChangeRekap} 
          />
          <DashboardInput 
            label="Nama Siswa" type="select" 
            options={isWali ? [{label: storedUser.name, value: storedUser.id}] : ["Semua", ...siswaListRekap.map(s => ({label: `${s.first_name} ${s.last_name}`, value: s.id}))]} 
            value={rekapFilter.siswa} 
            disabled={isWali}
            onChange={(e) => setRekapFilter({...rekapFilter, siswa: e.target.value})} 
          />
        </div>

        <div className="flex flex-row gap-2 sm:gap-3 justify-center mb-8">
          <ActionButton 
            label="Search Data" icon={BiSearch} variant="primary" 
            className="flex-1 sm:flex-none sm:w-auto px-2 sm:px-10 py-2.5 text-[0.75rem] sm:text-base whitespace-nowrap" 
            onClick={handleSearchRekap} 
          />
          <ActionButton 
            label="Download PDF" icon={BiDownload} variant="primary" 
            className="flex-1 sm:flex-none sm:w-auto px-2 sm:px-10 py-2.5 text-[0.75rem] sm:text-base whitespace-nowrap" 
            onClick={handleDownloadPDF} 
          />
        </div>

        {/* --- KETERANGAN RINGKASAN (BARU) --- */}
        {rekapData.summary && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#f0fdf4] p-4 rounded-xl border border-green-200 flex items-center gap-4 shadow-sm">
               <div className="bg-green-500 p-3 rounded-lg text-white text-2xl"><BiCheckCircle /></div>
               <div>
                 <div className="text-slate-500 text-[0.7rem] sm:text-xs font-bold uppercase tracking-wider">Total Hafalan</div>
                 <div className="text-lg sm:text-2xl font-bold text-slate-800">{rekapData.summary.total_hafalan}</div>
               </div>
            </div>
            <div className="bg-[#f0f9ff] p-4 rounded-xl border border-blue-200 flex items-center gap-4 shadow-sm">
               <div className="bg-blue-500 p-3 rounded-lg text-white text-2xl"><BiTargetLock /></div>
               <div>
                 <div className="text-slate-500 text-[0.7rem] sm:text-xs font-bold uppercase tracking-wider">Target Kelas</div>
                 <div className="text-lg sm:text-2xl font-bold text-slate-800">{rekapData.summary.target_hafalan}</div>
               </div>
            </div>
            <div className={`p-4 rounded-xl border flex items-center gap-4 shadow-sm ${rekapData.summary.status === 'Terpenuhi' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
               <div className={`p-3 rounded-lg text-white text-2xl ${rekapData.summary.status === 'Terpenuhi' ? 'bg-emerald-600' : 'bg-rose-500'}`}><BiBookContent /></div>
               <div>
                 <div className={`text-[0.7rem] sm:text-xs font-bold uppercase tracking-wider ${rekapData.summary.status === 'Terpenuhi' ? 'text-emerald-700' : 'text-rose-700'}`}>Status Capaian</div>
                 <div className={`text-base sm:text-xl font-bold ${rekapData.summary.status === 'Terpenuhi' ? 'text-emerald-800' : 'text-rose-800'}`}>{rekapData.summary.status}</div>
               </div>
            </div>
          </div>
        )}

        <div className="border border-black rounded-[4px] overflow-x-auto bg-white custom-scrollbar">
          <table className="w-full border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-white">
                {["No", "Tanggal", "Nama Siswa", "Surah", "Juz", "Ayat", "Jenis", "Nilai", "Catatan", "Adab & Karakter"].map((h, i) => (
                  <th key={i} className="border border-black px-3 py-3 text-center font-[700] text-black text-[0.85rem] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingRekap ? <tr><td colSpan={9} className="text-center p-10 font-bold text-slate-400">Loading...</td></tr> : 
                rekapData.details.length > 0 ? rekapData.details.map((item, idx) => (
                <tr key={idx} className="even:bg-gray-50 text-sm">
                  <td className="border border-black p-2.5 text-center">{idx + 1}</td>
                  <td className="border border-black p-2.5 text-center">{item.tanggal}</td>
                  <td className="border border-black p-2.5 font-medium">{item.nama_siswa}</td>
                  <td className="border border-black p-2.5">{item.surah}</td>
                  <td className="border border-black p-2.5 text-center">{item.juz}</td>
                  <td className="border border-black p-2.5 text-center">{item.ayat}</td>
                  <td className="border border-black p-2.5 text-center">{item.jenis_setoran}</td>
                  <td className="border border-black p-2.5 text-center font-bold">{item.nilai}</td>
                  <td className="border border-black p-2.5 italic text-slate-600">{item.catatan || "-"}</td>
                  <td className="border border-black px-3 py-2.5 text-center">
                    <div className="flex flex-col items-center">
                        <span className="font-black text-[0.85rem] text-[#1B4332]">{item.skor_adab || 0}</span>
                        <span className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-tight">{item.predikat_adab || "-"}</span>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={9} className="border border-black p-10 text-center text-slate-400">Data tidak ditemukan.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEKSI 2: RIWAYAT TERBARU */}
      <div className="bg-white rounded-[8px] p-4 sm:p-6 border-t-[5px] border-[#1B4332] shadow-sm">
        <div className="flex items-center gap-2 mb-6 text-[#1B4332] font-bold text-lg border-b pb-3">
          <BiTimeFive className="text-2xl" /> RIWAYAT TERBARU
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:flex-[1]">
             <DashboardInput 
               label="Kelas" type="select" options={isWali ? [riwayatFilter.kelas] : ["Semua", ...kelasList.map(k => k.nama_kelas)]} 
               value={riwayatFilter.kelas} disabled={isWali} onChange={handleKelasChangeRiwayat} 
             />
          </div>
          <div className="w-full md:flex-[2] flex gap-2 items-end">
            <div className="flex-grow">
               <DashboardInput 
                 label="Nama Siswa" type="select" options={isWali ? [{label: storedUser.name, value: storedUser.id}] : ["Semua", ...siswaListRiwayat.map(s => ({label: `${s.first_name} ${s.last_name}`, value: s.id}))]} 
                 value={riwayatFilter.siswa} disabled={isWali} onChange={(e) => setRiwayatFilter({...riwayatFilter, siswa: e.target.value})} 
               />
            </div>
            <div className="mb-[1px]"> 
               <ActionButton icon={BiSearch} variant="primary" className="w-[45px] h-[45px]" onClick={() => handleSearchRiwayat("semua")} />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button 
            onClick={() => handleSearchRiwayat("hari_ini")} 
            className="px-4 sm:px-6 py-2 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs sm:text-sm hover:bg-emerald-200 transition-all border border-emerald-200 shadow-sm"
          >
            Hari Ini
          </button>
          <button 
            onClick={() => handleSearchRiwayat("kemarin")} 
            className="px-4 sm:px-6 py-2 rounded-full bg-amber-100 text-amber-700 font-bold text-xs sm:text-sm hover:bg-amber-200 transition-all border border-amber-200 shadow-sm"
          >
            Kemarin
          </button>
          <button 
            onClick={() => handleSearchRiwayat("semua")} 
            className="px-4 sm:px-6 py-2 rounded-full bg-blue-100 text-blue-700 font-bold text-xs sm:text-sm hover:bg-blue-200 transition-all border border-blue-200 shadow-sm"
          >
            Semua
          </button>
        </div>

        <div className="border border-black rounded-[4px] overflow-x-auto bg-white custom-scrollbar">
          <table className="w-full border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-white">
                {["No", "Tanggal", "Nama Siswa", "Surah", "Jenis", "Nilai", "Catatan", "Adab & Karakter"].map((h, i) => (
                  <th key={i} className="border border-black px-3 py-3 text-center font-[700] text-black text-[0.85rem] uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingRiwayat ? <tr><td colSpan={7} className="text-center p-10 font-bold text-slate-400">Loading...</td></tr> : 
                riwayatData.length > 0 ? riwayatData.map((item, idx) => (
                <tr key={idx} className="even:bg-gray-50 text-sm">
                  <td className="border border-black p-2.5 text-center">{idx + 1}</td>
                  <td className="border border-black p-2.5 text-center">{item.tanggal}</td>
                  <td className="border border-black p-2.5 font-medium">{item.nama_siswa}</td>
                  <td className="border border-black p-2.5">{item.surah}</td>
                  <td className="border border-black p-2.5 text-center">{item.jenis_setoran}</td>
                  <td className="border border-black p-2.5 text-center font-bold text-green-700">{item.nilai}</td>
                  <td className="border border-black p-2.5 italic text-slate-600">{item.catatan || "-"}</td>
                  <td className="border border-black px-3 py-2.5 text-center">
                    <div className="flex flex-col items-center">
                        <span className="font-black text-[0.85rem] text-[#1B4332]">{item.skor_adab || 0}</span>
                        <span className="text-[0.65rem] font-bold text-slate-500 uppercase tracking-tight">{item.predikat_adab || "-"}</span>
                    </div>
                  </td>
                </tr>
              )) : <tr><td colSpan={7} className="border border-black p-10 text-center text-slate-400">Data kosong.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default LaporanPage;