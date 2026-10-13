import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../apiConfig';

interface Player {
  id: number;
  username: string;
  score: number;
}

function getRankBadge(index: number, score: number) {
  if (index === 0) return { icon: '👑', bg: 'bg-amber-400/20 border-amber-400/50', text: 'text-amber-300', label: '#1 CHAMPION' };
  if (index === 1) return { icon: '🥈', bg: 'bg-slate-400/20 border-slate-400/50', text: 'text-slate-300', label: '#2 RUNNER-UP' };
  if (index === 2) return { icon: '🥉', bg: 'bg-amber-700/20 border-amber-700/50', text: 'text-amber-600', label: '#3 CONTENDER' };
  if (score >= 500) return { icon: '💎', bg: 'bg-cyan-500/10 border-cyan-500/30', text: 'text-cyan-400', label: `#${index + 1}` };
  return { icon: '⚔️', bg: 'bg-slate-800 border-slate-700', text: 'text-slate-400', label: `#${index + 1}` };
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/leaderboard/`);
        const data = await res.json();

        if (res.ok && Array.isArray(data)) {
          setLeaderboard(data);
        } else {
          setLeaderboard([]);
          setError(data.detail || 'Could not load arena rankings.');
        }
      } catch {
        setLeaderboard([]);
        setError('Connection failed. Arena servers may be initializing (free tier cold start).');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-[calc(100vh-80px)] px-6 py-12 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-amber-500/6 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-3xl mx-auto relative z-10 space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
            🏆 Global Rankings
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black font-display tracking-tight uppercase text-white">
            Arena <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400">Leaderboard</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            The top gladiators ranked by total arena PTS. Complete duels and select winners to climb the ranks.
          </p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold text-sm text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Loading spinner */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-wider text-sm">Loading arena rankings...</p>
          </div>
        ) : leaderboard.length === 0 && !error ? (
          <div className="py-16 text-center bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-4">
            <div className="text-5xl">🏟️</div>
            <h3 className="text-xl font-bold font-display uppercase text-white">No Combatants Yet</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              The arena is empty! Be the first gladiator to complete a duel and stake your claim at #1.
            </p>
            <Link
              to="/arena"
              className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500"
            >
              ⚔️ Enter The Arena
            </Link>
          </div>
        ) : (
          <>
            {/* Top 3 Podium (Only if we have players) */}
            {topThree.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 2nd Place (left) */}
                {topThree[1] ? (
                  <div className="sm:mt-6 order-2 sm:order-1">
                    <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-5 text-center hover:border-slate-500 transition-all">
                      <div className="w-14 h-14 rounded-xl bg-slate-700/60 border border-slate-600 flex items-center justify-center text-xl font-black text-slate-300 mx-auto mb-3 shadow-md">
                        {topThree[1].username.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-2xl block mb-1">🥈</span>
                      <h3 className="font-bold text-white text-sm truncate">{topThree[1].username}</h3>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mt-1">
                        {topThree[1].score.toLocaleString()} PTS
                      </span>
                    </div>
                  </div>
                ) : <div className="order-2 sm:order-1" />}

                {/* 1st Place (center, elevated) */}
                <div className="order-1 sm:order-2">
                  <div className="bg-gradient-to-b from-amber-950/50 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-6 text-center shadow-2xl shadow-amber-500/10 relative">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-amber-500 text-[10px] font-black uppercase tracking-widest text-black">
                      CHAMPION
                    </div>
                    <div className="w-18 h-18 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 border-2 border-amber-400/60 flex items-center justify-center text-2xl font-black text-white mx-auto mb-3 shadow-xl w-16 h-16">
                      {topThree[0].username.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-3xl block mb-1">👑</span>
                    <h3 className="font-bold text-white font-display uppercase truncate">{topThree[0].username}</h3>
                    <span className="text-sm font-black text-amber-400 uppercase tracking-wider block mt-1">
                      {topThree[0].score.toLocaleString()} PTS
                    </span>
                  </div>
                </div>

                {/* 3rd Place (right) */}
                {topThree[2] ? (
                  <div className="sm:mt-6 order-3">
                    <div className="bg-slate-900/80 border border-slate-700/60 rounded-2xl p-5 text-center hover:border-slate-500 transition-all">
                      <div className="w-14 h-14 rounded-xl bg-amber-900/30 border border-amber-800/40 flex items-center justify-center text-xl font-black text-amber-700 mx-auto mb-3 shadow-md">
                        {topThree[2].username.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-2xl block mb-1">🥉</span>
                      <h3 className="font-bold text-white text-sm truncate">{topThree[2].username}</h3>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-wider block mt-1">
                        {topThree[2].score.toLocaleString()} PTS
                      </span>
                    </div>
                  </div>
                ) : <div className="order-3" />}
              </div>
            )}

            {/* Rest of the rankings (4th onward) */}
            {rest.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 pb-2 border-b border-slate-800">
                  Full Gladiator Rankings
                </h3>

                <ul className="space-y-2">
                  {leaderboard.map((player, index) => {
                    const badge = getRankBadge(index, player.score);
                    return (
                      <li
                        key={player.id}
                        className={`flex items-center justify-between px-5 py-4 rounded-2xl border transition-all hover:-translate-y-0.5 ${badge.bg}`}
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank Badge */}
                          <div className={`w-10 h-10 flex items-center justify-center font-black text-sm rounded-xl ${badge.bg} ${badge.text} border flex-shrink-0`}>
                            {index < 3 ? badge.icon : index + 1}
                          </div>

                          {/* Avatar & Name */}
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${
                              index === 0 ? 'bg-amber-500/20 text-amber-400' :
                              index === 1 ? 'bg-slate-500/30 text-slate-300' :
                              index === 2 ? 'bg-amber-700/20 text-amber-700' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {player.username.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <span className={`font-bold text-sm ${index < 3 ? 'text-white' : 'text-slate-200'}`}>
                                {player.username}
                              </span>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                                {badge.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right">
                          <span className={`font-black text-base ${index < 3 ? badge.text : 'text-slate-300'}`}>
                            {player.score.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            PTS
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* CTA to compete */}
            <div className="text-center pt-4">
              <Link
                to="/arena"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20 hover:scale-105 transition-all"
              >
                ⚔️ Challenge Gladiators & Climb The Ranks
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
