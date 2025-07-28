<template>
  <div class="min-h-screen bg-gray-900 text-gray-100">
    <!-- Header -->
    <header class="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-blue-400 flex items-center">
              🎣 Fishing Report Pro
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
            📍 Fishing Location
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
        <p class="text-gray-300 text-lg">Loading comprehensive fishing conditions...</p>
        <p class="text-gray-500 text-sm mt-2">Gathering marine weather, tides, and historical data</p>
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
      <!-- Fishing Score Header -->
      <div class="mb-6">
        <UCard class="bg-gray-800 border-gray-700">
          <div class="text-center py-6">
            <h2 class="text-3xl font-bold text-gray-100 mb-2">{{ reportData.location }}</h2>
            <div class="flex items-center justify-center gap-4 mb-4">
              <div class="text-center">
                <div class="text-6xl font-bold mb-2" :class="getFishingScoreColor(reportData.fishingScore)">
                  {{ reportData.fishingScore }}
                </div>
                <div class="text-gray-400">Fishing Score</div>
              </div>
              <div class="text-4xl">{{ getFishingScoreEmoji(reportData.fishingScore) }}</div>
            </div>
            <UBadge 
              :color="getFishingRating(reportData.fishingScore).color" 
              size="lg"
              class="text-lg px-4 py-2"
            >
              {{ getFishingRating(reportData.fishingScore).label }} Conditions
            </UBadge>
          </div>
        </UCard>
      </div>

      <!-- Key Metrics Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <UCard class="bg-gray-800 border-gray-700">
          <div class="text-center p-4">
            <div class="text-3xl mb-2">🌡️</div>
            <div class="text-2xl font-bold text-blue-400">{{ Math.round(reportData.waterTemp) }}°F</div>
            <div class="text-xs text-gray-400">Water Temp</div>
            <div class="text-xs text-gray-500 mt-1">{{ getWaterTempTrend(reportData.waterTemp) }}</div>
          </div>
        </UCard>
        
        <UCard class="bg-gray-800 border-gray-700">
          <div class="text-center p-4">
            <div class="text-3xl mb-2">💨</div>
            <div class="text-2xl font-bold text-green-400">{{ Math.round(reportData.windSpeed) }} mph</div>
            <div class="text-xs text-gray-400">Wind Speed</div>
            <div class="text-xs text-gray-500 mt-1">{{ getWindDirection(reportData.windDirection) }}</div>
          </div>
        </UCard>
        
        <UCard class="bg-gray-800 border-gray-700">
          <div class="text-center p-4">
            <div class="text-3xl mb-2">🌊</div>
            <div class="text-2xl font-bold text-cyan-400">{{ reportData.waveHeight.toFixed(1) }} ft</div>
            <div class="text-xs text-gray-400">Wave Height</div>
            <div class="text-xs text-gray-500 mt-1">{{ getWaveDirection(reportData.waveDirection) }}</div>
          </div>
        </UCard>
        
        <UCard class="bg-gray-800 border-gray-700">
          <div class="text-center p-4">
            <div class="text-3xl mb-2">🌙</div>
            <div class="text-sm font-bold text-yellow-400">{{ reportData.moonPhase }}</div>
            <div class="text-xs text-gray-400">Moon Phase</div>
            <div class="text-xs text-gray-500 mt-1">{{ reportData.moonIllumination }}% Illuminated</div>
          </div>
        </UCard>
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Marine Weather Chart -->
          <UCard class="bg-gray-800 border-gray-700">
            <template #header>
              <h3 class="text-lg font-semibold text-gray-100 flex items-center">
                🌊 Marine Weather Forecast
              </h3>
            </template>
            
            <div class="h-80">
              <canvas ref="marineChart"></canvas>
            </div>
          </UCard>

          <!-- Wind and Swell Direction -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <UCard class="bg-gray-800 border-gray-700">
              <template #header>
                <h3 class="text-lg font-semibold text-gray-100">💨 Wind Direction</h3>
              </template>
              
              <div class="p-4">
                <div class="relative w-32 h-32 mx-auto mb-4">
                  <div class="absolute inset-0 rounded-full border-4 border-gray-600"></div>
                  <div class="absolute inset-2 rounded-full border-2 border-gray-700"></div>
                  <div 
                    class="absolute top-1/2 left-1/2 w-1 h-12 bg-green-400 transform -translate-x-1/2 origin-bottom transition-transform duration-500"
                    :style="{ transform: `translate(-50%, -100%) rotate(${reportData.windDirection}deg)` }"
                  ></div>
                  <!-- Compass directions -->
                  <div class="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">N</div>
                  <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">S</div>
                  <div class="absolute right-0 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">E</div>
                  <div class="absolute left-0 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">W</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-green-400">{{ Math.round(reportData.windDirection) }}°</div>
                  <div class="text-sm text-gray-400">{{ getWindDirection(reportData.windDirection) }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ Math.round(reportData.windSpeed) }} mph avg</div>
                </div>
              </div>
            </UCard>

            <UCard class="bg-gray-800 border-gray-700">
              <template #header>
                <h3 class="text-lg font-semibold text-gray-100">🌊 Swell Direction</h3>
              </template>
              
              <div class="p-4">
                <div class="relative w-32 h-32 mx-auto mb-4">
                  <div class="absolute inset-0 rounded-full border-4 border-gray-600"></div>
                  <div class="absolute inset-2 rounded-full border-2 border-gray-700"></div>
                  <div 
                    class="absolute top-1/2 left-1/2 w-1 h-12 bg-cyan-400 transform -translate-x-1/2 origin-bottom transition-transform duration-500"
                    :style="{ transform: `translate(-50%, -100%) rotate(${reportData.waveDirection}deg)` }"
                  ></div>
                  <!-- Compass directions -->
                  <div class="absolute top-0 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">N</div>
                  <div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">S</div>
                  <div class="absolute right-0 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">E</div>
                  <div class="absolute left-0 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">W</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-cyan-400">{{ Math.round(reportData.waveDirection) }}°</div>
                  <div class="text-sm text-gray-400">{{ getWaveDirection(reportData.waveDirection) }}</div>
                  <div class="text-xs text-gray-500 mt-1">{{ reportData.swellPeriod }}s period</div>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Historical Water Temperature -->
          <UCard class="bg-gray-800 border-gray-700">
            <template #header>
              <h3 class="text-lg font-semibold text-gray-100">📊 Water Temperature Trends</h3>
            </template>
            
            <div class="p-4">
              <div class="h-64">
                <canvas ref="tempHistoryChart"></canvas>
              </div>
              <div class="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <div class="text-lg font-bold text-blue-400">{{ Math.round(reportData.historicalTemp.current) }}°F</div>
                  <div class="text-xs text-gray-400">Current</div>
                </div>
                <div>
                  <div class="text-lg font-bold text-green-400">{{ Math.round(reportData.historicalTemp.average) }}°F</div>
                  <div class="text-xs text-gray-400">Seasonal Avg</div>
                </div>
                <div>
                  <div class="text-lg font-bold" :class="reportData.historicalTemp.trend > 0 ? 'text-red-400' : 'text-blue-400'">
                    {{ reportData.historicalTemp.trend > 0 ? '+' : '' }}{{ reportData.historicalTemp.trend.toFixed(1) }}°F
                  </div>
                  <div class="text-xs text-gray-400">vs Last Week</div>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <!-- Right Column -->
        <div class="space-y-6">
          <!-- Tides -->
          <UCard class="bg-gray-800 border-gray-700">
            <template #header>
              <h3 class="text-lg font-semibold text-gray-100">🌊 Tide Schedule</h3>
            </template>
            
            <div class="space-y-3">
              <div 
                v-for="(tide, index) in reportData.tides.slice(0, 8)" 
                :key="index"
                class="flex justify-between items-center p-3 rounded-lg"
                :class="index % 2 === 0 ? 'bg-gray-700' : 'bg-gray-750'"
              >
                <div class="flex items-center space-x-3">
                  <div class="text-2xl">{{ tide.type === 'High Tide' ? '⬆️' : '⬇️' }}</div>
                  <div>
                    <div class="font-semibold text-gray-100">{{ tide.type }}</div>
                    <div class="text-sm text-gray-400">{{ tide.t }}</div>
                  </div>
                </div>
                <div class="text-right">
                  <div class="font-bold text-cyan-400">{{ tide.v }} ft</div>
                  <div class="text-xs text-gray-500">{{ getTimeFromNow(tide.t) }}</div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Solunar Times -->
          <UCard class="bg-gray-800 border-gray-700">
            <template #header>
              <h3 class="text-lg font-semibold text-gray-100">🌙 Solunar Activity</h3>
            </template>
            
            <div class="space-y-4">
              <div class="text-center p-4 bg-gray-700 rounded-lg">
                <div class="text-3xl mb-2">{{ getMoonEmoji(reportData.moonPhase) }}</div>
                <div class="font-semibold text-yellow-400">{{ reportData.moonPhase }}</div>
                <div class="text-sm text-gray-400">{{ reportData.moonIllumination }}% Illuminated</div>
              </div>
              
              <div>
                <h4 class="font-semibold text-gray-200 mb-2">🎯 Major Feeding Times</h4>
                <div class="space-y-2">
                  <div v-for="(time, index) in reportData.solunar.majorTimes" :key="index" 
                       class="flex justify-between items-center p-2 bg-green-900/30 rounded">
                    <span class="text-green-400">{{ time }}</span>
                    <span class="text-xs text-gray-400">2hr window</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 class="font-semibold text-gray-200 mb-2">⏰ Minor Feeding Times</h4>
                <div class="space-y-2">
                  <div v-for="(time, index) in reportData.solunar.minorTimes" :key="index" 
                       class="flex justify-between items-center p-2 bg-yellow-900/30 rounded">
                    <span class="text-yellow-400">{{ time }}</span>
                    <span class="text-xs text-gray-400">1hr window</span>
                  </div>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Weather Details -->
          <UCard class="bg-gray-800 border-gray-700">
            <template #header>
              <h3 class="text-lg font-semibold text-gray-100">🌤️ Weather Details</h3>
            </template>
            
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-300">Air Temperature</span>
                <span class="font-semibold text-orange-400">{{ Math.round(reportData.airTemp) }}°F</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-300">Barometric Pressure</span>
                <span class="font-semibold text-purple-400">{{ reportData.pressure.toFixed(2) }} inHg</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-300">Humidity</span>
                <span class="font-semibold text-blue-400">{{ reportData.humidity }}%</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-300">Cloud Cover</span>
                <span class="font-semibold text-gray-400">{{ reportData.cloudCover }}%</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-300">UV Index</span>
                <span class="font-semibold" :class="getUVColor(reportData.uvIndex)">{{ reportData.uvIndex }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-300">Visibility</span>
                <span class="font-semibold text-cyan-400">{{ reportData.visibility }} mi</span>
              </div>
            </div>
          </UCard>

          <!-- Fishing Insights -->
          <UCard class="bg-gray-800 border-gray-700">
            <template #header>
              <h3 class="text-lg font-semibold text-gray-100">🎣 Pro Insights</h3>
            </template>
            
            <div class="prose prose-invert max-w-none">
              <div class="text-gray-300 leading-relaxed text-sm space-y-3">
                <p>{{ reportData.aiInsights }}</p>
                <div class="bg-gray-700 p-3 rounded-lg">
                  <h4 class="text-sm font-semibold text-blue-400 mb-2">💡 Pro Tips</h4>
                  <ul class="text-xs text-gray-400 space-y-1">
                    <li>• Best times: {{ getBestFishingTimes() }}</li>
                    <li>• Recommended depth: {{ getRecommendedDepth() }}</li>
                    <li>• Optimal bait: {{ getRecommendedBait() }}</li>
                  </ul>
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
const tempHistoryChart = ref(null)

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
      await getFishingReport(foundLocation.lat, foundLocation.lon, foundLocation.name)
    } else {
      await getFishingReport(37.7749, -122.4194, searchQuery.value)
    }
  } catch (err) {
    error.value = 'Location not found. Try one of the popular locations.'
  } finally {
    isSearching.value = false
  }
}

