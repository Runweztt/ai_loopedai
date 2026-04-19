import { Link } from 'react-router-dom'
import { ShieldCheck, Lock, Eye, Server, AlertTriangle, CheckCircle } from 'lucide-react'
import SEO from '../components/SEO'
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
    <div className="pt-24 bg-white min-h-screen text-gray-900">
      <SEO
        title="Safety & Trust"
        path="/safety"
        description="How LoopedAI keeps your data private, why our AI responses are research-only, and the security principles that govern every part of the platform."
        noindex={false}
      />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 lg:px-10 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200 bg-gray-50 text-xs text-gray-500 uppercase tracking-widest mb-8">
          <ShieldCheck size={12} /> Safety &amp; Privacy
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight mb-6 text-gray-900">
          Your trust is our{' '}
          <span className="text-gradient">foundation</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Immigration is personal. We built LoopedAI with safety, accuracy, and privacy at the core — not as an afterthought.
        </p>
      </section>

      {/* Pillars */}
      <section className="max-w-6xl mx-auto px-6 lg:px-10 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PILLARS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card hover:shadow-card-hover hover:border-gray-200 transition-all duration-250">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                <Icon size={18} className="text-gold" />
              </div>
              <h3 className="text-gray-900 font-semibold mb-2 text-sm">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security practices */}
      <section className="max-w-4xl mx-auto px-6 lg:px-10 py-12">
        <h2 className="text-2xl font-display font-bold text-gray-900 mb-8 text-center">Security practices</h2>
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 space-y-4 shadow-card">
          {PRACTICES.map((item) => (
            <div key={item} className="flex items-start gap-3">
              <CheckCircle size={16} className="text-gold flex-shrink-0 mt-0.5" />
              <p className="text-gray-600 text-sm">{item}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-3xl mx-auto px-6 lg:px-10 py-12">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-amber-700 font-semibold mb-2 text-sm">Legal disclaimer</h3>
              <p className="text-gray-600 text-xs leading-relaxed">
                LoopedAI is an AI-powered information tool. The information provided is for general educational purposes only and does not constitute legal advice. LoopedAI is not a law firm and is not a substitute for the advice of a licensed immigration attorney. Immigration laws and requirements vary by jurisdiction and change frequently. Always verify requirements through official government sources and consult a qualified professional before submitting any immigration application.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="max-w-3xl mx-auto px-6 lg:px-10 py-8 text-center">
        <p className="text-gray-400 text-sm">
          Have a security concern or privacy question?{' '}
          <a href="mailto:info@loopedai.io" className="text-gold hover:text-gold-muted transition-colors">
            info@loopedai.io
          </a>
        </p>
      </section>

      <CTASection />
    </div>
  )
}
