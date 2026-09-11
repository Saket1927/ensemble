/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ensemble: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        heritage: {
          green: '#162c21',
          darkgreen: '#0e1d16',
          gold: '#c5a96d',
          goldlight: '#dfcca2',
          ivory: '#fbf9f5',
          charcoal: '#1c1c1c',
          muted: '#6b7280',
          card: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'Adamina', 'serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -5px rgba(22, 44, 33, 0.08), 0 4px 12px -2px rgba(22, 44, 33, 0.04)',
        'luxury-hover': '0 20px 40px -8px rgba(22, 44, 33, 0.12), 0 8px 16px -4px rgba(22, 44, 33, 0.06)',
        'gold-glow': '0 0 25px rgba(197, 169, 109, 0.35)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'pulse-subtle': 'pulseSubtle 3s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        }
      }
    },
  },
  plugins: [],
}
