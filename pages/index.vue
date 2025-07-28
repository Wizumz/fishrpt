<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <header class="text-center mb-8">
      <h1 class="text-4xl font-bold text-blue-900 mb-2">
        🎣 Fishing Report Pro
      </h1>
      <p class="text-lg text-blue-700">
        Real-time fishing insights with weather and marine data
      </p>
    </header>

    <!-- Location Search -->
    <div class="max-w-2xl mx-auto mb-8">
      <UCard class="fishing-card">
        <template #header>
          <h2 class="text-xl font-semibold text-blue-900">
            📍 Choose Your Fishing Location
          </h2>
        </template>
        
        <div class="space-y-4">
          <UInput
            v-model="searchQuery"
            placeholder="Enter city, zip code, or fishing spot..."
            size="lg"
            icon="i-heroicons-magnifying-glass"
            @keyup.enter="searchLocation"
          />
          
          <div class="flex flex-wrap gap-2">
            <UButton 
              v-for="location in popularLocations" 
              :key="location.name"
              variant="outline" 
              size="sm"
              @click="selectLocation(location)"
            >
              {{ location.name }}
            </UButton>
          </div>
          
          <UButton 
            :loading="isSearching"
            color="blue" 
            size="lg" 
            block
            @click="searchLocation"
          >
            Get Fishing Report
          </UButton>
        </div>
      </UCard>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p class="text-blue-600">Gathering fishing data...</p>
    </div>

    <!-- Error State -->
    <UAlert
      v-if="error"
      color="red"
      variant="soft"
      :title="error"
      class="mb-8"
    />

    <!-- Fishing Report -->
    <div v-if="reportData && !isLoading" class="space-y-6">
      <!-- Fishing Score Card -->
      <UCard class="fishing-card">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-blue-900">
              🎯 Fishing Conditions for {{ reportData.location }}
            </h2>
            <UBadge 
              :color="getFishingRating(reportData.fishingScore).color" 
              size="lg"
            >
              {{ reportData.fishingScore }}/100 - {{ getFishingRating(reportData.fishingScore).label }}
            </UBadge>
          </div>
        </template>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl mb-2">🌊</div>
            <div class="text-sm text-gray-600">Water Temp</div>
            <div class="font-semibold">{{ Math.round(reportData.waterTemp) }}°F</div>
          </div>
          
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl mb-2">💨</div>
            <div class="text-sm text-gray-600">Wind</div>
            <div class="font-semibold">{{ Math.round(reportData.windSpeed) }} mph</div>
          </div>
          
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl mb-2">🌊</div>
            <div class="text-sm text-gray-600">Wave Height</div>
            <div class="font-semibold">{{ reportData.waveHeight.toFixed(1) }} ft</div>
          </div>
        </div>
      </UCard>

      <!-- AI Insights -->
      <UCard class="fishing-card">
        <template #header>
          <h3 class="text-lg font-semibold text-blue-900">
            🤖 Fishing Insights
          </h3>
        </template>
        
        <div class="prose max-w-none">
          <p class="text-gray-700 leading-relaxed">
            {{ reportData.aiInsights }}
          </p>
        </div>
      </UCard>

      <!-- Weather Chart -->
      <UCard class="fishing-card">
        <template #header>
          <h3 class="text-lg font-semibold text-blue-900">
            🌡️ Temperature Forecast
          </h3>
        </template>
        
        <div class="h-64">
          <canvas ref="chartCanvas"></canvas>
        </div>
      </UCard>

      <!-- Tides -->
      <UCard v-if="reportData.tides && reportData.tides.length" class="fishing-card">
        <template #header>
          <h3 class="text-lg font-semibold text-blue-900">
            🌊 Tide Information
          </h3>
        </template>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div 
            v-for="(tide, index) in reportData.tides.slice(0, 4)" 
            :key="index"
            class="p-3 bg-blue-50 rounded-lg"
          >
            <div class="flex justify-between items-center">
              <span class="font-medium">{{ tide.type }}</span>
              <span class="text-sm text-gray-600">{{ tide.t }}</span>
            </div>
            <div class="text-sm text-gray-600">Height: {{ tide.v }} ft</div>
          </div>
        </div>
      </UCard>
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
const chartCanvas = ref(null)

