<template>
  <footer class="terminal-footer">
    <div class="footer-container">
      <!-- NOAA Attribution -->
      <div class="attribution">
        <div class="noaa-info">
          <span class="prompt">$</span>
          <span class="data-source">Data Source: NOAA National Weather Service</span>
        </div>
        <div class="disclaimer">
          <span class="warning-icon">⚠️</span>
          <span class="disclaimer-text">
            For navigation safety, verify all forecasts with official NOAA sources
          </span>
        </div>
      </div>

      <!-- System Info -->
      <div class="system-info">
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Last Update:</span>
            <span class="value">{{ lastUpdateTime }}</span>
          </div>
          <div class="info-item">
            <span class="label">Data Latency:</span>
            <span class="value">{{ dataLatency }}</span>
          </div>
          <div class="info-item">
            <span class="label">API Status:</span>
            <span :class="['value', apiStatus]">{{ apiStatus.toUpperCase() }}</span>
          </div>
        </div>
      </div>

      <!-- Links -->
      <div class="footer-links">
        <a href="https://www.weather.gov/marine/" target="_blank" class="footer-link">
          NOAA Marine Forecasts
        </a>
        <a href="https://tidesandcurrents.noaa.gov/" target="_blank" class="footer-link">
          Tides & Currents
        </a>
        <a href="https://www.weather.gov/disclaimer" target="_blank" class="footer-link">
          Disclaimer
        </a>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// Reactive state
const lastUpdateTime = ref('')
const dataLatency = ref('< 5min')
const apiStatus = ref<'online' | 'degraded' | 'offline'>('online')

// Update footer information
const updateFooterInfo = () => {
  const now = new Date()
  lastUpdateTime.value = now.toLocaleTimeString('en-US', {
    hour12: false,
    timeZone: 'UTC',
    timeZoneName: 'short'
  })
}

// Check API status
const checkApiStatus = async () => {
  try {
    const start = Date.now()
    
    // Check both NOAA APIs
    const [weatherResponse, tidesResponse] = await Promise.allSettled([
      fetch('https://api.weather.gov/', { method: 'HEAD', mode: 'no-cors' }),
      fetch('https://api.tidesandcurrents.noaa.gov/', { method: 'HEAD', mode: 'no-cors' })
    ])
    
    const responseTime = Date.now() - start
    
    if (weatherResponse.status === 'fulfilled' && tidesResponse.status === 'fulfilled') {
      apiStatus.value = responseTime > 5000 ? 'degraded' : 'online'
      dataLatency.value = responseTime > 5000 ? '5-15min' : '< 5min'
    } else {
      apiStatus.value = 'degraded'
      dataLatency.value = '15-30min'
    }
  } catch (error) {
    apiStatus.value = 'offline'
    dataLatency.value = 'unknown'
  }
}

// Lifecycle hooks
onMounted(() => {
  updateFooterInfo()
  checkApiStatus()
  
  // Update every 30 seconds
  setInterval(updateFooterInfo, 30000)
  setInterval(checkApiStatus, 60000)
})
</script>

<style scoped>
.terminal-footer {
  background: var(--bg-secondary);
  border-top: 2px solid var(--border);
  padding: 2rem 0;
  margin-top: auto;
}

.footer-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  display: grid;
  gap: 2rem;
}

.attribution {
  border-bottom: 1px solid var(--border);
  padding-bottom: 1.5rem;
}

.noaa-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 600;
}

.prompt {
  color: var(--accent-blue);
}

.data-source {
  color: var(--text-primary);
}

.disclaimer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--warning);
  font-size: 0.9rem;
}

.warning-icon {
  font-size: 0.8rem;
}

.disclaimer-text {
  color: var(--text-muted);
}

.system-info {
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 4px;
  border: 1px solid var(--border);
}

.label {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.value {
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.8rem;
}

.value.online {
  color: var(--success);
}

.value.degraded {
  color: var(--warning);
}

.value.offline {
  color: var(--error);
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
}

.footer-link {
  color: var(--accent-blue);
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.25rem 0;
  border-bottom: 1px solid transparent;
  transition: all 0.3s ease;
}

.footer-link:hover {
  color: var(--text-primary);
  border-bottom-color: var(--accent-blue);
}

@media (max-width: 768px) {
  .footer-container {
    gap: 1.5rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .footer-links {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .disclaimer {
    flex-direction: column;
    text-align: center;
    gap: 0.25rem;
  }
}
</style>