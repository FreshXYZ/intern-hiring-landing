const defaultTheme = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Space Mono', ...defaultTheme.fontFamily.mono],
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
    },
  },
};
