import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    // We now use username instead of email to match the backend
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            // Pointing to the correct /api/token route
            const res = await fetch('https://taskclash-api.onrender.com/api/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem('token', data.access_token);
                navigate('/'); // Redirects to home/arena on success
            } else {
                const errorData = await res.json();
                setError(errorData.detail || 'Login failed');
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-20 px-6">
            <h1 className="text-[6rem] md:text-[10rem] font-black text-[#F14A3B] tracking-tighter uppercase leading-none transform scale-y-125 mb-12 drop-shadow-sm animate-fade-in-up">
                LOGIN
            </h1>
            
            <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border-4 border-transparent hover:border-[#F14A3B]/20 transition-all duration-500 transform hover:-translate-y-2">
                {error && <div className="p-4 mb-6 bg-red-100 text-red-600 rounded-2xl text-center font-bold">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs uppercase tracking-widest text-[#F14A3B] mb-2 font-black">Username</label>
                        <input
                            type="text"
                            placeholder="raj"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                            className="w-full bg-[#FDEBD0]/30 border-2 border-[#FDEBD0] rounded-full px-6 py-4 text-stone-800 focus:outline-none focus:border-[#F14A3B] focus:bg-white font-bold transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-widest text-[#F14A3B] mb-2 font-black">Password</label>
                        <input
                            type="password"
                            placeholder="...."
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            className="w-full bg-[#FDEBD0]/30 border-2 border-[#FDEBD0] rounded-full px-6 py-4 text-stone-800 focus:outline-none focus:border-[#F14A3B] focus:bg-white font-bold transition-all"
                        />
                    </div>

                    <button type="submit" className="w-full bg-[#F14A3B] text-white font-black text-lg uppercase tracking-wider py-5 rounded-full hover:scale-[1.02] hover:shadow-xl shadow-[#F14A3B]/30 transition-all active:scale-95">
                        ENTER ARENA
                    </button>
                </form>

                <p className="text-center text-sm font-bold text-stone-500 mt-8">
                    New challenger? <Link to="/register" className="text-[#F14A3B] hover:underline">Register here</Link>
                </p>
            </div>
        </div>
    );
}