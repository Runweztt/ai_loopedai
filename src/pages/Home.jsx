import SEO         from '../components/SEO'
import Hero         from '../components/sections/Hero'
import Ticker       from '../components/sections/Ticker'
import CoreFeatures from '../components/sections/CoreFeatures'
import Services     from '../components/sections/Services'
import HowItWorks   from '../components/sections/HowItWorks'
import About        from '../components/sections/About'
import CTASection   from '../components/sections/CTASection'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'LoopedAI — AI Immigration Assistant & Visa Intelligence',
  url: 'https://loopedai.io/',
  description: 'AI-powered immigration assistant with real-time visa research, document review, daily Telegram briefings, and destination intelligence for 180+ countries.',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: 'https://loopedai.io/' }],
  },
}

export default function Home() {
  return (
    <>
      <SEO
        path="/"
        description="AI-powered immigration assistant with real-time visa research, AI document review, and daily intelligence briefings via Telegram — for 180+ countries."
        jsonLd={jsonLd}
      />
      <Hero />
      <Ticker />
      <CoreFeatures />
      <Services />
      <HowItWorks />
      <About />
      <CTASection />
    </>
  )
}
