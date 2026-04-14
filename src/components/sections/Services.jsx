import { useScrollReveal } from '../../hooks/useScrollReveal'
import { Search, FileText, CalendarDays, BarChart3, ListChecks, Users } from 'lucide-react'

const SERVICES = [
  {
    icon: Search,
    title: 'Visa Research',
    desc: 'Live requirements fetched from official government portals. Always current, always accurate for your nationality.',
    tag: 'Real-time',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    tagBg: 'bg-blue-50 text-blue-700',
  },
  {
    icon: FileText,
    title: 'Document Review',
    desc: 'Upload your documents. AI scores each one pass or fail and tells you exactly what to fix before you submit.',
    tag: 'AI scoring',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    tagBg: 'bg-amber-50 text-amber-700',
  },
  {
    icon: CalendarDays,
    title: 'Timeline Planning',
    desc: 'Get a personalized backward timeline from today to your target move date, accounting for processing delays.',
    tag: 'Personalized',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    tagBg: 'bg-emerald-50 text-emerald-700',
  },
  {
    icon: BarChart3,
    title: 'Country Comparison',
    desc: 'Compare immigration pathways side-by-side across multiple countries. Find your best option fast.',
    tag: 'Multi-country',
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    tagBg: 'bg-purple-50 text-purple-700',
  },
  {
    icon: ListChecks,
    title: 'Pre-Application Checklist',
    desc: 'Interactive checklist built for your exact visa type and nationality. Check off each item as you complete it.',
    tag: 'Interactive',
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    tagBg: 'bg-cyan-50 text-cyan-700',
  },
  {
    icon: Users,
    title: 'Lawyer Referrals',
    desc: 'When you need human expertise, we connect you to vetted immigration lawyers in your destination country.',
    tag: 'Expert network',
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    tagBg: 'bg-rose-50 text-rose-700',
  },
]

function Card({ service }) {
  const ref  = useScrollReveal()
  const Icon = service.icon
  return (
    <div
      ref={ref}
      className="group bg-white border border-gray-100 rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-250"
    >
      <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl mb-5 ${service.iconBg}`}>
        <Icon size={19} className={service.iconColor} />
      </div>
      <h3 className="font-display font-bold text-gray-900 text-[15px] mb-2">{service.title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-5">{service.desc}</p>
      <span className={`text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full ${service.tagBg}`}>
        {service.tag}
      </span>
    </div>
  )
}

export default function Services() {
  const ref = useScrollReveal()
  return (
    <section className="py-16 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div ref={ref} className="max-w-2xl mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-3">What we do</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-gray-900 leading-tight mb-4">
            Intelligence for every<br />
            <span className="font-serif italic text-gold">stage of your move</span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            From your first question to your approval — LoopedAI covers every step.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICES.map(s => <Card key={s.title} service={s} />)}
        </div>
      </div>
    </section>
  )
}
