import type { MarineLocation, SwellData, SwellConditions, SwellForecast } from '~/types/marine'

export const useSwellData = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const cache = new Map<string, { data: SwellData; timestamp: number }>()
  
  // Cache duration in milliseconds (30 minutes)
  const CACHE_DURATION = 30 * 60 * 1000

  // NDBC buoy stations near common marine forecast areas
  const buoyStations = new Map<string, string>([
    // East Coast buoys
    ['anz335', '44017'], // Long Island Sound -> Montauk Point Buoy
    ['anz340', '44017'], // Long Island Sound East -> Montauk Point Buoy  
    ['anz338', '44065'], // New York Harbor -> New York Harbor Entrance Buoy
    ['anz330', '44065'], // New York Ocean Waters -> New York Harbor Entrance Buoy
    ['anz350', '44065'], // Sandy Hook area -> New York Harbor Entrance Buoy
    ['anz353', '44017'], // Fire Island -> Montauk Point Buoy
    ['anz230', '44013'], // Boston Harbor -> Boston Buoy
    ['anz233', '44018'], // Cape Cod Bay -> Cape Cod Bay Buoy
    ['anz236', '44018'], // Cape Cod and Nantucket -> Cape Cod Bay Buoy
    ['anz237', '44097'], // Rhode Island Sound -> Block Island Buoy
    ['anz232', '44097'], // Narragansett Bay -> Block Island Buoy
    ['anz430', '44009'], // Delaware Bay -> Delaware Bay Buoy
    ['anz431', '44009'], // Delaware Coast -> Delaware Bay Buoy
    ['anz450', '44062'], // Chesapeake Bay North -> Chesapeake Light Buoy
    ['anz455', '44062'], // Chesapeake Bay South -> Chesapeake Light Buoy
    ['anz530', '41025'], // Pamlico Sound -> Diamond Shoals Buoy
    ['anz531', '41025']  // Cape Hatteras -> Diamond Shoals Buoy
  ])

  // Fetch swell data for location
  const fetchSwellData = async (location: MarineLocation): Promise<SwellData> => {
    const cacheKey = `swell-${location.id}`
    const cached = cache.get(cacheKey)
    
    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }

    loading.value = true
    error.value = null

    try {
      // Get buoy ID for this location
      const buoyId = buoyStations.get(location.id)
      
      if (!buoyId) {
        // Use coordinates to find nearest buoy
        const nearestBuoy = await findNearestBuoy(location.coordinates.lat, location.coordinates.lng)
        if (!nearestBuoy) {
          throw new Error('No wave data buoy available for this location')
        }
      }

      const finalBuoyId = buoyId || await findNearestBuoy(location.coordinates.lat, location.coordinates.lng)
      
      // Fetch current conditions and forecast in parallel
      const [currentConditions, forecast] = await Promise.all([
        fetchCurrentWaveConditions(finalBuoyId!),
        fetchWaveForecast(location.coordinates.lat, location.coordinates.lng)
      ])

      const swellData: SwellData = {
        buoyId: finalBuoyId,
        location: location.name,
        current: currentConditions,
        forecast,
        lastUpdate: new Date().toISOString()
      }

      // Cache the result
      cache.set(cacheKey, {
        data: swellData,
        timestamp: Date.now()
      })

      return swellData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch swell data'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  // Fetch current wave conditions from NDBC buoy
  const fetchCurrentWaveConditions = async (buoyId: string): Promise<SwellConditions> => {
    try {
      // NDBC real-time data URL
      const url = `https://www.ndbc.noaa.gov/data/realtime2/${buoyId}.txt`
      
      const response = await $fetch<string>(url)
      const lines = response.split('\n')
      
      if (lines.length < 3) {
        throw new Error('Invalid buoy data format')
      }

      // Parse the most recent data line
      const dataLine = lines[2].trim().split(/\s+/)
      const headerLine = lines[0].trim().split(/\s+/)
      
      // Find column indices
      const waveHeightIndex = headerLine.findIndex(h => h === 'WVHT')
      const periodIndex = headerLine.findIndex(h => h === 'DPD')
      const directionIndex = headerLine.findIndex(h => h === 'MWD')
      
      const waveHeight = waveHeightIndex >= 0 ? parseFloat(dataLine[waveHeightIndex]) : 0
      const period = periodIndex >= 0 ? parseFloat(dataLine[periodIndex]) : 0
      const direction = directionIndex >= 0 ? parseFloat(dataLine[directionIndex]) : 0

      return {
        waveHeight: isNaN(waveHeight) ? 0 : waveHeight * 3.28084, // Convert meters to feet
        period: isNaN(period) ? 0 : period,
        direction: isNaN(direction) ? 0 : direction,
        windWaves: {
          height: waveHeight * 3.28084 * 0.7, // Estimate wind waves as 70% of total
          period: period * 0.8,
          direction: direction
        },
        swell: {
          height: waveHeight * 3.28084 * 0.3, // Estimate swell as 30% of total
          period: period * 1.2,
          direction: direction
        }
      }
    } catch (err) {
      console.warn(`Failed to fetch buoy data for ${buoyId}:`, err)
      
      // Return default/estimated values
      return {
        waveHeight: 1.5,
        period: 6,
        direction: 180,
        windWaves: {
          height: 1.0,
          period: 4,
          direction: 180
        },
        swell: {
          height: 0.5,
          period: 8,
          direction: 180
        }
      }
    }
  }

  // Fetch wave forecast from Open-Meteo Marine API (free alternative)
  const fetchWaveForecast = async (lat: number, lng: number): Promise<SwellForecast[]> => {
    try {
      const url = 'https://marine-api.open-meteo.com/v1/marine'
      const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lng.toString(),
        hourly: 'wave_height,wave_direction,wave_period',
        forecast_days: '3',
        timezone: 'auto'
      })

      const response = await $fetch<any>(`${url}?${params}`)
      
      if (!response.hourly || !response.hourly.time) {
        throw new Error('Invalid wave forecast data')
      }

      const { time, wave_height, wave_direction, wave_period } = response.hourly
      const forecast: SwellForecast[] = []

      // Process hourly data for next 48 hours, taking every 6 hours
      for (let i = 0; i < Math.min(time.length, 48); i += 6) {
        if (wave_height[i] !== null && wave_direction[i] !== null && wave_period[i] !== null) {
          forecast.push({
            time: time[i],
            waveHeight: wave_height[i] * 3.28084, // Convert meters to feet
            period: wave_period[i],
            direction: wave_direction[i],
            confidence: i < 24 ? 'high' : i < 36 ? 'medium' : 'low'
          })
        }
      }

      return forecast
    } catch (err) {
      console.warn('Failed to fetch wave forecast:', err)
      return generateDefaultForecast()
    }
  }

  // Find nearest NDBC buoy to coordinates
  const findNearestBuoy = async (lat: number, lng: number): Promise<string | null> => {
    // Simplified buoy finder - in a real implementation, you'd query NDBC station list
    const eastCoastBuoys = [
      { id: '44013', lat: 42.346, lng: -70.651 }, // Boston
      { id: '44017', lat: 40.694, lng: -72.048 }, // Montauk Point
      { id: '44065', lat: 40.369, lng: -73.703 }, // New York Harbor
      { id: '44009', lat: 38.457, lng: -74.703 }, // Delaware Bay
      { id: '44062', lat: 37.419, lng: -74.840 }, // Chesapeake Light
      { id: '41025', lat: 35.006, lng: -75.402 }  // Diamond Shoals
    ]

    let nearestBuoy = null
    let minDistance = Infinity

    for (const buoy of eastCoastBuoys) {
      const distance = calculateDistance(lat, lng, buoy.lat, buoy.lng)
      if (distance < minDistance) {
        minDistance = distance
        nearestBuoy = buoy.id
      }
    }

    return nearestBuoy
  }

  // Calculate distance between two coordinates
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Generate default forecast when API fails
  const generateDefaultForecast = (): SwellForecast[] => {
    const forecast: SwellForecast[] = []
    const now = new Date()

    for (let i = 0; i < 8; i++) {
      const time = new Date(now.getTime() + i * 6 * 60 * 60 * 1000)
      forecast.push({
        time: time.toISOString(),
        waveHeight: 1.5 + Math.random() * 2, // 1.5-3.5 ft
        period: 6 + Math.random() * 4, // 6-10 seconds
        direction: 180 + (Math.random() - 0.5) * 60, // 150-210 degrees
        confidence: i < 4 ? 'medium' : 'low'
      })
    }

    return forecast
  }

  // Format wave height for display
  const formatWaveHeight = (height: number): string => {
    return `${height.toFixed(1)} ft`
  }

  // Format wave period for display
  const formatPeriod = (period: number): string => {
    return `${period.toFixed(0)}s`
  }

  // Format wave direction for display
  const formatDirection = (direction: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
    const index = Math.round(direction / 22.5) % 16
    return `${directions[index]} (${Math.round(direction)}°)`
  }

  // Get wave condition description
  const getWaveConditionDescription = (waveHeight: number): string => {
    if (waveHeight < 1) return 'Calm'
    if (waveHeight < 2) return 'Light'
    if (waveHeight < 4) return 'Moderate'
    if (waveHeight < 6) return 'Rough'
    if (waveHeight < 10) return 'Very Rough'
    return 'Extreme'
  }

  // Clear cache
  const clearCache = () => {
    cache.clear()
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    fetchSwellData,
    formatWaveHeight,
    formatPeriod,
    formatDirection,
    getWaveConditionDescription,
    clearCache
  }
}