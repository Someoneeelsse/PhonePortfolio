/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        "alan-sans": ["Alan Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};
