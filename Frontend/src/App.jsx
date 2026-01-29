import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import BerandaPage from "./pages/BerandaPage";
import SettingProfilePage from "./pages/SettingProfilePage";
import LaporanPage from "./pages/LaporanPage";
import InputHafalanPage from "./pages/InputHafalanPage";
import RiwayatHafalanPage from "./pages/RiwayatHafalanPage";
import KelolaKelasPage from "./pages/KelolaKelasPage";
import DataSiswaPage from "./pages/DataSiswaPage";
import DataGuruPage from "./pages/DataGuruPage";
import ManagementUserPage from "./pages/ManagementUserPage";

// --- IMPORT HALAMAN WA GATEWAY ---
import KoneksiPage from "./pages/wa/KoneksiPage";
import KirimPesanPage from "./pages/wa/KirimPesanPage";
import RiwayatPesanPage from "./pages/wa/RiwayatPesanPage";
import TemplateChat from "./pages/wa/TemplateChat";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        {/* Akses: Semua Role */}
        <Route path="/beranda" element={<ProtectedRoute allowedRoles={['ADMIN', 'GURU', 'WALI_MURID']}><BerandaPage /></ProtectedRoute>} />
        <Route path="/laporan" element={<ProtectedRoute allowedRoles={['ADMIN', 'GURU', 'WALI_MURID']}><LaporanPage /></ProtectedRoute>} />
        <Route path="/setting-profile" element={<ProtectedRoute allowedRoles={['ADMIN', 'GURU', 'WALI_MURID']}><SettingProfilePage /></ProtectedRoute>} />

        {/* Akses: Admin & Guru */}
        <Route path="/setor/input" element={<ProtectedRoute allowedRoles={['ADMIN', 'GURU']}><InputHafalanPage /></ProtectedRoute>} />
        <Route path="/setor/riwayat" element={<ProtectedRoute allowedRoles={['ADMIN', 'GURU']}><RiwayatHafalanPage /></ProtectedRoute>} />
        <Route path="/kelas" element={<ProtectedRoute allowedRoles={['ADMIN', 'GURU']}><KelolaKelasPage /></ProtectedRoute>} />
        <Route path="/data-siswa" element={<ProtectedRoute allowedRoles={['ADMIN', 'GURU']}><DataSiswaPage /></ProtectedRoute>} />

        {/* Akses: Khusus Admin Saja */}
        <Route path="/data-guru" element={<ProtectedRoute allowedRoles={['ADMIN']}><DataGuruPage /></ProtectedRoute>} />
        <Route path="/management-user" element={<ProtectedRoute allowedRoles={['ADMIN']}><ManagementUserPage /></ProtectedRoute>} />

        {/* --- ROUTE WA GATEWAY (KHUSUS ADMIN) --- */}
        <Route path="/wa/koneksi" element={<ProtectedRoute allowedRoles={['ADMIN']}><KoneksiPage /></ProtectedRoute>} />
        <Route path="/wa/kirim" element={<ProtectedRoute allowedRoles={['ADMIN']}><KirimPesanPage /></ProtectedRoute>} />
        <Route path="/wa/riwayat" element={<ProtectedRoute allowedRoles={['ADMIN']}><RiwayatPesanPage /></ProtectedRoute>} />
        <Route path="/wa/template" element={<ProtectedRoute allowedRoles={['ADMIN']}><TemplateChat /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;