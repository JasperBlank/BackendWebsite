import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Epilogue', 'sans-serif'],
        serif: ['"Instrument Serif"', 'serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#09090B',
          card: '#111114',
          raised: '#0F0F12',
          elevated: '#141418',
        },
        border: {
          DEFAULT: '#1C1C22',
          strong: '#242430',
        },
        accent: {
          DEFAULT: '#C8F04A',
          dim: 'rgba(200,240,74,0.10)',
        },
        text: {
          DEFAULT: '#F0EEE8',
          muted: '#9898A2',
          faint: '#78787F',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
