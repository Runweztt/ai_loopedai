import CTASection from '../components/sections/CTASection'
import { ShieldCheck, Zap, Globe2, Scale, Bot, FileSearch, Users, Clock, Star, ArrowRight } from 'lucide-react'

const STATS = [
  { value: '180+', label: 'Countries covered' },
  { value: '5',    label: 'Specialised AI agents' },
  { value: '24/7', label: 'Always available' },
  { value: '100%', label: 'Official sources' },
]

const TEAM = [
  {
    name: 'Timothy',
    role: 'Founder & CEO',
    bio: 'Built LoopedAI after experiencing firsthand how broken the immigration information landscape is — scattered portals, outdated PDFs, and zero guidance for people who just need a straight answer.',
    initials: 'TM',
    highlight: 'Founder',
  },
]

const PILLARS = [
  {
    icon: Globe2,
    title: 'Official sources only',
    desc: 'We fetch directly from government portals — not blogs, forums, or third-party aggregators. Every answer traces back to a verifiable source.',
  },
  {
    icon: Zap,
    title: 'Real-time accuracy',
    desc: 'Immigration requirements change constantly. We check live data so you never walk into an application with outdated information.',
  },
  {
    icon: ShieldCheck,
    title: 'No judgment',
    desc: 'Your background, nationality, or situation — we help everyone equally. Immigration questions deserve clear answers, not gatekeeping.',
  },
  {
    icon: Scale,
    title: 'Research, not legal advice',
    desc: 'We are your intelligent co-pilot for research and preparation. For binding legal decisions we connect you to vetted immigration lawyers.',
  },
  {
    icon: Bot,
    title: 'Multi-agent AI',
    desc: 'Five specialised AI agents collaborate on every document review — each checking a different dimension so nothing gets missed.',
  },
  {
    icon: FileSearch,
    title: 'Document review',
    desc: 'Upload your supporting documents and receive a full gap analysis before you submit. Know exactly what to fix before it costs you.',
  },
]

const TIMELINE = [
  { year: '2024', event: 'Problem identified — immigration information is fragmented, outdated, and inaccessible to most people.' },
  { year: '2025', event: 'LoopedAI prototype built. Multi-agent pipeline designed to query government portals in real time.' },
  { year: '2026', event: 'Platform launched publicly. Document review, Telegram bot, and premium tier introduced.' },
]

