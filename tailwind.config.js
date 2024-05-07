/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      primary: `#739d88`,
      light1: `#dfe2e0`,
      light2: `#f6f6f6`,
      dark1: `#191919`,
      dark2: `#6b6b6b`,

      primary2: `#51786599`,
      primary3: `#739d8865`,
      bbgray1: `#c2c2c2`,
      bbgray2: `#7f7f7f`,
      bbgray3: `#ababab`,

      white: `#ffffff`,
      dim: `#00000087`,

      neutral1: `#6c93ba`,
      neutral2: `#aabbcc99`,
      neutral3: `#aabbcc65`,
      neutral4: `#6a92ba`,
      negative1: `#d8aa69`,
      negative2: `#f6d6aa99`,

      warn1: `#850505`,
      good1: `#1e6d58`,

      highlight: `#93ceb4`,
      panel: `#dfe2e1b1`,
    },
    extend: {
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}
