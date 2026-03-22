<script>
  /**
   * RiskScoreBadge — displays a numeric risk score with a colour-coded ring.
   *
   * Props:
   *   score  {number}  0–100
   *   size   {'sm'|'md'|'lg'}  default 'md'
   *   label  {string}  optional label below score
   */
  export let score = 0;
  export let size = 'md';
  export let label = 'Risk Score';

  // Colour thresholds — using design-system semantic colours
  $: scoreColor = score >= 75 ? 'var(--error)'
    : score >= 50 ? '#c97b00'       /* amber — not in spec but needed for mid-range */
    : 'var(--tertiary)';            /* teal — low risk */

  $: strokeDasharray = `${(score / 100) * 251.2} 251.2`; /* circumference = 2π×40 ≈ 251.2 */

  const sizes = {
    sm: { ring: 64,  stroke: 5, fontSize: '1.25rem' },
    md: { ring: 96,  stroke: 7, fontSize: '1.75rem' },
    lg: { ring: 128, stroke: 8, fontSize: '2.25rem' },
  };

  $: dim = sizes[size] ?? sizes.md;
</script>

<div class="risk-badge risk-badge--{size}" style="--score-color: {scoreColor};">
  <svg
    width={dim.ring}
    height={dim.ring}
    viewBox="0 0 100 100"
    role="img"
    aria-label="{label}: {score} out of 100"
  >
    <!-- Track -->
    <circle
      cx="50" cy="50" r="40"
      fill="none"
      stroke="var(--surface-highest)"
      stroke-width={dim.stroke}
    />
    <!-- Score arc -->
    <circle
      cx="50" cy="50" r="40"
      fill="none"
      stroke={scoreColor}
      stroke-width={dim.stroke}
      stroke-linecap="round"
      stroke-dasharray={strokeDasharray}
      transform="rotate(-90 50 50)"
      class="score-arc"
    />
  </svg>

  <div class="risk-badge__inner">
    <span class="risk-badge__score" style="font-size: {dim.fontSize}; color: {scoreColor};">
      {score}
    </span>
    <span class="risk-badge__denom">/100</span>
  </div>

  {#if label}
    <span class="risk-badge__label data-label">{label}</span>
  {/if}
</div>

<style>
  .risk-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    position: relative;
    width: fit-content;
  }

  .risk-badge__inner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: baseline;
    gap: 1px;
    /* offset for label below */
    margin-top: -8px;
  }

  /* Size adjustments for the "inner" positioning offset */
  .risk-badge--sm .risk-badge__inner  { margin-top: -6px; }
  .risk-badge--lg .risk-badge__inner  { margin-top: -10px; }

  .risk-badge__score {
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .risk-badge__denom {
    font-size: var(--text-body-sm);
    color: var(--on-surface-variant);
    font-weight: 500;
  }

  .risk-badge__label {
    margin-top: -4px;
  }

  .score-arc {
    transition: stroke-dasharray 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>
