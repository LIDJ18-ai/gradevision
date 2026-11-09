/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FBF7EE',
          100: '#F5ECD6',
          200: '#EAD9AD',
          300: '#DEC583',
          400: '#D4AF70',
          500: '#C49A4F',
          600: '#A87E3A',
          700: '#85612D',
          800: '#5E4420',
          900: '#3A2B14',
        },
        ink: {
          50: '#F2F2F2',
          100: '#E0E0E0',
          200: '#C0C0C0',
          300: '#9A9A9A',
          400: '#6E6E6E',
          500: '#4A4A4A',
          600: '#333333',
          700: '#262626',
          800: '#1A1A1A',
          900: '#121212',
          950: '#0A0A0A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'gold-glow': '0 0 20px rgba(212, 175, 112, 0.15)',
        'gold-glow-lg': '0 0 40px rgba(212, 175, 112, 0.2)',
        'inner-gold': 'inset 0 1px 0 0 rgba(212, 175, 112, 0.1)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #D4AF70 0%, #A87E3A 100%)',
        'gold-shimmer': 'linear-gradient(90deg, transparent, rgba(212,175,112,0.15), transparent)',
        'radial-gold': 'radial-gradient(ellipse at center, rgba(212,175,112,0.08) 0%, transparent 70%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-up': 'fadeUp 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
