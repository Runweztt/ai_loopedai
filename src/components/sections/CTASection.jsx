import { Link } from 'react-router-dom'
import { ArrowRight, MessageSquare } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

export default function CTASection() {
  const ref = useScrollReveal()
  return (
    <section className="py-16 md:py-32 relative overflow-hidden bg-gray-50">
      {/* Subtle warm glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(212,160,23,0.08) 0%, transparent 70%)' }}
      />

      <div ref={ref} className="relative max-w-3xl mx-auto px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-5">
          Ready to start?
        </p>
        <h2 className="font-display font-extrabold text-4xl md:text-5xl lg:text-6xl text-gray-900 leading-tight mb-6">
          Your next country starts<br />
          with <span className="font-serif italic text-gold">one question</span>
        </h2>
        <p className="text-gray-500 text-base leading-relaxed mb-10 max-w-xl mx-auto">
          Free to use. No signup friction. No expensive consultants. Just accurate, real-time immigration intelligence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/chat"
            className="btn-primary group w-full sm:w-auto justify-center"
          >
            <MessageSquare size={16} />
            Chat with LoopedAI
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/guide"
            className="btn-secondary w-full sm:w-auto justify-center"
          >
            See the prompt guide
          </Link>
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Free to start · No lawyer required · 190+ countries · Live official data
        </p>
      </div>
    </section>
  )
}
