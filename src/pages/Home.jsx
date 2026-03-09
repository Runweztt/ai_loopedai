import Hero       from '../components/sections/Hero'
import Ticker     from '../components/sections/Ticker'
import Services   from '../components/sections/Services'
import HowItWorks from '../components/sections/HowItWorks'
import About      from '../components/sections/About'
import CTASection from '../components/sections/CTASection'

export default function Home() {
  return (
    <>
      <Hero />
      <Ticker />
      <Services />
      <HowItWorks />
      <About />
      <CTASection />
    </>
  )
}
