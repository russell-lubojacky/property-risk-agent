<script>
  // Detail Map View — Property Risk Agent
  // Corresponds to "Detail Map View - Property Risk Agent" Stitch screen
  // Property: 2401 Westheimer Rd, Houston, TX 77098 · Risk Score 82/100

  import RiskScoreBadge from '$lib/components/RiskScoreBadge.svelte';

  // TODO: Integrate a real map library here.
  // Recommended options for Linode deployment:
  //   - Leaflet (open source, no API key needed with OpenStreetMap tiles)
  //     npm install leaflet
  //   - Mapbox GL JS (richer styling, requires API key)
  //     npm install mapbox-gl
  // The `.map-canvas` div below is the mount point.

  const property = {
    address: '2401 Westheimer Rd',
    city: 'Houston, TX 77098',
    neighborhood: 'River Oaks District',
    riskScore: 82,
    insuranceTier: 'C4',
    floodZone: 'Zone AE',
    floodNote: 'Base flood elevation exceeds local street grade by 1.2 ft',
    gridStatus: 'Dual-redundancy connections — Grid Resilience: High',
  };

  let searchQuery = '';

  // Layer toggle state
  // TODO: wire these toggles to map layer visibility
  let layers = [
    { id: 'flood',       label: 'Flood Zones',          icon: '🌊', active: true },
    { id: 'power',       label: 'Power Grid Stability', icon: '⚡', active: false },
    { id: 'crime',       label: 'Crime Rates',          icon: '🔒', active: false },
    { id: 'transit',     label: 'Transportation Hubs',  icon: '🚌', active: false },
  ];

  function toggleLayer(id) {
    layers = layers.map(l => l.id === id ? { ...l, active: !l.active } : l);
  }

  const nearbyProps = [
    { address: '2399 Westheimer Rd', score: 74, distance: '0.05 mi' },
    { address: '2410 Westheimer Rd', score: 81, distance: '0.08 mi' },
    { address: '2450 Westheimer Rd', score: 65, distance: '0.3 mi' },
  ];

  function scoreColor(s) {
    return s >= 75 ? 'var(--error)' : s >= 50 ? '#c97b00' : 'var(--tertiary)';
  }
</script>

<svelte:head>
  <title>Map View — {property.address} — Property Risk Agent</title>
</svelte:head>

