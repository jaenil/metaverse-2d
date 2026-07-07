import { useEffect, useRef, useCallback, useState } from 'react';
import type { SpaceElement, ArenaUser } from '../types';

const TILE = 44; // px per grid tile

// ── Palette ─────────────────────────────────────────────────────────────
const BG          = '#0c0808';
const GRID_LINE   = '#1e1210';
const GRID_ACCENT = '#2e1f1d';
const STATIC_FILL   = '#1c1311';
const STATIC_BORDER = '#2e1f1d';
const MY_COLOR    = '#d9381e';
const OTHER_COLOR = '#60a5fa';

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
}

// Visual state for interpolation
interface RenderUser {
  x: number;
  y: number;
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
}: ArenaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
    const avatarCache = new Map<string, HTMLImageElement>();

    const getAvatarImage = (url?: string) => {
      if (!url) return undefined;
      if (avatarCache.has(url)) return avatarCache.get(url);
      const img = new Image();
      img.src = url;
      avatarCache.set(url, img);
      return img;
    };

    // Helper to spawn dust
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

    function draw(time: number) {
      if (!ctx || !canvas) return;
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const sw = canvas.width;
      const sh = canvas.height;

      // ── 1. Update Render State (Lerp) ──
      const activeIds = new Set<string>();

      // Update My Player
      if (myPosRef.current) {
        activeIds.add(myUserId);
        let ru = renderState.get(myUserId);
        const { x: lx, y: ly } = myPosRef.current;
        if (!ru) {
          ru = { x: lx, y: ly, walkCycle: 0, lastLogicalX: lx, lastLogicalY: ly };
          renderState.set(myUserId, ru);
        } else {
          const dx = lx - ru.x;
          const dy = ly - ru.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0.01) {
            ru.x += dx * 12 * dt;
            ru.y += dy * 12 * dt;
            ru.walkCycle += dist * 8 * dt; // bobbing speed
            if (ru.lastLogicalX !== lx || ru.lastLogicalY !== ly) {
              spawnDust(ru.x, ru.y, 'rgba(var(--accent-raw),0.4)');
              ru.lastLogicalX = lx;
              ru.lastLogicalY = ly;
            }
          } else {
            ru.x = lx;
            ru.y = ly;
            ru.walkCycle = 0; // stop bobbing
          }
        }
        ru.avatarUrl = myAvatarRef.current;
        ru.emote = myEmoteRef.current;
        ru.emoteExpiresAt = myEmoteExpiresRef.current;
      }

      // Update Other Players
      usersRef.current.forEach((u) => {
        if (u.userId === myUserId) return;
        activeIds.add(u.userId);
        let ru = renderState.get(u.userId);
        if (!ru) {
          ru = { x: u.x, y: u.y, walkCycle: 0, lastLogicalX: u.x, lastLogicalY: u.y, avatarUrl: u.avatarUrl };
          renderState.set(u.userId, ru);
        } else {
          const dx = u.x - ru.x;
          const dy = u.y - ru.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0.01) {
            ru.x += dx * 12 * dt;
            ru.y += dy * 12 * dt;
            ru.walkCycle += dist * 8 * dt;
            if (ru.lastLogicalX !== u.x || ru.lastLogicalY !== u.y) {
              spawnDust(ru.x, ru.y, 'rgba(96,165,250,0.4)');
              ru.lastLogicalX = u.x;
              ru.lastLogicalY = u.y;
            }
          } else {
            ru.x = u.x;
            ru.y = u.y;
            ru.walkCycle = 0;
          }
          ru.avatarUrl = u.avatarUrl;
          ru.emote = u.emote;
          ru.emoteExpiresAt = u.emoteExpiresAt;
        }
      });

      // Cleanup disconnected players from render state
      for (const [id] of renderState) {
        if (!activeIds.has(id)) renderState.delete(id);
      }

      // ── 2. Camera Calculation ──
      let camX = sw / 2;
      let camY = sh / 2;
      const myRender = renderState.get(myUserId);
      if (myRender) {
        camX -= myRender.x * TILE + TILE / 2;
        camY -= myRender.y * TILE + TILE / 2;
      }
      camPosRef.current.x = camX;
      camPosRef.current.y = camY;

      // Clear Screen
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, sw, sh);

      ctx.save();
      ctx.translate(Math.round(camX), Math.round(camY));

      // ── 3. Draw Grid & Background ──
      const W = logicalWidth * TILE;
      const H = logicalHeight * TILE;

      // Draw Map Background Image if available
      if (bgImageRef.current) {
        ctx.drawImage(bgImageRef.current, 0, 0, W, H);
      }

      // Scanlines (only within logical bounds)
      ctx.fillStyle = 'rgba(0,0,0,0.04)';
      for (let y = 0; y < H; y += 4) {
        ctx.fillRect(0, y, W, 1);
      }

      // Lines
      for (let x = 0; x <= logicalWidth; x++) {
        ctx.beginPath(); ctx.moveTo(x * TILE, 0); ctx.lineTo(x * TILE, H);
        ctx.strokeStyle = x % 5 === 0 ? GRID_ACCENT : GRID_LINE;
        ctx.lineWidth = x % 5 === 0 ? 1 : 0.5;
        ctx.stroke();
      }
      for (let y = 0; y <= logicalHeight; y++) {
        ctx.beginPath(); ctx.moveTo(0, y * TILE); ctx.lineTo(W, y * TILE);
        ctx.strokeStyle = y % 5 === 0 ? GRID_ACCENT : GRID_LINE;
        ctx.lineWidth = y % 5 === 0 ? 1 : 0.5;
        ctx.stroke();
      }

      // Abyss overlay (out of bounds dimming)
      // Since background is BG, we just draw the grid. If we want out of bounds to look different, we could draw a dark border.
      ctx.strokeStyle = '#2e1f1d';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, W, H);

      // ── 4. Draw Particles ──
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]!;
        p.life -= dt;
        if (p.life <= 0) {
          particles.splice(i, 1);
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

      // ── 5. Static Elements ──
      elements.forEach((el) => {
        const px = el.x * TILE + 1;
        const py = el.y * TILE + 1;
        const ew = (el.element?.width ?? 1) * TILE - 2;
        const eh = (el.element?.height ?? 1) * TILE - 2;

        ctx.shadowColor = 'rgba(var(--accent-raw),0.06)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = STATIC_FILL;
        ctx.fillRect(px, py, ew, eh);
        ctx.shadowBlur = 0;

        ctx.strokeStyle = STATIC_BORDER;
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, ew, eh);

        // Hatch pattern
        ctx.save();
        ctx.beginPath(); ctx.rect(px, py, ew, eh); ctx.clip();
        ctx.strokeStyle = 'rgba(46,31,29,0.5)';
        ctx.lineWidth = 1;
        for (let d = -(ew + eh); d < ew + eh; d += 10) {
          ctx.beginPath(); ctx.moveTo(px + d, py); ctx.lineTo(px + d + eh, py + eh); ctx.stroke();
        }
        ctx.restore();
      });

      // ── 6. Avatars ──
      renderState.forEach((ru, id) => {
        if (id === myUserId) return;
        const img = getAvatarImage(ru.avatarUrl);
        drawPixelAvatar(ctx, ru.x, ru.y, ru.walkCycle, OTHER_COLOR, id.slice(-4), false, img, ru.emote, ru.emoteExpiresAt);
      });
      if (myRender) {
        const img = getAvatarImage(myRender.avatarUrl);
        drawPixelAvatar(ctx, myRender.x, myRender.y, myRender.walkCycle, MY_COLOR, 'YOU', true, img, myRender.emote, myRender.emoteExpiresAt);
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
  }, [logicalWidth, logicalHeight, elements, myUserId, connected]);

  // ── Pixel-art avatar renderer ──
  function drawPixelAvatar(
    ctx: CanvasRenderingContext2D,
    gx: number,
    gy: number,
    walkCycle: number,
    color: string,
    label: string,
    isMe: boolean,
    img?: HTMLImageElement,
    emote?: string,
    emoteExpiresAt?: number
  ) {
    const cx = gx * TILE + TILE / 2;
    const cy = gy * TILE + TILE / 2;
    const S = TILE * 0.28;
    const bob = Math.sin(walkCycle * Math.PI * 2) * (S * 0.15); // bounce offset

    if (isMe) {
      ctx.beginPath();
      ctx.arc(cx, cy - S * 0.4, S * 2.0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(var(--accent-raw),0.06)`;
      ctx.fill();
    }

    ctx.shadowColor = color;
    ctx.shadowBlur = isMe ? 12 : 6;

    // Body parts
    const headW = S * 1.6;
    const headH = S * 1.4;
    const headX = cx - headW / 2;
    const headY = cy - S * 2.0 + bob;

    const bodyW = S * 1.2;
    const bodyH = S * 1.4;
    const bodyX = cx - bodyW / 2;
    const bodyY = headY + headH;
    const legY = bodyY + bodyH;
    const legH = S * 0.85;

    let topY = headY;

    if (img && img.complete && img.naturalHeight !== 0) {
      // Draw image sprite instead of block character
      const spriteW = TILE * 1.2;
      const spriteH = TILE * 1.2;
      const drawY = cy - spriteH + bob + S * 0.5;
      ctx.drawImage(img, cx - spriteW / 2, drawY, spriteW, spriteH);
      topY = drawY;
    } else {
      // Fallback: draw blocky character
      // Torso
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(bodyX), Math.round(bodyY), Math.round(bodyW), Math.round(bodyH));
      
      // Head
      ctx.fillStyle = '#e8dddb';
      ctx.fillRect(Math.round(headX), Math.round(headY), Math.round(headW), Math.round(headH));
      
      // Eyes
      ctx.fillStyle = '#0c0808';
      const eyeY = headY + headH * 0.35;
      const eyeSize = Math.max(1, Math.round(S * 0.25));
      ctx.fillRect(Math.round(headX + headW * 0.2), Math.round(eyeY), eyeSize, eyeSize);
      ctx.fillRect(Math.round(headX + headW * 0.6), Math.round(eyeY), eyeSize, eyeSize);

      // Legs (Alternate leg height based on walk cycle)
      const legW = S * 0.55;
      
      const leg1Bob = Math.max(0, Math.sin(walkCycle * Math.PI * 2) * (S * 0.3));
      const leg2Bob = Math.max(0, Math.sin(walkCycle * Math.PI * 2 + Math.PI) * (S * 0.3));

      ctx.fillStyle = '#4a3330';
      ctx.fillRect(Math.round(bodyX), Math.round(legY - leg1Bob), Math.round(legW), Math.round(legH));
      ctx.fillRect(Math.round(bodyX + bodyW - legW), Math.round(legY - leg2Bob), Math.round(legW), Math.round(legH));
    }

    ctx.shadowBlur = 0;

    // Label tag
    const tagY = topY - 14;
    const tagPad = 4;
    ctx.font = `bold ${Math.max(8, Math.round(TILE * 0.22))}px monospace`;
    ctx.textAlign = 'center';
    const textW = ctx.measureText(label).width;
    const tagX = cx - textW / 2 - tagPad;
    const tagWidth = textW + tagPad * 2;
    const tagHeight = Math.round(TILE * 0.28);

    ctx.fillStyle = isMe ? 'rgba(217,56,30,0.85)' : 'rgba(96,165,250,0.75)';
    ctx.beginPath(); ctx.roundRect(tagX, tagY, tagWidth, tagHeight, 3); ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(label, cx, tagY + tagHeight * 0.75);

    // Emote
    if (emote && emoteExpiresAt && Date.now() < emoteExpiresAt) {
      ctx.font = `26px sans-serif`;
      ctx.textAlign = 'center';
      const emoteY = tagY - 14; 
      ctx.fillText(emote, cx, emoteY);
    }
    
    ctx.textAlign = 'left';
  }

  // ── Keyboard Input ──
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
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

    // Boundary check (prevent moving past logical grid bounds)
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
