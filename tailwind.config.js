/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void:         '#050B1B',
        navy:         '#0D1526',
        'navy-light':  '#1A2540',
        'blue-brand':  '#1D45BF',
        'blue-muted':  '#2A3F8F',
        gold:          '#E9B308',
        'gold-muted':  '#A07C06',
        'slate-text':  '#94A3B8',
        'slate-dim':   '#475569',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body:    ['Inter', 'sans-serif'],
        serif:   ['Instrument Serif', 'serif'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      animation: {
        'ticker':       'ticker 40s linear infinite',
        'fade-up':      'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
        'fade-in':      'fadeIn 0.5s ease forwards',
        'glow-pulse':   'glowPulse 3s ease-in-out infinite',
        'blink':        'blink 1.1s step-end infinite',
        'slide-right':  'slideRight 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'scan-line':    'scanLine 4s ease-in-out infinite',
      },
      keyframes: {
        ticker: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%':      { opacity: '0.8' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
        slideRight: {
          from: { transform: 'scaleX(0)' },
          to:   { transform: 'scaleX(1)' },
        },
        scanLine: {
          '0%':   { top: '0%', opacity: '0' },
          '10%':  { opacity: '1' },
          '90%':  { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
      },
      boxShadow: {
        'gold-glow': '0 0 40px rgba(233,179,8,0.15)',
        'blue-glow': '0 0 60px rgba(29,69,191,0.2)',
        'card':      '0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}
