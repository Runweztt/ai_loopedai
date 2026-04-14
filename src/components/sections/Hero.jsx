import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Globe, FileCheck, Clock } from 'lucide-react'

const ROTATING_WORDS = ['Canada', 'UK', 'Germany', 'Australia', 'UAE', 'Singapore', 'Portugal', 'Japan']

function RotatingWord() {
  const [index,   setIndex]   = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => { setIndex(i => (i + 1) % ROTATING_WORDS.length); setVisible(true) }, 300)
    }, 2200)
    return () => clearInterval(t)
  }, [])

  return (
    <span
      className={`text-gold font-serif italic transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
      style={{ display: 'inline-block' }}
    >
      {ROTATING_WORDS[index]}
    </span>
  )
}

const FEATURES = [
  { icon: Globe,     label: '190+ countries covered' },
  { icon: FileCheck, label: 'Document AI review' },
  { icon: Clock,     label: 'Instant answers, 24/7' },
]

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-white">

      {/* ── Subtle warm gradient orbs ─────────────────────────────── */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,160,23,0.07) 0%, transparent 70%)' }}
      />
      <div
        className="absolute bottom-[-5%] left-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(29,69,191,0.05) 0%, transparent 70%)' }}
      />

      {/* ── Dot grid pattern ─────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.35]"
        style={{
          backgroundImage: 'radial-gradient(circle, #D1D5DB 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-32 md:pt-36 pb-14 md:pb-24 w-full">
        <div className="max-w-4xl">

          {/* ── Badge ──────────────────────────────────────────────── */}
          <div
            className="badge-gold mb-7 opacity-0 animate-fade-up"
            style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-glow-pulse inline-block" />
            AI Immigration Intelligence — Live Data
          </div>

          {/* ── Headline ───────────────────────────────────────────── */}
          <h1
            className="font-display font-extrabold text-4xl md:text-6xl lg:text-7xl leading-[1.06] tracking-tight mb-5 md:mb-6 text-gray-900 opacity-0 animate-fade-up"
            style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
          >
            Move to{' '}
            <RotatingWord />
            <br />
            <span className="text-gray-900">without the</span>
            <br />
            <span className="text-gradient">confusion.</span>
          </h1>

          {/* ── Subtitle ───────────────────────────────────────────── */}
          <p
            className="text-base md:text-lg text-gray-500 leading-relaxed max-w-2xl mb-10 opacity-0 animate-fade-up"
            style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
          >
            LoopedAI reads official government portals in real time, builds your exact document checklist, and reviews your files before you submit — so you arrive prepared, not guessing.
          </p>

          {/* ── CTAs ───────────────────────────────────────────────── */}
          <div
            className="flex flex-wrap items-center gap-4 mb-10 md:mb-16 opacity-0 animate-fade-up"
            style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
          >
            <Link to="/chat" className="btn-primary group">
              Start for free
              <ArrowRight size={15} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/guide"
              className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              See how it works
              <ArrowRight size={14} className="opacity-50" />
            </Link>
          </div>

          {/* ── Feature pills ──────────────────────────────────────── */}
          <div
            className="flex flex-wrap gap-3 opacity-0 animate-fade-up"
            style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
          >
            {FEATURES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm"
              >
                <Icon size={13} className="text-gold" />
                <span className="text-xs font-medium text-gray-600">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Terminal card visual ───────────────────────────────────── */}
        <div
          className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-[380px] opacity-0 animate-fade-up"
          style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
        >
          <TerminalCard />
        </div>
      </div>
    </section>
  )
}

// ── Terminal lines ──────────────────────────────────────────────────────────
const LINES = [
  { delay: 0,    text: '→ Checking Canada Study Permit...',  color: 'text-gray-400' },
  { delay: 800,  text: '✓ IRCC portal — updated 3 days ago', color: 'text-emerald-400' },
  { delay: 1600, text: '✓ 11 documents required',            color: 'text-emerald-400' },
  { delay: 2400, text: '⚡ Min. funds: CAD $10,000',         color: 'text-yellow-400' },
  { delay: 3200, text: '✓ Your passport: eligible',          color: 'text-emerald-400' },
  { delay: 4000, text: '→ Building your checklist...',       color: 'text-gray-400' },
  { delay: 4800, text: '✓ Done — 3 items need attention',    color: 'text-emerald-400' },
]

function TerminalCard() {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const timers = LINES.map((l, i) => setTimeout(() => setShown(i + 1), l.delay + 1000))
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: '#0D1526', boxShadow: '0 4px 6px rgba(0,0,0,0.07), 0 24px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.06)' }}
    >
      {/* Header bar */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/6" style={{ background: 'rgba(255,255,255,0.04)' }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
        </div>
        <span className="ml-2 text-xs font-mono text-gray-500">loopedai — research agent</span>
      </div>
      {/* Body */}
      <div className="p-5 space-y-2 min-h-[220px] font-mono text-xs">
        {LINES.slice(0, shown).map((l, i) => (
          <p key={i} className={`${l.color} leading-relaxed`}>{l.text}</p>
        ))}
        <span className="inline-block w-1.5 h-4 bg-yellow-400/70 animate-blink align-middle" />
      </div>
    </div>
  )
}
