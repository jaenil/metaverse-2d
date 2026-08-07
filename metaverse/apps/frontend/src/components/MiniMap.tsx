import { useEffect, useRef, useState, memo } from 'react';
import type { SpaceElement, ArenaUser } from '../types';

interface MiniMapProps {
  width: number;
  height: number;
  thumbnail?: string | null;
  elements: SpaceElement[];
  users: Map<string, ArenaUser>;
  myPos: { x: number; y: number } | null;
  myUserId: string;
}

export const MiniMap = memo(function MiniMap({ width, height, thumbnail, elements, users, myPos, myUserId }: MiniMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const usersRef = useRef(users);
  const myPosRef = useRef(myPos);
  
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);

  // Load the thumbnail image if available
  useEffect(() => {
    if (!thumbnail) {
      setBgImage(null);
      return;
    }
    const img = new Image();
    img.src = thumbnail;
    img.onload = () => setBgImage(img);
    img.onerror = () => setBgImage(null);
  }, [thumbnail]);

  // Keep refs updated without triggering re-renders inside the loop
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    myPosRef.current = myPos;
  }, [myPos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Clear background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (bgImage) {
        ctx.globalAlpha = 0.5; // Make the background image slightly transparent
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0; // Reset alpha for elements
      } else {
        // Draw a grid-like pattern or a slightly lighter background so it's not pitch black
        ctx.fillStyle = 'rgba(20, 25, 30, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // We want to scale the logical map (width x height) to fit in the canvas
      const scaleX = canvas.width / width;
      const scaleY = canvas.height / height;

      // Draw static elements (obstacles)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      elements.forEach((el) => {
        const w = el.element?.width ?? 1;
        const h = el.element?.height ?? 1;
        ctx.fillRect(el.x * scaleX, el.y * scaleY, w * scaleX, h * scaleY);
      });

      // Draw other users
      ctx.fillStyle = 'rgba(217, 56, 30, 0.8)'; // Red for others
      usersRef.current.forEach((u) => {
        if (u.userId === myUserId) return;
        ctx.beginPath();
        ctx.arc(u.x * scaleX, u.y * scaleY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw local user
      if (myPosRef.current) {
        ctx.fillStyle = 'rgba(16, 185, 129, 1)'; // Bright green for me
        ctx.beginPath();
        ctx.arc(myPosRef.current.x * scaleX, myPosRef.current.y * scaleY, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [width, height, bgImage, elements, myUserId]);

  return (
    <div style={{
      width: '150px',
      height: '150px',
      background: 'rgba(0,0,0,0.5)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-sm)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <canvas
        ref={canvasRef}
        width={150}
        height={150}
        style={{ display: 'block' }}
      />
    </div>
  );
});
