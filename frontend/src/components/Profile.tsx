import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  score: number;
}

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }

    fetch('https://taskclash-api.onrender.com/api/users/me', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUser(data))
      .catch(() => { localStorage.removeItem('token'); navigate('/login'); });
  }, [navigate]);

  if (!user) return <div className="text-center py-20 font-black text-[#F14A3B]">LOADING PROFILE...</div>;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <h1 className="text-[5rem] md:text-[8rem] font-black text-[#F14A3B] tracking-tighter uppercase leading-none transform scale-y-110 mb-10 text-center">
        PROFILE
      </h1>

      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl text-center space-y-6">
        <div className="w-24 h-24 bg-[#F14A3B] text-white rounded-3xl mx-auto flex items-center justify-center text-4xl font-black shadow-lg shadow-[#F14A3B]/30 transform rotate-3">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-3xl font-black text-stone-800">{user.username}</h2>
          <p className="text-stone-400 font-bold text-sm">{user.email}</p>
        </div>

        <div className="bg-[#FDEBD0]/30 border-2 border-[#FDEBD0] rounded-3xl p-6 flex justify-around items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-[#F14A3B] font-black">Score</p>
            <p className="text-3xl font-black text-stone-800">{user.score}</p>
          </div>
          <div className="h-10 w-0.5 bg-[#FDEBD0]"></div>
          <div>
            <p className="text-xs uppercase tracking-widest text-[#F14A3B] font-black">ID</p>
            <p className="text-3xl font-black text-stone-800">#{user.id}</p>
          </div>
        </div>

        <button
          onClick={() => { localStorage.removeItem('token'); navigate('/login'); }}
          className="w-full bg-red-100 text-[#F14A3B] font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-red-200 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}