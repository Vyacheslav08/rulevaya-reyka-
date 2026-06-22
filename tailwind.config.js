/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#dce6ff',
          500: '#3b6ff5',
          600: '#2855d8',
          700: '#1e3fb0',
        }
      }
    },
  },
  plugins: [],
}
