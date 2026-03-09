import { useEffect, useState, useRef } from 'react'

const LINES = [
  { text: '→  init visa_research --dest="Canada" --visa="study_permit"', color: 'text-slate-text' },
  { text: '✓  IRCC portal connected — last updated 3 days ago',         color: 'text-emerald-400' },
  { text: '✓  12 documents required for RW national',                    color: 'text-emerald-400' },
  { text: '→  build_checklist --nationality="RW" --program="MSc"',      color: 'text-slate-text' },
  { text: '⚡ Financial threshold: CAD $10,000 minimum',                color: 'text-gold' },
  { text: '✓  Checklist built — 3 items flagged for review',            color: 'text-emerald-400' },
  { text: '→  review_documents --upload="transcript.pdf"',              color: 'text-slate-text' },
  { text: '✓  Analysis complete — 1 issue found',                       color: 'text-emerald-400' },
  { text: '⚠  Transcript must be officially certified (notarized)',     color: 'text-gold' },
]

export default function TerminalBlock({ autoStart = false }) {
  const [shown, setShown]   = useState(0)
  const ref                 = useRef(null)
  const started             = useRef(false)

  useEffect(() => {
    if (autoStart) { started.current = true }
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        observer.disconnect()
      }
    }, { threshold: 0.3 })

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [autoStart])

  useEffect(() => {
    if (!started.current && shown === 0) return
    if (shown >= LINES.length) return
    const t = setTimeout(() => setShown(v => v + 1), shown === 0 ? 0 : 500)
    return () => clearTimeout(t)
  }, [shown, started.current])

  // Trigger on scroll into view
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && shown === 0) { setShown(1) }
    }, { threshold: 0.3 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className="bg-[#070F1E] border border-white/8 rounded-xl overflow-hidden shadow-card">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/6 bg-navy/60">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-400/50" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
        </div>
        <span className="ml-2 text-xs font-mono text-slate-dim">loopedai — research agent</span>
      </div>
      <div className="p-6 space-y-2.5 font-mono text-xs min-h-[240px]">
        {LINES.slice(0, shown).map((l, i) => (
          <p key={i} className={`${l.color} leading-relaxed`}>{l.text}</p>
        ))}
        {shown < LINES.length && (
          <span className="inline-block w-1.5 h-4 bg-gold/60 animate-blink align-middle ml-0.5" />
        )}
      </div>
    </div>
  )
}
