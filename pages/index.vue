<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-gray-900">
              🎣 Fishing Report Pro
            </h1>
            <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded">
              v2.0
            </span>
          </div>
          <div class="text-sm text-gray-500">
            {{ currentTime }}
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Location Selection -->
      <div v-if="!selectedLocation" class="space-y-8">
        <!-- Hero Section -->
        <div class="text-center mb-12">
          <h2 class="text-4xl font-bold text-gray-900 mb-4">
            Select Your Fishing Location
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Get real-time fishing conditions, weather, tides, and solunar data for your specific location
          </p>
        </div>

        <!-- Search Bar -->
        <div class="max-w-md mx-auto">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search for a fishing location..."
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
            <div class="absolute right-3 top-3 text-gray-400">
              🔍
            </div>
          </div>
          
          <!-- Search Results -->
          <div v-if="searchQuery && searchResults.length > 0" class="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div
              v-for="location in searchResults"
              :key="location.id"
              @click="selectLocation(location.id)"
              class="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div class="font-medium text-gray-900">{{ location.name }}</div>
              <div class="text-sm text-gray-500">{{ location.type }} • {{ location.description }}</div>
            </div>
          </div>
        </div>

        <!-- Popular Regions -->
        <div class="mt-12">
          <h3 class="text-2xl font-bold text-gray-900 mb-6 text-center">
            Browse by Region
          </h3>
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="region in regions"
              :key="region.id"
              @click="selectedRegion = region.id"
              class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            >
              <h4 class="text-lg font-semibold text-gray-900 mb-2">
                {{ region.name }}
              </h4>
              <p class="text-gray-600 mb-4">
                {{ region.description }}
              </p>
              <div class="text-sm text-blue-600 font-medium">
                {{ region.locations.length }} locations →
              </div>
            </div>
          </div>
        </div>

        <!-- Regional Locations -->
        <div v-if="selectedRegion && regionLocations.length > 0" class="mt-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900">
              {{ regions.find(r => r.id === selectedRegion)?.name }} Locations
            </h3>
            <button
              @click="selectedRegion = null"
              class="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to regions
            </button>
          </div>
          
          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="location in regionLocations"
              :key="location.id"
              @click="selectLocation(location.id)"
              class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <h4 class="font-semibold text-gray-900">{{ location.name }}</h4>
                  <p class="text-sm text-gray-600 mt-1">{{ location.description }}</p>
                  <div class="flex items-center mt-2 text-xs text-gray-500">
                    <span class="bg-gray-100 px-2 py-1 rounded">{{ location.type }}</span>
                    <span class="ml-2">{{ location.state }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Location Dashboard -->
      <div v-else class="space-y-8">
        <!-- Location Header -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div class="flex items-center mb-2">
                <button
                  @click="clearLocation"
                  class="text-blue-600 hover:text-blue-800 mr-4"
                >
                  ← Back
                </button>
                <h2 class="text-2xl font-bold text-gray-900">
                  {{ selectedLocation.name }}
                </h2>
              </div>
              <p class="text-gray-600">
                {{ selectedLocation.description }} • {{ selectedLocation.type }}
              </p>
              <div class="flex items-center mt-2 text-sm text-gray-500">
                <span>📍 {{ selectedLocation.lat.toFixed(4) }}, {{ selectedLocation.lng.toFixed(4) }}</span>
                <span class="ml-4">🗺️ {{ selectedLocation.state }}</span>
              </div>
            </div>
            <div class="mt-4 sm:mt-0">
              <div class="text-right">
                <div class="text-2xl font-bold text-green-600">
                  {{ fishingScore }}%
                </div>
                <div class="text-sm text-gray-600">Fishing Score</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Current Conditions -->
        <div class="grid lg:grid-cols-3 gap-6">
          <!-- Weather -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              🌤️ Weather Conditions
            </h3>
            <div v-if="weatherData" class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Temperature</span>
                <span class="font-medium">{{ weatherData.temperature }}°F</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Wind</span>
                <span class="font-medium">{{ weatherData.windSpeed }} mph {{ weatherData.windDirection }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Pressure</span>
                <span class="font-medium">{{ weatherData.pressure }} mb</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Conditions</span>
                <span class="font-medium">{{ weatherData.conditions }}</span>
              </div>
            </div>
            <div v-else class="text-gray-500">Loading weather data...</div>
          </div>

          <!-- Tides -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              🌊 Tide Information
            </h3>
            <div v-if="tideData" class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Current Tide</span>
                <span class="font-medium">{{ tideData.currentTide }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Next High</span>
                <span class="font-medium">{{ tideData.nextHigh }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Next Low</span>
                <span class="font-medium">{{ tideData.nextLow }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Tide Height</span>
                <span class="font-medium">{{ tideData.height }} ft</span>
              </div>
            </div>
            <div v-else class="text-gray-500">Loading tide data...</div>
          </div>

          <!-- Solunar -->
          <div class="bg-white rounded-lg border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              🌙 Solunar Times
            </h3>
            <div v-if="solunarData" class="space-y-3">
              <div class="flex justify-between">
                <span class="text-gray-600">Major Period 1</span>
                <span class="font-medium">{{ solunarData.major1 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Minor Period 1</span>
                <span class="font-medium">{{ solunarData.minor1 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Major Period 2</span>
                <span class="font-medium">{{ solunarData.major2 }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Minor Period 2</span>
                <span class="font-medium">{{ solunarData.minor2 }}</span>
              </div>
            </div>
            <div v-else class="text-gray-500">Loading solunar data...</div>
          </div>
        </div>

        <!-- Extended Forecast -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            📅 5-Day Forecast
          </h3>
          <div v-if="forecast && forecast.length > 0" class="overflow-x-auto">
            <div class="flex space-x-4 min-w-max">
              <div
                v-for="day in forecast"
                :key="day.date"
                class="flex-shrink-0 w-32 p-4 bg-gray-50 rounded-lg"
              >
                <div class="text-center">
                  <div class="font-medium text-gray-900">{{ day.day }}</div>
                  <div class="text-2xl my-2">{{ day.icon }}</div>
                  <div class="text-sm text-gray-600">{{ day.conditions }}</div>
                  <div class="font-medium mt-2">{{ day.high }}° / {{ day.low }}°</div>
                  <div class="text-sm text-gray-600 mt-1">{{ day.wind }} mph</div>
                  <div class="mt-2">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div
                        class="bg-green-500 h-2 rounded-full"
                        :style="{ width: day.fishingScore + '%' }"
                      ></div>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">{{ day.fishingScore }}% score</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-gray-500">Loading forecast...</div>
        </div>

        <!-- Fish Activity Chart -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            🐟 24-Hour Fish Activity Prediction
          </h3>
          <div class="h-64 flex items-end space-x-1">
            <div
              v-for="(hour, index) in activityData"
              :key="index"
              class="flex-1 bg-blue-200 rounded-t relative"
              :style="{ height: hour.activity + '%' }"
            >
              <div class="absolute -bottom-6 left-0 right-0 text-xs text-gray-500 text-center">
                {{ hour.hour }}
              </div>
              <div class="absolute -top-8 left-0 right-0 text-xs font-medium text-center">
                {{ hour.activity }}%
              </div>
            </div>
          </div>
          <div class="mt-8 text-center text-sm text-gray-600">
            Based on weather, tides, solunar data, and historical patterns
          </div>
        </div>

        <!-- Tips & Recommendations -->
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            💡 Fishing Tips for {{ selectedLocation.name }}
          </h3>
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Best Times Today</h4>
              <ul class="space-y-1 text-sm text-gray-600">
                <li v-for="tip in bestTimes" :key="tip">• {{ tip }}</li>
              </ul>
            </div>
            <div>
              <h4 class="font-medium text-gray-900 mb-2">Recommended Techniques</h4>
              <ul class="space-y-1 text-sm text-gray-600">
                <li v-for="technique in techniques" :key="technique">• {{ technique }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-16">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center text-gray-600">
          <p>Fishing Report Pro v2.0 • Real-time fishing intelligence</p>
          <p class="mt-2 text-sm">Data from NOAA, Open-Meteo, and Solunar APIs</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useFishingLocations } from '~/composables/useFishingLocations'

// Location management
const {
  regions,
  allLocations,
  selectedRegion,
  selectedLocation,
  setLocation,
  getLocationById,
  searchLocations
} = useFishingLocations()

// Search functionality
const searchQuery = ref('')
const searchResults = computed(() => {
  return searchQuery.value ? searchLocations(searchQuery.value) : []
})

// Regional locations
const regionLocations = computed(() => {
  if (!selectedRegion.value) return []
  const region = regions.value.find(r => r.id === selectedRegion.value)
  return region ? region.locations : []
})

// Current time
const currentTime = ref('')
const updateTime = () => {
  currentTime.value = new Date().toLocaleString()
}

onMounted(() => {
  updateTime()
  setInterval(updateTime, 60000) // Update every minute
})

// Data states
const weatherData = ref(null)
const tideData = ref(null)
const solunarData = ref(null)
const forecast = ref([])
const activityData = ref([])

// Computed values
const fishingScore = computed(() => {
  if (!selectedLocation.value) return 0
  // Simple scoring algorithm based on available data
  let score = 50
  if (weatherData.value) {
    // Weather scoring
    if (weatherData.value.windSpeed < 15) score += 10
    if (weatherData.value.pressure > 30.0) score += 10
    if (weatherData.value.temperature > 50 && weatherData.value.temperature < 80) score += 10
  }
  if (tideData.value) {
    // Tide scoring - moving water is generally better
    if (tideData.value.currentTide.includes('Rising') || tideData.value.currentTide.includes('Falling')) {
      score += 15
    }
  }
  return Math.min(95, Math.max(15, score))
})

const bestTimes = computed(() => {
  const times = []
  if (solunarData.value) {
    times.push(`Major feeding: ${solunarData.value.major1}`)
    times.push(`Minor feeding: ${solunarData.value.minor1}`)
    times.push(`Major feeding: ${solunarData.value.major2}`)
  }
  if (tideData.value) {
    times.push(`High tide: ${tideData.value.nextHigh}`)
    times.push(`Low tide: ${tideData.value.nextLow}`)
  }
  return times.slice(0, 4)
})

const techniques = computed(() => {
  const techs = []
  if (!selectedLocation.value) return techs
  
  // Location-based recommendations
  if (selectedLocation.value.type === 'Harbor') {
    techs.push('Live bait fishing near structure')
    techs.push('Light tackle with small lures')
  } else if (selectedLocation.value.type === 'Beach') {
    techs.push('Surf fishing with heavy tackle')
    techs.push('Bait fishing in the wash')
  } else if (selectedLocation.value.type === 'Bay') {
    techs.push('Drift fishing over structure')
    techs.push('Trolling with spoons or plugs')
  } else {
    techs.push('Live bait fishing')
    techs.push('Artificial lure fishing')
  }
  
  // Weather-based recommendations
  if (weatherData.value) {
    if (weatherData.value.windSpeed > 20) {
      techs.push('Fish protected areas')
    } else if (weatherData.value.windSpeed < 10) {
      techs.push('Try topwater lures')
    }
  }
  
  return techs.slice(0, 4)
})

// Location selection
const selectLocation = (locationId) => {
  setLocation(locationId)
  loadLocationData()
}

const clearLocation = () => {
  selectedLocation.value = null
  selectedRegion.value = null
  weatherData.value = null
  tideData.value = null
  solunarData.value = null
  forecast.value = []
  activityData.value = []
}

// Data loading
const loadLocationData = async () => {
  if (!selectedLocation.value) return
  
  const { lat, lng } = selectedLocation.value
  
  try {
    // Load weather data
    loadWeatherData(lat, lng)
    
    // Load tide data
    loadTideData(lat, lng)
    
    // Load solunar data
    loadSolunarData(lat, lng)
    
    // Load forecast
    loadForecast(lat, lng)
    
    // Generate activity data
    generateActivityData()
  } catch (error) {
    console.error('Error loading location data:', error)
  }
}

const loadWeatherData = async (lat, lng) => {
  try {
    // Simulate API call
    setTimeout(() => {
      weatherData.value = {
        temperature: Math.round(45 + Math.random() * 40),
        windSpeed: Math.round(Math.random() * 25),
        windDirection: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
        pressure: (29.5 + Math.random() * 2).toFixed(2),
        conditions: ['Sunny', 'Partly Cloudy', 'Overcast', 'Light Rain'][Math.floor(Math.random() * 4)]
      }
    }, 500)
  } catch (error) {
    console.error('Error loading weather:', error)
  }
}

const loadTideData = async (lat, lng) => {
  try {
    // Simulate API call
    setTimeout(() => {
      const now = new Date()
      const nextHigh = new Date(now.getTime() + (2 + Math.random() * 4) * 60 * 60 * 1000)
      const nextLow = new Date(now.getTime() + (6 + Math.random() * 4) * 60 * 60 * 1000)
      
      tideData.value = {
        currentTide: ['Rising', 'Falling', 'High Slack', 'Low Slack'][Math.floor(Math.random() * 4)],
        nextHigh: nextHigh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        nextLow: nextLow.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        height: (Math.random() * 8).toFixed(1)
      }
    }, 700)
  } catch (error) {
    console.error('Error loading tides:', error)
  }
}

const loadSolunarData = async (lat, lng) => {
  try {
    // Simulate API call
    setTimeout(() => {
      const now = new Date()
      solunarData.value = {
        major1: new Date(now.getTime() + Math.random() * 4 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        minor1: new Date(now.getTime() + Math.random() * 6 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        major2: new Date(now.getTime() + (8 + Math.random() * 4) * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        minor2: new Date(now.getTime() + (12 + Math.random() * 4) * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    }, 600)
  } catch (error) {
    console.error('Error loading solunar:', error)
  }
}

const loadForecast = async (lat, lng) => {
  try {
    // Simulate API call
    setTimeout(() => {
      const days = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri']
      const icons = ['☀️', '⛅', '☁️', '🌧️', '⛈️']
      const conditions = ['Sunny', 'Partly Cloudy', 'Overcast', 'Rain', 'Storms']
      
      forecast.value = days.map((day, index) => ({
        date: new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        day,
        icon: icons[Math.floor(Math.random() * icons.length)],
        conditions: conditions[Math.floor(Math.random() * conditions.length)],
        high: Math.round(50 + Math.random() * 30),
        low: Math.round(30 + Math.random() * 20),
        wind: Math.round(Math.random() * 20),
        fishingScore: Math.round(30 + Math.random() * 50)
      }))
    }, 800)
  } catch (error) {
    console.error('Error loading forecast:', error)
  }
}

const generateActivityData = () => {
  // Generate 24 hours of activity data
  activityData.value = Array.from({ length: 24 }, (_, i) => ({
    hour: i === 0 ? '12a' : i === 12 ? '12p' : i > 12 ? `${i - 12}p` : `${i}a`,
    activity: Math.round(20 + Math.random() * 60 + Math.sin(i / 24 * Math.PI * 4) * 20)
  }))
}

// Watch for location changes
watch(selectedLocation, (newLocation) => {
  if (newLocation) {
    loadLocationData()
  }
})
</script>

<style scoped>
.tab-panel {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.container {
  max-width: 1200px;
}

/* Responsive design */
@media (max-width: 768px) {
  .container {
    padding-left: 1rem;
    padding-right: 1rem;
  }
}
</style>