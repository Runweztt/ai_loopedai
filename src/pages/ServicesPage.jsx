import Services   from '../components/sections/Services'
import HowItWorks from '../components/sections/HowItWorks'
import CTASection  from '../components/sections/CTASection'

export default function ServicesPage() {
  return (
    <div className="pt-16 bg-void min-h-screen">
      <Services />
      <HowItWorks />
      <CTASection />
    </div>
  )
}
