/** @type {import('tailwindcss').Config} */
export default {
  content: ["./**/*.{html,js}", "!./node_modules/**/*"],
  theme: {
    extend: {
      colors: {
        primary: "#4D897F",
        secondary: "#FF7F50",
        accent: "#66fcf1",
        primaryBtnHover: "#2B675D",
        footer: "#486168",
      },
    },
  },
  plugins: [],
};
