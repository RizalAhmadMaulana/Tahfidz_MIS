import { useNavigate } from "react-router-dom"; // 1. Import useNavigate

const WelcomeModal = ({ onClose }) => {
  const navigate = useNavigate(); // 2. Inisialisasi hook

  const handleNavigateToProfile = () => {
    onClose(); // Tutup modal dulu agar tidak nyangkut
    navigate("/setting-profile"); // 3. Pindah ke halaman setting profile
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[1060] flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white rounded-[20px] p-8 max-w-[500px] w-full text-center shadow-2xl scale-[1] animate-[zoomIn_0.3s_ease-out]">
        <h3 className="font-bold text-2xl text-slate-800 mb-2">Selamat Datang di Mutabaah Digital! 👋</h3>
        <p className="text-slate-500 my-6 text-[1.1rem] leading-relaxed">
          Demi keamanan, silakan ganti password bawaan dan lengkapi profil Anda sebelum melanjutkan.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={onClose}
            className="bg-[#64748B] text-white rounded-lg font-semibold px-6 py-2.5 hover:bg-[#475569] transition-all"
          >
            Ingatkan Saya Nanti
          </button>
          
          {/* 4. Pasang fungsi navigasi di sini */}
          <button 
             onClick={handleNavigateToProfile} 
             className="bg-[#2D6A4F] text-white rounded-lg font-semibold px-6 py-2.5 hover:bg-[#1B4332] transition-all"
          >
            Lengkapi Profil Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;