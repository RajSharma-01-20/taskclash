import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            const res = await fetch('https://taskclash-api.onrender.com/api/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            
            if (res.ok) {
                const data = await res.json();
                // Save the JWT token to the browser's local storage
                localStorage.setItem('token', data.access_token);
                
                // Redirect to the main app/dashboard after successful login
                navigate('/'); 
            } else {
                const errorData = await res.json();
                setError(errorData.detail || 'Login failed');
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        }
    };

    return (
        <div className="login-container">
            <h1>LOGIN</h1>
            
            <div className="form-card">
                {error && <div className="error-banner">{error}</div>}
                
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

                <p className="redirect-text">
                    New challenger? <Link to="/register">Register here</Link>
                </p>
            </div>
        </div>
    );
}