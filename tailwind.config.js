/** @type {import('tailwindcss').Config} */
export default {
  content: ["./**/*.{html,js}", "!./node_modules/**/*"],
  theme: {
    extend: {
      fontFamily: {
        main: ["Quicksand", "sans-serif"],
      },
      colors: {
        primary: "#2B675D",
        secondary: "#FF7F50",
        accent: "#66fcf1",
        primaryBtnHover: "#1B4E45",
        footer: "#486168",
      },
    },
  },
  plugins: [],
};
