<template>
  <div class="striped-bass-map-container">
    <!-- Map Header -->
    <div class="map-header bg-white shadow-sm rounded-lg p-4 mb-4">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 class="text-xl font-bold text-blue-900 mb-1">
            🗺️ Northeast Striped Bass Locations
          </h2>
          <p class="text-sm text-gray-600">
            Interactive map with real-time fishing conditions
          </p>
        </div>
        
        <!-- Map Controls -->
        <div class="flex items-center space-x-2 mt-4 md:mt-0">
          <USelectMenu 
            v-model="selectedLayer"
            :options="layerOptions"
            class="w-40"
          />
          <UButton 
            @click="centerOnBestLocation"
            size="sm"
            variant="outline"
            icon="i-heroicons-map-pin"
          >
            Best Spot
          </UButton>
          <UButton 
            @click="refreshData"
            size="sm"
            variant="outline"
            icon="i-heroicons-arrow-path"
            :loading="isRefreshing"
          >
            Refresh
          </UButton>
        </div>
      </div>
    </div>

    <!-- Map Container -->
    <div class="map-wrapper bg-white rounded-lg shadow-lg overflow-hidden">
      <div ref="mapContainer" class="map-container" style="height: 600px;">
        <!-- Loading overlay -->
        <div v-if="isLoading" class="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p class="text-sm text-gray-600">Loading map data...</p>
          </div>
        </div>

        <!-- Map will be rendered here -->
        <div id="leaflet-map" class="w-full h-full"></div>
      </div>

      <!-- Map Legend -->
      <div class="map-legend p-4 bg-gray-50 border-t">
        <div class="flex flex-wrap items-center justify-between">
          <div class="flex items-center space-x-4 text-sm">
            <div class="flex items-center">
              <div class="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Excellent (80-100%)</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span>Good (60-80%)</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span>Fair (40-60%)</span>
            </div>
            <div class="flex items-center">
              <div class="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span>Poor (0-40%)</span>
            </div>
          </div>
          
          <div class="text-xs text-gray-500 mt-2 md:mt-0">
            Last updated: {{ lastUpdated }}
          </div>
        </div>
      </div>
    </div>

    <!-- Location Details Panel -->
    <div v-if="selectedLocation" class="location-details mt-4 bg-white rounded-lg shadow-lg p-6">
      <div class="flex items-start justify-between mb-4">
        <div>
          <h3 class="text-xl font-bold text-blue-900">{{ selectedLocation.name }}</h3>
          <p class="text-gray-600">{{ selectedLocation.state }} • {{ selectedLocation.season }}</p>
        </div>
        <UButton 
          @click="selectedLocation = null"
          size="sm"
          variant="ghost"
          icon="i-heroicons-x-mark"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Current Conditions -->
        <div>
          <h4 class="font-semibold text-gray-800 mb-3">Current Conditions</h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Fishing Score</span>
              <div class="flex items-center">
                <div 
                  class="text-2xl font-bold mr-2"
                  :class="getScoreColor(selectedLocationData?.score || 0)"
                >
                  {{ selectedLocationData?.score || 0 }}%
                </div>
                <div 
                  class="w-3 h-3 rounded-full"
                  :class="getScoreBg(selectedLocationData?.score || 0)"
                ></div>
              </div>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Water Temp</span>
              <span class="font-semibold">{{ selectedLocationData?.waterTemp || 'N/A' }}°F</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Tidal State</span>
              <span class="font-semibold">{{ selectedLocationData?.tidalState || 'N/A' }}</span>
            </div>
            
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Wind</span>
              <span class="font-semibold">{{ selectedLocationData?.wind || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Location Info -->
        <div>
          <h4 class="font-semibold text-gray-800 mb-3">Location Details</h4>
          <div class="space-y-2 text-sm">
            <p><strong>Description:</strong> {{ selectedLocation.description }}</p>
            <p><strong>Structure:</strong> {{ selectedLocation.structure }}</p>
            <p><strong>Optimal Temp:</strong> {{ selectedLocation.optimalTemp[0] }}°F - {{ selectedLocation.optimalTemp[1] }}°F</p>
            <p><strong>Best Season:</strong> {{ selectedLocation.season }}</p>
          </div>
        </div>

        <!-- Forecast Chart -->
        <div>
          <h4 class="font-semibold text-gray-800 mb-3">7-Day Forecast</h4>
          <div class="forecast-mini-chart">
            <canvas ref="forecastChart" width="200" height="100"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch, computed } from 'vue'
import { format } from 'date-fns'
import { useStripedBassData } from '~/composables/useStripedBassData'

const { locations, fetchLocationData } = useStripedBassData()

// Reactive data
const mapContainer = ref(null)
const forecastChart = ref(null)
const selectedLocation = ref(null)
const selectedLocationData = ref(null)
const selectedLayer = ref('score')
const isLoading = ref(true)
const isRefreshing = ref(false)
const map = ref(null)
const markers = ref([])
const lastUpdated = ref(format(new Date(), 'MMM dd, HH:mm'))

// Map configuration
const mapCenter = [40.7589, -73.9851] // New York area
const mapZoom = 7

const layerOptions = [
  { label: 'Fishing Score', value: 'score' },
  { label: 'Water Temperature', value: 'temperature' },
  { label: 'Tidal Conditions', value: 'tides' },
  { label: 'Solunar Activity', value: 'solunar' }
]

// Computed
const lastUpdatedFormatted = computed(() => format(new Date(), 'MMM dd, HH:mm'))

// Methods
const initializeMap = async () => {
  if (process.client) {
    // Dynamic import of Leaflet for client-side only
    const L = await import('leaflet')
    
    // Initialize map
    map.value = L.map('leaflet-map').setView(mapCenter, mapZoom)
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map.value)
    
    // Load location data and add markers
    await loadLocationMarkers()
    
    isLoading.value = false
  }
}

