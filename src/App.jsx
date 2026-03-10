import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import CustomCursor   from './components/ui/CustomCursor'
import Navbar         from './components/layout/Navbar'
import Footer         from './components/layout/Footer'
import Home           from './pages/Home'
import AboutPage      from './pages/AboutPage'
import ServicesPage   from './pages/ServicesPage'
import GuidePage      from './pages/GuidePage'
import AdminDashboard from './pages/AdminDashboard'

import RegistrationForm from './components/RegistrationForm'
import LoginForm        from './components/LoginForm'
import SuccessPage      from './components/SuccessPage'
import Dashboard        from './components/Dashboard'
import PaymentPage      from './components/PaymentPage'
import Layout           from './components/Layout'

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

  useEffect(() => {
    // Only auto-redirect from auth — don't override 'success' step after registration
    if (ready && userData?.access_token && step === 'auth') setStep('dashboard')
  }, [ready, userData, step])

  const handleLogout = () => { clearUserData(); setStep('auth'); setAuthView('login') }

  return (
    <Layout isFullWidth={step === 'dashboard'}>
      {step === 'auth' && authView === 'login' && (
        <LoginForm
          onSuccess={(data) => { setUserData(data); setStep('dashboard') }}
          onSwitchToRegister={() => setAuthView('register')}
        />
      )}
      {step === 'auth' && authView === 'register' && (
        <RegistrationForm
          onSafeSuccess={(data) => { setUserData(data); setStep('success') }}
          onSwitchToLogin={() => setAuthView('login')}
        />
      )}
      {step === 'success' && (
        <SuccessPage userData={userData} onProceed={() => setStep('dashboard')} />
      )}
      {step === 'dashboard' && (
        <Dashboard userData={userData} onLogout={handleLogout} onUpgrade={() => setStep('payment')} />
      )}
      {step === 'payment' && (
        <PaymentPage
          userData={userData}
          onPaymentSuccess={(data) => { setUserData(data); setStep('dashboard') }}
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

  // Logged in but not admin — redirect to chat
  if (!userData.is_admin) {
    window.location.replace('/chat')
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
