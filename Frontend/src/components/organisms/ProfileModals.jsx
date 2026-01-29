import { BiPencil, BiSave, BiTrash, BiLockAlt, BiImage, BiShow, BiHide } from "react-icons/bi";
import { useState } from "react";
import axios from "axios";

// --- KOMPONEN INPUT ---
const ModalInput = ({ label, type = "text", value, onChange, name, ...props }) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="mb-4">
      <label className="block font-[700] text-[#1a1a1a] text-[1rem] mb-2">{label}</label>
      <div className="relative flex">
        <input 
          type={inputType} 
          name={name}
          className="w-full bg-[#D9D9D9] border-none rounded-[4px] px-[15px] py-[12px] font-[500] h-[50px] outline-none"
          value={value}
          onChange={onChange}
          {...props}
        />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)} className="bg-[#D9D9D9] px-3 rounded-r-[4px] text-xl">
            {show ? <BiShow /> : <BiHide />}
          </button>
        )}
      </div>
    </div>
  );
};

// LOGIKA: ModalWrapper sekarang menerima fungsi onSave
const ModalWrapper = ({ title, icon: Icon, onClose, onSave, children }) => (
  <div className="fixed inset-0 bg-black/50 z-[1070] flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
    <div className="bg-white rounded-[12px] w-full max-w-lg shadow-lg overflow-hidden animate-[zoomIn_0.3s_ease-out]">
      <div className="border-b border-black px-6 py-4 flex justify-between items-center">
        <h5 className="font-[600] text-[1.4rem] flex items-center gap-3"><Icon /> {title}</h5>
        <button onClick={onClose} className="text-2xl hover:text-red-500">&times;</button>
      </div>
      <div className="p-6">
        {children}
        <hr className="border-t border-black my-6 -mx-6" />
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="bg-[#E53E3E] text-white rounded-[8px] px-6 py-2.5 font-[700] flex items-center gap-2 hover:bg-red-700">
            <BiTrash /> Reset
          </button>
          <button onClick={onSave} className="bg-[#4DB0B3] text-white rounded-[8px] px-6 py-2.5 font-[700] flex items-center gap-2 hover:bg-[#3a8b8d]">
            <BiSave /> Simpan
          </button>
        </div>
      </div>
    </div>
  </div>
);

// --- 1. MODAL EDIT PROFIL ---
export const EditProfileModal = ({ onClose, userData, onSuccess }) => {
  const [form, setForm] = useState({
    first_name: userData?.first_name || "",
    last_name: userData?.last_name || "",
    phone_number: userData?.phone_number || "",
    email: userData?.email || ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      // Kirim data teks (JSON) ke backend
      const response = await axios.patch("http://127.0.0.1:8000/api/profile/", form, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // LOGIKA: Update data 'user' di localStorage agar nama di Sidebar/Navbar ikut berubah
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        localStorage.setItem("user", JSON.stringify({
          ...user,
          name: `${response.data.first_name} ${response.data.last_name}`
        }));
      }
      onSuccess(); 
    } catch (err) {
      console.error("Gagal update profil:", err.response?.data || err.message);
      // Menampilkan detail error dari backend jika ada
      const errorMsg = err.response?.data ? Object.values(err.response.data).flat().join(", ") : "Gagal memperbarui profil";
      alert(errorMsg);
    }
  };

  return (
    <ModalWrapper title="Edit User" icon={BiPencil} onClose={onClose} onSave={handleUpdate}>
      <ModalInput label="Username (Read Only)" value={userData?.username || ""} readOnly disabled />
      <ModalInput label="Nama Depan" name="first_name" value={form.first_name} onChange={handleChange} />
      <ModalInput label="Nama Belakang" name="last_name" value={form.last_name} onChange={handleChange} />
      <ModalInput label="Nomor Telephone" name="phone_number" value={form.phone_number} onChange={handleChange} />
      <ModalInput label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
    </ModalWrapper>
  );
};

// --- 2. MODAL GANTI PASSWORD ---
export const ChangePasswordModal = ({ onClose }) => {
  const [passForm, setPassForm] = useState({ old_password: "", new_password: "", confirm_password: "" });

  const handleUpdatePassword = async () => {
    if (passForm.new_password !== passForm.confirm_password) {
      return alert("Konfirmasi password baru tidak cocok!");
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put("http://127.0.0.1:8000/api/change-password/", {
        old_password: passForm.old_password,
        new_password: passForm.new_password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Password berhasil diubah!");
      onClose();
    } catch (err) {
      alert(err.response?.data?.old_password?.[0] || "Gagal mengubah password");
    }
  };

  return (
    <ModalWrapper title="Ganti Kata Sandi" icon={BiLockAlt} onClose={onClose} onSave={handleUpdatePassword}>
      <ModalInput label="Kata Sandi Lama" type="password" value={passForm.old_password} onChange={(e) => setPassForm({...passForm, old_password: e.target.value})} />
      <ModalInput label="Kata Sandi Baru" type="password" value={passForm.new_password} onChange={(e) => setPassForm({...passForm, new_password: e.target.value})} />
      <ModalInput label="Ulangi Kata Sandi" type="password" value={passForm.confirm_password} onChange={(e) => setPassForm({...passForm, confirm_password: e.target.value})} />
    </ModalWrapper>
  );
};

// --- 3. MODAL GANTI FOTO ---
export const ChangePhotoModal = ({ onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUploadPhoto = async () => {
    if (!selectedFile) return alert("Pilih foto terlebih dahulu!");
    
    const formData = new FormData();
    formData.append("profile_photo", selectedFile);

    try {
      const token = localStorage.getItem("token");
      
      await axios.patch("http://127.0.0.1:8000/api/profile/", formData, {
        headers: { 
          Authorization: `Bearer ${token}`
        }
      });

      onSuccess();
    } catch (err) {
      console.error("Error upload:", err);
      alert("Gagal mengupload foto");
    }
  };

  return (
    <ModalWrapper title="Ganti Foto" icon={BiImage} onClose={onClose} onSave={handleUploadPhoto}>
      <div className="mb-4">
        <label className="block font-[700] text-[#1a1a1a] text-[1rem] mb-2">Foto Baru</label>
        <input 
          type="file" 
          onChange={(e) => setSelectedFile(e.target.files[0])}
          className="w-full bg-[#D9D9D9] border-none rounded-[4px] px-[15px] py-[10px] h-[50px] file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:bg-white file:text-[#4DB0B3]" 
        />
      </div>
    </ModalWrapper>
  );
};