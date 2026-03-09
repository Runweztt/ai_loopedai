import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-void">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 select-none mb-3">
              <div className="w-6 h-6 bg-gold rounded-sm flex items-center justify-center">
                <span className="font-display font-black text-void text-xs leading-none">L</span>
              </div>
              <span className="font-display font-bold text-base">
                Looped<span className="text-gold">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-dim max-w-[220px] leading-relaxed">
              AI immigration intelligence. Research only — not legal advice.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-6">
            {[
              ['/services', 'Services'],
              ['/guide',    'Guide'],
              ['/about',    'About'],
              ['/chat',     'Chat'],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="text-xs font-body text-slate-dim hover:text-white transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[11px] text-slate-dim">© 2025 LoopedAI. All rights reserved.</p>
          <p className="text-[11px] text-slate-dim">For informational purposes only. Not legal advice.</p>
        </div>
      </div>
    </footer>
  )
}
