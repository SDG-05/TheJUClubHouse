/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      colors: {
        ground: '#F6F3EC',
        surface: '#ECE7DC',
        surfaceAlt: '#E2DDD0',
        ink: '#161513',
        muted: '#5C5852',
        accent: '#B83A24',
        accentHover: '#9A2E1B',
        forest: '#1E4D3B',
        amber: '#8C5A16',
      },
    },
  },
  plugins: [],
};
