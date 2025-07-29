<template>
  <div class="tidal-charts">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <span class="loading-text">Loading tidal data...</span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <span class="error-icon">⚠️</span>
      <span class="error-text">{{ error }}</span>
    </div>

    <!-- Tidal Content -->
    <div v-else-if="tidalData" class="tidal-content">
      <!-- Current Tide Info -->
      <div class="current-tide-info">
        <div class="tide-station">
          <h3 class="station-name">{{ tidalData.stationName }}</h3>
          <p class="station-id">Station ID: {{ tidalData.stationId }}</p>
        </div>
        
        <div class="next-tides">
          <div v-if="nextHighTide" class="next-tide high-tide">
            <div class="tide-label">Next High Tide</div>
            <div class="tide-time">{{ formatTime(nextHighTide.time) }}</div>
            <div class="tide-height">{{ formatHeight(nextHighTide.height) }}</div>
          </div>
          
          <div v-if="nextLowTide" class="next-tide low-tide">
            <div class="tide-label">Next Low Tide</div>
            <div class="tide-time">{{ formatTime(nextLowTide.time) }}</div>
            <div class="tide-height">{{ formatHeight(nextLowTide.height) }}</div>
          </div>
        </div>
      </div>

      <!-- Chart Container -->
      <div class="chart-container">
        <canvas ref="chartCanvas" class="tide-chart"></canvas>
      </div>

      <!-- Tide Extremes Table -->
      <div class="extremes-section">
        <h4 class="extremes-title">
          <span class="prompt">></span> High & Low Tides
        </h4>
        
        <div class="extremes-grid">
          <!-- High Tides -->
          <div class="extreme-column">
            <h5 class="extreme-header">High Tides</h5>
            <div class="extreme-list">
              <div 
                v-for="tide in tidalData.extremes.highTide.slice(0, 6)" 
                :key="`high-${tide.time}`"
                class="extreme-item high"
              >
                <span class="extreme-time">{{ formatTime(tide.time) }}</span>
                <span class="extreme-height">{{ formatHeight(tide.height) }}</span>
              </div>
            </div>
          </div>

          <!-- Low Tides -->
          <div class="extreme-column">
            <h5 class="extreme-header">Low Tides</h5>
            <div class="extreme-list">
              <div 
                v-for="tide in tidalData.extremes.lowTide.slice(0, 6)" 
                :key="`low-${tide.time}`"
                class="extreme-item low"
              >
                <span class="extreme-time">{{ formatTime(tide.time) }}</span>
                <span class="extreme-height">{{ formatHeight(tide.height) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No Data State -->
    <div v-else class="no-data">
      <span class="no-data-icon">🌊</span>
      <span class="no-data-text">No tidal data available for this location</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Chart, type ChartConfiguration } from 'chart.js/auto'
import 'chartjs-adapter-date-fns'
import type { MarineLocation, TidalData, TidalPrediction } from '~/types/marine'

// Props
const props = defineProps<{
  location: MarineLocation
  tidalData: TidalData | null
}>()

// Refs
const chartCanvas = ref<HTMLCanvasElement | null>(null)
const chart = ref<Chart | null>(null)

// Reactive state
const loading = ref(false)
const error = ref<string | null>(null)

// Composables
const { formatTime, formatHeight, getNextTide } = useTidalData()

// Computed properties
const nextHighTide = computed(() => {
  if (!props.tidalData) return null
  const allTides = [...props.tidalData.today, ...props.tidalData.tomorrow]
  return getNextTide(allTides, 'high')
})

const nextLowTide = computed(() => {
  if (!props.tidalData) return null
  const allTides = [...props.tidalData.today, ...props.tidalData.tomorrow]
  return getNextTide(allTides, 'low')
})

// Create tidal chart
const createChart = () => {
  if (!chartCanvas.value || !props.tidalData) return

  // Destroy existing chart
  if (chart.value) {
    chart.value.destroy()
  }

  // Prepare data for chart
  const todayData = prepareChartData(props.tidalData.today, 'today')
  const tomorrowData = prepareChartData(props.tidalData.tomorrow, 'tomorrow')
  const dayAfterData = prepareChartData(props.tidalData.dayAfter, 'dayAfter')

  const chartConfig: ChartConfiguration = {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Today',
          data: todayData,
          borderColor: '#0080ff', // Royal blue for today
          backgroundColor: 'rgba(0, 128, 255, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 5
        },
        {
          label: 'Tomorrow',
          data: tomorrowData,
          borderColor: '#666666', // Grey for forecast
          backgroundColor: 'rgba(102, 102, 102, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4
        },
        {
          label: 'Day After',
          data: dayAfterData,
          borderColor: '#444444', // Darker grey for day after
          backgroundColor: 'rgba(68, 68, 68, 0.05)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Tidal Predictions',
          color: '#cccccc',
          font: {
            family: 'JetBrains Mono, monospace',
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#cccccc',
            font: {
              family: 'JetBrains Mono, monospace',
              size: 12
            },
            usePointStyle: true,
            pointStyle: 'line'
          }
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
              return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} ft`
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
            },
            tooltipFormat: 'MMM dd, yyyy ha'
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
            text: 'Height (ft MLLW)',
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

// Prepare data for Chart.js
const prepareChartData = (predictions: TidalPrediction[], day: string) => {
  return predictions.map(prediction => ({
    x: new Date(prediction.time).getTime(),
    y: prediction.height
  }))
}

// Watch for data changes
watch(() => props.tidalData, () => {
  if (props.tidalData) {
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
.tidal-charts {
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

.current-tide-info {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.tide-station {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.station-name {
  color: var(--text-primary);
  font-size: 1.3rem;
  margin: 0;
}

.station-id {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin: 0;
}

.next-tides {
  display: flex;
  gap: 2rem;
}

.next-tide {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 1rem;
  border-radius: 6px;
  min-width: 120px;
}

.next-tide.high-tide {
  background: rgba(0, 128, 255, 0.1);
  border: 1px solid var(--accent-blue);
}

.next-tide.low-tide {
  background: rgba(102, 102, 102, 0.1);
  border: 1px solid var(--accent-grey);
}

.tide-label {
  color: var(--text-muted);
  font-size: 0.8rem;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.tide-time {
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.tide-height {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.chart-container {
  height: 400px;
  margin-bottom: 2rem;
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 1rem;
  border: 1px solid var(--border);
}

.tide-chart {
  width: 100% !important;
  height: 100% !important;
}

.extremes-section {
  margin-top: 2rem;
}

.extremes-title {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.prompt {
  color: var(--accent-blue);
  margin-right: 0.5rem;
}

.extremes-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.extreme-column {
  background: var(--bg-tertiary);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid var(--border);
}

.extreme-header {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1rem;
  text-align: center;
}

.extreme-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.extreme-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.extreme-item.high {
  background: rgba(0, 128, 255, 0.05);
  border-left: 3px solid var(--accent-blue);
}

.extreme-item.low {
  background: rgba(102, 102, 102, 0.05);
  border-left: 3px solid var(--accent-grey);
}

.extreme-item:hover {
  background: var(--bg-primary);
}

.extreme-time {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.extreme-height {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.9rem;
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
  .current-tide-info {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .next-tides {
    flex-direction: column;
    gap: 1rem;
  }
  
  .extremes-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .chart-container {
    height: 300px;
    padding: 0.5rem;
  }
  
  .extreme-column {
    padding: 1rem;
  }
}
</style>