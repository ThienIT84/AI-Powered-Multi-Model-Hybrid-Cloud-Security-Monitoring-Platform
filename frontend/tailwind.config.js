/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soc-dark': '#0f0f23',
        'soc-gray': '#1a1a2e',
        'soc-accent': '#00d4ff',
        'soc-critical': '#ff4444',
        'soc-warning': '#ffaa00',
        'soc-success': '#44ff44',
      },
      animation: {
        'pulse-green': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}