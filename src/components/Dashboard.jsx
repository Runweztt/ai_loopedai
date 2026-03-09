import React, { useState, useRef, useEffect, useCallback } from 'react';
import PaywallModal from './PaywallModal';
import ChatSidebar from './ChatSidebar';
import { API_BASE } from '../constants';

const FREE_PROMPT_LIMIT = 4;
const PROMPT_COUNT_KEY = 'immigration_ai_prompt_count';
const SESSION_KEY = 'loopedai_current_session';

const makeWelcome = (name) => ({
  role: 'assistant',
  text: `Hello ${name || 'there'}! I'm your Immigration AI Assistant. Ask me anything about visas, permits, immigration policies, or relocation processes. How can I help you today?`,
});

const Dashboard = ({ userData, onLogout, onUpgrade }) => {
  const isDesktop = () => window.innerWidth >= 768;

  // Track if session was restored from storage (vs newly generated)
  const [sessionId, setSessionId] = useState(() => localStorage.getItem(SESSION_KEY) || null);
  const [messages, setMessages] = useState([makeWelcome(userData?.full_name)]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(isDesktop);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isPremium = userData?.is_premium === true;
  const [promptCount, setPromptCount] = useState(() => parseInt(localStorage.getItem(PROMPT_COUNT_KEY) || '0', 10));
  const [showPaywall, setShowPaywall] = useState(!isPremium && parseInt(localStorage.getItem(PROMPT_COUNT_KEY) || '0', 10) >= FREE_PROMPT_LIMIT);

  // Persist sessionId whenever it changes
  useEffect(() => {
    if (sessionId) localStorage.setItem(SESSION_KEY, sessionId);
  }, [sessionId]);

  // Load existing session messages on mount (only if session was already saved)
  useEffect(() => {
    const token = userData?.access_token;
    const saved = localStorage.getItem(SESSION_KEY);
    if (!token || !saved) return; // New user or no session — skip fetch
    setLoadingSession(true);
    fetch(`${API_BASE}/api/v1/chats/${saved}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.messages?.length) {
          setMessages([makeWelcome(userData?.full_name), ...data.messages]);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSession(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectSession = useCallback(async (sid) => {
    const token = userData?.access_token;
    if (!token) return;
    setLoadingSession(true);
    setSessionId(sid); // useEffect will persist to localStorage
    try {
      const res = await fetch(`${API_BASE}/api/v1/chats/${sid}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages([makeWelcome(userData?.full_name), ...(data.messages || [])]);
      }
    } catch { /* keep current messages */ }
    finally { setLoadingSession(false); }
  }, [userData]);

  const handleNewChat = useCallback(() => {
    const newId = crypto.randomUUID();
    setSessionId(newId); // useEffect will persist
    setMessages([makeWelcome(userData?.full_name)]);
    if (!isDesktop()) setSidebarOpen(false);
  }, [userData]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    if (!isPremium && promptCount >= FREE_PROMPT_LIMIT) { setShowPaywall(true); return; }

    const token = userData?.access_token;
    if (!token) { onLogout(); return; }

    // Ensure we have a session ID
    const currentSession = sessionId || (() => {
      const id = crypto.randomUUID();
      setSessionId(id);
      return id;
    })();

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          text: userMessage,
          session_id: currentSession,
          chat_history: newMessages.slice(-20).map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      if (res.status === 401) { onLogout(); return; }

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [...prev, { role: 'assistant', text: data.response }]);
        if (!isPremium) {
          const newCount = promptCount + 1;
          localStorage.setItem(PROMPT_COUNT_KEY, String(newCount));
          setPromptCount(newCount);
          if (newCount >= FREE_PROMPT_LIMIT) setShowPaywall(true);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setMessages((prev) => [...prev, { role: 'assistant', text: `⚠️ ${err.detail || 'Something went wrong.'}` }]);
      }
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: '⚠️ Something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <>
      {showPaywall && <PaywallModal promptsUsed={promptCount} onUpgrade={onUpgrade} />}

      <ChatSidebar
        userData={userData}
        activeSessionId={sessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((o) => !o)}
      />

      {/* Main chat panel — shifts right on desktop when sidebar open, overlaid on mobile */}
      <div
        className={`flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : ''}`}
        style={{ height: 'calc(100svh - 128px)', minHeight: 'calc(100vh - 160px)' }}
      >
        {/* Header */}
        <div className="glass rounded-t-3xl px-4 py-3 md:p-5 border-b border-white/5">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h2 className="text-base md:text-lg font-bold truncate">Immigration Assistant</h2>
              <p className="text-white/40 text-xs mt-0.5 truncate">
                {userData?.country || 'Global'}
                {!isPremium && (
                  <span className="ml-2 text-premium-gold">
                    {Math.max(0, FREE_PROMPT_LIMIT - promptCount)}/{FREE_PROMPT_LIMIT} left
                  </span>
                )}
                {isPremium && <span className="ml-2 text-green-400">Premium ✓</span>}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {loadingSession && (
                <div className="w-3 h-3 border border-premium-gold/40 border-t-premium-gold rounded-full animate-spin" />
              )}
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse hidden sm:block" />
              {userData?.is_admin && (
                <a
                  href="/admin"
                  className="text-xs text-premium-gold border border-premium-gold/30 rounded-lg px-2 py-1 hover:bg-premium-gold/10 transition-all"
                >
                  Admin
                </a>
              )}
              <button
                onClick={onLogout}
                className="text-xs text-white/30 hover:text-white/70 transition-all border border-white/10 rounded-lg px-2 md:px-3 py-1"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto glass border-x border-white/5 p-4 md:p-5 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-3 md:px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-premium-gold text-premium-dark font-medium rounded-br-md'
                    : 'bg-white/5 text-white/90 border border-white/5 rounded-bl-md'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 bg-premium-gold/20 rounded-md flex items-center justify-center flex-shrink-0">
                      <span className="text-premium-gold text-[10px] font-bold">IA</span>
                    </div>
                    <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">AI Assistant</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/5 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-premium-gold/20 rounded-md flex items-center justify-center">
                    <span className="text-premium-gold text-[10px] font-bold">IA</span>
                  </div>
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">AI Assistant</span>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="glass rounded-b-3xl border-t border-white/5 p-3 md:p-4">
          <div className="flex gap-2 md:gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about visas, permits, immigration..."
              disabled={loading}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 md:px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-premium-gold/50 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-premium-gold hover:bg-yellow-500 text-premium-dark font-bold px-4 md:px-6 py-3 rounded-xl transition-all shadow-lg shadow-premium-gold/20 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <p className="text-[10px] text-white/20 mt-2 text-center hidden sm:block">
            Powered by LoopedAI · AI-generated responses may not constitute legal advice
          </p>
        </form>
      </div>
    </>
  );
};

export default Dashboard;
