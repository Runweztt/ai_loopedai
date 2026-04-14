import React, { useEffect, useState, useCallback } from 'react';
import { API_BASE } from '../constants';
import logo from '../assets/logo-06.png';

/**
 * Sidebar showing the user's past chat sessions.
 * Allows switching between conversations and starting a new one.
 */
const ChatSidebar = ({ userData, activeSessionId, onSelectSession, onNewChat, isOpen, onToggle }) => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    if (!userData?.access_token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/chats`, {
        headers: { Authorization: `Bearer ${userData.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch {
      // Silently ignore — sidebar is non-critical
    } finally {
      setLoading(false);
    }
  }, [userData?.access_token]);

  // Load sessions when sidebar opens or active session changes
  useEffect(() => {
    if (isOpen) fetchSessions();
  }, [isOpen, activeSessionId, fetchSessions]);

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Toggle button — always visible, sits below the header (top-[78px]) */}
      <button
        onClick={onToggle}
        title={isOpen ? 'Close history' : 'Open chat history'}
        className="fixed left-0 top-[78px] z-39 bg-black/5 border border-black/12 border-l-0 rounded-r-xl px-1.5 py-4 hover:bg-black/10 transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-black/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Sidebar panel — starts below the Layout header (top-[73px]) so the logo is never covered */}
      <div
        className={`fixed left-0 top-[73px] h-[calc(100%-73px)] z-30 flex flex-col transition-all duration-300 ease-in-out
          bg-white border-r border-gray-100 shadow-lg
          ${isOpen ? 'w-[280px] md:w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div
              role="img" aria-label="LoopedAI"
              style={{
                width: '40px', height: '40px', flexShrink: 0,
                backgroundImage: `url(${logo})`,
                backgroundSize: '218px',
                backgroundPosition: '-28px -84px',
                backgroundRepeat: 'no-repeat',
              }}
            />
            <span className="text-xs font-bold text-black/60 uppercase tracking-wider">Chat History</span>
          </div>
        </div>

        {/* New Chat button */}
        <div className="px-3 py-3 flex-shrink-0">
          <button
            onClick={() => { onNewChat(); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 border border-gold/20 text-gold text-xs font-semibold hover:bg-amber-100 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5 scrollbar-thin">
          {loading && (
            <div className="flex justify-center py-8">
              <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          )}

          {!loading && sessions.length === 0 && (
            <p className="text-xs text-gray-300 text-center py-8 px-3">
              Your past conversations will appear here.
            </p>
          )}

          {!loading && sessions.map((s) => {
            const isActive = s.session_id === activeSessionId;
            return (
              <button
                key={s.session_id}
                onClick={() => onSelectSession(s.session_id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl transition-all group
                  ${isActive
                    ? 'bg-amber-50 border border-gold/20'
                    : 'hover:bg-gray-50 border border-transparent'
                  }`}
              >
                {/* Title */}
                <p className={`text-xs font-medium truncate leading-relaxed
                  ${isActive ? 'text-gold' : 'text-gray-600 group-hover:text-gray-900'}`}>
                  {s.title || 'Untitled conversation'}
                </p>
                {/* Meta */}
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-gray-400">{formatDate(s.last_message_at)}</span>
                  <span className="text-[10px] text-gray-300">{s.message_count} msg{s.message_count !== 1 ? 's' : ''}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Telegram link code — premium only, shown until user links their account */}
        {userData?.is_premium && userData?.telegram_link_code && !userData?.is_telegram_enabled && (
          <div className="px-3 py-3 border-t border-gray-100 flex-shrink-0">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1.5">Telegram Link Code</p>
            <div className="bg-amber-50 rounded-lg px-3 py-2 font-mono text-sm text-gold border border-gold/20 select-all text-center">
              /link {userData.telegram_link_code}
            </div>
            <a
              href={`https://t.me/${import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'LoopedAIBot'}`}
              target="_blank"
              rel="noreferrer"
              className="block text-center text-[10px] text-gold/60 hover:text-gold mt-1.5 transition-all"
            >
              Open Telegram Bot →
            </a>
          </div>
        )}

        {/* Refresh button at bottom */}
        <div className="px-3 py-3 border-t border-black/10 flex-shrink-0">
          <button
            onClick={fetchSessions}
            className="w-full flex items-center justify-center gap-1.5 text-[10px] text-black/25 hover:text-black/40 transition-all py-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};

export default ChatSidebar;
