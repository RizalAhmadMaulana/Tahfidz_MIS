import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/templates/DashboardLayout";
import { 
  BiPlus, 
  BiFile, 
  BiPencil, 
  BiTrash
} from "react-icons/bi";
import { FormKelasModal, ImportExcelModal, ConfirmModal } from "../components/organisms/KelolaKelasModals";

const KelolaKelasPage = () => {
  const [activeModal, setActiveModal] = useState(null);
  
  const [kelasData, setKelasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKelas, setSelectedKelas] = useState(null);
  const [tempFormData, setTempFormData] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = kelasData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(kelasData.length / entriesPerPage);

  const fetchKelas = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://127.0.0.1:8000/api/academic/kelas/?search=${searchTerm}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKelasData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Gagal ambil data kelas:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => { fetchKelas(); }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleRequestConfirm = (formData) => {
    setTempFormData(formData);
    setActiveModal(activeModal === 'add' ? 'confirm-add' : 'confirm-edit');
  };

  const handleFinalAction = async () => {
    try {
      const token = localStorage.getItem("token");
      const isEdit = activeModal === 'confirm-edit';
      const url = isEdit 
        ? `http://127.0.0.1:8000/api/academic/kelas/${tempFormData.id}/` 
        : "http://127.0.0.1:8000/api/academic/kelas/";
      const method = isEdit ? "patch" : "post";

      await axios[method](url, tempFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setActiveModal(null);
      setTempFormData(null);
      fetchKelas();
      alert(isEdit ? "Data Kelas berhasil diubah!" : "Kelas baru berhasil ditambahkan!");
    } catch (err) {
      const errorMsg = err.response?.data ? Object.values(err.response.data).flat().join(", ") : "Gagal memproses data.";
      alert(errorMsg);
    }
  };

  const handleOpenDelete = (row) => {
    setSelectedKelas(row);
    setActiveModal('confirm-delete');
  };

  const handleFinalDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/api/academic/kelas/${selectedKelas.id}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveModal(null);
      fetchKelas();
    } catch (err) {
      alert("Gagal menghapus data kelas.");
    }
  };

  const headers = ["#", "Kelas", "Guru", "Target Hafalan", "Aksi"];
  
  // LOGIKA BARU: Render tabel dinamis sesuai jumlah data (tanpa baris kosong)
  const renderTableBody = () => {
    return currentItems.map((row, idx) => (
      <tr key={row.id} className="even:bg-[#f2f2f2] hover:bg-slate-100 transition-colors">
        <td className="border border-black px-3 py-2.5 text-center font-medium">{indexOfFirstItem + idx + 1}</td>
        <td className="border border-black px-3 py-2.5 text-center font-bold">{row.nama_kelas}</td>
        {/* Field ini otomatis menampilkan daftar nama guru yang dipisahkan koma */}
        <td className="border border-black px-3 py-2.5 text-center">{row.nama_guru || "-"}</td>
        <td className="border border-black px-3 py-2.5 text-center">{row.target_hafalan || "-"}</td>
        <td className="border border-black px-3 py-2.5 text-center">
            <div className="flex gap-2 justify-center">
                <button onClick={() => { setSelectedKelas(row); setActiveModal('edit'); }} className="bg-[#2ECC71] text-white px-3 py-1 rounded font-bold hover:bg-green-600 transition-all flex items-center gap-1"><BiPencil /> Edit</button>
                <button onClick={() => { setSelectedKelas(row); setActiveModal('confirm-delete'); }} className="bg-[#E74C3C] text-white px-3 py-1 rounded font-bold hover:bg-red-600 transition-all flex items-center gap-1"><BiTrash /> Hapus</button>
            </div>
        </td>
      </tr>
    ));
};

  return (
    <DashboardLayout title="Kelola Kelas">
      
      {(activeModal === 'add' || activeModal === 'edit') && (
        <FormKelasModal 
          mode={activeModal} 
          dataKelas={selectedKelas} 
          onClose={() => setActiveModal(null)} 
          onSave={handleRequestConfirm} 
        />
      )}
      
      {activeModal === 'import' && (
        <ImportExcelModal 
          onClose={() => setActiveModal(null)} 
          onSuccess={() => { setActiveModal(null); fetchKelas(); }}
        />
      )}
      
      {(activeModal === 'confirm-add' || activeModal === 'confirm-edit') && (
        <ConfirmModal 
          type={activeModal === 'confirm-add' ? 'add' : 'edit'} 
          dataKelas={tempFormData} 
          onClose={() => setActiveModal(activeModal === 'confirm-add' ? 'add' : 'edit')} 
          onConfirm={handleFinalAction} 
        />
      )}
      
      {activeModal === 'confirm-delete' && (
        <ConfirmModal 
          type="delete" 
          dataKelas={selectedKelas} 
          onClose={() => setActiveModal(null)} 
          onConfirm={handleFinalDelete} 
        />
      )}

      <div className="flex flex-row gap-3 mb-6">
        <button 
          onClick={() => { setSelectedKelas(null); setActiveModal('add'); }} 
          className="bg-[#5294A9] text-white rounded-[4px] px-3 py-2.5 font-[600] flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm w-1/2 sm:w-auto text-[0.85rem] sm:text-base whitespace-nowrap"
        >
          <BiPlus className="text-xl shrink-0" /> Tambah Kelas
        </button>
        <button 
          onClick={() => setActiveModal('import')} 
          className="bg-[#8CB14E] text-white rounded-[4px] px-3 py-2.5 font-[600] flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm w-1/2 sm:w-auto text-[0.85rem] sm:text-base whitespace-nowrap"
        >
          <BiFile className="text-xl shrink-0" /> Import Excel
        </button>
      </div>

      <div className="bg-white rounded-[8px] p-4 md:p-5 border-t-[5px] border-[#2ECC71] shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        <div className="flex flex-row justify-between items-center gap-2 mb-5 text-sm font-[600] text-slate-700">
          <div className="flex items-center shrink-0">
            <span>Show</span>
            <select value={entriesPerPage} onChange={(e) => setEntriesPerPage(Number(e.target.value))} className="mx-1.5 bg-[#f8fafc] border border-gray-300 rounded px-1 py-1 outline-none">
                <option value={10}>10</option>
                <option value={25}>25</option>
            </select> 
            <span>entries</span>
          </div>
          <input type="text" placeholder="Cari kelas/guru" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-[150px] sm:w-[200px] border border-gray-300 rounded px-3 py-1.5 outline-none text-sm" />
        </div>

        <div className="border border-black rounded-[4px] overflow-x-auto bg-white mb-4 custom-scrollbar">
          <table className="w-full border-collapse min-w-max">
            <thead>
              <tr className="bg-white">
                {headers.map((h, i) => (
                  <th key={i} className="border border-black px-3 py-3 text-center font-[700] text-black text-[0.9rem] bg-white whitespace-nowrap uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="text-center p-10 font-bold text-slate-400">Memuat data kelas...</td></tr> : renderTableBody()}
            </tbody>
          </table>
        </div>

        <div className="flex flex-row justify-between items-center text-[0.85rem] font-[600]">
          <div className="text-slate-600">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, kelasData.length)} of {kelasData.length} entries
          </div>
          <div className="flex border border-gray-300 rounded overflow-hidden">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="px-3 py-1 bg-white hover:bg-gray-50 disabled:opacity-50 border-r"
            >Prev</button>
            <div className="px-4 py-1 bg-[#007BFF] text-white font-bold">{currentPage}</div>
            <button 
              disabled={currentPage === totalPages || totalPages === 0} 
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="px-3 py-1 bg-white hover:bg-gray-50 disabled:opacity-50"
            >Next</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default KelolaKelasPage;