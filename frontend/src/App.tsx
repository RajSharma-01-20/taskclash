import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import HomePage from './components/HomePage';
import ClashArena from './components/ClashArena';
import Leaderboard from './components/Leaderboard';
import Profile from './components/Profile';
import Login from './components/Login';
import Register from './components/Register';

function NavBar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const token = localStorage.getItem('token');
  const isActive = (path: string) => location.pathname === path;

  const navLinkClass = (path: string) => `px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
    isActive(path)
      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
  }`;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-rose-500/20 group-hover:scale-105 transition-transform">
            ⚡
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-2xl tracking-tighter uppercase text-white group-hover:text-rose-400 transition-colors">
              TASK<span className="text-rose-500">CLASH</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400 -mt-1">
              Arena v2.0
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          <Link to="/" className={navLinkClass('/')}>
            Home
          </Link>
          <Link to="/arena" className={navLinkClass('/arena')}>
            ⚔️ Arena
          </Link>
          <Link to="/leaderboard" className={navLinkClass('/leaderboard')}>
            🏆 Ranks
          </Link>
          <Link to="/profile" className={navLinkClass('/profile')}>
            👤 Profile
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-3">
          {token ? (
            <Link
              to="/profile"
              className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
              <span>Gladiator Portal</span>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 shadow-md shadow-rose-600/30 hover:scale-105 transition-all border border-rose-400/30"
              >
                Enlist Now
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden px-6 pt-3 pb-6 bg-slate-950/95 border-b border-slate-800 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-sm font-bold text-slate-300 hover:bg-slate-800"
          >
            Home
          </Link>
          <Link
            to="/arena"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-sm font-bold text-slate-300 hover:bg-slate-800"
          >
            ⚔️ Arena
          </Link>
          <Link
            to="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-sm font-bold text-slate-300 hover:bg-slate-800"
          >
            🏆 Leaderboard
          </Link>
          <Link
            to="/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-lg text-sm font-bold text-slate-300 hover:bg-slate-800"
          >
            👤 Profile
          </Link>
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {token ? (
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center py-3 rounded-lg text-xs font-black uppercase tracking-wider bg-rose-600 text-white"
              >
                My Profile
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-rose-600 text-white"
                >
                  Create Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 py-10 px-6 text-slate-400 text-xs">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-lg text-white">⚡ TASKCLASH</span>
          <span className="text-slate-600">|</span>
          <span>1v1 Competitive Productivity Arena</span>
        </div>
        <div className="flex items-center gap-6 text-slate-400">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/arena" className="hover:text-white transition-colors">Arena</Link>
          <Link to="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
          <Link to="/profile" className="hover:text-white transition-colors">Profile</Link>
        </div>
        <div className="text-slate-400 text-right">
          <span>Winner Takes 100% • Ties Split 50/50</span>
        </div>
      </div>
    </footer>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans flex flex-col selection:bg-rose-500 selection:text-white">
        <NavBar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/arena" element={<ClashArena />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
