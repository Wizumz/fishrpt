<template>
  <div class="swell-charts">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <span class="loading-text">Loading wave data...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{{ error }}</span>
    </div>

    <!-- Swell Content -->
    <div v-else-if="swellData" class="swell-content">
      <!-- Current Conditions -->
      <div class="current-conditions">
        <div class="condition-header">
          <h3 class="location-name">{{ swellData.location }}</h3>
          <p v-if="swellData.buoyId" class="buoy-info">Buoy ID: {{ swellData.buoyId }}</p>
        </div>

        <div class="conditions-grid">
          <!-- Wave Height -->
          <div class="condition-card primary">
            <div class="condition-icon">🌊</div>
            <div class="condition-content">
              <div class="condition-label">Wave Height</div>
              <div class="condition-value">{{ formatWaveHeight(swellData.current.waveHeight) }}</div>
              <div class="condition-description">{{ getWaveConditionDescription(swellData.current.waveHeight) }}</div>
            </div>
          </div>

          <!-- Wave Period -->
          <div class="condition-card">
            <div class="condition-icon">⏱️</div>
            <div class="condition-content">
              <div class="condition-label">Period</div>
              <div class="condition-value">{{ formatPeriod(swellData.current.period) }}</div>
              <div class="condition-description">Wave interval</div>
            </div>
          </div>

          <!-- Wave Direction -->
          <div class="condition-card">
            <div class="condition-icon">🧭</div>
            <div class="condition-content">
              <div class="condition-label">Direction</div>
              <div class="condition-value">{{ formatDirection(swellData.current.direction) }}</div>
              <div class="condition-description">Wave origin</div>
            </div>
          </div>
        </div>

        <!-- Wind Waves vs Swell Breakdown -->
        <div v-if="swellData.current.windWaves && swellData.current.swell" class="wave-breakdown">
          <h4 class="breakdown-title">
            <span class="prompt">></span> Wave Composition
          </h4>
          
          <div class="breakdown-grid">
            <!-- Wind Waves -->
            <div class="breakdown-item">
              <div class="breakdown-header">
                <span class="breakdown-icon">💨</span>
                <span class="breakdown-name">Wind Waves</span>
              </div>
              <div class="breakdown-stats">
                <div class="stat">
                  <span class="stat-label">Height:</span>
                  <span class="stat-value">{{ formatWaveHeight(swellData.current.windWaves.height) }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Period:</span>
                  <span class="stat-value">{{ formatPeriod(swellData.current.windWaves.period) }}</span>
                </div>
              </div>
            </div>

            <!-- Swell -->
            <div class="breakdown-item">
              <div class="breakdown-header">
                <span class="breakdown-icon">🌊</span>
                <span class="breakdown-name">Swell</span>
              </div>
              <div class="breakdown-stats">
                <div class="stat">
                  <span class="stat-label">Height:</span>
                  <span class="stat-value">{{ formatWaveHeight(swellData.current.swell.height) }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Period:</span>
                  <span class="stat-value">{{ formatPeriod(swellData.current.swell.period) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Forecast Chart -->
      <div class="forecast-section">
        <h4 class="forecast-title">
          <span class="prompt">></span> Wave Forecast
        </h4>
        
        <div class="chart-container">
          <canvas ref="chartCanvas" class="wave-chart"></canvas>
        </div>
      </div>

      <!-- Forecast Table -->
      <div class="forecast-table-section">
        <h4 class="table-title">
          <span class="prompt">></span> Detailed Forecast
        </h4>
        
        <div class="forecast-table">
          <div class="table-header">
            <div class="header-cell">Time</div>
            <div class="header-cell">Wave Height</div>
            <div class="header-cell">Period</div>
            <div class="header-cell">Direction</div>
            <div class="header-cell">Confidence</div>
          </div>
          
          <div class="table-body">
            <div 
              v-for="forecast in swellData.forecast.slice(0, 8)" 
              :key="forecast.time"
              class="table-row"
            >
              <div class="table-cell time">{{ formatForecastTime(forecast.time) }}</div>
              <div class="table-cell height">{{ formatWaveHeight(forecast.waveHeight) }}</div>
              <div class="table-cell period">{{ formatPeriod(forecast.period) }}</div>
              <div class="table-cell direction">{{ formatDirection(forecast.direction) }}</div>
              <div class="table-cell confidence">
                <span :class="['confidence-badge', forecast.confidence]">
                  {{ forecast.confidence.toUpperCase() }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Last Update -->
      <div class="metadata">
        <div class="metadata-item">
          <span class="metadata-label">Last Updated:</span>
          <span class="metadata-value">{{ formatLastUpdate(swellData.lastUpdate) }}</span>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="no-data">
      <span class="no-data-icon">🌊</span>
      <span class="no-data-text">No wave data available for this location</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Chart, type ChartConfiguration } from 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import type { MarineLocation, SwellData } from '~/types/marine'

// Props
const props = defineProps<{
  location: MarineLocation
  swellData: SwellData | null
}>()

// Refs
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const chart = ref<Chart | null>(null)

// Reactive state
const loading = ref(false)
const error = ref<string | null>(null)

// Composables
const { formatWaveHeight, formatPeriod, formatDirection, getWaveConditionDescription } = useSwellData()

// Format forecast time
const formatForecastTime = (timeString: string): string => {
  try {
    const date = new Date(timeString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      hour12: true
    })
  } catch {
    return timeString
  }
}

// Format last update time
const formatLastUpdate = (timeString: string): string => {
  try {
    const date = new Date(timeString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} min ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hr ago`
    
    return date.toLocaleDateString()
  } catch {
    return timeString
  }
}

// Create wave forecast chart
const createChart = () => {
  if (!chartCanvas.value || !props.swellData?.forecast.length) return

  // Destroy existing chart
  if (chart.value) {
    chart.value.destroy()
  }

  // Prepare chart data
  const chartData = props.swellData.forecast.map(forecast => ({
    x: new Date(forecast.time).getTime(),
    y: forecast.waveHeight
  }))

  const chartConfig: ChartConfiguration = {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Wave Height',
          data: chartData,
          borderColor: '#0080ff', // Royal blue
          backgroundColor: 'rgba(0, 128, 255, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#0080ff',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Wave Height Forecast',
          color: '#cccccc',
          font: {
            family: 'JetBrains Mono, monospace',
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(26, 26, 26, 0.95)',
          titleColor: '#00ff00',
          bodyColor: '#cccccc',
          borderColor: '#333333',
          borderWidth: 1,
          titleFont: {
            family: 'JetBrains Mono, monospace',
            size: 12
          },
          bodyFont: {
            family: 'JetBrains Mono, monospace',
            size: 11
          },
          callbacks: {
            title: (context) => {
              const date = new Date(context[0].parsed.x)
              return date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })
            },
            label: (context) => {
              const forecast = props.swellData!.forecast.find(f => 
                new Date(f.time).getTime() === context.parsed.x
              )
              const lines = [`Wave Height: ${context.parsed.y.toFixed(1)} ft`]
              if (forecast) {
                lines.push(`Period: ${forecast.period.toFixed(0)}s`)
                lines.push(`Direction: ${Math.round(forecast.direction)}°`)
                lines.push(`Confidence: ${forecast.confidence}`)
              }
              return lines
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            displayFormats: {
              hour: 'ha',
              day: 'MMM dd'
            }
          },
          grid: {
            color: '#333333',
            lineWidth: 1
          },
          ticks: {
            color: '#cccccc',
            font: {
              family: 'JetBrains Mono, monospace',
              size: 10
            }
          },
          title: {
            display: true,
            text: 'Time',
            color: '#cccccc',
            font: {
              family: 'JetBrains Mono, monospace',
              size: 12
            }
          }
        },
        y: {
          grid: {
            color: '#333333',
            lineWidth: 1
          },
          ticks: {
            color: '#cccccc',
            font: {
              family: 'JetBrains Mono, monospace',
              size: 10
            },
            callback: (value) => `${value} ft`
          },
          title: {
            display: true,
            text: 'Wave Height (ft)',
            color: '#cccccc',
            font: {
              family: 'JetBrains Mono, monospace',
              size: 12
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  }

  chart.value = new Chart(chartCanvas.value, chartConfig)
}

// Watch for data changes
watch(() => props.swellData, () => {
  if (props.swellData?.forecast.length) {
    nextTick(() => {
      createChart()
    })
  }
}, { immediate: true })

// Cleanup on unmount
onUnmounted(() => {
  if (chart.value) {
    chart.value.destroy()
  }
})
</script>

<style scoped>
.swell-charts {
  min-height: 400px;
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

.current-conditions {
  margin-bottom: 3rem;
}

.condition-header {
  margin-bottom: 2rem;
}

.location-name {
  color: var(--text-primary);
  font-size: 1.3rem;
  margin: 0 0 0.5rem 0;
}

.buoy-info {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
}

.conditions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.condition-card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.condition-card.primary {
  border-color: var(--accent-blue);
  background: rgba(0, 128, 255, 0.05);
}

.condition-card:hover {
  border-color: var(--accent-blue);
  transform: translateY(-2px);
}

.condition-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.condition-content {
  flex: 1;
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
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.condition-description {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.wave-breakdown {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--border);
}

.breakdown-title {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
}

.prompt {
  color: var(--accent-blue);
  margin-right: 0.5rem;
}

.breakdown-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.breakdown-item {
  background: var(--bg-primary);
  border-radius: 6px;
  padding: 1rem;
  border: 1px solid var(--border);
}

.breakdown-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.breakdown-icon {
  font-size: 1.2rem;
}

.breakdown-name {
  color: var(--text-primary);
  font-weight: 600;
}

.breakdown-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: var(--text-muted);
  font-size: 0.8rem;
}

.stat-value {
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
}

.forecast-section,
.forecast-table-section {
  margin-bottom: 3rem;
}

.forecast-title,
.table-title {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.chart-container {
  height: 300px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--border);
}

.wave-chart {
  width: 100% !important;
  height: 100% !important;
}

.forecast-table {
  background: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--border);
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.2fr 1fr;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border);
}

.header-cell {
  padding: 1rem;
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1.2fr 1fr;
  border-bottom: 1px solid var(--border);
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background: var(--bg-primary);
}

.table-row:last-child {
  border-bottom: none;
}

.table-cell {
  padding: 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.table-cell.time {
  color: var(--text-primary);
  font-weight: 600;
}

.confidence-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.confidence-badge.high {
  background: rgba(0, 255, 136, 0.2);
  color: var(--success);
}

.confidence-badge.medium {
  background: rgba(255, 170, 0, 0.2);
  color: var(--warning);
}

.confidence-badge.low {
  background: rgba(255, 68, 68, 0.2);
  color: var(--error);
}

.metadata {
  padding: 1rem;
  background: var(--bg-tertiary);
  border-radius: 6px;
  border: 1px solid var(--border);
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  
  .breakdown-grid {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    height: 250px;
    padding: 0.5rem;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .header-cell,
  .table-cell {
    padding: 0.75rem;
  }
  
  .condition-card {
    padding: 1rem;
  }
}
</style>