const loadLocationMarkers = async () => {
  if (!map.value) return
  
  // Clear existing markers
  markers.value.forEach(marker => map.value.removeLayer(marker))
  markers.value = []
  
  for (const location of locations) {
    try {
      // Get current data for location (mock for demo)
      const mockData = {
        score: Math.floor(Math.random() * 60) + 30,
        waterTemp: Math.floor(Math.random() * 20) + 55,
        tidalState: ['Rising', 'High', 'Falling', 'Low'][Math.floor(Math.random() * 4)],
        wind: `${Math.floor(Math.random() * 15) + 5} mph ${['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)]}`
      }
      
      const marker = await createLocationMarker(location, mockData)
      markers.value.push(marker)
      
    } catch (error) {
      console.error(`Failed to create marker for ${location.name}:`, error)
    }
  }
}

const createLocationMarker = async (location, data) => {
  const L = await import('leaflet')
  
  // Create custom icon based on score
  const iconColor = getMarkerColor(data.score)
  const iconSize = getMarkerSize(data.score)
  
  const customIcon = L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-container">
        <div class="marker-circle" style="background-color: ${iconColor}; width: ${iconSize}px; height: ${iconSize}px;">
          <div class="marker-score">${data.score}%</div>
        </div>
        <div class="marker-pulse" style="border-color: ${iconColor};"></div>
      </div>
    `,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2]
  })
  
  // Create marker
  const marker = L.marker([location.lat, location.lng], { icon: customIcon })
    .addTo(map.value)
    .bindPopup(`
      <div class="marker-popup">
        <h3 class="font-bold text-blue-900">${location.name}</h3>
        <p class="text-sm text-gray-600 mb-2">${location.description}</p>
        <div class="flex justify-between text-sm">
          <span>Score: <strong class="${getScoreColor(data.score)}">${data.score}%</strong></span>
          <span>Temp: <strong>${data.waterTemp}°F</strong></span>
        </div>
        <button class="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600">
          View Details
        </button>
      </div>
    `)
    .on('click', () => selectLocation(location, data))
  
  return marker
}

const selectLocation = async (location, data = null) => {
  selectedLocation.value = location
  
  if (!data) {
    // Fetch real data
    try {
      const locationData = await fetchLocationData(location)
      selectedLocationData.value = {
        score: locationData.score.overall,
        waterTemp: locationData.weather.waterTemperature,
        tidalState: 'Rising', // Would come from tidal data
        wind: `${locationData.weather.windSpeed} mph ${locationData.weather.windDirection}°`
      }
    } catch (error) {
      // Use mock data
      selectedLocationData.value = {
        score: Math.floor(Math.random() * 60) + 30,
        waterTemp: Math.floor(Math.random() * 20) + 55,
        tidalState: 'Rising',
        wind: '10 mph NW'
      }
    }
  } else {
    selectedLocationData.value = data
  }
  
  // Pan map to location
  if (map.value) {
    map.value.setView([location.lat, location.lng], 10)
  }
  
  // Draw forecast chart
  await nextTick()
  drawForecastChart()
}

const centerOnBestLocation = () => {
  if (markers.value.length === 0) return
  
  // Find location with highest score (mock implementation)
  let bestLocation = locations[0]
  let bestScore = 0
  
  locations.forEach(location => {
    const score = Math.floor(Math.random() * 60) + 30
    if (score > bestScore) {
      bestScore = score
      bestLocation = location
    }
  })
  
  selectLocation(bestLocation)
}

const refreshData = async () => {
  isRefreshing.value = true
  
  try {
    await loadLocationMarkers()
    lastUpdated.value = format(new Date(), 'MMM dd, HH:mm')
  } catch (error) {
    console.error('Failed to refresh data:', error)
  } finally {
    isRefreshing.value = false
  }
}

const drawForecastChart = () => {
  if (!forecastChart.value) return
  
  const canvas = forecastChart.value
  const ctx = canvas.getContext('2d')
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // Generate mock 7-day data
  const data = Array.from({ length: 7 }, () => Math.floor(Math.random() * 60) + 30)
  
  // Draw simple line chart
  ctx.strokeStyle = '#3B82F6'
  ctx.lineWidth = 2
  ctx.beginPath()
  
  data.forEach((value, index) => {
    const x = (index * canvas.width) / (data.length - 1)
    const y = canvas.height - (value / 100) * canvas.height
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
  
  // Draw points
  ctx.fillStyle = '#3B82F6'
  data.forEach((value, index) => {
    const x = (index * canvas.width) / (data.length - 1)
    const y = canvas.height - (value / 100) * canvas.height
    
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, 2 * Math.PI)
    ctx.fill()
  })
}

// Helper functions
const getMarkerColor = (score) => {
  if (score >= 80) return '#10B981' // green
  if (score >= 60) return '#3B82F6' // blue
  if (score >= 40) return '#F59E0B' // yellow
  return '#EF4444' // red
}

const getMarkerSize = (score) => {
  if (score >= 80) return 40
  if (score >= 60) return 35
  if (score >= 40) return 30
  return 25
}

const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

const getScoreBg = (score) => {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

// Watchers
watch(selectedLayer, async () => {
  await loadLocationMarkers()
})

// Lifecycle
onMounted(async () => {
  await nextTick()
  await initializeMap()
})
</script>

<style scoped>
.striped-bass-map-container {
  max-width: 1200px;
  margin: 0 auto;
}

.map-wrapper {
  position: relative;
}

.forecast-mini-chart {
  width: 100%;
  height: 100px;
}

/* Custom marker styles */
:global(.custom-marker) {
  background: transparent !important;
  border: none !important;
}

:global(.marker-container) {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

:global(.marker-circle) {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 10;
  position: relative;
}

:global(.marker-score) {
  color: white;
  font-weight: bold;
  font-size: 11px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

:global(.marker-pulse) {
  position: absolute;
  border: 2px solid;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: pulse 2s infinite;
  opacity: 0.7;
}

@keyframes pulse {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

:global(.marker-popup) {
  min-width: 200px;
}

:global(.marker-popup h3) {
  margin: 0 0 8px 0;
}

:global(.marker-popup p) {
  margin: 0 0 8px 0;
}

:global(.marker-popup button) {
  transition: background-color 0.2s;
}

/* Leaflet overrides */
:global(.leaflet-popup-content-wrapper) {
  border-radius: 8px;
}

:global(.leaflet-popup-tip) {
  background: white;
}

@media (max-width: 768px) {
  .location-details {
    margin-top: 1rem;
  }
  
  .map-container {
    height: 400px !important;
  }
}
</style>