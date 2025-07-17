<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <header class="text-center mb-8">
      <h1 class="text-4xl font-bold text-blue-900 mb-2">
        🎣 Fishing Report Pro
      </h1>
      <p class="text-lg text-blue-700">
        AI-powered fishing insights with real-time data
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
    <div v-if="isLoading" class="text-center py-8">
      <div class="wave-loader mb-4"></div>
      <p class="text-blue-700">Gathering fishing data...</p>
    </div>

    <!-- Fishing Report Dashboard -->
    <div v-if="reportData" class="space-y-6">
      <!-- Current Conditions -->
      <UCard class="fishing-card">
        <template #header>
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-blue-900">
              🌊 Current Conditions - {{ reportData.location }}
            </h2>
            <UBadge :color="getFishingRating(reportData.fishingScore).color" variant="subtle">
              {{ getFishingRating(reportData.fishingScore).label }}
            </UBadge>
          </div>
        </template>
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center">
            <div class="text-2xl mb-1">🌡️</div>
            <div class="text-sm text-gray-600">Water Temp</div>
            <div class="font-semibold">{{ reportData.waterTemp }}°F</div>
          </div>
          <div class="text-center">
            <div class="text-2xl mb-1">💨</div>
            <div class="text-sm text-gray-600">Wind</div>
            <div class="font-semibold">{{ reportData.windSpeed }} mph</div>
          </div>
          <div class="text-center">
            <div class="text-2xl mb-1">🌊</div>
            <div class="text-sm text-gray-600">Wave Height</div>
            <div class="font-semibold">{{ reportData.waveHeight }} ft</div>
          </div>
          <div class="text-center">
            <div class="text-2xl mb-1">🌙</div>
            <div class="text-sm text-gray-600">Moon Phase</div>
            <div class="font-semibold">{{ reportData.moonPhase }}</div>
          </div>
        </div>
      </UCard>

      <!-- Tides Chart -->
      <UCard class="fishing-card">
        <template #header>
          <h3 class="text-lg font-semibold text-blue-900">🌊 Tide Chart</h3>
        </template>
        <div class="chart-container">
          <TideChart :data="reportData.tides" />
        </div>
      </UCard>

      <!-- Solunar Times -->
      <UCard class="fishing-card">
        <template #header>
          <h3 class="text-lg font-semibold text-blue-900">🌙 Best Fishing Times</h3>
        </template>
        <SolunarChart :data="reportData.solunar" />
      </UCard>

      <!-- Weather Forecast -->
      <UCard class="fishing-card">
        <template #header>
          <h3 class="text-lg font-semibold text-blue-900">🌤️ 7-Day Weather</h3>
        </template>
        <WeatherChart :data="reportData.weather" />
      </UCard>

      <!-- AI Insights -->
      <UCard class="fishing-card">
        <template #header>
          <h3 class="text-lg font-semibold text-blue-900">🤖 AI Fishing Insights</h3>
        </template>
        <div class="prose max-w-none">
          <p class="text-gray-700">{{ reportData.aiInsights }}</p>
        </div>
      </UCard>
    </div>

    <!-- Error State -->
    <UAlert 
      v-if="error" 
      color="red" 
      variant="subtle" 
      title="Error"
      :description="error"
      class="mb-4"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// Reactive data
const searchQuery = ref('')
const isSearching = ref(false)
const isLoading = ref(false)
const reportData = ref(null)
const error = ref('')

// Popular fishing locations (similar to Tides4Fishing)
const popularLocations = reactive([
  { name: 'San Francisco Bay, CA', lat: 37.7749, lon: -122.4194 },
  { name: 'Key West, FL', lat: 24.5551, lon: -81.7800 },
  { name: 'Cape Cod, MA', lat: 41.6688, lon: -70.2962 },
  { name: 'Monterey Bay, CA', lat: 36.6002, lon: -121.8947 },
  { name: 'Outer Banks, NC', lat: 35.5582, lon: -75.4665 },
  { name: 'Long Island Sound, NY', lat: 41.1622, lon: -72.9279 },
  { name: 'Tampa Bay, FL', lat: 27.7663, lon: -82.6404 },
  { name: 'Chesapeake Bay, MD', lat: 38.3, lon: -76.5 }
])

// Methods
const searchLocation = async () => {
  if (!searchQuery.value) return
  
  isSearching.value = true
  error.value = ''
  
  try {
    // First, geocode the location
    const locationData = await $fetch('/api/geocode', {
      method: 'POST',
      body: { query: searchQuery.value }
    })
    
    if (locationData.lat && locationData.lon) {
      await getFishingReport(locationData.lat, locationData.lon, locationData.name)
    } else {
      error.value = 'Location not found. Please try a different search term.'
    }
  } catch (err) {
    error.value = 'Failed to search location. Please try again.'
    console.error('Search error:', err)
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
    const data = await $fetch('/api/fishing-report', {
      method: 'POST',
      body: { lat, lon, location: locationName }
    })
    
    reportData.value = data
  } catch (err) {
    error.value = 'Failed to generate fishing report. Please try again.'
    console.error('Report error:', err)
  } finally {
    isLoading.value = false
  }
}

const getFishingRating = (score) => {
  if (score >= 80) return { label: 'Excellent', color: 'green' }
  if (score >= 60) return { label: 'Good', color: 'blue' }
  if (score >= 40) return { label: 'Fair', color: 'yellow' }
  return { label: 'Poor', color: 'red' }
}

// SEO
useHead({
  title: 'Fishing Report Pro - AI-Powered Fishing Forecasts',
  meta: [
    {
      name: 'description',
      content: 'Get comprehensive fishing reports with real-time weather, tides, solunar data, and AI-powered insights for the best fishing experience.'
    }
  ]
})
</script>