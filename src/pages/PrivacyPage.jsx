import { Link } from 'react-router-dom'
import CTASection from '../components/sections/CTASection'

const LAST_UPDATED = 'April 9, 2026'

const Section = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
    <div className="text-gray-500 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
)

export default function PrivacyPage() {
  return (
    <div className="pt-24 bg-white min-h-screen text-gray-900">

      {/* Header */}
      <section className="max-w-3xl mx-auto px-6 lg:px-10 py-12">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">Legal</p>
        <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">Privacy Policy</h1>
        <p className="text-gray-400 text-sm">Last updated: {LAST_UPDATED}</p>
      </section>

      {/* Body */}
      <section className="max-w-3xl mx-auto px-6 lg:px-10 pb-20">
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 md:p-10 shadow-card">

          <Section title="1. Who we are">
            <p>
              LoopedAI ("we", "our", "us") is an AI-powered immigration information service. Our platform
              helps users research visa requirements, document checklists, and immigration processes
              across 180+ countries. We are not a law firm and nothing on our platform constitutes
              legal advice.
            </p>
            <p>Contact: <a href="mailto:info@loopedai.io" className="text-gold hover:underline">info@loopedai.io</a></p>
          </Section>

          <Section title="2. Information we collect">
            <p>When you create an account we collect:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Full name and email address</li>
              <li>Country of origin and city / region</li>
              <li>Password (stored as a one-way bcrypt hash — we never see it in plain text)</li>
            </ul>
            <p>When you use the service we collect:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Immigration queries you send to the AI assistant</li>
              <li>Documents you upload for visa review (processed server-side, not retained after analysis)</li>
              <li>Telegram ID if you choose to link your Telegram account</li>
              <li>Standard server logs (IP address, browser type, timestamps) for security and abuse prevention</li>
            </ul>
          </Section>

          <Section title="3. How we use your information">
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>To provide and improve the immigration assistant service</li>
              <li>To personalise responses based on your country and location</li>
              <li>To send transactional emails (account confirmation, payment receipts)</li>
              <li>To detect and prevent fraud, abuse, and security incidents</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p>We do <strong className="text-gray-900">not</strong> use your data to train AI models, sell to advertisers, or share with data brokers.</p>
          </Section>

          <Section title="4. Data sharing">
            <p>We share your data only with trusted sub-processors necessary to run the service:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong className="text-gray-700">Cloud database provider</strong> — your account data and query history are stored on secure, hosted infrastructure</li>
              <li><strong className="text-gray-700">AI processing provider</strong> — the text of your immigration queries is sent to our AI infrastructure to generate responses; it is not used to train models or shared further</li>
              <li><strong className="text-gray-700">Stripe</strong> — payment processing (we never receive or store your card details)</li>
              <li><strong className="text-gray-700">Telegram</strong> — if you choose to link your account, messages you send via Telegram are routed through their platform to reach our service</li>
            </ul>
            <p>We will disclose information if required by law or to protect the safety of users and the platform.</p>
          </Section>

          <Section title="5. Cookies and local storage">
            <p>
              We store a session credential in your browser so you remain signed in across page
              refreshes. We do not use third-party advertising cookies or tracking pixels.
            </p>
          </Section>

          <Section title="6. Data retention">
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Account data is retained for as long as your account is active</li>
              <li>Query history is stored per session and may be reviewed for service quality</li>
              <li>Uploaded documents are deleted from our servers after the review is complete</li>
              <li>Server logs are retained for up to 90 days</li>
            </ul>
          </Section>

          <Section title="7. Your rights">
            <p>Depending on your jurisdiction you may have the right to:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Object to or restrict certain processing</li>
              <li>Data portability</li>
            </ul>
            <p>
              To exercise any of these rights, email{' '}
              <a href="mailto:info@loopedai.io" className="text-gold hover:underline">info@loopedai.io</a>.
              We will respond within 30 days.
            </p>
          </Section>

          <Section title="8. Security">
            <p>
              We encrypt all data in transit, store passwords using one-way cryptographic hashing,
              issue short-lived session credentials that are invalidated on logout, and apply rate
              limiting across all sensitive endpoints. For more detail see our{' '}
              <Link to="/safety" className="text-gold hover:underline">Safety page</Link>.
            </p>
          </Section>

          <Section title="9. Children">
            <p>
              LoopedAI is not directed at children under 16. We do not knowingly collect personal
              information from anyone under 16. If you believe a minor has created an account, contact
              us and we will delete it promptly.
            </p>
          </Section>

          <Section title="10. Changes to this policy">
            <p>
              We may update this policy from time to time. When we do, we will update the "Last updated"
              date at the top and, for material changes, notify registered users by email.
            </p>
          </Section>

          <Section title="11. Contact">
            <p>
              Questions about this policy?{' '}
              <a href="mailto:info@loopedai.io" className="text-gold hover:underline">info@loopedai.io</a>
            </p>
          </Section>

        </div>
      </section>

      <CTASection />
    </div>
  )
}
