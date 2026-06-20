// COSMOS — Renderer

class Renderer {
  constructor() {
    this.speedMultiplier = 1;
  }

  // Helpers

  _lighten(hex, amt) {
    const n = parseInt(hex.replace("#", ""), 16);
    return `rgb(${Math.min(255, (n >> 16) + amt)},${Math.min(255, ((n >> 8) & 0xff) + amt)},${Math.min(255, (n & 0xff) + amt)})`;
  }

  _darken(hex, amt) {
    const n = parseInt(hex.replace("#", ""), 16);
    return `rgb(${Math.max(0, (n >> 16) - amt)},${Math.max(0, ((n >> 8) & 0xff) - amt)},${Math.max(0, (n & 0xff) - amt)})`;
  }

  // Sun

  drawSun(ctx, cx, cy, scale, time) {
    const r = SUN.radius * scale;

    // Pulsing outer corona rings
    const pulse = Math.sin(time * 0.0008) * 0.5 + 0.5;
    for (let i = 6; i >= 1; i--) {
      const rOuter = r * (1 + i * 0.7 + pulse * 0.15);
      const alpha = (0.025 / i) * (1 + pulse * 0.3);
      const g = ctx.createRadialGradient(cx, cy, r, cx, cy, rOuter);
      g.addColorStop(0, `rgba(255,200,50,${alpha})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
      ctx.fill();
    }

    // Body gradient
    const body = ctx.createRadialGradient(
      cx - r * 0.28,
      cy - r * 0.28,
      0,
      cx,
      cy,
      r,
    );
    body.addColorStop(0, "#fffde0");
    body.addColorStop(0.3, "#ffe050");
    body.addColorStop(0.7, "#ff9000");
    body.addColorStop(1, "#cc3a00");
    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Highlight
    ctx.fillStyle = "rgba(255,255,220,0.12)";
    ctx.beginPath();
    ctx.arc(cx - r * 0.22, cy - r * 0.28, r * 0.52, 0, Math.PI * 2);
    ctx.fill();
  }

  // Orbit

  drawOrbits(ctx, cx, cy, scale) {
    ctx.save();
    ctx.setLineDash([4, 8]);
    ctx.lineWidth = 0.8;
    for (const p of PLANETS) {
      ctx.strokeStyle = "rgba(201,168,76,0.13)";
      ctx.beginPath();
      ctx.arc(cx, cy, p.orbitRadius * scale, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  // Planets

  drawPlanet(ctx, planet, cx, cy, scale, time) {
    const angle =
      planet.angle + time * planet.speed * 0.001 * this.speedMultiplier;
    const orb = planet.orbitRadius * scale;
    const r = planet.radius * scale;
    const x = cx + Math.cos(angle) * orb;
    const y = cy + Math.sin(angle) * orb;

    // Store for hit testing
    planet._x = x;
    planet._y = y;
    planet._r = r;

    // Ambient glow
    const gGlow = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 3.5);
    gGlow.addColorStop(0, planet.glowColor);
    gGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = gGlow;
    ctx.beginPath();
    ctx.arc(x, y, r * 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Saturn back ring
    if (planet.hasRings) this._drawRings(ctx, x, y, r, false);

    // Body
    const gBody = ctx.createRadialGradient(
      x - r * 0.32,
      y - r * 0.32,
      0,
      x,
      y,
      r,
    );
    gBody.addColorStop(0, this._lighten(planet.color, 55));
    gBody.addColorStop(0.55, planet.color);
    gBody.addColorStop(1, this._darken(planet.color, 50));
    ctx.fillStyle = gBody;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Special surface details
    this._drawSurface(ctx, planet, x, y, r, time);

    // Saturn front ring
    if (planet.hasRings) this._drawRings(ctx, x, y, r, true);

    // Moon
    if (planet.hasMoon) this._drawMoon(ctx, x, y, r, time);
  }

  _drawSurface(ctx, planet, x, y, r, time) {
    if (planet.id === "earth") {
      // Cloud swirl
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(x - r * 0.1, y - r * 0.2, r * 0.65, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    if (planet.id === "jupiter") {
      // Bands
      ctx.save();
      ctx.globalCompositeOperation = "overlay";
      for (let b = 0; b < 5; b++) {
        const by = y - r + (r * 2 * b) / 4;
        const bh = r * 0.3;
        const bAlpha = 0.12 + (b % 2) * 0.08;
        ctx.fillStyle = `rgba(${b % 2 === 0 ? "200,140,60" : "180,100,40"},${bAlpha})`;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillRect(x - r, by, r * 2, bh);
        ctx.restore();
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();
    }

    if (planet.id === "saturn") {
      // Bands
      ctx.save();
      ctx.globalCompositeOperation = "overlay";
      for (let b = 0; b < 4; b++) {
        const by = y - r + (r * 2 * b) / 3;
        const bAlpha = 0.1 + (b % 2) * 0.08;
        ctx.fillStyle = `rgba(${b % 2 === 0 ? "200,180,80" : "160,140,40"},${bAlpha})`;
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillRect(x - r, by, r * 2, r * 0.5);
        ctx.restore();
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.restore();
    }
  }

  _drawRings(ctx, x, y, r, frontHalf) {
    const rInner = r * 1.38;
    const rOuter = r * 2.25;
    const yFlatten = 0.32;

    ctx.save();
    ctx.beginPath();
    const ry = rOuter * yFlatten + 4;
    if (frontHalf) {
      ctx.rect(x - rOuter - 4, y, (rOuter + 4) * 2, ry + 4);
    } else {
      ctx.rect(x - rOuter - 4, y - ry - 4, (rOuter + 4) * 2, ry + 4);
    }
    ctx.clip();

    // Multiple ring bands for detail
    const bands = [
      { ri: rInner, ro: rInner + (rOuter - rInner) * 0.2, alpha: 0.55 },
      {
        ri: rInner + (rOuter - rInner) * 0.22,
        ro: rInner + (rOuter - rInner) * 0.45,
        alpha: 0.35,
      },
      {
        ri: rInner + (rOuter - rInner) * 0.47,
        ro: rInner + (rOuter - rInner) * 0.72,
        alpha: 0.65,
      },
      { ri: rInner + (rOuter - rInner) * 0.74, ro: rOuter, alpha: 0.4 },
    ];

    for (const band of bands) {
      const g = ctx.createRadialGradient(x, y, band.ri, x, y, band.ro);
      g.addColorStop(0, `rgba(220,200,140,${band.alpha})`);
      g.addColorStop(0.5, `rgba(190,170,100,${band.alpha * 0.7})`);
      g.addColorStop(1, `rgba(210,195,130,${band.alpha})`);
      ctx.beginPath();
      ctx.ellipse(x, y, band.ro, band.ro * yFlatten, 0, 0, Math.PI * 2, false);
      ctx.ellipse(x, y, band.ri, band.ri * yFlatten, 0, Math.PI * 2, 0, true);
      ctx.fillStyle = g;
      ctx.fill("evenodd");
    }

    ctx.restore();
  }

  _drawMoon(ctx, px, py, pr, time) {
    const mAngle = time * 0.005 * this.speedMultiplier;
    const mOrbit = pr * 2.6;
    const mx = px + Math.cos(mAngle) * mOrbit;
    const my = py + Math.sin(mAngle) * mOrbit;
    const mr = Math.max(1.5, pr * 0.28);

    const g = ctx.createRadialGradient(
      mx - mr * 0.2,
      my - mr * 0.2,
      0,
      mx,
      my,
      mr,
    );
    g.addColorStop(0, "#ddd");
    g.addColorStop(1, "#666");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();
  }

  // Hit Detection

  getPlanetAt(mx, my) {
    for (let i = PLANETS.length - 1; i >= 0; i--) {
      const p = PLANETS[i];
      if (p._x === undefined) continue;
      const dx = mx - p._x;
      const dy = my - p._y;
      const hitR = Math.max(p._r + 6, 14);
      if (dx * dx + dy * dy <= hitR * hitR) return p;
    }
    return null;
  }

  // Planet preview for panel

  drawPreview(canvas, planet) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Dark background
    ctx.fillStyle = "#010508";
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const r = 38;

    // Glow
    const g = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 2.5);
    g.addColorStop(0, planet.glowColor);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Back ring
    if (planet.hasRings) this._drawRings(ctx, cx, cy, r, false);

    // Body
    const gb = ctx.createRadialGradient(
      cx - r * 0.3,
      cy - r * 0.3,
      0,
      cx,
      cy,
      r,
    );
    gb.addColorStop(0, this._lighten(planet.color, 55));
    gb.addColorStop(0.55, planet.color);
    gb.addColorStop(1, this._darken(planet.color, 50));
    ctx.fillStyle = gb;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Earth clouds
    if (planet.id === "earth") {
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.beginPath();
      ctx.arc(cx - r * 0.1, cy - r * 0.2, r * 0.65, 0, Math.PI * 2);
      ctx.fill();
    }

    // Front ring
    if (planet.hasRings) this._drawRings(ctx, cx, cy, r, true);
  }
}
