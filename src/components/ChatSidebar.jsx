import React, { useEffect, useState, useCallback } from 'react';
import { API_BASE } from '../constants';

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
      {/* Toggle button — always visible */}
      <button
        onClick={onToggle}
        title={isOpen ? 'Close history' : 'Open chat history'}
        className="fixed left-0 top-[40%] -translate-y-1/2 z-40 bg-white/5 border border-white/10 border-l-0 rounded-r-xl px-1.5 py-4 hover:bg-white/10 transition-all"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-4 w-4 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Sidebar panel */}
      <div
        className={`fixed left-0 top-0 h-full z-30 flex flex-col transition-all duration-300 ease-in-out
          bg-navy border-r border-white/8
          ${isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 overflow-hidden'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-5 pb-3 border-b border-white/5 flex-shrink-0">
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-premium-gold/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Chat History</span>
          </div>
        </div>

        {/* New Chat button */}
        <div className="px-3 py-3 flex-shrink-0">
          <button
            onClick={() => { onNewChat(); }}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl bg-premium-gold/10 border border-premium-gold/20 text-premium-gold text-xs font-semibold hover:bg-premium-gold/20 transition-all"
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
              <div className="w-4 h-4 border-2 border-premium-gold/30 border-t-premium-gold rounded-full animate-spin" />
            </div>
          )}

          {!loading && sessions.length === 0 && (
            <p className="text-xs text-white/20 text-center py-8 px-3">
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
                    ? 'bg-premium-gold/15 border border-premium-gold/25'
                    : 'hover:bg-white/5 border border-transparent'
                  }`}
              >
                {/* Title */}
                <p className={`text-xs font-medium truncate leading-relaxed
                  ${isActive ? 'text-premium-gold' : 'text-white/60 group-hover:text-white/80'}`}>
                  {s.title || 'Untitled conversation'}
                </p>
                {/* Meta */}
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-white/25">{formatDate(s.last_message_at)}</span>
                  <span className="text-[10px] text-white/20">{s.message_count} msg{s.message_count !== 1 ? 's' : ''}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Refresh button at bottom */}
        <div className="px-3 py-3 border-t border-white/5 flex-shrink-0">
          <button
            onClick={fetchSessions}
            className="w-full flex items-center justify-center gap-1.5 text-[10px] text-white/20 hover:text-white/40 transition-all py-1"
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
