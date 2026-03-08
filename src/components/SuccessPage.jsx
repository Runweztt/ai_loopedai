import React, { useState } from 'react';

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME || 'LoopedAIBot';

const SuccessPage = ({ userData, onProceed }) => {
  const [copied, setCopied] = useState(false);

  const linkCode = userData?.link_code || userData?.telegram_link_code || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(`/link ${linkCode}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="glass rounded-3xl p-10 shadow-2xl text-center max-w-lg mx-auto">
      {/* Success icon */}
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-3xl font-bold mb-2">Welcome aboard!</h2>
      <p className="text-white/60 mb-8">
        Account created for{' '}
        <span className="text-white font-medium">{userData?.full_name || userData?.email}</span>
      </p>

      {/* Telegram link section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left">
        <div className="flex items-center gap-2 mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#2AABEE] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.88.03-.24.36-.48.98-.74 3.84-1.67 6.39-2.77 7.66-3.3 3.64-1.5 4.4-1.76 4.9-.16z"/>
          </svg>
          <span className="text-sm font-bold text-white">Connect Telegram (optional)</span>
        </div>

        <p className="text-xs text-white/50 mb-4 leading-relaxed">
          Link your Telegram account to chat with the AI assistant from Telegram.
          Open the bot below and send this command:
        </p>

        {/* Command box with copy button */}
        <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 mb-3">
          <code className="flex-1 text-premium-gold font-mono text-sm select-all">
            /link {linkCode || '...'}
          </code>
          <button
            onClick={handleCopy}
            disabled={!linkCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/60 hover:text-white transition-all flex-shrink-0 disabled:opacity-30"
          >
            {copied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>

        {/* Open bot link */}
        <a
          href={`https://t.me/${BOT_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-[#2AABEE]/10 border border-[#2AABEE]/20 text-[#2AABEE] text-sm font-semibold hover:bg-[#2AABEE]/20 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.88.03-.24.36-.48.98-.74 3.84-1.67 6.39-2.77 7.66-3.3 3.64-1.5 4.4-1.76 4.9-.16z"/>
          </svg>
          Open @{BOT_USERNAME} on Telegram
        </a>
      </div>

      <button
        onClick={onProceed}
        className="mt-8 w-full bg-premium-gold hover:bg-yellow-500 text-premium-dark font-bold py-3 rounded-xl transition-all text-sm"
      >
        Go to Dashboard &rarr;
      </button>
    </div>
  );
};

export default SuccessPage;
