import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { API_BASE } from './constants'

import CustomCursor   from './components/ui/CustomCursor'
import Navbar         from './components/layout/Navbar'
import Footer         from './components/layout/Footer'
import Home           from './pages/Home'
import AboutPage      from './pages/AboutPage'
import ServicesPage   from './pages/ServicesPage'
import GuidePage      from './pages/GuidePage'
import AdminDashboard from './pages/AdminDashboard'
import SafetyPage    from './pages/SafetyPage'
import PrivacyPage   from './pages/PrivacyPage'

import RegistrationForm    from './components/RegistrationForm'
import LoginForm           from './components/LoginForm'
import SuccessPage         from './components/SuccessPage'
import Dashboard           from './components/Dashboard'
import PaymentPage         from './components/PaymentPage'
import PremiumSuccessCard  from './components/PremiumSuccessCard'
import Layout              from './components/Layout'

const SESSION_KEY = 'immigration_ai_session'

function useSession() {
  const [userData, setUserData] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed?.access_token) setUserData(parsed)
      } catch { localStorage.removeItem(SESSION_KEY) }
    }
    setReady(true)
  }, [])

  const save = (data) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data))
    setUserData(data)
  }

  const clear = () => {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem('immigration_ai_prompt_count')
    localStorage.removeItem('loopedai_current_session')
    setUserData(null)
  }

  return { userData, setUserData: save, clearUserData: clear, ready }
}

/* Wraps each step with a fade+slide animation keyed to the step name,
   so switching steps always plays the entrance animation.
   fullHeight=true adds flex-1 + min-h-0 so the dashboard fills its container.
   The dashboard also gets opacity-only animation (no translateY) to avoid
   creating a CSS transform containing-block that would break position:fixed
   on child modals. */
function StepTransition({ stepKey, children, fullHeight = false }) {
  return (
    <div
      key={stepKey}
      className={[
        fullHeight ? 'animate-fade-in flex-1 flex flex-col min-h-0' : 'animate-fade-slide-up',
        'w-full',
      ].join(' ')}
    >
      {children}
    </div>
  )
}

