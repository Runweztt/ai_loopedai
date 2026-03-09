import React, { useState } from 'react';

const RegistrationForm = ({ onSafeSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    country: '',
    location: '',
    link_telegram: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Use Vite proxy in dev (empty base = same origin, proxied to :8000)
  // Override with VITE_API_BASE_URL for production deployments
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.loopedai.io';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        onSafeSuccess({
          ...formData,
          link_code: data.link_code,
          access_token: data.access_token,
        });
      } else {
        const err = await response.json();
        setError(err.detail || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration request failed:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-premium-gold/50 transition-all text-white placeholder-white/20";

  return (
    <div className="glass rounded-3xl p-8 shadow-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Create Account</h2>
        <p className="text-white/50 text-sm">Join the most efficient immigration assistance system.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          type="text" placeholder="Full Name" required 
          className={inputClass}
          value={formData.full_name}
          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
        />
        <input 
          type="email" placeholder="Email Address" required 
          className={inputClass}
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        <input 
          type="password" placeholder="Password" required 
          className={inputClass}
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
        <div className="grid grid-cols-2 gap-4">
          <input 
            type="text" placeholder="Country" required 
            className={inputClass}
            value={formData.country}
            onChange={(e) => setFormData({...formData, country: e.target.value})}
          />
          <input 
            type="text" placeholder="Location" required 
            className={inputClass}
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />
        </div>

        <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl border border-white/5 mt-4">
          <input 
            type="checkbox" 
            id="tg-link"
            className="w-4 h-4 accent-premium-gold"
            checked={formData.link_telegram}
            onChange={(e) => setFormData({...formData, link_telegram: e.target.checked})}
          />
          <label htmlFor="tg-link" className="text-sm font-medium cursor-pointer">
            Enable Telegram Integration
          </label>
        </div>

        {error && <p className="text-red-400 text-xs mt-2 px-1">{error}</p>}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-premium-gold hover:bg-yellow-500 text-premium-dark font-bold py-4 rounded-xl transition-all shadow-lg shadow-premium-gold/20 mt-6 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Register Now'}
        </button>
      </form>

      <p className="text-center text-white/40 text-sm mt-6">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-premium-gold hover:underline font-medium"
        >
          Sign in
        </button>
      </p>
    </div>
  );
};

export default RegistrationForm;
