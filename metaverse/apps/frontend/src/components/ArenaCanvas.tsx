import { useEffect, useRef, useCallback, useState } from 'react';
import type { SpaceElement, ArenaUser } from '../types';
import { drawPixelAvatar } from '../utils/drawPixelAvatar';
import { updateAndDrawWeather, WeatherParticle } from '../utils/drawWeather';
import { calculateCameraPosition } from '../utils/cameraUtils';

const TILE = 44; // px per grid tile

// ── Palette ─────────────────────────────────────────────────────────────
const BG          = '#0c0808';
const GRID_LINE   = '#1e1210';
const GRID_ACCENT = '#2e1f1d';
const STATIC_FILL   = '#1c1311';
const STATIC_BORDER = '#2e1f1d';
const MY_COLOR    = '#d9381e';

function hashColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 70%, 60%)`;
}

interface ArenaCanvasProps {
  width: number;
  height: number;
  thumbnail: string | null;
  myPos: { x: number; y: number } | null;
  myAvatarUrl?: string;
  myEmote?: string;
  myEmoteExpiresAt?: number;
  users: Map<string, ArenaUser>;
  elements: SpaceElement[];
  myUserId: string;
  onMove: (x: number, y: number) => void;
  onCanvasClick?: (x: number, y: number) => void;
  connected: boolean;
  weather: 'none' | 'rain' | 'snow';
  timeOfDay: 'day' | 'night';
}

// Visual state for interpolation
interface RenderUser {
  x: number;
  y: number;
  vx: number;
  facing: number;
  walkCycle: number;
  lastLogicalX: number;
  lastLogicalY: number;
  avatarUrl?: string;
  emote?: string;
  emoteExpiresAt?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export function ArenaCanvas({
  width: logicalWidth,
  height: logicalHeight,
  thumbnail,
  myPos,
  myAvatarUrl,
  myEmote,
  myEmoteExpiresAt,
  users,
  elements,
  myUserId,
  onMove,
  onCanvasClick,
  connected,
  weather,
  timeOfDay,
}: ArenaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lightCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const camPosRef = useRef({ x: 0, y: 0 });
  const myPosRef  = useRef(myPos);
  const myAvatarRef = useRef(myAvatarUrl);
  const myEmoteRef = useRef(myEmote);
  const myEmoteExpiresRef = useRef(myEmoteExpiresAt);
  const usersRef  = useRef(users);
  const lastMoveRef = useRef(0);

  // Resize canvas to match window
  const [screen, setScreen] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    const handleResize = () => setScreen({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load Map Background
  useEffect(() => {
    if (thumbnail) {
      const img = new Image();
      img.src = thumbnail;
      img.onload = () => {
        bgImageRef.current = img;
      };
      img.onerror = () => {
        console.error("Failed to load map background image from URL:", thumbnail);
      };
    } else {
      bgImageRef.current = null;
    }
  }, [thumbnail]);

  myPosRef.current = myPos;
  myAvatarRef.current = myAvatarUrl;
  myEmoteRef.current = myEmote;
  myEmoteExpiresRef.current = myEmoteExpiresAt;
  usersRef.current = users;

  // ── Engine Loop ────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;
    let lastTime = performance.now();

    const renderState = new Map<string, RenderUser>();
    const particles: Particle[] = [];
    const weatherParticles: WeatherParticle[] = [];
    const imageCache = new Map<string, HTMLImageElement>();

    const getCachedImage = (url?: string) => {
      if (!url) return undefined;
      if (imageCache.has(url)) return imageCache.get(url);
      const img = new Image();
      img.src = url;
      imageCache.set(url, img);
      return img;
    };

    function spawnDust(gx: number, gy: number, color: string) {
      for (let i = 0; i < 2; i++) {
        particles.push({
          x: gx * TILE + TILE / 2 + (Math.random() - 0.5) * TILE * 0.4,
          y: gy * TILE + TILE * 0.8 + Math.random() * TILE * 0.2,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.2) * 0.5,
          life: 1.0,
          maxLife: 0.5 + Math.random() * 0.5,
          color,
        });
      }
    }

    // PERF-02: Prepare Offscreen Canvas for Grid
    let offscreenCanvas: HTMLCanvasElement | null = null;
    const W = logicalWidth * TILE;
    const H = logicalHeight * TILE;
    if (W > 0 && H > 0) {
      offscreenCanvas = document.createElement('canvas');
      offscreenCanvas.width = W;
      offscreenCanvas.height = H;
      const oCtx = offscreenCanvas.getContext('2d');
      if (oCtx) {
        oCtx.fillStyle = 'rgba(0,0,0,0.04)';
        for (let y = 0; y < H; y += 4) {
          oCtx.fillRect(0, y, W, 1);
        }
        for (let x = 0; x <= logicalWidth; x++) {
          oCtx.beginPath(); oCtx.moveTo(x * TILE, 0); oCtx.lineTo(x * TILE, H);
          oCtx.strokeStyle = x % 5 === 0 ? GRID_ACCENT : GRID_LINE;
          oCtx.lineWidth = x % 5 === 0 ? 1 : 0.5;
          oCtx.stroke();
        }
        for (let y = 0; y <= logicalHeight; y++) {
          oCtx.beginPath(); oCtx.moveTo(0, y * TILE); oCtx.lineTo(W, y * TILE);
          oCtx.strokeStyle = y % 5 === 0 ? GRID_ACCENT : GRID_LINE;
          oCtx.lineWidth = y % 5 === 0 ? 1 : 0.5;
          oCtx.stroke();
        }
      }
    }

    function draw(time: number) {
      if (!ctx || !canvas) return;
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const sw = canvas.width;
      const sh = canvas.height;

      ctx.imageSmoothingEnabled = false;

      // ── 1. Update Render State (Lerp) ──
      const activeIds = new Set<string>();

      if (myPosRef.current) {
        activeIds.add(myUserId);
        let ru = renderState.get(myUserId);
        const { x: lx, y: ly } = myPosRef.current;
        if (!ru) {
          ru = { x: lx, y: ly, vx: 0, facing: 1, walkCycle: 0, lastLogicalX: lx, lastLogicalY: ly };
          renderState.set(myUserId, ru);
        } else {
          const dx = lx - ru.x;
          const dy = ly - ru.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 2) {
            ru.x = lx; ru.y = ly; ru.vx = 0; ru.walkCycle = 0; ru.lastLogicalX = lx; ru.lastLogicalY = ly;
          } else if (dist > 0.01) {
            ru.vx = dx * 12 * dt; ru.x += ru.vx; ru.y += dy * 12 * dt; ru.walkCycle += dist * 8 * dt;
            if (ru.vx > 0.1) ru.facing = 1;
            if (ru.vx < -0.1) ru.facing = -1;
            if (ru.lastLogicalX !== lx || ru.lastLogicalY !== ly) {
              spawnDust(ru.x, ru.y, 'rgba(var(--accent-raw),0.4)');
              ru.lastLogicalX = lx; ru.lastLogicalY = ly;
            }
          } else {
            ru.x = lx; ru.y = ly; ru.walkCycle = 0;
          }
        }
        ru.avatarUrl = myAvatarRef.current;
        ru.emote = myEmoteRef.current;
        ru.emoteExpiresAt = myEmoteExpiresRef.current;
      }

      usersRef.current.forEach((u) => {
        if (u.userId === myUserId) return;
        activeIds.add(u.userId);
        let ru = renderState.get(u.userId);
        if (!ru) {
          ru = { x: u.x, y: u.y, vx: 0, facing: 1, walkCycle: 0, lastLogicalX: u.x, lastLogicalY: u.y, avatarUrl: u.avatarUrl };
          renderState.set(u.userId, ru);
        } else {
          const dx = u.x - ru.x;
          const dy = u.y - ru.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 2) {
            ru.x = u.x; ru.y = u.y; ru.vx = 0; ru.walkCycle = 0; ru.lastLogicalX = u.x; ru.lastLogicalY = u.y;
          } else if (dist > 0.01) {
            ru.vx = dx * 12 * dt; ru.x += ru.vx; ru.y += dy * 12 * dt; ru.walkCycle += dist * 8 * dt;
            if (ru.vx > 0.1) ru.facing = 1;
            if (ru.vx < -0.1) ru.facing = -1;
            if (ru.lastLogicalX !== u.x || ru.lastLogicalY !== u.y) {
              spawnDust(ru.x, ru.y, 'rgba(96,165,250,0.4)');
              ru.lastLogicalX = u.x; ru.lastLogicalY = u.y;
            }
          } else {
            ru.x = u.x; ru.y = u.y; ru.walkCycle = 0;
          }
          ru.avatarUrl = u.avatarUrl;
          ru.emote = u.emote;
          ru.emoteExpiresAt = u.emoteExpiresAt;
        }
      });

      for (const [id] of renderState) {
        if (!activeIds.has(id)) renderState.delete(id);
      }

      // ── 2. Camera Calculation ──
      const myRender = renderState.get(myUserId);
      const { camX, camY } = calculateCameraPosition(sw, sh, logicalWidth, logicalHeight, TILE, myRender, myPosRef.current);
      camPosRef.current.x = camX;
      camPosRef.current.y = camY;

      // Clear Screen
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, sw, sh);

      ctx.save();
      ctx.translate(Math.round(camX), Math.round(camY));

      // ── 3. Draw Grid & Background ──
      const mapW = logicalWidth * TILE;
      const mapH = logicalHeight * TILE;
      if (bgImageRef.current) {
        ctx.drawImage(bgImageRef.current, 0, 0, mapW, mapH);
      }
      if (offscreenCanvas) {
        ctx.drawImage(offscreenCanvas, 0, 0);
      }

      ctx.strokeStyle = '#2e1f1d';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, W, H);

      // ── 4. Draw Particles ──
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!;
        p.life -= dt;
        if (p.life <= 0) {
          // PERF-03: Swap and pop instead of splice
          particles[i] = particles[particles.length - 1];
          particles.pop();
          continue;
        }
        p.x += p.vx * dt * 60;
        p.y += p.vy * dt * 60;
        ctx.globalAlpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        const size = (p.life / p.maxLife) * 6;
        ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
      }
      ctx.globalAlpha = 1.0;

      // ── 4b. Draw Weather ──
      updateAndDrawWeather(ctx, weatherParticles, weather, dt, camX, camY, sw, sh);

      // ── 5. Static Elements ──
      elements.forEach((el) => {
        const px = el.x * TILE;
        const py = el.y * TILE;
        const ew = (el.element?.width ?? 1) * TILE;
        const eh = (el.element?.height ?? 1) * TILE;

        const img = getCachedImage(el.element?.imageUrl);
        if (img && img.complete && img.naturalHeight !== 0) {
          ctx.drawImage(img, px, py, ew, eh);
        } else {
          const boxPx = px + 1; const boxPy = py + 1; const boxEw = ew - 2; const boxEh = eh - 2;
          ctx.shadowColor = 'rgba(var(--accent-raw),0.06)';
          ctx.shadowBlur = 10;
          ctx.fillStyle = STATIC_FILL;
          ctx.fillRect(boxPx, boxPy, boxEw, boxEh);
          ctx.shadowBlur = 0;
          ctx.strokeStyle = STATIC_BORDER;
          ctx.lineWidth = 1;
          ctx.strokeRect(boxPx, boxPy, boxEw, boxEh);
          ctx.save();
          ctx.beginPath(); ctx.rect(boxPx, boxPy, boxEw, boxEh); ctx.clip();
          ctx.strokeStyle = 'rgba(46,31,29,0.5)';
          ctx.lineWidth = 1;
          for (let d = -(boxEw + boxEh); d < boxEw + boxEh; d += 10) {
            ctx.beginPath(); ctx.moveTo(boxPx + d, boxPy); ctx.lineTo(boxPx + d + boxEh, boxPy + boxEh); ctx.stroke();
          }
          ctx.restore();
        }
      });

      // ── 6. Avatars ──
      renderState.forEach((ru, id) => {
        if (id === myUserId) return;
        const img = getCachedImage(ru.avatarUrl);
        drawPixelAvatar(ctx, ru.x, ru.y, ru.walkCycle, ru.vx, ru.facing, hashColor(id), id.slice(-4), false, img, ru.emote, ru.emoteExpiresAt);
      });
      if (myRender) {
        const img = getCachedImage(myRender.avatarUrl);
        drawPixelAvatar(ctx, myRender.x, myRender.y, myRender.walkCycle, myRender.vx, myRender.facing, MY_COLOR, 'YOU', true, img, myRender.emote, myRender.emoteExpiresAt);
      }

      // ── 6.5 Dynamic Lighting (Day/Night) ──
      if (timeOfDay === 'night') {
        if (!lightCanvasRef.current) {
          lightCanvasRef.current = document.createElement('canvas');
        }
        const lcanvas = lightCanvasRef.current;
        if (lcanvas.width !== sw || lcanvas.height !== sh) {
          lcanvas.width = sw; lcanvas.height = sh;
        }
        const lctx = lcanvas.getContext('2d');
        if (lctx) {
          lctx.globalCompositeOperation = 'source-over';
          lctx.fillStyle = 'rgba(5, 5, 20, 0.85)';
          lctx.fillRect(0, 0, sw, sh);
          lctx.globalCompositeOperation = 'destination-out';

          if (myRender) {
            const sx = (myRender.x * TILE + TILE / 2) + camX;
            const sy = (myRender.y * TILE + TILE / 2) + camY;
            const grad = lctx.createRadialGradient(sx, sy, 0, sx, sy, 220);
            grad.addColorStop(0, 'rgba(0,0,0,1)'); grad.addColorStop(0.5, 'rgba(0,0,0,0.6)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
            lctx.fillStyle = grad;
            lctx.beginPath(); lctx.arc(sx, sy, 220, 0, Math.PI * 2); lctx.fill();
          }
          renderState.forEach((ru, id) => {
            if (id === myUserId) return;
            const ox = (ru.x * TILE + TILE / 2) + camX;
            const oy = (ru.y * TILE + TILE / 2) + camY;
            const grad = lctx.createRadialGradient(ox, oy, 0, ox, oy, 120);
            grad.addColorStop(0, 'rgba(0,0,0,0.8)'); grad.addColorStop(1, 'rgba(0,0,0,0)');
            lctx.fillStyle = grad;
            lctx.beginPath(); lctx.arc(ox, oy, 120, 0, Math.PI * 2); lctx.fill();
          });
          ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(lcanvas, -camX, -camY);
        }
      }

      ctx.restore();

      // ── 7. Disconnected Overlay (Static space) ──
      if (!connected) {
        ctx.fillStyle = 'rgba(0,0,0,0.72)';
        ctx.fillRect(0, 0, sw, sh);

        const bw = 240, bh = 70;
        const bx = (sw - bw) / 2, by = (sh - bh) / 2;
        ctx.fillStyle = '#140d0c';
        ctx.strokeStyle = 'rgba(217,56,30,0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 6); ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#d9381e';
        ctx.font = 'bold 15px "VT323", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('RECONNECTING…', sw / 2, sh / 2 - 4);
        ctx.fillStyle = '#8c7a77';
        ctx.font = '11px "JetBrains Mono", monospace';
        ctx.fillText('WebSocket disconnected', sw / 2, sh / 2 + 16);
        ctx.textAlign = 'left';
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [logicalWidth, logicalHeight, elements, myUserId, connected, weather, timeOfDay]);

  // ── Keyboard Input ──
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
    
    const isMovementKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key);
    if (isMovementKey) {
      e.preventDefault();
    }

    const now = Date.now();
    if (now - lastMoveRef.current < 140) return;
    lastMoveRef.current = now;

    const pos = myPosRef.current;
    if (!pos || !connected) return;

    let { x, y } = pos;
    if      (e.key === 'ArrowUp'    || e.key === 'w') y -= 1;
    else if (e.key === 'ArrowDown'  || e.key === 's') y += 1;
    else if (e.key === 'ArrowLeft'  || e.key === 'a') x -= 1;
    else if (e.key === 'ArrowRight' || e.key === 'd') x += 1;
    else return;

    if (x < 0 || y < 0 || x >= logicalWidth || y >= logicalHeight) return;

    e.preventDefault();
    onMove(x, y);
  }, [connected, onMove, logicalWidth, logicalHeight]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onCanvasClick) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const logicalX = Math.floor((clickX - camPosRef.current.x) / TILE);
    const logicalY = Math.floor((clickY - camPosRef.current.y) / TILE);
    
    if (logicalX >= 0 && logicalY >= 0 && logicalX < logicalWidth && logicalY < logicalHeight) {
      onCanvasClick(logicalX, logicalY);
    }
  }, [onCanvasClick, logicalWidth, logicalHeight]);

  return (
    <canvas
      ref={canvasRef}
      width={screen.w}
      height={screen.h}
      onClick={handleCanvasClick}
      style={{ display: 'block', outline: 'none' }}
    />
  );
}
