<template>
  <div class="weather-chart">
    <!-- Chart Type Selector -->
    <div class="chart-selector mb-4">
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="chart in chartTypes"
          :key="chart.key"
          :variant="activeChart === chart.key ? 'solid' : 'outline'"
          :color="activeChart === chart.key ? 'blue' : 'gray'"
          size="sm"
          @click="activeChart = chart.key"
        >
          {{ chart.icon }} {{ chart.label }}
        </UButton>
      </div>
    </div>

    <!-- Chart Container -->
    <div class="chart-container">
      <canvas ref="chartCanvas"></canvas>
    </div>

    <!-- Weather Summary Cards -->
    <div class="weather-summary mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="summary-card">
        <div class="text-center p-3 bg-blue-50 rounded-lg">
          <div class="text-2xl mb-1">🌡️</div>
          <div class="text-xs text-gray-600">Current Temp</div>
          <div class="font-bold text-blue-900">{{ currentTemp }}°F</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="text-center p-3 bg-green-50 rounded-lg">
          <div class="text-2xl mb-1">💨</div>
          <div class="text-xs text-gray-600">Wind Speed</div>
          <div class="font-bold text-green-900">{{ currentWind }} mph</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="text-center p-3 bg-purple-50 rounded-lg">
          <div class="text-2xl mb-1">💧</div>
          <div class="text-xs text-gray-600">Humidity</div>
          <div class="font-bold text-purple-900">{{ currentHumidity }}%</div>
        </div>
      </div>
      <div class="summary-card">
        <div class="text-center p-3 bg-orange-50 rounded-lg">
          <div class="text-2xl mb-1">👁️</div>
          <div class="text-xs text-gray-600">Visibility</div>
          <div class="font-bold text-orange-900">{{ currentVisibility }} mi</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      current: {},
      forecast: []
    })
  }
})

const chartCanvas = ref(null)
const activeChart = ref('temperature')
let chartInstance = null

const chartTypes = [
  { key: 'temperature', label: 'Temperature', icon: '🌡️' },
  { key: 'wind', label: 'Wind', icon: '💨' },
  { key: 'humidity', label: 'Humidity', icon: '💧' },
  { key: 'pressure', label: 'Pressure', icon: '🌪️' }
]

// Computed properties for current conditions
const currentTemp = computed(() => {
  return Math.round(props.data.current?.temperature_2m || 0)
})

const currentWind = computed(() => {
  return Math.round(props.data.current?.wind_speed_10m || 0)
})

const currentHumidity = computed(() => {
  return Math.round(props.data.current?.relative_humidity_2m || 0)
})

const currentVisibility = computed(() => {
  // Estimate visibility based on humidity and other factors
  const humidity = props.data.current?.relative_humidity_2m || 50
  const visibility = Math.max(1, 10 - (humidity - 30) / 10)
  return Math.round(visibility)
})

const createChart = async () => {
  if (!chartCanvas.value || !props.data.forecast?.length) return

  await nextTick()

  const ctx = chartCanvas.value.getContext('2d')
  
  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const chartData = getChartData(activeChart.value)
  
  chartInstance = new ChartJS(ctx, {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: getChartTitle(activeChart.value),
          font: {
            size: 16,
            weight: 'bold'
          },
          color: '#1e40af'
        },
        legend: {
          display: chartData.datasets.length > 1,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#ffffff',
          bodyColor: '#ffffff',
          borderColor: '#0ea5e9',
          borderWidth: 1,
          callbacks: {
            label: function(context) {
              const value = context.parsed.y
              const unit = getUnit(activeChart.value)
              return `${context.dataset.label}: ${value.toFixed(1)}${unit}`
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Time',
            color: '#6b7280',
            font: {
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: '#6b7280',
            maxTicksLimit: 8
          }
        },
        y: {
          title: {
            display: true,
            text: getYAxisLabel(activeChart.value),
            color: '#6b7280',
            font: {
              weight: 'bold'
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          },
          ticks: {
            color: '#6b7280',
            callback: function(value) {
              return value.toFixed(1) + getUnit(activeChart.value)
            }
          }
        }
      },
      interaction: {
        mode: 'nearest',
        axis: 'x',
        intersect: false
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutCubic'
      }
    }
  })
}

