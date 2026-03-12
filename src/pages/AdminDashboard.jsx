import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE } from '../constants';
import logo from '../assets/logo-06.png';

const badge = {
  green:  'px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/20 text-green-400',
  red:    'px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400',
  gold:   'px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-500/20 text-yellow-400',
  muted:  'px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-white/30',
};

const Card = ({ label, children, sub }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-5">
    <p className="text-xs text-white/40 mb-2">{label}</p>
    {children}
    {sub && <p className="text-[10px] text-white/25 mt-1">{sub}</p>}
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

const AdminDashboard = ({ userData, onLogout }) => {
  const [system, setSystem] = useState(null);
  const [users, setUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revoking, setRevoking] = useState('');

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

  return (
    <div className="min-h-screen bg-void text-white">
      {/* Header */}
      <header className="border-b border-white/8 px-4 md:px-6 py-4 flex items-center justify-between gap-3">
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
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Super Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-white/30 hidden md:block truncate max-w-[160px]">{userData?.email}</span>
          <a
            href="/chat"
            className="text-xs border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/5 transition-all"
          >
            Chat
          </a>
          <button
            onClick={onLogout}
            className="text-xs border border-white/10 rounded-lg px-3 py-1.5 hover:bg-white/5 transition-all text-white/50"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-8">
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-premium-gold/30 border-t-premium-gold rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        {system && (
          <>
            {/* System Health */}
            <section>
              <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">System Health</h2>
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
                  <p className="text-2xl font-black text-premium-gold">{system.active_users}</p>
                </Card>
              </div>
            </section>

            {/* User Stats + Table */}
            {users && (
              <section>
                <h2 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">Users</h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
                  <Card label="Total"><p className="text-2xl md:text-3xl font-black">{users.total}</p></Card>
                  <Card label="Online"><p className="text-2xl md:text-3xl font-black text-green-400">{users.online}</p></Card>
                  <Card label="Offline"><p className="text-2xl md:text-3xl font-black text-white/30">{users.offline}</p></Card>
                </div>

                {/* Scrollable table on mobile */}
                <div className="overflow-x-auto rounded-2xl border border-white/8">
                  <table className="w-full text-sm min-w-[480px]">
                    <thead>
                      <tr className="border-b border-white/8">
                        {['User', 'Status', 'Plan', 'Last Seen', 'Action'].map((h) => (
                          <th key={h} className="text-left text-[10px] font-bold text-white/30 uppercase tracking-wider px-4 py-3">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.users.map((u) => (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/3 transition-all">
                          <td className="px-4 py-3">
                            <p className="font-medium text-xs truncate max-w-[120px]">{u.full_name || '—'}</p>
                            <p className="text-[10px] text-white/30 truncate max-w-[120px]">{u.email}</p>
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
                              : <span className="text-[10px] text-white/25">Free</span>
                            }
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] text-white/30">{formatLastSeen(u.last_seen)}</span>
                          </td>
                          <td className="px-4 py-3">
                            {u.is_admin ? (
                              <span className="text-[10px] text-premium-gold font-bold">Admin</span>
                            ) : (
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
                            )}
                          </td>
                        </tr>
                      ))}
                      {users.users.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-xs text-white/20">No users yet.</td>
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
                className="text-xs text-white/30 hover:text-white/60 transition-all border border-white/10 rounded-lg px-4 py-2"
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
