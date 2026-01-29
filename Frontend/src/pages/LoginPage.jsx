import { useState } from "react";
import { BiUserCircle, BiPhone, BiLockAlt, BiLogInCircle } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BannerPanel from "../components/organisms/BannerPanel";
import InputField from "../components/molecules/InputField";

// LOGIKA: Import gambar dari folder assets
import bgLocation from "../assets/loc-mis.jpeg";

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [phone, setPhone] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        username: username,
        password: password
      });

      localStorage.setItem("token", response.data.access);
      localStorage.setItem("user", JSON.stringify({
        username: response.data.username,
        role: response.data.role,
        name: response.data.name,
        is_default: response.data.is_default,
        is_profile_complete: response.data.is_profile_complete
      }));

      navigate("/beranda");
    } catch (err) {
      setError("Username atau password salah!");
      console.error(err);
    }
  };

  const handleChangePhone = (e) => {
    const value = e.target.value;
    const onlyNums = value.replace(/[^0-9]/g, "");
    setPhone(onlyNums);
  };

  const WA_NUMBER = "6289676440508";
  const WA_TEXT = "Assalamualaikum Admin Risalah MIS, saya (wali murid/guru) mau tanya apakah diperbolehkan untuk login? Jika boleh, saya mau minta ditambahkan sebagai user baru ";
  const WA_URL = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(WA_TEXT)}`;

  return (
    // LOGIKA: Container utama dibuat relative dan overflow-hidden untuk efek blur background
    <div className="relative min-h-screen flex items-center justify-center p-4 font-poppins text-[#0A2540] overflow-hidden">
      
      {/* LAYER 1: Background Image dengan Blur */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat blur-[4px] scale-105"
        style={{ backgroundImage: `url(${bgLocation})` }}
      ></div>

      {/* LAYER 2: Dark Overlay agar Form lebih menonjol */}
      <div className="absolute inset-0 z-10 bg-black/20"></div>

      {/* LAYER 3: Login Card (Struktur desain tetap sama) */}
      <div className="relative z-20 bg-white/95 backdrop-blur-sm rounded-[24px] overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.3)] w-full max-w-[500px] lg:max-w-[1100px] flex flex-col lg:flex-row min-h-[650px]">
        
        <BannerPanel />

        <div className="w-full lg:w-1/2 p-8 md:p-10 lg:p-20 flex flex-col justify-center bg-white">
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-[1.8rem] lg:text-[2.2rem] font-[800] mb-2 leading-tight text-[#0A2540]">Login Akun</h2>
            <p className="text-slate-500 text-sm">Silakan masuk untuk mengakses system hafalan santri</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-1">
            {error && <p className="text-red-500 text-xs font-bold mb-2 ml-1">{error}</p>}

            <InputField 
              label="Nama Pengguna" 
              icon={BiUserCircle} 
              placeholder="Masukkan Username NISN/NIP" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
            <InputField 
              label="No Telp" 
              icon={BiPhone} 
              placeholder="Masukkan Nomor Telephone" 
              type="text" 
              value={phone} 
              onChange={handleChangePhone} 
              required 
            />
            <InputField 
              label="Kata Sandi" 
              icon={BiLockAlt} 
              placeholder="Kata Sandi" 
              isPassword 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
            
            <button type="submit" className="w-full bg-gradient-to-r from-[#0D9488] to-[#0A2540] text-white font-[700] py-[12px] rounded-[12px] mt-6 hover:-translate-y-[3px] hover:shadow-[0_10px_20px_rgba(13,148,136,0.3)] transition-all flex items-center justify-center gap-2 text-[1.1rem]">
              Login <BiLogInCircle className="text-xl" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#64748b]">
            Belum punya akun?{" "}
            <a href={WA_URL} target="_blank" rel="noreferrer" className="text-[#0D9488] font-[700] hover:underline">
              Hubungi Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;