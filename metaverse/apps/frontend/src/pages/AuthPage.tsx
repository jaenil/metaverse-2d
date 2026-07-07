import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import '../styles/auth-landing.css';

/* ── Pixel-art avatar sprites (inline SVG data URIs) ── */
const SPRITES = [
  { x: 18, y: 55, label: 'Explorer' },
  { x: 42, y: 60, label: 'Builder' },
  { x: 67, y: 52, label: 'Admin' },
];

export function AuthPage() {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /* If already logged in, skip to dashboard */
  useEffect(() => {
    if (token) navigate('/dashboard', { replace: true });
  }, [token, navigate]);

  /* Animated star-field / particle background */
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

    /* Particles */
    const N = 90;
    type Particle = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    const particles: Particle[] = Array.from({ length: N }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r:  Math.random() * 1.4 + 0.3,
      a:  Math.random(),
    }));

    const tick = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      /* Scanline overlay */
      for (let y = 0; y < height; y += 4) {
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        ctx.fillRect(0, y, width, 1);
      }

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(217,56,30,${p.a * 0.55})`;
        ctx.fill();
      });

      /* Connect nearby particles with faint lines */
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(217,56,30,${0.12 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.6;
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

  return (
    <div className="landing-root">
      {/* Animated canvas background */}
      <canvas ref={canvasRef} className="landing-canvas" />

      {/* Corner decorations */}
      <span className="corner-tl" />
      <span className="corner-tr" />
      <span className="corner-bl" />
      <span className="corner-br" />

      {/* Nav bar */}
      <nav className="landing-nav">
        <div className="landing-brand">
          <span className="landing-dot" />
          <span className="brand-text">METAVERSE</span>
        </div>
        <div className="landing-nav-links">
          <button className="btn-ghost sm" onClick={() => navigate('/signin')}>Sign in</button>
          <button className="btn-primary sm" onClick={() => navigate('/signup')}>Get started</button>
        </div>
      </nav>

      {/* Hero */}
      <main className="landing-hero">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          2D Virtual Spaces · Open Beta
        </div>

        <h1 className="hero-title">
          Your world.<br />
          <span className="hero-accent">Your rules.</span>
        </h1>

        <p className="hero-sub">
          Build pixel-art spaces, invite your team, and collaborate in real-time —
          all inside a retro 2D metaverse that runs in your browser.
        </p>

        <div className="hero-cta">
          <button
            id="landing-cta-signup"
            className="btn-primary lg"
            onClick={() => navigate('/signup')}
          >
            Create free account
          </button>
          <button
            id="landing-cta-signin"
            className="btn-ghost lg"
            onClick={() => navigate('/signin')}
          >
            Sign in →
          </button>
        </div>

        {/* Pixel art mockup card */}
        <div className="mockup-card">
          <div className="mockup-bar">
            <span className="mockup-dot red"   />
            <span className="mockup-dot amber" />
            <span className="mockup-dot green" />
            <span className="mockup-title">space-01 · 3 online</span>
            <span className="mockup-ws-badge">LIVE</span>
          </div>
          <div className="mockup-arena">
            {/* Grid lines */}
            <div className="mockup-grid" />

            {/* Pixel sprites */}
            {SPRITES.map((s) => (
              <div key={s.label} className="mockup-sprite" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
                <svg width="16" height="20" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* body */}
                  <rect x="4" y="8" width="8" height="8" fill="#d9381e" />
                  {/* head */}
                  <rect x="5" y="2" width="6" height="6" fill="#e8dddb" />
                  {/* feet */}
                  <rect x="4" y="16" width="3" height="4" fill="#4a3330" />
                  <rect x="9" y="16" width="3" height="4" fill="#4a3330" />
                  {/* eyes */}
                  <rect x="6" y="4" width="1" height="1" fill="#0c0808" />
                  <rect x="9" y="4" width="1" height="1" fill="#0c0808" />
                </svg>
                <span className="mockup-sprite-label">{s.label}</span>
              </div>
            ))}

            {/* Decorative tiles */}
            <div className="mockup-tile" style={{ left: '30%', top: '35%' }} />
            <div className="mockup-tile accent" style={{ left: '55%', top: '25%' }} />
            <div className="mockup-tile" style={{ left: '75%', top: '60%' }} />
          </div>
        </div>
      </main>

      {/* Feature strip */}
      <section className="feature-strip">
        {[
          { icon: '◈', title: 'Real-time multiplayer', desc: 'WebSocket-powered movement synced across all players instantly.' },
          { icon: '⬡', title: 'Custom maps', desc: 'Drag-and-drop map builder. Place objects, walls, and portals.' },
          { icon: '◉', title: 'Avatar system', desc: 'Pick your sprite. Express yourself in pixel-perfect style.' },
          { icon: '⚙', title: 'Admin controls', desc: 'Full CRUD for spaces, maps, and user management.' },
        ].map((f) => (
          <div className="feature-card" key={f.title}>
            <span className="feature-icon">{f.icon}</span>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <span>© 2025 Metaverse · Built at COEP</span>
        <span className="footer-divider">·</span>
        <button className="footer-link" onClick={() => navigate('/signup')}>Get started</button>
      </footer>
    </div>
  );
}
