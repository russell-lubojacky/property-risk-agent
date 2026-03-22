<script>
  // Landing Page — Property Risk Agent
  // Corresponds to "Landing Page - Property Risk Agent" Stitch screen

  const features = [
    {
      icon: '🌊',
      title: 'Flood Plain Analysis',
      description: 'Hydro-dynamic flooding models with real-time water flow simulation across FEMA flood zones.',
      badge: 'Hydrology',
    },
    {
      icon: '📡',
      title: 'Seismic Assessment',
      description: 'Fault-line proximity, soil liquefaction risk, and historical seismic activity scoring.',
      badge: 'Geophysics',
    },
    {
      icon: '⚡',
      title: 'Infrastructure Integrity',
      description: 'Power grid resilience, road accessibility grades, and maintenance proximity indexing.',
      badge: 'Civil',
    },
    {
      icon: '🏙️',
      title: 'Safety & Stability',
      description: 'Crime statistics correlated with neighborhood trend data for long-term value projections.',
      badge: 'Socioeconomic',
    },
  ];

  const stats = [
    { value: '50K+', label: 'Properties Analyzed' },
    { value: '12+',  label: 'Data Sources' },
    { value: '99.2%', label: 'Scoring Accuracy' },
    { value: '<2min', label: 'Report Generation' },
  ];

  let searchAddress = '';

  function handleAnalyze() {
    // TODO: wire up to backend API — POST /api/analyze with { address: searchAddress }
    if (searchAddress.trim()) {
      window.location.href = `/results?address=${encodeURIComponent(searchAddress)}`;
    }
  }
</script>

<svelte:head>
  <title>Property Risk Agent — Institutional Geospatial Risk Analysis</title>
</svelte:head>

<!-- ============================================================
     HERO
     ============================================================ -->
<section class="hero">
  <div class="container hero__content">
    <div class="hero__eyebrow data-label">Institutional-Grade Analysis</div>

    <h1 class="hero__headline">
      Map Your Risk With<br />
      <span class="hero__headline-accent">Architectural Precision.</span>
    </h1>

    <p class="hero__sub">
      Property Risk Agent processes thousands of geospatial data points — flood plains,
      seismic activity, infrastructure, and safety metrics — to deliver a single,
      auditable risk score for any US property.
    </p>

    <!-- Address Search -->
    <form class="hero__search" on:submit|preventDefault={handleAnalyze}>
      <div class="hero__search-input-wrap">
        <svg class="hero__search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          class="hero__search-input"
          placeholder="Enter a property address, e.g. 456 Main St, Houston TX"
          bind:value={searchAddress}
          aria-label="Property address"
        />
      </div>
      <button type="submit" class="btn-primary hero__search-btn">
        Run Analysis
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </button>
    </form>

    <div class="hero__ctas">
      <a href="/results" class="btn-tertiary">View Sample Report</a>
      <span class="hero__divider" aria-hidden="true">·</span>
      <a href="/map" class="btn-tertiary">Explore Map View</a>
    </div>

    <!-- Feature pills -->
    <div class="hero__pills">
      <span class="hero__pill"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Flood Plain Data</span>
      <span class="hero__pill"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Seismic Activity</span>
      <span class="hero__pill"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Infrastructure Integrity</span>
    </div>
  </div>

  <!-- Background grid overlay -->
  <div class="hero__bg-grid map-grid-overlay" aria-hidden="true"></div>
</section>

<!-- ============================================================
     TRUST BAR
     ============================================================ -->
