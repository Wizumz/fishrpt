// Marine Weather Data Types

export interface MarineLocation {
  id: string
  name: string
  description: string
  anzCode: string // ANZ335, etc.
  coordinates: {
    lat: number
    lng: number
  }
  region: 'east_coast' | 'west_coast' | 'gulf' | 'great_lakes'
  stationId?: string // NOAA CO-OPS station ID if available
  forecastUrl: string
}

export interface ForecastData {
  raw: string
  issueTime: string
  validTime: string
  synopsis: string
  conditions: {
    winds: string
    seas: string
    weather: string
    visibility: string
  }
  outlook: string[]
  summary?: string // AI-generated summary
  lastUpdated: string
  zoneInfo?: any // NOAA zone API information
  location?: MarineLocation // Enhanced location data
}

export interface TidalPrediction {
  time: string
  height: number // in feet
  type: 'H' | 'L' // High or Low
}

export interface TidalExtreme {
  time: string
  height: number
  type: 'H' | 'L'
}

export interface TidalData {
  stationId: string
  stationName: string
  today: TidalPrediction[]
  tomorrow: TidalPrediction[]
  dayAfter: TidalPrediction[]
  extremes: {
    highTide: TidalExtreme[]
    lowTide: TidalExtreme[]
  }
}

export interface SwellConditions {
  waveHeight: number // in feet
  dominantWavePeriod: number // in seconds
  averageWavePeriod: number // in seconds
  meanWaveDirection: number // in degrees
  windWaveHeight: number // in feet
  windWavePeriod: number // in seconds
  windWaveDirection: number // in degrees
  swellHeight: number // in feet
  swellPeriod: number // in seconds
  swellDirection: number // in degrees
  timestamp: string
}

export interface SwellForecast {
  time: string
  waveHeight: number
  wavePeriod: number
  waveDirection: number
  windSpeed: number
  windDirection: number
}

export interface SwellData {
  buoyId?: string
  location: string
  current: SwellConditions
  forecast: SwellForecast[]
  lastUpdate: string
}

// NOAA CO-OPS API Response Types
export interface NoaaCoOpsResponse {
  metadata: {
    id: string
    name: string
    lat: string
    lon: string
  }
  data: Array<{
    t: string // time
    v: string // value
    s?: string // sigma (standard deviation)
    f?: string // flags
    q?: string // quality
  }>
}

// AI Summary Response
export interface AiSummaryResponse {
  summary: string
  provider: string
  timestamp: string
}

// NOAA Zone API Response Types
export interface NoaaZoneResponse {
  '@context': any
  id: string
  type: string
  geometry: {
    type: string
    coordinates: number[][][]
  }
  properties: {
    '@id': string
    '@type': string
    id: string
    type: string
    name: string
    effectiveDate: string
    expirationDate: string
    state: string | null
    forecastOffice: string
    gridIdentifier: string
    awipsLocationIdentifier: string
    cwa: string[]
    forecastOffices: string[]
    timeZone: string[]
    observationStations: string[]
    radarStation: string | null
  }
}