<template>
  <div class="min-h-screen bg-gray-900 text-gray-100">
    <!-- Header -->
    <header class="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-blue-400 flex items-center">
              🎣 Marine Conditions Pro
            </h1>
            <p class="text-sm text-gray-400">Professional marine weather and fishing conditions</p>
          </div>
          <div class="text-right">
            <div class="text-sm text-gray-400">Last Update</div>
            <div class="text-xs text-blue-400">{{ formatTime(new Date()) }}</div>
          </div>
        </div>
      </div>
    </header>

    <!-- Location Search -->
    <div class="container mx-auto px-4 py-6">
      <UCard class="bg-gray-800 border-gray-700">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-100 flex items-center">
            📍 Marine Location
          </h2>
        </template>
        
        <div class="space-y-4">
          <div class="flex gap-3">
            <UInput
              v-model="searchQuery"
              placeholder="Enter fishing spot, coordinates, or city..."
              size="lg"
              class="flex-1"
              :ui="{ base: 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' }"
              @keyup.enter="searchLocation"
            />
            <UButton 
              :loading="isSearching"
              color="blue" 
              size="lg"
              @click="searchLocation"
            >
              <Icon name="heroicons:magnifying-glass" class="w-5 h-5" />
            </UButton>
          </div>
          
          <div class="flex flex-wrap gap-2">
            <UButton 
              v-for="location in popularLocations" 
              :key="location.name"
              variant="outline" 
              size="sm"
              :ui="{ base: 'border-gray-600 text-gray-300 hover:bg-gray-700' }"
              @click="selectLocation(location)"
            >
              {{ location.name }}
            </UButton>
          </div>
        </div>
      </UCard>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="container mx-auto px-4">
      <div class="text-center py-12">
        <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p class="text-gray-300 text-lg">Loading marine conditions...</p>
        <p class="text-gray-500 text-sm mt-2">Gathering weather, tides, and swell data</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="container mx-auto px-4">
      <UAlert
        color="red"
        variant="soft"
        :title="error"
        class="mb-8"
      />
    </div>

    <!-- Main Dashboard -->
    <div v-if="reportData && !isLoading" class="container mx-auto px-4 pb-8">
      <!-- Location Header -->
      <div class="mb-6">
        <UCard class="bg-gray-800 border-gray-700">
          <div class="py-4">
            <h2 class="text-2xl font-bold text-gray-100 mb-2">{{ reportData.location }}</h2>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div class="text-center">
                <div class="text-gray-400">Water Temp</div>
                <div class="text-xl font-bold text-blue-400">{{ Math.round(reportData.waterTemp) }}°F</div>
              </div>
              <div class="text-center">
                <div class="text-gray-400">Air Temp</div>
                <div class="text-xl font-bold text-orange-400">{{ Math.round(reportData.airTemp) }}°F</div>
              </div>
              <div class="text-center">
                <div class="text-gray-400">Pressure</div>
                <div class="text-xl font-bold text-purple-400">{{ reportData.pressure.toFixed(2) }}"</div>
              </div>
              <div class="text-center">
                <div class="text-gray-400">Visibility</div>
                <div class="text-xl font-bold text-cyan-400">{{ reportData.visibility }} mi</div>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Left Column - Charts -->
        <div class="lg:col-span-3 space-y-6">
          <!-- Marine Conditions Chart -->
          <UCard class="bg-gray-800 border-gray-700">
            <template #header>
              <h3 class="text-lg font-semibold text-gray-100 flex items-center">
                🌊 Marine Conditions
              </h3>
            </template>
            
            <div class="h-80">
              <canvas ref="marineChart"></canvas>
            </div>
            
            <!-- Swell Safety Info -->
            <div class="mt-4 p-3 bg-gray-700 rounded-lg">
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center space-x-4">
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full bg-green-400"></div>
                    <span class="text-gray-300">Wind Speed (mph)</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div class="w-3 h-3 rounded-full bg-cyan-400"></div>
                    <span class="text-gray-300">Swell Height (ft)</span>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-xs text-gray-400">Current Swell Period: {{ reportData.swellPeriod }}s</div>
                  <div class="text-xs" :class="getSwellSafetyColor()">
                    {{ getSwellSafetyText() }}
                  </div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Water Temperature Trends -->
          <UCard class="bg-gray-800 border-gray-700">
            <template #header>
              <h3 class="text-lg font-semibold text-gray-100">🌡️ Water Temperature History</h3>
            </template>
            
            <div class="h-64">
              <canvas ref="tempChart"></canvas>
            </div>
            
            <div class="mt-4 grid grid-cols-3 gap-4 text-center text-sm">
              <div>
                <div class="text-lg font-bold text-blue-400">{{ Math.round(reportData.historicalTemp.current) }}°F</div>
                <div class="text-gray-400">Current</div>
              </div>
              <div>
                <div class="text-lg font-bold text-green-400">{{ Math.round(reportData.historicalTemp.average) }}°F</div>
                <div class="text-gray-400">30-Day Average</div>
              </div>
              <div>
                <div class="text-lg font-bold" :class="reportData.historicalTemp.trend > 0 ? 'text-red-400' : 'text-blue-400'">
                  {{ reportData.historicalTemp.trend > 0 ? '+' : '' }}{{ reportData.historicalTemp.trend.toFixed(1) }}°F
                </div>
                <div class="text-gray-400">7-Day Change</div>
              </div>
            </div>
          </UCard>

          <!-- Wind & Swell Direction Combined -->
          <UCard class="bg-gray-800 border-gray-700">
            <template #header>
              <h3 class="text-lg font-semibold text-gray-100">🧭 Wind & Swell Direction</h3>
            </template>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
              <!-- Combined Direction Display -->
              <div class="text-center">
                <h4 class="text-md font-semibold text-gray-200 mb-4">Current Conditions</h4>
                <div class="relative w-40 h-40 mx-auto mb-4">
                  <!-- Compass base -->
                  <div class="absolute inset-0 rounded-full border-4 border-gray-600"></div>
                  <div class="absolute inset-3 rounded-full border-2 border-gray-700"></div>
                  
                  <!-- Wind direction arrow -->
                  <div 
                    class="absolute top-1/2 left-1/2 w-1 h-16 bg-green-400 transform -translate-x-1/2 origin-bottom transition-transform duration-500"
                    :style="{ transform: `translate(-50%, -100%) rotate(${reportData.windDirection}deg)` }"
                  ></div>
                  
                  <!-- Swell direction arrow -->
                  <div 
                    class="absolute top-1/2 left-1/2 w-1 h-12 bg-cyan-400 transform -translate-x-1/2 origin-bottom transition-transform duration-500"
                    :style="{ transform: `translate(-50%, -100%) rotate(${reportData.waveDirection}deg)` }"
                  ></div>
                  
                  <!-- Compass directions -->
                  <div class="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 font-semibold">N</div>
                  <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 font-semibold">S</div>
                  <div class="absolute right-0 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 font-semibold">E</div>
                  <div class="absolute left-0 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 font-semibold">W</div>
                </div>
                
                <div class="space-y-2">
                  <div class="flex items-center justify-center space-x-2">
                    <div class="w-3 h-3 bg-green-400 rounded"></div>
                    <span class="text-sm text-gray-300">Wind: {{ getWindDirection(reportData.windDirection) }} {{ Math.round(reportData.windSpeed) }} mph</span>
                  </div>
                  <div class="flex items-center justify-center space-x-2">
                    <div class="w-3 h-3 bg-cyan-400 rounded"></div>
                    <span class="text-sm text-gray-300">Swell: {{ getWaveDirection(reportData.waveDirection) }} {{ reportData.waveHeight.toFixed(1) }} ft</span>
                  </div>
                </div>
              </div>

              <!-- Direction Analysis -->
              <div>
                <h4 class="text-md font-semibold text-gray-200 mb-4">Marine Analysis</h4>
                <div class="space-y-3 text-sm">
                  <div class="p-3 bg-gray-700 rounded">
                    <div class="font-semibold text-blue-400 mb-1">Wind Conditions</div>
                    <div class="text-gray-300">{{ getWindAnalysis() }}</div>
                  </div>
                  
                  <div class="p-3 bg-gray-700 rounded">
                    <div class="font-semibold text-cyan-400 mb-1">Swell Conditions</div>
                    <div class="text-gray-300">{{ getSwellAnalysis() }}</div>
                  </div>
                  
                  <div class="p-3 bg-gray-700 rounded">
                    <div class="font-semibold text-yellow-400 mb-1">Fishing Impact</div>
                    <div class="text-gray-300">{{ getFishingConditionsAnalysis() }}</div>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Right Column - Tides, Lunar, Weather -->
        <div class="space-y-6">
          <!-- Tides -->
          <UCard class="bg-gray-800 border-gray-700">
            <template #header>
              <h3 class="text-lg font-semibold text-gray-100">🌊 Tide Chart</h3>
            </template>
            
            <!-- Tide Chart -->
            <div class="h-48 mb-4">
              <canvas ref="tideChart"></canvas>
            </div>
            
            <!-- Next Tides -->
            <div class="space-y-2">
              <h4 class="font-semibold text-gray-200 text-sm">Next Tides</h4>
              <div 
                v-for="(tide, index) in reportData.tides.slice(0, 6)" 
                :key="index"
                class="flex justify-between items-center p-2 rounded"
                :class="index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-750'"
              >
                <div class="flex items-center space-x-2">
                  <div class="text-lg">{{ tide.type === 'High Tide' ? '⬆️' : '⬇️' }}</div>
                  <div>
                    <div class="text-sm font-semibold text-gray-100">{{ tide.type.replace(' Tide', '') }}</div>
                    <div class="text-xs text-gray-400">{{ tide.t }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="text-sm font-bold text-cyan-400">{{ tide.v }} ft</div>
                  <div class="text-xs text-gray-500">{{ getTimeFromNow(tide.t) }}</div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Lunar Table -->
          <UCard class="bg-gray-800 border-gray-700">
            <template #header>
              <h3 class="text-lg font-semibold text-gray-100">🌙 Lunar Conditions</h3>
            </template>
            
            <div class="space-y-4">
              <!-- Current Moon Phase -->
              <div class="text-center p-4 bg-gray-700 rounded-lg">
                <div class="text-4xl mb-2">{{ getMoonEmoji(reportData.moonPhase) }}</div>
                <div class="font-semibold text-yellow-400">{{ reportData.moonPhase }}</div>
                <div class="text-sm text-gray-400">{{ reportData.moonIllumination }}% Illuminated</div>
              </div>
              
              <!-- Lunar Table -->
              <div>
                <h4 class="font-semibold text-gray-200 mb-3 text-sm">Daily Lunar Data</h4>
                <div class="space-y-1 text-xs">
                  <div class="grid grid-cols-3 gap-2 p-2 bg-gray-700 rounded font-semibold">
                    <div class="text-gray-300">Date</div>
                    <div class="text-gray-300">Rise/Set</div>
                    <div class="text-gray-300">Phase</div>
                  </div>
                  <div v-for="(lunar, index) in reportData.lunarTable" :key="index" 
                       class="grid grid-cols-3 gap-2 p-2 rounded"
                       :class="index % 2 === 0 ? 'bg-gray-750' : 'bg-gray-700'">
                    <div class="text-gray-300">{{ lunar.date }}</div>
                    <div class="text-gray-300">{{ lunar.moonrise }}/{{ lunar.moonset }}</div>
                    <div class="text-yellow-400">{{ lunar.illumination }}%</div>
                  </div>
                </div>
              </div>
              
              <!-- Solunar Times -->
              <div>
                <h4 class="font-semibold text-gray-200 mb-2 text-sm">Today's Solunar</h4>
                <div class="space-y-2">
                  <div class="p-2 bg-green-900/30 rounded">
                    <div class="font-semibold text-green-400 text-sm">Major Times</div>
                    <div class="text-xs text-gray-300">
                      {{ reportData.solunar.majorTimes.join(' • ') }}
                    </div>
                  </div>
                  <div class="p-2 bg-yellow-900/30 rounded">
                    <div class="font-semibold text-yellow-400 text-sm">Minor Times</div>
                    <div class="text-xs text-gray-300">
                      {{ reportData.solunar.minorTimes.join(' • ') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Weather Details -->
          <UCard class="bg-gray-800 border-gray-700">
            <template #header>
              <h3 class="text-lg font-semibold text-gray-100">🌤️ Marine Weather</h3>
            </template>
            
            <div class="space-y-3 text-sm">
              <div class="grid grid-cols-2 gap-3">
                <div class="flex justify-between">
                  <span class="text-gray-300">Humidity</span>
                  <span class="font-semibold text-blue-400">{{ reportData.humidity }}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-300">Cloud Cover</span>
                  <span class="font-semibold text-gray-400">{{ reportData.cloudCover }}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-300">UV Index</span>
                  <span class="font-semibold" :class="getUVColor(reportData.uvIndex)">{{ reportData.uvIndex }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-300">Dew Point</span>
                  <span class="font-semibold text-indigo-400">{{ Math.round(reportData.dewPoint) }}°F</span>
                </div>
              </div>
              
              <!-- Marine-specific conditions -->
              <div class="border-t border-gray-600 pt-3 mt-3">
                <h4 class="font-semibold text-gray-200 mb-2">Marine Conditions</h4>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-300">Sea State</span>
                    <span class="font-semibold text-cyan-400">{{ getSeaState() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-300">Comfort Level</span>
                    <span class="font-semibold" :class="getComfortColor()">{{ getComfortLevel() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-300">Best Times</span>
                    <span class="font-semibold text-yellow-400">{{ getBestFishingTimes() }}</span>
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

// Reactive data
const searchQuery = ref('')
const isSearching = ref(false)
const isLoading = ref(false)
const error = ref('')
const reportData = ref(null)
const marineChart = ref(null)
const tempChart = ref(null)
const tideChart = ref(null)

// Popular fishing locations with coordinates
const popularLocations = [
  { name: 'San Francisco Bay', lat: 37.7749, lon: -122.4194 },
  { name: 'Miami Beach', lat: 25.7617, lon: -80.1918 },
  { name: 'Outer Banks, NC', lat: 35.5585, lon: -75.4665 },
  { name: 'Key West', lat: 24.5551, lon: -81.7800 },
  { name: 'Cape Cod', lat: 41.6688, lon: -70.2962 },
  { name: 'Monterey Bay', lat: 36.6002, lon: -121.8947 },
  { name: 'Chesapeake Bay', lat: 39.0458, lon: -76.6413 },
  { name: 'Gulf Shores, AL', lat: 30.2460, lon: -87.7008 }
]

const searchLocation = async () => {
  if (!searchQuery.value.trim()) return
  
  isSearching.value = true
  error.value = ''
  
  try {
    const foundLocation = popularLocations.find(loc => 
      loc.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    
    if (foundLocation) {
      await getMarineReport(foundLocation.lat, foundLocation.lon, foundLocation.name)
    } else {
      await getMarineReport(37.7749, -122.4194, searchQuery.value)
    }
  } catch (err) {
    error.value = 'Location not found. Try one of the popular locations.'
  } finally {
    isSearching.value = false
  }
}

const selectLocation = async (location) => {
  searchQuery.value = location.name
  await getMarineReport(location.lat, location.lon, location.name)
}

const getMarineReport = async (lat, lon, locationName) => {
  isLoading.value = true
  error.value = ''
  
  try {
    const data = await generateMarineReport(lat, lon, locationName)
    reportData.value = data
    
    nextTick(() => {
      createMarineChart()
      createTempChart()
      createTideChart()
    })
  } catch (err) {
    error.value = 'Failed to generate marine report. Please try again.'
    console.error('Report error:', err)
  } finally {
    isLoading.value = false
  }
}

// Generate comprehensive marine report
const generateMarineReport = async (lat, lon, locationName) => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const now = new Date()
  const season = getSeason(now.getMonth())
  const isCoastal = Math.abs(lat) < 45
  
  // Enhanced water temperature calculations
  const baseTemp = isCoastal ? 
    (lat > 35 ? 68 : lat > 25 ? 76 : 82) : 
    (lat > 35 ? 62 : lat > 25 ? 68 : 74)
  
  const seasonalAdjust = {
    winter: -12, spring: -6, summer: 8, fall: 2
  }[season]
  
  const waterTemp = baseTemp + seasonalAdjust + (Math.random() * 8 - 4)
  const airTemp = waterTemp + (Math.random() * 10 - 5)
  const windSpeed = 6 + Math.random() * 15
  const windDirection = Math.round(Math.random() * 360)
  const waveHeight = isCoastal ? 1.5 + Math.random() * 3 : 0.5 + Math.random()
  const waveDirection = Math.round(Math.random() * 360)
  const swellPeriod = 8 + Math.random() * 8
  
  return {
    location: locationName,
    timestamp: now.toISOString(),
    waterTemp: waterTemp,
    airTemp: airTemp,
    windSpeed: windSpeed,
    windDirection: windDirection,
    waveHeight: waveHeight,
    waveDirection: waveDirection,
    swellPeriod: Math.round(swellPeriod),
    moonPhase: getCurrentMoonPhase(),
    moonIllumination: Math.round(50 + Math.random() * 50),
    pressure: 29.8 + Math.random() * 0.6,
    humidity: Math.round(60 + Math.random() * 30),
    cloudCover: Math.round(Math.random() * 100),
    uvIndex: Math.round(Math.random() * 11),
    visibility: Math.round(5 + Math.random() * 15),
    dewPoint: airTemp - 5 - Math.random() * 10,
    tides: generateAdvancedTideData(),
    solunar: generateSolunarData(),
    lunarTable: generateLunarTable(),
    historicalTemp: generateHistoricalTempData(waterTemp),
    marineData: generateMarineData(windSpeed, waveHeight)
  }
}

const generateAdvancedTideData = () => {
  const tides = []
  const now = new Date()
  
  for (let i = 0; i < 12; i++) {
    const time = new Date(now.getTime() + (i * 6.25 * 60 * 60 * 1000))
    const isHigh = i % 2 === 0
    const height = isHigh ? 
      (4 + Math.random() * 3).toFixed(1) : 
      (0.5 + Math.random() * 1.5).toFixed(1)
    
    tides.push({
      type: isHigh ? 'High Tide' : 'Low Tide',
      t: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      v: height,
      datetime: time,
      height: parseFloat(height)
    })
  }
  
  return tides
}

const generateSolunarData = () => {
  return {
    majorTimes: ['06:30-08:30', '18:45-20:45'],
    minorTimes: ['00:15-01:15', '12:30-13:30']
  }
}

const generateLunarTable = () => {
  const table = []
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000)
    const illumination = 50 + Math.sin(i * 0.2) * 30 + Math.random() * 10
    
    table.push({
      date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      moonrise: `${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      moonset: `${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
      illumination: Math.round(Math.max(0, Math.min(100, illumination)))
    })
  }
  
  return table
}

const generateHistoricalTempData = (currentTemp) => {
  const seasonalAvg = currentTemp + (Math.random() * 6 - 3)
  const trend = (Math.random() * 8 - 4)
  
  return {
    current: currentTemp,
    average: seasonalAvg,
    trend: trend,
    historical: Array.from({ length: 30 }, (_, i) => 
      currentTemp + Math.sin(i * 0.2) * 3 + (Math.random() * 4 - 2)
    )
  }
}

const generateMarineData = (windSpeed, waveHeight) => {
  return {
    windSpeed: Array.from({ length: 24 }, (_, i) => windSpeed + Math.sin(i * 0.3) * 3 + Math.random() * 2),
    waveHeight: Array.from({ length: 24 }, (_, i) => waveHeight + Math.sin(i * 0.25) * 0.5 + Math.random() * 0.3),
    tideHeights: Array.from({ length: 24 }, (_, i) => 3 + Math.sin(i * 0.5) * 2.5),
    timestamps: Array.from({ length: 24 }, (_, i) => 
      new Date(Date.now() + i * 60 * 60 * 1000).toISOString()
    )
  }
}

// Analysis functions
const getSwellSafetyColor = () => {
  if (!reportData.value) return 'text-gray-400'
  const period = reportData.value.swellPeriod
  const height = reportData.value.waveHeight
  
  if (period < 8 && height > 3) return 'text-red-400'
  if (period < 10 && height > 4) return 'text-yellow-400'
  return 'text-green-400'
}

const getSwellSafetyText = () => {
  if (!reportData.value) return 'Calculating...'
  const period = reportData.value.swellPeriod
  const height = reportData.value.waveHeight
  
  if (period < 8 && height > 3) return 'Steep swell - Caution advised'
  if (period < 10 && height > 4) return 'Moderate swell conditions'
  return 'Safe swell conditions'
}

const getWindAnalysis = () => {
  if (!reportData.value) return ''
  const speed = reportData.value.windSpeed
  
  if (speed < 5) return 'Light winds, excellent for all fishing methods'
  if (speed < 15) return 'Moderate winds, good for most techniques'
  if (speed < 25) return 'Strong winds, consider wind protection'
  return 'Very strong winds, challenging conditions'
}

const getSwellAnalysis = () => {
  if (!reportData.value) return ''
  const height = reportData.value.waveHeight
  const period = reportData.value.swellPeriod
  
  if (height < 2) return `Small swell (${period}s period), ideal for small boats`
  if (height < 4) return `Moderate swell (${period}s period), suitable for experienced anglers`
  return `Large swell (${period}s period), experienced boaters only`
}

const getFishingConditionsAnalysis = () => {
  if (!reportData.value) return ''
  const wind = reportData.value.windSpeed
  const waves = reportData.value.waveHeight
  
  if (wind < 10 && waves < 2) return 'Excellent conditions for all fishing styles'
  if (wind < 20 && waves < 4) return 'Good conditions, active water helps fishing'
  return 'Challenging conditions, consider protected areas'
}

const getSeaState = () => {
  if (!reportData.value) return 'Calm'
  const waves = reportData.value.waveHeight
  
  if (waves < 1) return 'Calm'
  if (waves < 2) return 'Slight'
  if (waves < 4) return 'Moderate'
  if (waves < 6) return 'Rough'
  return 'Very Rough'
}

const getComfortColor = () => {
  if (!reportData.value) return 'text-green-400'
  const waves = reportData.value.waveHeight
  const wind = reportData.value.windSpeed
  
  if (waves < 2 && wind < 15) return 'text-green-400'
  if (waves < 4 && wind < 25) return 'text-yellow-400'
  return 'text-red-400'
}

const getComfortLevel = () => {
  if (!reportData.value) return 'Excellent'
  const waves = reportData.value.waveHeight
  const wind = reportData.value.windSpeed
  
  if (waves < 2 && wind < 15) return 'Excellent'
  if (waves < 4 && wind < 25) return 'Good'
  return 'Challenging'
}

// Utility functions
const getSeason = (month) => {
  if (month >= 11 || month <= 1) return 'winter'
  if (month >= 2 && month <= 4) return 'spring'
  if (month >= 5 && month <= 7) return 'summer'
  return 'fall'
}

const getCurrentMoonPhase = () => {
  const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 
                  'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent']
  return phases[Math.floor(Math.random() * phases.length)]
}

const getWindDirection = (degrees) => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return directions[Math.round(degrees / 22.5) % 16]
}

const getWaveDirection = (degrees) => {
  return getWindDirection(degrees)
}

const getUVColor = (uv) => {
  if (uv <= 2) return 'text-green-400'
  if (uv <= 5) return 'text-yellow-400'
  if (uv <= 7) return 'text-orange-400'
  return 'text-red-400'
}

const getMoonEmoji = (phase) => {
  const emojis = {
    'New Moon': '🌑',
    'Waxing Crescent': '🌒',
    'First Quarter': '🌓',
    'Waxing Gibbous': '🌔',
    'Full Moon': '🌕',
    'Waning Gibbous': '🌖',
    'Last Quarter': '🌗',
    'Waning Crescent': '🌘'
  }
  return emojis[phase] || '🌙'
}

const getTimeFromNow = (timeStr) => {
  const now = new Date()
  const tideTime = new Date()
  const [hours, minutes] = timeStr.split(':').map(Number)
  tideTime.setHours(hours, minutes, 0, 0)
  
  const diff = tideTime.getTime() - now.getTime()
  const hoursDiff = Math.round(diff / (1000 * 60 * 60))
  
  if (hoursDiff === 0) return 'Now'
  if (hoursDiff > 0) return `in ${hoursDiff}h`
  return `${Math.abs(hoursDiff)}h ago`
}

const getBestFishingTimes = () => {
  return "Dawn & Dusk"
}

const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// Chart creation functions
const createMarineChart = () => {
  if (!marineChart.value || !reportData.value) return
  
  const ctx = marineChart.value.getContext('2d')
  const data = reportData.value.marineData
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.timestamps.slice(0, 12).map((_, i) => {
        const hour = new Date(Date.now() + i * 60 * 60 * 1000).getHours()
        return `${hour}:00`
      }),
      datasets: [
        {
          label: 'Wind Speed (mph)',
          data: data.windSpeed.slice(0, 12),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          yAxisID: 'y',
          tension: 0.4,
          fill: false
        },
        {
          label: 'Swell Height (ft)',
          data: data.waveHeight.slice(0, 12),
          borderColor: 'rgb(6, 182, 212)',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          yAxisID: 'y',
          tension: 0.4,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: 'rgb(156, 163, 175)' }
        }
      },
      scales: {
        x: {
          ticks: { color: 'rgb(156, 163, 175)' },
          grid: { color: 'rgba(75, 85, 99, 0.3)' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'Wind Speed (mph) / Swell Height (ft)', color: 'rgb(156, 163, 175)' },
          ticks: { color: 'rgb(156, 163, 175)' },
          grid: { color: 'rgba(75, 85, 99, 0.3)' }
        }
      }
    }
  })
}

const createTempChart = () => {
  if (!tempChart.value || !reportData.value) return
  
  const ctx = tempChart.value.getContext('2d')
  const data = reportData.value.historicalTemp
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
      }),
      datasets: [
        {
          label: 'Water Temperature',
          data: data.historical,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: '30-Day Average',
          data: Array(30).fill(data.average),
          borderColor: 'rgb(156, 163, 175)',
          borderDash: [5, 5],
          pointRadius: 0,
          tension: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: 'rgb(156, 163, 175)' }
        }
      },
      scales: {
        x: {
          ticks: { color: 'rgb(156, 163, 175)' },
          grid: { color: 'rgba(75, 85, 99, 0.3)' }
        },
        y: {
          title: { display: true, text: 'Temperature (°F)', color: 'rgb(156, 163, 175)' },
          ticks: { color: 'rgb(156, 163, 175)' },
          grid: { color: 'rgba(75, 85, 99, 0.3)' }
        }
      }
    }
  })
}

