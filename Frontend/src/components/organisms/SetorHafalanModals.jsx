import { useState, useEffect } from "react";
import axios from "axios";
import { 
  BiSave, 
  BiTrash, 
  BiFile, 
  BiPlus, 
  BiPencil, 
  BiX,
  BiCheck,
  BiLogoWhatsapp
} from "react-icons/bi";

// --- DATABASE LENGKAP AL-QURAN (JUZ 1 - 30) ---
const QURAN_DATA = [
  // JUZ 1
  { name: "Al-Fatihah", juz: "1", total: 7 },
  { name: "Al-Baqarah", juz: "1", total: 286 },
  // JUZ 2
  { name: "Al-Baqarah", juz: "2", total: 286 },
  // JUZ 3
  { name: "Al-Baqarah", juz: "3", total: 286 },
  { name: "Ali 'Imran", juz: "3", total: 200 },
  // JUZ 4
  { name: "Ali 'Imran", juz: "4", total: 200 },
  { name: "An-Nisa'", juz: "4", total: 176 },
  // JUZ 5
  { name: "An-Nisa'", juz: "5", total: 176 },
  // JUZ 6
  { name: "An-Nisa'", juz: "6", total: 176 },
  { name: "Al-Ma'idah", juz: "6", total: 120 },
  // JUZ 7
  { name: "Al-Ma'idah", juz: "7", total: 120 },
  { name: "Al-An'am", juz: "7", total: 165 },
  // JUZ 8
  { name: "Al-An'am", juz: "8", total: 165 },
  { name: "Al-A'raf", juz: "8", total: 206 },
  // JUZ 9
  { name: "Al-A'raf", juz: "9", total: 206 },
  { name: "Al-Anfal", juz: "9", total: 75 },
  // JUZ 10
  { name: "Al-Anfal", juz: "10", total: 75 },
  { name: "At-Taubah", juz: "10", total: 129 },
  // JUZ 11
  { name: "At-Taubah", juz: "11", total: 129 },
  { name: "Yunus", juz: "11", total: 109 },
  { name: "Hud", juz: "11", total: 123 },
  // JUZ 12
  { name: "Hud", juz: "12", total: 123 },
  { name: "Yusuf", juz: "12", total: 111 },
  // JUZ 13
  { name: "Yusuf", juz: "13", total: 111 },
  { name: "Ar-Ra'd", juz: "13", total: 43 },
  { name: "Ibrahim", juz: "13", total: 52 },
  // JUZ 14
  { name: "Al-Hijr", juz: "14", total: 99 },
  { name: "An-Nahl", juz: "14", total: 128 },
  // JUZ 15
  { name: "Al-Isra'", juz: "15", total: 111 },
  { name: "Al-Kahf", juz: "15", total: 110 },
  // JUZ 16
  { name: "Al-Kahf", juz: "16", total: 110 },
  { name: "Maryam", juz: "16", total: 98 },
  { name: "Ta-Ha", juz: "16", total: 135 },
  // JUZ 17
  { name: "Al-Anbiya'", juz: "17", total: 112 },
  { name: "Al-Hajj", juz: "17", total: 78 },
  // JUZ 18
  { name: "Al-Mu'minun", juz: "18", total: 118 },
  { name: "An-Nur", juz: "18", total: 64 },
  { name: "Al-Furqan", juz: "18", total: 77 },
  // JUZ 19
  { name: "Al-Furqan", juz: "19", total: 77 },
  { name: "Asy-Syu'ara'", juz: "19", total: 227 },
  { name: "An-Naml", juz: "19", total: 93 },
  // JUZ 20
  { name: "An-Naml", juz: "20", total: 93 },
  { name: "Al-Qasas", juz: "20", total: 88 },
  { name: "Al-'Ankabut", juz: "20", total: 69 },
  // JUZ 21
  { name: "Al-'Ankabut", juz: "21", total: 69 },
  { name: "Ar-Rum", juz: "21", total: 60 },
  { name: "Luqman", juz: "21", total: 34 },
  { name: "As-Sajdah", juz: "21", total: 30 },
  { name: "Al-Ahzab", juz: "21", total: 73 },
  // JUZ 22
  { name: "Al-Ahzab", juz: "22", total: 73 },
  { name: "Saba'", juz: "22", total: 54 },
  { name: "Fatir", juz: "22", total: 45 },
  { name: "Ya-Sin", juz: "22", total: 83 },
  // JUZ 23
  { name: "Ya-Sin", juz: "23", total: 83 },
  { name: "As-Saffat", juz: "23", total: 182 },
  { name: "Sad", juz: "23", total: 88 },
  { name: "Az-Zumar", juz: "23", total: 75 },
  // JUZ 24
  { name: "Az-Zumar", juz: "24", total: 75 },
  { name: "Ghafir", juz: "24", total: 85 },
  { name: "Fussilat", juz: "24", total: 54 },
  // JUZ 25
  { name: "Fussilat", juz: "25", total: 54 },
  { name: "Asy-Syura", juz: "25", total: 53 },
  { name: "Az-Zukhruf", juz: "25", total: 89 },
  { name: "Ad-Dukhan", juz: "25", total: 59 },
  { name: "Al-Jasiyah", juz: "25", total: 37 },
  // JUZ 26
  { name: "Al-Ahqaf", juz: "26", total: 35 },
  { name: "Muhammad", juz: "26", total: 38 },
  { name: "Al-Fath", juz: "26", total: 29 },
  { name: "Al-Hujurat", juz: "26", total: 18 },
  { name: "Qaf", juz: "26", total: 45 },
  { name: "Az-Zariyat", juz: "26", total: 60 },
  // JUZ 27
  { name: "Az-Zariyat", juz: "27", total: 60 },
  { name: "At-Tur", juz: "27", total: 49 },
  { name: "An-Najm", juz: "27", total: 62 },
  { name: "Al-Qamar", juz: "27", total: 55 },
  { name: "Ar-Rahman", juz: "27", total: 78 },
  { name: "Al-Waqi'ah", juz: "27", total: 96 },
  { name: "Al-Hadid", juz: "27", total: 29 },
  // JUZ 28
  { name: "Al-Mujadilah", juz: "28", total: 22 },
  { name: "Al-Hasyr", juz: "28", total: 24 },
  { name: "Al-Mumtahanah", juz: "28", total: 13 },
  { name: "As-Saff", juz: "28", total: 14 },
  { name: "Al-Jumu'ah", juz: "28", total: 11 },
  { name: "Al-Munafiqun", juz: "28", total: 11 },
  { name: "At-Tagabun", juz: "28", total: 18 },
  { name: "At-Talaq", juz: "28", total: 12 },
  { name: "At-Tahrim", juz: "28", total: 12 },
  // JUZ 29
  { name: "Al-Mulk", juz: "29", total: 30 },
  { name: "Al-Qalam", juz: "29", total: 52 },
  { name: "Al-Haqqah", juz: "29", total: 52 },
  { name: "Al-Ma'arij", juz: "29", total: 44 },
  { name: "Nuh", juz: "29", total: 28 },
  { name: "Al-Jinn", juz: "29", total: 28 },
  { name: "Al-Muzzammil", juz: "29", total: 20 },
  { name: "Al-Muddassir", juz: "29", total: 56 },
  { name: "Al-Qiyamah", juz: "29", total: 40 },
  { name: "Al-Insan", juz: "29", total: 31 },
  { name: "Al-Mursalat", juz: "29", total: 50 },
  // JUZ 30
  { name: "An-Naba'", juz: "30", total: 40 },
  { name: "An-Nazi'at", juz: "30", total: 46 },
  { name: "'Abasa", juz: "30", total: 42 },
  { name: "At-Takwir", juz: "30", total: 29 },
  { name: "Al-Infitar", juz: "30", total: 19 },
  { name: "Al-Mutaffifin", juz: "30", total: 36 },
  { name: "Al-Insyiqaq", juz: "30", total: 25 },
  { name: "Al-Buruj", juz: "30", total: 22 },
  { name: "At-Tariq", juz: "30", total: 17 },
  { name: "Al-A'la", juz: "30", total: 19 },
  { name: "Al-Ghasyiyah", juz: "30", total: 26 },
  { name: "Al-Fajr", juz: "30", total: 30 },
  { name: "Al-Balad", juz: "30", total: 20 },
  { name: "Asy-Syams", juz: "30", total: 15 },
  { name: "Al-Lail", juz: "30", total: 21 },
  { name: "Ad-Duha", juz: "30", total: 11 },
  { name: "Al-Insyirah", juz: "30", total: 8 },
  { name: "At-Tin", juz: "30", total: 8 },
  { name: "Al-'Alaq", juz: "30", total: 19 },
  { name: "Al-Qadr", juz: "30", total: 5 },
  { name: "Al-Bayyinah", juz: "30", total: 8 },
  { name: "Az-Zalzalah", juz: "30", total: 8 },
  { name: "Al-'Adiyat", juz: "30", total: 11 },
  { name: "Al-Qari'ah", juz: "30", total: 11 },
  { name: "At-Takatsur", juz: "30", total: 8 },
  { name: "Al-'Asr", juz: "30", total: 3 },
  { name: "Al-Humazah", juz: "30", total: 9 },
  { name: "Al-Fil", juz: "30", total: 5 },
  { name: "Quraisy", juz: "30", total: 4 },
  { name: "Al-Ma'un", juz: "30", total: 7 },
  { name: "Al-Kautsar", juz: "30", total: 3 },
  { name: "Al-Kafirun", juz: "30", total: 6 },
  { name: "An-Nasr", juz: "30", total: 3 },
  { name: "Al-Lahab", juz: "30", total: 5 },
  { name: "Al-Ikhlas", juz: "30", total: 4 },
  { name: "Al-Falaq", juz: "30", total: 5 },
  { name: "An-Nas", juz: "30", total: 6 },
];

