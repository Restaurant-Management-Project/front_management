import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auth-page.css';

export default function ManagerAuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
    });
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = isLogin
            ? 'http://localhost:8000/v1/api/login/'
            : 'http://localhost:8000/v1/api/register/';

        const payload = isLogin
            ? {
                username: formData.username,
                password: formData.password,
            }
            : {
                ...formData,
                user_type: 'MANAGER',
            };

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();

            if (!res.ok) {
                setMessage(typeof data === 'string' ? data : JSON.stringify(data));
            } else {
                localStorage.setItem('token', data.token);
                setMessage(`Welcome, manager ${data.username}`);
                navigate('/');
            }
        } catch (err) {
            setMessage('An error occurred.');
        }
    };

    return (
        <div className="auth-page-container">
            <div className="auth-toggle">
                <button
                    className={isLogin ? 'active-tab' : ''}
                    onClick={() => setIsLogin(true)}
                >
                    Login
                </button>
                <button
                    className={!isLogin ? 'active-tab' : ''}
                    onClick={() => setIsLogin(false)}
                >
                    Register
                </button>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Username"
                    required
                />
                {!isLogin && (
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                    />
                )}
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                />
                <button type="submit">
                    {isLogin ? 'Login' : 'Register'}
                </button>
            </form>

            {message && <div className="auth-message">{message}</div>}
        </div>
    );
}
