/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', 
  theme: {
    extend: {
      colors: {
        light: {
          1: '#ffffff',
          2: '#f3f4f6',
        },
        dark: {
          1: '#111827',
          2: '#374151',
        },
        primary: {
          DEFAULT: '#3b82f6',
          hover: '#2563eb',
        }
      },
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      }
    },
  },
  plugins: [],
}