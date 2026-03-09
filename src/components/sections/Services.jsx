import { useScrollReveal } from '../../hooks/useScrollReveal'
import { Search, FileText, CalendarDays, BarChart3, ListChecks, Users } from 'lucide-react'

const SERVICES = [
  {
    icon: Search,
    title: 'Visa Research',
    desc: 'Live requirements fetched from official government portals. Always current, always accurate for your nationality.',
    tag: 'Real-time',
    accent: 'bg-blue-brand/10 text-blue-300',
  },
  {
    icon: FileText,
    title: 'Document Review',
    desc: 'Upload your documents. AI scores each one pass or fail and tells you exactly what to fix before you submit.',
    tag: 'AI scoring',
    accent: 'bg-gold/10 text-gold',
  },
  {
    icon: CalendarDays,
    title: 'Timeline Planning',
    desc: 'Get a personalized backward timeline from today to your target move date, accounting for processing delays.',
    tag: 'Personalized',
    accent: 'bg-emerald-500/10 text-emerald-400',
  },
  {
    icon: BarChart3,
    title: 'Country Comparison',
    desc: 'Compare immigration pathways side-by-side across multiple countries. Find your best option fast.',
    tag: 'Multi-country',
    accent: 'bg-purple-500/10 text-purple-400',
  },
  {
    icon: ListChecks,
    title: 'Pre-Application Checklist',
    desc: 'Interactive checklist built for your exact visa type and nationality. Check off each item as you complete it.',
    tag: 'Interactive',
    accent: 'bg-cyan-500/10 text-cyan-400',
  },
  {
    icon: Users,
    title: 'Lawyer Referrals',
    desc: 'When you need human expertise, we connect you to vetted immigration lawyers in your destination country.',
    tag: 'Expert network',
    accent: 'bg-rose-500/10 text-rose-400',
  },
]

function Card({ service, index }) {
  const ref = useScrollReveal()
  const Icon = service.icon
  return (
    <div
      ref={ref}
      className="group relative bg-navy border border-white/6 rounded-xl p-6 hover:border-white/12 hover:bg-navy-light/60 transition-all duration-300"
    >
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-5 ${service.accent}`}>
        <Icon size={18} />
      </div>
      <h3 className="font-display font-bold text-white text-base mb-2">{service.title}</h3>
      <p className="text-sm text-slate-text leading-relaxed mb-5">{service.desc}</p>
      <span className={`text-[10px] font-body font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full ${service.accent}`}>
        {service.tag}
      </span>
      {/* Hover line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gold/40 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500 rounded-b-xl" />
    </div>
  )
}

export default function Services() {
  const ref = useScrollReveal()
  return (
    <section className="py-28 bg-void">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div ref={ref} className="max-w-2xl mb-16">
          <p className="text-xs font-body font-semibold uppercase tracking-[0.2em] text-gold mb-4">What we do</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-white leading-tight mb-4">
            Intelligence for every<br />
            <span className="font-serif italic text-gold">stage of your move</span>
          </h2>
          <p className="text-slate-text text-base leading-relaxed">
            From your first question to your approval — LoopedAI covers every step.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((s, i) => <Card key={s.title} service={s} index={i} />)}
        </div>
      </div>
    </section>
  )
}