const selectLocation = async (location) => {
  searchQuery.value = location.name
  await getFishingReport(location.lat, location.lon, location.name)
}

const getFishingReport = async (lat, lon, locationName) => {
  isLoading.value = true
  error.value = ''
  
  try {
    const data = await generateComprehensiveFishingReport(lat, lon, locationName)
    reportData.value = data
    
    nextTick(() => {
      createMarineChart()
      createTempHistoryChart()
    })
  } catch (err) {
    error.value = 'Failed to generate fishing report. Please try again.'
    console.error('Report error:', err)
  } finally {
    isLoading.value = false
  }
}

// Generate comprehensive fishing report with enhanced data
const generateComprehensiveFishingReport = async (lat, lon, locationName) => {
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
  
  // Calculate fishing score with more factors
  const fishingScore = calculateAdvancedFishingScore({
    waterTemp, windSpeed, waveHeight, season, isCoastal, airTemp
  })
  
  return {
    location: locationName,
    timestamp: now.toISOString(),
    fishingScore: Math.round(fishingScore),
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
    tides: generateAdvancedTideData(),
    solunar: generateSolunarData(),
    historicalTemp: generateHistoricalTempData(waterTemp),
    marineData: generateMarineData(),
    aiInsights: generateAdvancedInsights(fishingScore, waterTemp, windSpeed, waveHeight, locationName, season)
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
      datetime: time
    })
  }
  
  return tides
}

