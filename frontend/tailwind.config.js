/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366F1',
          600: '#4f46e5',
          700: '#4338ca'
        }
      },
      fontFamily: {
        heading: ['Poppins', 'sans-serif'],
        body: ['Manrope', 'sans-serif']
      },
      boxShadow: {
        soft: '0 15px 40px rgba(99, 102, 241, 0.15)'
      }
    }
  },
  plugins: []
};
