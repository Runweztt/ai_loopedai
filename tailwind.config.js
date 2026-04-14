/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ── Base surfaces ─────────────────────────────────────────────
        void:           '#FFFFFF',      // page background
        navy:           '#F9FAFB',      // subtle card / alt-section bg
        'navy-light':   '#F3F4F6',      // deeper surface / hover
        // ── Brand ─────────────────────────────────────────────────────
        'blue-brand':   '#1D45BF',
        'blue-muted':   '#2A3F8F',
        gold:           '#D4A017',      // richer, more professional gold
        'gold-muted':   '#B8860B',
        'gold-light':   '#FEF3C7',      // pale gold tint for badges
        // ── Text ──────────────────────────────────────────────────────
        'slate-text':   '#6B7280',      // body secondary text
        'slate-dim':    '#9CA3AF',      // muted / disabled text
        // ── App / chat UI tokens ─────────────────────────────────────
        'premium-gold': '#D4A017',
        'premium-dark': '#0A0A0A',
        'premium-blue': '#1D45BF',
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
          '50%':      { opacity: '0.9' },
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
        'gold-glow': '0 0 0 1px rgba(212,160,23,0.3), 0 4px 12px rgba(212,160,23,0.2)',
        'blue-glow': '0 0 60px rgba(29,69,191,0.15)',
        // Card shadows — proper depth for white background
        'card':      '0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover':'0 2px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.10)',
        'nav':       '0 1px 0 rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
        'btn':       '0 1px 2px rgba(0,0,0,0.08), 0 2px 8px rgba(212,160,23,0.25)',
      },
    },
  },
  plugins: [],
}