const getChartData = (chartType) => {
  const labels = []
  const data = []
  
  // Process forecast data (show next 48 hours)
  const forecastData = props.data.forecast?.slice(0, 48) || []
  
  forecastData.forEach((item, index) => {
    const date = new Date()
    date.setHours(date.getHours() + index)
    
    labels.push(date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric'
    }))
    
    switch (chartType) {
      case 'temperature':
        data.push(item.temperature_2m || 0)
        break
      case 'wind':
        data.push(item.wind_speed_10m || 0)
        break
      case 'humidity':
        data.push(item.relative_humidity_2m || 0)
        break
      case 'pressure':
        data.push((item.surface_pressure || 1013) / 10) // Convert to easier reading
        break
      default:
        data.push(0)
    }
  })

  const color = getChartColor(chartType)
  
  return {
    labels,
    datasets: [
      {
        label: getDatasetLabel(chartType),
        data,
        borderColor: color.border,
        backgroundColor: color.background,
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: color.border,
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5
      }
    ]
  }
}

const getChartColor = (chartType) => {
  const colors = {
    temperature: {
      border: '#f97316',
      background: 'rgba(249, 115, 22, 0.1)'
    },
    wind: {
      border: '#0ea5e9',
      background: 'rgba(14, 165, 233, 0.1)'
    },
    humidity: {
      border: '#8b5cf6',
      background: 'rgba(139, 92, 246, 0.1)'
    },
    pressure: {
      border: '#10b981',
      background: 'rgba(16, 185, 129, 0.1)'
    }
  }
  
  return colors[chartType] || colors.temperature
}

const getChartTitle = (chartType) => {
  const titles = {
    temperature: '🌡️ Temperature Forecast (48 Hours)',
    wind: '💨 Wind Speed Forecast (48 Hours)',
    humidity: '💧 Humidity Forecast (48 Hours)',
    pressure: '🌪️ Atmospheric Pressure (48 Hours)'
  }
  
  return titles[chartType] || 'Weather Forecast'
}

const getDatasetLabel = (chartType) => {
  const labels = {
    temperature: 'Temperature',
    wind: 'Wind Speed',
    humidity: 'Humidity',
    pressure: 'Pressure'
  }
  
  return labels[chartType] || 'Value'
}

const getYAxisLabel = (chartType) => {
  const labels = {
    temperature: 'Temperature (°F)',
    wind: 'Speed (mph)',
    humidity: 'Humidity (%)',
    pressure: 'Pressure (kPa)'
  }
  
  return labels[chartType] || 'Value'
}

const getUnit = (chartType) => {
  const units = {
    temperature: '°F',
    wind: ' mph',
    humidity: '%',
    pressure: ' kPa'
  }
  
  return units[chartType] || ''
}

// Watch for data changes
watch(() => props.data, () => {
  createChart()
}, { deep: true })

// Watch for chart type changes
watch(activeChart, () => {
  createChart()
})

onMounted(() => {
  createChart()
})

// Cleanup on unmount
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
  }
})
</script>

<style scoped>
.weather-chart {
  @apply w-full;
}

.chart-container {
  position: relative;
  height: 350px;
  width: 100%;
}

.chart-selector {
  @apply border-b border-gray-200 pb-4;
}

.weather-summary {
  @apply border-t border-gray-200 pt-4;
}

.summary-card {
  @apply transition-all duration-200;
}

.summary-card:hover {
  @apply transform scale-105;
}

@media (max-width: 640px) {
  .chart-container {
    height: 280px;
  }
  
  .weather-summary {
    @apply grid-cols-2;
  }
}
</style>