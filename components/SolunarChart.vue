<template>
  <div class="solunar-chart">
    <!-- Moon Phase Display -->
    <div class="moon-phase-container mb-6">
      <div class="flex items-center justify-center space-x-4">
        <div class="moon-icon text-4xl">{{ getMoonIcon(data.moonPhase) }}</div>
        <div class="text-center">
          <h4 class="text-lg font-semibold text-blue-900">{{ data.moonPhase || 'Unknown' }}</h4>
          <p class="text-sm text-gray-600">{{ Math.round(data.moonIllumination || 0) }}% illuminated</p>
        </div>
      </div>
    </div>

    <!-- Solunar Times Display -->
    <div class="solunar-times grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Major Times -->
      <div class="major-times">
        <h4 class="text-md font-semibold text-green-700 mb-3 flex items-center">
          <span class="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          Major Feeding Times
        </h4>
        <div class="space-y-2">
          <div v-if="!data.majorTimes || data.majorTimes.length === 0" class="text-gray-500 text-sm">
            No major times available
          </div>
          <div v-for="(time, index) in data.majorTimes" :key="`major-${index}`" 
               class="bg-green-50 p-3 rounded-lg border-l-4 border-green-500">
            <div class="font-medium text-green-800">{{ formatTime(time.start) }} - {{ formatTime(time.end) }}</div>
            <div class="text-xs text-green-600">Peak activity period</div>
          </div>
        </div>
      </div>

      <!-- Minor Times -->
      <div class="minor-times">
        <h4 class="text-md font-semibold text-yellow-700 mb-3 flex items-center">
          <span class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
          Minor Feeding Times
        </h4>
        <div class="space-y-2">
          <div v-if="!data.minorTimes || data.minorTimes.length === 0" class="text-gray-500 text-sm">
            No minor times available
          </div>
          <div v-for="(time, index) in data.minorTimes" :key="`minor-${index}`" 
               class="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-500">
            <div class="font-medium text-yellow-800">{{ formatTime(time.start) }} - {{ formatTime(time.end) }}</div>
            <div class="text-xs text-yellow-600">Good activity period</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Solunar Activity Timeline -->
    <div class="mt-6">
      <h4 class="text-md font-semibold text-blue-900 mb-3">Daily Activity Timeline</h4>
      <div class="activity-timeline">
        <canvas ref="timelineCanvas" class="w-full h-16"></canvas>
      </div>
    </div>

    <!-- Best Times Summary -->
    <div class="best-times-summary mt-4 p-4 bg-blue-50 rounded-lg">
      <h5 class="font-semibold text-blue-900 mb-2">🎯 Best Fishing Times Today</h5>
      <div class="text-sm text-blue-800">
        <div v-if="getBestTimes().length > 0">
          <span v-for="(time, index) in getBestTimes()" :key="index">
            {{ time }}{{ index < getBestTimes().length - 1 ? ', ' : '' }}
          </span>
        </div>
        <div v-else>
          Times will be calculated based on your location and date.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: () => ({
      majorTimes: [],
      minorTimes: [],
      moonPhase: '',
      moonIllumination: 0
    })
  }
})

const timelineCanvas = ref(null)

const getMoonIcon = (phase) => {
  const phaseMap = {
    'new moon': '🌑',
    'waxing crescent': '🌒',
    'first quarter': '🌓',
    'waxing gibbous': '🌔',
    'full moon': '🌕',
    'waning gibbous': '🌖',
    'last quarter': '🌗',
    'third quarter': '🌗',
    'waning crescent': '🌘'
  }
  
  const lowerPhase = phase?.toLowerCase() || ''
  
  for (const [key, icon] of Object.entries(phaseMap)) {
    if (lowerPhase.includes(key) || lowerPhase.includes(key.replace(' ', ''))) {
      return icon
    }
  }
  
  return '🌙'
}

const formatTime = (timeString) => {
  if (!timeString) return 'N/A'
  
  try {
    const date = new Date(timeString)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  } catch (error) {
    return timeString
  }
}

const getBestTimes = () => {
  const times = []
  
  if (props.data.majorTimes) {
    props.data.majorTimes.forEach(time => {
      if (time.start) {
        times.push(formatTime(time.start))
      }
    })
  }
  
  return times.slice(0, 3) // Show top 3 times
}

const drawTimeline = () => {
  if (!timelineCanvas.value) return
  
  const canvas = timelineCanvas.value
  const ctx = canvas.getContext('2d')
  const rect = canvas.getBoundingClientRect()
  
  // Set canvas size
  canvas.width = rect.width * window.devicePixelRatio
  canvas.height = 64 * window.devicePixelRatio
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
  
  const width = rect.width
  const height = 64
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height)
  
  // Draw background timeline
  ctx.fillStyle = '#e5e7eb'
  ctx.fillRect(0, 25, width, 14)
  
  // Draw hour markers
  ctx.fillStyle = '#9ca3af'
  ctx.font = '10px sans-serif'
  ctx.textAlign = 'center'
  
  for (let i = 0; i <= 24; i += 6) {
    const x = (i / 24) * width
    ctx.fillRect(x - 0.5, 20, 1, 24)
    ctx.fillText(`${i}:00`, x, 15)
  }
  
  // Draw major times
  if (props.data.majorTimes) {
    props.data.majorTimes.forEach(time => {
      const startHour = getHourFromTime(time.start)
      const endHour = getHourFromTime(time.end)
      
      if (startHour !== null && endHour !== null) {
        const startX = (startHour / 24) * width
        const endX = (endHour / 24) * width
        
        ctx.fillStyle = 'rgba(34, 197, 94, 0.8)'
        ctx.fillRect(startX, 25, endX - startX, 14)
      }
    })
  }
  
  // Draw minor times
  if (props.data.minorTimes) {
    props.data.minorTimes.forEach(time => {
      const startHour = getHourFromTime(time.start)
      const endHour = getHourFromTime(time.end)
      
      if (startHour !== null && endHour !== null) {
        const startX = (startHour / 24) * width
        const endX = (endHour / 24) * width
        
        ctx.fillStyle = 'rgba(234, 179, 8, 0.8)'
        ctx.fillRect(startX, 25, endX - startX, 14)
      }
    })
  }
  
  // Draw current time indicator
  const now = new Date()
  const currentHour = now.getHours() + now.getMinutes() / 60
  const currentX = (currentHour / 24) * width
  
  ctx.strokeStyle = '#dc2626'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(currentX, 20)
  ctx.lineTo(currentX, 44)
  ctx.stroke()
  
  // Add current time label
  ctx.fillStyle = '#dc2626'
  ctx.font = '8px sans-serif'
  ctx.fillText('NOW', currentX, 55)
}

const getHourFromTime = (timeString) => {
  if (!timeString) return null
  
  try {
    const date = new Date(timeString)
    return date.getHours() + date.getMinutes() / 60
  } catch (error) {
    return null
  }
}

watch(() => props.data, () => {
  nextTick(() => {
    drawTimeline()
  })
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    drawTimeline()
  })
  
  // Redraw on window resize
  window.addEventListener('resize', drawTimeline)
})

onUnmounted(() => {
  window.removeEventListener('resize', drawTimeline)
})
</script>

<style scoped>
.solunar-chart {
  @apply w-full;
}

.moon-phase-container {
  @apply text-center;
}

.activity-timeline {
  @apply relative;
}

.activity-timeline canvas {
  @apply border border-gray-200 rounded;
}

.best-times-summary {
  border-left: 4px solid #3b82f6;
}

@media (max-width: 640px) {
  .solunar-times {
    @apply grid-cols-1;
  }
}
</style>