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
    setUserData(null)
  }

  return { userData, setUserData: save, clearUserData: clear, ready }
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

    // Detect Google OAuth callback — Supabase puts the session in the URL hash
    if (params.get('oauth') === 'true') {
      window.history.replaceState({}, '', window.location.pathname)
      setOauthLoading(true)
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (!session?.access_token) {
          setOauthError('Google sign-in failed. Please try again.')
          setOauthLoading(false)
          return
        }
        try {
          // Exchange the Supabase token for a LoopedAI profile (creates one if new user)
          const res = await fetch(`${API_BASE}/api/v1/auth/oauth/session`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
          })
          if (!res.ok) {
            const err = await res.json()
            throw new Error(err.detail || 'Sign-in failed.')
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
      })
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

  return (
    <Layout isFullWidth={step === 'dashboard'}>
      {oauthLoading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-8 h-8 border-2 border-premium-gold/30 border-t-premium-gold rounded-full animate-spin" />
          <p className="text-white/50 text-sm">Signing you in with Google...</p>
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
    </Layout>
  )
}

function AdminApp() {
  const { userData, setUserData, clearUserData, ready } = useSession()
  const [authView, setAuthView] = useState('login')

  const handleLogout = () => { clearUserData() }

  if (!ready) return null

  // Not logged in — show login/register inline at /admin
  if (!userData?.access_token) {
    return (
      <Layout isFullWidth={false}>
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
    <div className="bg-void min-h-screen">
      <Navbar />
      <main>
        <Routes>
          <Route path="/"         element={<Home />} />
          <Route path="/about"    element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/guide"    element={<GuidePage />} />
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