const createTideChart = () => {
  if (!tideChart.value || !reportData.value) return
  
  const ctx = tideChart.value.getContext('2d')
  const data = reportData.value.marineData
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.timestamps.slice(0, 12).map((_, i) => {
        const hour = new Date(Date.now() + i * 60 * 60 * 1000).getHours()
        return `${hour}:00`
      }),
      datasets: [
        {
          label: 'Tide Height',
          data: data.tideHeights.slice(0, 12),
          borderColor: 'rgb(6, 182, 212)',
          backgroundColor: 'rgba(6, 182, 212, 0.2)',
          fill: true,
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          ticks: { color: 'rgb(156, 163, 175)', font: { size: 10 } },
          grid: { color: 'rgba(75, 85, 99, 0.3)' }
        },
        y: {
          title: { display: true, text: 'Height (ft)', color: 'rgb(156, 163, 175)' },
          ticks: { color: 'rgb(156, 163, 175)', font: { size: 10 } },
          grid: { color: 'rgba(75, 85, 99, 0.3)' }
        }
      }
    }
  })
}

// SEO
useHead({
  title: 'Marine Conditions Pro - Professional Marine Weather Dashboard',
  meta: [
    { name: 'description', content: 'Professional marine weather conditions with tides, swell analysis, and comprehensive fishing data.' }
  ]
})
</script>

<style scoped>
.bg-gray-750 {
  background-color: #334155;
}
</style>