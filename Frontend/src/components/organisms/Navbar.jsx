import { useState, useEffect } from "react"; // LOGIKA: Tambah hook React
import { Link } from "react-router-dom";
import axios from "axios"; // LOGIKA: Import axios
import { BiMenu, BiCog } from "react-icons/bi";

const Navbar = ({ onToggleSidebar, onToggleMobile }) => {
  // LOGIKA: State untuk menyimpan data profil di navbar
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchNavbarData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get("https://laporan.mentariku.org/api/profile/", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfileData(response.data);
      } catch (err) {
        console.error("Gagal mengambil data navbar:", err);
      }
    };

    fetchNavbarData();
    
    // LOGIKA: Dengarkan perubahan di localStorage (jika user update profil di tab lain)
    window.addEventListener('storage', fetchNavbarData);
    return () => window.removeEventListener('storage', fetchNavbarData);
  }, []);

  // LOGIKA: Olah URL Foto (Backend vs Placeholder)
  const getPhotoUrl = () => {
    if (profileData?.profile_photo) {
      return profileData.profile_photo.startsWith('http') 
        ? profileData.profile_photo 
        : `https://laporan.mentariku.org${profileData.profile_photo}`;
    }
    // Jika tidak ada foto, gunakan UI-Avatars berdasarkan nama user
    const name = profileData?.first_name || "User";
    return `https://ui-avatars.com/api/?name=${name}&background=random`;
  };

  return (
    <header className="h-[60px] bg-gradient-to-r from-[#17CA4D] to-[#268C45] flex items-center justify-between px-5 text-white shadow-md sticky top-0 z-[1000]">
      <BiMenu className="text-3xl cursor-pointer" onClick={() => window.innerWidth >= 1024 ? onToggleSidebar() : onToggleMobile()} />
      <div className="flex items-center gap-4">
        {/* Bungkus BiCog dengan Link */}
        <Link to="/setting-profile" className="text-white hover:text-gray-200 transition-colors">
          <BiCog className="text-xl cursor-pointer" title="Setting Profile" />
        </Link>
        <div className="flex items-center gap-2">
          {/* LOGIKA: Tampilkan Foto Dinamis */}
          <img 
            src={getPhotoUrl()} 
            className="w-8 h-8 rounded-full border-2 border-white/50 object-cover" 
            alt="user" 
            onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=User&background=random"; }}
          />
          {/* LOGIKA: Tampilkan Nama Dinamis (First Name) */}
          <span className="text-sm font-medium hidden sm:inline">
            {profileData?.first_name || "Loading..."}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;