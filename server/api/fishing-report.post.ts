import { OpenAI } from 'openai'

export default defineEventHandler(async (event) => {
  const { lat, lon, location } = await readBody(event)
  const config = useRuntimeConfig()
  
  if (!lat || !lon) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Latitude and longitude are required'
    })
  }

  try {
    // Fetch data from multiple APIs in parallel
    const [
      weatherData,
      marineData,
      tidesData,
      solunarData
    ] = await Promise.allSettled([
      fetchWeatherData(lat, lon),
      fetchMarineData(lat, lon),
      fetchTidesData(lat, lon),
      fetchSolunarData(lat, lon)
    ])

    // Process the data
    const processedData = {
      location: location || `${lat}, ${lon}`,
      timestamp: new Date().toISOString(),
      fishingScore: 0,
      waterTemp: 0,
      windSpeed: 0,
      windDirection: 0,
      waveHeight: 0,
      waveDirection: 0,
      moonPhase: '',
      tides: [],
      solunar: {
        majorTimes: [],
        minorTimes: [],
        moonPhase: '',
        moonIllumination: 0
      },
      weather: {
        current: {},
        forecast: []
      },
      aiInsights: ''
    }

    // Process weather data
    if (weatherData.status === 'fulfilled') {
      const weather = weatherData.value
      processedData.weather.current = weather.current || {}
      processedData.weather.forecast = weather.hourly?.slice(0, 168) || [] // 7 days
    }

    // Process marine data
    if (marineData.status === 'fulfilled') {
      const marine = marineData.value
      processedData.waterTemp = marine.hourly?.sea_surface_temperature?.[0] || 0
      processedData.windSpeed = marine.hourly?.wind_speed_10m?.[0] || 0
      processedData.windDirection = marine.hourly?.wind_direction_10m?.[0] || 0
      processedData.waveHeight = marine.hourly?.wave_height?.[0] || 0
      processedData.waveDirection = marine.hourly?.wave_direction?.[0] || 0
    }

    // Process tides data
    if (tidesData.status === 'fulfilled') {
      processedData.tides = tidesData.value || []
    }

    // Process solunar data
    if (solunarData.status === 'fulfilled') {
      const solunar = solunarData.value
      processedData.solunar = {
        majorTimes: solunar.major || [],
        minorTimes: solunar.minor || [],
        moonPhase: solunar.moonPhase || '',
        moonIllumination: solunar.moonIllumination || 0
      }
      processedData.moonPhase = solunar.moonPhase || ''
    }

    // Calculate fishing score
    processedData.fishingScore = calculateFishingScore(processedData)

    // Generate AI insights
    if (config.openaiApiKey) {
      processedData.aiInsights = await generateAIInsights(processedData, config.openaiApiKey)
    } else {
      processedData.aiInsights = generateBasicInsights(processedData)
    }

    return processedData

  } catch (error) {
    console.error('Fishing report error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to generate fishing report'
    })
  }
})

// Fetch weather data from Open-Meteo
async function fetchWeatherData(lat: number, lon: number) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,wind_speed_10m,wind_direction_10m&forecast_days=7`
  
  try {
    return await $fetch(url)
  } catch (error) {
    console.error('Weather API error:', error)
    return null
  }
}

// Fetch marine data from Open-Meteo Marine API
async function fetchMarineData(lat: number, lon: number) {
  const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lon}&hourly=wave_height,wave_direction,wave_period,sea_surface_temperature&forecast_days=7`
  
  try {
    return await $fetch(url)
  } catch (error) {
    console.error('Marine API error:', error)
    return null
  }
}

// Fetch tides data from NOAA
async function fetchTidesData(lat: number, lon: number) {
  try {
    // Find nearest NOAA station
    const stationsUrl = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=FishingReportPro&begin_date=${getDateString(0)}&end_date=${getDateString(7)}&datum=MLLW&station=9414290&time_zone=lst_ldt&units=english&interval=hilo&format=json`
    
    const response = await $fetch(stationsUrl)
    return response.predictions || []
  } catch (error) {
    console.error('Tides API error:', error)
    return []
  }
}

// Fetch solunar data
async function fetchSolunarData(lat: number, lon: number) {
  try {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const timezone = Math.round(lon / 15) // Simple timezone approximation
    const url = `https://api.solunar.org/solunar/${lat},${lon},${dateStr},${timezone}`
    
    return await $fetch(url)
  } catch (error) {
    console.error('Solunar API error:', error)
    return {
      major: [],
      minor: [],
      moonPhase: 'Unknown',
      moonIllumination: 50
    }
  }
}

