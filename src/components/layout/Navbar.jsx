import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import logo from '../../assets/logo-06.png'

const NAV_LINKS = [
  { to: '/',         label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/guide',    label: 'Guide' },
  { to: '/about',    label: 'About' },
]

export default function Navbar() {
  const [open,      setOpen]      = useState(false)
  const [scrolled,  setScrolled]  = useState(false)
  const { pathname }              = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled || open ? 'bg-void/95 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-[72px]">

        {/* Logo */}
        <Link to="/" className="flex items-center select-none group">
          <div
            role="img" aria-label="LoopedAI"
            className="nav-logo"
            style={{ backgroundImage: `url(${logo})` }}
          />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-md text-sm font-body font-medium transition-all duration-200 ${
                pathname === l.to
                  ? 'text-white bg-white/8'
                  : 'text-slate-text hover:text-white hover:bg-white/5'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/chat"
            className="flex items-center gap-2 bg-gold text-void text-sm font-body font-semibold px-5 py-2.5 rounded-md hover:bg-gold/90 transition-all duration-200 shadow-gold-glow"
          >
            Start for free
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-md text-slate-text hover:text-white hover:bg-white/5 transition-colors"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-void/98 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
            {NAV_LINKS.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                  pathname === l.to ? 'text-white bg-white/8' : 'text-slate-text hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/chat"
              className="mt-2 bg-gold text-void text-sm font-semibold px-5 py-3 rounded-md text-center hover:bg-gold/90 transition-colors"
            >
              Start for free
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
