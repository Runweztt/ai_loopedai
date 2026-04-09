import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../constants';
import { signInWithGoogle } from '../lib/supabase';

// ── Eye icon ──────────────────────────────────────────────────────────
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

// ── Country list ──────────────────────────────────────────────────────
const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda',
  'Argentina','Armenia','Australia','Austria','Azerbaijan','Bahamas','Bahrain',
  'Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan',
  'Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria',
  'Burkina Faso','Burundi','Cabo Verde','Cambodia','Cameroon','Canada',
  'Central African Republic','Chad','Chile','China','Colombia','Comoros',
  'Congo','Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark',
  'Djibouti','Dominica','Dominican Republic','Ecuador','Egypt','El Salvador',
  'Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia','Fiji',
  'Finland','France','Gabon','Gambia','Georgia','Germany','Ghana','Greece',
  'Grenada','Guatemala','Guinea','Guinea-Bissau','Guyana','Haiti','Honduras',
  'Hungary','Iceland','India','Indonesia','Iran','Iraq','Ireland','Israel',
  'Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati',
  'Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia',
  'Libya','Liechtenstein','Lithuania','Luxembourg','Madagascar','Malawi',
  'Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania',
  'Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia',
  'Montenegro','Morocco','Mozambique','Myanmar','Namibia','Nauru','Nepal',
  'Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea',
  'North Macedonia','Norway','Oman','Pakistan','Palau','Palestine','Panama',
  'Papua New Guinea','Paraguay','Peru','Philippines','Poland','Portugal',
  'Qatar','Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia',
  'Saint Vincent and the Grenadines','Samoa','San Marino','Sao Tome and Principe',
  'Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore',
  'Slovakia','Slovenia','Solomon Islands','Somalia','South Africa',
  'South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname',
  'Sweden','Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand',
  'Timor-Leste','Togo','Tonga','Trinidad and Tobago','Tunisia','Turkey',
  'Turkmenistan','Tuvalu','Uganda','Ukraine','United Arab Emirates',
  'United Kingdom','United States','Uruguay','Uzbekistan','Vanuatu',
  'Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

// ── Component ─────────────────────────────────────────────────────────
const RegistrationForm = ({ onSafeSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    country: '',
    location: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const [agreedToPolicy, setAgreedToPolicy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const filteredCountries = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectCountry = (country) => {
    setFormData((f) => ({ ...f, country }));
    setCountrySearch('');
    setCountryOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreedToPolicy) {
      setError('Please agree to the Privacy Policy to continue.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();

        // Email confirmation required — show "check your inbox" screen.
        if (data.email_confirmation_required) {
          setEmailSent(true);
          return;
        }

        // Legacy / InMemoryDB path — auto sign-in succeeded, go straight to dashboard.
        if (data.access_token) {
          onSafeSuccess({
            user_id:      data.user_id,
            email:        data.email || formData.email,
            full_name:    formData.full_name,
            country:      formData.country,
            location:     formData.location,
            link_code:    data.link_code,
            access_token: data.access_token,
          });
          return;
        }

        // Account created but sign-in unavailable — redirect to login.
        setError('Account created! Please log in with your email and password.');
        setTimeout(() => onSwitchToLogin(), 2500);
      } else {
        const err = await response.json();
        const detail = Array.isArray(err.detail)
          ? err.detail.map((e) => e.msg).join('; ')
          : err.detail;
        setError(detail || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration request failed:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-premium-gold/50 transition-all text-white placeholder-white/20';

  // ── Email confirmation pending screen ─────────────────────────────
  if (emailSent) {
    return (
      <div className="glass rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl text-center">
        <div className="w-16 h-16 bg-premium-gold/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-premium-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl md:text-2xl font-bold mb-3">Check your email</h2>
        <p className="text-white/60 text-sm mb-2">
          We sent a confirmation link to
        </p>
        <p className="text-premium-gold font-semibold text-sm mb-6 break-all">{formData.email}</p>
        <p className="text-white/40 text-xs mb-8">
          Click the link in the email to confirm your account, then sign in.
          Check your spam folder if you don't see it within a few minutes.
        </p>
        <button
          onClick={onSwitchToLogin}
          className="w-full bg-premium-gold hover:bg-yellow-500 text-premium-dark font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-premium-gold/20"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-2xl">
      <div className="mb-5 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold mb-2">Create Account</h2>
        <p className="text-white/50 text-xs md:text-sm">Join the most efficient immigration assistance system.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">

        {/* Full name */}
        <input
          type="text"
          placeholder="Full Name"
          required
          className={inputClass}
          value={formData.full_name}
          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
        />

        {/* Email */}
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
            placeholder="Password (min 8 characters)"
            required
            minLength={8}
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

        {/* Country dropdown with search */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setCountryOpen((o) => !o)}
            className={`${inputClass} flex items-center justify-between text-left ${
              formData.country ? 'text-white' : 'text-white/20'
            }`}
          >
            <span>{formData.country || 'Select Country'}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-4 w-4 text-white/30 flex-shrink-0 transition-transform duration-200 ${countryOpen ? 'rotate-180' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {countryOpen && (
            <div className="absolute z-50 top-full mt-1 w-full bg-[#111] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
              {/* Search box */}
              <div className="p-2 border-b border-white/5">
                <input
                  type="text"
                  placeholder="Search country..."
                  autoFocus
                  className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                />
              </div>
              {/* List */}
              <ul className="max-h-48 overflow-y-auto scrollbar-thin">
                {filteredCountries.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-white/30 text-center">No countries found</li>
                ) : (
                  filteredCountries.map((country) => (
                    <li key={country}>
                      <button
                        type="button"
                        onClick={() => selectCountry(country)}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-all hover:bg-premium-gold/10 hover:text-premium-gold ${
                          formData.country === country ? 'text-premium-gold bg-premium-gold/10' : 'text-white/70'
                        }`}
                      >
                        {country}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Location (city / region) */}
        <input
          type="text"
          placeholder="City or Region (e.g. London, Lagos, Toronto)"
          required
          className={inputClass}
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
        />

        {/* Privacy policy agreement */}
        <label className="flex items-start gap-3 cursor-pointer group mt-1">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={agreedToPolicy}
              onChange={(e) => { setAgreedToPolicy(e.target.checked); if (error) setError(''); }}
              className="sr-only"
            />
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
              agreedToPolicy
                ? 'bg-premium-gold border-premium-gold'
                : 'border-white/20 bg-white/5 group-hover:border-white/40'
            }`}>
              {agreedToPolicy && (
                <svg className="w-2.5 h-2.5 text-premium-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-xs text-white/40 leading-relaxed">
            I agree to the{' '}
            <Link
              to="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-premium-gold hover:underline"
            >
              Privacy Policy
            </Link>
            {' '}and confirm I am at least 16 years old.
          </span>
        </label>

        {error && <p className="text-red-400 text-[11px] px-1 italic">{error}</p>}

        <button
          type="submit"
          disabled={loading || !agreedToPolicy}
          className="w-full bg-premium-gold hover:bg-yellow-500 text-premium-dark font-bold py-3.5 md:py-4 rounded-xl transition-all shadow-lg shadow-premium-gold/20 mt-2 md:mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Create Account'}
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
