<script>
  /**
   * RiskFactorRow — a single row in a risk breakdown list.
   *
   * Props:
   *   label    {string}
   *   value    {string}
   *   score    {number}   0–100 (used for bar width)
   *   severity {'low'|'medium'|'high'}
   */
  export let label = '';
  export let value = '';
  export let score = 0;
  export let severity = 'low';

  const severityColor = {
    low:    'var(--tertiary)',
    medium: '#c97b00',
    high:   'var(--error)',
  };

  $: barColor = severityColor[severity] ?? severityColor.low;
</script>

<div class="risk-row">
  <div class="risk-row__header">
    <span class="risk-row__label">{label}</span>
    <span class="risk-row__value" style="color: {barColor};">{value}</span>
  </div>
  <div class="risk-row__bar-track">
    <div
      class="risk-row__bar-fill"
      style="width: {score}%; background: {barColor};"
      role="progressbar"
      aria-valuenow={score}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="{label} risk level"
    ></div>
  </div>
</div>

<style>
  .risk-row {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-3) 0;
  }

  .risk-row__header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }

  .risk-row__label {
    font-size: var(--text-body-md);
    color: var(--on-surface-variant);
    font-weight: 500;
  }

  .risk-row__value {
    font-size: var(--text-body-md);
    font-weight: 600;
    letter-spacing: 0.01em;
  }

  .risk-row__bar-track {
    height: 4px;
    background: var(--surface-highest);
    border-radius: var(--radius-full);
    overflow: hidden;
  }

  .risk-row__bar-fill {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
</style>
