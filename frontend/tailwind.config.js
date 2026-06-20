/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#15171c',
        surface: '#1c1f26',
        surfaceRaised: '#22252e',
        border: '#2a2e38',
        ink: '#eef0f3',
        inkMuted: '#9097a6',
        inkFaint: '#5b6170',
        primary: {
          DEFAULT: '#6c63ff',
          dim: '#564fcc',
          bright: '#857dff'
        },
        accent: {
          DEFAULT: '#ffb454',
          dim: '#cc903f'
        },
        success: '#34d399',
        danger: '#f87171',
        warning: '#fbbf24'
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 0 rgba(255,255,255,0.04), 0 8px 24px rgba(0,0,0,0.35)',
        raised: '0 4px 16px rgba(0,0,0,0.45)'
      },
      borderRadius: {
        xl2: '1.25rem'
      },
      backgroundImage: {
        'grain': "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)"
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(4px) scale(0.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' }
        },
        fadeInUp: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' }
        },
        modalPop: {
          '0%': { opacity: 0, transform: 'perspective(900px) translateY(14px) rotateX(6deg) scale(0.97)' },
          '100%': { opacity: 1, transform: 'perspective(900px) translateY(0) rotateX(0deg) scale(1)' }
        },
        float: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -16px, 0)' }
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.15s ease-out',
        fadeInUp: 'fadeInUp 0.45s ease-out backwards',
        modalPop: 'modalPop 0.22s cubic-bezier(0.16, 1, 0.3, 1) backwards',
        float: 'float 7s ease-in-out infinite',
        floatSlow: 'float 11s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
