const ActionButton = ({ icon: Icon, label, variant = "primary", className, ...props }) => {
  const variants = {
    primary: "bg-[#1B4332] text-white hover:bg-[#143326]", // Hijau Tua (Download/Search)
    green: "bg-[#C1E1C1] text-black hover:bg-[#a8d6a8]",   // Hijau Muda (Hari Ini)
    yellow: "bg-[#F0E68C] text-black hover:bg-[#e6d863]",  // Kuning (Kemarin)
    blue: "bg-[#AFEEEE] text-black hover:bg-[#90e0e0]",    // Biru Muda (Semua)
  };

  return (
    <button 
      className={`${variants[variant]} rounded-[6px] font-[600] flex items-center justify-center gap-2 transition-all active:scale-95 ${className}`}
      {...props}
    >
      {Icon && <Icon className="text-lg" />}
      {label}
    </button>
  );
};
export default ActionButton;