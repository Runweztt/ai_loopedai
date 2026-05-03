import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../constants';
import logo from '../assets/logo-06.png';

const badge = {
  green:  'px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400',
  red:    'px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400',
  gold:   'px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-400',
  muted:  'px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/5 text-black/35',
};

const Card = ({ label, children, sub }) => (
  <div className="bg-black/5 border border-black/12 rounded-2xl p-4 md:p-5">
    <p className="text-xs text-black/45 mb-2">{label}</p>
    {children}
    {sub && <p className="text-[10px] text-black/30 mt-1">{sub}</p>}
  </div>
);

const formatLastSeen = (iso) => {
  if (!iso) return 'Never';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
};

const TelegramCodeModal = ({ code, expiresAt, onClose }) => {
  const [copied, setCopied] = useState(false);
  const botLink = `https://t.me/LoopedAI_bot?start=${code}`;

  const copyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl border border-black/10 shadow-xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm">New Telegram Link Code</h3>
          <button onClick={onClose} className="text-black/35 hover:text-black/60 text-lg leading-none">✕</button>
        </div>
        <p className="text-xs text-black/45">Share this with the user. They open the link in Telegram to link their account.</p>

        <div className="bg-black/5 rounded-xl p-4 text-center">
          <p className="font-mono font-black text-2xl tracking-widest text-gold">{code}</p>
          <p className="text-[10px] text-black/30 mt-1">
            Expires {expiresAt ? new Date(expiresAt).toLocaleDateString() : '—'}
          </p>
        </div>

        <div className="space-y-2">
          <a
            href={botLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center text-xs bg-[#0088cc] text-white font-bold py-2.5 rounded-xl hover:bg-[#0077b5] transition-all"
          >
            Open in Telegram Bot ↗
          </a>
          <button
            onClick={copyCode}
            className="block w-full text-xs border border-black/12 rounded-xl py-2.5 hover:bg-black/5 transition-all font-medium"
          >
            {copied ? '✓ Copied!' : 'Copy Code'}
          </button>
        </div>
      </div>
    </div>
  );
};

const fmtDuration = (seconds) => {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const AdminDashboard = ({ userData, onLogout }) => {
  const [system, setSystem] = useState(null);
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revoking, setRevoking] = useState('');
  const [togglingPremium, setTogglingPremium] = useState('');
  const [telegramModal, setTelegramModal] = useState(null); // { code, expiresAt }
  const [resettingTelegram, setResettingTelegram] = useState('');


  const token = userData?.access_token;

  const fetchData = useCallback(async () => {
    try {
      const [sysRes, usersRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/admin/system`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/v1/admin/users`,  { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!sysRes.ok || !usersRes.ok) { setError('Failed to load admin data.'); return; }
      const [sys, usr] = await Promise.all([sysRes.json(), usersRes.json()]);
      setSystem(sys);
      setUsers(usr);
      setError('');
    } catch {
      setError('Cannot connect to backend.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30000);
    return () => clearInterval(id);
  }, [fetchData]);


  const handleResetTelegram = async (userId) => {
    setResettingTelegram(userId);
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}/regenerate-telegram-code`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTelegramModal({ code: data.link_code, expiresAt: data.link_code_expires_at });
        fetchData();
      } else {
        const err = await res.json().catch(() => ({}));
        setError(`Failed to reset Telegram link: ${err.detail || res.status}`);
      }
    } catch {
      setError('Failed to reset Telegram link: network error');
    } finally {
      setResettingTelegram('');
    }
  };

  const handleRevoke = async (userId, isRevoked) => {
    setRevoking(userId);
    const action = isRevoked ? 'restore' : 'revoke';
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchData();
      else setError(`Failed to ${action} user.`);
    } catch {
      setError(`Failed to ${action} user.`);
    } finally {
      setRevoking('');
    }
  };

  const handleTogglePremium = async (userId, isPremium) => {
    setTogglingPremium(userId);
    const action = isPremium ? 'revoke-premium' : 'grant-premium';
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchData();
      else setError(`Failed to ${isPremium ? 'revoke' : 'grant'} premium.`);
    } catch {
      setError(`Failed to update premium status.`);
    } finally {
      setTogglingPremium('');
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {telegramModal && (
        <TelegramCodeModal
          code={telegramModal.code}
          expiresAt={telegramModal.expiresAt}
          onClose={() => setTelegramModal(null)}
        />
      )}
      {/* Header */}
      <header className="border-b border-black/10 px-4 md:px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            role="img" aria-label="LoopedAI"
            style={{
              width: '156px', height: '40px', flexShrink: 0,
              backgroundImage: `url(${logo})`,
              backgroundSize: '218px',
              backgroundPosition: '-28px -84px',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div className="min-w-0">
            <p className="text-[10px] text-black/35 uppercase tracking-widest">Super Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-black/35 hidden md:block truncate max-w-[160px]">{userData?.email}</span>
          <a
            href="/chat"
            className="text-xs border border-black/12 rounded-lg px-3 py-1.5 hover:bg-black/5 transition-all"
          >
            Chat
          </a>
          <button
            onClick={onLogout}
            className="text-xs border border-black/12 rounded-lg px-3 py-1.5 hover:bg-black/5 transition-all text-black/55"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        {system && (
          <>
            {/* System Health */}
            <section>
              <h2 className="text-xs font-bold text-black/35 uppercase tracking-widest mb-3">System Health</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <Card label="Overall">
                  <span className={system.status === 'ok' ? badge.green : badge.red}>
                    {system.status === 'ok' ? '● Online' : '● Degraded'}
                  </span>
                </Card>
                <Card label="Database" sub={system.db.type}>
                  <span className={system.db.status === 'ok' ? badge.green : badge.red}>
                    {system.db.status === 'ok' ? '● Connected' : '● Error'}
                  </span>
                </Card>
                <Card label="AI Engine" sub={`${system.ai.provider} · ${system.ai.slots} slots`}>
                  <span className={system.ai.configured ? badge.green : badge.red}>
                    {system.ai.configured ? '● Ready' : '● Not configured'}
                  </span>
                </Card>
                <Card label="Active Now" sub="last 5 min">
                  <p className="text-2xl font-black text-gold">{system.active_users}</p>
                </Card>
              </div>
            </section>

            {/* Site Analytics */}
            <section>
              <h2 className="text-xs font-bold text-black/35 uppercase tracking-widest mb-3">Site Analytics</h2>
              <div className="rounded-2xl overflow-hidden border border-black/10">
                <iframe
                  src="https://datastudio.google.com/embed/reporting/b238395b-7d2c-42fd-9526-71c662bde383/page/pP4wF"
                  width="100%"
                  height="600"
                  frameBorder="0"
                  style={{ border: 0 }}
                  allowFullScreen
                  sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                />
              </div>
            </section>

            {/* User Stats + Table */}
            {users && (
              <section>
                <h2 className="text-xs font-bold text-black/35 uppercase tracking-widest mb-3">Users</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
                  <Card label="Total"><p className="text-2xl md:text-3xl font-black">{users.total}</p></Card>
                  <Card label="Online"><p className="text-2xl md:text-3xl font-black text-green-400">{users.online}</p></Card>
                  <Card label="Offline"><p className="text-2xl md:text-3xl font-black text-black/35">{users.offline}</p></Card>
                </div>

                {/* Scrollable table on mobile */}
                <div className="overflow-x-auto rounded-2xl border border-black/10">
                  <table className="w-full text-sm min-w-[480px]">
                    <thead>
                      <tr className="border-b border-black/10">
                        {['User', 'Status', 'Plan', 'Telegram', 'Action'].map((h) => (
                          <th key={h} className="text-left text-[10px] font-bold text-black/35 uppercase tracking-wider px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.users.map((u) => (
                        <tr key={u.id} className="border-b border-black/10 hover:bg-black/3 transition-all">
                          <td className="px-4 py-3">
                            <p className="font-medium text-xs truncate max-w-[120px]">{u.full_name || '—'}</p>
                            <p className="text-[10px] text-black/35 truncate max-w-[120px]">{u.email}</p>
                          </td>
                          <td className="px-4 py-3">
                            {u.is_revoked ? (
                              <span className={badge.red}>● Revoked</span>
                            ) : u.is_online ? (
                              <span className={badge.green}>● Online</span>
                            ) : (
                              <span className={badge.muted}>● Offline</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            {u.is_premium
                              ? <span className={badge.gold}>Premium</span>
                              : <span className="text-[10px] text-black/30">Free</span>
                            }
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              {u.is_telegram_enabled ? (
                                <span className={badge.green}>● Linked</span>
                              ) : (
                                <span className={badge.muted}>Not linked</span>
                              )}
                              <button
                                onClick={() => handleResetTelegram(u.id)}
                                disabled={resettingTelegram === u.id}
                                className="text-[10px] font-bold px-2 py-1 rounded-lg bg-blue-500/15 text-blue-500 hover:bg-blue-500/25 transition-all disabled:opacity-40 w-fit"
                              >
                                {resettingTelegram === u.id ? '…' : 'New Code'}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {u.is_admin ? (
                              <span className="text-[10px] text-gold font-bold">Admin</span>
                            ) : (
                              <div className="flex flex-col gap-1.5">
                                <button
                                  onClick={() => handleTogglePremium(u.id, u.is_premium)}
                                  disabled={togglingPremium === u.id}
                                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 ${
                                    u.is_premium
                                      ? 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                                      : 'bg-yellow-500/10 text-yellow-600/60 hover:bg-yellow-500/20'
                                  }`}
                                >
                                  {togglingPremium === u.id ? '…' : u.is_premium ? 'Revoke Premium' : 'Grant Premium'}
                                </button>
                                <button
                                  onClick={() => handleRevoke(u.id, u.is_revoked)}
                                  disabled={revoking === u.id}
                                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-40 ${
                                    u.is_revoked
                                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                  }`}
                                >
                                  {revoking === u.id ? '…' : u.is_revoked ? 'Restore' : 'Revoke'}
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                      {users.users.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-xs text-black/25">No users yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            <div className="flex justify-end">
              <button
                onClick={fetchData}
                className="text-xs text-black/35 hover:text-black/60 transition-all border border-black/12 rounded-lg px-4 py-2"
              >
                Refresh
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
