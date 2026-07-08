import axios from 'axios';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup, signin } from '../api';
import { useAuthStore } from '../store/authStore';
import '../styles/auth.css';

/* ── Pixel sprites for the arena preview ── */
const SPRITES = [
  { x: 20, y: 58, label: 'Builder', color: '#f59e0b' },
  { x: 55, y: 45, label: 'Admin',   color: '#c084fc' },
  { x: 78, y: 65, label: 'User',    color: '#d9381e' },
];

function PixelSprite({ color }: { color: string }) {
  return (
    <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="8" height="8" fill={color} />
      <rect x="5" y="2" width="6" height="6" fill="#e8dddb" />
      <rect x="4" y="16" width="3" height="4" fill="#4a3330" />
      <rect x="9" y="16" width="3" height="4" fill="#4a3330" />
      <rect x="6" y="4" width="1" height="1" fill="#0c0808" />
      <rect x="9" y="4" width="1" height="1" fill="#0c0808" />
    </svg>
  );
}

const ROLES: { value: 'user' | 'admin'; label: string; icon: string; desc: string }[] = [
  { value: 'user',  label: 'Player',  icon: '◉', desc: 'Explore & join spaces' },
  { value: 'admin', label: 'Builder', icon: '⬡', desc: 'Create & manage worlds' },
];

export function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'admin' | 'user'>('user');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const setAuth   = useAuthStore((s) => s.setAuth);
  const navigate  = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* Animated particle canvas on the left panel */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    const N = 60;
    const particles: P[] = Array.from({ length: N }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      r:  Math.random() * 1.2 + 0.3,
      a:  Math.random(),
    }));

    const tick = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(217,56,30,${p.a * 0.45})`;
        ctx.fill();
      });

      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i]!.x - particles[j]!.x;
          const dy = particles[i]!.y - particles[j]!.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 90) {
            ctx.beginPath();
            ctx.moveTo(particles[i]!.x, particles[i]!.y);
            ctx.lineTo(particles[j]!.x, particles[j]!.y);
            ctx.strokeStyle = `rgba(217,56,30,${0.1 * (1 - dist / 90)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signup({ username, password, type: userType });
      if (res.status !== 200) {
        setError('Signup failed. Username may already be taken.');
        return;
      }
      const signinRes = await signin({ username, password });
      if (signinRes.status !== 200) {
        setError('Account created! Please sign in manually.');
        navigate('/signin');
        return;
      }
      setAuth(signinRes.data.token, res.data.userId, userType);
      navigate('/dashboard');
    } catch (error) {
      if(axios.isAxiosError(error) && error.response){
        const message =error.response.data?.message;
        setError(message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-root">

      {/* ── Left Panel ─────────────────────────────────────── */}
      <div className="auth-panel-left">
        <canvas ref={canvasRef} className="auth-bg-canvas" />

        {/* Corner brackets */}
        <span className="auth-corner tl" />
        <span className="auth-corner tr" />
        <span className="auth-corner bl" />
        <span className="auth-corner br" />

        <div className="auth-left-content">
          {/* Brand */}
          <div className="auth-left-brand">
            <span className="auth-left-brand-dot" />
            <span className="auth-left-brand-name">METAVERSE</span>
          </div>

          {/* Headline */}
          <div className="auth-left-headline">
            <h2>
              Build your<br />
              <span>own world.</span>
            </h2>
            <p>
              Design pixel spaces, invite your crew, and move together in
              real-time — all inside your browser.
            </p>
          </div>

          {/* Arena preview */}
          <div className="auth-arena-card">
            <div className="auth-arena-bar">
              <span className="auth-arena-dot r" />
              <span className="auth-arena-dot a" />
              <span className="auth-arena-dot g" />
              <span className="auth-arena-bar-title">new-space · setup</span>
              <span className="auth-arena-live">LIVE</span>
            </div>

            <div className="auth-arena-grid">
              {/* Tiles */}
              <div className="auth-tile solid" style={{ left: '18%', top: '42%' }} />
              <div className="auth-tile solid" style={{ left: '60%', top: '30%' }} />
              <div className="auth-tile solid" style={{ left: '85%', top: '68%' }} />
              <div className="auth-tile glow"  style={{ left: '38%', top: '55%' }} />
              <div className="auth-tile glow"  style={{ left: '72%', top: '45%' }} />

              {/* Sprites */}
              {SPRITES.map((s) => (
                <div
                  key={s.label}
                  className="auth-sprite"
                  style={{ left: `${s.x}%`, top: `${s.y}%` }}
                >
                  <PixelSprite color={s.color} />
                  <span className="auth-sprite-label">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="auth-arena-footer">
              <span className="auth-arena-footer-label">
                open beta · free forever
              </span>
              <span className="auth-online-pip">5 online</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ─────────────────────────────── */}
      <div className="auth-panel-right">
        <button className="auth-back-home" onClick={() => navigate('/')}>
          ← home
        </button>

        <div className="auth-card">
          <div className="auth-card-header">
            <h1>Create account</h1>
            <p>
              Already in?{' '}
              <Link to="/signin">Sign in instead</Link>
            </p>
          </div>

          <div className="auth-divider" />

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Username */}
            <div className="auth-field">
              <label htmlFor="signup-username">Username</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">◉</span>
                <input
                  id="signup-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="choose_a_username"
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="signup-password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">◈</span>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>

            {/* Role picker */}
            <div className="auth-field">
              <label>Role</label>
              <div className="auth-role-group">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    id={`role-${r.value}`}
                    className={`auth-role-btn${userType === r.value ? ' active' : ''}`}
                    onClick={() => setUserType(r.value)}
                  >
                    <span className="role-icon">{r.icon}</span>
                    {r.label}
                    <span style={{ fontSize: '10px', opacity: 0.7, fontFamily: 'var(--font-mono)' }}>
                      {r.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="auth-error" role="alert">
                ⚠ {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="signup-submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading
                ? <><span className="auth-btn-spinner" />Creating account…</>
                : 'Enter the metaverse →'}
            </button>
          </form>

          <p className="auth-switch">
            Have an account? <Link to="/signin">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
