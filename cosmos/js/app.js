// COSMOS — Main Application

(function () {
  const canvas = document.getElementById("cosmos-canvas");
  const ctx = canvas.getContext("2d");

  const starfield = new Starfield();
  const renderer = new Renderer();
  const ui = new UI(renderer);

  let cx = 0,
    cy = 0,
    scale = 1;
  let time = 0;
  let lastTs = null;
  let mouse = { x: -9999, y: -9999 };
  let hovered = null;

  // Speed control

  const slider = document.getElementById("speed-slider");
  const speedLabel = document.getElementById("speed-value");
  const btnDown = document.getElementById("btn-slower");
  const btnUp = document.getElementById("btn-faster");
  const simYearEl = document.getElementById("sim-year");

  function sliderToMult(v) {
    // Logarithmic: 0 → 0.02×, 40 → 1×, 100 → 25×
    return Math.pow(10, (parseFloat(v) - 40) / 30);
  }

  function updateSpeedUI() {
    const m = sliderToMult(slider.value);
    renderer.speedMultiplier = m;
    if (m < 1) {
      speedLabel.textContent = m.toFixed(2) + "×";
    } else if (m < 10) {
      speedLabel.textContent = m.toFixed(1) + "×";
    } else {
      speedLabel.textContent = Math.round(m) + "×";
    }
  }

  slider.addEventListener("input", updateSpeedUI);
  btnDown.addEventListener("click", () => {
    slider.value = Math.max(0, parseFloat(slider.value) - 8);
    updateSpeedUI();
  });
  btnUp.addEventListener("click", () => {
    slider.value = Math.min(100, parseFloat(slider.value) + 8);
    updateSpeedUI();
  });
  updateSpeedUI();

  // Zoom
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      scale = Math.max(
        0.35,
        Math.min(2.8, scale * (e.deltaY > 0 ? 0.92 : 1.09)),
      );
    },
    { passive: false },
  );

  // Mouse interactions

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    hovered = renderer.getPlanetAt(mouse.x, mouse.y);
    if (hovered) {
      canvas.style.cursor = "pointer";
      ui.showTooltip(hovered, e.clientX, e.clientY);
    } else {
      canvas.style.cursor = "default";
      ui.hideTooltip();
    }
  });

  canvas.addEventListener("mouseleave", () => {
    hovered = null;
    ui.hideTooltip();
    canvas.style.cursor = "default";
  });

  canvas.addEventListener("click", () => {
    if (hovered) ui.showPanel(hovered);
  });

  // Nav sidebar clicks
  document.addEventListener("cosmos:selectPlanet", (e) => {
    ui.showPanel(e.detail);
  });

  // Resize

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    cx = w / 2;
    cy = h / 2;

    if (starfield.initialized) {
      starfield.resize(w, h);
    } else {
      starfield.init(w, h);
    }

    // Auto-fit solar system to viewport
    const minDim = Math.min(w, h);
    scale = minDim / 1340;
  }

  window.addEventListener("resize", resize);
  resize();

  // Sim year tracking
  // Earth base: speed 1.0, coefficient 0.001 rad/ms → period = 2π/0.001 = 6283ms at speed=1
  const EARTH_PERIOD_BASE = (Math.PI * 2) / 0.001; // ms at speedMult=1

  // Main loop

  function loop(ts) {
    const delta = lastTs ? Math.min(ts - lastTs, 100) : 16;
    lastTs = ts;

    // Advance time (already speed-scaled via renderer.speedMultiplier usage in drawPlanet)
    // Drive time at real ms; each planet uses its own speed factor
    time += delta;

    // Update sim year label (based on Earth's orbit progress)
    const earthAngle =
      PLANETS[2].angle +
      time * PLANETS[2].speed * 0.001 * renderer.speedMultiplier;
    const simYears = (earthAngle - PLANETS[2].angle) / (Math.PI * 2);
    simYearEl.textContent = "Year " + Math.abs(simYears).toFixed(1);

    // Clear
    ctx.fillStyle = "#010508";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Stars
    starfield.drawStars(ctx, time);

    // Orbit paths
    renderer.drawOrbits(ctx, cx, cy, scale);

    // Asteroid belt
    starfield.drawAsteroids(ctx, time, cx, cy, scale);

    // Sun
    renderer.drawSun(ctx, cx, cy, scale, time);

    // Planets
    for (const planet of PLANETS) {
      renderer.drawPlanet(ctx, planet, cx, cy, scale, time);
    }

    // Hover highlight ring
    if (hovered && hovered._x !== undefined) {
      ctx.save();
      ctx.strokeStyle = "rgba(201,168,76,0.7)";
      ctx.lineWidth = 1;
      ctx.shadowColor = "rgba(201,168,76,0.8)";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(hovered._x, hovered._y, hovered._r + 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

  // Intro fade
  const app = document.getElementById("app");
  app.style.opacity = "0";
  setTimeout(() => {
    app.style.transition = "opacity 1.5s ease";
    app.style.opacity = "1";
  }, 100);
})();
