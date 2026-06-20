# COSMOS

An interactive, animated solar system explorer built with the HTML Canvas API and plain JavaScript. COSMOS renders the Sun, eight orbiting planets, a twinkling starfield, and an asteroid belt in a cinematic, responsive interface.

> The visualization is stylized for clarity and is not drawn to scale.

## Features

- Animated orbits for all eight planets
- Layered, twinkling starfield and moving asteroid belt
- Scroll-wheel zoom with automatic viewport fitting
- Adjustable orbital speed and simulated-year counter
- Hover labels and click-to-open planet details
- Planet facts including size, distance, moons, day, year, and temperature
- Custom Canvas rendering for planetary shading, Saturn's rings, and Earth's Moon
- No framework, package manager, or build step

## Run locally

You can open `index.html` directly in a modern browser, or serve the folder locally for the most consistent experience:

```bash
python -m http.server 8000
```

Then visit [http://localhost:8000](http://localhost:8000).

The interface uses Google Fonts, so an internet connection is needed for the intended typography. The application itself has no runtime dependencies.

## Controls

| Action | Control |
| --- | --- |
| Zoom | Scroll over the solar system |
| Inspect a planet | Hover over it |
| Open planet details | Click a planet or its name in the left navigation |
| Change orbital speed | Use the slider or `−` / `+` buttons |
| Close planet details | Click `×` or press `Esc` |

## Project structure

```text
cosmos/
├── index.html          # Page structure and planet navigation
├── css/
│   └── style.css       # Layout, typography, panels, and controls
└── js/
    ├── data.js         # Planet, Sun, and asteroid-belt data
    ├── starfield.js    # Stars and asteroid rendering
    ├── renderer.js     # Sun, orbit, planet, ring, and preview rendering
    ├── ui.js           # Tooltip and planet-detail panel behavior
    └── app.js          # Animation loop, zoom, input, and simulation state
```

## Customize

Planet facts, colors, sizes, orbit radii, and relative speeds live in `js/data.js`. Visual styling and the shared color palette are defined in `css/style.css`, while Canvas drawing behavior can be adjusted in `js/renderer.js` and `js/starfield.js`.

When adding a planet, follow the existing object shape in the `PLANETS` array. The navigation, orbit path, animation, hover detection, and information panel will use the new data automatically.

## Built with

- HTML5
- CSS3
- Vanilla JavaScript
- Canvas 2D API
