import type { MarineLocation } from '~/types/marine'

export const useMarineLocations = () => {
  const config = useRuntimeConfig()
  const locations = ref<MarineLocation[]>([])
  const popularLocations = ref<MarineLocation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Enhanced East Coast locations with NOAA API integration
  const eastCoastLocations: MarineLocation[] = [
    {
      id: 'anz335',
      name: 'Long Island Sound West of New Haven CT/Port Jefferson NY',
      description: 'Long Island Sound West of New Haven CT/Port Jefferson NY',
      anzCode: 'ANZ335',
      coordinates: { lat: 40.975, lng: -73.342 },
      region: 'east_coast',
      stationId: '8461490', // New London
      forecastUrl: 'https://tgftp.nws.noaa.gov/data/forecasts/zone/an/anz335.txt'
    },
    {
      id: 'anz330',
      name: 'Long Island Sound East of New Haven CT/Port Jefferson NY',
      description: 'Long Island Sound East of New Haven CT/Port Jefferson NY',
      anzCode: 'ANZ330',
      coordinates: { lat: 41.321, lng: -72.342 },
      region: 'east_coast',
      stationId: '8461490', // New London
      forecastUrl: 'https://tgftp.nws.noaa.gov/data/forecasts/zone/an/anz330.txt'
    },
    {
      id: 'anz345',
      name: 'New York Harbor',
      description: 'New York Harbor',
      anzCode: 'ANZ345',
      coordinates: { lat: 40.668, lng: -74.045 },
      region: 'east_coast',
      stationId: '8518750', // The Battery
      forecastUrl: 'https://tgftp.nws.noaa.gov/data/forecasts/zone/an/anz345.txt'
    },
    {
      id: 'anz350',
      name: 'Moriches Inlet NY to Montauk Point NY out 20 nm',
      description: 'Moriches Inlet NY to Montauk Point NY out 20 nm',
      anzCode: 'ANZ350',
      coordinates: { lat: 40.789, lng: -72.019 },
      region: 'east_coast',
      stationId: '8510560', // Montauk
      forecastUrl: 'https://tgftp.nws.noaa.gov/data/forecasts/zone/an/anz350.txt'
    },
    {
      id: 'anz355',
      name: 'Fire Island Inlet NY to Moriches Inlet NY out 20 nm',
      description: 'Fire Island Inlet NY to Moriches Inlet NY out 20 nm',
      anzCode: 'ANZ355',
      coordinates: { lat: 40.728, lng: -73.270 },
      region: 'east_coast',
      stationId: '8516945', // Kings Point
      forecastUrl: 'https://tgftp.nws.noaa.gov/data/forecasts/zone/an/anz355.txt'
    },
    {
      id: 'anz338',
      name: 'Connecticut Waters',
      description: 'Connecticut Waters',
      anzCode: 'ANZ338',
      coordinates: { lat: 41.311, lng: -72.342 },
      region: 'east_coast',
      stationId: '8461490', // New London
      forecastUrl: 'https://tgftp.nws.noaa.gov/data/forecasts/zone/an/anz338.txt'
    },
    {
      id: 'anz232',
      name: 'Chesapeake Bay North of Pooles Island MD',
      description: 'Chesapeake Bay North of Pooles Island MD',
      anzCode: 'ANZ232',
      coordinates: { lat: 39.553, lng: -76.259 },
      region: 'east_coast',
      stationId: '8573364', // Tolchester Beach
      forecastUrl: 'https://tgftp.nws.noaa.gov/data/forecasts/zone/an/anz232.txt'
    },
    {
      id: 'anz250',
      name: 'Chesapeake Bay from Little Creek VA to Cape Henry VA',
      description: 'Chesapeake Bay from Little Creek VA to Cape Henry VA',
      anzCode: 'ANZ250',
      coordinates: { lat: 36.933, lng: -76.042 },
      region: 'east_coast',
      stationId: '8638610', // Sewells Point
      forecastUrl: 'https://tgftp.nws.noaa.gov/data/forecasts/zone/an/anz250.txt'
    },
    {
      id: 'anz452',
      name: 'Coastal Waters from Cape Henlopen DE to Fenwick Island DE out 20 nm',
      description: 'Coastal Waters from Cape Henlopen DE to Fenwick Island DE out 20 nm',
      anzCode: 'ANZ452',
      coordinates: { lat: 38.612, lng: -75.042 },
      region: 'east_coast',
      stationId: '8557380', // Lewes
      forecastUrl: 'https://tgftp.nws.noaa.gov/data/forecasts/zone/an/anz452.txt'
    },
    {
      id: 'anz630',
      name: 'Coastal Waters from Cape Fear NC to Little River Inlet SC out 20 nm',
      description: 'Coastal Waters from Cape Fear NC to Little River Inlet SC out 20 nm',
      anzCode: 'ANZ630',
      coordinates: { lat: 33.912, lng: -78.342 },
      region: 'east_coast',
      stationId: '8658120', // Wrightsville Beach
      forecastUrl: 'https://tgftp.nws.noaa.gov/data/forecasts/zone/an/anz630.txt'
    }
  ]

  const initializeLocations = () => {
    loading.value = true
    try {
      locations.value = eastCoastLocations
      popularLocations.value = [
        eastCoastLocations.find(l => l.id === 'anz335')!,
        eastCoastLocations.find(l => l.id === 'anz345')!,
        eastCoastLocations.find(l => l.id === 'anz350')!,
        eastCoastLocations.find(l => l.id === 'anz232')!,
        eastCoastLocations.find(l => l.id === 'anz452')!
      ].filter(Boolean)
    } catch (err) {
      error.value = 'Failed to load marine locations'
      console.error('Error loading marine locations:', err)
    } finally {
      loading.value = false
    }
  }

  // Fetch enhanced zone information from NOAA API
  const fetchZoneInformation = async (anzCode: string): Promise<any> => {
    try {
      const response = await $fetch(`${config.public.noaaApiUrl}/zones/forecast/${anzCode}`)
      return response
    } catch (err) {
      console.warn(`Failed to fetch zone information for ${anzCode}:`, err)
      return null
    }
  }

  // Enhance location with NOAA API data
  const enhanceLocationWithApi = async (location: MarineLocation): Promise<MarineLocation> => {
    const zoneInfo = await fetchZoneInformation(location.anzCode)
    
    if (zoneInfo?.properties) {
      return {
        ...location,
        name: zoneInfo.properties.name || location.name,
        description: zoneInfo.properties.name || location.description,
        coordinates: zoneInfo.geometry?.coordinates?.[0]?.[0] ? {
          lat: zoneInfo.geometry.coordinates[0][0][1],
          lng: zoneInfo.geometry.coordinates[0][0][0]
        } : location.coordinates
      }
    }
    
    return location
  }

  // Enhanced initialization with API data
  const initializeWithApiData = async () => {
    loading.value = true
    error.value = null
    
    try {
      const enhancedLocations = await Promise.all(
        eastCoastLocations.map(location => enhanceLocationWithApi(location))
      )
      
      locations.value = enhancedLocations
      popularLocations.value = [
        enhancedLocations.find(l => l.id === 'anz335'),
        enhancedLocations.find(l => l.id === 'anz345'),
        enhancedLocations.find(l => l.id === 'anz350'),
        enhancedLocations.find(l => l.id === 'anz232'),
        enhancedLocations.find(l => l.id === 'anz452')
      ].filter(Boolean) as MarineLocation[]
    } catch (err) {
      console.error('Error fetching enhanced location data:', err)
      // Fallback to basic initialization
      initializeLocations()
    } finally {
      loading.value = false
    }
  }

  const findLocationById = (id: string): MarineLocation | undefined => {
    return locations.value.find(location => location.id === id)
  }

  const findLocationByAnzCode = (anzCode: string): MarineLocation | undefined => {
    return locations.value.find(location => location.anzCode === anzCode)
  }

  const searchLocations = (searchTerm: string): MarineLocation[] => {
    if (!searchTerm.trim()) return locations.value
    
    const term = searchTerm.toLowerCase()
    return locations.value.filter(location => 
      location.name.toLowerCase().includes(term) ||
      location.description.toLowerCase().includes(term) ||
      location.anzCode.toLowerCase().includes(term)
    )
  }

  const filterByRegion = (region: string): MarineLocation[] => {
    if (region === 'all') return locations.value
    return locations.value.filter(location => location.region === region)
  }

  // Initialize on first use
  onMounted(() => {
    initializeWithApiData()
  })

  return {
    locations: readonly(locations),
    popularLocations: readonly(popularLocations),
    loading: readonly(loading),
    error: readonly(error),
    initializeLocations,
    initializeWithApiData,
    fetchZoneInformation,
    enhanceLocationWithApi,
    findLocationById,
    findLocationByAnzCode,
    searchLocations,
    filterByRegion
  }
}