import { BiCheckShield, BiBook, BiStar } from "react-icons/bi";
import logoMIS from "../../assets/logo.png";

const BannerPanel = () => {
  const bubbles = [
    { size: '60px', left: '10%', duration: '8s', delay: '0s' },
    { size: '90px', left: '25%', duration: '12s', delay: '2s' },
    { size: '40px', left: '75%', duration: '10s', delay: '4s' },
    { size: '110px', left: '85%', duration: '18s', delay: '1s' },
  ];

  return (
    <div className="relative w-full lg:w-1/2 bg-gradient-to-br from-[#0D9488] to-[#0A2540] p-10 lg:p-16 flex flex-col justify-center items-center text-center text-white overflow-hidden">
      {/* Animated Bubbles Area */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        {bubbles.map((b, i) => (
          <div 
            key={i} 
            className="bubble" 
            style={{ width: b.size, height: b.size, left: b.left, animationDuration: b.duration, animationDelay: b.delay }} 
          />
        ))}
      </div>

      <div className="relative z-[2] w-full max-w-sm">
        <h1 className="text-[1.8rem] lg:text-[2.5rem] font-[700] mb-1 leading-tight">Selamat Datang</h1>
        <p className="opacity-90 text-[0.9rem] lg:text-[1rem] mb-8 lg:mb-10">Mutabaah Mentari Islamic School</p>
        
        <div className="mb-8 lg:mb-10 flex justify-center">
           {/* UPDATE PADA BAGIAN IMG INI: */}
           {/* Menambahkan class 'animate-float' agar logo bergerak naik turun */}
           <img 
             src={logoMIS} 
             alt="Logo MIS" 
             className="h-[65px] lg:h-[80px] drop-shadow-[0px_4px_8px_rgba(0,0,0,0.3)] animate-float" 
           />
        </div>
        
        <div className="space-y-2.5 w-full">
          <div className="bg-white/10 backdrop-blur-[8px] border border-white/20 p-[12px] rounded-[12px] flex items-center justify-center gap-2.5 font-[600] text-[0.9rem]">
            <BiCheckShield className="text-xl" /> Beradab
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/10 backdrop-blur-[8px] border border-white/20 p-[12px] rounded-[12px] flex items-center justify-center gap-2 font-[600] text-[0.9rem]">
              <BiBook /> Berilmu
            </div>
            <div className="bg-white/10 backdrop-blur-[8px] border border-white/20 p-[12px] rounded-[12px] flex items-center justify-center gap-2 font-[600] text-[0.9rem]">
              <BiStar /> Berprestasi
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerPanel;