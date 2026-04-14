import React from 'react';

const PremiumSuccessCard = ({ userData, onContinue }) => {
  const loopedId = userData?.looped_id || userData?.link_code || '—';

  return (
    <div className="bg-white rounded-3xl p-8 shadow-card border border-gray-100 max-w-md mx-auto text-center">

      {/* Success icon */}
      <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold mb-1 text-gold">Payment Successful!</h2>
      <p className="text-gray-500 text-sm mb-8">
        Welcome to LoopedAI Premium, {userData?.full_name?.split(' ')[0] || 'there'}.
      </p>

      {/* LoopedAI ID */}
      <div className="bg-amber-50 border border-gold/20 rounded-2xl p-4 mb-6">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Your LoopedAI ID</p>
        <p className="text-gold font-mono font-bold text-lg">{loopedId}</p>
        <p className="text-gray-400 text-xs mt-1">Use this to link your Telegram account</p>
      </div>

      {/* What's unlocked */}
      <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left space-y-3 border border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Now unlocked</p>

        <div className="flex items-start gap-3">
          <span className="text-gold font-bold mt-0.5">✓</span>
          <div>
            <p className="text-sm text-gray-900 font-medium">Unlimited AI queries</p>
            <p className="text-xs text-gray-400">No daily limits on immigration questions</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-gold font-bold mt-0.5">✓</span>
          <div>
            <p className="text-sm text-gray-900 font-medium">Visa Document Review</p>
            <p className="text-xs text-gray-400">5-agent AI analysis of your documents</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-gold font-bold mt-0.5">✓</span>
          <div>
            <p className="text-sm text-gray-900 font-medium">Telegram Bot</p>
            <p className="text-xs text-gray-400">
              Message @LoopedAIBot and type <span className="font-mono text-gold">/link {loopedId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="text-gold font-bold mt-0.5">✓</span>
          <div>
            <p className="text-sm text-gray-900 font-medium">Priority AI responses</p>
            <p className="text-xs text-gray-400">Faster answers, higher quality</p>
          </div>
        </div>
      </div>

      <button
        onClick={onContinue}
        className="w-full bg-gold hover:bg-gold-muted text-gray-900 font-bold py-4 rounded-xl transition-all shadow-btn"
      >
        Go to Dashboard →
      </button>
    </div>
  );
};

export default PremiumSuccessCard;
