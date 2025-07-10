import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1a1a2e',
        'secondary': '#0f4c75',
        'accent': '#3282b8',
      },
      fontFamily: {
        'serif': ['Merriweather', 'serif'],
      },
    },
  },
  plugins: [],
}
export default config 