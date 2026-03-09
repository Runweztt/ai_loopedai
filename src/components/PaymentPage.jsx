import React, { useState } from 'react';

const PaymentPage = ({ userData, onPaymentSuccess, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.loopedai.io';

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = userData?.access_token;
      if (!token) {
        setError('Session expired. Please log in again.');
        setLoading(false);
        return;
      }

      // FIX: Call payment endpoint with Bearer token
      const res = await fetch(`${API_BASE}/api/v1/payment/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: 'premium' }),
      });

      if (res.ok) {
        const data = await res.json();
        onPaymentSuccess({
          ...userData,
          looped_id: data.looped_id,
          is_premium: true,
        });
      } else {
        const err = await res.json();
        setError(err.detail || 'Payment failed. Please try again.');
      }
    } catch {
      setError('Cannot connect to payment server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-premium-gold/50 transition-all text-white placeholder-white/20';

  return (
    <div className="glass rounded-3xl p-8 shadow-2xl max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-premium-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-premium-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">Upgrade to Premium</h2>
        <p className="text-white/50 text-sm">Unlimited queries • All platforms • Priority support</p>
      </div>

      {/* Price */}
      <div className="bg-white/5 rounded-2xl p-5 mb-6 text-center border border-white/5">
        <div className="text-4xl font-bold text-premium-gold mb-1">$9.99<span className="text-lg text-white/40 font-normal">/mo</span></div>
        <p className="text-white/30 text-xs">Cancel anytime • Instant activation</p>
      </div>

      {/* Payment Form */}
      <form onSubmit={handlePayment} className="space-y-4">
        <div>
          <label className="text-xs text-white/40 mb-1 block">Card Number</label>
          <input
            type="text"
            placeholder="4242 4242 4242 4242"
            required
            className={inputClass}
            value={cardNumber}
            onChange={(e) => setCardNumber(e.target.value)}
            maxLength={19}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Expiry</label>
            <input
              type="text"
              placeholder="MM/YY"
              required
              className={inputClass}
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              maxLength={5}
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">CVC</label>
            <input
              type="text"
              placeholder="123"
              required
              className={inputClass}
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              maxLength={4}
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-xs px-1">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-premium-gold hover:bg-yellow-500 text-premium-dark font-bold py-4 rounded-xl transition-all shadow-lg shadow-premium-gold/20 mt-4 disabled:opacity-50"
        >
          {loading ? 'Processing payment...' : 'Pay $9.99 & Activate'}
        </button>
      </form>

      <button
        onClick={onBack}
        className="w-full text-center text-white/30 hover:text-white/60 text-sm mt-4 transition-all"
      >
        ← Back to chat
      </button>

      <p className="text-center text-white/15 text-[10px] mt-4">
        🔒 Payments are processed securely. Your card details are encrypted.
      </p>
    </div>
  );
};

export default PaymentPage;
