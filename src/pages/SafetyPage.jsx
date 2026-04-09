import { Link } from 'react-router-dom'
import { ShieldCheck, Lock, Eye, Server, AlertTriangle, CheckCircle } from 'lucide-react'
import CTASection from '../components/sections/CTASection'

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'AI-generated, not legal advice',
    desc: 'Every response from LoopedAI is for informational and research purposes only. We are not a law firm and nothing we provide constitutes legal advice. For applications with significant personal or financial stakes, always consult a licensed immigration lawyer.',
  },
  {
    icon: Lock,
    title: 'End-to-end encryption',
    desc: 'All communication between your browser and our servers is encrypted in transit. Your queries and documents are never stored beyond the minimum required to serve your session.',
  },
  {
    icon: Eye,
    title: 'We never sell your data',
    desc: 'Your queries, nationality, and immigration situation are private. We do not share, sell, or rent your personal information to advertisers, data brokers, or third parties.',
  },
  {
    icon: Server,
    title: 'Official sources only',
    desc: 'Our AI agents fetch directly from government portals and official embassy websites — not Reddit, not immigration blogs. Every piece of information traces back to a verifiable, authoritative source.',
  },
  {
    icon: AlertTriangle,
    title: 'Requirements change — always verify',
    desc: 'Immigration rules can change overnight. While we fetch live data, always cross-check the final requirements with the official government website or consulate before submitting any application.',
  },
  {
    icon: CheckCircle,
    title: 'Secure payments via Stripe',
    desc: 'We never handle or store card numbers. All payments are processed directly by Stripe, a PCI DSS Level 1 certified payment provider. We only receive a confirmation that your subscription is active.',
  },
]

const PRACTICES = [
  'Passwords are never stored in plain text — only a one-way cryptographic hash is kept',
  'Session credentials are short-lived, signed, and invalidated on logout',
  'All AI and authentication endpoints are rate-limited to prevent brute-force and abuse',
  'Uploaded documents are processed in memory and never written to permanent storage',
  'No third-party analytics or advertising scripts run inside the chat application',
  'Telegram account linking uses single-use codes with a fixed expiry window',
]

export default function SafetyPage() {
  return (
    <div className="pt-24 bg-void min-h-screen text-white">

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 lg:px-10 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/50 uppercase tracking-widest mb-8">
          <ShieldCheck size={12} /> Safety &amp; Privacy
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6">
          Your trust is our{' '}
          <span className="bg-gradient-to-r from-white to-premium-gold bg-clip-text text-transparent">
            foundation
          </span>
        </h1>
        <p className="text-white/50 text-lg max-w-2xl mx-auto leading-relaxed">
          Immigration is personal. We built LoopedAI with safety, accuracy, and privacy at the core — not as an afterthought.
        </p>
      </section>

      {/* Pillars */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {PILLARS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/3 border border-white/8 rounded-2xl p-6 hover:border-white/15 transition-all duration-300">
              <div className="w-10 h-10 bg-premium-gold/15 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-premium-gold" />
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security practices */}
      <section className="max-w-4xl mx-auto px-6 lg:px-10 py-12">
        <h2 className="text-2xl font-display font-bold mb-8 text-center">Security practices</h2>
        <div className="bg-white/3 border border-white/8 rounded-2xl p-8 space-y-4">
          {PRACTICES.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle size={16} className="text-premium-gold flex-shrink-0 mt-0.5" />
              <p className="text-white/60 text-sm">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-3xl mx-auto px-6 lg:px-10 py-12">
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-amber-400 font-semibold mb-2 text-sm">Legal disclaimer</h3>
              <p className="text-white/50 text-xs leading-relaxed">
                LoopedAI is an AI-powered information tool. The information provided is for general educational purposes only and does not constitute legal advice. LoopedAI is not a law firm and is not a substitute for the advice of a licensed immigration attorney. Immigration laws and requirements vary by jurisdiction and change frequently. Always verify requirements through official government sources and consult a qualified professional before submitting any immigration application.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-3xl mx-auto px-6 lg:px-10 py-8 text-center">
        <p className="text-white/30 text-sm">
          Have a security concern or privacy question?{' '}
          <a href="mailto:info@loopedai.io" className="text-premium-gold hover:text-yellow-400 transition-colors">
            info@loopedai.io
          </a>
        </p>
      </section>

      <CTASection />
    </div>
  )
}
