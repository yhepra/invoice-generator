/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f5f8ff",
          100: "#e9f0ff",
          200: "#cfe0ff",
          300: "#a9c7ff",
          400: "#7ea9ff",
          500: "#4c83ff",
          600: "#2b62e6",
          700: "#1f4ab3",
          800: "#1a3d8f",
          900: "#162f6f"
        }
      }
    }
  },
  plugins: []
}
