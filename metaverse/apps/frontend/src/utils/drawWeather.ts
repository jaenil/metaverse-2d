export interface WeatherParticle {
  x: number; y: number; vx: number; vy: number; type: 'rain' | 'snow'; life: number;
}

const MAX_WEATHER = 200;

export function updateAndDrawWeather(
  ctx: CanvasRenderingContext2D,
  weatherParticles: WeatherParticle[],
  weather: 'none' | 'rain' | 'snow',
  dt: number,
  camX: number,
  camY: number,
  sw: number,
  sh: number
) {
  // Spawn new particles
  if (weather === 'rain' && weatherParticles.length < MAX_WEATHER) {
    for (let i = 0; i < 5; i++) {
      weatherParticles.push({
        x: -camX + Math.random() * sw * 1.5 - sw * 0.25,
        y: -camY - 50 - Math.random() * 200,
        vx: 80 + Math.random() * 40,
        vy: 600 + Math.random() * 200,
        type: 'rain',
        life: 1
      });
    }
  } else if (weather === 'snow' && weatherParticles.length < MAX_WEATHER) {
    for (let i = 0; i < 2; i++) {
      weatherParticles.push({
        x: -camX + Math.random() * sw * 1.5 - sw * 0.25,
        y: -camY - 50 - Math.random() * 200,
        vx: Math.random() * 20 - 10,
        vy: 80 + Math.random() * 60,
        type: 'snow',
        life: Math.random() * Math.PI * 2
      });
    }
  }

  // Draw and update
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  for (let i = weatherParticles.length - 1; i >= 0; i--) {
    const wp = weatherParticles[i]!;
    wp.x += wp.vx * dt;
    wp.y += wp.vy * dt;
    
    if (wp.type === 'snow') {
      wp.life += dt * 2;
      wp.x += Math.sin(wp.life) * 30 * dt;
    }

    if (wp.y > -camY + sh + 50 || wp.x < -camX - 100 || wp.x > -camX + sw + 100 || weather === 'none') {
      // PERF-03: Use pop instead of splice for O(1) removal
      weatherParticles[i] = weatherParticles[weatherParticles.length - 1];
      weatherParticles.pop();
      continue;
    }

    if (wp.type === 'rain') {
      ctx.strokeStyle = 'rgba(150, 200, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(wp.x, wp.y);
      ctx.lineTo(wp.x - wp.vx * 0.05, wp.y - wp.vy * 0.05);
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(wp.x, wp.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
