import type { MarineLocation, TidalData, TidalPrediction, TidalExtreme, NoaaCoOpsResponse } from '~/types/marine'

export const useTidalData = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const cache = new Map<string, { data: TidalData; timestamp: number }>()
  
  // Cache duration in milliseconds (1 hour)
  const CACHE_DURATION = 60 * 60 * 1000

  // Main function to fetch tidal data
  const fetchTidalData = async (location: MarineLocation): Promise<TidalData> => {
    if (!location.stationId) {
      throw new Error('No tidal station available for this location')
    }

    const cacheKey = `tidal-${location.stationId}`
    const cached = cache.get(cacheKey)
    
    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }

    loading.value = true
    error.value = null

    try {
      // Fetch data for today and next 2 days
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      const dayAfter = new Date(today)
      dayAfter.setDate(today.getDate() + 2)

      // Fetch predictions and high/low data in parallel
      const [todayData, tomorrowData, dayAfterData, extremesData] = await Promise.all([
        fetchDayTidalPredictions(location.stationId, today),
        fetchDayTidalPredictions(location.stationId, tomorrow),
        fetchDayTidalPredictions(location.stationId, dayAfter),
        fetchTidalExtremes(location.stationId, today, dayAfter)
      ])

      const tidalData: TidalData = {
        stationId: location.stationId,
        stationName: location.name,
        today: todayData,
        tomorrow: tomorrowData,
        dayAfter: dayAfterData,
        extremes: extremesData
      }

      // Cache the result
      cache.set(cacheKey, {
        data: tidalData,
        timestamp: Date.now()
      })

      return tidalData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tidal data'
      error.value = errorMessage
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  // Fetch tidal predictions for a specific day
  const fetchDayTidalPredictions = async (
    stationId: string, 
    date: Date
  ): Promise<TidalPrediction[]> => {
    const dateStr = formatDate(date)
    const nextDayStr = formatDate(new Date(date.getTime() + 24 * 60 * 60 * 1000))

    const baseUrl = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter'
    const params = new URLSearchParams({
      begin_date: dateStr,
      end_date: nextDayStr,
      station: stationId,
      product: 'predictions',
      datum: 'MLLW',
      time_zone: 'lst_ldt',
      interval: '6', // 6-minute intervals
      units: 'english',
      format: 'json',
      application: 'Marine_Weather_Terminal'
    })

    const response = await $fetch<NoaaCoOpsResponse>(`${baseUrl}?${params}`)
    
    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Invalid tidal prediction data received')
    }

    return response.data.map(item => ({
      time: item.t,
      height: parseFloat(item.v),
      type: 'prediction' as const,
      verified: false
    }))
  }

  // Fetch high/low tide extremes
  const fetchTidalExtremes = async (
    stationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{ highTide: TidalExtreme[]; lowTide: TidalExtreme[] }> => {
    const startDateStr = formatDate(startDate)
    const endDateStr = formatDate(endDate)

    const baseUrl = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter'
    const params = new URLSearchParams({
      begin_date: startDateStr,
      end_date: endDateStr,
      station: stationId,
      product: 'predictions',
      datum: 'MLLW',
      time_zone: 'lst_ldt',
      interval: 'hilo', // High/Low only
      units: 'english',
      format: 'json',
      application: 'Marine_Weather_Terminal'
    })

    const response = await $fetch<NoaaCoOpsResponse>(`${baseUrl}?${params}`)
    
    if (!response.data || !Array.isArray(response.data)) {
      return { highTide: [], lowTide: [] }
    }

    const highTide: TidalExtreme[] = []
    const lowTide: TidalExtreme[] = []

    response.data.forEach(item => {
      const extreme: TidalExtreme = {
        time: item.t,
        height: parseFloat(item.v),
        type: (item.t.includes('H') || parseFloat(item.v) > 2) ? 'H' : 'L',
        date: item.t.split(' ')[0]
      }

      if (extreme.type === 'H') {
        highTide.push(extreme)
      } else {
        lowTide.push(extreme)
      }
    })

    return { highTide, lowTide }
  }

  // Get station information
  const fetchStationInfo = async (stationId: string) => {
    const baseUrl = 'https://api.tidesandcurrents.noaa.gov/mdapi/prod/webapi/stations'
    
    try {
      const response = await $fetch(`${baseUrl}/${stationId}.json`)
      return response
    } catch (err) {
      console.warn(`Could not fetch station info for ${stationId}:`, err)
      return null
    }
  }

  // Get real-time water level data
  const fetchRealTimeWaterLevel = async (stationId: string): Promise<TidalPrediction[]> => {
    const baseUrl = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter'
    const params = new URLSearchParams({
      date: 'latest',
      station: stationId,
      product: 'water_level',
      datum: 'MLLW',
      time_zone: 'lst_ldt',
      units: 'english',
      format: 'json',
      application: 'Marine_Weather_Terminal'
    })

    try {
      const response = await $fetch<NoaaCoOpsResponse>(`${baseUrl}?${params}`)
      
      if (!response.data || !Array.isArray(response.data)) {
        return []
      }

      return response.data.map(item => ({
        time: item.t,
        height: parseFloat(item.v),
        type: 'prediction' as const,
        verified: true
      }))
    } catch (err) {
      console.warn('Could not fetch real-time water level:', err)
      return []
    }
  }

  // Calculate tidal range for a day
  const calculateTidalRange = (predictions: TidalPrediction[]): number => {
    if (predictions.length === 0) return 0
    
    const heights = predictions.map(p => p.height)
    const maxHeight = Math.max(...heights)
    const minHeight = Math.min(...heights)
    
    return maxHeight - minHeight
  }

  // Get next high/low tide
  const getNextTide = (
    predictions: TidalPrediction[], 
    type: 'high' | 'low'
  ): TidalPrediction | null => {
    const now = new Date()
    
    // Sort predictions by height
    const sorted = [...predictions].sort((a, b) => {
      const timeA = new Date(a.time).getTime()
      const timeB = new Date(b.time).getTime()
      return timeA - timeB
    })

    // Find next tide of specified type
    for (const prediction of sorted) {
      const tideTime = new Date(prediction.time)
      if (tideTime > now) {
        // Determine if this is high or low tide based on surrounding data
        const currentHeight = prediction.height
        const avgHeight = predictions.reduce((sum, p) => sum + p.height, 0) / predictions.length
        
        const isHigh = currentHeight > avgHeight
        
        if ((type === 'high' && isHigh) || (type === 'low' && !isHigh)) {
          return prediction
        }
      }
    }
    
    return null
  }

  // Format date for API calls
  const formatDate = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  }

  // Format time for display
  const formatTime = (timeString: string): string => {
    try {
      const date = new Date(timeString)
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return timeString
    }
  }

  // Format height for display
  const formatHeight = (height: number): string => {
    return `${height.toFixed(1)} ft`
  }

  // Clear cache
  const clearCache = () => {
    cache.clear()
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    fetchTidalData,
    fetchRealTimeWaterLevel,
    fetchStationInfo,
    calculateTidalRange,
    getNextTide,
    formatTime,
    formatHeight,
    clearCache
  }
}