import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Globe, FileCheck, Clock } from 'lucide-react'

const ROTATING_WORDS = ['Canada', 'UK', 'Germany', 'Australia', 'UAE', 'Singapore', 'Portugal', 'Japan']

function RotatingWord() {
  const [index, setIndex]     = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % ROTATING_WORDS.length)
        setVisible(true)
      }, 300)
    }, 2000)
    return () => clearInterval(t)
  }, [])

  return (
    <span
      className={`text-gold font-serif italic transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
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
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-void">

      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#3353B8 1px, transparent 1px), linear-gradient(90deg, #3353B8 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-[-10%] right-[10%] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(29,69,191,0.12) 0%, transparent 70%)' }} />
      <div className="absolute bottom-[-10%] left-[5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(233,179,8,0.06) 0%, transparent 70%)' }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-32 md:pt-36 pb-14 md:pb-24 w-full">
        <div className="max-w-4xl">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 border border-blue-muted/40 bg-blue-brand/10 rounded-full px-4 py-1.5 mb-6 md:mb-8 opacity-0 animate-fade-up"
            style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-glow-pulse" />
            <span className="text-xs font-body text-slate-text tracking-wide">AI Immigration Intelligence — Live Data</span>
          </div>

          {/* Headline */}
          <h1
            className="font-display font-extrabold text-4xl md:text-6xl lg:text-7xl leading-[1.08] tracking-tight mb-5 md:mb-6 opacity-0 animate-fade-up"
            style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
          >
            Move to{' '}
            <RotatingWord />
            <br />
            <span className="text-white">without the</span>
            <br />
            <span className="text-gradient">confusion.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="text-base md:text-lg text-slate-text font-body leading-relaxed max-w-2xl mb-10 opacity-0 animate-fade-up"
            style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
          >
            loopedai reads official government portals in real time, builds your exact document checklist, and reviews your files before you submit — so you arrive prepared, not guessing.
          </p>

          {/* CTAs */}
          <div
            className="flex flex-wrap items-center gap-4 mb-10 md:mb-16 opacity-0 animate-fade-up"
            style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
          >
            <Link
              to="/chat"
              className="inline-flex items-center gap-2.5 bg-gold text-void font-body font-semibold text-sm px-7 py-3.5 rounded-md hover:bg-gold/90 transition-all duration-200 shadow-gold-glow group"
            >
              Start for free
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/guide"
              className="inline-flex items-center gap-2 text-sm font-body text-slate-text hover:text-white transition-colors"
            >
              See how it works
              <ArrowRight size={14} className="opacity-50" />
            </Link>
          </div>

          {/* Feature pills */}
          <div
            className="flex flex-wrap gap-3 opacity-0 animate-fade-up"
            style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}
          >
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 bg-navy-light/60 border border-white/6 rounded-full px-4 py-2">
                <Icon size={13} className="text-gold" />
                <span className="text-xs font-body text-slate-text">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Floating card visual */}
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

const LINES = [
  { delay: 0,    text: '→ Checking Canada Study Permit...',     color: 'text-slate-text' },
  { delay: 800,  text: '✓ IRCC portal — updated 3 days ago',    color: 'text-emerald-400' },
  { delay: 1600, text: '✓ 11 documents required',               color: 'text-emerald-400' },
  { delay: 2400, text: '⚡ Min. funds: CAD $10,000',            color: 'text-gold' },
  { delay: 3200, text: '✓ Your passport: eligible',             color: 'text-emerald-400' },
  { delay: 4000, text: '→ Building your checklist...',          color: 'text-slate-text' },
  { delay: 4800, text: '✓ Done — 3 items need attention',       color: 'text-emerald-400' },
]

function TerminalCard() {
  const [shown, setShown] = useState(0)

  useEffect(() => {
    const timers = LINES.map((l, i) =>
      setTimeout(() => setShown(i + 1), l.delay + 1000)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="bg-navy border border-white/8 rounded-xl overflow-hidden shadow-card">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/6 bg-navy-light/40">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/60" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
        </div>
        <span className="ml-2 text-xs font-mono text-slate-dim">loopedai — research agent</span>
      </div>
      {/* Terminal body */}
      <div className="p-5 space-y-2 min-h-[220px] font-mono text-xs">
        {LINES.slice(0, shown).map((l, i) => (
          <p key={i} className={`${l.color} leading-relaxed`}>{l.text}</p>
        ))}
        <span className="inline-block w-1.5 h-4 bg-gold/70 animate-blink align-middle" />
      </div>
    </div>
  )
}
