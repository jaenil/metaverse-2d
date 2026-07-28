import { useEffect, useRef } from 'react';

type BgStyle = 'none' | 'aurora' | 'network' | 'combined';

interface PremiumBackgroundProps {
  style: BgStyle;
}

export function PremiumBackground({ style }: PremiumBackgroundProps) {
  if (style === 'none') return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', overflow: 'hidden' }}>
      {(style === 'aurora' || style === 'combined') && <AuroraBackground />}
      {(style === 'network' || style === 'combined') && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <NetworkBackground />
        </div>
      )}
    </div>
  );
}

// ── 1. Aurora (Floating Colors) ──
function AuroraBackground() {
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blob = blobRef.current;
    if (!blob) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let blobX = mouseX;
    let blobY = mouseY;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationId: number;
    const animate = () => {
      blobX += (mouseX - blobX) * 0.05;
      blobY += (mouseY - blobY) * 0.05;

      blob.style.left = `${blobX}px`;
      blob.style.top = `${blobY}px`;
      blob.style.transform = `translate(-50%, -50%)`;

      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', filter: 'blur(100px)', opacity: 0.25 }}>
      <style>
        {`
          @keyframes aurora-2 { 0% { transform: translate(0, 0) scale(1); } 33% { transform: translate(-30%, -20%) scale(0.8); } 66% { transform: translate(20%, -40%) scale(1.1); } 100% { transform: translate(0, 0) scale(1); } }
          @keyframes aurora-3 { 0% { transform: translate(0, 0) scale(1); } 33% { transform: translate(40%, -30%) scale(1.1); } 66% { transform: translate(-40%, 20%) scale(0.9); } 100% { transform: translate(0, 0) scale(1); } }
        `}
      </style>
      
      {/* Mouse Tracking Blob */}
      <div ref={blobRef} style={{ position: 'absolute', width: '40vw', height: '40vw', borderRadius: '50%', background: 'rgba(var(--accent-raw), 0.5)' }} />
      
      {/* Background Floating Blobs */}
      <div style={{ position: 'absolute', top: '40%', right: '10%', width: '35vw', height: '35vw', borderRadius: '50%', background: 'rgba(var(--accent-raw), 0.3)', animation: 'aurora-2 25s infinite alternate ease-in-out' }} />
      <div style={{ position: 'absolute', bottom: '10%', left: '30%', width: '45vw', height: '45vw', borderRadius: '50%', background: 'rgba(var(--accent-raw), 0.15)', animation: 'aurora-3 22s infinite alternate ease-in-out' }} />
    </div>
  );
}

// ── 2. Network (Dots & Lines) ──
function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', () => { mouse.x = -1000; mouse.y = -1000; });

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 1,
      vy: (Math.random() - 0.5) * 1,
    }));

    let animationId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255,255,255,0.2)'; 
      
      const accentRaw = getComputedStyle(document.documentElement).getPropertyValue('--accent-raw').trim() || '255,255,255';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Connect to mouse
        const dxMouse = mouse.x - p.x;
        const dyMouse = mouse.y - p.y;
        const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
        if (distMouse < 150) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(${accentRaw}, ${1 - distMouse / 150})`;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }

        // Connect to other particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p2.x - p.x;
          const dy = p2.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255,255,255, ${0.1 * (1 - dist / 100)})`;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block' }} />;
}


