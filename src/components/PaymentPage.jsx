import React, { useState } from 'react';
import { API_BASE } from '../constants';

const PaymentPage = ({ onBack, userData }) => {
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/stripe/create-checkout-session`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${userData?.access_token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Could not start checkout.');
      // Redirect to Stripe-hosted checkout page — we never handle card data
      window.location.href = data.checkout_url;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 shadow-card border border-black/10 max-w-md mx-auto text-center">
      {/* Header */}
      <div className="mb-8">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Upgrade to Premium</h2>
        <p className="text-black/55 text-sm">
          Secure checkout powered by Stripe — we never store your card details.
        </p>
      </div>

      {/* What you get */}
      <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left space-y-3 border border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Premium includes</p>
        {[
          'Unlimited immigration queries',
          'Telegram bot integration',
          'Priority AI responses',
          'Visa document review (5-agent AI)',
          'Unique LoopedAI ID across all platforms',
        ].map((item) => (
          <div key={item} className="flex items-center gap-3 text-sm">
            <span className="text-gold font-bold">✓</span>
            <span className="text-gray-700">{item}</span>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Stripe checkout button */}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-gold hover:bg-gold-muted disabled:opacity-50 text-gray-900 font-bold py-4 rounded-xl transition-all shadow-btn mb-4 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
            Redirecting to Stripe…
          </>
        ) : (
          'Subscribe — $20 / month'
        )}
      </button>

      <p className="text-black/35 text-xs mb-4">
        You will be taken to Stripe's secure payment page.
      </p>

      <button
        onClick={onBack}
        className="w-full text-center text-black/35 hover:text-black/65 text-sm transition-all"
      >
        ← Back to chat
      </button>
    </div>
  );
};

export default PaymentPage;
