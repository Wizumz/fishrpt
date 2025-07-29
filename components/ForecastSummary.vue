<template>
  <div class="forecast-summary">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <span class="loading-text">Fetching marine forecast...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{{ error }}</span>
    </div>

    <!-- Forecast Content -->
    <div v-else-if="forecastData" class="forecast-content">
      <!-- AI Summary -->
      <div v-if="forecastData.summary" class="ai-summary">
        <h3 class="summary-title">
          <span class="prompt">></span> AI Summary
        </h3>
        <p class="summary-text">{{ forecastData.summary }}</p>
      </div>

      <!-- Current Conditions -->
      <div class="conditions-grid">
        <div class="condition-card">
          <div class="condition-label">Winds</div>
          <div class="condition-value">{{ forecastData.conditions.winds }}</div>
        </div>
        <div class="condition-card">
          <div class="condition-label">Seas</div>
          <div class="condition-value">{{ forecastData.conditions.seas }}</div>
        </div>
        <div class="condition-card">
          <div class="condition-label">Weather</div>
          <div class="condition-value">{{ forecastData.conditions.weather }}</div>
        </div>
        <div class="condition-card">
          <div class="condition-label">Visibility</div>
          <div class="condition-value">{{ forecastData.conditions.visibility }}</div>
        </div>
      </div>

      <!-- Synopsis -->
      <div v-if="forecastData.synopsis" class="synopsis-section">
        <h3 class="section-header">
          <span class="prompt">></span> Synopsis
        </h3>
        <p class="synopsis-text">{{ forecastData.synopsis }}</p>
      </div>

      <!-- Outlook -->
      <div v-if="forecastData.outlook.length > 0" class="outlook-section">
        <h3 class="section-header">
          <span class="prompt">></span> Outlook
        </h3>
        <ul class="outlook-list">
          <li v-for="(item, index) in forecastData.outlook" :key="index" class="outlook-item">
            {{ item }}
          </li>
        </ul>
      </div>

      <!-- Forecast Metadata -->
      <div class="metadata-section">
        <div class="metadata-grid">
          <div class="metadata-item">
            <span class="metadata-label">Issued:</span>
            <span class="metadata-value">{{ formatTime(forecastData.issueTime) }}</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Valid:</span>
            <span class="metadata-value">{{ forecastData.validTime }}</span>
          </div>
        </div>
      </div>

      <!-- Raw Forecast Toggle -->
      <div class="raw-forecast-toggle">
        <button @click="showRawForecast = !showRawForecast" class="toggle-button">
          <span class="prompt">$</span>
          {{ showRawForecast ? 'Hide' : 'Show' }} Raw Forecast
        </button>
        
        <div v-if="showRawForecast" class="raw-forecast">
          <pre class="raw-text">{{ forecastData.raw }}</pre>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="no-data">
      <span class="no-data-icon">📭</span>
      <span class="no-data-text">No forecast data available</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MarineLocation, ForecastData } from '~/types/marine'

// Props
const props = defineProps<{
  location: MarineLocation
  forecastData: ForecastData | null
}>()

// Reactive state
const showRawForecast = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

// Format timestamp for display
const formatTime = (timeString: string): string => {
  try {
    const date = new Date(timeString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return timeString
  }
}

// Watch for location changes
watch(() => props.location, () => {
  showRawForecast.value = false
  error.value = null
})
</script>

<style scoped>
.forecast-summary {
  min-height: 200px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--text-muted);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top: 3px solid var(--accent-blue);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--error);
  border-radius: 6px;
  color: var(--error);
}

.error-icon {
  font-size: 1.2rem;
}

.ai-summary {
  background: var(--bg-tertiary);
  border: 2px solid var(--accent-blue);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.summary-title {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.summary-text {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
}

.conditions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.condition-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1rem;
  transition: border-color 0.3s ease;
}

.condition-card:hover {
  border-color: var(--accent-blue);
}

.condition-label {
  color: var(--text-muted);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.condition-value {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.synopsis-section,
.outlook-section {
  margin-bottom: 2rem;
}

.section-header {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.prompt {
  color: var(--accent-blue);
  margin-right: 0.5rem;
}

.synopsis-text {
  color: var(--text-secondary);
  line-height: 1.6;
  background: var(--bg-tertiary);
  padding: 1rem;
  border-radius: 6px;
  border-left: 4px solid var(--accent-blue);
}

.outlook-list {
  list-style: none;
  padding: 0;
}

.outlook-item {
  color: var(--text-secondary);
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 6px;
  border-left: 3px solid var(--border);
  position: relative;
}

.outlook-item::before {
  content: '→';
  color: var(--accent-blue);
  margin-right: 0.5rem;
  font-weight: bold;
}

.metadata-section {
  margin-bottom: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 4px;
}

.metadata-label {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.metadata-value {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 0.8rem;
}

.raw-forecast-toggle {
  border-top: 1px solid var(--border);
  padding-top: 1.5rem;
}

.toggle-button {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.toggle-button:hover {
  background: var(--bg-primary);
  border-color: var(--accent-blue);
  color: var(--text-primary);
}

.raw-forecast {
  margin-top: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
}

.raw-text {
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 0.8rem;
  line-height: 1.4;
  padding: 1rem;
  margin: 0;
  white-space: pre-wrap;
  overflow-x: auto;
}

.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: var(--text-muted);
}

.no-data-icon {
  font-size: 2rem;
}

.no-data-text {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .conditions-grid {
    grid-template-columns: 1fr;
  }
  
  .metadata-grid {
    grid-template-columns: 1fr;
  }
  
  .condition-card,
  .synopsis-text,
  .outlook-item {
    padding: 0.75rem;
  }
  
  .ai-summary {
    padding: 1rem;
  }
}
</style>