import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Marketing layout
import CustomCursor from './components/ui/CustomCursor'
import Navbar       from './components/layout/Navbar'
import Footer       from './components/layout/Footer'

// Pages
import Home         from './pages/Home'
import AboutPage    from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import GuidePage    from './pages/GuidePage'

// Existing app components (auth + dashboard)
import RegistrationForm from './components/RegistrationForm'
import LoginForm        from './components/LoginForm'
import SuccessPage      from './components/SuccessPage'
import Dashboard        from './components/Dashboard'
import PaymentPage      from './components/PaymentPage'
import Layout           from './components/Layout'

const SESSION_KEY = 'immigration_ai_session'

function ChatApp() {
  const [step, setStep]         = useState('auth')
  const [authView, setAuthView] = useState('login')
  const [userData, setUserData] = useState(null)

  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed?.access_token) { setUserData(parsed); setStep('dashboard') }
      } catch { localStorage.removeItem(SESSION_KEY) }
    }
  }, [])

  const handleAuthSuccess = (data) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data))
    setUserData(data); setStep('success')
  }
  const handleLoginSuccess = (data) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data))
    setUserData(data); setStep('dashboard')
  }
  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem('immigration_ai_prompt_count')
    setUserData(null); setStep('auth'); setAuthView('login')
  }
  const handleUpgrade = () => setStep('payment')
  const handlePaymentSuccess = (updatedData) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedData))
    localStorage.removeItem('immigration_ai_prompt_count')
    setUserData(updatedData); setStep('dashboard')
  }

  return (
    <Layout isFullWidth={step === 'dashboard'}>
      {step === 'auth' && authView === 'login' && (
        <LoginForm onSuccess={handleLoginSuccess} onSwitchToRegister={() => setAuthView('register')} />
      )}
      {step === 'auth' && authView === 'register' && (
        <RegistrationForm onSafeSuccess={handleAuthSuccess} onSwitchToLogin={() => setAuthView('login')} />
      )}
      {step === 'success' && (
        <SuccessPage userData={userData} onProceed={() => setStep('dashboard')} />
      )}
      {step === 'dashboard' && (
        <Dashboard userData={userData} onLogout={handleLogout} onUpgrade={handleUpgrade} />
      )}
      {step === 'payment' && (
        <PaymentPage userData={userData} onPaymentSuccess={handlePaymentSuccess} onBack={() => setStep('dashboard')} />
      )}
    </Layout>
  )
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
      {/* Scanline overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[9997]"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px)' }}
      />
      <Routes>
        <Route path="/chat" element={<ChatApp />} />
        <Route path="/*"    element={<MarketingLayout />} />
      </Routes>
    </BrowserRouter>
  )
}
