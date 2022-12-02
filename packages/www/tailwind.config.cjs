/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
    fontFamily: {
      main: ['Fira Code'],
      mono: ['Fira Code'],
    },
    fontWeight: {
      normal: 400,
      semibold: 600,
      bold: 700,
    },
  },
  plugins: [],
}
