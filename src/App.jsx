import React, { useState, useEffect } from 'react';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import SuccessPage from './components/SuccessPage';
import Dashboard from './components/Dashboard';
import PaymentPage from './components/PaymentPage';
import Layout from './components/Layout';

const SESSION_KEY = 'immigration_ai_session';

function App() {
  const [step, setStep] = useState('auth'); // 'auth' | 'success' | 'dashboard' | 'payment'
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [userData, setUserData] = useState(null);

  // Restore session from localStorage on page load
  useEffect(() => {
    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.access_token) {
          setUserData(parsed);
          setStep('dashboard');
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
  }, []);

  const handleAuthSuccess = (data) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    setUserData(data);
    setStep('success');
  };

  const handleLoginSuccess = (data) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    setUserData(data);
    setStep('dashboard');
  };

  const handleProceedToDashboard = () => {
    setStep('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('immigration_ai_prompt_count'); // Clear freemium counter on logout
    setUserData(null);
    setStep('auth');
    setAuthView('login');
  };

  // FIX: Handle upgrade — navigate to payment page
  const handleUpgrade = () => {
    setStep('payment');
  };

  // FIX: Handle payment success — update session with premium status and LAI ID
  const handlePaymentSuccess = (updatedData) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(updatedData));
    localStorage.removeItem('immigration_ai_prompt_count'); // Reset prompt counter for premium users
    setUserData(updatedData);
    setStep('dashboard');
  };

  return (
    <Layout isFullWidth={step === 'dashboard'}>
      {step === 'auth' && authView === 'login' && (
        <LoginForm
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setAuthView('register')}
        />
      )}
      {step === 'auth' && authView === 'register' && (
        <RegistrationForm
          onSafeSuccess={handleAuthSuccess}
          onSwitchToLogin={() => setAuthView('login')}
        />
      )}
      {step === 'success' && (
        <SuccessPage userData={userData} onProceed={handleProceedToDashboard} />
      )}
      {step === 'dashboard' && (
        <Dashboard userData={userData} onLogout={handleLogout} onUpgrade={handleUpgrade} />
      )}
      {step === 'payment' && (
        <PaymentPage
          userData={userData}
          onPaymentSuccess={handlePaymentSuccess}
          onBack={() => setStep('dashboard')}
        />
      )}
    </Layout>
  );
}

export default App;
