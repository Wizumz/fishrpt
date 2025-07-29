import { ref, computed } from 'vue'
import axios from 'axios'
import { format, addHours, startOfDay, addDays } from 'date-fns'
import SunCalc from 'suncalc'
import moment from 'moment-timezone'

// Northeast Striped Bass fishing hotspots (Cape Cod to Chesapeake Bay)
const STRIPED_BASS_LOCATIONS = [
  {
    id: 'cape-cod-canal',
    name: 'Cape Cod Canal',
    lat: 41.7614,
    lng: -70.5222,
    state: 'MA',
    description: 'Prime Striped Bass migration corridor',
    optimalTemp: [58, 65],
    season: 'Spring/Fall',
    structure: 'Canal with strong currents'
  },
  {
    id: 'montauk-point',
    name: 'Montauk Point',
    lat: 41.0718,
    lng: -71.8563,
    state: 'NY',
    description: 'Famous for large Striped Bass',
    optimalTemp: [55, 68],
    season: 'Spring/Summer/Fall',
    structure: 'Rocky point with rips'
  },
  {
    id: 'block-island',
    name: 'Block Island',
    lat: 41.1677,
    lng: -71.5582,
    state: 'RI',
    description: 'Excellent fall migration fishing',
    optimalTemp: [56, 66],
    season: 'Fall',
    structure: 'Rocky shores and sandy beaches'
  },
  {
    id: 'sandy-hook',
    name: 'Sandy Hook',
    lat: 40.4167,
    lng: -74.0167,
    state: 'NJ',
    description: 'Year-round Striped Bass action',
    optimalTemp: [50, 70],
    season: 'Year-round',
    structure: 'Sandy point with deep channels'
  },
  {
    id: 'delaware-bay',
    name: 'Delaware Bay',
    lat: 39.1167,
    lng: -75.2333,
    state: 'DE',
    description: 'Spawning ground access',
    optimalTemp: [60, 72],
    season: 'Spring/Fall',
    structure: 'Bay mouth with tidal flows'
  },
  {
    id: 'chesapeake-bay-bridge',
    name: 'Chesapeake Bay Bridge',
    lat: 38.9987,
    lng: -76.3767,
    state: 'MD',
    description: 'Major spawning area',
    optimalTemp: [65, 75],
    season: 'Spring/Summer',
    structure: 'Bridge pilings and deep channels'
  },
  {
    id: 'race-point',
    name: 'Race Point',
    lat: 42.0631,
    lng: -70.2429,
    state: 'MA',
    description: 'Northern feeding grounds',
    optimalTemp: [52, 62],
    season: 'Summer',
    structure: 'Sandy point with strong currents'
  },
  {
    id: 'orient-point',
    name: 'Orient Point',
    lat: 41.1622,
    lng: -72.2264,
    state: 'NY',
    description: 'Ferry area with structure',
    optimalTemp: [58, 68],
    season: 'Spring/Summer/Fall',
    structure: 'Rocky bottom with ferry traffic'
  }
]

