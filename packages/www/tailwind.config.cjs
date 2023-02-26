const colors = require('tailwindcss/colors')
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
    fontFamily: {
      main: ['Inter'],
      mono: ['Fira Code'],
    },
    fontWeight: {
      normal: 400,
      semibold: 600,
      bold: 700,
    },
    colors: {
      black: colors.black,
      white: colors.white,
      transparent: colors.transparent,
      current: colors.current,
      main: colors.amber,
      accent: colors.blue,
      gray: colors.neutral,
      red: colors.red,
      green: colors.green,
    },
  },
  plugins: [],
}
