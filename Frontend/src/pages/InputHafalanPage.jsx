import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../components/templates/DashboardLayout";
import { BiSave, BiTrash, BiLogoWhatsapp, BiInfoCircle } from "react-icons/bi";
import { ConfirmModal } from "../components/organisms/SetorHafalanModals";
import SuccessNotification from "../components/atoms/SuccessNotification";

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

const InputHafalanPage = () => {
  const initialForm = {
    selected_kelas: "", siswa: "", guru: "", tanggal: new Date().toISOString().split('T')[0], 
    juz: "", surah: "", ayat: "", jenis_setoran: "", nilai: "", catatan: "",
    adab_1: "", adab_2: "", adab_3: "", adab_4: ""
  };
  
  const [form, setForm] = useState(initialForm);
  const [kelasList, setKelasList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [filteredSurahs, setFilteredSurahs] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isWaTriggered, setIsWaTriggered] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // FETCH DATA AWAL (KELAS)
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("https://laporan.mentariku.org/api/academic/kelas/", {
            headers: { Authorization: `Bearer ${token}` }
        });
        setKelasList([{ value: "", label: "-- Pilih Kelas --" }, ...res.data.map(k => ({ value: k.nama_kelas, label: k.nama_kelas }))]);
      } catch (err) { console.error(err); }
    };
    fetchKelas();
  }, []);

  // FETCH SISWA & GURU BERDASARKAN KELAS
  const fetchByKelas = async (namaKelas) => {
    if (!namaKelas) { setSiswaList([]); setGuruList([]); return; }
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const [resSiswa, resGuru] = await Promise.all([
        axios.get(`https://laporan.mentariku.org/api/siswa/?kelas=${namaKelas}`, { headers }),
        axios.get(`https://laporan.mentariku.org/api/guru/?kelas=${namaKelas}`, { headers })
      ]);
      setSiswaList([{ value: "", label: "-- Pilih Siswa --" }, ...resSiswa.data.map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name}` }))]);
      setGuruList([{ value: "", label: "-- Pilih Guru --" }, ...resGuru.data.map(m => ({ value: m.id, label: `${m.first_name} ${m.last_name}` }))]);
    } catch (err) { console.error(err); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === "selected_kelas") {
      setForm(prev => ({ ...prev, selected_kelas: value, siswa: "", guru: "" }));
      fetchByKelas(value);
    }
    if (name === "juz") {
       if (value) {
         setFilteredSurahs(QURAN_DATA.filter(item => item.juz === value));
       } else {
         setFilteredSurahs([]);
       }
       setForm(prev => ({ ...prev, juz: value, surah: "", ayat: "" }));
    }
    if (name === "surah") {
      const surahInfo = QURAN_DATA.find(s => s.name === value && s.juz === form.juz);
      if (surahInfo) setForm(prev => ({ ...prev, surah: value, ayat: `1-${surahInfo.total}` }));
    }
  };

  const handleCheckAdab = (key, txt) => {
    setForm(prev => ({ ...prev, [key]: txt }));
  };

  const preSubmit = (triggerWa) => {
    if (!form.selected_kelas || !form.siswa || !form.guru || !form.juz || !form.surah || !form.nilai) {
        return alert("Mohon lengkapi data hafalan utama!");
    }
    if (!form.adab_1 || !form.adab_2 || !form.adab_3 || !form.adab_4) {
      return alert("Mohon lengkapi seluruh Penilaian Adab & Karakter!");
    }
    setIsWaTriggered(triggerWa);
    setShowConfirm(true);
  };

  const handleFinalSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const { selected_kelas, ...cleanForm } = form;
      const payload = { ...cleanForm, trigger_wa: isWaTriggered };
      
      await axios.post("https://laporan.mentariku.org/api/academic/hafalan/", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowConfirm(false);
      setSuccessMsg(isWaTriggered ? "Data tersimpan & WA Terkirim!" : "Data berhasil ditambahkan!");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      setForm(initialForm);
    } catch (err) {
      alert("Gagal menyimpan data.");
    }
  };

  // HELPER COMPONENT UNTUK INPUT BIAR RAPI
  const FormInput = ({ label, type = "text", name, value, options, disabled, placeholder, onChange }) => {
    const baseClass = `w-full bg-white border border-slate-300 rounded-[6px] px-4 py-2.5 font-[500] h-[45px] outline-none text-slate-800 focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332] transition-all ${disabled ? 'bg-slate-100 cursor-not-allowed' : ''}`;
    return (
        <div className="w-full">
            <label className="block font-[700] text-slate-700 mb-2 text-[0.9rem]">{label}</label>
            {type === "select" ? (
                <select name={name} className={baseClass} value={value} onChange={onChange} disabled={disabled}>
                    {options?.map((opt, idx) => <option key={idx} value={opt.value}>{opt.label}</option>)}
                </select>
            ) : (
                <input type={type} name={name} className={baseClass} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} />
            )}
        </div>
    );
  };

  // UNTUK MODAL KONFIRMASI (MAPPING DISPLAY NAME)
  const getConfirmData = () => {
    const s = siswaList.find(i => String(i.value) === String(form.siswa));
    return { ...form, _displaySiswa: s ? s.label : "-", trigger_wa: isWaTriggered };
  };

  return (
    <DashboardLayout title="Input Hafalan Baru">
      {showSuccess && <SuccessNotification message={successMsg} />}
      {showConfirm && (
        <ConfirmModal 
            type="add" 
            dataHafalan={getConfirmData()} 
            onClose={() => setShowConfirm(false)} 
            onConfirm={handleFinalSave} 
        />
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 text-[#1B4332]">
            <BiInfoCircle className="text-2xl" />
            <p className="text-sm font-medium">Pastikan memilih Kelas terlebih dahulu untuk memunculkan daftar Siswa & Guru.</p>
        </div>

        {/* --- FORM UTAMA --- */}
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="1. Pilih Kelas" name="selected_kelas" type="select" options={kelasList} value={form.selected_kelas} onChange={handleChange} />
                <FormInput label="2. Nama Siswa" name="siswa" type="select" options={form.selected_kelas ? siswaList : [{value:"", label:"-- Pilih Kelas Dulu --"}]} value={form.siswa} onChange={handleChange} disabled={!form.selected_kelas} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Tanggal Setor" name="tanggal" type="date" value={form.tanggal} onChange={handleChange} />
                <FormInput label="3. Guru Pengampu" name="guru" type="select" options={form.selected_kelas ? guruList : [{value:"", label:"-- Pilih Kelas Dulu --"}]} value={form.guru} onChange={handleChange} disabled={!form.selected_kelas} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormInput label="Juz" name="juz" type="select" options={[{label:"-- Pilih --", value:""}, ...Array.from({length:30}, (_,i)=>({label:`Juz ${i+1}`, value:`${i+1}`}))]} value={form.juz} onChange={handleChange} />
                
                <div className="w-full">
                    <label className="block font-[700] text-slate-700 mb-2 text-[0.9rem]">Surah</label>
                    <select name="surah" className="w-full bg-white border border-slate-300 rounded-[6px] px-4 py-2.5 h-[45px] outline-none" value={form.surah} onChange={handleChange} disabled={!form.juz}>
                        <option value="">{form.juz ? "-- Pilih Surah --" : "-- Pilih Juz Dulu --"}</option>
                        {filteredSurahs.map((s, idx) => <option key={idx} value={s.name}>{s.name}</option>)}
                    </select>
                </div>
                
                <FormInput label="Ayat" name="ayat" placeholder="Contoh: 1-10" value={form.ayat} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Jenis Setoran" name="jenis_setoran" type="select" options={[{value:"", label:"-- Pilih --"}, {value:"Ziyadah(Hafalan Baru)", label:"Ziyadah(Hafalan Baru)"}, {value:"Murajaah(Mengulang)", label:"Murajaah(Mengulang)"}]} value={form.jenis_setoran} onChange={handleChange} />
                <FormInput label="Nilai" name="nilai" type="select" options={[{value:"", label:"-- Pilih --"}, {value:"A", label:"A - Sangat Baik"}, {value:"B", label:"B - Baik"}, {value:"C", label:"C - Cukup"}, {value:"D", label:"D - Kurang"}]} value={form.nilai} onChange={handleChange} />
            </div>

            <div>
                <label className="block font-[700] text-slate-700 mb-2 text-[0.9rem]">Catatan Guru</label>
                <textarea name="catatan" className="w-full bg-white border border-slate-300 rounded-[6px] px-4 py-3 h-[100px] outline-none resize-none focus:border-[#1B4332]" value={form.catatan} onChange={handleChange} placeholder="Masukkan catatan perkembangan..."></textarea>
            </div>
        </div>

        {/* --- FORM ADAB --- */}
        <div className="mt-8 pt-6 border-t border-slate-200 bg-slate-50/50 p-6 rounded-xl">
          <h5 className="font-bold text-[#1B4332] mb-6 text-lg border-b border-slate-200 pb-2">Penilaian Adab & Karakter</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            {ADAB_LIST.map((bab) => (
              <div key={bab.key} className="space-y-3">
                <p className="font-bold text-[0.95rem] text-slate-800">{bab.label}</p>
                {bab.items.map((txt, idx) => (
                  <label key={idx} className="flex items-start gap-3 cursor-pointer group p-2 hover:bg-white rounded transition-colors">
                    <input 
                      type="checkbox" 
                      className="mt-1 w-5 h-5 rounded border-slate-300 text-[#1B4332] focus:ring-[#1B4332] cursor-pointer"
                      checked={form[bab.key] === txt} 
                      onChange={() => handleCheckAdab(bab.key, txt)}
                    />
                    <span className={`text-[0.8rem] leading-snug transition-colors ${form[bab.key] === txt ? 'font-bold text-black' : 'text-slate-600'}`}>{txt}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* --- ACTION BUTTONS --- */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8 pt-6 border-t border-slate-200">
             <button onClick={() => setForm(initialForm)} className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#E53E3E] text-white font-bold text-sm flex justify-center items-center gap-2 hover:bg-[#9c0707] shadow-sm transition-all active:scale-95">
                <BiTrash /> Reset
             </button>
             <button onClick={() => preSubmit(false)} className="px-6 py-3 rounded-lg bg-[#5294A9] text-white font-bold hover:bg-[#3e7283] flex items-center justify-center gap-2 shadow-sm">
                <BiSave /> Simpan Data
             </button>
             <button onClick={() => preSubmit(true)} className="px-6 py-3 rounded-lg bg-[#1B4332] text-white font-bold hover:bg-[#143d2b] flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20">
                <BiLogoWhatsapp className="text-xl" /> Simpan & Kirim WA
             </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InputHafalanPage;