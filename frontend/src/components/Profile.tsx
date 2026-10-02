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
        <div className="profile-container">
            <h1>PROFILE</h1>
            
            <div className="profile-card" style={{ marginTop: '20px', fontSize: '1.2rem', lineHeight: '2' }}>
                <p><strong>USERNAME:</strong> {user.username}</p>
                <p><strong>EMAIL:</strong> {user.email}</p>
            </div>

            <button 
                onClick={handleLogout} 
                style={{ 
                    marginTop: '30px', 
                    backgroundColor: '#f44336', 
                    color: 'white', 
                    padding: '10px 20px', 
                    border: 'none', 
                    borderRadius: '5px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold' 
                }}
            >
                LOGOUT
            </button>
        </div>
    );
}