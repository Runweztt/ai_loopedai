import { useEffect, useState, useRef } from 'react'
import logo from '../../assets/logo-06.png'
import { ArrowRight } from 'lucide-react'

// ── Conversation steps ──────────────────────────────────────────────────────
const STEPS = [
  { wait: 500,  typing: false, msg: { role: 'user',      text: 'I\'m Rwandan — can I get a Germany job seeker visa?' } },
  { wait: 900,  typing: true,  msg: { role: 'assistant', text: 'Yes! Rwanda is eligible. Here\'s what you need:' } },
  { wait: 400,  typing: false, msg: { role: 'checklist', items: [
    { done: true,  label: 'University degree (recognized)' },
    { done: true,  label: 'Proof of funds — €5,000+' },
    { done: false, label: 'Health insurance coverage' },
    { done: false, label: 'German language B1 certificate' },
  ]}},
  { wait: 1100, typing: true,  msg: { role: 'assistant', text: 'Visa valid for 6 months — 2 documents still needed. Want help preparing them?' } },
]

// ── Animated bubble ─────────────────────────────────────────────────────────
function Bubble({ m }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 40); return () => clearTimeout(t) }, [])

  const anim = `transition-all duration-500 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`

  if (m.role === 'user') return (
    <div className={`flex justify-end ${anim}`}>
      <div className="bg-gold text-gray-900 text-xs font-medium rounded-2xl rounded-br-none px-3.5 py-2.5 max-w-[78%] leading-relaxed shadow-sm">
        {m.text}
      </div>
    </div>
  )

  if (m.role === 'checklist') return (
    <div className={`bg-gray-50 border border-gray-100 rounded-2xl px-3.5 py-3 space-y-2 ${anim}`}>
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
    <div className={`flex justify-start ${anim}`}>
      <div className="bg-white border border-gray-100 text-gray-700 text-xs rounded-2xl rounded-bl-none px-3.5 py-2.5 max-w-[88%] leading-relaxed shadow-sm">
        {m.text}
      </div>
    </div>
  )
}

function TypingBubble() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVisible(true), 40); return () => clearTimeout(t) }, [])
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

// ── Main component ──────────────────────────────────────────────────────────
export default function TerminalBlock({ autoStart = false }) {
  const ref        = useRef(null)
  const [messages, setMessages] = useState([])
  const [typing,   setTyping]   = useState(false)
  const [cycle,    setCycle]    = useState(0)
  const [active,   setActive]   = useState(autoStart)

  // Start on scroll into view
  useEffect(() => {
    if (autoStart) { setActive(true); return }
    const observer = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setActive(true); observer.disconnect() } },
      { threshold: 0.25 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [autoStart])

  // Run conversation when active or on loop cycle
  useEffect(() => {
    if (!active) return
    let cancelled = false
    setMessages([])
    setTyping(false)

    const run = async () => {
      for (const step of STEPS) {
        await new Promise(r => setTimeout(r, step.wait))
        if (cancelled) return
        if (step.typing) {
          setTyping(true)
          await new Promise(r => setTimeout(r, 950))
          if (cancelled) return
          setTyping(false)
          await new Promise(r => setTimeout(r, 80))
          if (cancelled) return
        }
        setMessages(prev => [...prev, step.msg])
      }
      await new Promise(r => setTimeout(r, 3500))
      if (!cancelled) setCycle(c => c + 1)
    }

    run()
    return () => { cancelled = true }
  }, [active, cycle])

  return (
    <div
      ref={ref}
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
