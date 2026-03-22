<script>
  // Portfolio page — placeholder, to be built out
  // TODO: fetch saved properties from backend API — GET /api/portfolio
</script>

<svelte:head>
  <title>Portfolio — Property Risk Agent</title>
</svelte:head>

<div class="container portfolio-page">
  <div class="portfolio-hero">
    <span class="data-label">My Portfolio</span>
    <h1 class="portfolio-title">Saved Properties</h1>
    <p class="portfolio-sub">
      Properties you've analyzed and saved will appear here.
      Start by running an analysis from the <a href="/">home page</a>.
    </p>
    <a href="/" class="btn-primary">Run Your First Analysis</a>
  </div>
</div>

<style>
  .portfolio-page {
    padding-top: var(--space-16);
    padding-bottom: var(--space-16);
  }

  .portfolio-hero {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    max-width: 480px;
  }

  .portfolio-title {
    font-size: var(--text-headline-md);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--on-surface);
  }

  .portfolio-sub {
    font-size: var(--text-body-lg);
    color: var(--on-surface-variant);
    line-height: 1.65;
  }

  .portfolio-sub a {
    color: var(--primary);
    text-decoration: underline;
    text-decoration-color: rgba(0, 80, 203, 0.3);
  }
</style>
