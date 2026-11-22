/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#080D18',
          secondary: '#111A2B',
          card: '#131F35',
          elevated: '#182642',
        },
        accent: {
          DEFAULT: '#B6FF3B',
          hover: '#9DEB20',
          muted: 'rgba(182, 255, 59, 0.12)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#9AA8BD',
          muted: '#62728B',
        },
        border: {
          subtle: '#1C2A44',
          active: '#2A3F66',
          highlight: 'rgba(182, 255, 59, 0.35)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(182, 255, 59, 0.25)',
        'glow-lg': '0 0 45px -8px rgba(182, 255, 59, 0.35)',
      }
    },
  },
  plugins: [],
}
