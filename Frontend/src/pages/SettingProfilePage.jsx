import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/templates/DashboardLayout";
import { 
  BiPencil, BiSolidLock, BiImage, BiShield, BiLockAlt 
} from "react-icons/bi";
import ProfileButton from "../components/atoms/ProfileButton";
import InfoRow from "../components/molecules/InfoRow";
import { EditProfileModal, ChangePasswordModal, ChangePhotoModal } from "../components/organisms/ProfileModals";
// 1. IMPORT NOTIFIKASI (Hanya ini tambahan import-nya)
import SuccessNotification from "../components/atoms/SuccessNotification";

const SettingProfilePage = () => {
  const [activeModal, setActiveModal] = useState(null); 
  const [profileData, setProfileData] = useState(null);

  // 2. STATE UNTUK NOTIFIKASI
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("https://laporan.mentariku.org/api/profile/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfileData(response.data);
    } catch (err) {
      console.error("Gagal refresh data profil:", err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // 3. FUNGSI HELPER UNTUK MUNCULKAN ALERT
  const triggerNotification = (msg) => {
    setSuccessMsg(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <DashboardLayout title="Setting Profile">
      
      {/* 4. RENDER KOMPONEN ALERT (Posisinya fixed, jadi tidak merusak desain) */}
      {showSuccess && <SuccessNotification message={successMsg} />}

      {activeModal === 'edit' && (
        <EditProfileModal 
          userData={profileData} 
          onSuccess={() => { 
            setActiveModal(null); 
            fetchProfile(); 
            // Trigger Alert Edit Profil
            triggerNotification("Profil berhasil diperbarui!");
          }} 
          onClose={() => setActiveModal(null)} 
        />
      )}
      
      {activeModal === 'password' && (
        <ChangePasswordModal 
          onSuccess={() => {
            setActiveModal(null);
            // Trigger Alert Ganti Password
            triggerNotification("Kata sandi berhasil diubah!");
          }}
          onClose={() => setActiveModal(null)} 
        />
      )}
      
      {activeModal === 'photo' && (
        <ChangePhotoModal 
          onSuccess={() => { 
            setActiveModal(null); 
            fetchProfile(); 
            // Trigger Alert Ganti Foto
            triggerNotification("Foto profil berhasil diperbarui!");
          }} 
          onClose={() => setActiveModal(null)} 
        />
      )}

      {/* --- BAGIAN DI BAWAH INI SAMA PERSIS DENGAN KODEMU (TIDAK ADA YANG DIUBAH) --- */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
        <ProfileButton icon={BiPencil} label="Edit Profil" color="#4DB0B3" onClick={() => setActiveModal('edit')} />
        <ProfileButton icon={BiSolidLock} label="Ganti Kata Sandi" color="#1B4332" onClick={() => setActiveModal('password')} />
        <ProfileButton icon={BiImage} label="Ganti Foto" color="#A68A2D" onClick={() => setActiveModal('photo')} />
      </div>

      <div className="bg-white rounded-[12px] p-6 lg:p-10 border-t-[5px] border-[#2ECC71] shadow-[0_4px_15_rgba(0,0,0,0.05)]">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-0">
          <div className="w-full lg:w-5/12 text-center lg:border-r border-slate-200 lg:pr-10 mb-8 lg:mb-0">
            <div className="w-[180px] h-[180px] sm:w-[220px] sm:h-[220px] lg:w-[260px] lg:h-[260px] rounded-full overflow-hidden border-[5px] border-[#f8fafc] mx-auto mb-8 shadow-sm bg-gray-50">
              <img 
                src={
                  profileData?.profile_photo 
                    ? (profileData.profile_photo.startsWith('http') 
                        ? profileData.profile_photo 
                        : `https://laporan.mentariku.org${profileData.profile_photo}`)
                    : "https://api.dicebear.com/7.x/avataaars/svg?seed=Rizal"
                } 
                alt="Profile" 
                className="w-full h-full object-cover" 
                onError={(e) => { e.target.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=Rizal"; }}
              />
            </div>
            <div className="flex flex-col gap-2 w-full max-w-[320px] mx-auto">
              <InfoRow 
                type="center"
                label={<><BiShield className="text-xl" /> Role Pengguna</>} 
                value={<span className="bg-[#4DB0B3] text-white px-3 py-1 rounded-[6px] font-[500] text-[0.9rem] sm:text-[0.95rem] uppercase">{profileData?.role || "..."}</span>} 
              />
              <InfoRow 
                type="center"
                label={<><BiLockAlt className="text-xl" /> Kata Sandi</>} 
                value={<span className="text-xl tracking-[0.2em] font-bold text-slate-600 mt-1 block">.............</span>} 
              />
            </div>
          </div>

          <div className="w-full lg:w-7/12 lg:pl-12 flex flex-col justify-center">
            <div className="mb-10">
              <div className="font-[700] text-[#27AE60] text-[1.4rem] mb-6 border-b border-slate-200 pb-2">Identitas Diri</div>
              <div className="space-y-4"> 
                <InfoRow label="ID Profil" value={profileData?.id || "-"} />
                <InfoRow label="Username" value={profileData?.username || "-"} />
                <InfoRow label="Nama Lengkap" value={`${profileData?.first_name || ""} ${profileData?.last_name || ""}`} />
              </div>
            </div>
            <div>
              <div className="font-[700] text-[#27AE60] text-[1.4rem] mb-6 border-b border-slate-200 pb-2">Kontak</div>
              <div className="space-y-4">
                <InfoRow label="Alamat Email" value={profileData?.email || "-"} />
                <InfoRow label="No Telephone" value={profileData?.phone_number || "-"} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingProfilePage;