<script>
  // Results Dashboard — Property Risk Agent
  // Corresponds to "Results Dashboard - Property Risk Agent" Stitch screen
  // Property: 456 Main St, Houston, TX 77002

  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import RiskScoreBadge from '$lib/components/RiskScoreBadge.svelte';
  import IncidentTag from '$lib/components/IncidentTag.svelte';
  import RiskFactorRow from '$lib/components/RiskFactorRow.svelte';

  // TODO: Replace with actual API call — GET /api/analyze?address=...
  // The address can come from the query string (set by the landing page search)
  $: address = $page.url.searchParams.get('address') ?? '456 Main St, Houston, TX 77002';

  // --- Mock data (wire up to backend later) ---
  // TODO: aiSummary and agentInsight should come from POST /api/analyze response
  const aiSummary = `This masonry residential property at 456 Main St presents a moderate-to-high composite risk profile driven primarily by its hydrological exposure. Situated within FEMA Zone AE, the site experiences a statistically significant annual probability of flood inundation, compounded by its proximity to low-lying drainage infrastructure that exhibits diminished capacity during peak rainfall events. Hydrological modelling indicates surface-water runoff from upstream catchment areas has increased 18% over the last decade, correlating with regional climate trends.

Structural resilience is bolstered by masonry construction (built 2012) which meets current IBC seismic and wind load standards. The electrical grid serving this block received a Resilience Plus upgrade in 2021, providing dual-redundant feed capacity that substantially reduces outage risk relative to the broader Houston grid average.

Mitigation priority should focus on lower-level waterproofing, an updated elevation certificate, and a flood insurance premium review against current FEMA advisory base flood elevations. Despite near-term flood exposure, long-term value appreciation remains stable contingent on proactive structural maintenance.`;

  const agentInsight = 'Historical data suggests property value appreciation remains stable despite flood risks, provided resilient structural updates are maintained.';

  const property = {
    address: '456 Main St',
    city: 'Houston, TX 77002',
    type: 'Residential — Masonry',
    yearBuilt: 2012,
    compositeScore: 68,
  };

  // riskFactors — Infrastructure and Safety entries are updated reactively once data loads
  let safetyScore = 55;
  let safetySeverity = 'medium';
  let safetyValue = 'Moderate';

  let infraScore = 50;
  let infraSeverity = 'medium';
  let infraValue = 'Loading…';

  $: riskFactors = [
    { label: 'Flooding',        value: 'High Risk',   score: 78,          severity: 'high' },
    { label: 'Seismic',         value: 'Low Risk',    score: 22,          severity: 'low' },
    { label: 'Infrastructure',  value: infraValue,    score: infraScore,  severity: infraSeverity },
    { label: 'Safety',          value: safetyValue,   score: safetyScore, severity: safetySeverity },
  ];

  // Flood details — populated from the FEMA NFHL API on mount
  let floodLoading = true;
  let floodError = null;
  let floodDetails = {
    zone: '—',
    finding: 'Loading flood zone data from FEMA National Flood Hazard Layer…',
    elevation: '',
  };

  onMount(async () => {
    // Fetch flood, crime, and infrastructure data concurrently
    const [floodResult, crimeResult, infraResult] = await Promise.allSettled([
      fetch(`/api/flood?address=${encodeURIComponent(address)}`).then(r => r.json()),
      fetch(`/api/crime?address=${encodeURIComponent(address)}`).then(r => r.json()),
      fetch(`/api/infrastructure?address=${encodeURIComponent(address)}`).then(r => r.json()),
    ]);

    // --- Flood ---
    if (floodResult.status === 'fulfilled' && !floodResult.value.error) {
      const data = floodResult.value;
      const zoneLabel = data.subtype
        ? `Zone ${data.zone} — ${data.subtype}`
        : `Zone ${data.zone}`;
      const elevationText = data.staticBFE != null
        ? `Base flood elevation: ${data.staticBFE.toFixed(1)} ft NAVD88`
        : data.zone === 'X'
          ? 'No base flood elevation — minimal flood hazard area'
          : 'Base flood elevation not available in NFHL record';
      floodDetails = { zone: zoneLabel, finding: data.description, elevation: elevationText };
    } else {
      const msg = floodResult.status === 'rejected'
        ? floodResult.reason?.message
        : floodResult.value?.error;
      floodError = msg ?? 'Unknown error';
      floodDetails = {
        zone: 'Unavailable',
        finding: 'Could not retrieve FEMA flood zone data. Please try again later.',
        elevation: '',
      };
    }
    floodLoading = false;

    // --- Crime / Safety ---
    if (crimeResult.status === 'fulfilled' && !crimeResult.value.error) {
      const data = crimeResult.value;
      crimeDetails = {
        score: data.crimeScore,
        severityLabel: data.severityLabel,
        violentRate: data.violentCrimeRate,
        propertyRate: data.propertyCrimeRate,
        nationalAvg: data.nationalAvgViolentRate,
        countyName: data.countyName,
        dataYear: data.dataYear,
        note: null,
      };
      safetyScore = data.crimeScore;
      safetySeverity = data.severity;
      safetyValue = data.severityLabel;
    } else {
      const msg = crimeResult.status === 'rejected'
        ? crimeResult.reason?.message
        : crimeResult.value?.error;
      crimeError = msg ?? 'Unknown error';
      crimeDetails = {
        score: null,
        severityLabel: 'Unavailable',
        violentRate: null,
        propertyRate: null,
        nationalAvg: null,
        countyName: '',
        dataYear: null,
        note: 'Could not retrieve crime data. Please try again later.',
      };
    }
    crimeLoading = false;

    // --- Infrastructure ---
    if (infraResult.status === 'fulfilled' && !infraResult.value.error) {
      const data = infraResult.value;
      infraDetails = {
        gridStatus: `State SAIDI ${data.gridSaidi} min/yr · Grid score ${data.gridResilienceScore}/100 (${data.gridDataYear} EIA data)`,
        roadAccess: `Grade ${data.roadAccessGrade} — ${data.totalRoadsNearby ?? '?'} major road segment${data.totalRoadsNearby !== 1 ? 's' : ''} within 500 m`,
        score: data.infrastructureScore,
        severityLabel: data.severityLabel,
        state: data.state,
        sources: data.sources,
        note: null,
      };
      infraScore = data.infrastructureScore;
      infraSeverity = data.severity;
      infraValue = data.severityLabel;
    } else {
      const msg = infraResult.status === 'rejected'
        ? infraResult.reason?.message
        : infraResult.value?.error;
      infraError = msg ?? 'Unknown error';
      infraDetails = {
        gridStatus: null,
        roadAccess: null,
        score: null,
        severityLabel: 'Unavailable',
        state: null,
        sources: null,
        note: 'Could not retrieve infrastructure data. Please try again later.',
      };
      infraValue = 'Unavailable';
    }
    infraLoading = false;
  });

  // Crime / Safety — populated from the FBI CDE API on mount
  let crimeLoading = true;
  let crimeError = null;
  let crimeDetails = {
    score: null,
    severityLabel: '—',
    violentRate: null,
    propertyRate: null,
    nationalAvg: null,
    countyName: '',
    dataYear: null,
    note: 'Loading crime index data from FBI Crime Data Explorer…',
  };

  // Infrastructure — populated from the EIA/OSM API on mount
  let infraLoading = true;
  let infraError = null;
  let infraDetails = {
    gridStatus: null,
    roadAccess: null,
    score: null,
    severityLabel: '—',
    state: null,
    sources: null,
    note: 'Loading infrastructure data…',
  };

  const incidents = [
    { type: 'flood',      label: 'Major surface flooding',    distance: '0.2 mi', timeAgo: '4 days ago' },
    { type: 'power',      label: 'Localized power outage',    distance: '0.5 mi', timeAgo: '12 days ago (resolved)' },
    { type: 'water',      label: 'Water main repair',         distance: '0.1 mi', timeAgo: '1 month ago' },
    { type: 'subsidence', label: 'Active street subsidence',  distance: '0.3 mi', timeAgo: 'Ongoing' },
  ];

  const recommendations = [
    'Review lower-level waterproofing integrity and install sump pump backups.',
    'Conduct an insurance premium audit relative to updated FEMA climate data.',
    'Obtain elevation certificate to support potential Letter of Map Amendment (LOMA) filing.',
    'Property value appreciation remains stable with appropriate structural maintenance.',
  ];

  let activeTab = 'overview';
  const tabs = [
    { id: 'overview',      label: 'Overview' },
    { id: 'flood',         label: 'Flood' },
    { id: 'infrastructure', label: 'Infrastructure' },
    { id: 'safety',        label: 'Safety' },
  ];
