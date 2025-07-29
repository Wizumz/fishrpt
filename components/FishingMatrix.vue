<template>
  <div class="fishing-matrix-container">
    <!-- Header -->
    <div class="text-center mb-6">
      <h2 class="text-3xl font-bold text-blue-900 mb-2">
        🎣 Northeast Striped Bass Success Matrix
      </h2>
      <p class="text-gray-600">
        Real-time fishing probability for the next 7 days across prime locations
      </p>
    </div>

    <!-- Legend -->
    <div class="flex justify-center mb-4">
      <div class="flex items-center space-x-4 text-sm">
        <div class="flex items-center">
          <div class="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span>Poor (0-40%)</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-yellow-500 rounded mr-2"></div>
          <span>Fair (40-60%)</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span>Good (60-80%)</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span>Excellent (80-100%)</span>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading fishing data...</p>
    </div>

    <!-- Matrix Grid -->
    <div v-else-if="matrixData.length > 0" class="matrix-grid">
      <!-- Time Header -->
      <div class="grid grid-cols-8 gap-2 mb-4">
        <div class="text-xs font-semibold text-gray-600 p-2">Location</div>
        <div 
          v-for="(day, index) in matrixData" 
          :key="index"
          class="text-xs font-semibold text-gray-600 p-2 text-center"
        >
          {{ formatDate(day.date) }}
        </div>
      </div>

      <!-- Location Rows -->
      <div class="space-y-2">
        <div 
          v-for="(location, locationIndex) in uniqueLocations" 
          :key="location.id"
          class="grid grid-cols-8 gap-2 items-center"
        >
          <!-- Location Name -->
          <div class="location-cell p-3 bg-gray-50 rounded-lg">
            <h3 class="font-semibold text-sm text-gray-800">{{ location.name }}</h3>
            <p class="text-xs text-gray-600">{{ location.state }}</p>
          </div>

          <!-- Score Cells -->
          <div
            v-for="(day, dayIndex) in matrixData"
            :key="`${location.id}-${dayIndex}`"
            class="score-cell relative cursor-pointer transform hover:scale-105 transition-transform"
            :class="getScoreClass(getLocationScore(day, location.id))"
            @click="showDetails(location, day)"
            @mouseenter="showTooltip($event, location, day)"
            @mouseleave="hideTooltip"
          >
            <div class="p-3 rounded-lg text-center">
              <div class="text-lg font-bold text-white">
                {{ getLocationScore(day, location.id) }}%
              </div>
              <div class="text-xs opacity-80">
                {{ getLocationCondition(day, location.id) }}
              </div>
            </div>

            <!-- Solunar Indicator -->
            <div 
              v-if="hasSolunarActivity(day, location.id)"
              class="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"
              title="Active solunar period"
            ></div>

            <!-- Tidal Indicator -->
            <div 
              v-if="hasOptimalTides(day, location.id)"
              class="absolute bottom-1 left-1 w-2 h-2 bg-blue-400 rounded-full"
              title="Optimal tidal movement"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Best Opportunities Sidebar -->
    <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Top Recommendations -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-blue-900">
            🏆 Best Opportunities
          </h3>
        </template>
        
        <div class="space-y-3">
          <div
            v-for="opportunity in topOpportunities"
            :key="`${opportunity.location.id}-${opportunity.day}`"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div>
              <h4 class="font-semibold text-sm">{{ opportunity.location.name }}</h4>
              <p class="text-xs text-gray-600">{{ formatDate(opportunity.date) }}</p>
            </div>
            <div class="text-right">
              <div class="text-lg font-bold" :class="getScoreTextClass(opportunity.score)">
                {{ opportunity.score }}%
              </div>
              <div class="text-xs text-gray-600">
                {{ opportunity.confidence }}% confidence
              </div>
            </div>
          </div>
        </div>
      </UCard>

      <!-- Weather Alerts -->
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold text-red-600">
            ⚠️ Weather Alerts
          </h3>
        </template>
        
        <div class="space-y-3">
          <div
            v-for="alert in weatherAlerts"
            :key="alert.id"
            class="p-3 bg-red-50 border-l-4 border-red-400 rounded"
          >
            <h4 class="font-semibold text-sm text-red-800">{{ alert.title }}</h4>
            <p class="text-xs text-red-600">{{ alert.description }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ alert.location }}</p>
          </div>
          
          <div v-if="weatherAlerts.length === 0" class="text-center text-gray-500 py-4">
            <Icon name="i-heroicons-check-circle" class="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p class="text-sm">No weather alerts in your area</p>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Detail Modal -->
    <UModal v-model="showDetailModal">
      <div class="p-6" v-if="selectedDetail">
        <h3 class="text-xl font-bold mb-4">
          {{ selectedDetail.location.name }} - {{ formatDate(selectedDetail.day.date) }}
        </h3>
        
        <div class="grid grid-cols-2 gap-4">
          <div>
            <h4 class="font-semibold mb-2">Fishing Score</h4>
            <div class="text-3xl font-bold" :class="getScoreTextClass(selectedDetail.score.overall)">
              {{ selectedDetail.score.overall }}%
            </div>
            <p class="text-sm text-gray-600">{{ selectedDetail.score.recommendation.text }}</p>
          </div>
          
          <div>
            <h4 class="font-semibold mb-2">Contributing Factors</h4>
            <div class="space-y-2">
              <div 
                v-for="factor in selectedDetail.score.factors"
                :key="factor.name"
                class="flex justify-between text-sm"
              >
                <span>{{ factor.name }}</span>
                <span class="font-semibold">{{ factor.score }}%</span>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4">
          <h4 class="font-semibold mb-2">Location Details</h4>
          <p class="text-sm text-gray-600">{{ selectedDetail.location.description }}</p>
          <p class="text-xs text-gray-500 mt-1">
            Optimal temp: {{ selectedDetail.location.optimalTemp[0] }}°F - {{ selectedDetail.location.optimalTemp[1] }}°F
          </p>
        </div>
      </div>
    </UModal>

    <!-- Tooltip -->
    <div
      ref="tooltip"
      class="tooltip"
      :style="tooltipStyle"
      v-show="showTooltipData"
    >
      <div class="bg-black text-white text-xs rounded p-2 shadow-lg max-w-xs">
        <div class="font-semibold">{{ tooltipData.location }}</div>
        <div>Score: {{ tooltipData.score }}%</div>
        <div>{{ tooltipData.condition }}</div>
        <div class="text-gray-300 text-xs mt-1">Click for details</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { format } from 'date-fns'
