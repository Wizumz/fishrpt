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

      <!-- Weather Conditions Table -->
      <div class="mb-6">
        <UCard class="bg-gray-800 border-gray-700">
          <template #header>
            <h3 class="text-lg font-semibold text-gray-100">🌤️ Weather Conditions</h3>
          </template>
          
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Weather Data Table -->
            <div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-gray-600">
                      <th class="text-left py-2 text-gray-300">Metric</th>
                      <th class="text-right py-2 text-gray-300">Current</th>
                      <th class="text-right py-2 text-gray-300">Min/Max</th>
                    </tr>
                  </thead>
                  <tbody class="space-y-1">
                    <tr class="border-b border-gray-700">
                      <td class="py-2 text-gray-300">💨 Wind</td>
                      <td class="py-2 text-right text-green-400 font-semibold">{{ Math.round(reportData.windSpeed) }} mph {{ getWindDirection(reportData.windDirection) }}</td>
                      <td class="py-2 text-right text-gray-400">{{ reportData.weatherTable.wind.min }}-{{ reportData.weatherTable.wind.max }} mph</td>
                    </tr>
                    <tr class="border-b border-gray-700">
                      <td class="py-2 text-gray-300">🌡️ Air Temperature</td>
                      <td class="py-2 text-right text-orange-400 font-semibold">{{ Math.round(reportData.airTemp) }}°F</td>
                      <td class="py-2 text-right text-gray-400">{{ reportData.weatherTable.airTemp.min }}°F / {{ reportData.weatherTable.airTemp.max }}°F</td>
                    </tr>
                    <tr class="border-b border-gray-700">
                      <td class="py-2 text-gray-300">💧 Humidity</td>
                      <td class="py-2 text-right text-blue-400 font-semibold">{{ reportData.humidity }}%</td>
                      <td class="py-2 text-right text-gray-400">Dew Point: {{ Math.round(reportData.dewPoint) }}°F</td>
                    </tr>
                    <tr class="border-b border-gray-700">
                      <td class="py-2 text-gray-300">👁️ Visibility</td>
                      <td class="py-2 text-right text-cyan-400 font-semibold">{{ reportData.visibility }} mi</td>
                      <td class="py-2 text-right text-gray-400">{{ reportData.weatherTable.visibility.condition }}</td>
                    </tr>
                    <tr>
                      <td class="py-2 text-gray-300">☁️ Cloud Cover</td>
                      <td class="py-2 text-right text-gray-400 font-semibold">{{ reportData.cloudCover }}%</td>
                      <td class="py-2 text-right text-gray-400">{{ getCloudCondition(reportData.cloudCover) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Barometric Pressure Gauge -->
            <div class="flex flex-col items-center justify-center">
              <h4 class="text-md font-semibold text-gray-200 mb-4">Barometric Pressure</h4>
              <div class="relative w-48 h-24 mb-4">
                <!-- Gauge background -->
                <svg class="w-full h-full" viewBox="0 0 200 100">
                  <!-- Gauge arc -->
                  <path d="M 20 80 A 80 80 0 0 1 180 80" 
                        stroke="rgb(75, 85, 99)" 
                        stroke-width="8" 
                        fill="none"/>
                  
                  <!-- Pressure marks -->
                  <text x="20" y="95" class="text-xs fill-gray-400" text-anchor="middle">29.0</text>
                  <text x="100" y="25" class="text-xs fill-gray-400" text-anchor="middle">30.0</text>
                  <text x="180" y="95" class="text-xs fill-gray-400" text-anchor="middle">31.0</text>
                  
                  <!-- Pressure zones -->
                  <path d="M 20 80 A 80 80 0 0 1 100 20" 
                        stroke="rgb(239, 68, 68)" 
                        stroke-width="4" 
                        fill="none" 
                        opacity="0.6"/>
                  <path d="M 100 20 A 80 80 0 0 1 180 80" 
                        stroke="rgb(34, 197, 94)" 
                        stroke-width="4" 
                        fill="none" 
                        opacity="0.6"/>
                  
                  <!-- Needle -->
                  <line :x1="100" :y1="80" 
                        :x2="100 + 60 * Math.cos(getPressureAngle())" 
                        :y2="80 - 60 * Math.sin(getPressureAngle())"
                        stroke="rgb(59, 130, 246)" 
                        stroke-width="3" 
                        stroke-linecap="round"/>
                  
                  <!-- Center dot -->
                  <circle cx="100" cy="80" r="4" fill="rgb(59, 130, 246)"/>
                </svg>
              </div>
              
              <div class="text-center">
                <div class="text-2xl font-bold text-purple-400 mb-1">{{ reportData.pressure.toFixed(2) }} inHg</div>
                <div class="text-sm font-semibold" :class="getPressureConditionColor()">
                  {{ getPressureCondition() }}
                </div>
                <div class="text-xs text-gray-400 mt-1">
                  {{ getPressureTrend() }}
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Tides and Solunar Overlay Chart -->
      <div class="mb-6">
        <UCard class="bg-gray-800 border-gray-700">
          <template #header>
            <h3 class="text-lg font-semibold text-gray-100">🌊 Tides & Solunar Activity</h3>
          </template>
          
          <div class="h-64 mb-4">
            <canvas ref="tidesRenderChart"></canvas>
          </div>
          
          <!-- Legend -->
          <div class="flex flex-wrap justify-center gap-4 text-xs">
            <div class="flex items-center space-x-2">
              <div class="w-4 h-2 bg-cyan-400 rounded"></div>
              <span class="text-gray-300">Tide Height</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-4 h-2 bg-green-500 rounded opacity-60"></div>
              <span class="text-gray-300">Major Solunar</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-4 h-2 bg-yellow-500 rounded opacity-60"></div>
              <span class="text-gray-300">Minor Solunar</span>
            </div>
            <div class="flex items-center space-x-2">
              <div class="w-4 h-2 bg-orange-400 rounded"></div>
              <span class="text-gray-300">Sunrise/Sunset</span>
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

          <!-- Tidal Coefficient Chart -->
          <UCard class="bg-gray-800 border-gray-700">
            <template #header>
              <h3 class="text-lg font-semibold text-gray-100">📊 Tidal Coefficient</h3>
            </template>
            
            <div class="h-48">
              <canvas ref="tidalCoefficientChart"></canvas>
            </div>
            
            <div class="mt-4 p-3 bg-gray-700 rounded-lg">
              <div class="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <div class="text-lg font-bold text-cyan-400">{{ reportData.tidalCoefficient.current }}</div>
                  <div class="text-gray-400">Today</div>
                </div>
                <div>
                  <div class="text-lg font-bold" :class="getTidalCoefficientColor(reportData.tidalCoefficient.current)">
                    {{ getTidalCoefficientLevel(reportData.tidalCoefficient.current) }}
                  </div>
                  <div class="text-gray-400">Tide Strength</div>
                </div>
                <div>
                  <div class="text-lg font-bold text-yellow-400">{{ reportData.tidalCoefficient.nextSpring }}</div>
                  <div class="text-gray-400">Next Spring Tide</div>
                </div>
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

          <!-- Marine Weather -->
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

      <!-- Historical Summary Table -->
      <div class="mt-6">
        <UCard class="bg-gray-800 border-gray-700">
          <template #header>
            <h3 class="text-lg font-semibold text-gray-100">📊 Historical Summary (Last 7 Days)</h3>
          </template>
          
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-600">
                  <th class="text-left py-3 text-gray-300">Date</th>
                  <th class="text-center py-3 text-gray-300">Water Temp</th>
                  <th class="text-center py-3 text-gray-300">Air Temp</th>
                  <th class="text-center py-3 text-gray-300">Wind</th>
                  <th class="text-center py-3 text-gray-300">Pressure</th>
                  <th class="text-center py-3 text-gray-300">Tide Range</th>
                  <th class="text-center py-3 text-gray-300">Solunar</th>
                  <th class="text-center py-3 text-gray-300">Conditions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(day, index) in reportData.historicalSummary" :key="index" 
                    class="border-b border-gray-700 hover:bg-gray-750">
                  <td class="py-3 text-gray-300">{{ day.date }}</td>
                  <td class="py-3 text-center text-blue-400">{{ day.waterTemp }}°F</td>
                  <td class="py-3 text-center text-orange-400">{{ day.airTemp }}°F</td>
                  <td class="py-3 text-center text-green-400">{{ day.wind }}</td>
                  <td class="py-3 text-center text-purple-400">{{ day.pressure }}"</td>
                  <td class="py-3 text-center text-cyan-400">{{ day.tideRange }} ft</td>
                  <td class="py-3 text-center text-yellow-400">{{ day.solunar }}%</td>
                  <td class="py-3 text-center">
                    <span class="text-xs px-2 py-1 rounded" :class="day.conditionColor">{{ day.condition }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </UCard>
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
const tidesRenderChart = ref(null)
const tidalCoefficientChart = ref(null)

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
      createTidesRenderChart()
      createTidalCoefficientChart()
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
  const pressure = 29.8 + Math.random() * 0.6
  
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
    pressure: pressure,
    pressureTrend: generatePressureTrend(),
    humidity: Math.round(60 + Math.random() * 30),
    cloudCover: Math.round(Math.random() * 100),
    uvIndex: Math.round(Math.random() * 11),
    visibility: Math.round(5 + Math.random() * 15),
    dewPoint: airTemp - 5 - Math.random() * 10,
    weatherTable: generateWeatherTable(windSpeed, airTemp),
    tides: generateAdvancedTideData(),
    solunar: generateSolunarData(),
    lunarTable: generateLunarTable(),
    tidalCoefficient: generateTidalCoefficient(),
    historicalTemp: generateHistoricalTempData(waterTemp),
    historicalSummary: generateHistoricalSummary(),
    marineData: generateMarineData(windSpeed, waveHeight),
    sunData: generateSunData()
  }
}

const generateWeatherTable = (windSpeed, airTemp) => {
  return {
    wind: {
      min: Math.max(0, Math.round(windSpeed - 5)),
      max: Math.round(windSpeed + 8)
    },
    airTemp: {
      min: Math.round(airTemp - 5),
      max: Math.round(airTemp + 8)
    },
    visibility: {
      condition: Math.random() > 0.7 ? 'Excellent' : Math.random() > 0.4 ? 'Good' : 'Fair'
    }
  }
}

const generatePressureTrend = () => {
  const trends = ['Rising Rapidly', 'Rising Slowly', 'Steady', 'Falling Slowly', 'Falling Rapidly']
  return trends[Math.floor(Math.random() * trends.length)]
}

const generateTidalCoefficient = () => {
  const current = Math.round(20 + Math.random() * 100)
  return {
    current: current,
    nextSpring: Math.round(85 + Math.random() * 15),
    daily: Array.from({ length: 7 }, (_, i) => 
      Math.round(current + Math.sin(i * 0.9) * 30 + Math.random() * 10)
    )
  }
}

const generateSunData = () => {
  const now = new Date()
  const sunrise = new Date(now)
  sunrise.setHours(6, 30 + Math.random() * 60, 0, 0)
  
  const sunset = new Date(now)
  sunset.setHours(18, 30 + Math.random() * 60, 0, 0)
  
  return {
    sunrise: sunrise.getTime(),
    sunset: sunset.getTime()
  }
}

const generateHistoricalSummary = () => {
  const summary = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
    const waterTemp = 68 + Math.sin(i * 0.3) * 5 + Math.random() * 4
    const airTemp = waterTemp + Math.random() * 8 - 4
    const windSpeed = 8 + Math.random() * 12
    const pressure = 29.8 + Math.random() * 0.6
    const tideRange = 3 + Math.random() * 4
    const solunar = Math.round(40 + Math.random() * 60)
    
    const condition = solunar > 80 ? 'Excellent' : solunar > 60 ? 'Good' : solunar > 40 ? 'Fair' : 'Poor'
    const conditionColor = {
      'Excellent': 'bg-green-900 text-green-400',
      'Good': 'bg-blue-900 text-blue-400', 
      'Fair': 'bg-yellow-900 text-yellow-400',
      'Poor': 'bg-red-900 text-red-400'
    }[condition]
    
    summary.push({
      date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      waterTemp: Math.round(waterTemp),
      airTemp: Math.round(airTemp),
      wind: `${Math.round(windSpeed)} mph`,
      pressure: pressure.toFixed(2),
      tideRange: tideRange.toFixed(1),
      solunar: solunar,
      condition: condition,
      conditionColor: conditionColor
    })
  }
  
  return summary
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

// Pressure gauge functions
const getPressureAngle = () => {
  if (!reportData.value) return 0
  const pressure = reportData.value.pressure
  // Convert pressure (29.0-31.0) to angle (0-180 degrees)
  const normalizedPressure = (pressure - 29.0) / 2.0
  return normalizedPressure * Math.PI // 0 to PI radians
}

const getPressureCondition = () => {
  if (!reportData.value) return 'Good'
  const pressure = reportData.value.pressure
  const trend = reportData.value.pressureTrend
  
  if (trend.includes('Rapidly')) {
    return pressure > 30.1 ? 'VERY GOOD' : 'GOOD'
  } else if (pressure > 30.2) {
    return 'VERY GOOD'
  } else if (pressure > 29.8) {
    return 'GOOD'
  } else {
    return 'POOR'
  }
}

const getPressureConditionColor = () => {
  const condition = getPressureCondition()
  if (condition === 'VERY GOOD') return 'text-green-400'
  if (condition === 'GOOD') return 'text-blue-400'
  return 'text-red-400'
}

const getPressureTrend = () => {
  if (!reportData.value) return ''
  return reportData.value.pressureTrend
}

// Cloud condition function
const getCloudCondition = (cloudCover) => {
  if (cloudCover < 25) return 'Clear'
  if (cloudCover < 50) return 'Partly Cloudy'
  if (cloudCover < 75) return 'Mostly Cloudy'
  return 'Overcast'
}

// Tidal coefficient functions
const getTidalCoefficientColor = (coefficient) => {
  if (coefficient > 80) return 'text-green-400'
  if (coefficient > 60) return 'text-blue-400'
  if (coefficient > 40) return 'text-yellow-400'
  return 'text-red-400'
}

const getTidalCoefficientLevel = (coefficient) => {
  if (coefficient > 95) return 'Spring Tide'
  if (coefficient > 80) return 'Strong'
  if (coefficient > 60) return 'Moderate'
  if (coefficient > 40) return 'Weak'
  return 'Neap Tide'
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

const createTidesRenderChart = () => {
  if (!tidesRenderChart.value || !reportData.value) return
  
  const ctx = tidesRenderChart.value.getContext('2d')
  const data = reportData.value.marineData
  
  // Create time labels for 24 hours
  const labels = Array.from({ length: 24 }, (_, i) => {
    const hour = new Date(Date.now() + i * 60 * 60 * 1000).getHours()
    return `${hour}:00`
  })
  
  // Create background datasets for solunar periods and sunrise/sunset
  const backgroundHeight = Math.max(...data.tideHeights) + 1
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        // Major Solunar Period 1 (6:30-8:30)
        {
          label: 'Major Solunar 1',
          data: labels.map((_, i) => (i >= 6 && i <= 8) ? backgroundHeight : null),
          backgroundColor: 'rgba(34, 197, 94, 0.3)',
          borderColor: 'transparent',
          pointRadius: 0,
          fill: 'origin',
          order: 3
        },
        // Major Solunar Period 2 (18:45-20:45)
        {
          label: 'Major Solunar 2', 
          data: labels.map((_, i) => (i >= 18 && i <= 20) ? backgroundHeight : null),
          backgroundColor: 'rgba(34, 197, 94, 0.3)',
          borderColor: 'transparent',
          pointRadius: 0,
          fill: 'origin',
          order: 3
        },
        // Minor Solunar Period 1 (0:15-1:15)
        {
          label: 'Minor Solunar 1',
          data: labels.map((_, i) => (i >= 0 && i <= 1) ? backgroundHeight : null),
          backgroundColor: 'rgba(234, 179, 8, 0.3)',
          borderColor: 'transparent',
          pointRadius: 0,
          fill: 'origin',
          order: 3
        },
        // Minor Solunar Period 2 (12:30-13:30)
        {
          label: 'Minor Solunar 2',
          data: labels.map((_, i) => (i >= 12 && i <= 13) ? backgroundHeight : null),
          backgroundColor: 'rgba(234, 179, 8, 0.3)',
          borderColor: 'transparent',
          pointRadius: 0,
          fill: 'origin',
          order: 3
        },
        // Sunrise marker (6:30)
        {
          label: 'Sunrise',
          data: labels.map((_, i) => i === 6 ? backgroundHeight : null),
          backgroundColor: 'rgb(251, 146, 60)',
          borderColor: 'rgb(251, 146, 60)',
          pointRadius: 6,
          pointStyle: 'triangle',
          showLine: false,
          order: 1
        },
        // Sunset marker (18:45)
        {
          label: 'Sunset',
          data: labels.map((_, i) => i === 18 ? backgroundHeight : null),
          backgroundColor: 'rgb(251, 146, 60)',
          borderColor: 'rgb(251, 146, 60)',
          pointRadius: 6,
          pointStyle: 'triangle',
          showLine: false,
          order: 1
        },
        // Main tide data
        {
          label: 'Tide Height',
          data: data.tideHeights,
          borderColor: 'rgb(6, 182, 212)',
          backgroundColor: 'rgba(6, 182, 212, 0.2)',
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          order: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { 
          display: false 
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.datasetIndex === 6) { // Main tide data
                return `Tide: ${context.parsed.y.toFixed(1)} ft`
              }
              return null
            },
            filter: function(tooltipItem) {
              return tooltipItem.datasetIndex === 6 // Only show tooltip for tide data
            }
          }
        }
      },
      scales: {
        x: {
          ticks: { color: 'rgb(156, 163, 175)' },
          grid: { color: 'rgba(75, 85, 99, 0.3)' }
        },
        y: {
          title: { display: true, text: 'Tide Height (ft)', color: 'rgb(156, 163, 175)' },
          ticks: { color: 'rgb(156, 163, 175)' },
          grid: { color: 'rgba(75, 85, 99, 0.3)' },
          max: backgroundHeight
        }
      }
    }
  })
}

const createTidalCoefficientChart = () => {
  if (!tidalCoefficientChart.value || !reportData.value) return
  
  const ctx = tidalCoefficientChart.value.getContext('2d')
  const data = reportData.value.tidalCoefficient
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({ length: 7 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() + i)
        return date.toLocaleDateString([], { weekday: 'short' })
      }),
      datasets: [
        {
          label: 'Tidal Coefficient',
          data: data.daily,
          borderColor: 'rgb(6, 182, 212)',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgb(6, 182, 212)',
          pointBorderColor: 'rgb(6, 182, 212)',
          pointRadius: 4
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
          ticks: { color: 'rgb(156, 163, 175)' },
          grid: { color: 'rgba(75, 85, 99, 0.3)' }
        },
        y: {
          min: 0,
          max: 120,
          title: { display: true, text: 'Coefficient', color: 'rgb(156, 163, 175)' },
          ticks: { color: 'rgb(156, 163, 175)' },
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