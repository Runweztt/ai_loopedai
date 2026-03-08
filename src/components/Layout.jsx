import React from 'react';

const Layout = ({ children, isFullWidth }) => {
  return (
    <div className="min-h-screen vibrant-gradient flex flex-col items-center justify-center p-4">
      <header className="absolute top-0 w-full p-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-premium-gold rounded-xl flex items-center justify-center shadow-lg shadow-premium-gold/20">
            <span className="text-premium-dark font-bold text-xl">IA</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Immigration <span className="text-premium-gold">Agent</span></h1>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-white/70">
          <a href="#" className="hover:text-white transition-colors">How it Works</a>
          <a href="#" className="hover:text-white transition-colors">Services</a>
          <a href="#" className="hover:text-white transition-colors">Safety</a>
        </nav>
      </header>
      
      <main className={`w-full mt-12 ${isFullWidth ? 'max-w-4xl' : 'max-w-lg'}`}>
        {children}
      </main>
      
      <footer className="absolute bottom-8 text-white/30 text-xs tracking-widest uppercase">
        &copy; 2026 Immigration AI Systems — Secure & Efficient
      </footer>
    </div>
  );
};

export default Layout;
