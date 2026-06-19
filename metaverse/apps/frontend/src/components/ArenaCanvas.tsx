import { useEffect, useRef, useCallback } from 'react';
import type { SpaceElement, ArenaUser } from '../types';

const TILE = 48; // px per grid tile
const MY_COLOR = '#7c3aed';    // violet — the player
const OTHER_COLOR = '#0ea5e9'; // sky blue — others
const STATIC_COLOR = '#1e293b'; // slate — static elements
const GRID_COLOR = '#0f172a';
const GRID_LINE = '#1e293b';

interface ArenaCanvasProps {
  width: number;
  height: number;
  myPos: { x: number; y: number } | null;
  users: Map<string, ArenaUser>;
  elements: SpaceElement[];
  myUserId: string;
  onMove: (x: number, y: number) => void;
  connected: boolean;
}

export function ArenaCanvas({
  width,
  height,
  myPos,
  users,
  elements,
  myUserId,
  onMove,
  connected,
}: ArenaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const myPosRef = useRef(myPos);
  const keysHeld = useRef<Set<string>>(new Set());
  const lastMoveTime = useRef(0);

  myPosRef.current = myPos;

  // ─── Draw loop ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf: number;

    function draw() {
      if (!ctx || !canvas) return;
      const W = width * TILE;
      const H = height * TILE;

      ctx.clearRect(0, 0, W, H);

      // Background
      ctx.fillStyle = GRID_COLOR;
      ctx.fillRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = GRID_LINE;
      ctx.lineWidth = 1;
      for (let x = 0; x <= width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * TILE, 0);
        ctx.lineTo(x * TILE, H);
        ctx.stroke();
      }
      for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * TILE);
        ctx.lineTo(W, y * TILE);
        ctx.stroke();
      }

      // Static elements
      elements.forEach((el) => {
        const px = el.x * TILE + 2;
        const py = el.y * TILE + 2;
        const ew = (el.element?.width ?? 1) * TILE - 4;
        const eh = (el.element?.height ?? 1) * TILE - 4;
        ctx.fillStyle = STATIC_COLOR;
        ctx.fillRect(px, py, ew, eh);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, ew, eh);

        // Label
        ctx.fillStyle = '#475569';
        ctx.font = '10px monospace';
        ctx.fillText('obj', px + 4, py + 14);
      });

      // Other users
      users.forEach((user) => {
        if (user.userId === myUserId) return;
        drawAvatar(ctx, user.x, user.y, OTHER_COLOR, user.userId.slice(-4));
      });

      // My avatar (drawn last = on top)
      const pos = myPosRef.current;
      if (pos) {
        drawAvatar(ctx, pos.x, pos.y, MY_COLOR, 'YOU');
      }

      // Disconnected overlay
      if (!connected) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#f87171';
        ctx.font = 'bold 18px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Reconnecting…', W / 2, H / 2);
        ctx.textAlign = 'left';
      }

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [width, height, elements, users, myUserId, connected]);

  function drawAvatar(
    ctx: CanvasRenderingContext2D,
    gx: number,
    gy: number,
    color: string,
    label: string
  ) {
    const cx = gx * TILE + TILE / 2;
    const cy = gy * TILE + TILE / 2;
    const r = TILE * 0.32;

    // Shadow
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;

    // Body circle
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    // Label beneath
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(label, cx, gy * TILE + TILE - 4);
    ctx.textAlign = 'left';
  }

  // ─── Keyboard movement ────────────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      keysHeld.current.add(e.key);

      const now = Date.now();
      if (now - lastMoveTime.current < 150) return; // throttle to ~6 moves/s
      lastMoveTime.current = now;

      const pos = myPosRef.current;
      if (!pos || !connected) return;

      let { x, y } = pos;

      if (e.key === 'ArrowUp' || e.key === 'w') y -= 1;
      else if (e.key === 'ArrowDown' || e.key === 's') y += 1;
      else if (e.key === 'ArrowLeft' || e.key === 'a') x -= 1;
      else if (e.key === 'ArrowRight' || e.key === 'd') x += 1;
      else return;

      e.preventDefault();
      onMove(x, y);
    },
    [connected, onMove]
  );

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysHeld.current.delete(e.key);
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const canvasW = width * TILE;
  const canvasH = height * TILE;

  return (
    <div style={{ overflow: 'auto', maxWidth: '100%', maxHeight: '70vh' }}>
      <canvas
        ref={canvasRef}
        width={canvasW}
        height={canvasH}
        tabIndex={0}
        style={{
          display: 'block',
          cursor: 'crosshair',
          outline: 'none',
          border: '1px solid #1e293b',
          borderRadius: '4px',
        }}
      />
    </div>
  );
}
