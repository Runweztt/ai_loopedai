import { Link } from 'react-router-dom'
import { ArrowRight, MessageSquare } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

export default function CTASection() {
  const ref = useScrollReveal()
  return (
    <section className="py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-void via-navy/60 to-void pointer-events-none" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(29,69,191,0.18) 0%, transparent 70%)' }}
      />

      <div ref={ref} className="relative max-w-3xl mx-auto px-6 text-center">
        <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-gold mb-5">
          Ready to start?
        </p>
        <h2 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6">
          Your next country starts<br />
          with <span className="font-serif italic text-gold">one question</span>
        </h2>
        <p className="text-slate-text text-base leading-relaxed mb-10 max-w-xl mx-auto">
          Free to use. No signup friction. No expensive consultants. Just accurate, real-time immigration intelligence.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/chat"
            className="inline-flex items-center gap-3 bg-gold text-void font-body font-semibold text-base px-8 py-4 rounded-md hover:bg-gold/90 transition-all duration-200 shadow-gold-glow group"
          >
            <MessageSquare size={17} />
            Chat with LoopedAI
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/guide"
            className="inline-flex items-center gap-2 border border-white/12 text-slate-text text-sm font-body px-6 py-4 rounded-md hover:border-white/25 hover:text-white transition-all duration-200"
          >
            See the prompt guide
          </Link>
        </div>

        <p className="mt-8 text-xs font-body text-slate-dim">
          Free to start · No lawyer required · 190+ countries · Live official data
        </p>
      </div>
    </section>
  )
}
