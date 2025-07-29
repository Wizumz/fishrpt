<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
    <!-- Hero Section -->
    <section class="relative py-12 px-4">
      <div class="container mx-auto text-center">
        <div class="mb-8">
          <h1 class="text-4xl md:text-6xl font-bold text-blue-900 mb-4">
            🎣 Fishing Report Pro
            <span class="text-2xl md:text-3xl bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent font-normal">
              v2.0
            </span>
          </h1>
          <p class="text-xl md:text-2xl text-blue-700 mb-2">
            Northeast Striped Bass Intelligence Platform
          </p>
          <p class="text-gray-600 max-w-2xl mx-auto">
            Advanced AI-powered fishing predictions combining real-time NOAA weather, 
            tidal data, and solunar analysis specifically optimized for Striped Bass fishing 
            from Cape Cod to Chesapeake Bay.
          </p>
        </div>

        <!-- Key Features -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div class="bg-white rounded-lg p-6 shadow-lg">
            <div class="text-3xl mb-3">📊</div>
            <h3 class="font-bold text-blue-900 mb-2">Success Matrix</h3>
            <p class="text-sm text-gray-600">
              7-day probability heatmap across 8 prime Striped Bass locations
            </p>
          </div>
          <div class="bg-white rounded-lg p-6 shadow-lg">
            <div class="text-3xl mb-3">🗺️</div>
            <h3 class="font-bold text-blue-900 mb-2">Interactive Map</h3>
            <p class="text-sm text-gray-600">
              Real-time conditions with Windy-style visualizations
            </p>
          </div>
          <div class="bg-white rounded-lg p-6 shadow-lg">
            <div class="text-3xl mb-3">🎯</div>
            <h3 class="font-bold text-blue-900 mb-2">Smart Scoring</h3>
            <p class="text-sm text-gray-600">
              AI algorithm combining 5 key factors for Striped Bass success
            </p>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">8</div>
            <div class="text-xs text-gray-600">Prime Locations</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-600">{{ currentBestScore }}%</div>
            <div class="text-xs text-gray-600">Best Current Score</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-600">{{ activeAlerts }}</div>
            <div class="text-xs text-gray-600">Weather Alerts</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-600">Live</div>
            <div class="text-xs text-gray-600">Data Updates</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <div class="container mx-auto px-4 pb-12">
      <!-- Navigation Tabs -->
      <div class="mb-8">
        <div class="flex flex-wrap justify-center gap-2">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-6 py-3 rounded-lg font-semibold transition-all',
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            ]"
          >
            {{ tab.icon }} {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <!-- Success Matrix Tab -->
        <div v-if="activeTab === 'matrix'" class="tab-panel">
          <FishingMatrix />
        </div>

        <!-- Interactive Map Tab -->
        <div v-if="activeTab === 'map'" class="tab-panel">
          <StripedBassMap />
        </div>

        <!-- Current Conditions Tab -->
        <div v-if="activeTab === 'conditions'" class="tab-panel">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Best Opportunities Today -->
            <UCard>
              <template #header>
                <h3 class="text-xl font-bold text-blue-900">
                  🏆 Best Opportunities Today
                </h3>
              </template>
              
              <div class="space-y-4">
                <div
                  v-for="opportunity in todaysBest"
                  :key="opportunity.id"
                  class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 class="font-semibold text-blue-900">{{ opportunity.name }}</h4>
                    <p class="text-sm text-gray-600">{{ opportunity.state }} • {{ opportunity.timeWindow }}</p>
                    <p class="text-xs text-gray-500">{{ opportunity.reason }}</p>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-bold" :class="getScoreColor(opportunity.score)">
                      {{ opportunity.score }}%
                    </div>
                    <div class="text-xs text-gray-500">{{ opportunity.confidence }}% confidence</div>
                  </div>
                </div>
              </div>
            </UCard>

            <!-- Weather Overview -->
            <UCard>
              <template #header>
                <h3 class="text-xl font-bold text-blue-900">
                  🌊 Regional Conditions
                </h3>
              </template>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="text-center p-4 bg-blue-50 rounded-lg">
                  <div class="text-2xl mb-2">🌡️</div>
                  <div class="font-semibold">Water Temp</div>
                  <div class="text-lg">{{ regionalConditions.waterTemp }}°F</div>
                  <div class="text-xs text-gray-600">{{ regionalConditions.tempTrend }}</div>
                </div>
                
                <div class="text-center p-4 bg-green-50 rounded-lg">
                  <div class="text-2xl mb-2">🌊</div>
                  <div class="font-semibold">Tidal Range</div>
                  <div class="text-lg">{{ regionalConditions.tidalRange }} ft</div>
                  <div class="text-xs text-gray-600">{{ regionalConditions.tidalPhase }}</div>
                </div>
                
                <div class="text-center p-4 bg-yellow-50 rounded-lg">
                  <div class="text-2xl mb-2">🌙</div>
                  <div class="font-semibold">Solunar</div>
                  <div class="text-lg">{{ regionalConditions.solunarRating }}</div>
                  <div class="text-xs text-gray-600">{{ regionalConditions.moonPhase }}</div>
                </div>
                
                <div class="text-center p-4 bg-purple-50 rounded-lg">
                  <div class="text-2xl mb-2">💨</div>
                  <div class="font-semibold">Wind</div>
                  <div class="text-lg">{{ regionalConditions.windSpeed }} mph</div>
                  <div class="text-xs text-gray-600">{{ regionalConditions.windDirection }}</div>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Migration Tracker -->
          <div class="mt-8">
            <UCard>
              <template #header>
                <h3 class="text-xl font-bold text-blue-900">
                  🐟 Striped Bass Migration Tracker
                </h3>
              </template>
              
              <div class="space-y-4">
                <div class="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                  <div>
                    <h4 class="font-semibold">Current Migration Status</h4>
                    <p class="text-sm text-gray-600">{{ migrationStatus.phase }}</p>
                  </div>
                  <div class="text-right">
                    <div class="text-lg font-bold text-blue-600">{{ migrationStatus.activity }}</div>
                    <div class="text-xs text-gray-500">{{ migrationStatus.trend }}</div>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="text-center p-3 bg-gray-50 rounded">
                    <div class="font-semibold text-sm">Northern Waters</div>
                    <div class="text-lg">{{ migrationStatus.north }}°F</div>
                    <div class="text-xs text-gray-600">{{ migrationStatus.northTrend }}</div>
                  </div>
                  <div class="text-center p-3 bg-gray-50 rounded">
                    <div class="font-semibold text-sm">Mid-Atlantic</div>
                    <div class="text-lg">{{ migrationStatus.mid }}°F</div>
                    <div class="text-xs text-gray-600">{{ migrationStatus.midTrend }}</div>
                  </div>
                  <div class="text-center p-3 bg-gray-50 rounded">
                    <div class="font-semibold text-sm">Chesapeake Bay</div>
                    <div class="text-lg">{{ migrationStatus.south }}°F</div>
                    <div class="text-xs text-gray-600">{{ migrationStatus.southTrend }}</div>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </div>

        <!-- Alerts & Insights Tab -->
        <div v-if="activeTab === 'alerts'" class="tab-panel">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Weather Alerts -->
            <UCard>
              <template #header>
                <h3 class="text-xl font-bold text-red-600">
                  ⚠️ Weather Alerts
                </h3>
              </template>
              
              <div class="space-y-3">
                <div
                  v-for="alert in weatherAlerts"
                  :key="alert.id"
                  class="p-4 border-l-4 rounded"
                  :class="getAlertClass(alert.severity)"
                >
                  <h4 class="font-semibold">{{ alert.title }}</h4>
                  <p class="text-sm">{{ alert.description }}</p>
                  <p class="text-xs text-gray-500 mt-1">{{ alert.location }} • {{ alert.time }}</p>
                </div>
                
                <div v-if="weatherAlerts.length === 0" class="text-center py-8 text-gray-500">
                  <div class="text-4xl mb-2">✅</div>
                  <p>No active weather alerts</p>
                </div>
              </div>
            </UCard>

            <!-- Fishing Insights -->
            <UCard>
              <template #header>
                <h3 class="text-xl font-bold text-green-600">
                  💡 AI Insights
                </h3>
              </template>
              
              <div class="space-y-4">
                <div
                  v-for="insight in aiInsights"
                  :key="insight.id"
                  class="p-4 bg-green-50 rounded-lg"
                >
                  <div class="flex items-start">
                    <div class="text-2xl mr-3">{{ insight.icon }}</div>
                    <div>
                      <h4 class="font-semibold text-green-800">{{ insight.title }}</h4>
                      <p class="text-sm text-green-700">{{ insight.description }}</p>
                      <p class="text-xs text-green-600 mt-1">{{ insight.timing }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="bg-blue-900 text-white py-8">
      <div class="container mx-auto px-4 text-center">
        <p class="mb-4">
          <strong>Fishing Report Pro v2.0</strong> - Powered by NOAA, Open-Meteo, and advanced solunar calculations
        </p>
        <div class="flex justify-center space-x-6 text-sm">
          <span>🌊 Real-time NOAA data</span>
          <span>🌙 Solunar calculations</span>
          <span>🎯 AI-powered predictions</span>
          <span>📱 PWA enabled</span>
        </div>
        <p class="text-xs text-blue-300 mt-4">
          Data sources: NOAA Weather Service, NOAA Tides & Currents, Open-Meteo Marine API
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStripedBassData } from '~/composables/useStripedBassData'
import FishingMatrix from '~/components/FishingMatrix.vue'
import StripedBassMap from '~/components/StripedBassMap.vue'

const { locations } = useStripedBassData()

// SEO
useHead({
  title: 'Fishing Report Pro v2.0 - Northeast Striped Bass Intelligence',
  meta: [
    {
      name: 'description',
      content: 'Advanced AI-powered Striped Bass fishing predictions for the Northeast US. Real-time NOAA data, tidal analysis, and solunar calculations for Cape Cod to Chesapeake Bay.'
    },
    {
      name: 'keywords',
      content: 'striped bass fishing, northeast fishing, NOAA data, tidal fishing, solunar charts, fishing forecast, Cape Cod, Montauk, Chesapeake Bay'
    }
  ]
})

// Reactive data
const activeTab = ref('matrix')
const currentBestScore = ref(87)
const activeAlerts = ref(2)

const tabs = [
  { id: 'matrix', label: 'Success Matrix', icon: '📊' },
  { id: 'map', label: 'Interactive Map', icon: '🗺️' },
  { id: 'conditions', label: 'Current Conditions', icon: '🌊' },
  { id: 'alerts', label: 'Alerts & Insights', icon: '⚠️' }
]

// Mock data for demo
const todaysBest = ref([
  {
    id: 1,
    name: 'Montauk Point',
    state: 'NY',
    score: 87,
    confidence: 92,
    timeWindow: '6:00 AM - 8:00 AM',
    reason: 'Optimal tidal movement + major solunar period'
  },
  {
    id: 2,
    name: 'Cape Cod Canal',
    state: 'MA',
    score: 82,
    confidence: 88,
    timeWindow: '7:30 PM - 9:30 PM',
    reason: 'Perfect water temperature + rising tide'
  },
  {
    id: 3,
    name: 'Sandy Hook',
    state: 'NJ',
    score: 79,
    confidence: 85,
    timeWindow: '5:45 AM - 7:45 AM',
    reason: 'Strong tidal current + stable pressure'
  }
])

const regionalConditions = ref({
  waterTemp: 63,
  tempTrend: 'Rising 2°F',
  tidalRange: 6.8,
  tidalPhase: 'Incoming',
  solunarRating: 'Good',
  moonPhase: 'Waxing Gibbous',
  windSpeed: 12,
  windDirection: 'SW'
})

const migrationStatus = ref({
  phase: 'Fall Migration Active',
  activity: 'High Activity',
  trend: 'Moving South',
  north: 58,
  northTrend: 'Falling',
  mid: 63,
  midTrend: 'Stable',
  south: 68,
  southTrend: 'Rising'
})

const weatherAlerts = ref([
  {
    id: 1,
    title: 'Small Craft Advisory',
    description: 'Winds 15-25 knots with gusts to 30 knots. Seas 3-5 feet.',
    location: 'Montauk Point, NY',
    time: '6 hours ago',
    severity: 'warning'
  },
  {
    id: 2,
    title: 'Dense Fog Advisory',
    description: 'Visibility reduced to less than 1 nautical mile.',
    location: 'Cape Cod Bay, MA',
    time: '2 hours ago',
    severity: 'caution'
  }
])

const aiInsights = ref([
  {
    id: 1,
    icon: '🎯',
    title: 'Perfect Storm Conditions',
    description: 'Montauk Point will have ideal conditions tomorrow at dawn. All factors align for excellent Striped Bass activity.',
    timing: 'Tomorrow 6:00 AM - 8:00 AM'
  },
  {
    id: 2,
    icon: '🌡️',
    title: 'Temperature Sweet Spot',
    description: 'Water temperatures in the 60-65°F range are triggering increased feeding activity across all locations.',
    timing: 'Next 3 days'
  },
  {
    id: 3,
    icon: '🌙',
    title: 'Major Solunar Period',
    description: 'Tonight\'s major solunar period coincides with optimal tidal movement at Cape Cod Canal.',
    timing: 'Today 7:30 PM - 9:30 PM'
  }
])

// Methods
const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-blue-600'
  if (score >= 40) return 'text-yellow-600'
  return 'text-red-600'
}

const getAlertClass = (severity) => {
  switch (severity) {
    case 'warning':
      return 'border-red-400 bg-red-50'
    case 'caution':
      return 'border-yellow-400 bg-yellow-50'
    default:
      return 'border-gray-400 bg-gray-50'
  }
}

// Lifecycle
onMounted(() => {
  // Simulate live data updates
  setInterval(() => {
    currentBestScore.value = Math.floor(Math.random() * 20) + 75
  }, 30000) // Update every 30 seconds
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