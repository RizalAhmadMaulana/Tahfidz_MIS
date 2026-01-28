const Input = ({ type = "text", placeholder, ...props }) => (
  <input
    type={type}
    placeholder={placeholder}
    className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-[12px] p-[12px_15px_12px_45px] h-[52px] font-[500] focus:bg-white focus:border-2 focus:border-[#0D9488] focus:shadow-[0_4px_12px_rgba(13,148,136,0.1)] outline-none transition-all text-sm"
    {...props}
  />
);
export default Input;