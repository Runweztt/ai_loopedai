import React, { useState, useRef, useEffect, useCallback } from 'react';
import PaywallModal from './PaywallModal';
import ReviewDocumentsButton from './ReviewDocumentsButton';
import DocumentReviewModal from './DocumentReviewModal';
import ReviewReportCard from './ReviewReportCard';
import ChatSidebar from './ChatSidebar';

const FREE_PROMPT_LIMIT = 4;
const PROMPT_COUNT_KEY = 'immigration_ai_prompt_count';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const WELCOME_MSG = (name) => ({
  role: 'assistant',
  text: `Hello ${name || 'there'}! I'm your Immigration AI Assistant. Ask me anything about visas, permits, immigration policies, or relocation processes. How can I help you today?`,
});

const generateSessionId = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

const Dashboard = ({ userData, onLogout, onUpgrade }) => {
  const [messages, setMessages] = useState([WELCOME_MSG(userData?.full_name)]);
  const [sessionId, setSessionId] = useState(() => generateSessionId());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Freemium prompt counter — tracked in localStorage
  const isPremium = userData?.is_premium === true;
  const getPromptCount = () => parseInt(localStorage.getItem(PROMPT_COUNT_KEY) || '0', 10);
  const [promptCount, setPromptCount] = useState(getPromptCount());
  const [showPaywall, setShowPaywall] = useState(!isPremium && getPromptCount() >= FREE_PROMPT_LIMIT);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewChatContext, setReviewChatContext] = useState({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ── Session handlers ────────────────────────────────────────────────

  const handleNewChat = useCallback(() => {
    setSessionId(generateSessionId());
    setMessages([WELCOME_MSG(userData?.full_name)]);
    setInput('');
    inputRef.current?.focus();
  }, [userData?.full_name]);

  const handleSelectSession = useCallback(async (sid) => {
    if (sid === sessionId) return;
    setLoadingSession(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/chats/${sid}`, {
        headers: { Authorization: `Bearer ${userData?.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const loaded = data.messages.map((m) => ({ role: m.role, text: m.text }));
        setMessages([WELCOME_MSG(userData?.full_name), ...loaded]);
        setSessionId(sid);
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch {
      // keep current chat on error
    } finally {
      setLoadingSession(false);
    }
  }, [sessionId, userData]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    // FIX: Block chat if free prompt limit is reached (non-premium users)
    if (!isPremium && promptCount >= FREE_PROMPT_LIMIT) {
      setShowPaywall(true);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // FIX: Check token exists before making API call — redirect to login if missing
      const token = userData?.access_token;
      if (!token) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: '⚠️ Session expired. Please sign in again.',
          },
        ]);
        setLoading(false);
        onLogout();
        return;
      }

      const res = await fetch(`${API_BASE}/api/v1/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // FIX: attached Bearer token
        },
        body: JSON.stringify({
          text: userMessage,
          session_id: sessionId,
          chat_history: messages.slice(-10).map((m) => ({ role: m.role, text: m.text || '' })),
        }),
      });

      // FIX: Handle 401 specifically — clear session and redirect to login
      if (res.status === 401) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: '⚠️ Session expired or invalid. Please sign in again.',
          },
        ]);
        setLoading(false);
        onLogout();
        return;
      }

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: data.response },
        ]);

        // FIX: Increment and persist prompt count for freemium tracking
        if (!isPremium) {
          const newCount = promptCount + 1;
          localStorage.setItem(PROMPT_COUNT_KEY, String(newCount));
          setPromptCount(newCount);
          if (newCount >= FREE_PROMPT_LIMIT) {
            setShowPaywall(true);
          }
        }
      } else {
        const err = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `⚠️ ${err.detail || 'Something went wrong. Please try again.'}`,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: '⚠️ Could not connect to the server. Please check the backend is running.',
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleOpenReview = () => {
    // Extract context from current chat messages to pre-fill the modal
    const allText = messages.map((m) => m.text || '').join(' ').toLowerCase();
    const context = {};
    if (allText.includes('canada')) context.country = 'Canada';
    else if (allText.includes('uk') || allText.includes('united kingdom')) context.country = 'UK';
    else if (allText.includes('usa') || allText.includes('united states')) context.country = 'USA';
    else if (allText.includes('australia')) context.country = 'Australia';
    if (allText.includes('study permit') || allText.includes('student visa') || allText.includes('f-1')) context.visa_type = 'Study Permit';
    else if (allText.includes('work permit') || allText.includes('work visa') || allText.includes('h-1b')) context.visa_type = 'Work Permit';
    else if (allText.includes('visitor') || allText.includes('tourist')) context.visa_type = 'Visitor Visa';
    setReviewChatContext(context);
    setShowReviewModal(true);
  };

  const handleReportReady = (report, country, visaType) => {
    setShowReviewModal(false);
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: `Here is your visa document review for **${visaType}** — ${country}:`,
        reviewReport: report,
        reviewCountry: country,
        reviewVisaType: visaType,
      },
    ]);
    setTimeout(() => scrollToBottom(), 100);
  };

  return (
    <>
    {/* Freemium paywall — non-dismissible */}
    {showPaywall && <PaywallModal promptsUsed={promptCount} onUpgrade={onUpgrade} />}

    {/* Chat history sidebar */}
    <ChatSidebar
      userData={userData}
      activeSessionId={sessionId}
      onSelectSession={handleSelectSession}
      onNewChat={handleNewChat}
      isOpen={sidebarOpen}
      onToggle={() => setSidebarOpen((o) => !o)}
    />

    {/* Visa review modal — triggered by user click only */}
    {showReviewModal && (
      <DocumentReviewModal
        onClose={() => setShowReviewModal(false)}
        onReportReady={handleReportReady}
        chatContext={reviewChatContext}
        userData={userData}
      />
    )}
    <div
      className="w-full max-w-3xl flex flex-col transition-all duration-300"
      style={{
        height: 'calc(100vh - 160px)',
        marginLeft: sidebarOpen ? '272px' : 'auto',
        marginRight: 'auto',
      }}
    >
      {/* Header */}
      <div className="glass rounded-t-3xl p-5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold">Immigration Assistant</h2>
            <p className="text-white/40 text-xs mt-0.5">
              AI-powered guidance • {userData?.country || 'Global'}
              {!isPremium && (
                <span className="ml-2 text-premium-gold">
                  {Math.max(0, FREE_PROMPT_LIMIT - promptCount)}/{FREE_PROMPT_LIMIT} free prompts left
                </span>
              )}
              {isPremium && (
                <span className="ml-2 text-green-400">Premium ✓</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-white/50">Online</span>
            <button
              onClick={onLogout}
              className="text-xs text-white/30 hover:text-white/70 transition-all ml-2 border border-white/10 rounded-lg px-3 py-1"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto glass border-x border-white/5 p-5 space-y-4 scrollbar-thin relative">
        {loadingSession && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 rounded-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-premium-gold/40 border-t-premium-gold rounded-full animate-spin" />
              <span className="text-xs text-white/50">Loading conversation...</span>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-premium-gold text-premium-dark font-medium rounded-br-md'
                  : 'bg-white/5 text-white/90 border border-white/5 rounded-bl-md'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 bg-premium-gold/20 rounded-md flex items-center justify-center">
                    <span className="text-premium-gold text-[10px] font-bold">IA</span>
                  </div>
                  <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">
                    AI Assistant
                  </span>
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.reviewReport && (
                <ReviewReportCard
                  report={msg.reviewReport}
                  country={msg.reviewCountry}
                  visaType={msg.reviewVisaType}
                />
              )}
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
                <span className="text-[10px] text-white/30 uppercase tracking-widest font-semibold">
                  AI Assistant
                </span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="glass rounded-b-3xl border-t border-white/5 p-4">
        <div className="flex gap-2 mb-3">
          <ReviewDocumentsButton onClick={handleOpenReview} disabled={loading} />
        </div>
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about visas, permits, immigration policies..."
            disabled={loading}
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-premium-gold/50 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-premium-gold hover:bg-yellow-500 text-premium-dark font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-premium-gold/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-[10px] text-white/20 mt-2 text-center">
          Powered by LoopedAI • Responses are AI-generated and may not constitute legal advice
        </p>
      </form>
    </div>
    </>
  );
};

export default Dashboard;
