import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('https://taskclash-api.onrender.com/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.access_token);
        navigate('/arena');
      } else {
        const data = await res.json();
        setError(data.detail || 'Invalid email or password');
      }
    } catch (err) {
      setError('Connection failed. Check backend server.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <h1 className="text-[6rem] md:text-[10rem] font-black text-[#F14A3B] tracking-tighter uppercase leading-none transform scale-y-125 mb-12 drop-shadow-sm animate-fade-in-up">
        LOGIN
      </h1>

      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border-4 border-transparent hover:border-[#F14A3B]/20 transition-all duration-500 transform hover:-translate-y-2">
        {error && <div className="p-4 mb-6 bg-red-100 text-red-600 rounded-2xl text-center font-bold">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#F14A3B] mb-2 font-black">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full bg-[#FDEBD0]/30 border-2 border-[#FDEBD0] rounded-full px-6 py-4 text-stone-800 focus:outline-none focus:border-[#F14A3B] focus:bg-white font-bold transition-all"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#F14A3B] mb-2 font-black">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="w-full bg-[#FDEBD0]/30 border-2 border-[#FDEBD0] rounded-full px-6 py-4 text-stone-800 focus:outline-none focus:border-[#F14A3B] focus:bg-white font-bold transition-all"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#F14A3B] text-white font-black text-lg uppercase tracking-wider py-5 rounded-full hover:scale-[1.02] hover:shadow-xl shadow-[#F14A3B]/30 transition-all active:scale-95"
          >
            Enter Arena
          </button>
        </form>
        <p className="text-center text-sm font-bold text-stone-500 mt-8">
          New challenger? <Link to="/register" className="text-[#F14A3B] hover:underline">Register here</Link>
        </p>
      </div>
    </div>
  );
}