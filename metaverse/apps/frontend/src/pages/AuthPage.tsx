import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup, signin } from '../api';
import { useAuthStore } from '../store/authStore';
import '../styles/auth.css';

type Mode = 'signin' | 'signup';

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'admin' | 'user'>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await signup({ username, password, type: userType });
        if (res.status !== 200) {
          setError('Signup failed. Username may already exist.');
          return;
        }
        // Auto sign in after signup
        const signinRes = await signin({ username, password });
        if (signinRes.status !== 200) {
          setError('Signed up, but signin failed. Try logging in.');
          setMode('signin');
          return;
        }
        setAuth(signinRes.data.token, res.data.userId, userType);
      } else {
        const res = await signin({ username, password });
        if (res.status !== 200) {
          setError('Invalid username or password.');
          return;
        }
        const userId = res.data.userId ?? '';
        setAuth(res.data.token, userId, userType);
      }
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
        <p className="auth-sub">
          {mode === 'signin' ? 'Sign in to continue' : 'Create your account'}
        </p>

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

          {mode === 'signup' && (
            <label>
              Account type
              <select
                value={userType}
                onChange={(e) => setUserType(e.target.value as 'admin' | 'user')}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="auth-toggle">
          {mode === 'signin' ? "Don't have an account? " : 'Already have one? '}
          <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}>
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
