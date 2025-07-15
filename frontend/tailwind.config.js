/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        stromboli: {
          '50': '#f1f8f4',
          '100': '#ddeee2',
          '200': '#bdddc9',
          '300': '#92c3a9',
          '400': '#63a482',
          '500': '#428766',
          '600': '#306b50',
          '700': '#25533f',
          '800': '#204534',
          '900': '#1b392c',
          '950': '#0e2019',
        },
        primary: {
          default: '#25533F',
          light: '#ddeee2',
          dark: '#0e2019'
        },
        secondary: {
          default: '#b07c19',
          light: '#e1b92e',
          dark: '#3b200d'
        }
      },
    },
    fontFamily: {
      sans: ['Kanit', 'sans-serif'],
    },
  },
  plugins: [],
}