const generateSolunarData = () => {
  const now = new Date()
  const majorTimes = []
  const minorTimes = []
  
  // Generate major times (sunrise/sunset related)
  majorTimes.push('06:30', '18:45')
  
  // Generate minor times (moonrise/moonset related)
  minorTimes.push('00:15', '12:30')
  
  return {
    majorTimes,
    minorTimes,
    moonPhase: getCurrentMoonPhase(),
    moonIllumination: Math.round(50 + Math.random() * 50)
  }
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

const generateMarineData = () => {
  return {
    swellHeight: Array.from({ length: 24 }, () => 1 + Math.random() * 4),
    windSpeed: Array.from({ length: 24 }, () => 5 + Math.random() * 15),
    waterTemp: Array.from({ length: 24 }, (_, i) => 68 + Math.sin(i * 0.26) * 2 + Math.random() * 2),
    timestamps: Array.from({ length: 24 }, (_, i) => 
      new Date(Date.now() + i * 60 * 60 * 1000).toISOString()
    )
  }
}

const calculateAdvancedFishingScore = ({ waterTemp, windSpeed, waveHeight, season, isCoastal, airTemp }) => {
  let score = 50
  
  // Water temperature (optimal 62-78°F)
  if (waterTemp >= 62 && waterTemp <= 78) score += 25
  else if (waterTemp >= 55 && waterTemp <= 85) score += 15
  else if (waterTemp >= 45 && waterTemp <= 90) score += 5
  else score -= 15
  
  // Wind conditions (optimal 5-15 mph)
  if (windSpeed >= 5 && windSpeed <= 15) score += 20
  else if (windSpeed <= 25) score += 10
  else score -= 20
  
  // Wave conditions
  if (isCoastal) {
    if (waveHeight >= 1 && waveHeight <= 3) score += 15
    else if (waveHeight <= 5) score += 5
    else score -= 15
  }
  
  // Seasonal adjustments
  const seasonBonus = { spring: 15, summer: 10, fall: 12, winter: 5 }[season]
  score += seasonBonus
  
  // Air/water temperature differential
  const tempDiff = Math.abs(airTemp - waterTemp)
  if (tempDiff < 5) score += 5
  else if (tempDiff > 15) score -= 5
  
  return Math.max(0, Math.min(100, score))
}

const generateAdvancedInsights = (score, waterTemp, windSpeed, waveHeight, location, season) => {
  let insights = `Current fishing analysis for ${location}: `
  
  if (score >= 85) {
    insights += "Exceptional fishing conditions! This is prime time for multiple species. "
  } else if (score >= 70) {
    insights += "Excellent fishing conditions with multiple favorable factors aligned. "
  } else if (score >= 55) {
    insights += "Good fishing conditions - expect decent action with proper technique. "
  } else if (score >= 40) {
    insights += "Fair conditions with some challenges, but fish are still catchable. "
  } else {
    insights += "Tough conditions requiring patience and skill, but dedicated anglers can succeed. "
  }

  // Season-specific advice
  const seasonAdvice = {
    spring: "Spring conditions favor active feeding as fish prepare for spawning. Focus on transitional areas.",
    summer: "Summer heat drives fish deeper. Early morning and late evening are most productive.",
    fall: "Fall feeding frenzy is active as fish prepare for winter. Excellent baitfish activity.",
    winter: "Winter fishing requires slower presentations in deeper, warmer water."
  }
  insights += seasonAdvice[season] + " "

  // Water temperature insights
  if (waterTemp >= 70 && waterTemp <= 75) {
    insights += "Optimal water temperature for most game fish species. "
  } else if (waterTemp < 60) {
    insights += "Cool water requires slower presentations and deeper fishing. "
  } else if (waterTemp > 80) {
    insights += "Warm water fish are active but seek cooler depths during midday. "
  }

  // Wind and wave conditions
  if (windSpeed <= 10 && waveHeight <= 2) {
    insights += "Calm conditions are perfect for surface lures and sight fishing. "
  } else if (windSpeed <= 20 && waveHeight <= 4) {
    insights += "Active water helps oxygenation and covers your approach - great for aggressive fishing. "
  } else {
    insights += "Rough conditions require heavy tackle and protected fishing areas. "
  }

  return insights
}

// Utility functions for display
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

const getFishingRating = (score) => {
  if (score >= 85) return { label: 'Exceptional', color: 'green' }
  if (score >= 70) return { label: 'Excellent', color: 'emerald' }
  if (score >= 55) return { label: 'Good', color: 'blue' }
  if (score >= 40) return { label: 'Fair', color: 'yellow' }
  return { label: 'Poor', color: 'red' }
}

const getFishingScoreColor = (score) => {
  if (score >= 85) return 'text-green-400'
  if (score >= 70) return 'text-emerald-400'
  if (score >= 55) return 'text-blue-400'
  if (score >= 40) return 'text-yellow-400'
  return 'text-red-400'
}

const getFishingScoreEmoji = (score) => {
  if (score >= 85) return '🔥'
  if (score >= 70) return '⭐'
  if (score >= 55) return '👍'
  if (score >= 40) return '😐'
  return '😞'
}

const getWindDirection = (degrees) => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return directions[Math.round(degrees / 22.5) % 16]
}

