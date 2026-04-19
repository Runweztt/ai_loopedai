import { Link } from 'react-router-dom'
import { Check, Zap } from 'lucide-react'
import { useScrollReveal } from '../../hooks/useScrollReveal'

const FREE_FEATURES = [
  'Up to 4 AI queries per session',
  'Real-time visa research',
  'Country comparison',
  'Timeline planning',
  'Pre-application checklist',
]

const PREMIUM_FEATURES = [
  'Unlimited AI immigration queries',
  'AI document review — pass/fail scoring',
  'Daily intelligence briefings via Telegram',
  'Telegram bot — chat from anywhere',
  'Unique LoopedAI ID across platforms',
  'Priority AI responses',
  'All free features included',
]

function FeatureRow({ text, muted = false }) {
  return (
    <li className="flex items-start gap-3">
      <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${muted ? 'bg-gray-100' : 'bg-amber-100'}`}>
        <Check size={10} className={muted ? 'text-gray-400' : 'text-amber-600'} strokeWidth={3} />
      </span>
      <span className={`text-sm leading-snug ${muted ? 'text-gray-400' : 'text-gray-700'}`}>{text}</span>
    </li>
  )
}

function FreeCard({ ref: cardRef }) {
  const ref = useScrollReveal()
  return (
    <div
      ref={ref}
      className="relative bg-white border border-gray-200 rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-250 flex flex-col"
    >
      {/* Plan label */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Free</p>
        <div className="flex items-end gap-1.5">
          <span className="font-display font-extrabold text-5xl text-gray-900">$0</span>
          <span className="text-gray-400 text-sm mb-2">/ month</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">Start instantly — no card required.</p>
      </div>

      <div className="h-px bg-gray-100 mb-6" />

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {FREE_FEATURES.map(f => <FeatureRow key={f} text={f} muted />)}
      </ul>

      <Link
        to="/chat"
        className="block w-full text-center py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:border-gray-300 hover:bg-gray-50 transition-all"
      >
        Get started free
      </Link>
    </div>
  )
}

function PremiumCard() {
  const ref = useScrollReveal()
  return (
    <div
      ref={ref}
      className="relative bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-gold-glow flex flex-col"
    >
      {/* Most Popular badge */}
      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
        <span className="bg-gold text-gray-900 text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-btn whitespace-nowrap">
          Most Popular
        </span>
      </div>

      {/* Plan label */}
      <div className="mb-6 pt-2">
        <p className="text-xs font-bold uppercase tracking-widest text-gold/70 mb-2">Premium</p>
        <div className="flex items-end gap-1.5">
          <span className="font-display font-extrabold text-5xl text-white">$20</span>
          <span className="text-gray-400 text-sm mb-2">/ month</span>
        </div>
        <p className="text-sm text-gray-400 mt-2">Full access. Cancel any time.</p>
      </div>

      <div className="h-px bg-gray-700 mb-6" />

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {PREMIUM_FEATURES.map(f => (
          <li key={f} className="flex items-start gap-3">
            <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full bg-gold/20 flex items-center justify-center">
              <Check size={10} className="text-gold" strokeWidth={3} />
            </span>
            <span className="text-sm text-gray-200 leading-snug">{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA — always sends upgrade=true so ChatApp jumps straight to Stripe */}
      <Link
        to="/chat?upgrade=true"
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gold hover:bg-gold-muted text-gray-900 font-bold text-sm transition-all shadow-btn"
      >
        <Zap size={15} />
        Upgrade to Premium
      </Link>

      <p className="text-center text-gray-500 text-[11px] mt-3">
        Secure checkout via Stripe · No hidden fees
      </p>
    </div>
  )
}

export default function Pricing() {
  const ref = useScrollReveal()
  return (
    <section className="py-16 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div ref={ref} className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold mb-3">Pricing</p>
          <h2 className="font-display font-extrabold text-4xl md:text-5xl text-gray-900 leading-tight mb-4">
            Simple, honest<br />
            <span className="font-serif italic text-gold">pricing</span>
          </h2>
          <p className="text-gray-500 text-base leading-relaxed">
            Start free and upgrade when you need document review, daily briefings, and unlimited queries.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <FreeCard />
          <PremiumCard />
        </div>

        {/* Trust strip */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 mt-12">
          {[
            'No card required on free plan',
            'Cancel any time',
            'Stripe-secured checkout',
            '180+ countries covered',
          ].map(item => (
            <span key={item} className="flex items-center gap-2 text-xs text-gray-400">
              <Check size={12} className="text-gold" strokeWidth={3} />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
