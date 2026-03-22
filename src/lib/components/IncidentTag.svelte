<script>
  /**
   * IncidentTag — small pill indicating a nearby incident type.
   *
   * Props:
   *   type  {'flood'|'power'|'water'|'subsidence'|'seismic'|'info'}
   *   label {string}
   *   distance {string}   e.g. "0.2 mi"
   *   timeAgo  {string}   e.g. "4 days ago"
   */
  export let type = 'info';
  export let label = '';
  export let distance = '';
  export let timeAgo = '';

  const typeConfig = {
    flood:      { icon: '🌊', color: 'var(--primary)',   bg: 'var(--primary-fixed)' },
    power:      { icon: '⚡',  color: '#c97b00',         bg: '#fff3d6' },
    water:      { icon: '💧',  color: 'var(--tertiary)', bg: 'var(--tertiary-container)' },
    subsidence: { icon: '⚠️',  color: 'var(--error)',    bg: 'var(--error-container)' },
    seismic:    { icon: '📡',  color: 'var(--error)',    bg: 'var(--error-container)' },
    info:       { icon: 'ℹ️',  color: 'var(--secondary)', bg: 'var(--secondary-container)' },
  };

  $: cfg = typeConfig[type] ?? typeConfig.info;
</script>

<div class="incident-tag" style="--tag-color: {cfg.color}; --tag-bg: {cfg.bg};">
  <span class="incident-tag__icon" aria-hidden="true">{cfg.icon}</span>
  <div class="incident-tag__body">
    <span class="incident-tag__label">{label}</span>
    {#if distance || timeAgo}
      <span class="incident-tag__meta">
        {#if distance}{distance}{/if}
        {#if distance && timeAgo} · {/if}
        {#if timeAgo}{timeAgo}{/if}
      </span>
    {/if}
  </div>
</div>

<style>
  .incident-tag {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-md);
    background: var(--tag-bg);
    transition: background var(--transition-fast);
  }

  .incident-tag:hover {
    filter: brightness(0.97);
  }

  .incident-tag__icon {
    font-size: 1.125rem;
    line-height: 1;
    flex-shrink: 0;
  }

  .incident-tag__body {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .incident-tag__label {
    font-size: var(--text-body-md);
    font-weight: 500;
    color: var(--on-surface);
  }

  .incident-tag__meta {
    font-size: var(--text-label-md);
    color: var(--on-surface-variant);
  }
</style>