<div class="map-page">

  <!-- ============================================================
       LEFT SIDEBAR — Layer controls + property info
       ============================================================ -->
  <aside class="map-sidebar">

    <!-- Search + Filter -->
    <div class="sidebar-search-row">
      <div class="sidebar-search-wrap">
        <svg class="sidebar-search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          class="sidebar-search-input"
          placeholder="Search address…"
          bind:value={searchQuery}
          aria-label="Search address"
        />
      </div>
      <button class="sidebar-filter-btn" type="button" aria-label="Filter layers">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
      </button>
    </div>

    <!-- Property Info -->
    <section class="sidebar-card">
      <div class="map-sidebar__address-block">
        <a href="/results" class="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Results
        </a>
        <h1 class="map-sidebar__address">{property.address}</h1>
        <p class="map-sidebar__city">{property.city}</p>
        <p class="map-sidebar__neighborhood data-label">{property.neighborhood}</p>
      </div>

      <div class="map-sidebar__score-row">
        <RiskScoreBadge score={property.riskScore} size="md" label="Risk Score" />
        <div class="insurance-tier">
          <span class="data-label">Insurance Tier</span>
          <span class="insurance-tier__value">{property.insuranceTier}</span>
        </div>
      </div>
    </section>

    <!-- Layer Toggles -->
    <section class="sidebar-card">
      <h2 class="sidebar-card__title">Geospatial Layers</h2>
      <div class="layer-list">
        {#each layers as layer}
          <button
            class="layer-toggle"
            class:layer-toggle--active={layer.active}
            type="button"
            on:click={() => toggleLayer(layer.id)}
            aria-pressed={layer.active}
          >
            <span class="layer-toggle__icon" aria-hidden="true">{layer.icon}</span>
            <span class="layer-toggle__label">{layer.label}</span>
            <span class="layer-toggle__pip" aria-hidden="true"></span>
          </button>
        {/each}
      </div>
    </section>

    <!-- Risk Legend -->
    <section class="sidebar-card">
      <h2 class="sidebar-card__title">Risk Legend</h2>
      <div class="legend-list">
        <div class="legend-item legend-item--optimal">
          <span class="legend-dot legend-dot--optimal"></span>
          <span class="legend-label">Optimal</span>
          <span class="legend-range data-label">0 – 40</span>
        </div>
        <div class="legend-item legend-item--moderate">
          <span class="legend-dot legend-dot--moderate"></span>
          <span class="legend-label">Moderate</span>
          <span class="legend-range data-label">41 – 70</span>
        </div>
        <div class="legend-item legend-item--critical">
          <span class="legend-dot legend-dot--critical"></span>
          <span class="legend-label">Critical</span>
          <span class="legend-range data-label">71 – 100</span>
        </div>
      </div>
      <hr class="legend-divider" />
      <div class="legend-overlay-list">
        <div class="legend-overlay-item">
          <span class="legend-overlay-swatch legend-overlay-swatch--flood"></span>
          <span class="legend-label">100-Year Floodplain</span>
        </div>
        <div class="legend-overlay-item">
          <span class="legend-overlay-swatch legend-overlay-swatch--infra"></span>
          <span class="legend-label">Critical Infrastructure Hub</span>
        </div>
      </div>
      <button class="legend-pdf-btn" type="button">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
          <polyline points="10 9 9 9 8 9"/>
        </svg>
        GENERATE PDF REPORT
      </button>
    </section>

    <!-- Quick Summary -->
    <section class="sidebar-card">
      <h2 class="sidebar-card__title">Quick Summary</h2>

      <div class="highlight-item highlight-item--high">
        <span class="data-label highlight-item__cat">Flood</span>
        <p class="highlight-item__note">{property.floodZone} — {property.floodNote}</p>
      </div>

      <div class="highlight-item highlight-item--low">
        <span class="data-label highlight-item__cat">Grid</span>
        <p class="highlight-item__note">{property.gridStatus}</p>
      </div>
    </section>

    <!-- Nearby Properties -->
    <section class="sidebar-card">
      <h2 class="sidebar-card__title">Nearby Properties</h2>
      <div class="nearby-list">
        {#each nearbyProps as p}
          <div class="nearby-item">
            <div class="nearby-item__body">
              <span class="nearby-item__addr">{p.address}</span>
              <span class="nearby-item__dist data-label">{p.distance}</span>
            </div>
            <span class="nearby-item__score" style="color: {scoreColor(p.score)};">{p.score}</span>
          </div>
        {/each}
      </div>
    </section>

  </aside>

  <!-- ============================================================
       MAP CANVAS
       ============================================================ -->
  <div class="map-area">
    <!--
      MAP MOUNT POINT
      When integrating a map library, mount it on this element.
      Example (Leaflet):
        import { onMount } from 'svelte';
        import L from 'leaflet';
        let mapEl;
        onMount(() => {
          const map = L.map(mapEl).setView([29.7383, -95.4166], 15);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
        });
    -->
    <div class="map-canvas map-grid-overlay" role="img" aria-label="Property risk map — {property.address}">

      <!-- Decorative flood zone overlay (replace with real GeoJSON layer) -->
      <div class="flood-zone-overlay" aria-hidden="true"></div>

      <!-- Property pin -->
      <div class="map-pin" aria-hidden="true">
        <div class="map-pin__ring"></div>
        <svg width="36" height="46" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 0C8.059 0 0 8.059 0 18c0 12.375 18 28 18 28S36 30.375 36 18C36 8.059 27.941 0 18 0Z" fill="var(--error)"/>
          <circle cx="18" cy="18" r="8" fill="white"/>
          <text x="18" y="22" text-anchor="middle" font-size="10" font-weight="700" fill="var(--error)" font-family="Inter, sans-serif">82</text>
        </svg>
      </div>

      <!-- Floating Glass Panel — Property Detail -->
      <div class="map-detail-panel glass-panel">
        <div class="map-detail-panel__header">
          <div>
            <p class="data-label">Selected Property</p>
            <p class="map-detail-panel__address">{property.address}</p>
            <p class="map-detail-panel__city">{property.city}</p>
          </div>
          <RiskScoreBadge score={property.riskScore} size="sm" label="" />
        </div>

        <div class="map-detail-panel__tags">
          <span class="map-detail-tag map-detail-tag--high">⚠ Zone AE Flood</span>
          <span class="map-detail-tag map-detail-tag--low">✓ Grid Resilient</span>
        </div>

        <div class="map-detail-panel__actions">
          <a href="/results" class="btn-primary map-detail-btn">Full Report</a>
          <button class="btn-secondary map-detail-btn" type="button">Add to Portfolio</button>
        </div>
      </div>

      <!-- Map controls -->
      <div class="map-controls" aria-label="Map controls">
        <button class="map-control-btn" type="button" title="Zoom in" aria-label="Zoom in">+</button>
        <button class="map-control-btn" type="button" title="Zoom out" aria-label="Zoom out">−</button>
        <hr class="map-control-sep" />
        <button class="map-control-btn" type="button" title="My location" aria-label="Center on my location">◎</button>
      </div>

      <!-- Attribution placeholder -->
      <div class="map-attribution" aria-label="Map attribution">
        Map tiles — connect your provider (OpenStreetMap / Mapbox)
      </div>
    </div>
  </div>

</div>

<style>
  .map-page {
    display: grid;
    grid-template-columns: 300px 1fr;
    height: calc(100vh - 64px);
    overflow: hidden;
    background: var(--surface);
  }

  /* ---- Sidebar ---- */
  .map-sidebar {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--surface-low);
    overflow-y: auto;
    border-right: 1px solid rgba(194, 198, 216, 0.10);
  }

  .sidebar-card {
    background: var(--surface-lowest);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    box-shadow: var(--shadow-card);
  }

  .sidebar-card__title {
    font-size: var(--text-title-sm);
    font-weight: 600;
    color: var(--on-surface);
  }

  /* Sidebar search */
  .sidebar-search-row {
    display: flex;
    gap: var(--space-2);
    padding: 0 var(--space-1);
  }

  .sidebar-search-wrap {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
  }

  .sidebar-search-icon {
    position: absolute;
    left: 0.625rem;
    color: var(--outline);
    pointer-events: none;
  }

  .sidebar-search-input {
    width: 100%;
    padding: 0.5rem 0.75rem 0.5rem 2rem;
    border-radius: var(--radius-md);
    background: var(--surface-lowest);
    border: 1px solid rgba(194, 198, 216, 0.20);
    font-family: var(--font-family);
    font-size: var(--text-body-sm);
    color: var(--on-surface);
    transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  }

  .sidebar-search-input::placeholder { color: var(--outline); }
  .sidebar-search-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(0, 80, 203, 0.15);
  }

  .sidebar-filter-btn {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: var(--surface-lowest);
    border: 1px solid rgba(194, 198, 216, 0.20);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--on-surface-variant);
    cursor: pointer;
    flex-shrink: 0;
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .sidebar-filter-btn:hover {
    background: var(--surface-highest);
    color: var(--on-surface);
  }

  .map-sidebar__neighborhood {
    margin-top: var(--space-1);
    color: var(--primary);
  }

  /* Legend */
  .legend-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
  }

  .legend-item--optimal  { background: var(--tertiary-container); }
  .legend-item--moderate { background: rgba(201, 123, 0, 0.10); }
  .legend-item--critical { background: var(--error-container); }

  .legend-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .legend-dot--optimal  { background: var(--tertiary); }
  .legend-dot--moderate { background: #c97b00; }
  .legend-dot--critical { background: var(--error); }

  .legend-label {
    flex: 1;
    font-size: var(--text-body-sm);
    font-weight: 500;
    color: var(--on-surface);
  }

  .legend-range { color: var(--on-surface-variant); }

  .legend-divider {
    border: none;
    border-top: 1px solid rgba(194, 198, 216, 0.12);
    margin: var(--space-1) 0;
  }

  .legend-overlay-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .legend-overlay-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .legend-overlay-swatch {
    width: 24px;
    height: 10px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .legend-overlay-swatch--flood { background: rgba(0, 80, 203, 0.25); border: 1px solid rgba(0, 80, 203, 0.4); }
  .legend-overlay-swatch--infra { background: rgba(0, 95, 137, 0.25); border: 1px solid rgba(0, 95, 137, 0.4); }

  .legend-pdf-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    background: var(--primary);
    color: white;
    font-size: var(--text-label-sm);
    font-weight: 700;
    letter-spacing: 0.06em;
    border: none;
    cursor: pointer;
    transition: opacity var(--transition-fast);
    margin-top: var(--space-1);
  }

  .legend-pdf-btn:hover { opacity: 0.88; }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-body-sm);
    color: var(--primary);
    margin-bottom: var(--space-2);
    transition: opacity var(--transition-fast);
  }
  .back-link:hover { opacity: 0.75; }

  .map-sidebar__address {
    font-size: var(--text-title-md);
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--on-surface);
    margin-bottom: var(--space-1);
  }

  .map-sidebar__city {
    font-size: var(--text-body-sm);
    color: var(--on-surface-variant);
  }

  .map-sidebar__score-row {
    display: flex;
    align-items: center;
    gap: var(--space-6);
  }

  .insurance-tier {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .insurance-tier__value {
    font-size: var(--text-headline-sm);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--error);
  }

  /* Layer toggles */
  .layer-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .layer-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    background: var(--surface-low);
    color: var(--on-surface-variant);
    font-size: var(--text-body-sm);
    font-family: var(--font-family);
    font-weight: 500;
    transition: background var(--transition-fast), color var(--transition-fast);
    text-align: left;
    width: 100%;
  }

  .layer-toggle:hover {
    background: var(--surface-highest);
    color: var(--on-surface);
  }

  .layer-toggle--active {
    background: var(--secondary-container);
    color: var(--on-surface);
  }

  .layer-toggle__icon { font-size: 1rem; }

  .layer-toggle__label { flex: 1; }

  .layer-toggle__pip {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--outline-variant);
    transition: background var(--transition-fast);
    flex-shrink: 0;
  }

  .layer-toggle--active .layer-toggle__pip {
    background: var(--primary);
  }

  /* Highlights */
  .highlight-item {
    padding: var(--space-3);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .highlight-item--high { background: var(--error-container); }
  .highlight-item--low  { background: var(--tertiary-container); }

  .highlight-item__cat {
    color: var(--on-surface-variant);
  }

  .highlight-item--high .highlight-item__cat { color: var(--error); }
  .highlight-item--low  .highlight-item__cat { color: var(--tertiary); }

  .highlight-item__note {
    font-size: var(--text-body-sm);
    color: var(--on-surface);
    line-height: 1.5;
  }

  /* Nearby */
  .nearby-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .nearby-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-2) var(--space-3);
    border-radius: var(--radius-md);
    background: var(--surface-low);
    transition: background var(--transition-fast);
  }

  .nearby-item:hover { background: var(--surface-highest); }

  .nearby-item__body {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .nearby-item__addr {
    font-size: var(--text-body-sm);
    font-weight: 500;
    color: var(--on-surface);
  }

  .nearby-item__dist { color: var(--on-surface-variant); }

  .nearby-item__score {
    font-size: var(--text-title-sm);
    font-weight: 700;
    letter-spacing: -0.01em;
    flex-shrink: 0;
  }

  /* ---- Map area ---- */
  .map-area {
    position: relative;
    flex: 1;
    overflow: hidden;
  }

  .map-canvas {
    width: 100%;
    height: 100%;
    background: var(--surface-high);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Flood zone decorative overlay */
  .flood-zone-overlay {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 60% 45% at 50% 55%, rgba(0, 80, 203, 0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  /* Property pin */
  .map-pin {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -100%);
    z-index: 10;
    filter: drop-shadow(0 6px 12px rgba(186, 26, 26, 0.35));
  }

  .map-pin__ring {
    position: absolute;
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 2px solid rgba(186, 26, 26, 0.25);
    animation: ring-pulse 2s ease-in-out infinite;
  }

  @keyframes ring-pulse {
    0%   { transform: translateX(-50%) scale(1);   opacity: 0.6; }
    100% { transform: translateX(-50%) scale(2.2); opacity: 0; }
  }

  /* Glass detail panel */
  .map-detail-panel {
    position: absolute;
    bottom: var(--space-8);
    right: var(--space-8);
    width: 300px;
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    z-index: 20;
  }

  .map-detail-panel__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-4);
  }

  .map-detail-panel__address {
    font-size: var(--text-title-sm);
    font-weight: 600;
    color: var(--on-surface);
    margin-top: var(--space-1);
  }

  .map-detail-panel__city {
    font-size: var(--text-body-sm);
    color: var(--on-surface-variant);
  }

  .map-detail-panel__tags {
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
  }

  .map-detail-tag {
    padding: 0.2rem 0.625rem;
    border-radius: var(--radius-full);
    font-size: var(--text-label-sm);
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .map-detail-tag--high {
    background: var(--error-container);
    color: var(--error);
  }

  .map-detail-tag--low {
    background: var(--tertiary-container);
    color: var(--on-tertiary);
  }

  .map-detail-panel__actions {
    display: flex;
    gap: var(--space-2);
  }

  .map-detail-btn {
    flex: 1;
    justify-content: center;
    padding: 0.5rem 0.75rem;
    font-size: var(--text-body-sm);
  }

  /* Map controls */
  .map-controls {
    position: absolute;
    top: var(--space-6);
    right: var(--space-6);
    display: flex;
    flex-direction: column;
    background: var(--surface-lowest);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-float);
    overflow: hidden;
    z-index: 20;
  }

  .map-control-btn {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    color: var(--on-surface);
    background: none;
    border: none;
    cursor: pointer;
    transition: background var(--transition-fast);
    font-family: var(--font-family);
  }

  .map-control-btn:hover {
    background: var(--surface-low);
  }

  .map-control-sep {
    border: none;
    border-top: 1px solid rgba(194, 198, 216, 0.15);
    margin: 0;
  }

  /* Attribution */
  .map-attribution {
    position: absolute;
    bottom: var(--space-2);
    left: var(--space-3);
    font-size: 10px;
    color: var(--on-surface-variant);
    opacity: 0.6;
    pointer-events: none;
  }
</style>
