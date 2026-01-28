import { useState } from "react";
import Sidebar from "../organisms/Sidebar";
import Navbar from "../organisms/Navbar";
import { BiCopyright } from "react-icons/bi"; // Tambah ikon copyright

const DashboardLayout = ({ children, title }) => {
  const [isCollapsed, setCollapsed] = useState(false);
  const [isMobileActive, setMobileActive] = useState(false);

  return (
    <div className="min-h-screen bg-[#D1D5DB] font-poppins flex flex-col">
      <Sidebar isCollapsed={isCollapsed} isActive={isMobileActive} />
      
      {isMobileActive && (
        <div className="fixed inset-0 bg-black/50 z-[1040] lg:hidden" onClick={() => setMobileActive(false)}></div>
      )}

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isCollapsed ? "lg:ms-[80px]" : "lg:ms-[260px]"}`}>
        
        <Navbar 
            onToggleSidebar={() => setCollapsed(!isCollapsed)} 
            onToggleMobile={() => setMobileActive(!isMobileActive)} 
        />

        {/* Main Content (Flex-grow agar footer terdorong ke bawah jika konten sedikit) */}
        <main className="p-6 flex-grow">
          <h2 className="text-[1.8rem] font-bold mb-6 text-slate-800 tracking-tight">{title}</h2>
          {children}
        </main>

        {/* Footer Persis HTML */}
        <footer className="py-5 text-center text-[#718096] text-[0.85rem] border-t border-black/10 bg-[#D1D5DB]">
          <span className="flex items-center justify-center gap-1">
            <BiCopyright /> 2026 Mutabaah Digital MIS. All right reserved
          </span>
        </footer>

      </div>
    </div>
  );
};

export default DashboardLayout;