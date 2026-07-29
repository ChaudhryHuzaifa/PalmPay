/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        // PalmPay Brand Colors
        'palm': {
          'primary': '#00D4AA',
          'secondary': '#0095FF',
          'accent': '#8B5CF6',
          'dark': '#0A0F1E',
          'light': '#F0F9FF'
        },
        // Extended Colors
        'cyber': {
          'teal': '#00D4AA',
          'blue': '#0095FF',
          'purple': '#8B5CF6',
          'pink': '#EC4899',
          'orange': '#F97316'
        },
        // Glass Colors
        'glass': {
          'white': 'rgba(255, 255, 255, 0.1)',
          'dark': 'rgba(0, 0, 0, 0.2)',
          'primary': 'rgba(0, 212, 170, 0.1)',
          'secondary': 'rgba(0, 149, 255, 0.1)'
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        'mono': ['JetBrains Mono', 'monospace'],
        'display': ['Poppins', 'sans-serif']
      },
      animation: {
        // Extended Animations
        'spin-slow': 'spin 20s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'holographic-shimmer': 'holographic-shimmer 3s ease-in-out infinite',
        'liquid-morph': 'liquid-morph 8s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 5s ease infinite',
        'scan-line': 'scan-line 2s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        'slide-in-up': 'slide-in-up 0.3s ease-out',
        'slide-in-down': 'slide-in-down 0.3s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
        'fade-out': 'fade-out 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'scale-out': 'scale-out 0.3s ease-out',
        'rotate-in': 'rotate-in 0.5s ease-out',
        'rotate-out': 'rotate-out 0.5s ease-out'
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' }
        },
        'holographic-shimmer': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' }
        },
        'liquid-morph': {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' }
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' }
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' }
        },
        'wiggle': {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' }
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'slide-in-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'slide-in-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        'scale-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' }
        },
        'rotate-in': {
          '0%': { transform: 'rotate(-180deg)', opacity: '0' },
          '100%': { transform: 'rotate(0deg)', opacity: '1' }
        },
        'rotate-out': {
          '0%': { transform: 'rotate(0deg)', opacity: '1' },
          '100%': { transform: 'rotate(180deg)', opacity: '0' }
        }
      },
      backgroundImage: {
        // Gradient Presets
        'palm-gradient': 'linear-gradient(135deg, #00D4AA, #0095FF)',
        'palm-gradient-dark': 'linear-gradient(135deg, #006B53, #0047B3)',
        'cyber-gradient': 'linear-gradient(135deg, #00D4AA, #0095FF, #8B5CF6)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
        'dark-gradient': 'linear-gradient(135deg, #0f172a, #1e293b, #334155)',
        // Grid Patterns
        'cyber-grid': 'linear-gradient(rgba(0, 212, 170, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 170, 0.05) 1px, transparent 1px)',
        'dot-grid': 'radial-gradient(circle at 25% 25%, rgba(0, 212, 170, 0.1) 2px, transparent 2px), radial-gradient(circle at 75% 75%, rgba(0, 149, 255, 0.1) 2px, transparent 2px)'
      },
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px'
      },
      boxShadow: {
        // Glass Shadows
        'glass': '0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass-lg': '0 20px 60px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
        // Glow Shadows
        'glow-primary': '0 0 30px rgba(0, 212, 170, 0.3), 0 0 60px rgba(0, 212, 170, 0.2), 0 0 90px rgba(0, 212, 170, 0.1)',
        'glow-secondary': '0 0 30px rgba(0, 149, 255, 0.3), 0 0 60px rgba(0, 149, 255, 0.2)',
        'glow-accent': '0 0 30px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.2)',
        // 3D Shadows
        '3d': '0 10px 30px rgba(0, 0, 0, 0.3), 0 1px 0 rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      },
      borderRadius: {
        'glass': '20px',
        'glass-lg': '30px',
        'glass-xl': '40px',
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem'
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
        '42': '10.5rem',
        '46': '11.5rem',
        '50': '12.5rem',
        '54': '13.5rem',
        '58': '14.5rem',
        '62': '15.5rem',
        '66': '16.5rem',
        '70': '17.5rem',
        '74': '18.5rem',
        '78': '19.5rem',
        '82': '20.5rem',
        '86': '21.5rem',
        '90': '22.5rem',
        '94': '23.5rem',
        '98': '24.5rem'
      },
      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        '10xl': '104rem'
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1000': '1000ms',
        '1200': '1200ms',
        '1500': '1500ms',
        '2000': '2000ms'
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'material': 'cubic-bezier(0.4, 0.0, 0.2, 1)'
      },
      scale: {
        '102': '1.02',
        '103': '1.03',
        '104': '1.04',
        '105': '1.05'
      },
      rotate: {
        '15': '15deg',
        '30': '30deg',
        '45': '45deg',
        '60': '60deg',
        '75': '75deg',
        '90': '90deg',
        '105': '105deg',
        '120': '120deg',
        '135': '135deg',
        '150': '150deg',
        '165': '165deg',
        '180': '180deg'
      },
      skew: {
        '15': '15deg',
        '30': '30deg',
        '45': '45deg',
        '60': '60deg'
      }
    },
  },
  plugins: [],
}