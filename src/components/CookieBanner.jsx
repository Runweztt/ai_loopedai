import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const CONSENT_KEY = 'loopedai_cookie_consent'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(CONSENT_KEY)) setVisible(true)
    } catch { /* localStorage unavailable */ }
  }, [])

  const respond = (accepted) => {
    try {
      localStorage.setItem(CONSENT_KEY, accepted ? 'accepted' : 'rejected')
    } catch { /* ignore */ }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-modal="false"
      className="fixed bottom-0 left-0 right-0 z-[9990] p-4 md:p-6 pointer-events-none"
    >
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] pointer-events-auto overflow-hidden">

        {/* Top accent bar */}
        <div className="h-0.5 w-full bg-gradient-to-r from-gold via-amber-300 to-gold" />

        <div className="px-5 py-4 md:px-6 md:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 mb-1">
                We use cookies &amp; browser storage
              </p>
              <p className="text-xs text-gray-500 leading-relaxed">
                We use essential browser storage to keep you signed in and save your chat session.
                No advertising networks or third-party tracking.{' '}
                <Link
                  to="/privacy"
                  className="text-gold hover:underline underline-offset-2 font-medium"
                  onClick={() => respond(true)}
                >
                  Privacy policy
                </Link>
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => respond(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-colors whitespace-nowrap"
              >
                Reject non-essential
              </button>
              <button
                onClick={() => respond(true)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gray-900 hover:bg-gray-700 transition-colors whitespace-nowrap"
              >
                Accept all
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
