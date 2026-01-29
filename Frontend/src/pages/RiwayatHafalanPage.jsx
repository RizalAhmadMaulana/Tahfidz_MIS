import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/templates/DashboardLayout";
import IconButton from "../components/atoms/IconButton";
import { BiFile, BiPencil, BiTrash, BiSearch } from "react-icons/bi";
import { FormHafalanModal, ImportExcelModal, ConfirmModal } from "../components/organisms/SetorHafalanModals";
import SuccessNotification from "../components/atoms/SuccessNotification";

const RiwayatHafalanPage = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [hafalanData, setHafalanData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHafalan, setSelectedHafalan] = useState(null);
  const [tempFormData, setTempFormData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // --- LOGIKA SHOW ENTRIES & PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const fetchHafalan = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`https://laporan.mentariku.org/api/academic/hafalan/?search=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHafalanData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Gagal ambil data hafalan:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchHafalan();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Reset ke halaman 1 jika search atau jumlah entries berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, entriesPerPage]);

  // Hitung Data yang Tampil
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = hafalanData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(hafalanData.length / entriesPerPage);

  const triggerNotification = (msg) => {
    setSuccessMsg(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleRequestConfirm = (formData) => {
    setTempFormData(formData);
    setActiveModal(activeModal === 'add' ? 'confirm-add' : 'confirm-edit');
  };

  const handleFinalAction = async () => {
    try {
      const token = localStorage.getItem("token");
      const isEdit = activeModal === 'confirm-edit';
      const url = isEdit 
        ? `https://laporan.mentariku.org/api/academic/hafalan/${tempFormData.id}/` 
        : "https://laporan.mentariku.org/api/academic/hafalan/";
      const method = isEdit ? "patch" : "post";

      await axios[method](url, tempFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setActiveModal(null);
      setTempFormData(null);
      // Refresh tabel agar status WA "Terkirim" muncul
      fetchHafalan(); 
      triggerNotification(tempFormData.trigger_wa ? "Data diupdate & WA dikirim!" : "Data berhasil diperbarui!");
    } catch (err) {
      alert("Gagal memproses data hafalan.");
    }
  };

  const handleOpenDelete = (hafalan) => {
    setSelectedHafalan(hafalan);
    setActiveModal('confirm-delete');
  };

  const handleFinalDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://laporan.mentariku.org/api/academic/hafalan/${selectedHafalan.id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveModal(null);
      fetchHafalan();
      triggerNotification("Data berhasil dihapus!");
    } catch (err) {
      alert("Gagal menghapus data");
    }
  };

  const handleImportSuccess = () => {
    setActiveModal(null);
    fetchHafalan();
    // MUNCULKAN NOTIF IMPORT
    triggerNotification("Import Excel Berhasil!");
  };

  const headers = [
    "#", "Nama Siswa", "Kelas", "Tanggal", "Guru", 
    "Surah", "Juz", "Ayat", "Jenis", "Nilai", 
    "Catatan", "Adab & Karakter", "Status WA", "Aksi"
  ];

  const renderTableBody = () => {
    return currentItems.map((row, idx) => (
      <tr key={row.id} className="even:bg-[#f2f2f2] hover:bg-slate-100 transition-colors">
        <td className="border border-black px-3 py-2.5 text-center font-medium text-slate-700">{indexOfFirstItem + idx + 1}</td>
        <td className="border border-black px-3 py-2.5 text-center font-bold">{row.nama_siswa}</td>
        <td className="border border-black px-3 py-2.5 text-center">{row.nama_kelas || "-"}</td>
        <td className="border border-black px-3 py-2.5 text-center">{row.tanggal}</td>
        <td className="border border-black px-3 py-2.5 text-center">{row.nama_guru || "-"}</td>
        <td className="border border-black px-3 py-2.5 text-center">{row.surah}</td>
        <td className="border border-black px-3 py-2.5 text-center">{row.juz}</td>
        <td className="border border-black px-3 py-2.5 text-center">{row.ayat}</td>
        <td className="border border-black px-3 py-2.5 text-center">
            <span className={`px-2 py-1 rounded text-xs font-bold ${row.jenis_setoran === 'Ziyadah(Hafalan Baru)' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                {row.jenis_setoran}
            </span>
        </td>
        <td className="border border-black px-3 py-2.5 text-center font-bold text-lg">{row.nilai}</td>
        {/* Kolom Catatan */}
        <td className="border border-black px-3 py-2.5 text-center truncate max-w-[150px] italic text-slate-600">{row.catatan || "-"}</td>
        {/* KOLOM ADAB & KARAKTER */}
        <td className="border border-black px-3 py-2.5 text-left min-w-[350px]">
            <ul className="flex flex-col gap-1">
                {/* Render hanya jika datanya ada & bukan strip "-" */}
                {row.adab_1 && row.adab_1 !== "-" && (
                    <li className="text-[0.7rem] leading-snug text-slate-700">
                        <span className="font-bold text-black block">Integritas:</span> 
                        {row.adab_1}
                    </li>
                )}
                {row.adab_2 && row.adab_2 !== "-" && (
                    <li className="text-[0.7rem] leading-snug text-slate-700 mt-1">
                        <span className="font-bold text-black block">Respect:</span> 
                        {row.adab_2}
                    </li>
                )}
                {row.adab_3 && row.adab_3 !== "-" && (
                    <li className="text-[0.7rem] leading-snug text-slate-700 mt-1">
                        <span className="font-bold text-black block">Disiplin:</span> 
                        {row.adab_3}
                    </li>
                )}
                {row.adab_4 && row.adab_4 !== "-" && (
                    <li className="text-[0.7rem] leading-snug text-slate-700 mt-1">
                        <span className="font-bold text-black block">Empati:</span> 
                        {row.adab_4}
                    </li>
                )}
            </ul>
        </td>
        {/* Kolom Status WA Pill */}
        <td className="border border-black px-3 py-2.5 text-center">
            {row.wa_status === 'sent' ? (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[0.65rem] font-bold uppercase tracking-tighter border border-green-200">
                   ✓ Terkirim
                </span>
            ) : row.wa_status === 'failed' ? (
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[0.65rem] font-bold uppercase tracking-tighter border border-red-200">
                   ✗ Gagal
                </span>
            ) : (
                <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded text-[0.65rem] font-bold uppercase tracking-tighter border border-slate-300">
                   Belum Dikirim
                </span>
            )}
        </td>
        <td className="border border-black px-3 py-2.5 text-center">
          <div className="flex gap-2 justify-center items-center">
            <IconButton icon={BiPencil} colorClass="bg-[#2ECC71]" onClick={() => { setSelectedHafalan(row); setActiveModal('edit'); }} />
            <IconButton icon={BiTrash} colorClass="bg-[#E74C3C]" onClick={() => handleOpenDelete(row)} />
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <DashboardLayout title="Setor Hafalan">
      {showSuccess && <SuccessNotification message={successMsg} />}
      {(activeModal === 'edit') && (
        <FormHafalanModal mode={activeModal} onClose={() => setActiveModal(null)} onSave={handleRequestConfirm} dataHafalan={selectedHafalan} />
      )}
      
      {activeModal === 'import' && (
        <ImportExcelModal onClose={() => setActiveModal(null)} onSuccess={(handleImportSuccess) => { setActiveModal(null); fetchHafalan(); }} />
      )}
      
      {(activeModal === 'confirm-edit') && (
        <ConfirmModal type={activeModal === 'confirm-add' ? 'add' : 'edit'} dataHafalan={tempFormData} onClose={() => setActiveModal(activeModal === 'confirm-add' ? 'add' : 'edit')} onConfirm={handleFinalAction} />
      )}

      {activeModal === 'confirm-delete' && (
        <ConfirmModal type="delete" dataHafalan={selectedHafalan} onClose={() => setActiveModal(null)} onConfirm={handleFinalDelete} />
      )}

      <div className="flex flex-row gap-3 mb-6">
        <button onClick={() => setActiveModal('import')} className="bg-[#8CB14E] text-white rounded-[4px] px-3 py-2.5 font-[600] flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm w-1/2 sm:w-auto text-[0.85rem] sm:text-base whitespace-nowrap">
          <BiFile className="text-xl shrink-0" /> Import Excel
        </button>
      </div>

      <div className="bg-white rounded-[8px] p-4 md:p-5 border-t-[5px] border-[#2ECC71] shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div className="flex flex-row justify-between items-center gap-2 mb-5 text-sm font-[600] text-slate-700">
          <div className="flex items-center shrink-0">
            <span>Show</span>
            <select 
                value={entriesPerPage} 
                onChange={(e) => setEntriesPerPage(Number(e.target.value))} 
                className="mx-1.5 bg-[#f8fafc] border border-gray-300 rounded px-1 py-1 outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="hidden sm:inline">entries</span>
          </div>
          <div className="flex items-center justify-end w-[60%] sm:w-auto">
            <span className="mr-2 hidden sm:inline">Search:</span>
            <input 
                type="text" 
                placeholder="Cari Santri / Surah..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-[200px] bg-white border border-gray-300 rounded px-3 py-1.5 outline-none font-normal text-sm focus:border-[#2ECC71] transition-all" 
            />
          </div>
        </div>

        <div className="border border-black rounded-[4px] overflow-x-auto bg-white mb-4 custom-scrollbar">
          <table className="w-full border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-white">
                {headers.map((h, i) => (
                  <th key={i} className="border border-black px-3 py-3 text-center font-[700] text-black text-[0.9rem] bg-white whitespace-nowrap uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={13} className="text-center p-10 font-bold text-slate-400 italic">Memuat data hafalan...</td></tr>
              ) : renderTableBody()}
            </tbody>
          </table>
        </div>

        <div className="flex flex-row justify-between items-center text-[0.8rem] sm:text-[0.85rem] font-[600] mt-2">
          <div className="text-slate-600">
            Showing {hafalanData.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, hafalanData.length)} of {hafalanData.length} entries
          </div>
          <div className="flex border border-gray-300 rounded-[4px] overflow-hidden shadow-sm scale-90 sm:scale-100 origin-right">
            <button 
                disabled={currentPage === 1} 
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="px-2 sm:px-3 py-1 bg-white border-r border-gray-300 hover:bg-slate-50 disabled:opacity-50 transition-colors text-slate-600 font-bold"
            >
              Prev
            </button>
            <button className="px-3 sm:px-4 py-1 bg-[#007BFF] text-white border-r border-gray-300 font-bold">
              {currentPage}
            </button>
            <button 
                disabled={currentPage === totalPages || totalPages === 0} 
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="px-2 sm:px-3 py-1 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors text-slate-600 font-bold"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default RiwayatHafalanPage;