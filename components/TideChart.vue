<template>
  <div class="tide-chart-container">
    <canvas ref="chartCanvas"></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
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
  Title,
  Tooltip,
  Legend,
  Filler
)

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const chartCanvas = ref(null)
let chartInstance = null

const createChart = async () => {
  if (!chartCanvas.value || !props.data.length) return

  await nextTick()

  const ctx = chartCanvas.value.getContext('2d')
  
  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  // Process tide data
  const processedData = processTideData(props.data)
  
  chartInstance = new ChartJS(ctx, {
    type: 'line',
    data: {
      labels: processedData.labels,
      datasets: [
        {
          label: 'Tide Height',
          data: processedData.heights,
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#0ea5e9',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Tide Chart - Next 7 Days',
          font: {
            size: 16,
            weight: 'bold'
          },
          color: '#1e40af'
        },
        legend: {
          display: false
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
              const height = context.parsed.y
              const time = context.label
              return `${height.toFixed(2)} ft at ${time}`
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
            text: 'Height (feet)',
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
              return value.toFixed(1) + ' ft'
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

const processTideData = (tideData) => {
  if (!tideData || !Array.isArray(tideData)) {
    return { labels: [], heights: [] }
  }

  const labels = []
  const heights = []
  
  tideData.forEach(tide => {
    if (tide.t && tide.v) {
      // Format time for display
      const date = new Date(tide.t)
      const timeLabel = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
      
      labels.push(timeLabel)
      heights.push(parseFloat(tide.v))
    }
  })
  
  return { labels, heights }
}

// Watch for data changes
watch(() => props.data, () => {
  createChart()
}, { deep: true })

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
.tide-chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

@media (max-width: 640px) {
  .tide-chart-container {
    height: 250px;
  }
}
</style>