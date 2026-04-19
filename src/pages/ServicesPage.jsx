import SEO       from '../components/SEO'
import CoreFeatures from '../components/sections/CoreFeatures'
import Services   from '../components/sections/Services'
import HowItWorks from '../components/sections/HowItWorks'
import CTASection  from '../components/sections/CTASection'

export default function ServicesPage() {
  return (
    <div className="pt-16 bg-white min-h-screen">
      <SEO
        title="Features & Services"
        path="/services"
        description="Explore LoopedAI's full feature set — AI visa research, document review scoring, daily Telegram intelligence briefings, timeline planning, country comparison, and more."
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Features & Services | LoopedAI',
          url: 'https://loopedai.io/services',
          breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://loopedai.io/' },
              { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://loopedai.io/services' },
            ],
          },
        }}
      />
      <CoreFeatures />
      <Services />
      <HowItWorks />
      <CTASection />
    </div>
  )
}
