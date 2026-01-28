import { useState } from "react";
import { BiHide, BiShow } from "react-icons/bi";
import Input from "../atoms/Input";

const InputField = ({ label, icon: Icon, type, isPassword, ...props }) => {
  const [show, setShow] = useState(false);
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div className="mb-4 relative">
      <label className="block font-[600] text-[#475569] mb-2 text-[0.95rem]">{label}</label>
      <div className="relative flex items-center group">
        <Icon className="absolute left-[15px] text-[#0D9488] text-[1.1rem] z-[5] transition-colors" />
        <Input type={inputType} {...props} />
        {isPassword && (
          <button type="button" onClick={() => setShow(!show)} className="absolute right-[15px] text-[#94a3b8] text-xl z-[5] hover:text-[#0D9488]">
            {show ? <BiShow /> : <BiHide />}
          </button>
        )}
      </div>
    </div>
  );
};
export default InputField;