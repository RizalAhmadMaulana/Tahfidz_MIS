import { useState, useEffect } from "react"; 
import axios from "axios"; 
import DashboardLayout from "../components/templates/DashboardLayout";
import { 
  BiPlus, 
  BiFile, 
  BiPencil, 
  BiTrash
} from "react-icons/bi";
import { FormGuruModal, ImportExcelModal, ConfirmModal } from "../components/organisms/DataGuruModals";
import SuccessNotification from "../components/atoms/SuccessNotification";

const DataGuruPage = () => {
  const [activeModal, setActiveModal] = useState(null);
  
  // LOGIKA: State Data & Kontrol
  const [gurus, setGurus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // State Search
  const [selectedGuru, setSelectedGuru] = useState(null);
  const [tempFormData, setTempFormData] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // LOGIKA: State Pagination & Show Entries
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  // LOGIKA: Fungsi ambil data guru (Dengan Search Params)
  const fetchGurus = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://127.0.0.1:8000/api/guru/?search=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGurus(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Gagal mengambil data guru:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchGurus();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // LOGIKA: Reset ke halaman 1 jika search atau entries berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, entriesPerPage]);

  // LOGIKA: Hitung data yang tampil di halaman saat ini
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = gurus.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(gurus.length / entriesPerPage);
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
        ? `http://127.0.0.1:8000/api/guru/${tempFormData.id}/` 
        : "http://127.0.0.1:8000/api/guru/";
      const method = isEdit ? "patch" : "post";

      await axios[method](url, tempFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setActiveModal(null);
      setTempFormData(null);
      fetchGurus(); 
      triggerNotification(isEdit ? "Data Guru berhasil diperbarui!" : "Guru baru berhasil ditambahkan!");
    } catch (err) {
      console.error(err);
      alert("Gagal memproses data guru.");
    }
  };

  const handleOpenDelete = (guru) => {
    setSelectedGuru(guru);
    setActiveModal('confirm-delete');
  };

  const handleFinalDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/api/guru/${selectedGuru.id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveModal(null);
      fetchGurus();
      triggerNotification("Data Guru berhasil dihapus!");
    } catch (err) {
      alert("Gagal menghapus data");
    }
  };

  const handleImportSuccess = () => {
    setActiveModal(null);
    fetchGurus();
    // MUNCULKAN NOTIF IMPORT
    triggerNotification("Import Excel Berhasil!");
  };

  const headers = ["#", "Nama Guru", "Jenis Kelamin", "NIP", "Kelas Ampu", "Tempat, Tanggal Lahir", "No Telp Guru", "Aksi"];

  const renderTableBody = () => {
    // Tampilkan data yang sudah di-slice berdasarkan show entries
    const displayData = [...currentItems];

    return displayData.map((row, idx) => (
      <tr key={idx} className="even:bg-[#f2f2f2] hover:bg-slate-100 transition-colors">
        {row.id ? (
          <>
            <td className="border border-black px-3 py-2.5 text-center h-[45px] whitespace-nowrap font-medium text-slate-700">{indexOfFirstItem + idx + 1}</td>
            <td className="border border-black px-3 py-2.5 text-center whitespace-nowrap">{`${row.first_name} ${row.last_name}`}</td>
            <td className="border border-black px-3 py-2.5 text-center whitespace-nowrap">{row.gender}</td>
            <td className="border border-black px-3 py-2.5 text-center whitespace-nowrap font-mono">{row.nip || "-"}</td>
            <td className="border border-black px-3 py-2.5 text-center whitespace-nowrap font-bold text-slate-700">{row.kelas_ampu}</td>
            <td className="border border-black px-3 py-2.5 text-center whitespace-nowrap">{row.birth_info || "-"}</td>
            <td className="border border-black px-3 py-2.5 text-center whitespace-nowrap">{row.phone_number || "-"}</td>
            <td className="border border-black px-3 py-2.5 text-center whitespace-nowrap">
              <div className="flex gap-2 justify-center items-center">
                <button 
                  onClick={() => { setSelectedGuru(row); setActiveModal('edit'); }}
                  className="bg-[#2ECC71] text-white py-[4px] px-[12px] rounded-[4px] text-[0.85rem] font-[600] flex items-center gap-1.5 hover:bg-[#27ae60] transition-all"
                >
                  <BiPencil className="text-[1rem]" /> Edit
                </button>
                <button 
                  onClick={() => handleOpenDelete(row)}
                  className="bg-[#E74C3C] text-white py-[4px] px-[12px] rounded-[4px] text-[0.85rem] font-[600] flex items-center gap-1.5 hover:bg-[#c0392b] transition-all"
                >
                  <BiTrash className="text-[1rem]" /> Hapus
                </button>
              </div>
            </td>
          </>
        ) : (
          headers.map((_, cIdx) => <td key={cIdx} className="border border-black px-2 py-2 h-[45px]">&nbsp;</td>)
        )}
      </tr>
    ));
  };

  return (
    <DashboardLayout title="Data Guru">
      {showSuccess && <SuccessNotification message={successMsg} />}
      {(activeModal === 'add' || activeModal === 'edit') && (
        <FormGuruModal 
          mode={activeModal} 
          userData={selectedGuru}
          onClose={() => setActiveModal(null)} 
          onSave={handleRequestConfirm} 
        />
      )}
      
      {activeModal === 'import' && (
        <ImportExcelModal 
          onClose={() => setActiveModal(null)} 
          onSuccess={() => { setActiveModal(null); fetchGurus(); }} 
        />
      )}
      
      {activeModal === 'confirm-add' && <ConfirmModal type="add" userData={tempFormData} onClose={() => setActiveModal('add')} onConfirm={handleFinalAction} />}
      {activeModal === 'confirm-edit' && <ConfirmModal type="edit" userData={tempFormData} onClose={() => setActiveModal('edit')} onConfirm={handleFinalAction} />}
      {activeModal === 'confirm-delete' && <ConfirmModal type="delete" userData={selectedGuru} onClose={() => setActiveModal(null)} onConfirm={handleFinalDelete} />}

      <div className="flex flex-row gap-3 mb-6">
        <button onClick={() => { setSelectedGuru(null); setActiveModal('add'); }} className="bg-[#5294A9] text-white rounded-[4px] px-3 py-2.5 font-[600] flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm w-1/2 sm:w-auto text-[0.85rem] sm:text-base whitespace-nowrap">
          <BiPlus className="text-xl shrink-0" /> Tambah Guru
        </button>
        <button onClick={() => setActiveModal('import')} className="bg-[#8CB14E] text-white rounded-[4px] px-3 py-2.5 font-[600] flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm w-1/2 sm:w-auto text-[0.85rem] sm:text-base whitespace-nowrap">
          <BiFile className="text-xl shrink-0" /> Import Excel
        </button>
      </div>

      <div className="bg-white rounded-[8px] p-4 md:p-5 border-t-[5px] border-[#2ECC71] shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div className="flex flex-row justify-between items-center gap-2 mb-5 text-sm font-[600] text-slate-700">
          <div className="flex items-center shrink-0">
            <span>Show</span>
            {/* LOGIKA: Menghubungkan Select ke entriesPerPage */}
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
              placeholder="Cari Nama / NIP..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-[200px] bg-white border border-gray-300 rounded px-3 py-1.5 outline-none font-normal text-sm focus:border-[#2ECC71]" 
            />
          </div>
        </div>

        <div className="border border-black rounded-[4px] overflow-x-auto bg-white mb-4 custom-scrollbar">
          <table className="w-full border-collapse min-w-max">
            <thead>
              <tr className="bg-white">
                {headers.map((h, i) => (
                  <th key={i} className="border border-black px-3 py-3 text-center font-[700] text-black text-[0.9rem] bg-white whitespace-nowrap uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={8} className="text-center p-10 font-bold text-slate-400">Memuat data guru...</td></tr> : renderTableBody()}
            </tbody>
          </table>
        </div>

        <div className="flex flex-row justify-between items-center text-[0.8rem] sm:text-[0.85rem] font-[600] mt-2">
          {/* LOGIKA: Info Entries Dinamis */}
          <div className="text-slate-600">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, gurus.length)} of {gurus.length} entries
          </div>
          <div className="flex border border-gray-300 rounded-[4px] overflow-hidden shadow-sm scale-90 sm:scale-100 origin-right">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => prev - 1)} 
              className="px-2 sm:px-3 py-1 bg-white border-r border-gray-300 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
                Prev
            </button>
            <button className="px-2 sm:px-3 py-1 bg-[#007BFF] text-white border-r border-gray-300 font-bold">{currentPage}</button>
            <button 
              disabled={currentPage === totalPages || totalPages === 0} 
              onClick={() => setCurrentPage(prev => prev + 1)} 
              className="px-2 sm:px-3 py-1 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
                Next
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DataGuruPage;