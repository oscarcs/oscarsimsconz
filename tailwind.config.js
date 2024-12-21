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
  theme: { },
  plugins: [
    animate,
    typography,
  ],
}