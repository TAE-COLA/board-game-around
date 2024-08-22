/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {},
    fontFamily: {
      nanumsquare: ['nanumsquare'],
    }
  },
  plugins: [
    require('daisyui')
  ],
}
