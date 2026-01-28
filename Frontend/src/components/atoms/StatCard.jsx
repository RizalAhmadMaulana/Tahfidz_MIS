const StatCard = ({ title, value, bgColor }) => {
  return (
    <div 
      className="rounded-lg text-white text-center overflow-hidden shadow-[0_4px_6px_rgba(0,0,0,0.1)] h-full flex flex-col" 
      style={{ backgroundColor: bgColor }}
    >
      <div className="bg-black/15 py-2.5 px-3 font-[600] text-[0.9rem]">
        {title}
      </div>
      <div className="p-5 text-[1.6rem] font-[700]">
        {value}
      </div>
    </div>
  );
};

export default StatCard;