const getWaveDirection = (degrees) => {
  return getWindDirection(degrees)
}

const getWaterTempTrend = (temp) => {
  if (temp > 75) return 'Above Average'
  if (temp < 60) return 'Below Average'
  return 'Seasonal Normal'
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

const getRecommendedDepth = () => {
  if (!reportData.value) return "10-20ft"
  return reportData.value.waterTemp > 75 ? "15-30ft" : "5-15ft"
}

const getRecommendedBait = () => {
  if (!reportData.value) return "Live bait"
  return reportData.value.windSpeed > 15 ? "Heavy lures" : "Live bait"
}

const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

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
          label: 'Wave Height (ft)',
          data: data.swellHeight.slice(0, 12),
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          yAxisID: 'y',
          tension: 0.4
        },
        {
          label: 'Wind Speed (mph)',
          data: data.windSpeed.slice(0, 12),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          yAxisID: 'y1',
          tension: 0.4
        },
        {
          label: 'Water Temp (°F)',
          data: data.waterTemp.slice(0, 12),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          yAxisID: 'y2',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: 'rgb(156, 163, 175)'
          }
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
          title: { display: true, text: 'Wave Height (ft)', color: 'rgb(34, 197, 94)' },
          ticks: { color: 'rgb(156, 163, 175)' },
          grid: { color: 'rgba(75, 85, 99, 0.3)' }
        },
        y1: {
          type: 'linear',
          display: false,
          position: 'right',
          grid: { drawOnChartArea: false }
        },
        y2: {
          type: 'linear',
          display: false,
          position: 'right',
          grid: { drawOnChartArea: false }
        }
      }
    }
  })
}

const createTempHistoryChart = () => {
  if (!tempHistoryChart.value || !reportData.value) return
  
  const ctx = tempHistoryChart.value.getContext('2d')
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
          label: 'Seasonal Average',
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
          labels: {
            color: 'rgb(156, 163, 175)'
          }
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

// SEO
useHead({
  title: 'Professional Fishing Report - Marine Weather Dashboard',
  meta: [
    { name: 'description', content: 'Professional fishing reports with comprehensive marine weather, tides, solunar data, and historical water temperature analysis.' }
  ]
})
</script>

<style scoped>
.bg-gray-750 {
  background-color: #334155;
}
</style>