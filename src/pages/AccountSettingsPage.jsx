import { useState } from 'react'
import { API_BASE } from '../constants'
import {
  Lock, Trash2, AlertTriangle, ChevronLeft, Check,
  Eye, EyeOff, Loader2, MessageSquareOff, User, Mail,
  Globe, MapPin, Crown, Shield,
} from 'lucide-react'

// ── Primitive UI ──────────────────────────────────────────────────────────────

function Input({ value, onChange, placeholder, disabled, type = 'text', readOnly, ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all
        ${readOnly || disabled
          ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
          : 'bg-white text-gray-900 border-gray-200 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold'
        }`}
      {...props}
    />
  )
}

function PasswordInput({ value, onChange, placeholder, disabled }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        tabIndex={-1}
        aria-label={show ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}

function Label({ icon: Icon, children }) {
  return (
    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 uppercase tracking-widest mb-1.5">
      {Icon && <Icon size={11} className="text-gray-400" />}
      {children}
    </label>
  )
}

function Toast({ type, message }) {
  if (!message) return null
  const config = {
    success: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: <Check size={13} className="flex-shrink-0 mt-0.5" /> },
    error:   { bg: 'bg-red-50 border-red-200',         text: 'text-red-700',     icon: <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" /> },
  }
  const c = config[type] || config.error
  return (
    <div className={`flex items-start gap-2 px-3.5 py-2.5 rounded-xl border text-xs leading-snug ${c.bg} ${c.text}`}>
      {c.icon}<span>{message}</span>
    </div>
  )
}

function Btn({ onClick, disabled, loading, children, variant = 'dark', size = 'md' }) {
  const sizes  = { sm: 'px-3.5 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm' }
  const styles = {
    dark:   'bg-gray-900 text-white hover:bg-gray-700',
    gold:   'bg-gold text-gray-900 hover:bg-gold-muted shadow-btn',
    ghost:  'border border-gray-200 text-gray-600 hover:bg-gray-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    'danger-ghost': 'border border-red-200 text-red-600 hover:bg-red-50',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${sizes[size]} ${styles[variant]}`}
    >
      {loading && <Loader2 size={13} className="animate-spin" />}
      {children}
    </button>
  )
}

// ── Confirm modal ─────────────────────────────────────────────────────────────

