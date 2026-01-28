const ProfileButton = ({ icon: Icon, label, color, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="text-white border-none px-[20px] py-2.5 rounded-[6px] font-[500] flex items-center justify-center gap-2 text-[0.95rem] transition-all hover:opacity-90 hover:-translate-y-[2px] shadow-sm w-full sm:w-auto"
      style={{ backgroundColor: color }}
    >
      <Icon className="text-lg" /> {label}
    </button>
  );
};
export default ProfileButton;