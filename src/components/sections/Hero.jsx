import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Globe, FileCheck, Clock } from 'lucide-react'
import logo from '../../assets/logo-06.png'

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
            LoopedAI reads official government portals in real time, builds your exact document checklist, and reviews your files before you submit so you arrive prepared, not guessing.
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

        {/* ── Chat card visual ──────────────────────────────────────── */}
        <div
          className="hidden lg:block absolute right-8 top-[38%] -translate-y-1/2 w-[370px] opacity-0 animate-fade-up"
          style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}
        >
          <ChatCard />
        </div>
      </div>
    </section>
  )
}

// ── Chat messages ───────────────────────────────────────────────────────────
const STEPS = [
  // [waitBefore, showTyping, message]
  { wait: 600,  typing: false, msg: { role: 'user',      text: 'What documents do I need for a Canada study permit?' } },
  { wait: 800,  typing: true,  msg: { role: 'assistant', text: 'Sure! Here\'s your document checklist for Canada:' } },
  { wait: 500,  typing: false, msg: { role: 'checklist', items: [
    { done: true,  label: 'Valid passport (6+ months)' },
    { done: true,  label: 'Letter of acceptance' },
    { done: false, label: 'Proof of funds — CAD $10,000' },
    { done: false, label: 'Biometrics appointment' },
  ]}},
  { wait: 1200, typing: true,  msg: { role: 'assistant', text: '2 items need attention before you submit. Want me to guide you through them?' } },
]

// A single message bubble that fades + slides up on mount
function Bubble({ m, isNew }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 30); return () => clearTimeout(t) }, [])

  const base = 'transition-all duration-500 ease-out'
  const enter = visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'

  if (m.role === 'user') return (
    <div className={`flex justify-end ${base} ${enter}`}>
      <div className="bg-gold text-gray-900 text-xs font-medium rounded-2xl rounded-br-none px-3.5 py-2.5 max-w-[78%] leading-relaxed shadow-sm">
        {m.text}
      </div>
    </div>
  )

  if (m.role === 'checklist') return (
    <div className={`bg-gray-50 border border-gray-100 rounded-2xl px-3.5 py-3 space-y-2 ${base} ${enter}`}>
      {m.items.map((item, j) => (
        <div key={j} className="flex items-center gap-2.5">
          <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold
            ${item.done ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-50 text-gold border border-gold/40'}`}>
            {item.done ? '✓' : '!'}
          </span>
          <span className={`text-[11px] leading-snug ${item.done ? 'text-gray-400 line-through' : 'text-gray-700 font-medium'}`}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )

  return (
    <div className={`flex justify-start ${base} ${enter}`}>
      <div className="bg-white border border-gray-100 text-gray-700 text-xs rounded-2xl rounded-bl-none px-3.5 py-2.5 max-w-[88%] leading-relaxed shadow-sm">
        {m.text}
      </div>
    </div>
  )
}

function TypingBubble() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 30); return () => clearTimeout(t) }, [])
  return (
    <div className={`flex justify-start transition-all duration-400 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-3.5 py-3 flex gap-1.5 items-center shadow-sm">
        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '160ms' }} />
        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '320ms' }} />
      </div>
    </div>
  )
}

function ChatCard() {
  const [messages, setMessages] = useState([])
  const [typing, setTyping]     = useState(false)
  const [cycle, setCycle]       = useState(0)

  useEffect(() => {
    let cancelled = false
    setMessages([])
    setTyping(false)

    const run = async () => {
      for (const step of STEPS) {
        await new Promise(r => setTimeout(r, step.wait))
        if (cancelled) return

        if (step.typing) {
          setTyping(true)
          await new Promise(r => setTimeout(r, 900))
          if (cancelled) return
          setTyping(false)
          await new Promise(r => setTimeout(r, 80))
          if (cancelled) return
        }

        setMessages(prev => [...prev, step.msg])
      }

      // pause then restart loop
      await new Promise(r => setTimeout(r, 3500))
      if (!cancelled) setCycle(c => c + 1)
    }

    run()
    return () => { cancelled = true }
  }, [cycle])

  return (
    <div
      className="rounded-2xl bg-white border border-gray-100 overflow-hidden"
      style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.03), 0 20px 40px rgba(0,0,0,0.09), 0 0 0 1px rgba(0,0,0,0.04)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
        <div
          style={{
            width: '28px', height: '28px', flexShrink: 0,
            backgroundImage: `url(${logo})`,
            backgroundSize: '157px',
            backgroundPosition: '-20px -60px',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-800 leading-none">LoopedAI</p>
          <p className="text-[10px] text-emerald-500 font-medium mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            Online · Immigration AI
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="p-4 space-y-3 min-h-[268px] flex flex-col justify-end">
        {messages.map((m, i) => <Bubble key={`${cycle}-${i}`} m={m} />)}
        {typing && <TypingBubble key={`typing-${cycle}-${messages.length}`} />}
      </div>

      {/* Input bar */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2 bg-gray-50/40">
        <div className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-[11px] text-gray-400 shadow-sm">
          Ask about visas, permits, documents…
        </div>
        <div className="w-7 h-7 bg-gold rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
          <ArrowRight size={12} className="text-gray-900" />
        </div>
      </div>
    </div>
  )
}