const ModalInput = ({ label, type = "text", value, options, readOnly, placeholder, onChange, disabled, ...props }) => {
  const baseClass = `w-full bg-[#D9D9D9] border-none rounded-[4px] px-4 py-2.5 font-[500] h-[45px] outline-none text-slate-800 placeholder-slate-500 transition-all focus:ring-2 focus:ring-[#5294A9]/50 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  return (
    <div className="w-full">
      {label && <label className="block font-[700] text-[#1a1a1a] mb-2 text-[0.95rem]">{label}</label>}
      {type === "select" ? (
        <select className={baseClass} value={value} onChange={onChange} disabled={disabled} {...props}>
          {options?.map((opt, idx) => {
            const optValue = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return <option key={idx} value={optValue}>{optLabel}</option>
          })}
        </select>
      ) : (
        <input type={type} className={baseClass} value={value} onChange={onChange} readOnly={readOnly} placeholder={placeholder} disabled={disabled} {...props} />
      )}
    </div>
  );
};

const ModalWrapper = ({ title, icon: Icon, onClose, children, size = "max-w-lg" }) => (
  <div className="fixed inset-0 bg-black/50 z-[1070] flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
    <div className={`bg-white rounded-[15px] w-full ${size} shadow-lg flex flex-col max-h-[95vh] animate-[zoomIn_0.3s_ease-out]`}>
      <div className="border-b border-black px-6 py-4 flex justify-between items-center shrink-0">
        <h5 className="font-[700] text-[1.2rem] flex items-center gap-2 text-slate-800">{Icon && <Icon className="text-xl" />} {title}</h5>
        <button onClick={onClose} className="text-3xl hover:text-red-500 transition-colors leading-none">&times;</button>
      </div>
      <div className="p-6 overflow-y-auto custom-scrollbar">{children}</div>
    </div>
  </div>
);

// --- DATA KRITERIA ADAB ---
const ADAB_LIST = [
  {
    key: "adab_1", 
    label: "1. Integritas dan Kejujuran",
    items: [
      "Sering tidak jujur, manipulatif, dan menyalahkan orang lain.",
      "Kurang terbuka, hanya jujur jika didesak atau ketahuan salah.",
      "Cukup jujur secara umum, namun pasif dalam mengakui kesalahan.",
      "Konsisten berkata jujur, amanah, dan berani mengakui kesalahan.",
      "Sangat transparan, anti-kecurangan, dan menjadi teladan integritas."
    ]
  },
  {
    key: "adab_2", 
    label: "2. Sopan Santun (Respect)",
    items: [
      "Bicara kasar, sering menyela, dan tidak menghargai orang lain.",
      "Nada bicara kurang sopan (ketus) atau bahasa tubuh tidak hormat.",
      "Berbahasa baik, namun jarang mengucap Maaf, Tolong, & Terima Kasih.",
      "Bertutur kata halus, santun, dan menghargai lawan bicara.",
      "Sangat sopan, memuliakan orang tua/ muda secara natural."
    ]
  },
  {
    key: "adab_3", 
    label: "3. Disiplin & Tanggung Jawab",
    items: [
      "Sering terlambat, melalaikan tugas, dan melanggar aturan.",
      "Kurang disiplin waktu dan hasil pengerjaan tugas asal-asalan.",
      "Hadir tepat waktu dan menyelesaikan tugas sesuai standar saja.",
      "Selalu disiplin waktu, taat aturan, dan tugas selesai dengan rapi.",
      "Sangat disiplin, hasil kerja memuaskan, dan proaktif tanpa diawasi."
    ]
  },
  {
    key: "adab_4", 
    label: "4. Empati & Kepedulian",
    items: [
      "Egois, tidak peduli, dan cenderung merugikan orang lain.",
      "Bersikap masa bodoh (apatis) terhadap kesulitan teman/lingkungan.",
      "Mau membantu orang lain atau menjaga kebersihan jika diminta.",
      "Peka terhadap situasi sekitar dan ringan tangan membantu.",
      "Sangat peduli, inisiatif tinggi, dan penggerak kebaikan bersama."
    ]
  }
];

// --- 1. MODAL TAMBAH / EDIT HAFALAN ---
export const FormHafalanModal = ({ mode = "add", onClose, onSave, dataHafalan }) => {
  const initialForm = {
    selected_kelas: "", 
    siswa: "", 
    guru: "", 
    tanggal: new Date().toISOString().split('T')[0], 
    juz: "", 
    surah: "", 
    ayat: "", 
    jenis_setoran: "", 
    nilai: "", 
    catatan: "",
    adab_1: "", adab_2: "", adab_3: "", adab_4: ""
  };
  
  const [form, setForm] = useState(initialForm);
  const [kelasList, setKelasList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [filteredSurahs, setFilteredSurahs] = useState([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        // Load data kelas saja di awal
        const resKelas = await axios.get("http://127.0.0.1:8000/api/academic/kelas/", { headers });

        setKelasList([
          { value: "", label: "-- Pilih Kelas --" },
          ...resKelas.data.map(k => ({ value: k.nama_kelas, label: k.nama_kelas }))
        ]);

      } catch (err) { console.error("Gagal load data awal", err); }
    };
    fetchInitialData();

    if (mode === "edit" && dataHafalan) {
      setForm({
        ...dataHafalan,
        // Pastikan key 'siswa' dan 'guru' sesuai dengan serializer baru
        siswa: dataHafalan.siswa_id || dataHafalan.siswa || "",
        guru: dataHafalan.guru_id || dataHafalan.guru || "",
        selected_kelas: dataHafalan.nama_kelas || "" 
      });
      // Load data filter sesuai kelas yang diedit
      if (dataHafalan.nama_kelas) {
        fetchByKelas(dataHafalan.nama_kelas);
      }
    }
  }, [mode, dataHafalan]);

  // LOGIKA UTAMA: Filter Siswa DAN Guru berdasarkan Kelas
  const fetchByKelas = async (namaKelas) => {
    if (!namaKelas) {
        setSiswaList([]);
        setGuruList([]);
        return;
    }
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      
      // Hit endpoint dengan query param ?kelas=
      const [resSiswa, resGuru] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/siswa/?kelas=${namaKelas}`, { headers }),
        axios.get(`http://127.0.0.1:8000/api/guru/?kelas=${namaKelas}`, { headers })
      ]);
      
      setSiswaList([
        { value: "", label: "-- Pilih Siswa --" },
        ...resSiswa.data.map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name}` }))
      ]);

      setGuruList([
        { value: "", label: "-- Pilih Guru --" },
        ...resGuru.data.map(m => ({ value: m.id, label: `${m.first_name} ${m.last_name}` }))
      ]);

    } catch (err) { console.error("Gagal load data filter kelas", err); }
  };

  const juzOptions = [{ label: "-- Pilih Juz --", value: "" }, ...Array.from({ length: 30 }, (_, i) => ({ label: `Juz ${i + 1}`, value: `${i + 1}` }))];

  useEffect(() => {
    if (form.juz) {
      const filtered = QURAN_DATA.filter(item => item.juz === form.juz);
      setFilteredSurahs(filtered);
    } else {
      setFilteredSurahs([]);
    }
  }, [form.juz]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // LOGIKA: Trigger filter saat kelas dipilih
    if (name === "selected_kelas") {
      setForm(prev => ({ ...prev, selected_kelas: value, siswa: "", guru: "" }));
      fetchByKelas(value);
    }

    if (name === "surah") {
      const surahInfo = QURAN_DATA.find(s => s.name === value && s.juz === form.juz);
      if (surahInfo) setForm(prev => ({ ...prev, surah: value, ayat: `1-${surahInfo.total}` }));
    }
    if (name === "juz") {
        setForm(prev => ({ ...prev, juz: value, surah: "", ayat: "" }));
    }
  };

  // Handler Checkbox Adab (Skala 1-5)
  const handleCheckAdab = (key, textValue) => {
    setForm(prev => ({ ...prev, [key]: textValue }));
  };

  // Handler Simpan dengan Trigger WA
  const submitAction = (triggerWa) => {
    // Validasi Adab Wajib Diisi
    if (!form.adab_1 || !form.adab_2 || !form.adab_3 || !form.adab_4) {
      return alert("Mohon lengkapi seluruh Penilaian Adab & Karakter!");
    }

    const s = siswaList.find(i => String(i.value) === String(form.siswa));
    const m = guruList.find(i => String(i.value) === String(form.guru));
    
    const { selected_kelas, ...cleanForm } = form;

    onSave({
        ...cleanForm,
        trigger_wa: triggerWa, // Flag untuk backend
        _displaySiswa: s ? s.label : "-",
        _displayGuru: m ? m.label : "-"
    });
  };

  const handleSaveClick = () => {
    const s = siswaList.find(i => String(i.value) === String(form.siswa));
    const m = guruList.find(i => String(i.value) === String(form.guru));
    
    // Hapus temporary UI field sebelum simpan
    const { selected_kelas, ...cleanForm } = form;

    onSave({
        ...cleanForm,
        _displaySiswa: s ? s.label : "-",
        _displayGuru: m ? m.label : "-"
    });
  };

  return (
    <ModalWrapper title={mode === "add" ? "Tambah Hafalan" : "Edit Hafalan"} icon={mode === "add" ? BiPlus : BiPencil} onClose={onClose} size="max-w-3xl">
      <div className="space-y-4">
        {/* LOGIKA: Dropdown Kelas untuk Filter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalInput label="1. Pilih Kelas Dulu" name="selected_kelas" type="select" options={kelasList} value={form.selected_kelas} onChange={handleChange} />
            
            <ModalInput 
                label="2. Nama Siswa" 
                name="siswa" 
                type="select" 
                options={form.selected_kelas ? siswaList : [{value:"", label:"-- Pilih Kelas Dulu --"}]} 
                value={form.siswa} 
                onChange={handleChange} 
                disabled={!form.selected_kelas} 
            />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ModalInput label="Tanggal" name="tanggal" type="date" value={form.tanggal} onChange={handleChange} />
            
            {/* LOGIKA: Guru Pengampu Terfilter */}
            <ModalInput 
                label="3. Guru Pengampu" 
                name="guru" 
                type="select" 
                options={form.selected_kelas ? guruList : [{value:"", label:"-- Pilih Kelas Dulu --"}]} 
                value={form.guru} 
                onChange={handleChange} 
                disabled={!form.selected_kelas} 
            />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ModalInput label="Pilih Juz" name="juz" type="select" options={juzOptions} value={form.juz} onChange={handleChange} />
          <div>
            <label className="block font-[700] text-[#1a1a1a] mb-2 text-[0.95rem]">Surah</label>
            <select name="surah" className="w-full bg-[#D9D9D9] border-none rounded-[4px] px-4 py-2.5 font-[500] h-[45px] outline-none text-slate-800 disabled:opacity-50" value={form.surah} onChange={handleChange} disabled={!form.juz}>
              <option value="">{form.juz ? "-- Pilih Surah --" : "-- Pilih Juz Dulu --"}</option>
              {filteredSurahs.map((s, idx) => <option key={idx} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ModalInput label="Ayat" name="ayat" placeholder="Contoh: 1-10" value={form.ayat} onChange={handleChange} />
            <ModalInput label="Jenis Setoran" name="jenis_setoran" type="select" options={[{value:"", label:"-- Pilih Jenis --"}, {value:"Ziyadah(Hafalan Baru)", label:"Ziyadah(Hafalan Baru)"}, {value:"Murajaah(Mengulang)", label:"Murajaah(Mengulang)"}]} value={form.jenis_setoran} onChange={handleChange} />
            <ModalInput label="Nilai" name="nilai" type="select" options={[{value:"", label:"-- Pilih Nilai --"}, {value:"A", label:"A - Sangat Baik"}, {value:"B", label:"B - Baik"}, {value:"C", label:"C - Cukup"}, {value:"D", label:"D - Kurang"}]} value={form.nilai} onChange={handleChange} />
        </div>
        
        <div>
          <label className="block font-[700] text-[#1a1a1a] mb-2 text-[0.95rem]">Catatan</label>
          <textarea name="catatan" className="w-full bg-[#D9D9D9] border-none rounded-[4px] px-4 py-3 font-[500] h-[100px] outline-none resize-none placeholder-slate-500 text-slate-800" value={form.catatan} onChange={handleChange} placeholder="Masukkan Catatan ..."></textarea>
        </div>

        <div className="pt-4 mt-6 border-t border-slate-300">
          <h5 className="font-bold text-slate-800 mb-4 text-base">Penilaian Adab & Karakter</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {ADAB_LIST.map((bab) => (
              <div key={bab.key} className="space-y-3">
                <p className="font-bold text-[0.9rem] text-slate-800">{bab.label}</p>
                {bab.items.map((txt, idx) => (
                  <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-[#1B4332] focus:ring-[#1B4332] cursor-pointer"
                      
                      // LOGIKA LAMA (SALAH): checked={form[bab.key] === (idx + 1)}
                      // LOGIKA BARU (BENAR): Cek apakah teks yang disimpan sama dengan txt ini
                      checked={form[bab.key] === txt} 
                      
                      // LOGIKA LAMA (SALAH): onChange={() => handleCheckAdab(bab.key, idx + 1)}
                      // LOGIKA BARU (BENAR): Simpan kalimatnya (txt) langsung!
                      onChange={() => handleCheckAdab(bab.key, txt)}
                    />
                    <span className={`text-[0.75rem] leading-tight transition-colors ${form[bab.key] === txt ? 'font-bold text-black' : 'text-slate-600 group-hover:text-black'}`}>
                        {/* Tampilkan teks pilihannya */}
                        {txt}
                    </span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>

        <hr className="border-t border-black my-6 -mx-6 opacity-100" />
        <div className="pt-4 mt-2 border-t border-slate-100">
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            {/* Tombol Reset */}
            <button 
              onClick={() => setForm({ ...initialForm })} 
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#E53E3E] text-white font-bold text-sm flex justify-center items-center gap-2 hover:bg-[#9c0707] shadow-sm transition-all active:scale-95"
            >
              <BiTrash className="text-lg" /> Reset
            </button>
            <button 
              onClick={() => submitAction(false)} 
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#5294A9] text-white font-bold text-sm flex justify-center items-center gap-2 hover:bg-[#3e7283] shadow-sm transition-all active:scale-95"
            >
              <BiSave className="text-lg" /> Simpan
            </button>
            <button 
              onClick={() => submitAction(true)} 
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#29614a] text-white font-bold text-sm flex justify-center items-center gap-2 hover:bg-[#143d2b] shadow-lg shadow-emerald-900/20 transition-all active:scale-95"
            >
              <BiLogoWhatsapp className="text-xl" /> Simpan & Kirim WA
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};

// --- 2. MODAL IMPORT EXCEL ---
export const ImportExcelModal = ({ onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const handleImport = async () => {
    if (!file) return alert("Pilih file excel!");
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://127.0.0.1:8000/api/academic/hafalan/import/", formData, { headers: { Authorization: `Bearer ${token}` } });
      alert("Import Berhasil!"); onSuccess();
    } catch (err) { alert("Gagal import. Cek format excel."); } finally { setUploading(false); }
  };
  return (
    <ModalWrapper title="Import Excel" icon={BiFile} onClose={onClose} size="max-w-md">
      <div className="p-4 text-center">
        <BiFile className={`text-[5rem] mx-auto mb-2 ${file ? 'text-blue-500' : 'text-[#198754] opacity-80'}`} />
        <p className="text-sm text-slate-500 mb-4">Header: nisn_siswa, nip_guru, tanggal, juz, surah, ayat, jenis, nilai, catatan</p>
        <input type="file" accept=".xlsx, .xls" onChange={(e) => setFile(e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[#198754] file:text-white hover:file:bg-[#146c43] cursor-pointer bg-slate-100 rounded-lg border border-slate-200" />
        <button onClick={handleImport} disabled={uploading} className="w-full mt-8 bg-[#198754] text-white font-bold py-3 rounded-[6px] shadow-sm hover:bg-[#157347] transition-all flex justify-center items-center gap-2">{uploading ? "Sedang Proses..." : "Import Sekarang"}</button>
      </div>
    </ModalWrapper>
  );
};

// --- 3. MODAL KONFIRMASI ---
export const ConfirmModal = ({ type = "save", onClose, onConfirm, dataHafalan }) => {
  const isDelete = type === "delete";
  const iconBg = isDelete ? "bg-[#DC3545]" : "bg-[#007BFF]";
  const icon = isDelete ? <BiX /> : <BiCheck />;
  const titleText = isDelete ? "Hapus Hafalan?" : (type === "edit" ? "Konfirmasi Perubahan" : "Konfirmasi Data");
  
  // PERBAIKAN: titleColor yang sebelumnya bikin crash
  const titleColor = isDelete ? "text-[#DC3545]" : "text-[#007BFF]";

  // Deteksi jika user memilih "Simpan & Kirim WA"
  const isSendWa = dataHafalan?.trigger_wa;

  return (
    <div className="fixed inset-0 bg-black/50 z-[1080] flex items-center justify-center p-4 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white rounded-[15px] w-full max-w-[450px] p-6 md:p-8 text-center shadow-2xl animate-[zoomIn_0.3s_ease-out] overflow-y-auto max-h-[90vh]">
        <div className={`w-[80px] h-[80px] md:w-[90px] md:h-[90px] rounded-full flex items-center justify-center mx-auto mb-5 text-[3.5rem] md:text-[4rem] text-white ${iconBg} shadow-lg`}>{icon}</div>
        <h2 className={`font-[800] text-[1.4rem] md:text-[1.6rem] mb-2 ${titleColor}`}>{titleText}</h2>
        <p className="text-slate-500 mb-8 px-2 leading-relaxed text-sm md:text-base">{isDelete ? "Data akan dihapus permanen." : "Pastikan data sudah benar."}</p>
        
        {!isDelete && dataHafalan && (
          <div className="bg-slate-50 p-4 rounded-lg text-left mx-auto mb-8 border border-slate-200 text-sm w-full">
            <div className="flex mb-2"><span className="w-[100px] font-bold text-slate-700 shrink-0">Nama Siswa</span><span>: {dataHafalan._displaySiswa || dataHafalan.nama_siswa || "-"}</span></div>
            <div className="flex mb-2"><span className="w-[100px] font-bold text-slate-700 shrink-0">Surah</span><span>: {dataHafalan.surah}</span></div>
            <div className="flex mb-2"><span className="w-[100px] font-bold text-slate-700 shrink-0">Juz</span><span>: {dataHafalan.juz}</span></div>
            {isSendWa && (
                <div className="mt-2 pt-2 border-t border-slate-200 text-[#1B4332] font-bold flex items-center gap-2">
                    <BiLogoWhatsapp className="text-lg" /> Laporan WA akan dikirim!
                </div>
            )}
          </div>
        )}
        
        <div className="flex flex-row justify-center gap-3">
          <button onClick={onClose} className="bg-[#6C757D] text-white py-2.5 px-2 rounded-[8px] font-[700] hover:bg-[#5a6268] transition-all w-1/2">Batal</button>
          <button onClick={onConfirm} className={`${isDelete ? "bg-[#DC3545] hover:bg-[#bb2d3b]" : "bg-[#007BFF] hover:bg-[#0056b3]"} text-white py-2.5 px-2 rounded-[8px] font-[700] transition-all w-1/2`}>{isDelete ? "Hapus" : "Konfirmasi"}</button>
        </div>
      </div>
    </div>
  );
};