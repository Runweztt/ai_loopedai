import React from 'react';

/**
 * Wrapper for auth (login/register/success) and chat pages.
 *
 * Previously used absolute-positioned header + footer with a flex-centered
 * main. On mobile this caused the header to overlap the card (absolute header
 * was ~88px; main had only mt-12 = 48px clearance) and the footer appeared
 * anchored to the bottom-left with no centering.
 *
 * Now uses a normal flex-column flow:
 *   header (flex-shrink-0, in flow)
 *   main   (flex-1, scrollable — auth centered with my-auto; chat fills height)
 *   footer (flex-shrink-0, centered)
 */
const Layout = ({ children, isFullWidth }) => {
  return (
    <div className="min-h-screen vibrant-gradient flex flex-col w-full overflow-x-hidden">

      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="w-full flex-shrink-0 px-4 md:px-8 py-4 md:py-5 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-premium-gold rounded-xl flex items-center justify-center shadow-lg shadow-premium-gold/20">
            <span className="text-premium-dark font-bold text-sm leading-none">IA</span>
          </div>
          <h1 className="text-base md:text-xl font-bold tracking-tight">
            Immigration <span className="text-premium-gold">Agent</span>
          </h1>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-white/70">
          <a href="#" className="hover:text-white transition-colors">How it Works</a>
          <a href="#" className="hover:text-white transition-colors">Services</a>
          <a href="#" className="hover:text-white transition-colors">Safety</a>
        </nav>
      </header>

      {/* ── Main content ───────────────────────────────────────── */}
      {isFullWidth ? (
        /*
         * Chat/dashboard: fill remaining height with no extra padding so the
         * chat panel can occupy the full column via its own flex-1.
         */
        <main className="flex-1 flex flex-col min-h-0 w-full max-w-7xl mx-auto px-4 md:px-6">
          {children}
        </main>
      ) : (
        /*
         * Auth cards: allow scrolling so tall cards (RegistrationForm) are
         * reachable on small phones. my-auto on the inner wrapper centers the
         * card when there is spare vertical space, and collapses to top-aligned
         * when the card is taller than the viewport.
         */
        <main className="flex-1 overflow-y-auto flex flex-col items-center px-4 py-6 w-full">
          <div className="w-full max-w-md my-auto">
            {children}
          </div>
        </main>
      )}

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="flex-shrink-0 w-full py-6 text-center text-white/20 text-[10px] tracking-widest uppercase border-t border-white/5">
        &copy; 2026 Immigration AI Systems — Secure &amp; Efficient
      </footer>

    </div>
  );
};

export default Layout;