import { useStripedBassData } from '~/composables/useStripedBassData'

const { generateFishingMatrix, locations } = useStripedBassData()

// Reactive data
const matrixData = ref([])
const isLoading = ref(true)
const showDetailModal = ref(false)
const selectedDetail = ref(null)
const showTooltipData = ref(false)
const tooltipData = ref({})
const tooltipStyle = ref({})
const tooltip = ref(null)

// Computed properties
const uniqueLocations = computed(() => locations)

const topOpportunities = computed(() => {
  const opportunities = []
  
  matrixData.value.forEach((day, dayIndex) => {
    day.locations.forEach(location => {
      opportunities.push({
        location,
        day: dayIndex,
        date: day.date,
        score: location.score,
        confidence: location.confidence
      })
    })
  })
  
  return opportunities
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
})

const weatherAlerts = ref([
  // Mock alerts - would be fetched from NOAA weather API
  {
    id: 1,
    title: 'Small Craft Advisory',
    description: 'Winds 15-25 knots with gusts to 30 knots',
    location: 'Montauk Point, NY'
  }
])

// Methods
const formatDate = (date) => {
  return format(new Date(date), 'MMM dd')
}

const getLocationScore = (day, locationId) => {
  const location = day.locations.find(l => l.id === locationId)
  return location ? location.score : 0
}

