import { BiCheckCircle } from "react-icons/bi";

const SuccessNotification = ({ message }) => {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[2000]">
      {/* ANIMASI GOYANG TIPIS (POP-WIGGLE) */}
      <style>
        {`
          @keyframes pop-wiggle {
            0% { opacity: 0; transform: scale(0.5) rotate(-3deg); }
            40% { opacity: 1; transform: scale(1.1) rotate(2deg); }
            60% { transform: scale(0.95) rotate(-1deg); }
            80% { transform: scale(1.02) rotate(1deg); }
            100% { transform: scale(1) rotate(0); }
          }
        `}
      </style>

      {/* CONTAINER UTAMA */}
      <div
        style={{ animation: 'pop-wiggle 0.5s cubic-bezier(0.25, 1, 0.5, 1) forwards' }}
        className="
            flex items-center gap-3 justify-center
            
            /* --- RESPONSIVE SIZE (Perubahan Utama Disini) --- */
            w-max max-w-[85vw]         /* Lebar otomatis, tapi mentok 85% layar HP */
            px-5 py-3                  /* Padding Mobile (Kecil) */
            sm:px-6 sm:py-3.5          /* Padding Laptop (Sedang) */
            
            rounded-full 
            shadow-[0_8px_30px_-5px_rgba(0,0,0,0.5)] 
            border border-white/10 ring-1 ring-white/5
            
            /* STYLE: Transparan Gelap + Blur */
            bg-[#121212]/90 backdrop-blur-md text-white
        "
      >
        {/* ICON CHECK (Ukuran menyesuaikan) */}
        <div className="bg-[#2ECC71]/20 p-1 rounded-full flex items-center justify-center shadow-inner shadow-[#2ECC71]/10 shrink-0">
            <BiCheckCircle className="text-[#2ECC71] text-lg sm:text-xl drop-shadow-[0_0_5px_rgba(46,204,113,0.5)]" />
        </div>

        {/* PESAN TEKS (Ukuran menyesuaikan) */}
        <span className="font-bold text-xs sm:text-sm tracking-wide font-sans text-slate-100 truncate">
            {message}
        </span>
      </div>
    </div>
  );
};

export default SuccessNotification;