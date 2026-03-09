import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-void">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-8 md:gap-12 text-center md:text-left">

          {/* Brand */}
          <div className="flex flex-col items-center md:items-start">
            <Link to="/" className="flex items-center gap-2 select-none mb-3">
              <div className="w-7 h-7 bg-gold rounded-sm flex items-center justify-center">
                <span className="font-display font-black text-void text-xs leading-none">L</span>
              </div>
              <span className="font-display font-bold text-lg">
                Looped<span className="text-gold">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-dim max-w-[280px] md:max-w-[220px] leading-relaxed">
              AI immigration intelligence. Research purposes only — not legal advice.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-8">
            {[
              ['/services', 'Services'],
              ['/guide',    'Guide'],
              ['/about',    'About'],
              ['/chat',     'Chat'],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="text-xs font-body font-medium text-slate-dim hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 md:mt-10 pt-6 md:pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-[11px] text-slate-dim font-medium">© 2026 LoopedAI. All rights reserved.</p>
          <p className="text-[11px] text-slate-dim/60">For informational purposes only. Not legal advice.</p>
        </div>
      </div>
    </footer>
  )
}
