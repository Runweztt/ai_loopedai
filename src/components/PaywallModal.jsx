import React from 'react';

const PaywallModal = ({ promptsUsed, onUpgrade }) => {
  return (
    /* FIX: Non-dismissible paywall modal — no close button, no backdrop click dismiss */
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }}>
      <div className="glass rounded-3xl p-10 max-w-md w-full mx-4 shadow-2xl border border-white/10 text-center">
        {/* Lock Icon */}
        <div className="w-20 h-20 bg-premium-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-premium-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-2">Free Trial Ended</h2>
        <p className="text-white/50 text-sm mb-6">
          You've used all <span className="text-premium-gold font-bold">{promptsUsed}</span> free prompts.
          Upgrade to Premium for unlimited access.
        </p>

        {/* Benefits */}
        <div className="bg-white/5 rounded-2xl p-5 mb-8 text-left space-y-3 border border-white/5">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-400">✓</span>
            <span className="text-white/80">Unlimited immigration queries</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-400">✓</span>
            <span className="text-white/80">Telegram bot integration</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-400">✓</span>
            <span className="text-white/80">Priority AI responses</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-400">✓</span>
            <span className="text-white/80">Unique LoopedAI ID for all platforms</span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onUpgrade}
          className="w-full bg-premium-gold hover:bg-yellow-500 text-premium-dark font-bold py-4 rounded-xl transition-all shadow-lg shadow-premium-gold/30 text-lg"
        >
          Upgrade to Premium
        </button>

        <p className="text-white/20 text-xs mt-4">
          Secure payment • Instant access • Cancel anytime
        </p>
      </div>
    </div>
  );
};

export default PaywallModal;
