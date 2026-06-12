/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#2c2a26',
        'ink-soft': '#7a746b',
        paper: '#f6f2e9',
        card: '#f0e6d2',
        cream: '#faf3e4',
        line: '#d9d2c4',
        accent: '#ff7a4d',
        'accent-coral': '#ff7a4d',
        'accent-green': '#1b4332',
        'accent-purple': '#7c5cbf',
        hi: '#e8543a',
        med: '#f0a73a',
        low: '#4f9be0',
        crit: '#d6336c',
      },
      fontFamily: {
        display: ['PatrickHand_400Regular', 'Patrick Hand', 'system-ui', 'cursive'],
      },
      borderRadius: {
        card: '24px',
      },
    },
  },
  plugins: [],
};
