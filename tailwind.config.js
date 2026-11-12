/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0a0f1c',
        panel: '#0d1526',
      },
      fontFamily: {
        mono: [
          '"JetBrains Mono"',
          '"Cascadia Code"',
          '"Cascadia Mono"',
          '"SFMono-Regular"',
          'Consolas',
          '"Liberation Mono"',
          'monospace',
        ],
      },
      boxShadow: {
        hud: 'inset 0 0 45px rgba(34, 211, 238, 0.06), 0 18px 50px rgba(0, 0, 0, 0.32)',
        'glow-cyan': '0 0 32px rgba(34, 211, 238, 0.28)',
        'glow-gold': '0 0 55px rgba(251, 191, 36, 0.3)',
      },
    },
  },
  plugins: [],
}
