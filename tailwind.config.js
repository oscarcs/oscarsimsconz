/** @type {import('tailwindcss').Config} */
import animate from 'tailwindcss-animate'
import typography from '@tailwindcss/typography'

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        'offwhite': '#f0eee7ff',
        'industrial': '#303032ff',
        'secondary': '#6e7068ff',
      }
    }
  },
  plugins: [
    animate,
    typography,
  ],
}