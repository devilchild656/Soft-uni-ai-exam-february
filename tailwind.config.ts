import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{vue,ts,tsx}'],
  theme: {
    extend: {
      aspectRatio: {
        '4/5': '4 / 5',
        '191/100': '1.91 / 1',
      },
    },
  },
  plugins: [],
} satisfies Config
