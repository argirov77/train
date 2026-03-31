import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Inter', 'IBM Plex Sans', 'sans-serif'],
      },
      colors: {
        surface: {
          primary: '#0f1117',
          card: '#1a1d27',
          elevated: '#252836',
        },
        border: {
          DEFAULT: '#2e3348',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