export const useStripedBassData = () => {
  const isLoading = ref(false)
  const error = ref(null)
  const currentLocation = ref(null)
  const weatherData = ref(null)
  const tidalData = ref(null)
  const solunarData = ref(null)
  const fishingScore = ref(0)

  // Striped Bass Success Score Algorithm
  const calculateStripedBassScore = (weather, tides, solunar, location) => {
    let score = 0
    const factors = []

    // Water Temperature Factor (30% of score)
    const waterTemp = weather?.marine?.waterTemperature || 60
    const optimalRange = location?.optimalTemp || [55, 70]
    let tempScore = 0
    
    if (waterTemp >= optimalRange[0] && waterTemp <= optimalRange[1]) {
      tempScore = 100
    } else if (waterTemp >= optimalRange[0] - 5 && waterTemp <= optimalRange[1] + 5) {
      const distance = Math.min(
        Math.abs(waterTemp - optimalRange[0]),
        Math.abs(waterTemp - optimalRange[1])
      )
      tempScore = Math.max(0, 100 - (distance * 10))
    }
    
    score += tempScore * 0.3
    factors.push({ name: 'Water Temperature', score: tempScore, weight: 30 })

    // Tidal Movement Factor (25% of score)
    const tidalStrength = tides?.currentStrength || 0
    let tidalScore = 0
    
    if (tidalStrength > 0.5 && tidalStrength < 2.5) {
      tidalScore = 100
    } else if (tidalStrength > 0.2 && tidalStrength < 3.0) {
      tidalScore = 75
    } else if (tidalStrength > 0) {
      tidalScore = 50
    }
    
    score += tidalScore * 0.25
    factors.push({ name: 'Tidal Movement', score: tidalScore, weight: 25 })

    // Solunar Activity Factor (20% of score)
    const solunarActivity = solunar?.activityLevel || 50
    score += solunarActivity * 0.2
    factors.push({ name: 'Solunar Activity', score: solunarActivity, weight: 20 })

    // Barometric Pressure Factor (15% of score)
    const pressure = weather?.pressure || 1013
    let pressureScore = 0
    
    if (pressure > 1020 || pressure < 1000) {
      pressureScore = 30 // Extreme pressure
    } else if (pressure > 1015 || pressure < 1005) {
      pressureScore = 60 // Moderate pressure
    } else {
      pressureScore = 100 // Optimal pressure
    }
    
    // Pressure trend bonus
    const pressureTrend = weather?.pressureTrend || 'steady'
    if (pressureTrend.includes('rising') && pressure < 1020) {
      pressureScore = Math.min(100, pressureScore + 20)
    }
    
    score += pressureScore * 0.15
    factors.push({ name: 'Barometric Pressure', score: pressureScore, weight: 15 })

    // Wind Conditions Factor (10% of score)
    const windSpeed = weather?.windSpeed || 0
    let windScore = 0
    
    if (windSpeed < 5) {
      windScore = 90 // Light winds
    } else if (windSpeed < 15) {
      windScore = 100 // Ideal winds
    } else if (windSpeed < 25) {
      windScore = 70 // Moderate winds
    } else {
      windScore = 30 // High winds
    }
    
    score += windScore * 0.1
    factors.push({ name: 'Wind Conditions', score: windScore, weight: 10 })

    return {
      overall: Math.round(score),
      factors,
      recommendation: getRecommendation(score),
      confidence: calculateConfidence(factors)
    }
  }

  const getRecommendation = (score) => {
    if (score >= 85) return { level: 'Excellent', color: 'green', text: 'Prime time for Striped Bass!' }
    if (score >= 70) return { level: 'Good', color: 'blue', text: 'Great conditions for fishing' }
    if (score >= 55) return { level: 'Fair', color: 'yellow', text: 'Decent fishing possible' }
    if (score >= 40) return { level: 'Poor', color: 'orange', text: 'Challenging conditions' }
    return { level: 'Very Poor', color: 'red', text: 'Consider postponing' }
  }

  const calculateConfidence = (factors) => {
    const dataQuality = factors.length >= 5 ? 100 : (factors.length / 5) * 100
    const scoreVariance = Math.abs(factors.reduce((acc, f) => acc + f.score, 0) / factors.length - 70)
    return Math.max(60, Math.min(100, dataQuality - scoreVariance * 0.5))
  }

  // Fetch comprehensive data for a location
  const fetchLocationData = async (location) => {
    isLoading.value = true
    error.value = null
    
    try {
      const [weather, tides, solunar] = await Promise.all([
        fetchWeatherData(location),
        fetchTidalData(location),
        fetchSolunarData(location)
      ])

      weatherData.value = weather
      tidalData.value = tides
      solunarData.value = solunar
      currentLocation.value = location

      // Calculate fishing score
      const scoreData = calculateStripedBassScore(weather, tides, solunar, location)
      fishingScore.value = scoreData

      return {
        weather,
        tides,
        solunar,
        score: scoreData,
        location
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Fetch NOAA weather and marine data
  const fetchWeatherData = async (location) => {
    const { lat, lng } = location
    
    try {
      // Get NOAA grid point
      const gridResponse = await axios.get(`https://api.weather.gov/points/${lat},${lng}`)
      const gridData = gridResponse.data
      
      // Get forecast
      const forecastResponse = await axios.get(gridData.properties.forecast)
      const forecast = forecastResponse.data
      
      // Get marine forecast if available
      let marineData = null
      try {
        const marineResponse = await axios.get(`https://marine-api.open-meteo.com/v1/marine`, {
          params: {
            latitude: lat,
            longitude: lng,
            hourly: 'wave_height,wave_direction,wave_period,ocean_current_velocity,ocean_current_direction,sea_surface_temperature',
            timezone: 'auto',
            forecast_days: 7
          }
        })
        marineData = marineResponse.data
      } catch (marineError) {
        console.warn('Marine data not available:', marineError.message)
      }

      return {
        forecast: forecast.properties.periods,
        marine: marineData,
        location: gridData.properties,
        waterTemperature: marineData?.hourly?.sea_surface_temperature?.[0] || null,
        waveHeight: marineData?.hourly?.wave_height?.[0] || null,
        currentVelocity: marineData?.hourly?.ocean_current_velocity?.[0] || null,
        pressure: 1013, // Default, would need additional API
        pressureTrend: 'steady',
        windSpeed: 10, // Would extract from forecast
        windDirection: 180
      }
    } catch (error) {
      console.error('Weather data fetch error:', error)
      throw new Error('Failed to fetch weather data')
    }
  }

  // Fetch NOAA tidal data
  const fetchTidalData = async (location) => {
    const { lat, lng } = location
    const today = new Date()
    const dateStr = format(today, 'yyyyMMdd')
    
    try {
      // Find nearest tidal station (simplified - would need station lookup)
      const response = await axios.get('https://api.tidesandcurrents.noaa.gov/api/prod/datagetter', {
        params: {
          begin_date: dateStr,
          end_date: format(addDays(today, 1), 'yyyyMMdd'),
          station: '8447930', // Boston - would need to find nearest
          product: 'predictions',
          datum: 'MLLW',
          units: 'english',
          time_zone: 'lst_ldt',
          format: 'json'
        }
      })

      const tideData = response.data.predictions || []
      
      return {
        predictions: tideData,
        currentStrength: calculateTidalStrength(tideData),
        nextHigh: findNextTide(tideData, 'H'),
        nextLow: findNextTide(tideData, 'L'),
        range: calculateTidalRange(tideData)
      }
    } catch (error) {
      console.error('Tidal data fetch error:', error)
      // Return mock data for demo
      return {
        predictions: generateMockTidalData(),
        currentStrength: Math.random() * 2,
        nextHigh: new Date(Date.now() + 3 * 60 * 60 * 1000),
        nextLow: new Date(Date.now() + 9 * 60 * 60 * 1000),
        range: 6.2
      }
    }
  }

  // Fetch/calculate solunar data
  const fetchSolunarData = async (location) => {
    const { lat, lng } = location
    const today = new Date()
    
    try {
      // Calculate sun and moon data
      const sunData = SunCalc.getTimes(today, lat, lng)
      const moonData = SunCalc.getMoonTimes(today, lat, lng)
      const moonPhase = SunCalc.getMoonIllumination(today)
      
      // Calculate solunar periods
      const majorPeriods = [
        { start: moonData.rise, end: new Date(moonData.rise.getTime() + 2 * 60 * 60 * 1000) },
        { start: moonData.set, end: new Date(moonData.set.getTime() + 2 * 60 * 60 * 1000) }
      ]
      
      const minorPeriods = [
        { start: sunData.sunrise, end: new Date(sunData.sunrise.getTime() + 60 * 60 * 1000) },
        { start: sunData.sunset, end: new Date(sunData.sunset.getTime() + 60 * 60 * 1000) }
      ]
      
      // Calculate activity level based on moon phase and time
      const activityLevel = calculateSolunarActivity(moonPhase, majorPeriods, minorPeriods)
      
      return {
        sun: sunData,
        moon: moonData,
        moonPhase,
        majorPeriods,
        minorPeriods,
        activityLevel,
        rating: getSolunarRating(activityLevel)
      }
    } catch (error) {
      console.error('Solunar data calculation error:', error)
      return {
        activityLevel: 50,
        rating: 'Average',
        majorPeriods: [],
        minorPeriods: []
      }
    }
  }

  // Helper functions
  const calculateTidalStrength = (tideData) => {
    if (!tideData || tideData.length < 2) return 0
    const current = new Date()
    const relevant = tideData.filter(t => new Date(t.t) > current).slice(0, 2)
    if (relevant.length < 2) return 0
    
    const heightDiff = Math.abs(parseFloat(relevant[1].v) - parseFloat(relevant[0].v))
    const timeDiff = (new Date(relevant[1].t) - new Date(relevant[0].t)) / (1000 * 60 * 60)
    return heightDiff / timeDiff
  }

  const findNextTide = (tideData, type) => {
    const current = new Date()
    const next = tideData.find(t => new Date(t.t) > current && t.type === type)
    return next ? new Date(next.t) : null
  }

  const calculateTidalRange = (tideData) => {
    if (!tideData || tideData.length === 0) return 0
    const heights = tideData.map(t => parseFloat(t.v))
    return Math.max(...heights) - Math.min(...heights)
  }

  const calculateSolunarActivity = (moonPhase, majorPeriods, minorPeriods) => {
    const now = new Date()
    let activity = 50 // Base activity
    
    // Moon phase influence
    activity += (moonPhase.fraction * 30) - 15
    
    // Check if we're in a solunar period
    const inMajorPeriod = majorPeriods.some(p => now >= p.start && now <= p.end)
    const inMinorPeriod = minorPeriods.some(p => now >= p.start && now <= p.end)
    
    if (inMajorPeriod) activity += 30
    if (inMinorPeriod) activity += 15
    
    return Math.max(0, Math.min(100, activity))
  }

  const getSolunarRating = (activityLevel) => {
    if (activityLevel >= 80) return 'Excellent'
    if (activityLevel >= 65) return 'Good'
    if (activityLevel >= 45) return 'Average'
    if (activityLevel >= 30) return 'Poor'
    return 'Very Poor'
  }

  const generateMockTidalData = () => {
    const data = []
    const now = new Date()
    for (let i = 0; i < 48; i++) {
      const time = new Date(now.getTime() + i * 30 * 60 * 1000)
      const height = 3 + 3 * Math.sin((i * Math.PI) / 12)
      data.push({
        t: time.toISOString(),
        v: height.toFixed(2),
        type: height > 5 ? 'H' : height < 1 ? 'L' : ''
      })
    }
    return data
  }

  // Generate forecast matrix for multiple days and locations
  const generateFishingMatrix = async (locations = STRIPED_BASS_LOCATIONS, days = 7) => {
    const matrix = []
    const startDate = new Date()
    
    for (let day = 0; day < days; day++) {
      const date = addDays(startDate, day)
      const dayData = {
        date,
        locations: []
      }
      
      for (const location of locations) {
        try {
          const data = await fetchLocationData(location)
          dayData.locations.push({
            ...location,
            score: data.score.overall,
            conditions: data.score.recommendation,
            confidence: data.score.confidence
          })
        } catch (error) {
          // Add mock data for demo
          dayData.locations.push({
            ...location,
            score: Math.floor(Math.random() * 40) + 30,
            conditions: { level: 'Unknown', color: 'gray', text: 'Data unavailable' },
            confidence: 60
          })
        }
      }
      
      matrix.push(dayData)
    }
    
    return matrix
  }

  return {
    // State
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    currentLocation: computed(() => currentLocation.value),
    weatherData: computed(() => weatherData.value),
    tidalData: computed(() => tidalData.value),
    solunarData: computed(() => solunarData.value),
    fishingScore: computed(() => fishingScore.value),
    
    // Data
    locations: STRIPED_BASS_LOCATIONS,
    
    // Methods
    fetchLocationData,
    generateFishingMatrix,
    calculateStripedBassScore,
    
    // Computed
    currentScore: computed(() => fishingScore.value?.overall || 0),
    currentRecommendation: computed(() => fishingScore.value?.recommendation || null),
    isDataReady: computed(() => !isLoading.value && !error.value && currentLocation.value)
  }
}