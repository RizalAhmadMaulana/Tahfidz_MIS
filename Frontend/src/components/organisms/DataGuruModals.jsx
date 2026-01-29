import { useState, useEffect } from "react";
import axios from "axios";
import { 
  BiSave, BiTrash, BiCheck, BiFile, BiPlus, 
  BiPencil, BiX 
} from "react-icons/bi";

const ModalInput = ({ label, type = "text", value, onChange, name, placeholder, readOnly, ...props }) => {
  const baseClass = "w-full bg-[#D9D9D9] border-none rounded-[4px] px-4 py-2.5 font-[500] h-[45px] outline-none text-slate-800 placeholder-slate-500 transition-all focus:ring-2 focus:ring-[#5294A9]/50";
  return (
    <div className="w-full">
      {label && <label className="block font-[700] text-[#1a1a1a] mb-2 text-[0.9rem]">{label}</label>}
      <input 
        type={type} name={name} className={baseClass} 
        value={value} onChange={onChange} readOnly={readOnly} placeholder={placeholder} {...props} 
      />
    </div>
  );
};

const ModalRadio = ({ label, name, options, value, onChange }) => (
  <div className="w-full">
    <label className="block font-[700] text-[#1a1a1a] mb-2 text-[0.9rem]">{label}</label>
    <div className="flex gap-6 py-1.5">
      {options.map((opt, idx) => (
        <label key={idx} className="flex items-center gap-2 cursor-pointer font-[500] text-[0.9rem] text-slate-700">
          <input 
            type="radio" name={name} value={opt} checked={value === opt} 
            onChange={onChange} className="w-[18px] h-[18px] accent-[#5294A9]" 
          />
          {opt}
        </label>
      ))}
    </div>
  </div>
);

const ModalWrapper = ({ title, icon: Icon, onClose, children, size = "max-w-lg" }) => (
  <div className="fixed inset-0 bg-black/50 z-[1070] flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
    <div className={`bg-white rounded-[15px] w-full ${size} shadow-lg flex flex-col max-h-[95vh] animate-[zoomIn_0.3s_ease-out]`}>
      <div className="border-b border-black px-6 py-4 flex justify-between items-center shrink-0">
        <h5 className="font-[700] text-[1.2rem] flex items-center gap-2 text-slate-800">{Icon && <Icon className="text-xl" />} {title}</h5>
        <button onClick={onClose} className="text-3xl hover:text-red-500 leading-none">&times;</button>
      </div>
      <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
    </div>
  </div>
);

