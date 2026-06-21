/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'deep-void': '#020617',
        background: '#0c1324',
        'on-background': '#dce1fb',
        surface: '#0c1324',
        'surface-container-lowest': '#070d1f',
        'surface-container-low': '#151b2d',
        'surface-container': '#191f31',
        'surface-container-high': '#23293c',
        'surface-container-highest': '#2e3447',
        'surface-variant': '#2e3447',
        'on-surface': '#dce1fb',
        'on-surface-variant': '#c4c7c8',
        outline: '#8e9192',
        'outline-variant': '#444748',
        primary: '#ffffff',
        'on-primary': '#2f3131',
        'starlight-white': '#ffffff',
        'nebula-blue': '#38BDF8',
        'nova-violet': '#818CF8',
        'interface-gray': '#1E293B',
        'node-glow': 'rgba(99, 102, 241, 0.4)',
        error: '#ffb4ab',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        label: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0.5rem',
        lg: '1rem',
        xl: '1.5rem',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { filter: 'drop-shadow(0 0 15px rgba(129,140,248,0.6))', transform: 'scale(1)' },
          '50%': { filter: 'drop-shadow(0 0 30px rgba(129,140,248,0.9))', transform: 'scale(1.05)' },
        },
        'supernova-burst': {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(40)', opacity: '0' },
        },
        twinkle: {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '1' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'supernova-burst': 'supernova-burst 0.8s ease-out forwards',
        twinkle: 'twinkle 3s ease-in-out infinite',
        'fade-up': 'fade-up 0.3s ease-out forwards',
      },
    },
  },
  plugins: [],
}
