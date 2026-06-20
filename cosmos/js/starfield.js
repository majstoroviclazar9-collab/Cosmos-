// COSMOS — Starfield

class Starfield {
  constructor() {
    this.layers = [];
    this.asteroids = [];
    this.initialized = false;
    this.width = 0;
    this.height = 0;
  }

  init(width, height) {
    this.width = width;
    this.height = height;
    this.layers = [
      this._generateLayer(width, height, 350, 0.3, 0.8),
      this._generateLayer(width, height, 200, 0.5, 1.4),
      this._generateLayer(width, height, 80, 0.7, 2.0),
    ];
    this.asteroids = this._generateAsteroids();
    this.initialized = true;
  }

  _generateLayer(width, height, count, minBrightness, maxRadius) {
    const stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * maxRadius + 0.2,
        brightness: Math.random() * (1 - minBrightness) + minBrightness,
        twinkleSpeed: Math.random() * 0.015 + 0.003,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
    return stars;
  }

  _generateAsteroids() {
    const belt = [];
    for (let i = 0; i < ASTEROID_BELT.count; i++) {
      const spread = ASTEROID_BELT.outerRadius - ASTEROID_BELT.innerRadius;
      belt.push({
        angle: Math.random() * Math.PI * 2,
        r: ASTEROID_BELT.innerRadius + Math.random() * spread,
        speed: 0.00006 + Math.random() * 0.00005,
        size: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.35 + 0.15,
      });
    }
    return belt;
  }

  resize(width, height) {
    if (!this.initialized) {
      this.init(width, height);
      return;
    }
    const scaleX = width / this.width;
    const scaleY = height / this.height;
    for (const layer of this.layers) {
      for (const s of layer) {
        s.x *= scaleX;
        s.y *= scaleY;
      }
    }
    this.width = width;
    this.height = height;
  }

  drawStars(ctx, time) {
    for (const layer of this.layers) {
      for (const star of layer) {
        const twinkle =
          Math.sin(time * star.twinkleSpeed + star.twinklePhase) * 0.25 + 0.75;
        const alpha = star.brightness * twinkle;
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawAsteroids(ctx, time, cx, cy, scale) {
    for (const a of this.asteroids) {
      const angle = a.angle + time * a.speed;
      const x = cx + Math.cos(angle) * a.r * scale;
      const y = cy + Math.sin(angle) * a.r * scale;
      ctx.fillStyle = `rgba(165,155,130,${a.alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, a.size * Math.max(0.5, scale * 0.7), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
