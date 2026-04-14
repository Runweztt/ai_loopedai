import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, ArrowRight } from 'lucide-react'
import logo from '../../assets/logo-06.png'

const NAV_LINKS = [
  { to: '/',         label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/guide',    label: 'Guide' },
  { to: '/safety',   label: 'Safety' },
  { to: '/about',    label: 'About' },
]

const SESSION_KEY = 'immigration_ai_session'

function useIsSignedIn() {
  const [signedIn, setSignedIn] = useState(false)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      setSignedIn(!!(raw && JSON.parse(raw)?.access_token))
    } catch { setSignedIn(false) }
  }, [])
  return signedIn
}

export default function Navbar() {
  const [open,     setOpen]     = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname }            = useLocation()
  const signedIn                = useIsSignedIn()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-200 ${
      scrolled || open
        ? 'bg-white shadow-nav border-b border-gray-200'
        : 'bg-white border-b border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-[68px]">

        {/* ── Logo ─────────────────────────────────────────────────── */}
        <Link to="/" className="flex items-center select-none flex-shrink-0">
          <div
            role="img"
            aria-label="LoopedAI"
            className="nav-logo"
            style={{ backgroundImage: `url(${logo})` }}
          />
        </Link>

        {/* ── Desktop nav links ─────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map(l => {
            const isActive = pathname === l.to
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 ${
                  isActive
                    ? 'text-gray-900 bg-gray-100'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {l.label}
                {/* Gold underline on active */}
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gold rounded-full" />
                )}
              </Link>
            )
          })}
        </div>

        {/* ── CTA button ───────────────────────────────────────────── */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/chat"
            className="inline-flex items-center gap-2 bg-gold text-gray-900 text-sm font-semibold px-5 py-2.5 rounded-lg shadow-btn hover:bg-gold-muted transition-all duration-150"
          >
            {signedIn ? 'Back to Chat' : 'Start for free'}
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </div>

        {/* ── Mobile toggle ────────────────────────────────────────── */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* ── Mobile menu ──────────────────────────────────────────────── */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
            {NAV_LINKS.map(l => {
              const isActive = pathname === l.to
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-gray-900 bg-gray-100 font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {l.label}
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-gold" />}
                </Link>
              )
            })}

            <div className="pt-3 border-t border-gray-100 mt-1">
              <Link
                to="/chat"
                className="flex items-center justify-center gap-2 bg-gold text-gray-900 text-sm font-semibold px-5 py-3.5 rounded-lg shadow-btn hover:bg-gold-muted transition-all"
              >
                {signedIn ? 'Back to Chat' : 'Start for free'}
                <ArrowRight size={14} strokeWidth={2.5} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
