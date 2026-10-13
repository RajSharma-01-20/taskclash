import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_BASE } from '../apiConfig';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  score: number;
}

function getRankInfo(score: number) {
  if (score >= 1000) return { rank: 'Diamond', color: 'text-cyan-300', bg: 'bg-cyan-500/10 border-cyan-500/40', icon: '💎' };
  if (score >= 500) return { rank: 'Gold', color: 'text-amber-300', bg: 'bg-amber-500/10 border-amber-500/40', icon: '🥇' };
  if (score >= 200) return { rank: 'Silver', color: 'text-slate-300', bg: 'bg-slate-500/10 border-slate-500/40', icon: '🥈' };
  if (score >= 50) return { rank: 'Bronze', color: 'text-amber-600', bg: 'bg-amber-700/10 border-amber-700/40', icon: '🥉' };
  return { rank: 'Rookie', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30', icon: '🔰' };
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/users/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          setUser(await res.json());
        } else {
          localStorage.removeItem('token');
          navigate('/login');
        }
      } catch {
        setError('Failed to load profile. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-500/20 border-t-rose-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 font-bold uppercase tracking-wider text-sm">Loading Gladiator Profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6">
        <div className="max-w-md text-center p-8 bg-slate-900/90 border border-rose-500/30 rounded-3xl">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-white mb-2">Connection Error</h2>
          <p className="text-rose-400 font-bold text-sm mb-6">{error}</p>
          <Link
            to="/login"
            className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const rankInfo = getRankInfo(user.score);
  const nextRankScore = user.score >= 1000 ? 1000 : user.score >= 500 ? 1000 : user.score >= 200 ? 500 : user.score >= 50 ? 200 : 50;
  const progressPct = Math.min(100, Math.round((user.score / nextRankScore) * 100));
  const avatar = user.username.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-start px-6 py-14 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-rose-600/6 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-xl relative z-10 space-y-6">
        {/* Hero Identity Card */}
        <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Decorative bg */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-3xl font-black text-white shadow-xl shadow-rose-500/30 border-2 border-rose-400/30">
                {avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-sm">
                {rankInfo.icon}
              </div>
            </div>

            {/* Identity Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-black font-display uppercase tracking-tight text-white mb-1">
                {user.username}
              </h1>
              <p className="text-slate-400 text-sm font-medium mb-3">
                {user.email}
              </p>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-black uppercase tracking-widest ${rankInfo.bg} ${rankInfo.color}`}>
                {rankInfo.icon} {rankInfo.rank} Gladiator
              </span>
            </div>
          </div>
        </div>

        {/* Stats Panel */}
        <div className="grid grid-cols-2 gap-4">
          {/* Arena Score */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Arena Score
            </span>
            <div className="text-4xl font-black font-display text-rose-400">
              {user.score.toLocaleString()}
            </div>
            <span className="text-xs text-slate-500 font-bold">Total PTS Earned</span>
          </div>

          {/* Rank Tier */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Current Tier
            </span>
            <div className={`text-3xl font-black font-display ${rankInfo.color}`}>
              {rankInfo.rank}
            </div>
            <span className="text-xs text-slate-500 font-bold">Gladiator Rank</span>
          </div>
        </div>

        {/* Rank Progress Bar */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {rankInfo.rank === 'Diamond' ? 'MAX RANK — Hall of Legends' : `Progress to Next Rank`}
            </span>
            <span className="text-xs font-black text-white">
              {user.score} / {nextRankScore} PTS
            </span>
          </div>

          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-amber-500 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          {rankInfo.rank !== 'Diamond' && (
            <p className="text-xs text-slate-500 mt-2">
              {nextRankScore - user.score} more PTS needed to reach next tier
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/arena"
            className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20 hover:scale-[1.02] transition-all"
          >
            <span>⚔️</span>
            <span>Deploy New Duel</span>
          </Link>

          <Link
            to="/leaderboard"
            className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm uppercase tracking-wider text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:text-white transition-all"
          >
            <span>🏆</span>
            <span>View Global Ranks</span>
          </Link>
        </div>

        {/* Logout */}
        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full py-3.5 rounded-2xl font-bold text-sm uppercase tracking-wider text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/40 transition-all"
          >
            Exit Arena Session
          </button>
        </div>
      </div>
    </div>
  );
}
