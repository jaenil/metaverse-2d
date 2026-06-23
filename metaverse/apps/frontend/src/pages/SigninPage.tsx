import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signin } from '../api';
import { useAuthStore } from '../store/authStore';
import '../styles/auth.css';

export function SigninPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signin({ username, password });
      if (res.status !== 200) {
        setError('Invalid username or password.');
        return;
      }
      const userId = res.data.userId ?? '';
      setAuth(res.data.token, userId, 'user');
      navigate('/dashboard');
    } catch {
      setError('Network error. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="auth-dot" />
          <h1>Metaverse</h1>
        </div>
        <p className="auth-sub">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="you@example"
              required
              autoFocus
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </label>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading} className="auth-btn btn-primary">
            {loading ? 'Please wait…' : 'Sign in'}
          </button>
        </form>

        <p className="auth-toggle">
          Don't have an account?{' '}
          <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
