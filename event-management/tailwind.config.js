// tailwind.config.js

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: "#f97316",
        dark: "#1a1a2e",
        card: "#16213e",
      }
    },
  },

  plugins: [],
}