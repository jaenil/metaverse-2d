const TILE = 44;

export function drawPixelAvatar(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  walkCycle: number,
  vx: number,
  facing: number,
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

  // Drop Shadow (Grounded)
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(cx, cy + S * 1.5, S * 1.4, S * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  
  // Move to center of avatar base
  ctx.translate(cx, cy);

  // Momentum tilt (max +/- 0.15 rads)
  const tilt = Math.max(-0.15, Math.min(0.15, vx * 0.4));
  ctx.rotate(tilt);
  
  // Directional facing
  ctx.scale(facing, 1);

  let topY = -S * 2.0 + bob;

  if (img && img.complete && img.naturalHeight !== 0) {
    // Draw image sprite instead of block character
    const spriteW = TILE * 1.2;
    const spriteH = TILE * 1.2;
    const drawY = -spriteH + bob + S * 0.5;
    ctx.drawImage(img, -spriteW / 2, drawY, spriteW, spriteH);
    topY = drawY;
  } else {
    // Fallback: draw blocky character relative to 0,0
    const headW = S * 1.6;
    const headH = S * 1.4;
    const headX = -headW / 2;
    const headY = -S * 2.0 + bob;

    const bodyW = S * 1.2;
    const bodyH = S * 1.4;
    const bodyX = -bodyW / 2;
    const bodyY = headY + headH;
    const legY = bodyY + bodyH;
    const legH = S * 0.85;

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

    ctx.fillStyle = '#1c1311'; // darker legs
    ctx.fillRect(Math.round(bodyX), Math.round(legY - leg1Bob), Math.round(legW), Math.round(legH));
    ctx.fillRect(Math.round(bodyX + bodyW - legW), Math.round(legY - leg2Bob), Math.round(legW), Math.round(legH));
    
    topY = headY;
  }

  ctx.restore();

  // Label tag (UI elements remain un-rotated and un-flipped)
  const tagY = cy + topY - 14;
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
