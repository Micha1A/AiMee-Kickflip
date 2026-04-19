/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#00FF41", // Matrix Neon Green
        stealth: "#1A1A1A", // Dark Grey
      }
    },
  },
  plugins: [],
}
