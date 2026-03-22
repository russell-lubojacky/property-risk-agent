<script>
  import '../app.css';
  import NavBar from '$lib/components/NavBar.svelte';
</script>

<NavBar />

<main>
  <slot />
</main>

<style>
  main {
    min-height: calc(100vh - 64px);
  }
</style>
