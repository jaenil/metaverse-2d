import { useNavigate } from 'react-router-dom';
import '../styles/about.css';

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="about-root">
      {/* Decorative Corners */}
      <span className="corner-tl" />
      <span className="corner-tr" />
      <span className="corner-bl" />
      <span className="corner-br" />

      {/* Nav */}
      <nav className="landing-nav" style={{ padding: '2rem 5%' }}>
        <div className="landing-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="landing-dot" />
          <span className="brand-text">METAVERSE</span>
        </div>
        <div className="landing-nav-links">
          <button className="btn-ghost sm" onClick={() => navigate('/')}>Home</button>
        </div>
      </nav>

      <main className="about-content">
        <header className="about-header">
          <div className="hero-badge" style={{ marginBottom: '1.5rem', alignSelf: 'flex-start' }}>
            <span className="hero-badge-dot" />
            About VMetaverse
          </div>
          <h1 className="about-title">
            Virtual interaction, <br />
            <span className="hero-accent">built for collaboration.</span>
          </h1>
          <p className="about-sub">
            VMetaverse is a browser-based 2D virtual space where users can create custom maps, navigate pixel-art environments, and interact with others in real-time.
          </p>
        </header>

        <section className="about-section">
          <h2 className="section-title">Tech Stack</h2>
          <div className="glass-panel text-content">
            <p>
              VMetaverse is built using a modern, scalable tech stack focused on real-time performance and seamless user experience.
            </p>
            <ul style={{ marginTop: '1rem', marginLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'var(--text-muted)' }}>
              <li><strong style={{ color: 'var(--text-base)' }}>Frontend:</strong> React and TypeScript powering a custom 2D spatial rendering engine.</li>
              <li><strong style={{ color: 'var(--text-base)' }}>Backend API:</strong> Node.js and Express handling RESTful services.</li>
              <li><strong style={{ color: 'var(--text-base)' }}>Real-time Engine:</strong> A dedicated WebSocket service managing low-latency multiplayer movement and interactions.</li>
              <li><strong style={{ color: 'var(--text-base)' }}>Database:</strong> PostgreSQL managed via Prisma ORM for reliable storage of spaces, maps, and user state.</li>
              <li><strong style={{ color: 'var(--text-base)' }}>Infrastructure:</strong> Managed as a monorepo via TurboRepo for shared database and types packages.</li>
            </ul>
          </div>
        </section>

        <section className="about-section">
          <h2 className="section-title">Who We Are</h2>
          <div className="glass-panel text-content" style={{ marginBottom: '2rem' }}>
            <p>
              Built by two engineering students collaborating across institutes, bringing together scalable backend infrastructure and intuitive frontend design.
            </p>
          </div>
          <div className="team-grid">
            <div className="team-card">
              <div className="team-card-header">
                <div className="team-avatar">JP</div>
                <div className="team-role-badge">Backend Lead</div>
              </div>
              <h3 className="team-name" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                Jaenil Parekh
                <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Open to Work</span>
              </h3>
              <p className="team-institute">Indian Institute of Technology Jodhpur (IITJ)</p>
              <p className="team-desc">
                Responsible for server architecture, database management, and system scalability. 
                The primary focus is on building a stable infrastructure that handles data routing 
                and concurrent users efficiently.
              </p>
            </div>

            <div className="team-card">
              <div className="team-card-header">
                <div className="team-avatar">PB</div>
                <div className="team-role-badge">Frontend Lead</div>
              </div>
              <h3 className="team-name" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                Parth Bansal
                <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Open to Work</span>
              </h3>
              <p className="team-institute">COEP Technological University</p>
              <p className="team-desc">
                Responsible for frontend development and user interface design. 
                The primary focus is on creating a responsive, straightforward, and functional 
                experience for the end user.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer" style={{ marginTop: 'auto' }}>
        <span>© 2025 VMetaverse</span>
        <span className="footer-divider">·</span>
        <button className="footer-link" onClick={() => navigate('/signup')}>Get started</button>
      </footer>
    </div>
  );
}
