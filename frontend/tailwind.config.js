/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Scan all your source files for class names
  ],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      // You can add custom colors, fonts, etc. here
    },
  },
  plugins: [],
};