const InfoRow = ({ label, value, type = "standard" }) => {
  // Cek apakah ini baris untuk bagian tengah (Role/Password)
  const isCenter = type === "center";

  return (
    <div 
      className={`flex text-[#1a1a1a] 
      ${isCenter 
        ? "flex-row items-center justify-between w-full mb-3" // Center: Selalu satu baris (Kanan-Kiri)
        : "flex-col sm:flex-row items-start sm:items-center mb-4 text-[1rem] sm:text-[1.05rem]" // Standard: Stack di HP
      }`}
    >
      
      {/* Label */}
      <span className={`flex items-center gap-2 font-[400] text-slate-600 shrink-0
        ${isCenter ? "text-[0.95rem] sm:text-[1.1rem]" : "w-full sm:w-[220px] mb-1 sm:mb-0"}`}>
        {label}
      </span>
      
      {/* Titik Dua: Munculkan juga di mobile untuk tipe 'center' agar rapi */}
      <span className={`font-[700] text-center text-slate-800 shrink-0
        ${isCenter ? "mx-2 sm:mx-4" : "hidden sm:block w-[30px]"}`}>
        :
      </span>
      
      {/* Value */}
      <span className={`font-[600] text-[#1a1a1a] leading-relaxed
        ${isCenter ? "text-right text-[0.95rem] sm:text-[1.1rem]" : "flex-1 text-left"}`}>
        {value}
      </span>
    </div>
  );
};
export default InfoRow;