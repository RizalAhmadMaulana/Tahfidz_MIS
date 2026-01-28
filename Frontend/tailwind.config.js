/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0D9488",
        secondary: "#0A2540",
        body: "#f1f5f9",
        inputBg: "#f8fafc",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      // --- TAMBAHKAN BAGIAN INI ---
      keyframes: {
        // Definisi gerakan naik turun tipis
        floatUpAndDown: {
          '0%, 100%': { transform: 'translateY(0)' }, // Posisi awal dan akhir (diam)
          '50%': { transform: 'translateY(-8px)' },   // Posisi tengah (naik 8px)
        }
      },
      animation: {
        // Membuat class 'animate-float' yang berjalan selama 3 detik, berulang-ulang
        'float': 'floatUpAndDown 3s ease-in-out infinite',
      }
      // ---------------------------
    },
  },
  plugins: [],
}