// --- 1. MODAL TAMBAH / EDIT GURU (TANPA USERNAME & PASSWORD) ---
export const FormGuruModal = ({ mode = "add", onClose, onSave, userData }) => {
  const [form, setForm] = useState({
    first_name: "", last_name: "", gender: "Laki Laki", 
    nip: "", birth_info: "", phone_number: "", email: ""
  });

  useEffect(() => {
    if (mode === "edit" && userData) setForm({ ...userData });
  }, [mode, userData]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <ModalWrapper title={mode === "add" ? "Tambah Guru" : "Edit Guru"} icon={mode === "add" ? BiPlus : BiPencil} onClose={onClose} size="max-w-3xl">
      <div className="space-y-4">
        {/* LOGIKA: Username & Password dihapus karena menggunakan NIP di Backend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModalInput label="Nama Depan Guru" name="first_name" placeholder="Nama Depan" value={form.first_name} onChange={handleChange} />
          <ModalInput label="Nama Belakang Guru" name="last_name" placeholder="Nama Belakang" value={form.last_name} onChange={handleChange} />
        </div>
        <ModalRadio label="Jenis Kelamin" name="gender" options={["Laki Laki", "Perempuan"]} value={form.gender} onChange={handleChange} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalInput label="NIP (Akan menjadi Username & Pass)" name="nip" placeholder="Masukkan NIP" value={form.nip} onChange={handleChange} />
            <ModalInput label="Tempat, Tanggal Lahir" name="birth_info" placeholder="Contoh: Semarang, 01/01/1985" value={form.birth_info} onChange={handleChange} />
        </div>
        <ModalInput label="No Telp Guru" name="phone_number" placeholder="Masukkan Nomor Telp Guru" value={form.phone_number} onChange={handleChange} />
        <ModalInput label="Email Guru" name="email" type="email" placeholder="Masukkan Email" value={form.email} onChange={handleChange} />
        
        <hr className="border-t border-black my-6 -mx-6 opacity-100" />
        <div className="flex flex-row justify-end gap-3">
          <button onClick={() => setForm({ first_name: "", last_name: "", nip: "", phone_number: "", email: "", gender: "Laki Laki", birth_info: "" })} className="bg-[#E53E3E] text-white rounded-[4px] px-6 py-2 font-[700] flex items-center gap-2 hover:bg-red-700 transition-colors"><BiTrash /> Reset</button>
          <button onClick={() => onSave(form)} className="bg-[#5294A9] text-white rounded-[4px] px-6 py-2 font-[700] flex items-center gap-2 hover:bg-[#417688] transition-colors"><BiSave /> {mode === "add" ? "Simpan" : "Ubah"}</button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export const ImportExcelModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const handleImport = async () => {
    if (!file) return alert("Pilih file terlebih dahulu!");
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("https://laporan.mentariku.org/api/guru/import/", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Import Data Guru Berhasil!");
      onSuccess();
    } catch (err) { alert("Gagal mengimport data."); }
    finally { setUploading(false); }
  };
  return (
    <ModalWrapper title="Import Excel" icon={BiFile} onClose={onClose} size="max-w-md">
      <div className="p-4 text-center">
        <BiFile className={`text-[5rem] mx-auto mb-2 ${file ? 'text-blue-500' : 'text-[#198754] opacity-80'}`} />
        <p className="text-sm text-slate-500 mb-4">{file ? file.name : "Header: nip, first_name, last_name, gender, birth_info, phone_number, email"}</p>
        <input type="file" accept=".xlsx, .xls" onChange={(e) => setFile(e.target.files[0])} className="block w-full text-sm text-slate-500 file:bg-[#198754] file:text-white file:rounded-full file:px-6 file:py-2" />
        <button onClick={handleImport} disabled={uploading} className="w-full mt-8 bg-[#198754] text-white font-bold py-3 rounded-[6px]">{uploading ? "Sedang Proses..." : "Import Sekarang"}</button>
      </div>
    </ModalWrapper>
  );
};

export const ConfirmModal = ({ type = "add", onClose, onConfirm, userData }) => {
  const isDelete = type === "delete";
  const iconBg = isDelete ? "bg-[#EF5350]" : "bg-[#4285F4]";
  const titleText = isDelete ? "Hapus Guru?" : (type === "edit" ? "Konfirmasi Perubahan" : "Konfirmasi Data Guru");
  return (
    <div className="fixed inset-0 bg-black/50 z-[1080] flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white rounded-[24px] w-full max-w-[480px] p-8 text-center shadow-2xl animate-[zoomIn_0.3s_ease-out]">
        <div className={`w-[85px] h-[85px] rounded-full flex items-center justify-center mx-auto mb-6 text-[4.5rem] text-white ${iconBg} shadow-lg shadow-blue-200`}>{isDelete ? <BiX /> : <BiCheck />}</div>
        <h2 className="font-[800] text-[1.7rem] mb-2 text-[#007BFF] tracking-tight">{titleText}</h2>
        <p className="text-[#4A4A4A] text-[0.95rem] mb-8 font-[500]">{isDelete ? "Data di Management User juga akan terhapus. Yakin?" : "Periksa kembali data sebelum disimpan."}</p>
        {!isDelete && userData && (
          <div className="mb-10 text-left mx-auto max-w-[300px] text-[1.05rem]">
            <div className="grid grid-cols-[110px_15px_1fr] mb-2"><span className="font-[700]">Nama</span><span>:</span><span>{userData.first_name} {userData.last_name}</span></div>
            <div className="grid grid-cols-[110px_15px_1fr] mb-2"><span className="font-[700]">NIP</span><span>:</span><span>{userData.nip}</span></div>
            <div className="grid grid-cols-[110px_15px_1fr]"><span className="font-[700]">Gender</span><span>:</span><span>{userData.gender}</span></div>
          </div>
        )}
        <div className="flex gap-4 px-2">
          <button onClick={onClose} className="bg-[#EF5350] text-white py-3 rounded-[12px] font-[700] flex-1">Batal</button>
          <button onClick={onConfirm} className="bg-[#007BFF] text-white py-3 rounded-[12px] font-[700] flex-1">Konfirmasi</button>
        </div>
      </div>
    </div>
  );
};