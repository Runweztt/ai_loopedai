import { useScrollReveal } from '../../hooks/useScrollReveal'

const FEATURES = [
  {
    badge: 'Premium',
    badgeBg: 'bg-amber-50 text-amber-700 border border-amber-200',
    accent: 'border-amber-400',
    iconBg: 'bg-amber-50',
    title: 'AI Document Review',
    desc: 'Upload your visa documents and get a pass/fail score on every page before you submit. Our AI reads each requirement against your actual paperwork and flags exactly what needs fixing — so you arrive at the embassy ready.',
    steps: ['Upload passport, bank statements, or any visa document', 'AI scores each item against real requirements', 'Fix issues before rejection'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    badge: 'Free',
    badgeBg: 'bg-blue-50 text-blue-700 border border-blue-200',
    accent: 'border-blue-400',
    iconBg: 'bg-blue-50',
    title: 'Telegram Intelligence Hub',
    desc: 'Link your Telegram account to LoopedAI in seconds. Once connected, your entire AI assistant is available directly in your Telegram — ask questions, get updates, and control your briefing schedule without opening a browser.',
    steps: ['Send /start to the LoopedAI Telegram bot', 'Use /link to connect your account', 'Chat with your AI assistant from anywhere'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
      </svg>
    ),
  },
  {
    badge: 'Premium',
    badgeBg: 'bg-rose-50 text-rose-700 border border-rose-200',
    accent: 'border-rose-400',
    iconBg: 'bg-rose-50',
    title: 'Daily Intelligence Briefing',
    desc: 'Every 2 days, LoopedAI delivers a personalised brief to your Telegram covering breaking news, immigration law changes, job market conditions, and industry trends — all sourced from official government portals and verified outlets for your destination country.',
    steps: ['Run /briefing_setup in Telegram', 'Set your destination, industry, and visa intent', 'Receive auto-briefs every 2 days — no action needed'],
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
]

function FeatureCard({ feature }) {
  const ref = useScrollReveal()
  return (
    <div
      ref={ref}
      className={`bg-white rounded-2xl border-t-4 ${feature.accent} border-x border-b border-gray-100 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-250 p-7 flex flex-col`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-5">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feature.iconBg}`}>
          {feature.icon}
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${feature.badgeBg}`}>
          {feature.badge}
        </span>
      </div>

      {/* Title + desc */}
      <h3 className="font-display font-bold text-gray-900 text-lg mb-3">{feature.title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1">{feature.desc}</p>

      {/* Steps */}
      <ol className="space-y-2">
        {feature.steps.map((step, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold flex items-center justify-center mt-0.5">
              {i + 1}
            </span>
            <span className="text-xs text-gray-600 leading-snug">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

export default function CoreFeatures() {
  const ref = useScrollReveal()
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div ref={ref} className="max-w-2xl mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-3">Core features</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-gray-900 leading-tight mb-4">
            Three tools that change<br />
            <span className="font-serif italic text-gold">how you relocate</span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            Document Review catches errors before they cost you. Telegram keeps your AI with you everywhere. Daily Briefings keep you ahead of every change.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map(f => <FeatureCard key={f.title} feature={f} />)}
        </div>
      </div>
    </section>
  )
}
