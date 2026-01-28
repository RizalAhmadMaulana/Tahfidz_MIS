import { useState, useEffect } from "react";
import axios from "axios";
import { 
  BiSave, BiTrash, BiCheck, BiFile, BiPlus, BiPencil, BiX 
} from "react-icons/bi";

// --- KOMPONEN INPUT TEXT / SELECT ---
const ModalInput = ({ label, type = "text", value, options, readOnly, placeholder, onChange, name, ...props }) => {
  const baseClass = "w-full bg-[#D9D9D9] border-none rounded-[4px] px-4 py-2.5 font-[500] h-[45px] outline-none text-slate-800 placeholder-slate-500 transition-all focus:ring-2 focus:ring-[#5294A9]/50";
  
  return (
    <div className="w-full">
      {label && <label className="block font-[700] text-[#1a1a1a] mb-2 text-[0.9rem]">{label}</label>}
      
      {type === "select" ? (
        <select className={baseClass} name={name} value={value} onChange={onChange} {...props}>
          {options?.map((opt, idx) => (
            <option key={idx} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input 
          type={type} name={name} className={baseClass} value={value}
          readOnly={readOnly} placeholder={placeholder} onChange={onChange} {...props}
        />
      )}
    </div>
  );
};

// --- KOMPONEN RADIO BUTTON CUSTOM ---
const ModalRadio = ({ label, name, options, value, onChange }) => {
  return (
    <div className="w-full">
      <label className="block font-[700] text-[#1a1a1a] mb-2 text-[0.9rem]">{label}</label>
      <div className="flex gap-6 py-1.5">
        {options.map((opt, idx) => (
          <label key={idx} className="flex items-center gap-2 cursor-pointer font-[500] text-[0.9rem] text-slate-700">
            <input 
              type="radio" name={name} value={opt} checked={value === opt} onChange={onChange}
              className="w-[18px] h-[18px] accent-[#5294A9] cursor-pointer"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
};

// --- MODAL WRAPPER ---
const ModalWrapper = ({ title, icon: Icon, onClose, children, size = "max-w-lg" }) => (
  <div className="fixed inset-0 bg-black/50 z-[1070] flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
    <div className={`bg-white rounded-[15px] w-full ${size} shadow-lg flex flex-col max-h-[95vh] animate-[zoomIn_0.3s_ease-out]`}>
      <div className="border-b border-black px-6 py-4 flex justify-between items-center shrink-0">
        <h5 className="font-[700] text-[1.2rem] flex items-center gap-2 text-slate-800">
          {Icon && <Icon className="text-xl" />} {title}
        </h5>
        <button onClick={onClose} className="text-3xl hover:text-red-500 leading-none transition-colors">&times;</button>
      </div>
      <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
    </div>
  </div>
);

// --- 1. MODAL TAMBAH / EDIT SISWA ---
export const FormSiswaModal = ({ mode = "add", onClose, onSave, userData }) => {
  const initialForm = {
    first_name: "", last_name: "", gender: "Laki Laki", nisn: "", 
    kelas: "", birth_info: "", phone_number: "", email: ""
  };

  const [form, setForm] = useState(initialForm);
  // LOGIKA: State untuk menyimpan daftar kelas dari backend
  const [kelasList, setKelasList] = useState([]);

  useEffect(() => {
    // 1. Ambil Data Kelas untuk Dropdown
    const fetchKelas = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://127.0.0.1:8000/api/academic/kelas/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Format data agar sesuai struktur dropdown {value, label}
        const formatted = res.data.map(k => ({
          value: k.nama_kelas, // Simpan nama kelasnya langsung
          label: k.nama_kelas
        }));
        setKelasList([{ value: "", label: "-- Pilih Kelas --" }, ...formatted]);
      } catch (err) {
        console.error("Gagal load kelas", err);
      }
    };
    fetchKelas();

    // 2. Set Form Data jika Edit
    if (mode === "edit" && userData) {
      setForm({ ...userData });
    } else {
      setForm(initialForm);
    }
  }, [mode, userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone_number") {
      const onlyNums = value.replace(/[^0-9]/g, ""); 
      setForm({ ...form, [name]: onlyNums });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  return (
    <ModalWrapper title={mode === "add" ? "Tambah Siswa" : "Edit Siswa"} icon={mode === "add" ? BiPlus : BiPencil} onClose={onClose} size="max-w-3xl">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalInput label="Nama Depan Siswa" name="first_name" placeholder="Nama Depan" value={form.first_name} onChange={handleChange} />
            <ModalInput label="Nama Belakang Siswa" name="last_name" placeholder="Nama Belakang" value={form.last_name} onChange={handleChange} />
        </div>
        
        <ModalRadio label="Jenis Kelamin" name="gender" options={["Laki Laki", "Perempuan"]} value={form.gender} onChange={handleChange} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalInput label="NISN" name="nisn" placeholder="Masukkan NISN" value={form.nisn} onChange={handleChange} />
            {/* LOGIKA: Gunakan kelasList yang diambil dari API */}
            <ModalInput label="Kelas" name="kelas" type="select" options={kelasList} value={form.kelas} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalInput label="Tempat, Tanggal Lahir" name="birth_info" placeholder="Contoh: Semarang, 01/01/2010" value={form.birth_info} onChange={handleChange} />
            <ModalInput label="No Telp Orangtua (Contoh:628xxx)" name="phone_number" placeholder="08xxxxxxxxxx" value={form.phone_number} onChange={handleChange} />
        </div>
        
        <ModalInput label="Email (Opsional)" name="email" type="email" placeholder="Email Orang Tua" value={form.email} onChange={handleChange} />

        <hr className="border-t border-black my-6 -mx-6 opacity-100" />
        
        <div className="flex flex-row justify-end gap-3">
          <button onClick={() => setForm(initialForm)} className="bg-[#E53E3E] text-white rounded-[4px] px-6 py-2 font-[700] flex items-center gap-2 hover:bg-red-700 transition-colors">
            <BiTrash /> Reset
          </button>
          <button onClick={() => onSave(form)} className="bg-[#5294A9] text-white rounded-[4px] px-6 py-2 font-[700] flex items-center gap-2 hover:bg-[#417688] transition-colors">
            <BiSave /> {mode === "add" ? "Simpan" : "Ubah"}
          </button>
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
      await axios.post("http://127.0.0.1:8000/api/siswa/import/", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" }
      });
      alert("Import Data Siswa Berhasil!");
      onSuccess(); 
    } catch (err) {
      alert("Gagal mengimport data. Pastikan format header benar.");
    } finally { 
      setUploading(false); 
    }
  };

  return (
    <ModalWrapper title="Import Excel" icon={BiFile} onClose={onClose} size="max-w-md">
      <div className="p-4 text-center">
        <BiFile className={`text-[5rem] mx-auto mb-2 ${file ? 'text-blue-500' : 'text-[#198754] opacity-80'}`} />
        <p className="text-sm text-slate-500 mb-4">Upload file format .xlsx / .xls</p>
        <input type="file" accept=".xlsx, .xls" onChange={(e) => setFile(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#198754] file:text-white hover:file:bg-[#146c43] cursor-pointer bg-slate-100 rounded-lg border border-slate-200" />
        <button onClick={handleImport} disabled={uploading} className="w-full mt-8 bg-[#198754] text-white font-bold py-3 rounded-[6px] shadow-sm hover:bg-[#157347] transition-all flex justify-center items-center gap-2">{uploading ? "Sedang Proses..." : "Import Sekarang"}</button>
      </div>
    </ModalWrapper>
  );
};

// --- 3. MODAL KONFIRMASI ---
export const ConfirmModal = ({ type = "save", onClose, onConfirm, userData }) => {
  const isDelete = type === "delete";
  const iconBg = isDelete ? "bg-[#EF5350]" : "bg-[#4285F4]";
  const icon = isDelete ? <BiX /> : <BiCheck />;
  const titleText = isDelete ? "Hapus Siswa?" : "Konfirmasi Data Siswa";

  return (
    <div className="fixed inset-0 bg-black/50 z-[1080] flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white rounded-[24px] w-full max-w-[480px] p-8 text-center shadow-2xl animate-[zoomIn_0.3s_ease-out]">
        <div className={`w-[85px] h-[85px] rounded-full flex items-center justify-center mx-auto mb-6 text-[4.5rem] text-white ${iconBg} shadow-lg shadow-blue-200`}>{icon}</div>
        <h2 className="font-[800] text-[1.7rem] mb-2 text-[#007BFF] tracking-tight">{titleText}</h2>
        <p className="text-[#4A4A4A] text-[0.95rem] mb-8 font-[500]">{isDelete ? "Data santri dan login wali murid akan dihapus permanen. Yakin?" : "Periksa kembali data santri sebelum disimpan."}</p>
        
        {!isDelete && userData && (
          <div className="mb-10 text-left mx-auto max-w-[300px] text-[1.05rem]">
            <div className="grid grid-cols-[110px_15px_1fr] mb-2"><span className="font-[700] text-slate-800">Nama</span><span className="font-[700] text-slate-800">:</span><span className="text-slate-700 font-[500]">{userData.first_name} {userData.last_name}</span></div>
            <div className="grid grid-cols-[110px_15px_1fr] mb-2"><span className="font-[700] text-slate-800">NISN</span><span className="font-[700] text-slate-800">:</span><span className="text-slate-700 font-[500]">{userData.nisn || "xxxxxxxx"}</span></div>
            <div className="grid grid-cols-[110px_15px_1fr]"><span className="font-[700] text-slate-800">Kelas</span><span className="font-[700] text-slate-800">:</span><span className="text-slate-700 font-[500]">{userData.kelas || "-"}</span></div>
          </div>
        )}
        
        <div className="flex gap-4 px-2">
          <button onClick={onClose} className="bg-[#EF5350] text-white py-3 rounded-[12px] font-[700] flex-1 transition-all hover:bg-red-600">Batal</button>
          <button onClick={onConfirm} className="bg-[#007BFF] text-white py-3 rounded-[12px] font-[700] flex-1 transition-all hover:bg-blue-600">Konfirmasi</button>
        </div>
      </div>
    </div>
  );
};