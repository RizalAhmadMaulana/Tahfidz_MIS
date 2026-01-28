const DashboardInput = ({ label, type = "text", options, ...props }) => {
  return (
    <div className="w-full">
      {label && <label className="block font-[600] text-[#1a1a1a] mb-2 text-[0.95rem]">{label}</label>}
      
      {type === "select" ? (
        <select 
          className="w-full bg-[#f8fafc] border border-gray-300 rounded-[6px] px-4 py-2.5 font-[500] h-[45px] outline-none focus:border-[#1B4332] transition-colors"
          {...props}
        >
          {options?.map((opt, idx) => {
            // LOGIKA PERBAIKAN: Cek apakah opt itu string atau object {label, value}
            const isObj = typeof opt === 'object' && opt !== null;
            const finalValue = isObj ? opt.value : opt;
            const finalLabel = isObj ? opt.label : opt;
            
            return (
              <option key={idx} value={finalValue}>
                {finalLabel}
              </option>
            );
          })}
        </select>
      ) : (
        <input 
          type={type} 
          className="w-full bg-[#f8fafc] border border-gray-300 rounded-[6px] px-4 py-2.5 font-[500] h-[45px] outline-none focus:border-[#1B4332] transition-colors"
          {...props}
        />
      )}
    </div>
  );
};
export default DashboardInput;