// Calculate fishing score based on various factors
function calculateFishingScore(data: any): number {
  let score = 50 // Base score

  // Wind conditions (optimal 5-15 mph)
  const windSpeed = data.windSpeed || 0
  if (windSpeed >= 5 && windSpeed <= 15) score += 20
  else if (windSpeed <= 25) score += 10
  else score -= 10

  // Wave conditions (optimal 1-3 ft)
  const waveHeight = data.waveHeight || 0
  if (waveHeight >= 1 && waveHeight <= 3) score += 15
  else if (waveHeight <= 5) score += 5
  else score -= 5

  // Moon phase (new and full moon are best)
  const moonPhase = data.moonPhase?.toLowerCase() || ''
  if (moonPhase.includes('new') || moonPhase.includes('full')) score += 15
  else if (moonPhase.includes('quarter')) score += 5

  // Water temperature (species dependent, but generally 55-75F is good)
  const waterTemp = data.waterTemp || 0
  if (waterTemp >= 55 && waterTemp <= 75) score += 10
  else if (waterTemp >= 45 && waterTemp <= 85) score += 5

  return Math.max(0, Math.min(100, score))
}

// Generate AI insights using OpenAI
async function generateAIInsights(data: any, apiKey: string): Promise<string> {
  try {
    const openai = new OpenAI({ apiKey })
    
    const prompt = `Based on the following fishing conditions, provide a detailed fishing report with recommendations:

Location: ${data.location}
Water Temperature: ${data.waterTemp}°F
Wind: ${data.windSpeed} mph from ${data.windDirection}°
Wave Height: ${data.waveHeight} ft
Moon Phase: ${data.moonPhase}
Fishing Score: ${data.fishingScore}/100

Provide insights about:
1. Best fishing times today
2. Recommended fishing techniques
3. Species likely to be active
4. Safety considerations
5. Overall conditions assessment

Keep the response concise but informative, around 150-200 words.`

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
      temperature: 0.7,
    })

    return completion.choices[0]?.message?.content || generateBasicInsights(data)
  } catch (error) {
    console.error('OpenAI API error:', error)
    return generateBasicInsights(data)
  }
}

// Generate basic insights without AI
function generateBasicInsights(data: any): string {
  const score = data.fishingScore
  const windSpeed = data.windSpeed || 0
  const waveHeight = data.waveHeight || 0
  
  let insights = `Current fishing conditions for ${data.location}: `
  
  if (score >= 80) {
    insights += "Excellent fishing conditions expected! "
  } else if (score >= 60) {
    insights += "Good fishing conditions with some favorable factors. "
  } else if (score >= 40) {
    insights += "Fair fishing conditions with mixed factors. "
  } else {
    insights += "Challenging fishing conditions, but fish can still be caught. "
  }

  if (windSpeed <= 10) {
    insights += "Calm winds make for comfortable fishing. "
  } else if (windSpeed <= 20) {
    insights += "Moderate winds may affect casting but can stimulate fish activity. "
  } else {
    insights += "Strong winds may make fishing difficult - consider sheltered areas. "
  }

  if (waveHeight <= 2) {
    insights += "Small waves provide good conditions for most fishing techniques. "
  } else if (waveHeight <= 4) {
    insights += "Moderate waves - good for surf fishing but challenging for small boats. "
  } else {
    insights += "Large waves - consider fishing from shore or wait for calmer conditions. "
  }

  insights += `Water temperature of ${data.waterTemp}°F is ${
    data.waterTemp >= 55 && data.waterTemp <= 75 ? 'ideal' : 'acceptable'
  } for most fish species.`

  return insights
}

// Helper function to get date string
function getDateString(daysFromNow: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysFromNow)
  return date.toISOString().slice(0, 10).replace(/-/g, '')
}