<script>
  import { page } from '$app/stores';

  const navLinks = [
    { href: '/',         label: 'Home' },
    { href: '/results',  label: 'Results' },
    { href: '/map',      label: 'Maps' },
    { href: '/portfolio', label: 'Portfolio' },
  ];
</script>

<header class="navbar">
  <div class="container navbar__inner">
    <!-- Logo -->
    <a href="/" class="navbar__logo">
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <rect width="28" height="28" rx="6" fill="url(#logoGrad)"/>
        <path d="M14 5L20 10V22H8V10L14 5Z" stroke="white" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
        <path d="M11 22V16H17V22" stroke="white" stroke-width="1.5" stroke-linejoin="round"/>
        <circle cx="14" cy="13" r="1.5" fill="white"/>
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop stop-color="#0050cb"/>
            <stop offset="1" stop-color="#0066ff"/>
          </linearGradient>
        </defs>
      </svg>
      <span class="navbar__logo-text">Property<strong>Risk</strong></span>
    </a>

    <!-- Nav Links -->
    <nav class="navbar__nav" aria-label="Main navigation">
      {#each navLinks as link}
        <a
          href={link.href}
          class="navbar__link"
          class:navbar__link--active={$page.url.pathname === link.href}
          aria-current={$page.url.pathname === link.href ? 'page' : undefined}
        >
          {link.label}
        </a>
      {/each}
    </nav>

    <!-- Actions -->
    <div class="navbar__actions">
      <!-- Notifications -->
      <button class="navbar__icon-btn" type="button" title="Notifications" aria-label="Notifications">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span class="navbar__notif-dot" aria-hidden="true"></span>
      </button>

      <!-- Settings -->
      <button class="navbar__icon-btn" type="button" title="Settings" aria-label="Settings">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>
      </button>

      <!-- User Avatar -->
      <button class="navbar__avatar" type="button" title="User profile" aria-label="User profile">
        <span class="navbar__avatar-initials">JD</span>
      </button>

      <a href="/results" class="btn-primary navbar__cta">Run Analysis</a>
    </div>
  </div>
</header>

<style>
  .navbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(250, 248, 255, 0.85);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(194, 198, 216, 0.12);
  }

  .navbar__inner {
    display: flex;
    align-items: center;
    gap: var(--space-8);
    height: 64px;
  }

  .navbar__logo {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-shrink: 0;
  }

  .navbar__logo-text {
    font-size: var(--text-title-md);
    color: var(--on-surface);
    letter-spacing: -0.01em;
  }

  .navbar__logo-text strong {
    font-weight: 700;
    color: var(--primary);
  }

  .navbar__nav {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    flex: 1;
  }

  .navbar__link {
    padding: 0.375rem 0.875rem;
    border-radius: var(--radius-md);
    font-size: var(--text-body-md);
    font-weight: 500;
    color: var(--on-surface-variant);
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .navbar__link:hover {
    background: var(--surface-highest);
    color: var(--on-surface);
  }

  .navbar__link--active {
    background: var(--surface-highest);
    color: var(--on-surface);
    font-weight: 600;
  }

  .navbar__actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  .navbar__icon-btn {
    position: relative;
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    background: none;
    border: none;
    color: var(--on-surface-variant);
    cursor: pointer;
    transition: background var(--transition-fast), color var(--transition-fast);
  }

  .navbar__icon-btn:hover {
    background: var(--surface-highest);
    color: var(--on-surface);
  }

  .navbar__notif-dot {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--error);
    border: 1.5px solid rgba(250, 248, 255, 0.85);
  }

  .navbar__avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary), var(--primary-container));
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity var(--transition-fast);
  }

  .navbar__avatar:hover { opacity: 0.85; }

  .navbar__avatar-initials {
    font-size: 0.6875rem;
    font-weight: 700;
    color: white;
    letter-spacing: 0.02em;
  }

  .navbar__cta {
    padding: 0.5rem 1.125rem;
    font-size: var(--text-body-md);
    margin-left: var(--space-2);
  }
</style>
