import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Profile from './components/Profile';
import Leaderboard from './components/Leaderboard';
import ClashArena from './components/ClashArena';

function NavBar() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const btnClass = (path: string) => `px-6 py-2.5 rounded-full font-bold uppercase tracking-wider transition-all duration-300 ${
    isActive(path) 
      ? 'bg-[#F14A3B] text-white shadow-lg shadow-[#F14A3B]/30 scale-105' 
      : 'bg-white text-stone-700 hover:bg-[#FDEBD0]'
  }`;

  return (
    <nav className="p-6">
      <div className="container flex items-center justify-between mx-auto max-w-6xl">
        <Link to="/arena" className="text-4xl font-black text-[#F14A3B] tracking-tighter uppercase transform scale-y-110">
          TaskClash
        </Link>
        <div className="flex gap-3 text-sm">
          <Link to="/arena" className={btnClass('/arena')}>Arena</Link>
          <Link to="/leaderboard" className={btnClass('/leaderboard')}>Ranks</Link>
          <Link to="/profile" className={btnClass('/profile')}>Profile</Link>
          <Link to="/login" className={btnClass('/login')}>Login</Link>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#FDEBD0] text-stone-800 font-sans overflow-x-hidden selection:bg-[#F14A3B] selection:text-white">
        <NavBar />
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/arena" element={<ClashArena />} />
          <Route path="*" element={<Navigate to="/arena" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;