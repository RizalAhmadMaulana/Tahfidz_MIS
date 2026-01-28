import { useState, useEffect } from "react";
import axios from "axios";
import { 
  BiSave, 
  BiTrash, 
  BiCheck, 
  BiFile, 
  BiPlus, 
  BiPencil, 
  BiX 
} from "react-icons/bi";

// --- KOMPONEN INPUT ---
const ModalInput = ({ label, type = "text", value, options, readOnly, placeholder, onChange, name, ...props }) => {
  const baseClass = "w-full bg-[#D9D9D9] border-none rounded-[4px] px-4 py-2.5 font-[500] h-[45px] outline-none text-slate-800 placeholder-slate-500 transition-all focus:ring-2 focus:ring-[#5294A9]/50";
  return (
    <div className="w-full">
      {label && <label className="block font-[700] text-[#1a1a1a] mb-2 text-[0.95rem]">{label}</label>}
      {type === "select" ? (
        <select className={baseClass} name={name} value={value} onChange={onChange} {...props}>
          {options?.map((opt, idx) => (
            <option key={idx} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input type={type} name={name} className={baseClass} value={value} readOnly={readOnly} placeholder={placeholder} onChange={onChange} {...props} />
      )}
    </div>
  );
};

// --- MODAL WRAPPER ---
const ModalWrapper = ({ title, icon: Icon, onClose, children, size = "max-w-lg" }) => (
  <div className="fixed inset-0 bg-black/50 z-[1070] flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
    <div className={`bg-white rounded-[15px] w-full ${size} shadow-lg flex flex-col max-h-[95vh] animate-[zoomIn_0.3s_ease-out]`}>
      <div className="border-b border-black px-6 py-4 flex justify-between items-center shrink-0">
        <h5 className="font-[700] text-[1.2rem] flex items-center gap-2 text-slate-800">{Icon && <Icon className="text-xl" />} {title}</h5>
        <button onClick={onClose} className="text-3xl hover:text-red-500 transition-colors leading-none">&times;</button>
      </div>
      <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
    </div>
  </div>
);

// --- 1. MODAL TAMBAH / EDIT KELAS ---
export const FormKelasModal = ({ mode = "add", onClose, onSave, dataKelas }) => {
  const initialForm = { nama_kelas: "", guru_ids: [], target_hafalan: "" };
  const [form, setForm] = useState(initialForm);
  const [guruList, setGuruList] = useState([]);

  useEffect(() => {
    const fetchGurus = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://127.0.0.1:8000/api/guru/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setGuruList(res.data);
      } catch (err) { console.error(err); }
    };
    fetchGurus();

    if (mode === "edit" && dataKelas) {
      setForm({
        ...dataKelas,
        // Backend mengirim data guru sebagai array ID, kita petakan ke guru_ids
        guru_ids: dataKelas.guru || [] 
      });
    }
  }, [mode, dataKelas]);

  const handleToggleGuru = (id) => {
    const currentIds = [...form.guru_ids];
    if (currentIds.includes(id)) {
      setForm({ ...form, guru_ids: currentIds.filter(item => item !== id) });
    } else {
      setForm({ ...form, guru_ids: [...currentIds, id] });
    }
  };

  const handleSaveClick = () => {
    // Siapkan data display untuk modal konfirmasi
    const selectedNames = guruList
      .filter(m => form.guru_ids.includes(m.id))
      .map(m => `${m.first_name} ${m.last_name}`)
      .join(", ");
    
    // Kirim data ke fungsi onSave di KelolaKelasPage.jsx
    onSave({
      ...form,
      _displayGuru: selectedNames || "-"
    });
  };

  return (
    <ModalWrapper title={mode === "add" ? "Tambah Kelas" : "Edit Kelas"} icon={mode === "add" ? BiPlus : BiPencil} onClose={onClose}>
      <div className="space-y-5">
        <ModalInput label="Nama Kelas" name="nama_kelas" value={form.nama_kelas} onChange={(e) => setForm({...form, nama_kelas: e.target.value})} />
        
        <div>
          <label className="block font-[700] text-[#1a1a1a] mb-2 text-[0.95rem]">Pilih Guru Pengampu</label>
          <div className="bg-[#D9D9D9] rounded-[4px] p-3 max-h-[150px] overflow-y-auto space-y-2 custom-scrollbar">
            {guruList.map((m) => (
              <label key={m.id} className="flex items-center gap-3 cursor-pointer p-1">
                <input 
                  type="checkbox" 
                  checked={form.guru_ids.includes(m.id)}
                  onChange={() => handleToggleGuru(m.id)}
                />
                <span className="text-slate-800 font-[500]">{m.first_name} {m.last_name}</span>
              </label>
            ))}
          </div>
        </div>

        <ModalInput label="Target Hafalan" name="target_hafalan" value={form.target_hafalan} onChange={(e) => setForm({...form, target_hafalan: e.target.value})} />
        
        <div className="flex justify-end gap-3 pt-4 border-t border-black">
          <button onClick={handleSaveClick} className="bg-[#5294A9] text-white rounded-[4px] px-6 py-2 font-[700]">Simpan</button>
        </div>
      </div>
    </ModalWrapper>
  );
};

// --- 2. MODAL IMPORT EXCEL ---
export const ImportExcelModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const handleImport = async () => {
    if (!file) return alert("Pilih file excel terlebih dahulu!");
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://127.0.0.1:8000/api/academic/kelas/import/", formData, { headers: { Authorization: `Bearer ${token}` } });
      alert("Import Data Kelas Berhasil!"); onSuccess(); 
    } catch (err) { alert("Gagal mengimport data. Pastikan format header benar."); } finally { setUploading(false); }
  };
  return (
    <ModalWrapper title="Import Excel" icon={BiFile} onClose={onClose} size="max-w-md">
      <div className="p-4 text-center">
        <BiFile className={`text-[5rem] mx-auto mb-2 ${file ? 'text-blue-500' : 'text-[#198754] opacity-80'}`} />
        <p className="text-sm text-slate-500 mb-4">Header: nama_kelas, nip_guru, target_hafalan (angka)</p>
        <input type="file" accept=".xlsx, .xls" onChange={(e) => setFile(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#198754] file:text-white hover:file:bg-[#146c43] cursor-pointer bg-slate-100 rounded-lg border border-slate-200" />
        <button onClick={handleImport} disabled={uploading} className="w-full mt-8 bg-[#198754] text-white font-bold py-3 rounded-[6px] shadow-sm hover:bg-[#157347] transition-all flex justify-center items-center gap-2">{uploading ? "Sedang Proses..." : "Import Sekarang"}</button>
      </div>
    </ModalWrapper>
  );
};

// --- 3. MODAL KONFIRMASI ---
export const ConfirmModal = ({ type = "add", onClose, onConfirm, dataKelas }) => {
  const isDelete = type === "delete";
  const iconBg = isDelete ? "bg-[#DC3545]" : "bg-[#007BFF]";
  const icon = isDelete ? <BiX /> : <BiCheck />;
  const titleText = isDelete ? "Hapus Kelas?" : (type === "edit" ? "Konfirmasi Perubahan" : "Konfirmasi Data Kelas");
  const titleColor = isDelete ? "text-[#DC3545]" : "text-[#007BFF]";
  const descText = isDelete ? "Apakah Anda yakin ingin menghapus data Kelas ini?" : "Pastikan data berikut sudah benar sebelum disimpan.";

  return (
    <div className="fixed inset-0 bg-black/50 z-[1080] flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white rounded-[15px] w-full max-w-[450px] p-6 md:p-8 text-center shadow-2xl animate-[zoomIn_0.3s_ease-out]">
        <div className={`w-[80px] h-[80px] md:w-[90px] md:h-[90px] rounded-full flex items-center justify-center mx-auto mb-5 text-[3.5rem] md:text-[4rem] text-white ${iconBg} shadow-lg`}>{icon}</div>
        <h2 className={`font-[800] text-[1.4rem] md:text-[1.6rem] mb-2 ${titleColor}`}>{titleText}</h2>
        <p className="text-slate-500 mb-8 px-2 leading-relaxed text-sm md:text-base">{descText}</p>
        
        {!isDelete && dataKelas && (
          <div className="bg-slate-50 p-4 rounded-lg text-left mx-auto mb-8 border border-slate-200 text-sm w-full">
            <div className="flex mb-2"><span className="w-[100px] font-bold text-slate-700 shrink-0">Nama Kelas</span><span>: {dataKelas.nama_kelas}</span></div>
            {/* LOGIKA BARU: Tampilkan Nama Guru di Konfirmasi */}
            <div className="flex mb-2"><span className="w-[100px] font-bold text-slate-700 shrink-0">Guru</span><span>: {dataKelas._displayGuru || dataKelas.nama_guru || "-"}</span></div>
            <div className="flex"><span className="w-[100px] font-bold text-slate-700 shrink-0">Target</span><span>: {dataKelas.target_hafalan} Surah</span></div>
          </div>
        )}
        
        <div className="flex flex-row justify-center gap-3">
           <button onClick={onClose} className="bg-[#6C757D] text-white py-2.5 px-2 rounded-[8px] font-[700] hover:bg-[#5a6268] transition-all w-1/2">Batal</button>
          <button onClick={onConfirm} className={`${isDelete ? "bg-[#DC3545] hover:bg-[#bb2d3b]" : "bg-[#007BFF] hover:bg-[#0056b3]"} text-white py-2.5 px-2 rounded-[8px] font-[700] transition-all w-1/2`}>{isDelete ? "Hapus" : "Konfirmasi"}</button>
        </div>
      </div>
    </div>
  );
};