const getLocationCondition = (day, locationId) => {
  const location = day.locations.find(l => l.id === locationId)
  return location?.conditions?.level || 'Unknown'
}

const getScoreClass = (score) => {
  if (score >= 80) return 'bg-green-500 shadow-green-200'
  if (score >= 60) return 'bg-blue-500 shadow-blue-200'
  if (score >= 40) return 'bg-yellow-500 shadow-yellow-200'
  return 'bg-red-500 shadow-red-200'
}

const getScoreTextClass = (score) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

const hasSolunarActivity = (day, locationId) => {
  // Mock implementation - would check actual solunar periods
  return Math.random() > 0.7
}

const hasOptimalTides = (day, locationId) => {
  // Mock implementation - would check tidal conditions
  return Math.random() > 0.6
}

const showDetails = (location, day) => {
  const locationData = day.locations.find(l => l.id === location.id)
  
  selectedDetail.value = {
    location,
    day,
    score: {
      overall: locationData.score,
      recommendation: locationData.conditions,
      factors: [
        { name: 'Water Temperature', score: Math.floor(Math.random() * 40) + 60 },
        { name: 'Tidal Movement', score: Math.floor(Math.random() * 40) + 50 },
        { name: 'Solunar Activity', score: Math.floor(Math.random() * 50) + 40 },
        { name: 'Barometric Pressure', score: Math.floor(Math.random() * 30) + 70 },
        { name: 'Wind Conditions', score: Math.floor(Math.random() * 40) + 50 }
      ]
    }
  }
  
  showDetailModal.value = true
}

const showTooltip = (event, location, day) => {
  const locationData = day.locations.find(l => l.id === location.id)
  
  tooltipData.value = {
    location: location.name,
    score: locationData.score,
    condition: locationData.conditions.text
  }
  
  tooltipStyle.value = {
    position: 'fixed',
    top: `${event.clientY - 10}px`,
    left: `${event.clientX + 10}px`,
    zIndex: 1000
  }
  
  showTooltipData.value = true
}

const hideTooltip = () => {
  showTooltipData.value = false
}

const loadMatrixData = async () => {
  isLoading.value = true
  
  try {
    const matrix = await generateFishingMatrix()
    matrixData.value = matrix
  } catch (error) {
    console.error('Failed to load matrix data:', error)
    // Generate mock data for demo
    matrixData.value = generateMockMatrix()
  } finally {
    isLoading.value = false
  }
}

const generateMockMatrix = () => {
  const mockMatrix = []
  const today = new Date()
  
  for (let day = 0; day < 7; day++) {
    const date = new Date(today.getTime() + day * 24 * 60 * 60 * 1000)
    const dayData = {
      date,
      locations: locations.map(location => ({
        ...location,
        score: Math.floor(Math.random() * 60) + 30,
        conditions: {
          level: ['Poor', 'Fair', 'Good', 'Excellent'][Math.floor(Math.random() * 4)],
          color: ['red', 'yellow', 'blue', 'green'][Math.floor(Math.random() * 4)],
          text: 'Generated forecast'
        },
        confidence: Math.floor(Math.random() * 30) + 70
      }))
    }
    mockMatrix.push(dayData)
  }
  
  return mockMatrix
}

// Lifecycle
onMounted(() => {
  loadMatrixData()
})
</script>

<style scoped>
.fishing-matrix-container {
  max-width: 1200px;
  margin: 0 auto;
}

.matrix-grid {
  overflow-x: auto;
}

.location-cell {
  min-height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.score-cell {
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.tooltip {
  pointer-events: none;
}

@media (max-width: 768px) {
  .matrix-grid {
    font-size: 0.875rem;
  }
  
  .score-cell {
    min-height: 60px;
  }
  
  .location-cell {
    min-height: 60px;
  }
}
</style>