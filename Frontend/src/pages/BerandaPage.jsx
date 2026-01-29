import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/templates/DashboardLayout";
import StatCard from "../components/atoms/StatCard";
import WelcomeModal from "../components/molecules/WelcomeModal";
import { Doughnut, Bar } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement 
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const BerandaPage = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [periode, setPeriode] = useState("Mingguan");
  const [loading, setLoading] = useState(true);
  
  const [data, setData] = useState({
    cards: {
      total_siswa: 0, total_guru: 0, total_kelas: 0,
      best_student: { name: "-", count: "0 Surah" }
    },
    charts: {
      nilai: [0, 0, 0, 0],
      progress: { labels: [], data: [] }
    }
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`https://laporan.mentariku.org/api/academic/dashboard/summary/?periode=${periode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Gagal load dashboard", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    /** * LOGIKA BARU:
     * Tampilkan modal untuk SEMUA user tanpa filter status akun (is_default/is_profile_complete).
     * Modal hanya akan muncul jika belum pernah di-dismiss (ditutup) di sesi browser ini.
     */
    if (!sessionStorage.getItem("welcome_dismissed")) {
      setShowWelcome(true);
    }

    fetchDashboardData();
  }, [periode]);

  // Fungsi untuk menutup modal sementara
  const handleCloseWelcome = () => {
    setShowWelcome(false);
    // Simpan status ke sessionStorage agar tidak muncul lagi selama tab/sesi masih aktif
    sessionStorage.setItem("welcome_dismissed", "true");
  };

  // --- Konfigurasi Chart Data ---
  const doughnutData = {
    labels: ['A - Sangat Baik', 'B - Baik', 'C - Cukup', 'D - Kurang'],
    datasets: [{
      data: data.charts.nilai,
      backgroundColor: ['#22C55E', '#3b82f6', '#fbbf24', '#f87171'],
      borderWidth: 0
    }]
  };

  const barData = {
    labels: data.charts.progress.labels,
    datasets: [{
      label: 'Jumlah Hafalan (Surah)',
      data: data.charts.progress.data,
      backgroundColor: '#3B82F6',
      borderRadius: 5,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  return (
    <DashboardLayout title="Beranda">
      {/* WelcomeModal kini muncul untuk semua role tanpa filter */}
      {showWelcome && <WelcomeModal onClose={handleCloseWelcome} />}

      {/* GRID KARTU STATISTIK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Siswa" value={`${data.cards.total_siswa} Siswa`} bgColor="#4A90E2" />
        <StatCard title="Total Guru" value={`${data.cards.total_guru} Guru`} bgColor="#9B51E0" />
        <StatCard title="Total Kelas" value={`${data.cards.total_kelas} kelas`} bgColor="#F2994A" />
        <StatCard 
          title="Progress Terbaik" 
          value={
            <div className="flex flex-col items-center">
              <span className="text-[1.4rem] leading-tight">{data.cards.best_student.name}</span>
              <span className="text-[1.1rem]">({data.cards.best_student.count})</span>
            </div>
          } 
          bgColor="#27AE60"
        />
      </div>

      {/* FILTER PERIODE */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8 w-full">
        <div className="bg-[#3B82F6] text-white p-3 text-[1.1rem] font-[600] text-left px-4">
          Pilih Periode Statistik
        </div>
        <select 
          className="w-full p-3 bg-[#E5E7EB] border-none outline-none text-[#1a1a1a] font-medium cursor-pointer appearance-none"
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
          style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
        >
          <option value="Mingguan">Mingguan</option>
          <option value="Bulanan">Bulanan</option>
          <option value="Semester">Semester (6 Bulan)</option>
        </select>
      </div>

      {/* DIAGRAM GRAFIK */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
        <div className="bg-white rounded-lg overflow-hidden shadow-sm flex flex-col h-[450px]">
          <div className="bg-[#EF4444] text-white p-3 font-[600] text-[1.1rem] px-4">Diagram Grafik Nilai</div>
          <div className="p-4 flex-1 flex items-center justify-center">
            {loading ? <p className="text-slate-400">Memuat data...</p> : <Doughnut data={doughnutData} options={chartOptions} />}
          </div>
        </div>

        <div className="bg-white rounded-lg overflow-hidden shadow-sm flex flex-col h-[450px]">
          <div className="bg-[#22C55E] text-white p-3 font-[600] text-[1.1rem] px-4">Diagram Progress Hafalan</div>
          <div className="p-4 flex-1 flex items-center justify-center">
            {loading ? <p className="text-slate-400">Memuat data...</p> : <Bar data={barData} options={chartOptions} />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BerandaPage;