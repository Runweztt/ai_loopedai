import { useScrollReveal } from '../../hooks/useScrollReveal'
import { ShieldCheck, Zap, Globe2, Scale } from 'lucide-react'

const VALUES = [
  { icon: Globe2,      title: 'Official sources only',    desc: 'We fetch from government portals, not travel blogs or outdated forums.' },
  { icon: Zap,         title: 'Instant, not approximate', desc: 'No "usually takes 2-3 weeks" — we give you the actual current data.' },
  { icon: ShieldCheck, title: 'No judgment',              desc: 'Your past, your nationality, your situation. We help everyone equally.' },
  { icon: Scale,       title: 'Research, not legal advice', desc: 'We\'re your intelligent co-pilot. For legal matters, we refer you to vetted lawyers.' },
]

const COUNTRIES = [
  'Canada', 'United Kingdom', 'USA', 'Australia', 'Germany', 'UAE',
  'Schengen Zone', 'Singapore', 'New Zealand', 'Japan', 'Portugal',
  'Netherlands', '+180 more',
]

export default function About() {
  const leftRef  = useScrollReveal()
  const rightRef = useScrollReveal()

  return (
    <section className="py-16 md:py-28 bg-void">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Top heading */}
        <div ref={leftRef} className="max-w-3xl mb-10 md:mb-20">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-gold mb-4">About</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white leading-tight mb-6">
            Built for the people<br />
            <span className="font-serif italic text-slate-text">buried in government PDFs</span>
          </h2>
          <p className="text-slate-text text-base leading-relaxed max-w-2xl">
            Immigration information is scattered across dozens of portals, buried in PDFs, and constantly changing. LoopedAI brings it all together — in real time, for your exact situation.
          </p>
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* Left — values */}
          <div ref={rightRef} className="space-y-6">
            {VALUES.map(v => {
              const Icon = v.icon
              return (
                <div key={v.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-navy-light border border-white/6 flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-gold" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-sm mb-1">{v.title}</h3>
                    <p className="text-sm text-slate-text leading-relaxed">{v.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right — copy + countries */}
          <div className="space-y-6">
            <div className="bg-navy border border-white/6 rounded-xl p-7">
              <p className="text-sm text-slate-text leading-relaxed mb-5">
                <strong className="text-white">We are not lawyers.</strong> We do not issue visas. We are the intelligence layer that makes sure you walk into any application fully prepared — and we connect you to the right legal help when that's what you truly need.
              </p>
              <p className="text-sm text-slate-text leading-relaxed">
                Our multi-agent AI goes directly to official government sources, processes requirements for your exact situation, and reviews your documents to find what needs fixing before you submit.
              </p>
            </div>

            {/* Country grid */}
            <div>
              <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-slate-dim mb-4">Countries covered</p>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES.map(c => (
                  <span key={c} className="text-[11px] font-body text-slate-dim border border-white/6 rounded-full px-3 py-1 hover:border-gold/30 hover:text-gold/70 transition-colors">
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
