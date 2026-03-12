import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#0a0a0f',
          card: '#111118',
          border: '#1e1e2e',
        },
        accent: {
          DEFAULT: '#7c3aed',
          light: '#a78bfa',
        },
      },
    },
  },
  plugins: [],
} satisfies Config
