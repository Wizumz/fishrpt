<template>
  <div class="marine-dashboard">
    <!-- Location Selection -->
    <section class="location-selector">
      <h1 class="terminal-title">
        <span class="prompt">$</span> Marine Weather Terminal
      </h1>
      <LocationPicker @location-selected="handleLocationSelected" />
    </section>

    <!-- Main Content -->
    <div v-if="selectedLocation" class="forecast-content">
      <!-- Current Forecast Summary -->
      <section class="forecast-summary">
        <h2 class="section-title">
          <span class="prompt">></span> {{ selectedLocation.name }} - Current Forecast
        </h2>
        <ForecastSummary 
          :location="selectedLocation" 
          :forecast-data="forecastData" 
        />
      </section>

      <!-- Tidal Charts -->
      <section class="tidal-section">
        <h2 class="section-title">
          <span class="prompt">></span> Tidal Information
        </h2>
        <TidalCharts 
          :location="selectedLocation"
          :tidal-data="tidalData" 
        />
      </section>

      <!-- Swell Information -->
      <section class="swell-section">
        <h2 class="section-title">
          <span class="prompt">></span> Swell & Wave Data
        </h2>
        <SwellCharts 
          :location="selectedLocation"
          :swell-data="swellData" 
        />
      </section>
    </div>

    <!-- Loading State -->
    <div v-else class="loading-state">
      <div class="terminal-prompt">
        <span class="blinking-cursor">_</span>
        <p>Select a marine forecast location to begin...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MarineLocation, ForecastData, TidalData, SwellData } from '~/types/marine'

// Reactive state
const selectedLocation = ref<MarineLocation | null>(null)
const forecastData = ref<ForecastData | null>(null)
const tidalData = ref<TidalData | null>(null)
const swellData = ref<SwellData | null>(null)
const isLoading = ref(false)

// Composables
const { fetchMarineForecast } = useMarineForecast()
const { fetchTidalData } = useTidalData()
const { fetchSwellData } = useSwellData()

// Handle location selection
const handleLocationSelected = async (location: MarineLocation) => {
  selectedLocation.value = location
  isLoading.value = true

  try {
    // Fetch all data in parallel
    const [forecast, tidal, swell] = await Promise.all([
      fetchMarineForecast(location),
      fetchTidalData(location),
      fetchSwellData(location)
    ])

    forecastData.value = forecast
    tidalData.value = tidal
    swellData.value = swell
  } catch (error) {
    console.error('Error fetching marine data:', error)
    // Show error notification
  } finally {
    isLoading.value = false
  }
}

// SEO and meta
useHead({
  title: 'Marine Weather Dashboard - NOAA Terminal',
  meta: [
    { name: 'description', content: 'Real-time marine weather forecasts, tidal charts, and swell data from NOAA sources' }
  ]
})
</script>

<style scoped>
.marine-dashboard {
  padding: 2rem 1rem;
  max-width: 1400px;
  margin: 0 auto;
}

.location-selector {
  margin-bottom: 3rem;
}

.terminal-title {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: var(--text-primary);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.section-title {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border);
  padding-bottom: 0.5rem;
}

.prompt {
  color: var(--accent-blue);
  margin-right: 1rem;
}

.forecast-content {
  display: grid;
  gap: 3rem;
}

.forecast-summary,
.tidal-section,
.swell-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 2rem;
}

.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  text-align: center;
}

.terminal-prompt {
  font-size: 1.2rem;
}

.blinking-cursor {
  animation: blink 1s infinite;
  color: var(--text-primary);
  font-weight: bold;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
}

@media (max-width: 768px) {
  .marine-dashboard {
    padding: 1rem 0.5rem;
  }
  
  .terminal-title {
    font-size: 2rem;
  }
  
  .forecast-summary,
  .tidal-section,
  .swell-section {
    padding: 1rem;
  }
}
</style>