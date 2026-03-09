import React from 'react';

const SuccessPage = ({ userData, onProceed }) => {
  const showTelegram = userData?.link_telegram;

  return (
    <div className="glass rounded-3xl p-6 md:p-10 shadow-2xl text-center">
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h2 className="text-3xl font-bold mb-4">Welcome aboard!</h2>
      <p className="text-white/60 mb-8">
        Your account for <span className="text-white font-medium">{userData?.full_name}</span> has been created successfully.
      </p>

      {showTelegram && (
        <div className="bg-premium-blue/20 border border-premium-blue/30 rounded-2xl p-6 mt-8">
          <div className="flex items-center justify-center gap-2 mb-4 text-premium-gold">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.45-.42-1.39-.88.03-.24.36-.48.98-.74 3.84-1.67 6.39-2.77 7.66-3.3 3.64-1.5 4.4-1.76 4.9-.16z"/>
            </svg>
            <span className="font-bold uppercase tracking-widest text-sm">Telegram Link Required</span>
          </div>
          
          <p className="text-sm text-white/70 mb-4">Open our Telegram bot and send the following command:</p>
          
          <div className="bg-black/40 rounded-lg p-4 font-mono text-xl text-premium-gold border border-white/5 select-all">
            /link {userData?.link_code}
          </div>
          
          <div className="mt-6 flex justify-center">
            <a 
              href="https://t.me/your_bot_name" 
              target="_blank" 
              className="text-premium-gold font-bold flex items-center gap-2 hover:underline"
            >
              Open Telegram Bot
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      )}

      <div className="mt-12">
        <button onClick={onProceed} className="text-white/40 hover:text-white transition-all text-sm font-medium">
          Proceed to Dashboard &rarr;
        </button>
      </div>
    </div>
  );
};

export default SuccessPage;
