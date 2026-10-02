import { useState, useEffect } from 'react';

interface Player {
  id: number;
  username: string;
  score: number;
}

export default function Leaderboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:8000/api/leaderboard/')
      .then(res => res.json())
      .then(data => setPlayers(data))
      .catch(() => setError('Failed to load leaderboard'));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <h1 className="text-[5rem] md:text-[8rem] font-black text-[#F14A3B] tracking-tighter uppercase leading-none transform scale-y-110 mb-10 text-center">
        RANKS
      </h1>

      <div className="max-w-xl w-xl w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border-4 border-transparent">
        {error && <div className="p-4 mb-4 text-red-600 bg-red-100 rounded-2xl text-center font-bold">{error}</div>}

        {players.length === 0 ? (
          <p className="text-center text-stone-400 font-bold py-8">No players ranked yet.</p>
        ) : (
          <ul className="space-y-4">
            {players.map((player, index) => (
              <li key={player.id} className="flex items-center justify-between p-4 bg-[#FDEBD0]/30 rounded-2xl border-2 border-[#FDEBD0]">
                <div className="flex items-center space-x-4">
                  <span className={`w-12 h-12 flex items-center justify-center font-black rounded-2xl text-lg ${
                    index === 0 ? 'bg-yellow-400 text-white shadow-md' :
                    index === 1 ? 'bg-stone-300 text-stone-700' :
                    index === 2 ? 'bg-amber-600 text-white' : 'bg-white text-stone-400'
                  }`}>
                    #{index + 1}
                  </span>
                  <span className="font-black text-stone-800 text-lg">{player.username}</span>
                </div>
                <span className="font-black text-[#F14A3B] text-xl">{player.score} PTS</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}