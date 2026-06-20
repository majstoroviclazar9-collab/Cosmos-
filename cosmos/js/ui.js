// COSMOS — UI Manager

class UI {
  constructor(renderer) {
    this.renderer = renderer;
    this.panel = document.getElementById("info-panel");
    this.tooltip = document.getElementById("planet-tooltip");
    this.tipName = document.getElementById("tooltip-name");
    this.preview = document.getElementById("planet-preview");
    this.isOpen = false;
    this._setupEvents();
  }

  _setupEvents() {
    document.getElementById("close-panel").addEventListener("click", () => {
      this.hidePanel();
    });

    // Close on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") this.hidePanel();
    });
  }

  showPanel(planet) {
    // Fill content
    document.getElementById("panel-name").textContent = planet.name;
    document.getElementById("panel-description").textContent =
      planet.description;
    document.getElementById("stat-diameter").textContent =
      planet.stats.diameter;
    document.getElementById("stat-distance").textContent =
      planet.stats.distance;
    document.getElementById("stat-moons").textContent = planet.stats.moons;
    document.getElementById("stat-day").textContent = planet.stats.day;
    document.getElementById("stat-year").textContent = planet.stats.year;
    document.getElementById("stat-temp").textContent = planet.stats.temp;

    // Colour accent
    document.documentElement.style.setProperty("--planet-color", planet.color);

    // Draw preview
    this.renderer.drawPreview(this.preview, planet);

    this.panel.classList.add("open");
    this.isOpen = true;
  }

  hidePanel() {
    this.panel.classList.remove("open");
    this.isOpen = false;
  }

  showTooltip(planet, clientX, clientY) {
    this.tipName.textContent = planet.name.toUpperCase();
    this.tooltip.style.left = clientX + 18 + "px";
    this.tooltip.style.top = clientY - 14 + "px";
    this.tooltip.classList.add("visible");
  }

  hideTooltip() {
    this.tooltip.classList.remove("visible");
  }
}
