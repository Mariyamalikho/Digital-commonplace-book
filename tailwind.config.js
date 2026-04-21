/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        academia: {
          darkest: "#120c08",
          dark: "#1c130e",
          wood: "#2a1b12",
          leather: "#3b2314",
          leatherLight: "#4a2e1b",
          brass: "#d4af37",
          gold: "#c59b27",
          parchment: "#f4ebd0",
          parchmentDark: "#eee1c5",
          parchmentShadow: "#d8c7a1",
          ink: "#231f20",
          inkBlue: "#1d2b3a",
          crimson: "#6b1d1d",
          crimsonBright: "#8b2626",
          velvet: "#2d161e",
          forest: "#1c3225",
        }
      },
      fontFamily: {
        serifTitle: ['"Cinzel"', '"Playfair Display"', 'Georgia', 'serif'],
        serifHeading: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        handwriting: ['"Caveat"', '"Reenie Beanie"', 'cursive'],
        typewriter: ['"Special Elite"', '"Courier New"', 'monospace'],
        bodyText: ['"EB Garamond"', 'Georgia', 'serif'],
      },
      boxShadow: {
        'book-spine': 'inset 0 0 35px rgba(0, 0, 0, 0.65), 0 20px 40px rgba(0,0,0,0.8)',
        'page-left': 'inset -15px 0 25px -10px rgba(0, 0, 0, 0.3), -5px 10px 25px rgba(0,0,0,0.4)',
        'page-right': 'inset 15px 0 25px -10px rgba(0, 0, 0, 0.3), 5px 10px 25px rgba(0,0,0,0.4)',
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.4)',
      }
    },
  },
  plugins: [],
}
