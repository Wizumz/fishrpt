<template>
  <div id="app" class="terminal-app">
    <TerminalHeader />
    <NuxtPage />
    <TerminalFooter />
  </div>
</template>

<script setup lang="ts">
// Set up the app with metadata and head configuration
useHead({
  title: 'Marine Weather Forecast - NOAA Data Terminal',
  meta: [
    { name: 'description', content: 'Professional marine weather forecasting with NOAA data integration, tidal charts, and AI-powered forecast summaries' },
    { name: 'keywords', content: 'marine weather, NOAA, tides, marine forecast, weather terminal' },
    { name: 'author', content: 'Marine Weather Terminal' }
  ],
  link: [
    { rel: 'canonical', href: 'https://example.com/fishrpt/' }
  ]
})

// Set up color scheme for dark theme
useColorMode({
  preference: 'dark',
  fallback: 'dark'
})
</script>

<style scoped>
.terminal-app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  color: var(--text-secondary);
}
</style>