</script>

<svelte:head>
  <title>{property.address}, {property.city} — Property Risk Agent</title>
</svelte:head>

<div class="results-page">
  <!-- ============================================================
       PROPERTY HEADER BAR
       ============================================================ -->
  <div class="prop-header">
    <div class="container prop-header__inner">
      <div class="prop-header__address-block">
        <div class="prop-header__breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true"> / </span>
          <span>Results</span>
        </div>
        <h1 class="prop-header__address">{property.address}</h1>
        <p class="prop-header__meta">
          {property.city} · {property.type} · Built {property.yearBuilt}
        </p>
      </div>

      <div class="prop-header__score-block">
        <RiskScoreBadge score={property.compositeScore} size="lg" label="Composite Score" />
      </div>

      <div class="prop-header__actions">
        <button class="btn-primary" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          Export PDF
        </button>
        <button class="btn-secondary" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Share Analysis
        </button>
        <button class="btn-secondary" type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          Save to Portfolio
        </button>
        <a href="/map?address={encodeURIComponent(address)}" class="btn-tertiary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Map View
        </a>
      </div>
    </div>
  </div>

  <!-- ============================================================
       MAIN CONTENT
       ============================================================ -->
  <div class="container results-body">
    <!-- LEFT COLUMN — Risk breakdown -->
    <aside class="results-sidebar">

      <!-- Risk Factor Summary -->
      <section class="card sidebar-section">
        <h2 class="sidebar-section__title">Risk Breakdown</h2>
        <div class="risk-factors-list">
          {#each riskFactors as factor}
            <RiskFactorRow
              label={factor.label}
              value={factor.value}
              score={factor.score}
              severity={factor.severity}
            />
          {/each}
        </div>
      </section>

      <!-- Flood Detail -->
      <section class="card sidebar-section">
        <div class="sidebar-section__badge sidebar-section__badge--high">HIGH RISK</div>
        <h2 class="sidebar-section__title">Flood Assessment</h2>
        {#if floodLoading}
          <p class="sidebar-section__note flood-loading">Fetching FEMA data…</p>
        {:else}
          <div class="detail-pill">
            <span class="data-label">FEMA Zone</span>
            <span class="detail-pill__value">{floodDetails.zone}</span>
          </div>
          <p class="sidebar-section__desc">{floodDetails.finding}</p>
          {#if floodDetails.elevation}
            <p class="sidebar-section__note">{floodDetails.elevation}</p>
          {/if}
          <p class="sidebar-section__note flood-source">Source: FEMA National Flood Hazard Layer</p>
        {/if}
      </section>

      <!-- Infrastructure -->
      <section class="card sidebar-section">
        {#if !infraLoading}
          <div class="sidebar-section__badge sidebar-section__badge--{infraError ? 'medium' : infraDetails.severityLabel === 'High Risk' ? 'high' : infraDetails.severityLabel === 'Low Risk' || infraDetails.severityLabel === 'Favorable' ? 'low' : 'medium'}">
            {infraError ? 'UNAVAILABLE' : infraDetails.severityLabel.toUpperCase()}
          </div>
        {/if}
        <h2 class="sidebar-section__title">Infrastructure Integrity</h2>
        {#if infraLoading}
          <p class="sidebar-section__note infra-loading">Loading infrastructure data…</p>
        {:else if infraError}
          <p class="sidebar-section__desc">{infraDetails.note}</p>
        {:else}
          <div class="detail-pill">
            <span class="data-label">Infrastructure Score</span>
            <span class="detail-pill__value">{infraDetails.score} / 100</span>
          </div>
          <div class="infra-rows">
            {#if infraDetails.gridStatus}
              <div class="infra-row">
                <span class="data-label">Power Grid</span>
                <span class="infra-row__val">{infraDetails.gridStatus}</span>
              </div>
            {/if}
            {#if infraDetails.roadAccess}
              <div class="infra-row">
                <span class="data-label">Road Access</span>
                <span class="infra-row__val">{infraDetails.roadAccess}</span>
              </div>
            {/if}
          </div>
          {#if infraDetails.sources}
            <p class="sidebar-section__note infra-source">Source: {infraDetails.sources}</p>
          {/if}
        {/if}
      </section>

      <!-- Safety -->
      <section class="card sidebar-section">
        {#if !crimeLoading}
          <div class="sidebar-section__badge sidebar-section__badge--{crimeError ? 'medium' : crimeDetails.severityLabel === 'High Risk' ? 'high' : crimeDetails.severityLabel === 'Low Risk' ? 'low' : 'medium'}">
            {crimeError ? 'UNAVAILABLE' : crimeDetails.severityLabel.toUpperCase()}
          </div>
        {/if}
        <h2 class="sidebar-section__title">Safety &amp; Crime Index</h2>
        {#if crimeLoading}
          <p class="sidebar-section__note crime-loading">Fetching FBI crime data…</p>
        {:else if crimeError}
          <p class="sidebar-section__desc">{crimeDetails.note}</p>
          {#if crimeError.includes('FBI_UCR_API_KEY')}
            <p class="sidebar-section__note">Configure <code>FBI_UCR_API_KEY</code> to enable live crime data.</p>
          {/if}
        {:else}
          <div class="detail-pill">
            <span class="data-label">Crime Index Score</span>
            <span class="detail-pill__value">{crimeDetails.score} / 100</span>
          </div>
          <div class="crime-rates">
            <div class="crime-rate-row">
              <span class="data-label">Violent Crime Rate</span>
              <span class="crime-rate-val">{crimeDetails.violentRate} per 100k</span>
            </div>
            <div class="crime-rate-row">
              <span class="data-label">Property Crime Rate</span>
              <span class="crime-rate-val">{crimeDetails.propertyRate} per 100k</span>
            </div>
            <div class="crime-rate-row">
              <span class="data-label">National Avg (Violent)</span>
              <span class="crime-rate-val">{crimeDetails.nationalAvg} per 100k</span>
            </div>
          </div>
          {#if crimeDetails.countyName}
            <p class="sidebar-section__note">County: {crimeDetails.countyName}</p>
          {/if}
          <p class="sidebar-section__note crime-source">
            Source: FBI Crime Data Explorer · {crimeDetails.dataYear} data · Annual refresh
          </p>
        {/if}
      </section>
    </aside>

    <!-- RIGHT COLUMN — Map placeholder + incidents + recommendations -->
    <div class="results-main">

      <!-- Mini Map Placeholder -->
      <section class="card map-placeholder map-grid-overlay" aria-label="Property location map">
        <div class="map-placeholder__pin" aria-hidden="true">
          <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 0C6.268 0 0 6.268 0 14c0 9.625 14 22 14 22S28 23.625 28 14C28 6.268 21.732 0 14 0Z" fill="var(--primary)"/>
            <circle cx="14" cy="14" r="6" fill="white"/>
          </svg>
        </div>
        <div class="map-placeholder__label glass-panel">
          <span class="data-label">Property Location</span>
          <span class="map-placeholder__address">{property.address}, {property.city}</span>
        </div>
        <a href="/map?address={encodeURIComponent(address)}" class="map-placeholder__expand btn-secondary">Open Full Map →</a>
      </section>

      <!-- AI-Generated Property Summary -->
      <section class="card ai-summary">
        <header class="section-header">
          <h2 class="section-header__title">AI-Generated Property Summary</h2>
          <span class="ai-summary__badge data-label">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
            </svg>
            AI Generated
          </span>
        </header>
        <!-- TODO: replace with streamed response from Claude API — POST /api/analyze -->
        <div class="ai-summary__body">
          {#each aiSummary.split('\n\n') as para}
            <p class="ai-summary__para">{para}</p>
          {/each}
        </div>
      </section>

      <!-- Agent Insight Box -->
      <blockquote class="agent-insight">
        <svg class="agent-insight__icon" width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" fill="var(--primary)" opacity="0.7"/>
        </svg>
        <p class="agent-insight__text">{agentInsight}</p>
        <cite class="agent-insight__cite data-label">Property Risk Agent · AI Insight</cite>
      </blockquote>

      <!-- Nearby Incidents -->
      <section class="card">
        <header class="section-header">
          <h2 class="section-header__title">Nearby Incidents</h2>
          <span class="section-header__count data-label">{incidents.length} active</span>
        </header>
        <div class="incidents-list">
          {#each incidents as inc}
            <IncidentTag
              type={inc.type}
              label={inc.label}
              distance={inc.distance}
              timeAgo={inc.timeAgo}
            />
          {/each}
        </div>
        <a href="/map" class="view-log-link btn-tertiary">
          View Full Event Log →
        </a>
      </section>

      <!-- Recommendations -->
      <section class="card">
        <h2 class="section-header__title">Recommendations</h2>
        <ul class="recommendations-list">
          {#each recommendations as rec, i}
            <li class="recommendation-item">
              <span class="recommendation-item__num data-label">{String(i + 1).padStart(2, '0')}</span>
              <span class="recommendation-item__text">{rec}</span>
            </li>
          {/each}
        </ul>
      </section>

    </div><!-- /results-main -->
  </div><!-- /container -->
</div><!-- /results-page -->

<style>
  .results-page {
    background: var(--surface);
    min-height: 100vh;
  }

  /* ---- Property header ---- */
  .prop-header {
    background: var(--surface-low);
    padding: var(--space-6) 0;
    border-bottom: 1px solid rgba(194, 198, 216, 0.12);
  }

  .prop-header__inner {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: var(--space-8);
    align-items: center;
  }

  .prop-header__breadcrumb {
    font-size: var(--text-body-sm);
    color: var(--on-surface-variant);
    margin-bottom: var(--space-2);
  }

  .prop-header__breadcrumb a {
    color: var(--primary);
    transition: opacity var(--transition-fast);
  }
  .prop-header__breadcrumb a:hover { opacity: 0.75; }

  .prop-header__address {
    font-size: var(--text-headline-sm);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--on-surface);
  }

  .prop-header__meta {
    font-size: var(--text-body-md);
    color: var(--on-surface-variant);
    margin-top: var(--space-1);
  }

  .prop-header__actions {
    display: flex;
    gap: var(--space-2);
    align-items: center;
    flex-wrap: wrap;
  }

  /* ---- Layout ---- */
  .results-body {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: var(--space-6);
    padding-top: var(--space-6);
    padding-bottom: var(--space-8);
    align-items: start;
  }

  /* ---- Sidebar ---- */
  .results-sidebar {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    position: sticky;
    top: calc(64px + var(--space-6));
    max-height: calc(100vh - 64px - var(--space-6) * 2);
    overflow-y: auto;
  }

  .sidebar-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .sidebar-section__title {
    font-size: var(--text-title-sm);
    font-weight: 600;
    color: var(--on-surface);
  }

  .sidebar-section__badge {
    display: inline-flex;
    padding: 0.2rem 0.625rem;
    border-radius: var(--radius-full);
    font-size: var(--text-label-sm);
    font-weight: 700;
    letter-spacing: 0.06em;
    width: fit-content;
  }
  .sidebar-section__badge--high   { background: var(--error-container);      color: var(--error); }
  .sidebar-section__badge--medium { background: #fff3d6;                     color: #c97b00; }
  .sidebar-section__badge--low    { background: var(--tertiary-container);   color: var(--on-tertiary); }

  .sidebar-section__desc {
    font-size: var(--text-body-md);
    color: var(--on-surface-variant);
    line-height: 1.6;
  }

  .sidebar-section__note {
    font-size: var(--text-body-sm);
    color: var(--outline);
    font-style: italic;
  }

  .detail-pill {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .detail-pill__value {
    font-size: var(--text-body-md);
    font-weight: 600;
    color: var(--on-surface);
  }

  .risk-factors-list {
    display: flex;
    flex-direction: column;
  }

  .infra-rows {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .infra-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .infra-row__val {
    font-size: var(--text-body-sm);
    color: var(--on-surface-variant);
  }

  /* ---- Main ---- */
  .results-main {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  /* Map placeholder */
  .map-placeholder {
    height: 240px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--surface-high);
    overflow: hidden;
    padding: 0;
  }

  .map-placeholder__pin {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -100%);
    filter: drop-shadow(0 4px 8px rgba(0,80,203,0.3));
  }

  .map-placeholder__label {
    position: absolute;
    bottom: var(--space-4);
    left: var(--space-4);
    padding: var(--space-3) var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .map-placeholder__address {
    font-size: var(--text-body-md);
    font-weight: 500;
    color: var(--on-surface);
  }

  .map-placeholder__expand {
    position: absolute;
    bottom: var(--space-4);
    right: var(--space-4);
    font-size: var(--text-body-sm);
    padding: 0.5rem 1rem;
  }

  /* Section headers */
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
  }

  .section-header__title {
    font-size: var(--text-title-sm);
    font-weight: 600;
    color: var(--on-surface);
  }

  .section-header__count {
    color: var(--primary);
  }

  /* AI Summary */
  .ai-summary__badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--primary);
    background: var(--primary-fixed);
    padding: 0.2rem 0.625rem;
    border-radius: var(--radius-full);
    flex-shrink: 0;
  }

  .ai-summary__body {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin-top: var(--space-2);
  }

  .ai-summary__para {
    font-size: var(--text-body-md);
    color: var(--on-surface-variant);
    line-height: 1.75;
  }

  /* Agent Insight */
  .agent-insight {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-5) var(--space-6);
    background: var(--surface-low);
    border-radius: var(--radius-lg);
    border-left: 3px solid var(--primary);
    position: relative;
  }

  .agent-insight__icon {
    flex-shrink: 0;
  }

  .agent-insight__text {
    font-size: var(--text-title-sm);
    font-weight: 500;
    color: var(--on-surface);
    line-height: 1.6;
    font-style: italic;
  }

  .agent-insight__cite {
    color: var(--primary);
    font-style: normal;
  }

  /* View log link */
  .view-log-link {
    display: inline-flex;
    margin-top: var(--space-3);
    padding: var(--space-2) 0;
    font-size: var(--text-body-sm);
  }

  /* Incidents */
  .incidents-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  /* Recommendations */
  .recommendations-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-top: var(--space-4);
  }

  .recommendation-item {
    display: flex;
    gap: var(--space-4);
    align-items: flex-start;
    padding: var(--space-3) 0;
    border-bottom: 1px solid rgba(194, 198, 216, 0.10);
  }

  .recommendation-item:last-child {
    border-bottom: none;
  }

  .recommendation-item__num {
    color: var(--primary);
    flex-shrink: 0;
    padding-top: 2px;
  }

  .recommendation-item__text {
    font-size: var(--text-body-md);
    color: var(--on-surface-variant);
    line-height: 1.6;
  }

  .flood-loading {
    font-style: italic;
    color: var(--outline);
  }

  .flood-source {
    color: var(--outline);
    font-size: var(--text-label-sm);
    margin-top: var(--space-1);
  }

  .crime-loading {
    font-style: italic;
    color: var(--outline);
  }

  .crime-rates {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .crime-rate-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .crime-rate-val {
    font-size: var(--text-body-sm);
    color: var(--on-surface-variant);
    font-weight: 500;
  }

  .crime-source {
    color: var(--outline);
    font-size: var(--text-label-sm);
    margin-top: var(--space-1);
  }

  .infra-loading {
    font-style: italic;
    color: var(--outline);
  }

  .infra-source {
    color: var(--outline);
    font-size: var(--text-label-sm);
    margin-top: var(--space-1);
  }
</style>