export default function AboutPage() {
  return (
    <div className="pt-16 bg-void min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="py-24 md:py-32 relative overflow-hidden flex items-center justify-center">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(212,175,55,0.06) 0%, transparent 70%)' }} />
        <div className="max-w-4xl w-full mx-auto px-6 lg:px-10 flex flex-col items-center text-center relative">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold border border-gold/20 rounded-full px-4 py-1.5 mb-6">
            Our Mission
          </span>
          <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-7xl text-white leading-[1.08] mb-7">
            Immigration intelligence{' '}
            <span className="font-serif italic text-slate-400">built for real people</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl">
            Immigration information is scattered across dozens of portals, buried in PDFs,
            and constantly changing. LoopedAI brings it all together — in real time,
            for your exact situation — so you walk in prepared, not confused.
          </p>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────── */}
      <section className="border-t border-b border-white/5 py-10">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(s => (
              <div key={s.label} className="text-center">
                <p className="font-display font-extrabold text-4xl text-premium-gold mb-1">{s.value}</p>
                <p className="text-xs text-slate-500 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The problem we solve ─────────────────────────────────── */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-4">Why we exist</p>
              <h2 className="font-display font-bold text-3xl md:text-4xl text-white mb-6 leading-tight">
                The system is broken.<br />
                <span className="text-slate-400">We're fixing the information layer.</span>
              </h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                Millions of people navigate immigration every year — students, workers, families, and asylum seekers.
                Most of them rely on outdated blog posts, expensive lawyers for basic questions, or guesswork.
              </p>
              <p className="text-slate-400 leading-relaxed">
                LoopedAI isn't a replacement for legal counsel. It's the layer that should have always existed:
                accurate, real-time, source-backed immigration information — available to everyone, instantly.
              </p>
            </div>
            <div className="space-y-3">
              {[
                'Government portals update without notice — most guides are months out of date',
                'A single missed document can delay or void an application entirely',
                'Basic information questions cost hundreds in legal fees',
                'Non-native speakers have almost no reliable resources in plain English',
              ].map((pain, i) => (
                <div key={i} className="flex items-start gap-3 bg-navy border border-white/6 rounded-xl p-4">
                  <span className="text-red-400/70 mt-0.5 flex-shrink-0 text-base leading-none">✕</span>
                  <p className="text-sm text-slate-400 leading-relaxed">{pain}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Founder ──────────────────────────────────────────────── */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-10">The team</p>
          <div className="flex flex-wrap gap-8">
            {TEAM.map(person => (
              <div key={person.name} className="relative flex items-start gap-6 bg-navy border border-white/6 rounded-2xl p-7 max-w-xl">
                {/* Highlight badge */}
                <span className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-widest text-premium-gold border border-premium-gold/25 rounded-full px-2.5 py-1">
                  {person.highlight}
                </span>
                {/* Avatar */}
                <div className="w-16 h-16 rounded-2xl bg-premium-gold/15 border border-premium-gold/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-premium-gold font-display font-bold text-xl">{person.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-white text-lg leading-tight">{person.name}</h3>
                  <p className="text-gold text-xs mb-3 mt-0.5">{person.role}</p>
                  <p className="text-slate-400 text-sm leading-relaxed">{person.bio}</p>
                </div>
              </div>
            ))}

            {/* Hiring card */}
            <div className="flex items-center gap-5 border border-dashed border-white/10 rounded-2xl p-7 max-w-sm">
              <div className="w-16 h-16 rounded-2xl bg-white/3 border border-white/8 flex items-center justify-center flex-shrink-0">
                <Users size={22} className="text-white/20" />
              </div>
              <div>
                <h3 className="font-display font-bold text-white/40 text-base mb-1">Could be you</h3>
                <p className="text-slate-600 text-xs leading-relaxed">We're a small team building something ambitious. Reach out if you care about access to information.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────────────────── */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-10">Our story</p>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[52px] top-4 bottom-4 w-px bg-white/5" />
            <div className="space-y-8">
              {TIMELINE.map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-[52px] flex-shrink-0 text-right">
                    <span className="text-xs font-mono font-bold text-gold">{item.year}</span>
                  </div>
                  <div className="relative flex-1 bg-navy border border-white/6 rounded-xl px-5 py-4">
                    {/* Connector dot */}
                    <div className="absolute -left-[23px] top-4 w-3 h-3 rounded-full border-2 border-gold/40 bg-void" />
                    <p className="text-sm text-slate-400 leading-relaxed">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What we stand for ────────────────────────────────────── */}
      <section className="py-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold mb-2">What we stand for</p>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-white">Six principles we don't compromise on</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PILLARS.map((p, i) => {
              const Icon = p.icon
              return (
                <div key={p.title} className="group flex gap-4 bg-navy border border-white/6 rounded-xl p-5 hover:border-gold/20 transition-all duration-200">
                  <div className="w-10 h-10 rounded-xl bg-navy-light border border-white/6 flex items-center justify-center shrink-0 group-hover:border-gold/20 transition-all">
                    <Icon size={16} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-[10px] text-white/20 font-mono mb-1">0{i + 1}</p>
                    <h3 className="font-display font-bold text-white text-sm mb-1.5">{p.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Disclaimer ───────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <div className="bg-navy border border-white/6 rounded-2xl p-8 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center mx-auto mb-5">
              <Scale size={18} className="text-white/30" />
            </div>
            <h3 className="font-display font-bold text-white text-base mb-3">A note on legal advice</h3>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl mx-auto">
              <strong className="text-white">We are not lawyers and do not issue visas.</strong>{' '}
              LoopedAI is the intelligence layer that makes sure you walk into any application fully prepared —
              with the right documents, the right requirements, and zero surprises.
              When you need binding legal counsel, we connect you to vetted immigration lawyers.
            </p>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  )
}
