import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
    username: string;
    email: string;
}

export default function Profile() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            // 1. Get the saved token from when you logged in
            const token = localStorage.getItem('token');
            
            if (!token) {
                // If no token exists, kick them back to login
                navigate('/login');
                return;
            }

            try {
                // 2. Fetch the current user data using the token
                const res = await fetch('https://taskclash-api.onrender.com/api/users/me/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    // Token is invalid or expired
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } catch (err) {
                setError('Connection failed. Could not load profile.');
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (error) {
        return (
            <div style={{ color: 'red', textAlign: 'center', marginTop: '20px', fontWeight: 'bold' }}>
                {error}
            </div>
        );
    }

    if (!user) {
        return <div style={{ textAlign: 'center', marginTop: '20px' }}>Loading profile...</div>;
    }

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

                <button 
                    onClick={handleLogout} 
                    className="w-full bg-red-100 text-[#F14A3B] font-black uppercase tracking-widest py-4 rounded-2xl hover:bg-red-200 transition-colors mt-8"
                >
                    Sign Out
                </button>
            </div>
        </div>
    );
}