<section class="trust-bar">
  <div class="container trust-bar__inner">
    <span class="trust-bar__label data-label">Trusted by market leaders</span>
    <div class="trust-bar__logos" aria-label="Partner logos">
      {#each ['Meridian Capital', 'Atlas REIT', 'Forte Underwriters', 'Bridgeline Group', 'Vantage RE'] as partner}
        <div class="trust-bar__logo-pill">{partner}</div>
      {/each}
    </div>
  </div>
</section>

<!-- ============================================================
     STATS BAR
     ============================================================ -->
<section class="stats-bar">
  <div class="container stats-bar__grid">
    {#each stats as stat}
      <div class="stats-bar__item">
        <span class="stats-bar__value">{stat.value}</span>
        <span class="data-label">{stat.label}</span>
      </div>
    {/each}
  </div>
</section>

<!-- ============================================================
     FEATURES
     ============================================================ -->
<section class="features">
  <div class="container">
    <div class="features__header">
      <span class="data-label">What We Analyze</span>
      <h2 class="features__title">Four dimensions of property risk</h2>
      <p class="features__sub">
        Each dimension is independently scored and weighted by our proprietary
        geospatial models, then combined into a single composite risk score.
      </p>
    </div>

    <div class="features__grid">
      {#each features as feature}
        <article class="card feature-card">
          <div class="feature-card__icon-wrap" aria-hidden="true">
            {feature.icon}
          </div>
          <div class="feature-card__badge data-label">{feature.badge}</div>
          <h3 class="feature-card__title">{feature.title}</h3>
          <p class="feature-card__desc">{feature.description}</p>
        </article>
      {/each}
    </div>
  </div>
</section>

<!-- ============================================================
     REPORTING SECTION
     ============================================================ -->
<section class="reporting">
  <div class="container reporting__inner">
    <div class="reporting__copy">
      <span class="data-label">Institutional Reporting</span>
      <h2 class="reporting__title">Blueprint-grade reports, ready to share.</h2>
      <p class="reporting__desc">
        Every risk analysis generates a white-labeled PDF report formatted in our
        signature blueprint style — precise, auditable, and designed to stand up
        to institutional due diligence. Embed your logo, add custom notes, and
        export to your stakeholders in seconds.
      </p>
      <div class="reporting__actions">
        <a href="/results" class="btn-primary">Generate a Report</a>
        <a href="/portfolio" class="btn-secondary">Manage Portfolio</a>
      </div>
    </div>

    <!-- Decorative "report preview" panel -->
    <div class="reporting__preview card-section" aria-hidden="true">
      <div class="reporting__preview-header">
        <div class="reporting__preview-dot"></div>
        <div class="reporting__preview-dot"></div>
        <div class="reporting__preview-dot"></div>
        <span class="data-label reporting__preview-title">Risk Report Preview</span>
      </div>
      <div class="reporting__preview-body">
        <div class="reporting__preview-line reporting__preview-line--wide"></div>
        <div class="reporting__preview-line reporting__preview-line--med"></div>
        <div class="reporting__preview-score-row">
          <div class="reporting__preview-score-block">
            <div class="reporting__preview-score">68</div>
            <div class="reporting__preview-score-label">Composite Score</div>
          </div>
          <div class="reporting__preview-bars">
            {#each [72, 45, 88, 60] as pct}
              <div class="reporting__preview-bar-row">
                <div class="reporting__preview-bar-fill" style="width: {pct}%;"></div>
              </div>
            {/each}
          </div>
        </div>
        <div class="reporting__preview-line reporting__preview-line--short"></div>
        <div class="reporting__preview-line reporting__preview-line--med"></div>
      </div>
    </div>
  </div>
</section>

<!-- ============================================================
     BOTTOM CTA
     ============================================================ -->
<section class="bottom-cta">
  <div class="container bottom-cta__inner">
    <div class="bottom-cta__copy">
      <span class="data-label bottom-cta__eyebrow">Get Started</span>
      <h2 class="bottom-cta__title">Ready to derisk your portfolio?</h2>
      <p class="bottom-cta__sub">
        Join institutional investors, underwriters, and asset managers who rely on
        Property Risk Agent for precise, auditable geospatial intelligence.
      </p>
    </div>
    <div class="bottom-cta__actions">
      <a href="/results" class="btn-primary bottom-cta__btn">Start Your First Report</a>
      <a href="/contact" class="btn-secondary bottom-cta__btn">Schedule a Demo</a>
    </div>
  </div>
</section>

<!-- ============================================================
     FOOTER
     ============================================================ -->
<footer class="footer">
  <div class="container footer__inner">
    <span class="footer__copy">© 2026 Property Risk Agent. All rights reserved.</span>
    <nav class="footer__links" aria-label="Footer navigation">
      <a href="/privacy">Privacy</a>
      <a href="/terms">Terms</a>
      <a href="/contact">Contact</a>
      <a href="/api-docs">API Documentation</a>
    </nav>
  </div>
</footer>

<style>
  /* ---- Hero ---- */
  .hero {
    position: relative;
    background: var(--surface);
    overflow: hidden;
    padding: var(--space-16) 0 calc(var(--space-16) + var(--space-8));
  }

  .hero__bg-grid {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  .hero__content {
    position: relative;
    z-index: 1;
    max-width: 720px;
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .hero__eyebrow {
    color: var(--primary);
  }

  .hero__headline {
    font-size: clamp(2.5rem, 5vw, 3.75rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1.08;
    color: var(--on-surface);
  }

  .hero__headline-accent {
    background: linear-gradient(135deg, var(--primary), var(--primary-container));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero__sub {
    font-size: var(--text-title-sm);
    color: var(--on-surface-variant);
    max-width: 560px;
    line-height: 1.65;
  }

  /* Search */
  .hero__search {
    display: flex;
    gap: var(--space-3);
    max-width: 600px;
  }

  .hero__search-input-wrap {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
  }

  .hero__search-icon {
    position: absolute;
    left: 1rem;
    color: var(--outline);
    pointer-events: none;
  }

  .hero__search-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.75rem;
    border-radius: var(--radius-md);
    background: var(--surface-highest);
    border: none;
    font-family: var(--font-family);
    font-size: var(--text-body-lg);
    color: var(--on-surface);
    transition: background var(--transition-fast), box-shadow var(--transition-fast);
  }

  .hero__search-input::placeholder {
    color: var(--outline);
  }

  .hero__search-input:focus {
    outline: none;
    background: var(--surface-lowest);
    box-shadow: 0 0 0 2px var(--primary);
  }

  .hero__search-btn {
    white-space: nowrap;
    flex-shrink: 0;
  }

  .hero__ctas {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .hero__divider {
    color: var(--outline-variant);
  }

  /* Feature pills */
  .hero__pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-1);
  }

  .hero__pill {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: 0.3rem 0.75rem;
    border-radius: var(--radius-full);
    background: var(--primary-container);
    color: white;
    font-size: var(--text-label-sm);
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  /* ---- Trust bar ---- */
  .trust-bar {
    background: var(--surface-lowest);
    border-top: 1px solid rgba(194, 198, 216, 0.12);
    border-bottom: 1px solid rgba(194, 198, 216, 0.12);
    padding: var(--space-5) 0;
  }

  .trust-bar__inner {
    display: flex;
    align-items: center;
    gap: var(--space-8);
    flex-wrap: wrap;
  }

  .trust-bar__label {
    flex-shrink: 0;
    color: var(--on-surface-variant);
  }

  .trust-bar__logos {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
    flex: 1;
  }

  .trust-bar__logo-pill {
    padding: 0.3rem 0.875rem;
    border-radius: var(--radius-md);
    background: var(--surface-high);
    font-size: var(--text-body-sm);
    font-weight: 600;
    color: var(--on-surface-variant);
    letter-spacing: 0.01em;
    white-space: nowrap;
  }

  /* ---- Stats bar ---- */
  .stats-bar {
    background: var(--surface-low);
    padding: var(--space-8) 0;
  }

  .stats-bar__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-6);
  }

  .stats-bar__item {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    align-items: center;
    text-align: center;
  }

  .stats-bar__value {
    font-size: var(--text-display-sm);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--primary);
  }

  /* ---- Features ---- */
  .features {
    padding: var(--space-16) 0;
    background: var(--surface);
  }

  .features__header {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    max-width: 560px;
    margin-bottom: var(--space-12);
  }

  .features__title {
    font-size: var(--text-headline-md);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--on-surface);
  }

  .features__sub {
    font-size: var(--text-body-lg);
    color: var(--on-surface-variant);
    line-height: 1.65;
  }

  .features__grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }

  .feature-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    transition: transform var(--transition-base), box-shadow var(--transition-base);
  }

  .feature-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-float);
  }

  .feature-card__icon-wrap {
    font-size: 2rem;
    line-height: 1;
  }

  .feature-card__badge {
    color: var(--primary);
    margin-top: var(--space-2);
  }

  .feature-card__title {
    font-size: var(--text-title-md);
    font-weight: 600;
    color: var(--on-surface);
  }

  .feature-card__desc {
    font-size: var(--text-body-md);
    color: var(--on-surface-variant);
    line-height: 1.6;
  }

  /* ---- Reporting ---- */
  .reporting {
    background: var(--surface-low);
    padding: var(--space-16) 0;
  }

  .reporting__inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-16);
    align-items: center;
  }

  .reporting__copy {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .reporting__title {
    font-size: var(--text-headline-sm);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--on-surface);
  }

  .reporting__desc {
    font-size: var(--text-body-lg);
    color: var(--on-surface-variant);
    line-height: 1.65;
  }

  .reporting__actions {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  /* Decorative preview panel */
  .reporting__preview {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .reporting__preview-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .reporting__preview-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--outline-variant);
  }

  .reporting__preview-title {
    margin-left: auto;
  }

  .reporting__preview-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .reporting__preview-line {
    height: 10px;
    border-radius: var(--radius-full);
    background: var(--surface-highest);
  }
  .reporting__preview-line--wide  { width: 100%; }
  .reporting__preview-line--med   { width: 70%; }
  .reporting__preview-line--short { width: 40%; }

  .reporting__preview-score-row {
    display: flex;
    gap: var(--space-6);
    align-items: center;
    padding: var(--space-4);
    background: var(--surface-lowest);
    border-radius: var(--radius-md);
  }

  .reporting__preview-score-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    flex-shrink: 0;
  }

  .reporting__preview-score {
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--primary);
  }

  .reporting__preview-score-label {
    font-size: var(--text-label-sm);
    color: var(--on-surface-variant);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .reporting__preview-bars {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .reporting__preview-bar-row {
    height: 6px;
    background: var(--surface-highest);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .reporting__preview-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary), var(--primary-container));
    border-radius: var(--radius-full);
  }

  /* ---- Bottom CTA ---- */
  .bottom-cta {
    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%);
    padding: var(--space-16) 0;
  }

  .bottom-cta__inner {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: var(--space-12);
    align-items: center;
  }

  .bottom-cta__eyebrow {
    color: rgba(255, 255, 255, 0.7);
    display: block;
    margin-bottom: var(--space-2);
  }

  .bottom-cta__title {
    font-size: var(--text-headline-md);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: white;
    margin-bottom: var(--space-4);
  }

  .bottom-cta__sub {
    font-size: var(--text-body-lg);
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.65;
    max-width: 520px;
  }

  .bottom-cta__actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    flex-shrink: 0;
  }

  .bottom-cta__btn {
    white-space: nowrap;
    justify-content: center;
  }

  /* Override btn-primary colors on dark background */
  .bottom-cta .btn-primary {
    background: white;
    color: var(--primary);
  }

  .bottom-cta .btn-primary:hover {
    background: rgba(255, 255, 255, 0.9);
  }

  .bottom-cta .btn-secondary {
    background: rgba(255, 255, 255, 0.15);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  .bottom-cta .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.25);
  }

  /* ---- Footer ---- */
  .footer {
    background: var(--surface-low);
    border-top: 1px solid rgba(194, 198, 216, 0.12);
    padding: var(--space-8) 0;
  }

  .footer__inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .footer__copy {
    font-size: var(--text-body-sm);
    color: var(--on-surface-variant);
  }

  .footer__links {
    display: flex;
    gap: var(--space-6);
  }

  .footer__links a {
    font-size: var(--text-body-sm);
    color: var(--on-surface-variant);
    transition: color var(--transition-fast);
  }

  .footer__links a:hover {
    color: var(--primary);
  }
</style>
