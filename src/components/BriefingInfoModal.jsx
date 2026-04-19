import React from 'react';

const COMMANDS = [
  { cmd: '/briefing_setup', desc: 'Set destination, industry & visa intent' },
  { cmd: '/briefing_status', desc: 'Check your current briefing preferences' },
  { cmd: '/briefing_now', desc: 'Receive an intelligence brief right now' },
  { cmd: '/briefing_on', desc: 'Re-enable automatic briefings' },
  { cmd: '/briefing_off', desc: 'Pause automatic briefings' },
  { cmd: '/briefing_update', desc: 'Update your destination or industry' },
];

const BriefingInfoModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-gold/30 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Daily Intelligence Briefing</h2>
              <p className="text-[11px] text-gray-500">Delivered via Telegram every 2 days</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            LoopedAI sends you a personalised intelligence brief covering current news, immigration laws,
            job market conditions, and industry trends for your destination country — automatically,
            every 2 days via your linked Telegram account.
          </p>

          {/* Setup CTA */}
          <div className="bg-amber-50 border border-gold/20 rounded-xl px-4 py-3">
            <p className="text-[11px] font-semibold text-gold uppercase tracking-wide mb-1">Get started</p>
            <p className="text-xs text-gray-700">
              Open your linked Telegram bot and send the command below to configure your briefing:
            </p>
            <div className="mt-2 bg-white border border-gray-200 rounded-lg px-3 py-2 font-mono text-sm text-gray-900 select-all">
              /briefing_setup
            </div>
          </div>

          {/* Commands */}
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">All commands</p>
            <div className="space-y-1.5">
              {COMMANDS.map(({ cmd, desc }) => (
                <div key={cmd} className="flex items-start gap-3">
                  <span className="font-mono text-[11px] text-gold bg-amber-50 border border-gold/20 rounded px-1.5 py-0.5 flex-shrink-0 mt-0.5">
                    {cmd}
                  </span>
                  <span className="text-xs text-gray-600">{desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <p className="text-[10px] text-gray-400 text-center">
            Telegram must be linked to your account · Link via the bot using /link
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5">
          <button
            onClick={onClose}
            className="w-full bg-gold hover:bg-gold-muted text-gray-900 font-bold py-2.5 rounded-xl text-sm transition-all shadow-btn"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default BriefingInfoModal;
