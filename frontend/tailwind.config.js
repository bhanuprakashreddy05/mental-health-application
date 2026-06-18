/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        wellness: {
          blue: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            500: '#0ea5e9',
            600: '#0284c7',
            700: '#0369a1',
          },
          lavender: {
            50: '#faf5ff',
            100: '#f3e8ff',
            200: '#e9d5ff',
            500: '#a855f7',
            600: '#9333ea',
            700: '#7e22ce',
            800: '#6b21a8',
            900: '#581c87',
          },
          green: {
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            500: '#22c55e',
            600: '#16a34a',
            700: '#15803d',
          },
          dark: {
            950: '#0b0f19',
            900: '#111827',
            800: '#1f2937',
            700: '#374151',
            600: '#4b5563',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      animation: {
        'breathe': 'breathe 16s infinite ease-in-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.4' }, // start
          '25%': { transform: 'scale(1.5)', opacity: '0.9' },    // inhale completed
          '50%': { transform: 'scale(1.5)', opacity: '0.9' },    // hold full
          '75%': { transform: 'scale(1)', opacity: '0.4' },      // exhale completed
        }
      }
    },
  },
  plugins: [],
}
