import { useEffect, useRef } from 'react';
import '../styles/background-fx.css';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
}

interface RainDrop {
  x: number;
  y: number;
  speed: number;
  chars: string[];
}

export function BackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // We will parse the CSS variable --accent-raw to use in the canvas
    const getAccentColor = () => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--accent-raw')
        .trim() || '217, 56, 30'; // default ember
    };

    // Particles Setup
    const particles: Particle[] = [];
    const NUM_PARTICLES = 40;
    for (let i = 0; i < NUM_PARTICLES; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        speedY: Math.random() * -0.5 - 0.1, // float up
        speedX: Math.random() * 0.4 - 0.2,  // drift slightly sideways
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    // Matrix Rain Setup
    const rainDrops: RainDrop[] = [];
    const NUM_DROPS = 30;
    const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*'.split('');
    for (let i = 0; i < NUM_DROPS; i++) {
      rainDrops.push({
        x: Math.random() * width,
        y: Math.random() * height - height, // start above screen
        speed: Math.random() * 2 + 1,
        chars: Array.from({ length: Math.floor(Math.random() * 10 + 5) }, () => chars[Math.floor(Math.random() * chars.length)]),
      });
    }

    // Mouse Tracking
    let mouseX = width / 2;
    let mouseY = height / 2;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);
    
    // Resize Handler
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    let frame = 0;

    const render = () => {
      const accentRaw = getAccentColor();

      // Clear canvas (we use a slight transparent fill to create motion blur for the rain)
      ctx.clearRect(0, 0, width, height);

      // Draw Cursor Glow
      const glowGradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 300);
      glowGradient.addColorStop(0, `rgba(${accentRaw}, 0.15)`);
      glowGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGradient;
      ctx.fillRect(0, 0, width, height);

      // Draw Digital Rain
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      rainDrops.forEach((drop) => {
        drop.y += drop.speed;
        if (drop.y > height + 200) {
          drop.y = -100;
          drop.x = Math.random() * width;
        }

        // Only update chars every few frames for a matrix effect
        if (frame % 5 === 0) {
          drop.chars[Math.floor(Math.random() * drop.chars.length)] = chars[Math.floor(Math.random() * chars.length)];
        }

        drop.chars.forEach((char, i) => {
          const charY = drop.y - i * 16;
          // Fade out the tail
          const alpha = 1 - (i / drop.chars.length);
          if (charY > 0 && charY < height) {
            ctx.fillStyle = `rgba(${accentRaw}, ${alpha * 0.4})`; // Very subtle
            ctx.fillText(char, drop.x, charY);
          }
        });
      });

      // Draw Particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around
        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.fillStyle = `rgba(${accentRaw}, ${p.opacity})`;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      frame++;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="bg-fx-container">
      {/* HTML5 Canvas for Particles, Rain, and Glow */}
      <canvas ref={canvasRef} className="bg-fx-canvas" />
      
      {/* CSS 3D Perspective Grid Floor */}
      <div className="synthwave-grid-wrapper">
        <div className="synthwave-grid" />
      </div>
    </div>
  );
}
