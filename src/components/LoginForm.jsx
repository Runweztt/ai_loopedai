import React, { useState } from 'react';

const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        // Normalise: Supabase returns profile nested, InMemoryDB returns flat
        const profile = data.profile || {};
        onSuccess({
          access_token: data.access_token,
          full_name: profile.full_name || formData.email,
          email: formData.email,
          country: profile.country || '',
          location: profile.location || '',
          link_code: profile.telegram_link_code || '',
        });
      } else {
        const err = await res.json();
        setError(err.detail || 'Login failed. Check your email and password.');
      }
    } catch {
      setError('Cannot connect to the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-premium-gold/50 transition-all text-white placeholder-white/20';

  return (
    <div className="glass rounded-3xl p-8 shadow-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Sign In</h2>
        <p className="text-white/50 text-sm">Welcome back. Access your immigration assistant.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email Address"
          required
          className={inputClass}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          required
          className={inputClass}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        {error && <p className="text-red-400 text-xs px-1">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-premium-gold hover:bg-yellow-500 text-premium-dark font-bold py-4 rounded-xl transition-all shadow-lg shadow-premium-gold/20 mt-6 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-center text-white/40 text-sm mt-6">
        No account?{' '}
        <button
          onClick={onSwitchToRegister}
          className="text-premium-gold hover:underline font-medium"
        >
          Register now
        </button>
      </p>
    </div>
  );
};

export default LoginForm;
