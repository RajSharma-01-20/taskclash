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
        <>
            <h1>LOGIN</h1>
            
            {error && (
                <div style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center', fontWeight: 'bold' }}>
                    {error}
                </div>
            )}
            
            <form onSubmit={handleSubmit}>
                <label>USERNAME</label>
                <input
                    type="text"
                    placeholder="raj"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                />

                <label>PASSWORD</label>
                <input
                    type="password"
                    placeholder="...."
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                />

                <button type="submit">ENTER ARENA</button>
            </form>

            <p>
                New challenger? <Link to="/register">Register here</Link>
            </p>
        </>
    );
}