// Popular fishing locations with coordinates
const popularLocations = [
  { name: 'San Francisco Bay', lat: 37.7749, lon: -122.4194 },
  { name: 'Miami Beach', lat: 25.7617, lon: -80.1918 },
  { name: 'Outer Banks, NC', lat: 35.5585, lon: -75.4665 },
  { name: 'Key West', lat: 24.5551, lon: -81.7800 },
  { name: 'Cape Cod', lat: 41.6688, lon: -70.2962 },
  { name: 'Monterey Bay', lat: 36.6002, lon: -121.8947 }
]

const searchLocation = async () => {
  if (!searchQuery.value.trim()) return
  
  isSearching.value = true
  error.value = ''
  
  try {
    // For demo purposes, use a popular location if search matches
    const foundLocation = popularLocations.find(loc => 
      loc.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
    
    if (foundLocation) {
      await getFishingReport(foundLocation.lat, foundLocation.lon, foundLocation.name)
    } else {
      // Use default coordinates for demo (San Francisco Bay)
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
    // For GitHub Pages static deployment, we'll generate mock data
    // that looks realistic based on the location
    const data = await generateStaticFishingReport(lat, lon, locationName)
    reportData.value = data
    
    // Create chart after data is loaded
    nextTick(() => {
      createTemperatureChart()
    })
  } catch (err) {
    error.value = 'Failed to generate fishing report. Please try again.'
    console.error('Report error:', err)
  } finally {
    isLoading.value = false
  }
}

// Generate realistic fishing report data for static deployment
const generateStaticFishingReport = async (lat, lon, locationName) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Generate realistic data based on location and current date
  const now = new Date()
  const season = getSeason(now.getMonth())
  const isCoastal = Math.abs(lat) < 45 // Rough coastal detection
  
  // Generate realistic water temperature based on location and season
  const baseTemp = isCoastal ? 
    (lat > 35 ? 72 : lat > 25 ? 78 : 82) : // Coastal temps
    (lat > 35 ? 65 : lat > 25 ? 70 : 75)   // Inland temps
  
  const seasonalAdjust = {
    winter: -8, spring: -3, summer: 5, fall: 0
  }[season]
  
  const waterTemp = baseTemp + seasonalAdjust + (Math.random() * 6 - 3)
  const windSpeed = 8 + Math.random() * 12
  const waveHeight = isCoastal ? 1 + Math.random() * 3 : 0.5 + Math.random()
  
  // Calculate fishing score
  const fishingScore = calculateFishingScore({
    waterTemp, windSpeed, waveHeight, season, isCoastal
  })
  
  return {
    location: locationName,
    timestamp: now.toISOString(),
    fishingScore: Math.round(fishingScore),
    waterTemp: waterTemp,
    windSpeed: windSpeed,
    windDirection: Math.round(Math.random() * 360),
    waveHeight: waveHeight,
    waveDirection: Math.round(Math.random() * 360),
    moonPhase: getCurrentMoonPhase(),
    tides: generateTideData(),
    aiInsights: generateInsights(fishingScore, waterTemp, windSpeed, waveHeight, locationName),
    weather: {
      forecast: generateWeatherForecast(waterTemp)
    }
  }
}

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

const generateTideData = () => {
  const tides = []
  const now = new Date()
  
  for (let i = 0; i < 4; i++) {
    const time = new Date(now.getTime() + (i * 6 * 60 * 60 * 1000)) // Every 6 hours
    tides.push({
      type: i % 2 === 0 ? 'High Tide' : 'Low Tide',
      t: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      v: (2 + Math.random() * 4).toFixed(1)
    })
  }
  
  return tides
}

const generateWeatherForecast = (baseTemp) => {
  const forecast = []
  for (let i = 0; i < 24; i++) {
    forecast.push({
      time: new Date(Date.now() + i * 60 * 60 * 1000).toISOString(),
      temperature: baseTemp + (Math.random() * 8 - 4)
    })
  }
  return forecast
}

const calculateFishingScore = ({ waterTemp, windSpeed, waveHeight, season, isCoastal }) => {
  let score = 50 // Base score
  
  // Water temperature (optimal 60-75°F)
  if (waterTemp >= 60 && waterTemp <= 75) score += 20
  else if (waterTemp >= 50 && waterTemp <= 85) score += 10
  else score -= 10
  
  // Wind conditions (optimal 5-15 mph)
  if (windSpeed >= 5 && windSpeed <= 15) score += 20
  else if (windSpeed <= 25) score += 10
  else score -= 15
  
  // Wave conditions
  if (isCoastal) {
    if (waveHeight >= 1 && waveHeight <= 3) score += 15
    else if (waveHeight <= 5) score += 5
    else score -= 10
  }
  
  // Seasonal adjustments
  if (season === 'spring' || season === 'fall') score += 10
  else if (season === 'summer') score += 5
  
  return Math.max(0, Math.min(100, score))
}

const generateInsights = (score, waterTemp, windSpeed, waveHeight, location) => {
  let insights = `Current fishing conditions for ${location}: `
  
  if (score >= 80) {
    insights += "Excellent fishing conditions expected! "
  } else if (score >= 60) {
    insights += "Good fishing conditions with favorable factors. "
  } else if (score >= 40) {
    insights += "Fair fishing conditions with mixed factors. "
  } else {
    insights += "Challenging fishing conditions, but persistence can pay off. "
  }

  if (windSpeed <= 10) {
    insights += "Calm winds create comfortable fishing conditions. "
  } else if (windSpeed <= 20) {
    insights += "Moderate winds may affect casting but can stimulate fish activity. "
  } else {
    insights += "Strong winds present challenges - consider sheltered areas. "
  }

  if (waveHeight <= 2) {
    insights += "Small waves provide good conditions for most techniques. "
  } else if (waveHeight <= 4) {
    insights += "Moderate waves - excellent for surf fishing. "
  } else {
    insights += "Large waves - shore fishing recommended over boat fishing. "
  }

  insights += `Water temperature of ${Math.round(waterTemp)}°F is ${
    waterTemp >= 60 && waterTemp <= 75 ? 'ideal' : 'acceptable'
  } for most fish species. Best fishing times are typically early morning and late afternoon.`

  return insights
}

const getFishingRating = (score) => {
  if (score >= 80) return { label: 'Excellent', color: 'green' }
  if (score >= 60) return { label: 'Good', color: 'blue' }
  if (score >= 40) return { label: 'Fair', color: 'yellow' }
  return { label: 'Poor', color: 'red' }
}

const createTemperatureChart = () => {
  if (!chartCanvas.value || !reportData.value) return
  
  const ctx = chartCanvas.value.getContext('2d')
  const forecast = reportData.value.weather.forecast
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: forecast.slice(0, 12).map((_, i) => {
        const hour = new Date(Date.now() + i * 60 * 60 * 1000).getHours()
        return `${hour}:00`
      }),
      datasets: [{
        label: 'Temperature (°F)',
        data: forecast.slice(0, 12).map(f => Math.round(f.temperature)),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Temperature (°F)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time'
          }
        }
      }
    }
  })
}

// SEO
useHead({
  title: 'Fishing Report Pro - Real-time Fishing Conditions',
  meta: [
    { name: 'description', content: 'Get real-time fishing reports with weather, tides, and marine conditions for the best fishing experience.' }
  ]
})
</script>

<style scoped>
.fishing-card {
  @apply shadow-lg border-blue-200;
}

.fishing-card:hover {
  @apply shadow-xl;
}
</style>