import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../../components/templates/DashboardLayout";
import { 
  BiTimeFive, 
  BiCheckCircle, 
  BiXCircle, 
  BiLoaderAlt, 
  BiRefresh, 
  BiTrash
} from "react-icons/bi";

const RiwayatPesanPage = () => {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const [logs, setLogs] = useState([]);
  const [fetching, setFetching] = useState(true);
  
  // --- STATE SEARCH & PAGINATION ---
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);

  const fetchLogs = async () => {
    setFetching(true);
    try {
      // Menggunakan query params 'search' untuk filter backend
      const res = await axios.get(`http://127.0.0.1:8000/api/wa/logs/?search=${searchTerm}`, { headers });
      setLogs(res.data);
    } catch (err) { 
      console.error("Gagal load log WA", err); 
    } finally { 
      setFetching(false); 
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLogs();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Reset ke halaman 1 jika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, entriesPerPage]);

  // Logika Pagination Internal
  const indexOfLastItem = currentPage * entriesPerPage;
  const indexOfFirstItem = indexOfLastItem - entriesPerPage;
  const currentItems = logs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(logs.length / entriesPerPage);

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus riwayat pesan ini?")) {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/wa/logs/${id}/`, { headers });
        setLogs(logs.filter(log => log.id !== id));
      } catch (err) { 
        alert("Gagal menghapus riwayat."); 
      }
    }
  };

  return (
    <DashboardLayout title="Riwayat Pesan">
      <div className="bg-white rounded-[8px] p-4 md:p-6 border-t-[5px] border-[#17CA4D] shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
        
        {/* BARIS 1: JUDUL & TOMBOL REFRESH */}
        <div className="flex items-center justify-between mb-6 border-b pb-3">
          <div className="flex items-center gap-2 text-[#0f6d2b] font-bold text-lg uppercase tracking-tight">
            <BiTimeFive className="text-2xl" /> STATUS PENGIRIMAN TERBARU
          </div>
          <button 
            onClick={fetchLogs} 
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-all active:scale-95"
            title="Refresh Data"
          >
            <BiRefresh className={`text-2xl ${fetching ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* BARIS 2: SHOW ENTRIES & SEARCH BAR (Style Identik Management User) */}
        <div className="flex flex-row justify-between items-center gap-2 mb-5 text-sm font-[600] text-slate-700">
          <div className="flex items-center shrink-0">
            <span>Show</span>
            <select 
              value={entriesPerPage} 
              onChange={(e) => setEntriesPerPage(Number(e.target.value))} 
              className="mx-1.5 bg-[#f8fafc] border border-gray-300 rounded px-1 py-1 outline-none focus:border-[#5294A9] cursor-pointer"
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
              placeholder="Cari Nama / Nomor / Pesan..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-[250px] bg-white border border-gray-300 rounded px-3 py-1.5 outline-none font-normal focus:border-[#5294A9] text-sm shadow-sm transition-all" 
            />
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="border border-black rounded-[4px] overflow-x-auto bg-white mb-4 custom-scrollbar">
          <table className="w-full border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-white">
                {["No", "Nama Siswa", "Penerima", "Pesan", "Waktu Kirim", "Status", "Aksi"].map((h, i) => (
                  <th key={i} className="border border-black px-3 py-3 text-center font-[700] text-black text-[0.9rem] bg-white whitespace-nowrap uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fetching && logs.length === 0 ? (
                <tr><td colSpan={7} className="text-center p-10 font-bold text-slate-400 italic">Memuat data riwayat...</td></tr>
              ) : currentItems.length > 0 ? currentItems.map((log, idx) => (
                <tr key={log.id} className="even:bg-[#f2f2f2] hover:bg-slate-100 transition-colors">
                  <td className="border border-black px-3 py-2.5 text-center font-medium text-slate-700">{indexOfFirstItem + idx + 1}</td>
                  <td className="border border-black px-3 py-2.5 text-center font-bold text-slate-800">{log.nama_siswa || "-"}</td>
                  <td className="border border-black px-3 py-2.5 text-center font-mono text-sm">{log.penerima}</td>
                  <td className="border border-black px-3 py-2.5 max-w-xs truncate italic text-slate-600 text-[0.85rem]" title={log.pesan}>"{log.pesan}"</td>
                  <td className="border border-black px-3 py-2.5 text-center text-[0.8rem] font-medium">
                    {new Date(log.timestamp).toLocaleString("id-ID", { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="border border-black px-3 py-2.5 text-center">
                    <div className="flex justify-center">
                        {log.status === 'terkirim' ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[0.7rem] font-black uppercase flex items-center gap-1"><BiCheckCircle /> {log.status}</span>
                        ) : (
                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[0.7rem] font-black uppercase flex items-center gap-1"><BiXCircle /> {log.status}</span>
                        )}
                    </div>
                  </td>
                  <td className="border border-black px-3 py-2.5 text-center">
                    <button 
                      onClick={() => handleDelete(log.id)} 
                      className="bg-[#E74C3C] text-white p-1.5 rounded-[4px] hover:bg-red-700 transition-all active:scale-90 shadow-sm"
                    >
                      <BiTrash className="text-lg" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={7} className="border border-black p-10 text-center text-slate-400 font-bold">Data tidak ditemukan.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER PAGINATION */}
        <div className="flex flex-row justify-between items-center text-[0.8rem] sm:text-[0.85rem] font-[600] mt-2">
          <div className="text-slate-600 italic">
            Showing {logs.length === 0 ? 0 : indexOfFirstItem + 1} to {Math.min(indexOfLastItem, logs.length)} of {logs.length} entries
          </div>
          <div className="flex border border-gray-300 rounded shadow-sm scale-90 sm:scale-100 origin-right overflow-hidden">
            <button 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(prev => prev - 1)} 
              className="px-3 py-1 bg-white border-r border-gray-300 hover:bg-slate-50 disabled:opacity-50 text-slate-600 font-bold"
            >
              Prev
            </button>
            <button className="px-4 py-1 bg-[#007BFF] text-white border-r border-gray-300 font-bold">
              {currentPage}
            </button>
            <button 
              disabled={currentPage === totalPages || totalPages === 0} 
              onClick={() => setCurrentPage(prev => prev + 1)} 
              className="px-3 py-1 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-600 font-bold"
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default RiwayatPesanPage;