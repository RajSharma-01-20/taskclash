import { useState, useEffect } from 'react';

// Define the shape of your player data
interface Player {
    id: number;
    username: string;
}

export default function Leaderboard() {
    const [leaderboard, setLeaderboard] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                // Fetch from your live Render backend
                const res = await fetch('https://taskclash-api.onrender.com/api/leaderboard/');
                const data = await res.json();

                // ONLY set the state if it's a successful response and an array
                if (res.ok && Array.isArray(data)) {
                    setLeaderboard(data);
                } else {
                    setLeaderboard([]); // Fallback to empty array to prevent .map() crashes
                    setError(data.detail || 'Failed to load leaderboard data.');
                }
            } catch (err) {
                setLeaderboard([]);
                setError('Connection failed. Backend might be sleeping.');
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-12 px-6">
            <h1 className="text-[5rem] md:text-[8rem] font-black text-[#F14A3B] tracking-tighter uppercase leading-none transform scale-y-110 mb-10 text-center">
                RANKS
            </h1>

            <div className="max-w-xl w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border-4 border-transparent">
                {error && (
                    <div className="p-4 mb-4 text-red-600 bg-red-100 rounded-2xl text-center font-bold">
                        {error}
                    </div>
                )}

                {loading ? (
                    <p className="text-center text-stone-400 font-bold py-8">Loading ranks...</p>
                ) : leaderboard.length === 0 && !error ? (
                    <p className="text-center text-stone-400 font-bold py-8">No players in the arena yet.</p>
                ) : (
                    <ul className="space-y-4">
                        {leaderboard?.map((player, index) => (
                            <li 
                                key={player.id || index} 
                                className="flex items-center justify-between p-4 bg-[#FDEBD0]/30 rounded-2xl border-2 border-[#FDEBD0]"
                            >
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
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}