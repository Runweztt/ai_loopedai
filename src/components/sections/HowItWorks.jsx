import { useScrollReveal } from '../../hooks/useScrollReveal'
import TerminalBlock from '../ui/TerminalBlock'

const STEPS = [
  {
    n: '01',
    title: 'Ask in plain language',
    desc: 'No forms. No jargon. Just describe your situation — where you want to go, why, and when.',
  },
  {
    n: '02',
    title: 'AI fetches live requirements',
    desc: 'Our agents read official government portals in real time, tailored to your exact nationality and visa type.',
  },
  {
    n: '03',
    title: 'Get your personalized plan',
    desc: 'Receive documents, timelines, financial thresholds, and a checklist — built for your specific case.',
  },
  {
    n: '04',
    title: 'Submit with confidence',
    desc: 'Upload your documents for AI review. Get pass/fail feedback before you press submit.',
  },
]

function Step({ step }) {
  const ref = useScrollReveal()
  return (
    <div ref={ref} className="flex gap-5 py-7 border-b border-white/5 last:border-0 group">
      <span className="font-mono text-xs text-slate-dim pt-1 w-8 shrink-0 group-hover:text-gold transition-colors duration-300">
        {step.n}
      </span>
      <div>
        <h3 className="font-display font-bold text-white text-base mb-1.5">{step.title}</h3>
        <p className="text-sm text-slate-text leading-relaxed">{step.desc}</p>
      </div>
    </div>
  )
}

export default function HowItWorks() {
  const ref = useScrollReveal()
  return (
    <section className="py-28 bg-navy/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div ref={ref} className="max-w-xl mb-16">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-gold mb-4">How it works</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white leading-tight">
            From question<br />
            <span className="font-serif italic text-slate-text">to clarity</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>{STEPS.map(s => <Step key={s.n} step={s} />)}</div>
          <div><TerminalBlock /></div>
        </div>
      </div>
    </section>
  )
}
