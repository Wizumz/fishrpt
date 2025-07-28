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

    <!-- Location and Date Search -->
    <div class="container mx-auto px-4 py-6">
      <UCard class="bg-gray-800 border-gray-700">
        <template #header>
          <h2 class="text-xl font-semibold text-gray-100 flex items-center">
            📍 Marine Location & Date
          </h2>
        </template>
        
        <div class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <!-- State Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Select State</label>
              <USelect
                v-model="selectedState"
                :options="stateOptions"
                placeholder="Choose a state..."
                size="lg"
                :ui="{ base: 'bg-gray-700 border-gray-600 text-gray-100' }"
                @change="updateLocationOptions"
              />
            </div>

            <!-- Location Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Select Location</label>
              <USelect
                v-model="selectedLocation"
                :options="locationOptions"
                placeholder="Choose a location..."
                size="lg"
                :disabled="!selectedState"
                :ui="{ base: 'bg-gray-700 border-gray-600 text-gray-100' }"
              />
            </div>

            <!-- Date Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Select Date</label>
              <UInput
                v-model="selectedDate"
                type="date"
                size="lg"
                :min="todayDate"
                :max="maxDate"
                :ui="{ base: 'bg-gray-700 border-gray-600 text-gray-100' }"
              />
            </div>
          </div>

          <div class="flex justify-center">
            <UButton 
              :loading="isSearching"
              color="blue" 
              size="lg"
              :disabled="!selectedLocation"
              @click="searchLocation"
              class="px-8"
            >
              <Icon name="heroicons:magnifying-glass" class="w-5 h-5 mr-2" />
              Get Marine Conditions
            </UButton>
          </div>
          
          <div class="border-t border-gray-600 pt-4">
            <div class="text-sm text-gray-400 mb-2">Quick Access - Popular Locations:</div>
            <div class="flex flex-wrap gap-2">
              <UButton 
                v-for="location in popularQuickAccess" 
                :key="location.name"
                variant="outline" 
                size="sm"
                :ui="{ base: 'border-gray-600 text-gray-300 hover:bg-gray-700' }"
                @click="selectQuickLocation(location)"
              >
                {{ location.name }}
              </UButton>
            </div>
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
            <div class="flex items-center justify-between mb-2">
              <h2 class="text-2xl font-bold text-gray-100">{{ reportData.location }}</h2>
              <div class="text-right">
                <div class="text-sm text-gray-400">Forecast Date</div>
                <div class="text-lg font-semibold text-yellow-400">
                  {{ formatReportDate(reportData.reportDate) }}
                </div>
              </div>
            </div>
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
          
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Weather Data Table -->
            <div class="lg:col-span-2">
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
              
              <!-- Marine Weather Details -->
              <div class="mt-6 border-t border-gray-600 pt-4">
                <h4 class="font-semibold text-gray-200 mb-3">🌊 Marine Weather</h4>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-300">Sea State</span>
                    <span class="font-semibold text-cyan-400">{{ getSeaState() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-300">Comfort Level</span>
                    <span class="font-semibold" :class="getComfortColor()">{{ getComfortLevel() }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-300">UV Index</span>
                    <span class="font-semibold" :class="getUVColor(reportData.uvIndex)">{{ reportData.uvIndex }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-300">Best Times</span>
                    <span class="font-semibold text-yellow-400">{{ getBestFishingTimes() }}</span>
                  </div>
                </div>
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
          <div class="flex flex-wrap justify-center gap-4 text-xs mb-4">
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
          
          <!-- Tides & Solunar Data Table -->
          <div class="border-t border-gray-600 pt-4">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Tide Data -->
              <div>
                <h4 class="font-semibold text-gray-200 mb-3 text-sm">📊 Today's Tide Data</h4>
                <div class="overflow-x-auto">
                  <table class="w-full text-xs">
                    <thead>
                      <tr class="border-b border-gray-600">
                        <th class="text-left py-1 text-gray-300">Time</th>
                        <th class="text-center py-1 text-gray-300">Type</th>
                        <th class="text-right py-1 text-gray-300">Height (MLLW)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(tide, index) in reportData.tides.slice(0, 4)" :key="index" 
                          class="border-b border-gray-700">
                        <td class="py-1 text-gray-300">{{ tide.t }}</td>
                        <td class="py-1 text-center">
                          <span :class="tide.type === 'High Tide' ? 'text-cyan-400' : 'text-blue-400'">
                            {{ tide.type === 'High Tide' ? '⬆️ High' : '⬇️ Low' }}
                          </span>
                        </td>
                        <td class="py-1 text-right text-cyan-400 font-semibold">{{ tide.v }} ft</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div class="text-xs text-gray-500 mt-2">
                  * MLLW = Mean Lower Low Water (standard tide reference)
                </div>
              </div>
              
              <!-- Solunar Data -->
              <div>
                <h4 class="font-semibold text-gray-200 mb-3 text-sm">🌙 Today's Solunar Activity</h4>
                <div class="space-y-2">
                  <div class="p-2 bg-green-900/30 rounded text-xs">
                    <div class="font-semibold text-green-400 mb-1">🟢 Major Periods (Peak Activity)</div>
                    <div class="text-gray-300">
                      🌅 {{ reportData.solunar.majorTimes[0] }} - Morning Peak<br>
                      🌇 {{ reportData.solunar.majorTimes[1] }} - Evening Peak
                    </div>
                  </div>
                  <div class="p-2 bg-yellow-900/30 rounded text-xs">
                    <div class="font-semibold text-yellow-400 mb-1">🟡 Minor Periods (Moderate Activity)</div>
                    <div class="text-gray-300">
                      🌙 {{ reportData.solunar.minorTimes[0] }} - Night Activity<br>
                      ☀️ {{ reportData.solunar.minorTimes[1] }} - Midday Activity
                    </div>
                  </div>
                  <div class="p-2 bg-orange-900/30 rounded text-xs">
                    <div class="font-semibold text-orange-400 mb-1">🔶 Sun Times</div>
                    <div class="text-gray-300">
                      🌅 Sunrise: {{ formatSunTime(reportData.sunData.sunrise) }}<br>
                      🌇 Sunset: {{ formatSunTime(reportData.sunData.sunset) }}
                    </div>
                  </div>
                </div>
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
                  <div class="grid grid-cols-4 gap-2 p-2 bg-gray-700 rounded font-semibold">
                    <div class="text-gray-300">Date</div>
                    <div class="text-gray-300">Phase</div>
                    <div class="text-gray-300">Rise/Set</div>
                    <div class="text-gray-300">Light</div>
                  </div>
                  <div v-for="(lunar, index) in reportData.lunarTable" :key="index" 
                       class="grid grid-cols-4 gap-2 p-2 rounded"
                       :class="index % 2 === 0 ? 'bg-gray-750' : 'bg-gray-700'">
                    <div class="text-gray-300">{{ lunar.date }}</div>
                    <div class="text-center text-lg">{{ getMoonPhaseIcon(lunar.illumination) }}</div>
                    <div class="text-gray-300 text-xs">{{ lunar.moonrise }}/{{ lunar.moonset }}</div>
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
const selectedState = ref('')
const selectedLocation = ref('')
const selectedDate = ref('')
const isSearching = ref(false)
const isLoading = ref(false)
const error = ref('')
const reportData = ref(null)
const marineChart = ref(null)
const tempChart = ref(null)
const tideChart = ref(null)
const tidesRenderChart = ref(null)
const tidalCoefficientChart = ref(null)

// Date setup
const todayDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const maxDate = computed(() => {
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 14) // 14 days into the future
  return maxDate.toISOString().split('T')[0]
})

// Initialize with today's date
onMounted(() => {
  selectedDate.value = todayDate.value
})

// Fishing locations organized by state from Tides4Fishing database
const fishingLocationsByState = {
  'California': [
    { label: 'San Francisco Bay', value: 'San Francisco Bay, CA', lat: 37.8063, lon: -122.4659 },
    { label: 'Monterey Bay', value: 'Monterey Bay, CA', lat: 36.6089, lon: -121.8914 },
    { label: 'Los Angeles Harbor', value: 'Los Angeles Harbor, CA', lat: 33.7199, lon: -118.2728 },
    { label: 'San Diego Bay', value: 'San Diego Bay, CA', lat: 32.7156, lon: -117.1767 },
    { label: 'Half Moon Bay', value: 'Half Moon Bay, CA', lat: 37.5025, lon: -122.4822 },
    { label: 'Bodega Bay', value: 'Bodega Bay, CA', lat: 38.3083, lon: -123.0550 },
    { label: 'Newport Beach', value: 'Newport Beach, CA', lat: 33.6033, lon: -117.8830 },
    { label: 'Santa Barbara', value: 'Santa Barbara, CA', lat: 34.4031, lon: -119.6928 },
    { label: 'Crescent City', value: 'Crescent City, CA', lat: 41.7450, lon: -124.1830 },
    { label: 'Santa Catalina Island', value: 'Avalon, Santa Catalina Island, CA', lat: 33.3450, lon: -118.3250 }
  ],
  'Florida': [
    { label: 'Miami Beach', value: 'Miami Beach, FL', lat: 25.7617, lon: -80.1918 },
    { label: 'Key West', value: 'Key West, FL', lat: 24.5551, lon: -81.7800 },
    { label: 'Tampa Bay', value: 'Tampa Bay, FL', lat: 27.7663, lon: -82.6404 },
    { label: 'Fort Lauderdale', value: 'Fort Lauderdale, FL', lat: 26.1224, lon: -80.1373 },
    { label: 'Jacksonville', value: 'Jacksonville, FL', lat: 30.3322, lon: -81.6557 },
    { label: 'Naples', value: 'Naples, FL', lat: 26.1420, lon: -81.7948 },
    { label: 'Pensacola', value: 'Pensacola, FL', lat: 30.4213, lon: -87.2169 },
    { label: 'Clearwater', value: 'Clearwater, FL', lat: 27.9659, lon: -82.8001 },
    { label: 'Key Largo', value: 'Key Largo, FL', lat: 25.0865, lon: -80.4473 },
    { label: 'Fort Myers', value: 'Fort Myers, FL', lat: 26.5407, lon: -81.8723 }
  ],
  'Texas': [
    { label: 'Galveston', value: 'Galveston, TX', lat: 29.3013, lon: -94.7977 },
    { label: 'Corpus Christi', value: 'Corpus Christi, TX', lat: 27.8006, lon: -97.3964 },
    { label: 'South Padre Island', value: 'South Padre Island, TX', lat: 26.0757, lon: -97.1669 },
    { label: 'Port Aransas', value: 'Port Aransas, TX', lat: 27.8339, lon: -97.0614 },
    { label: 'Port Arthur', value: 'Port Arthur, TX', lat: 29.8850, lon: -93.9294 },
    { label: 'Freeport', value: 'Freeport, TX', lat: 28.9540, lon: -95.3097 },
    { label: 'Matagorda', value: 'Matagorda, TX', lat: 28.6928, lon: -95.9686 }
  ],
  'North Carolina': [
    { label: 'Outer Banks', value: 'Outer Banks, NC', lat: 35.5585, lon: -75.4665 },
    { label: 'Cape Hatteras', value: 'Cape Hatteras, NC', lat: 35.2270, lon: -75.5011 },
    { label: 'Wilmington', value: 'Wilmington, NC', lat: 34.2257, lon: -77.9447 },
    { label: 'Morehead City', value: 'Morehead City, NC', lat: 34.7193, lon: -76.7326 },
    { label: 'Nags Head', value: 'Nags Head, NC', lat: 35.9574, lon: -75.6240 },
    { label: 'Duck', value: 'Duck, NC', lat: 36.1832, lon: -75.7454 }
  ],
  'South Carolina': [
    { label: 'Charleston', value: 'Charleston, SC', lat: 32.7767, lon: -79.9311 },
    { label: 'Hilton Head Island', value: 'Hilton Head Island, SC', lat: 32.2163, lon: -80.7526 },
    { label: 'Myrtle Beach', value: 'Myrtle Beach, SC', lat: 33.6891, lon: -78.8867 },
    { label: 'Georgetown', value: 'Georgetown, SC', lat: 33.3771, lon: -79.2945 }
  ],
  'Massachusetts': [
    { label: 'Cape Cod', value: 'Cape Cod, MA', lat: 41.6688, lon: -70.2962 },
    { label: 'Boston Harbor', value: 'Boston Harbor, MA', lat: 42.3584, lon: -71.0598 },
    { label: 'Martha\'s Vineyard', value: 'Martha\'s Vineyard, MA', lat: 41.3888, lon: -70.6420 },
    { label: 'Nantucket', value: 'Nantucket, MA', lat: 41.2835, lon: -70.0995 },
    { label: 'Gloucester', value: 'Gloucester, MA', lat: 42.6142, lon: -70.6551 }
  ],
  'New York': [
    { label: 'Montauk Point', value: 'Montauk Point, NY', lat: 41.0362, lon: -71.8506 },
    { label: 'Fire Island', value: 'Fire Island, NY', lat: 40.6448, lon: -73.1618 },
    { label: 'New York Harbor', value: 'New York Harbor, NY', lat: 40.6642, lon: -74.0445 },
    { label: 'Long Island Sound', value: 'Long Island Sound, NY', lat: 40.9176, lon: -72.8777 }
  ],
  'Virginia': [
    { label: 'Virginia Beach', value: 'Virginia Beach, VA', lat: 36.8529, lon: -75.9780 },
    { label: 'Chesapeake Bay', value: 'Chesapeake Bay, VA', lat: 37.0871, lon: -76.3018 },
    { label: 'Norfolk', value: 'Norfolk, VA', lat: 36.8468, lon: -76.2852 },
    { label: 'Hampton', value: 'Hampton, VA', lat: 37.0298, lon: -76.3452 }
  ]
}

// State options for dropdown
const stateOptions = computed(() => {
  return Object.keys(fishingLocationsByState).map(state => ({
    label: state,
    value: state
  }))
})

// Location options based on selected state
const locationOptions = ref([])

const updateLocationOptions = () => {
  if (selectedState.value && fishingLocationsByState[selectedState.value]) {
    locationOptions.value = fishingLocationsByState[selectedState.value]
  } else {
    locationOptions.value = []
    selectedLocation.value = ''
  }
}

// Quick access popular locations
const popularQuickAccess = [
  { name: 'San Francisco Bay', state: 'California', lat: 37.8063, lon: -122.4659 },
  { name: 'Miami Beach', state: 'Florida', lat: 25.7617, lon: -80.1918 },
  { name: 'Cape Cod', state: 'Massachusetts', lat: 41.6688, lon: -70.2962 },
  { name: 'Outer Banks', state: 'North Carolina', lat: 35.5585, lon: -75.4665 },
  { name: 'Galveston', state: 'Texas', lat: 29.3013, lon: -94.7977 },
  { name: 'Charleston', state: 'South Carolina', lat: 32.7767, lon: -79.9311 }
]

const searchLocation = async () => {
  if (!selectedLocation.value) return
  
  isSearching.value = true
  error.value = ''
  
  try {
    // Find the selected location data
    const locationData = findLocationData(selectedLocation.value)
    if (locationData) {
      await getMarineReport(locationData.lat, locationData.lon, locationData.value, selectedDate.value)
    }
  } catch (err) {
    error.value = 'Failed to fetch marine conditions. Please try again.'
  } finally {
    isSearching.value = false
  }
}

const selectQuickLocation = async (location) => {
  // Set the state and location for quick access
  selectedState.value = location.state
  updateLocationOptions()
  
  // Find the matching location in the state options
  const locationOption = locationOptions.value.find(opt => 
    opt.label === location.name
  )
  
  if (locationOption) {
    selectedLocation.value = locationOption.value
    await searchLocation()
  }
}

const findLocationData = (locationValue) => {
  for (const state in fishingLocationsByState) {
    const location = fishingLocationsByState[state].find(loc => loc.value === locationValue)
    if (location) return location
  }
  return null
}

const getMarineReport = async (lat, lon, locationName, selectedDate = null) => {
  isLoading.value = true
  error.value = ''
  
  try {
    const data = await generateMarineReport(lat, lon, locationName, selectedDate)
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
const generateMarineReport = async (lat, lon, locationName, selectedDate = null) => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  const reportDate = selectedDate ? new Date(selectedDate) : new Date()
  const season = getSeason(reportDate.getMonth())
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
    timestamp: reportDate.toISOString(),
    reportDate: selectedDate || reportDate.toISOString().split('T')[0],
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
    tides: generateAdvancedTideData(selectedDate),
    solunar: generateSolunarData(),
    lunarTable: generateLunarTable(selectedDate),
    tidalCoefficient: generateTidalCoefficient(),
    historicalTemp: generateHistoricalTempData(waterTemp),
    historicalSummary: generateHistoricalSummary(),
    marineData: generateMarineData(windSpeed, waveHeight, selectedDate),
    sunData: generateSunData(selectedDate)
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

const generateSunData = (selectedDate = null) => {
  const baseDate = selectedDate ? new Date(selectedDate) : new Date()
  const sunrise = new Date(baseDate)
  sunrise.setHours(6, 30 + Math.random() * 60, 0, 0)
  
  const sunset = new Date(baseDate)
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

const generateAdvancedTideData = (selectedDate = null) => {
  const tides = []
  const baseDate = selectedDate ? new Date(selectedDate) : new Date()
  baseDate.setHours(0, 0, 0, 0) // Start from midnight
  
  for (let i = 0; i < 12; i++) {
    const time = new Date(baseDate.getTime() + (i * 6.25 * 60 * 60 * 1000))
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

const generateLunarTable = (selectedDate = null) => {
  const table = []
  const baseDate = selectedDate ? new Date(selectedDate) : new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(baseDate.getTime() + i * 24 * 60 * 60 * 1000)
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

const generateMarineData = (windSpeed, waveHeight, selectedDate = null) => {
  // Use selected date or current date
  const baseDate = selectedDate ? new Date(selectedDate) : new Date()
  baseDate.setHours(0, 0, 0, 0) // Start from midnight
  
  const baseSwellPeriod = 8 + Math.random() * 8
  
  return {
    windSpeed: Array.from({ length: 24 }, (_, i) => windSpeed + Math.sin(i * 0.3) * 3 + Math.random() * 2),
    waveHeight: Array.from({ length: 24 }, (_, i) => waveHeight + Math.sin(i * 0.25) * 0.5 + Math.random() * 0.3),
    swellPeriod: Array.from({ length: 24 }, (_, i) => baseSwellPeriod + Math.sin(i * 0.2) * 2 + Math.random() * 1),
    tideHeights: Array.from({ length: 24 }, (_, i) => 3 + Math.sin(i * 0.5) * 2.5),
    timestamps: Array.from({ length: 24 }, (_, i) => 
      new Date(baseDate.getTime() + i * 60 * 60 * 1000).toISOString()
    )
  }
}

// Utility functions for formatting
const formatSunTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const getMoonPhaseIcon = (illumination) => {
  if (illumination < 5) return '🌑'      // New Moon
  if (illumination < 25) return '🌒'     // Waxing Crescent
  if (illumination < 35) return '🌓'     // First Quarter
  if (illumination < 65) return '🌔'     // Waxing Gibbous
  if (illumination < 75) return '🌕'     // Full Moon
  if (illumination < 85) return '🌖'     // Waning Gibbous
  if (illumination < 95) return '🌗'     // Last Quarter
  return '🌘'                            // Waning Crescent
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
  const wind = reportData.value.windSpeed
  
  // Unified assessment considering all factors
  if (period < 8 && height > 3) return 'Steep swell - Challenging conditions'
  if (height > 4 || wind > 25) return 'Rough conditions'
  if (height < 2 && wind < 15 && period > 10) return 'Excellent conditions'
  return 'Good conditions'
}

const getComfortLevel = () => {
  if (!reportData.value) return 'Excellent'
  const waves = reportData.value.waveHeight
  const wind = reportData.value.windSpeed
  const period = reportData.value.swellPeriod
  
  // Unified assessment matching swell safety
  if (period < 8 && waves > 3) return 'Challenging'
  if (waves > 4 || wind > 25) return 'Rough'
  if (waves < 2 && wind < 15 && period > 10) return 'Excellent'
  return 'Good'
}

const getComfortColor = () => {
  if (!reportData.value) return 'text-green-400'
  const comfort = getComfortLevel()
  
  if (comfort === 'Excellent') return 'text-green-400'
  if (comfort === 'Good') return 'text-blue-400'
  if (comfort === 'Rough') return 'text-yellow-400'
  return 'text-red-400'
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

const formatReportDate = (dateStr) => {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const reportDate = new Date(date)
  reportDate.setHours(0, 0, 0, 0)
  
  const diffTime = reportDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 1) return `In ${diffDays} days`
  if (diffDays < -1) return `${Math.abs(diffDays)} days ago`
  
  return date.toLocaleDateString([], { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  })
}

// Chart creation functions
const createMarineChart = () => {
  if (!marineChart.value || !reportData.value) return
  
  const ctx = marineChart.value.getContext('2d')
  const data = reportData.value.marineData
  
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.timestamps.map((timestamp, i) => {
        const hour = new Date(timestamp).getHours()
        return `${hour.toString().padStart(2, '0')}:00`
      }),
      datasets: [
        {
          label: 'Wind Speed (mph)',
          data: data.windSpeed,
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          yAxisID: 'y',
          tension: 0.4,
          fill: false,
          borderWidth: 2
        },
        {
          label: 'Swell Height (ft)',
          data: data.waveHeight,
          borderColor: 'rgb(6, 182, 212)',
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          yAxisID: 'y1',
          tension: 0.4,
          fill: false,
          borderWidth: 2
        },
        {
          label: 'Swell Period (s)',
          data: data.swellPeriod,
          borderColor: 'rgb(147, 51, 234)',
          backgroundColor: 'rgba(147, 51, 234, 0.1)',
          yAxisID: 'y1',
          tension: 0.4,
          fill: false,
          borderWidth: 2,
          borderDash: [5, 5]
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
          ticks: { 
            color: 'rgb(156, 163, 175)',
            maxTicksLimit: 12
          },
          grid: { color: 'rgba(75, 85, 99, 0.3)' }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: { display: true, text: 'Wind Speed (mph)', color: 'rgb(34, 197, 94)' },
          ticks: { color: 'rgb(156, 163, 175)' },
          grid: { color: 'rgba(75, 85, 99, 0.3)' }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: { display: true, text: 'Swell Height (ft) / Period (s)', color: 'rgb(6, 182, 212)' },
          ticks: { color: 'rgb(156, 163, 175)' },
          grid: { drawOnChartArea: false }
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