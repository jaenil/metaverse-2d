import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signin } from '../api';
import { useAuthStore } from '../store/authStore';
import '../styles/auth.css';

/* ── Pixel sprites for the arena preview ── */
const SPRITES = [
  { x: 22, y: 55, label: 'Mage', color: '#c084fc' },
  { x: 50, y: 62, label: 'Scout', color: '#d9381e' },
  { x: 75, y: 48, label: 'Guard', color: '#10b981' },
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

export function SigninPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const setAuth    = useAuthStore((s) => s.setAuth);
  const navigate   = useNavigate();
  const canvasRef  = useRef<HTMLCanvasElement>(null);

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
              Step back<br />
              <span>into your world.</span>
            </h2>
            <p>
              Your spaces, your avatars, your crew — all waiting for you inside
              the retro 2D metaverse.
            </p>
          </div>

          {/* Arena preview */}
          <div className="auth-arena-card">
            <div className="auth-arena-bar">
              <span className="auth-arena-dot r" />
              <span className="auth-arena-dot a" />
              <span className="auth-arena-dot g" />
              <span className="auth-arena-bar-title">space-01 · plaza</span>
              <span className="auth-arena-live">LIVE</span>
            </div>

            <div className="auth-arena-grid">
              {/* Tiles */}
              <div className="auth-tile solid" style={{ left: '28%', top: '38%' }} />
              <div className="auth-tile solid" style={{ left: '58%', top: '65%' }} />
              <div className="auth-tile solid" style={{ left: '82%', top: '32%' }} />
              <div className="auth-tile glow"  style={{ left: '44%', top: '28%' }} />
              <div className="auth-tile glow"  style={{ left: '70%', top: '55%' }} />

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
                live · ws://metaverse.local
              </span>
              <span className="auth-online-pip">3 online</span>
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
            <h1>Welcome back</h1>
            <p>
              No account?{' '}
              <Link to="/signup">Create one free</Link>
            </p>
          </div>

          <div className="auth-divider" />

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Username */}
            <div className="auth-field">
              <label htmlFor="signin-username">Username</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">◉</span>
                <input
                  id="signin-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="your_username"
                  required
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <label htmlFor="signin-password">Password</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">◈</span>
                <input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
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
              id="signin-submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading
                ? <><span className="auth-btn-spinner" />Signing in…</>
                : 'Sign in →'}
            </button>
          </form>

          <p className="auth-switch">
            New here? <Link to="/signup">Create a free account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