function ChatApp() {
  const { userData, setUserData, clearUserData, ready } = useSession()
  const [step, setStep]         = useState('auth')
  const [authView, setAuthView] = useState('login')
  const [emailConfirmed, setEmailConfirmed] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [oauthError, setOauthError]     = useState('')

  useEffect(() => {
    // Detect Supabase email-confirmation redirect: /chat?confirmed=true
    const params = new URLSearchParams(window.location.search)
    if (params.get('confirmed') === 'true') {
      setEmailConfirmed(true)
      setAuthView('login')
      window.history.replaceState({}, '', window.location.pathname)
      return
    }

    // Detect Stripe payment success redirect: /chat?payment=success
    if (params.get('payment') === 'success') {
      setPaymentSuccess(true)
      window.history.replaceState({}, '', window.location.pathname)
    }

    // Detect Google OAuth callback — Supabase v2 PKCE flow exchanges the ?code= param
    // asynchronously after createClient(). getSession() called immediately returns null
    // before the exchange completes, so we listen via onAuthStateChange first.
    if (params.get('oauth') === 'true') {
      window.history.replaceState({}, '', window.location.pathname)
      setOauthLoading(true)

      let handled = false
      let timeoutId = null
      let subscription = null

      const completeOAuth = async (session) => {
        if (handled) return
        handled = true
        clearTimeout(timeoutId)
        subscription?.unsubscribe()

        if (!session?.access_token) {
          setOauthError('Google sign-in failed — no session returned. Please try again.')
          setOauthLoading(false)
          return
        }
        try {
          const res = await fetch(`${API_BASE}/api/v1/auth/oauth/session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
          })
          if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            throw new Error(body.detail || `Backend error ${res.status}`)
          }
          const data = await res.json()
          setUserData({
            access_token: session.access_token,
            user_id:      data.user_id,
            email:        data.email,
            full_name:    data.full_name,
            country:      data.country      || '',
            location:     data.location     || '',
            is_premium:   data.is_premium   || false,
            is_admin:     data.is_admin     || false,
            link_code:    data.link_code    || '',
          })
          setStep('dashboard')
        } catch (err) {
          setOauthError(err.message)
        } finally {
          setOauthLoading(false)
        }
      }

      // Primary: wait for PKCE code exchange to complete (fires SIGNED_IN when ready)
      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') completeOAuth(session)
      })
      subscription = listener.subscription

      // Fallback: session already in storage (returning user, tab refresh)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.access_token) completeOAuth(session)
      })

      // Safety timeout — unblock UI if Supabase never responds
      timeoutId = setTimeout(() => {
        if (!handled) {
          handled = true
          subscription?.unsubscribe()
          setOauthError('Sign-in timed out. Please try again.')
          setOauthLoading(false)
        }
      }, 15000)
    }
  }, [])

  useEffect(() => {
    // Only auto-redirect from auth — don't override 'success' step after registration
    if (ready && userData?.access_token && step === 'auth') setStep('dashboard')
  }, [ready, userData, step])

  // When Stripe redirects back with ?payment=success, refresh the profile
  // from the backend so is_premium updates without requiring a re-login
  useEffect(() => {
    if (!paymentSuccess || !userData?.access_token) return
    fetch(`${API_BASE}/api/v1/auth/profile`, {
      headers: { Authorization: `Bearer ${userData.access_token}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data) {
          setUserData({
            ...userData,
            is_premium:          data.is_premium   || false,
            looped_id:           data.looped_id    || '',
            link_code:           data.link_code    || '',
            is_telegram_enabled: data.is_telegram_enabled || false,
          })
        }
        setStep('premium-success')
      })
      .catch(() => setStep('premium-success'))
  }, [paymentSuccess])

  const handleLogout = () => { clearUserData(); setStep('auth'); setAuthView('login') }

  // Don't render anything until localStorage has been read — prevents the
  // login form flashing briefly before the session redirects to dashboard.
  if (!ready) {
    return (
      <Layout isFullWidth={false}>
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
      </Layout>
    )
  }

  // Unique key drives the StepTransition re-mount animation each time step changes.
  const transitionKey = oauthLoading ? 'oauth-loading' : step === 'auth' ? `auth-${authView}` : step

  return (
    <Layout isFullWidth={step === 'dashboard'}>
      <StepTransition stepKey={transitionKey} fullHeight={step === 'dashboard'}>
        {oauthLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            <p className="text-gray-400 text-sm">Signing you in with Google...</p>
          </div>
        )}
        {!oauthLoading && step === 'auth' && authView === 'login' && (
          <>
            {emailConfirmed && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
                Email confirmed! You can now sign in.
              </div>
            )}
            {oauthError && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {oauthError}
              </div>
            )}
            <LoginForm
              onSuccess={(data) => { setUserData(data); setStep('dashboard') }}
              onSwitchToRegister={() => { setEmailConfirmed(false); setOauthError(''); setAuthView('register') }}
            />
          </>
        )}
        {!oauthLoading && step === 'auth' && authView === 'register' && (
          <RegistrationForm
            onSafeSuccess={(data) => { setUserData(data); setStep('success') }}
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}
        {step === 'success' && (
          <SuccessPage userData={userData} onProceed={() => setStep('dashboard')} />
        )}
        {step === 'premium-success' && (
          <PremiumSuccessCard
            userData={userData}
            onContinue={() => { setPaymentSuccess(false); setStep('dashboard') }}
          />
        )}
        {step === 'dashboard' && (
          <Dashboard userData={userData} onLogout={handleLogout} onUpgrade={() => setStep('payment')} />
        )}
        {step === 'payment' && (
          <PaymentPage
            userData={userData}
            onBack={() => setStep('dashboard')}
          />
        )}
      </StepTransition>
    </Layout>
  )
}

function AdminApp() {
  const { userData, setUserData, clearUserData, ready } = useSession()
  const [authView, setAuthView] = useState('login')

  const handleLogout = () => { clearUserData() }

  if (!ready) return (
    <Layout isFullWidth={false}>
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
      </div>
    </Layout>
  )

  // Not logged in — show login/register inline at /admin
  if (!userData?.access_token) {
    return (
      <Layout isFullWidth={false}>
        <StepTransition stepKey={`admin-${authView}`}>
          {authView === 'login' ? (
            <LoginForm
              onSuccess={(data) => setUserData(data)}
              onSwitchToRegister={() => setAuthView('register')}
            />
          ) : (
            <RegistrationForm
              onSafeSuccess={(data) => setUserData(data)}
              onSwitchToLogin={() => setAuthView('login')}
            />
          )}
        </StepTransition>
      </Layout>
    )
  }

  // Logged in but not admin — clear stale session and show login form
  if (!userData.is_admin) {
    clearUserData()
    return null
  }

  return <AdminDashboard userData={userData} onLogout={handleLogout} />
}

function MarketingLayout() {
  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/about"    element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/guide"    element={<GuidePage />} />
          <Route path="/safety"   element={<SafetyPage />} />
          <Route path="/privacy"  element={<PrivacyPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CustomCursor />
      <div
        className="fixed inset-0 pointer-events-none z-[9997]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)' }}
      />
      <Routes>
        <Route path="/chat"  element={<ChatApp />} />
        <Route path="/admin" element={<AdminApp />} />
        <Route path="/*"     element={<MarketingLayout />} />
      </Routes>
    </BrowserRouter>
  )
}
