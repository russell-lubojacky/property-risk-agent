# Property Risk Agent

Institutional-grade geospatial risk analysis for real estate. Property Risk Agent processes thousands of data points — flood plains, seismic activity, infrastructure integrity, and safety metrics — to deliver a single, auditable risk score for any US property.

## Features

- **Composite Risk Scoring** — Weighted score across four risk dimensions: flood, seismic, infrastructure, and safety
- **Detail Map View** — Interactive geospatial layers including flood zones, power grid stability, crime rates, and transportation hubs
- **AI-Generated Summaries** — Claude-powered property narratives and agent insights (wiring in progress)
- **Institutional Reporting** — Blueprint-style PDF export designed for due diligence workflows
- **Portfolio Management** — Save and track analyzed properties

## Tech Stack

- [SvelteKit 2](https://kit.svelte.dev/) + [Svelte 5](https://svelte.dev/)
- [`@sveltejs/adapter-node`](https://kit.svelte.dev/docs/adapter-node) for Node.js / VPS deployment
- [Vite 6](https://vitejs.dev/)
- CSS custom properties design system ("The Architectural Lens" theme)

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build for Production

```bash
npm run build
```

Output is written to `build/`. Run the server with:

```bash
node build/index.js
```

## Project Structure

```
src/
├── app.css                      # Design system — CSS custom properties, global utilities
├── app.html                     # HTML shell
├── lib/
│   └── components/
│       ├── NavBar.svelte        # Sticky glassmorphic navigation
│       ├── RiskScoreBadge.svelte # Animated SVG ring score badge
│       ├── RiskFactorRow.svelte  # Labelled progress bar row
│       └── IncidentTag.svelte   # Colour-coded incident pill
└── routes/
    ├── +layout.svelte           # Root layout (NavBar + slot)
    ├── +page.svelte             # Landing page
    ├── results/+page.svelte     # Results dashboard
    ├── map/+page.svelte         # Detail map view
    └── portfolio/+page.svelte   # Saved properties (placeholder)
```

## Deployment (Linode)

1. Build the project: `npm run build`
2. Copy the `build/` directory and `package.json` to your server
3. Install production dependencies: `npm install --omit=dev`
4. Run: `node build/index.js`

Use a process manager like [PM2](https://pm2.keymetrics.io/) to keep the server alive, and a reverse proxy (nginx) to handle HTTPS termination.

## Roadmap

- [ ] Wire address search to `POST /api/analyze` backend
- [ ] Stream Claude API responses into AI-Generated Property Summary
- [ ] Integrate Leaflet or Mapbox GL JS on the map canvas
- [ ] Implement portfolio persistence with a backend API
- [ ] PDF report generation endpoint
- [ ] Authentication
