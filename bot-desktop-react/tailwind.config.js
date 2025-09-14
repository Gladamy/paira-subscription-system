/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#F6F7F9',
        surface: '#FFFFFF',
        accent: '#374151',
        border: '#E5E7EB',
      },
      boxShadow: {
        neumorphism: '0 1px 2px rgba(16,24,40,0.06), 0 0 0 1px rgba(16,24,40,0.04)',
      },
      borderRadius: {
        neumorphism: '12px',
      },
    },
  },
  plugins: [],
}