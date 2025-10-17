/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        stromboli: {
          50: "#f1f8f4",
          100: "#ddeee2",
          200: "#bdddc9",
          300: "#92c3a9",
          400: "#63a482",
          500: "#428766",
          600: "#306b50",
          700: "#25533f",
          800: "#204534",
          900: "#1b392c",
          950: "#0e2019",
        },
        primary: {
          default: "#25533F",
          light: "#ddeee2",
          darklight: "#A4B6AE",
          dark: "#0e2019",
          opa: "#A4B6AE"
        },
        pavlova: {
          50: "#faf7f2",
          100: "#f3eee1",
          200: "#e7dbc1",
          300: "#dac7a2",
          400: "#c6a471",
          500: "#ba8d55",
          600: "#ac7a4a",
          700: "#8f623f",
          800: "#745038",
          900: "#5e4230",
          950: "#322118",
        },
        secondary: {
          default: "#b07c19",
          light: "#DAC7A2",
          dark: "#3b200d",
          superlight: "#FFFCF6",
          gold: "#D9C398"
        },
      },
    },
    fontFamily: {
      sans: ["Kanit", "sans-serif"],
    },
  },
  plugins: [],
};
