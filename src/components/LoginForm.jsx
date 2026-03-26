import React, { useState } from 'react';
import { API_BASE } from '../constants';
import { signInWithGoogle } from '../lib/supabase';

const EyeIcon = ({ open }) => open ? (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
        // Backend login response is flat — all fields are top-level (no nested profile key).
        onSuccess({
          access_token:        data.access_token,
          user_id:             data.user_id             || '',
          email:               data.email               || formData.email,
          full_name:           data.full_name           || formData.email,
          country:             data.country             || '',
          location:            data.location            || '',
          is_premium:          data.is_premium          || false,
          is_admin:            data.is_admin            || false,
          looped_id:           data.looped_id           || '',
          link_code:           data.telegram_link_code  || '',
          is_telegram_enabled: data.is_telegram_enabled || false,
        });
      } else {
        const err = await res.json();
        const detail = Array.isArray(err.detail)
          ? err.detail.map((e) => e.msg).join('; ')
          : err.detail;
        setError(detail || 'Login failed. Check your email and password.');
      }
    } catch (err) {
      console.error('Login request failed:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-premium-gold/50 transition-all text-white placeholder-white/20';

  return (
    <div className="glass rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl">
      <div className="mb-6 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-2">Sign In</h2>
        <p className="text-white/50 text-xs md:text-sm">Welcome back. Access your loopedai assistant.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
        <input
          type="email"
          placeholder="Email Address"
          required
          className={inputClass}
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />

        {/* Password with show/hide toggle */}
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            required
            className={`${inputClass} pr-11`}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-all"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>

        {error && <p className="text-red-400 text-[11px] px-1 italic">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-premium-gold hover:bg-yellow-500 text-premium-dark font-bold py-3.5 md:py-4 rounded-xl transition-all shadow-lg shadow-premium-gold/20 mt-4 md:mt-6 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="flex items-center gap-3 mt-5">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/20 text-xs">or</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <button
        type="button"
        onClick={() => signInWithGoogle(window.location.origin)}
        className="w-full flex items-center justify-center gap-3 mt-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-3 text-sm font-medium text-white/80 transition-all"
      >
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      <p className="text-center text-white/40 text-xs md:text-sm mt-6">
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
