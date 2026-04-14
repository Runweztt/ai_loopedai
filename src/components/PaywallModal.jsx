import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const PaywallModal = ({ promptsUsed, onUpgrade, onDismiss }) => {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget && onDismiss) onDismiss(); }}
    >
      <div className="relative bg-white rounded-3xl p-10 max-w-md w-full mx-4 shadow-2xl border border-black/10 text-center">
        {/* Close button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 text-black/30 hover:text-black/70 transition-all"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        {/* Lock Icon */}
        <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-2">Free Trial Ended</h2>
        <p className="text-black/55 text-sm mb-6">
          You've used all <span className="text-gold font-bold">{promptsUsed}</span> free prompts.
          Upgrade to Premium for unlimited access.
        </p>

        {/* Benefits */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left space-y-3 border border-gray-100">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-400">✓</span>
            <span className="text-black/80">Unlimited immigration queries</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-400">✓</span>
            <span className="text-black/80">Telegram bot integration</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-400">✓</span>
            <span className="text-black/80">Priority AI responses</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-green-400">✓</span>
            <span className="text-black/80">Unique LoopedAI ID for all platforms</span>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onUpgrade}
          className="w-full bg-gold hover:bg-gold-muted text-gray-900 font-bold py-4 rounded-xl transition-all shadow-btn text-lg"
        >
          Upgrade to Premium
        </button>

        <p className="text-black/30 text-xs mt-4">
          Contact us to unlock Premium access
        </p>
      </div>
    </div>,
    document.body
  );
};

export default PaywallModal;