function ConfirmModal({ title, body, confirmLabel, expectedValue, onConfirm, onCancel }) {
  const [value,   setValue]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const ready = !expectedValue || value.trim().toUpperCase() === expectedValue.toUpperCase()

  const go = async () => {
    if (!ready) { setError(`Type exactly: ${expectedValue}`); return }
    setLoading(true); setError('')
    try { await onConfirm() }
    catch (e) { setError(e.message || 'Something went wrong.') }
    finally   { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.18)] overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-red-100">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={16} className="text-red-500" />
            </div>
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed pl-12">{body}</p>
        </div>
        <div className="px-6 py-5 flex flex-col gap-3">
          {expectedValue && (
            <div>
              <p className="text-xs text-gray-500 mb-2">
                Type <span className="font-mono font-semibold text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded">{expectedValue}</span> to confirm
              </p>
              <Input value={value} onChange={e => setValue(e.target.value)} placeholder={expectedValue} />
            </div>
          )}
          {error && <Toast type="error" message={error} />}
          <div className="flex gap-2 justify-end pt-1">
            <Btn variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Btn>
            <Btn variant="danger" onClick={go} loading={loading} disabled={!ready}>
              {confirmLabel}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Avatar initials ───────────────────────────────────────────────────────────

function Avatar({ name, size = 'lg' }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const dim = size === 'lg' ? 'w-14 h-14 text-lg' : 'w-9 h-9 text-sm'
  return (
    <div className={`${dim} rounded-2xl bg-gradient-to-br from-gold to-amber-400 flex items-center justify-center font-bold text-gray-900 flex-shrink-0 shadow-sm`}>
      {initials}
    </div>
  )
}

// ── Section card ──────────────────────────────────────────────────────────────

function Card({ children, danger = false }) {
  return (
    <div className={`rounded-2xl border overflow-hidden ${danger ? 'border-red-200' : 'border-gray-200'} bg-white shadow-sm`}>
      {children}
    </div>
  )
}

function CardHeader({ icon: Icon, title, subtitle, danger = false }) {
  return (
    <div className={`flex items-start gap-3 px-6 py-4 border-b ${danger ? 'border-red-100 bg-red-50/40' : 'border-gray-100 bg-gray-50/60'}`}>
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${danger ? 'bg-red-100' : 'bg-gold/10'}`}>
        <Icon size={15} className={danger ? 'text-red-500' : 'text-gold'} />
      </div>
      <div>
        <p className={`text-sm font-semibold ${danger ? 'text-red-700' : 'text-gray-900'}`}>{title}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{subtitle}</p>}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function AccountSettingsPage({ userData, onBack, onProfileUpdate, onLogout }) {
  const [fullName, setFullName] = useState(userData?.full_name || '')
  const [country,  setCountry]  = useState(userData?.country   || '')
  const [location, setLocation] = useState(userData?.location  || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileStatus, setProfileStatus] = useState({ type: '', msg: '' })

  const [currentPw, setCurrentPw] = useState('')
  const [newPw,     setNewPw]     = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwSaving,  setPwSaving]  = useState(false)
  const [pwStatus,  setPwStatus]  = useState({ type: '', msg: '' })

  const [showDataModal,    setShowDataModal]    = useState(false)
  const [showAccountModal, setShowAccountModal] = useState(false)
  const [dataStatus,       setDataStatus]       = useState({ type: '', msg: '' })
  const [accountDeleted,   setAccountDeleted]   = useState(false)

  const token = userData?.access_token

  const profileDirty = (
    fullName.trim() !== (userData?.full_name || '') ||
    country.trim()  !== (userData?.country   || '') ||
    location.trim() !== (userData?.location  || '')
  )

  const handleSaveProfile = async () => {
    setProfileSaving(true); setProfileStatus({ type: '', msg: '' })
    try {
      const res  = await fetch(`${API_BASE}/api/v1/account/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          full_name: fullName.trim() || undefined,
          country:   country.trim()  || undefined,
          location:  location.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
      onProfileUpdate({ full_name: data.full_name, country: data.country, location: data.location })
      setProfileStatus({ type: 'success', msg: 'Profile saved successfully.' })
    } catch (e) { setProfileStatus({ type: 'error', msg: e.message }) }
    finally     { setProfileSaving(false) }
  }

  const handleChangePassword = async () => {
    setPwStatus({ type: '', msg: '' })
    if (!currentPw || !newPw || !confirmPw) { setPwStatus({ type: 'error', msg: 'All fields are required.' }); return }
    if (newPw.length < 8)                   { setPwStatus({ type: 'error', msg: 'New password must be at least 8 characters.' }); return }
    if (newPw !== confirmPw)                { setPwStatus({ type: 'error', msg: 'New passwords do not match.' }); return }
    setPwSaving(true)
    try {
      const res  = await fetch(`${API_BASE}/api/v1/account/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
      setPwStatus({ type: 'success', msg: 'Password changed. Signing you out…' })
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setTimeout(() => onLogout(), 2500)
    } catch (e) { setPwStatus({ type: 'error', msg: e.message }) }
    finally     { setPwSaving(false) }
  }

  const handleDeleteData = async () => {
    const res  = await fetch(`${API_BASE}/api/v1/account/data-deletion-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ deletion_type: 'data_only' }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
    setShowDataModal(false)
    setDataStatus({ type: 'success', msg: data.detail })
  }

  const handleDeleteAccount = async () => {
    const res  = await fetch(`${API_BASE}/api/v1/account`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ confirm: 'DELETE MY ACCOUNT' }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.detail || `Error ${res.status}`)
    setShowAccountModal(false)
    setAccountDeleted(true)
    setTimeout(() => onLogout(), 3000)
  }

  if (accountDeleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center">
          <Trash2 size={24} className="text-gray-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Account deleted</h2>
          <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
            Your account has been deactivated. All personal data will be permanently deleted within 30 days.
          </p>
        </div>
        <p className="text-xs text-gray-400">Signing you out…</p>
      </div>
    )
  }

  return (
    <>
      {showDataModal && (
        <ConfirmModal
          title="Delete conversation history"
          body="All stored chat history will be permanently deleted. Your account stays active. This cannot be undone."
          confirmLabel="Delete history"
          expectedValue="DELETE MY DATA"
          onConfirm={handleDeleteData}
          onCancel={() => setShowDataModal(false)}
        />
      )}
      {showAccountModal && (
        <ConfirmModal
          title="Delete account permanently"
          body="Your account will be immediately deactivated and you will be signed out. All data — profile, chats, and linked services — will be deleted within 30 days. This cannot be undone."
          confirmLabel="Delete my account"
          expectedValue="DELETE MY ACCOUNT"
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowAccountModal(false)}
        />
      )}

      <div className="w-full max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={onBack}
            aria-label="Back to chat"
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Account settings</h1>
            <p className="text-xs text-gray-400 mt-0.5">Manage your profile, security, and data</p>
          </div>
        </div>

        {/* ── Identity card ────────────────────────────────────────── */}
        <div className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 shadow-sm">
          <Avatar name={userData?.full_name} />
          <div className="flex-1 min-w-0">
            <p className="text-base font-semibold text-gray-900 truncate">{userData?.full_name || 'Your name'}</p>
            <p className="text-xs text-gray-400 truncate mt-0.5">{userData?.email}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${
            userData?.is_premium
              ? 'bg-gold/10 text-amber-700 border border-gold/20'
              : 'bg-gray-100 text-gray-500 border border-gray-200'
          }`}>
            {userData?.is_premium
              ? <><Crown size={12} />Premium</>
              : <><Shield size={12} />Free</>
            }
          </div>
        </div>

        {/* ── Profile ──────────────────────────────────────────────── */}
        <Card>
          <CardHeader icon={User} title="Profile" subtitle="Update your display name and location." />
          <div className="px-6 py-5 flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label icon={User}>Full name</Label>
                <Input
                  value={fullName}
                  onChange={e => { setFullName(e.target.value); setProfileStatus({ type: '', msg: '' }) }}
                  placeholder="Your full name"
                  disabled={profileSaving}
                />
              </div>
              <div>
                <Label icon={Mail}>Email</Label>
                <Input value={userData?.email || ''} readOnly />
              </div>
              <div>
                <Label icon={Globe}>Country</Label>
                <Input
                  value={country}
                  onChange={e => { setCountry(e.target.value); setProfileStatus({ type: '', msg: '' }) }}
                  placeholder="e.g. Nigeria"
                  disabled={profileSaving}
                />
              </div>
              <div>
                <Label icon={MapPin}>City / location</Label>
                <Input
                  value={location}
                  onChange={e => { setLocation(e.target.value); setProfileStatus({ type: '', msg: '' }) }}
                  placeholder="e.g. Lagos"
                  disabled={profileSaving}
                />
              </div>
            </div>
            {profileStatus.msg && <Toast type={profileStatus.type} message={profileStatus.msg} />}
            <div className="flex justify-end">
              <Btn variant="gold" onClick={handleSaveProfile} loading={profileSaving} disabled={!profileDirty}>
                Save changes
              </Btn>
            </div>
          </div>
        </Card>

        {/* ── Password ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader icon={Lock} title="Change password" subtitle="Minimum 8 characters. Not available for Google sign-in accounts." />
          <div className="px-6 py-5 flex flex-col gap-4">
            <div>
              <Label>Current password</Label>
              <PasswordInput
                value={currentPw}
                onChange={e => { setCurrentPw(e.target.value); setPwStatus({ type: '', msg: '' }) }}
                placeholder="Your current password"
                disabled={pwSaving}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>New password</Label>
                <PasswordInput
                  value={newPw}
                  onChange={e => { setNewPw(e.target.value); setPwStatus({ type: '', msg: '' }) }}
                  placeholder="At least 8 characters"
                  disabled={pwSaving}
                />
              </div>
              <div>
                <Label>Confirm new password</Label>
                <PasswordInput
                  value={confirmPw}
                  onChange={e => { setConfirmPw(e.target.value); setPwStatus({ type: '', msg: '' }) }}
                  placeholder="Repeat new password"
                  disabled={pwSaving}
                />
              </div>
            </div>
            {pwStatus.msg && <Toast type={pwStatus.type} message={pwStatus.msg} />}
            <div className="flex justify-end">
              <Btn variant="dark" onClick={handleChangePassword} loading={pwSaving} disabled={!currentPw || !newPw || !confirmPw}>
                Update password
              </Btn>
            </div>
          </div>
        </Card>

        {/* ── Danger zone ──────────────────────────────────────────── */}
        <Card danger>
          <CardHeader icon={AlertTriangle} title="Danger zone" subtitle="Permanent actions — cannot be undone." danger />
          <div className="px-6 py-5 flex flex-col gap-3">

            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white border border-gray-100">
              <div className="flex items-start gap-3 min-w-0">
                <MessageSquareOff size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800">Delete conversation history</p>
                  <p className="text-xs text-gray-400 mt-0.5">Removes all stored chats. Account stays active.</p>
                </div>
              </div>
              <Btn variant="ghost" size="sm" onClick={() => setShowDataModal(true)}>Delete history</Btn>
            </div>
            {dataStatus.msg && <Toast type={dataStatus.type} message={dataStatus.msg} />}

            <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-red-50/60 border border-red-200">
              <div className="flex items-start gap-3 min-w-0">
                <Trash2 size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-red-700">Delete account</p>
                  <p className="text-xs text-gray-400 mt-0.5">Deactivates immediately. All data deleted within 30 days.</p>
                </div>
              </div>
              <Btn variant="danger" size="sm" onClick={() => setShowAccountModal(true)}>Delete</Btn>
            </div>

          </div>
        </Card>

        <p className="text-center text-xs text-gray-400 pb-4">
          Questions about your data?{' '}
          <a href="mailto:info@loopedai.io" className="text-gold hover:underline underline-offset-2">
            info@loopedai.io
          </a>
        </p>

      </div>
    </>
  )
}
