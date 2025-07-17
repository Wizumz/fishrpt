export default defineEventHandler(async (event) => {
  const { query } = await readBody(event)
  
  if (!query) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Location query is required'
    })
  }

  try {
    // Use free geocoding service (we'll use a simple approach here)
    // In production, you might want to use a more robust service
    const response = await $fetch(`https://api.weather.gov/points/${encodeURIComponent(query)}`)
    
    if (response && response.geometry) {
      const [lon, lat] = response.geometry.coordinates
      return {
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        name: response.properties?.relativeLocation?.properties?.city || query
      }
    }
  } catch (error) {
    // Fallback: try to parse if it's coordinates
    const coordMatch = query.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/)
    if (coordMatch) {
      return {
        lat: parseFloat(coordMatch[1]),
        lon: parseFloat(coordMatch[2]),
        name: `${coordMatch[1]}, ${coordMatch[2]}`
      }
    }
    
    // If it's a known location from our popular list, return that
    const popularLocations = [
      { name: 'San Francisco Bay, CA', lat: 37.7749, lon: -122.4194 },
      { name: 'Key West, FL', lat: 24.5551, lon: -81.7800 },
      { name: 'Cape Cod, MA', lat: 41.6688, lon: -70.2962 },
      { name: 'Monterey Bay, CA', lat: 36.6002, lon: -121.8947 },
      { name: 'Outer Banks, NC', lat: 35.5582, lon: -75.4665 },
      { name: 'Long Island Sound, NY', lat: 41.1622, lon: -72.9279 },
      { name: 'Tampa Bay, FL', lat: 27.7663, lon: -82.6404 },
      { name: 'Chesapeake Bay, MD', lat: 38.3, lon: -76.5 }
    ]
    
    const foundLocation = popularLocations.find(loc => 
      loc.name.toLowerCase().includes(query.toLowerCase()) ||
      query.toLowerCase().includes(loc.name.toLowerCase().split(',')[0])
    )
    
    if (foundLocation) {
      return foundLocation
    }
  }
  
  throw createError({
    statusCode: 404,
    statusMessage: 'Location not found'
  })
})