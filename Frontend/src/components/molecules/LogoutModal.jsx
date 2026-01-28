import { BiError } from "react-icons/bi";

const LogoutModal = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-[1060] flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white rounded-[20px] p-6 max-w-[320px] w-full text-center shadow-2xl animate-[zoomIn_0.3s_ease-out]">
        <div className="text-[#DC3545] mb-3 flex justify-center">
          <BiError size={70} />
        </div>
        <h3 className="font-bold text-[1.2rem] mb-2 text-slate-800">Konfirmasi keluar</h3>
        <p className="text-slate-500 mb-6 text-sm">Apakah Anda yakin ingin keluar dari sistem?</p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={onClose}
            className="bg-[#64748B] text-white rounded-lg font-semibold px-5 py-1.5 hover:bg-[#475569] transition-all"
          >
            Batal
          </button>
          <button 
            onClick={onConfirm}
            className="bg-[#DC3545] text-white rounded-lg font-semibold px-5 py-1.5 hover:bg-[#B91C1C] transition-all"
          >
            Keluar
          </button>
        </div>
      </div>
    </div>
  );
};
export default LogoutModal;