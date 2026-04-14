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
    <div ref={ref} className="flex gap-5 py-6 border-b border-gray-100 last:border-0 group">
      <span className="font-mono text-xs font-bold text-gray-300 pt-0.5 w-8 shrink-0 group-hover:text-gold transition-colors duration-250">
        {step.n}
      </span>
      <div>
        <h3 className="font-display font-bold text-gray-900 text-[15px] mb-1.5">{step.title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
      </div>
    </div>
  )
}

export default function HowItWorks() {
  const ref = useScrollReveal()
  return (
    <section className="py-16 md:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div ref={ref} className="max-w-xl mb-10 md:mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-3">How it works</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-gray-900 leading-tight">
            From question<br />
            <span className="font-serif italic text-gray-400">to clarity</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 items-center">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card px-6 py-2">
            {STEPS.map(s => <Step key={s.n} step={s} />)}
          </div>
          <div><TerminalBlock /></div>
        </div>
      </div>
    </section>
  )
}
