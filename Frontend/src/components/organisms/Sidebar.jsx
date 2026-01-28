import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LogoutModal from "../molecules/LogoutModal";
import { 
  BiHome, BiBarChartSquare, BiCheckSquare, BiLayer, 
  BiCog, BiChevronDown, BiUser, BiIdCard, BiGroup, BiLogOut,
  BiCast, BiDevices, BiEnvelope, BiTimeFive, BiChat
} from "react-icons/bi";
import logoMIS from "../../assets/logo.png"; 

const Sidebar = ({ isCollapsed, isActive }) => {
  const [isInputDataOpen, setInputDataOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isWAOpen, setWAOpen] = useState(false); 
  
  const location = useLocation();
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("user")) || { role: "" };
  const userRole = userData.role;

  useEffect(() => {
    if (isCollapsed) {
      setInputDataOpen(false);
      setWAOpen(false);
    }
  }, [isCollapsed]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogoutModal(false);
    navigate("/"); 
  };

  const menuItems = [
    { path: "/beranda", label: "Beranda", icon: BiHome, roles: ["ADMIN", "GURU", "WALI_MURID"] },
    { path: "/laporan", label: "Laporan Progress", icon: BiBarChartSquare, roles: ["ADMIN", "GURU", "WALI_MURID"] },
    { path: "/setor", label: "Setor Hafalan", icon: BiCheckSquare, roles: ["ADMIN", "GURU"] },
    { path: "/kelas", label: "Kelola Kelas", icon: BiLayer, roles: ["ADMIN", "GURU"] },
  ];

  const subMenuItems = [
    { path: "/data-siswa", label: "Data Siswa", icon: BiUser, roles: ["ADMIN", "GURU"] },
    { path: "/data-guru", label: "Data Guru", icon: BiIdCard, roles: ["ADMIN"] },
  ];

  const waSubMenuItems = [
    { path: "/wa/koneksi", label: "Koneksi Perangkat", icon: BiDevices },
    { path: "/wa/kirim", label: "Kirim Pesan", icon: BiEnvelope },
    { path: "/wa/template", label: "Template Chat", icon: BiChat },
  ];

  return (
    <>
      {showLogoutModal && <LogoutModal onClose={() => setShowLogoutModal(false)} onConfirm={handleLogout} />}

      <aside className={`fixed left-0 top-0 h-screen bg-[#1B4332] text-white z-[1050] transition-all duration-300 ease-in-out shadow-xl font-poppins
        ${isCollapsed ? "w-[80px]" : "w-[260px]"} 
        ${isActive ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        
        <div className={`h-[70px] flex items-center justify-center border-b border-white/10 transition-all duration-300 overflow-hidden ${isCollapsed ? "p-2 gap-0" : "p-5 gap-3"}`}>
          <img src={logoMIS} alt="MIS Logo" className={`shrink-0 transition-all duration-300 object-contain ${isCollapsed ? "w-[40px] h-[40px]" : "w-[32px] h-[32px]"}`} />
          <span className={`font-bold text-[1.25rem] whitespace-nowrap overflow-hidden transition-all duration-300 origin-left ${isCollapsed ? "opacity-0 w-0 scale-95" : "opacity-100 w-auto scale-100"}`}>
            Mutabaah MIS
          </span>
        </div>

        {/* PERBAIKAN: Menambahkan style untuk menyembunyikan scrollbar di semua browser */}
        <nav 
          className={`px-0 space-y-0.5 overflow-y-auto overflow-x-hidden ${isCollapsed ? "mt-4" : "mt-1"} max-h-[calc(100vh-80px)]`}
          style={{
            scrollbarWidth: 'none', // Untuk Firefox
            msOverflowStyle: 'none', // Untuk Internet Explorer/Edge
          }}
        >
          {/* CSS tambahan untuk browser berbasis Webkit (Chrome/Safari/Opera) */}
          <style>
            {`
              nav::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
          
          {menuItems.filter(item => item.roles.includes(userRole)).map((item) => (
            <Link key={item.path} to={item.path} title={isCollapsed ? item.label : ""}
              className={`flex items-center gap-3 px-5 py-3 transition-all whitespace-nowrap relative group border-l-[4px]
                ${isCollapsed ? "justify-center" : ""} 
                ${location.pathname === item.path ? "bg-black/20 text-white border-[#2ECC71]" : "text-white/90 hover:bg-black/10 hover:text-white border-transparent"}`}>
              <item.icon className="text-[1.3rem] shrink-0" />
              <span className={`text-[0.95rem] font-medium transition-all duration-200 ${isCollapsed ? "opacity-0 w-0 hidden absolute" : "opacity-100 w-auto relative"}`}>
                {item.label}
              </span>
            </Link>
          ))}

          {/* MENU: INPUT DATA */}
          {["ADMIN", "GURU"].includes(userRole) && (
            <div className="pt-2">
              <button onClick={() => !isCollapsed && setInputDataOpen(!isInputDataOpen)} 
                className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-black/10 text-white/90 transition-all whitespace-nowrap border-l-[4px] border-transparent ${isCollapsed ? "justify-center cursor-default" : "cursor-pointer"}`}>
                <BiCog className="text-[1.3rem] shrink-0" />
                <div className={`flex items-center flex-1 transition-all duration-200 ${isCollapsed ? "opacity-0 w-0 hidden absolute" : "opacity-100 w-auto relative"}`}>
                  <span className="text-[0.95rem] font-medium">Input Data</span>
                  <BiChevronDown className={`ms-auto text-xl transition-transform duration-300 ${isInputDataOpen ? "rotate-180" : ""}`} />
                </div>
              </button>
              
              {!isCollapsed && isInputDataOpen && (
                <div className="py-1">
                  {subMenuItems
                    .filter(sub => sub.roles.includes(userRole))
                    .map((sub) => {
                      const isActive = location.pathname === sub.path;
                      return (
                        <Link key={sub.path} to={sub.path}
                          className={`flex items-center gap-3 pl-10 pr-5 py-3 text-[0.9rem] transition-all duration-200 border-l-[4px]
                            ${isActive ? "bg-black/15 text-white border-[#2ecc71] font-semibold" : "text-white/80 hover:bg-black/10 hover:text-white border-transparent"}
                          `}
                        >
                          <sub.icon className="text-[1.1rem] shrink-0" />
                          {sub.label}
                        </Link>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* MENU: MANAGEMENT USER */}
          {userRole === "ADMIN" && (
            <Link to="/management-user" title={isCollapsed ? "Management User" : ""} 
              className={`flex items-center gap-3 px-5 py-3.5 transition-all duration-200 whitespace-nowrap border-l-[4px]
                ${location.pathname === "/management-user" ? "bg-black/15 text-white border-[#2ecc71] font-semibold" : "text-white/80 hover:bg-black/10 hover:text-white border-transparent"} 
                ${isCollapsed ? "justify-center" : ""}`}
            >
              <BiGroup className={`text-[1.35rem] shrink-0 ${location.pathname === "/management-user" ? "text-[#2ecc71]" : ""}`} /> 
              <span className={`text-[0.95rem] transition-all ${isCollapsed ? "hidden absolute" : "block relative"}`}>
                Management User
              </span>
            </Link>
          )}

          {/* MENU: RIWAYAT PESAN */}
          {userRole === "ADMIN" && (
            <Link to="/wa/riwayat" title={isCollapsed ? "Riwayat Pesan" : ""} 
              className={`flex items-center gap-3 px-5 py-3.5 transition-all duration-200 whitespace-nowrap border-l-[4px]
                ${location.pathname === "/wa/riwayat" ? "bg-black/15 text-white border-[#2ecc71] font-semibold" : "text-white/80 hover:bg-black/10 hover:text-white border-transparent"} 
                ${isCollapsed ? "justify-center" : ""}`}
            >
              <BiTimeFive className={`text-[1.35rem] shrink-0 ${location.pathname === "/wa/riwayat" ? "text-[#2ecc71]" : ""}`} /> 
              <span className={`text-[0.95rem] transition-all ${isCollapsed ? "hidden absolute" : "block relative"}`}>
                Riwayat Pesan
              </span>
            </Link>
          )}

          {/* MENU: WA GATEWAY */}
          {userRole === "ADMIN" && (
            <div className="pt-2">
              <button onClick={() => !isCollapsed && setWAOpen(!isWAOpen)} 
                className={`w-full flex items-center gap-3 px-5 py-3.5 hover:bg-black/10 text-white/90 transition-all whitespace-nowrap border-l-[4px] border-transparent ${isCollapsed ? "justify-center cursor-default" : "cursor-pointer"}`}>
                <BiCast className="text-[1.35rem] shrink-0" />
                <div className={`flex items-center flex-1 transition-all duration-200 ${isCollapsed ? "opacity-0 w-0 hidden absolute" : "opacity-100 w-auto relative"}`}>
                  <span className="text-[0.95rem] font-medium">WA Gateway</span>
                  <BiChevronDown className={`ms-auto text-xl transition-transform duration-300 ${isWAOpen ? "rotate-180" : ""}`} />
                </div>
              </button>
              
              {!isCollapsed && isWAOpen && (
                <div className="py-1">
                  {waSubMenuItems.map((sub) => {
                    const isActive = location.pathname === sub.path;
                    return (
                      <Link key={sub.path} to={sub.path}
                        className={`flex items-center gap-3 pl-10 pr-5 py-3 text-[0.9rem] transition-all duration-200 border-l-[4px]
                          ${isActive ? "bg-black/15 text-white border-[#2ecc71] font-semibold" : "text-white/80 hover:bg-black/10 hover:text-white border-transparent"}
                        `}
                      >
                        <sub.icon className="text-[1.1rem] shrink-0" />
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          
          <div className="pt-4 pb-10">
             <button onClick={() => setShowLogoutModal(true)} className={`w-full flex items-center gap-3 px-5 py-3 transition-colors whitespace-nowrap text-left text-white/90 hover:text-[#EF4444] hover:bg-[#EF4444]/10 border-l-[4px] border-transparent ${isCollapsed ? "justify-center" : ""}`}>
               <BiLogOut className="text-[1.3rem] shrink-0" /> 
               <span className={`text-[0.95rem] font-medium transition-all ${isCollapsed ? "hidden absolute" : "block relative"}`}>Keluar</span>
             </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;