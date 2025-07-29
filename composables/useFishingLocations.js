import { ref, computed } from 'vue'

// Comprehensive fishing locations database from TidesPro
const FISHING_LOCATIONS = {
  "northeast": {
    name: "Northeast",
    description: "From Maine to New Jersey",
    locations: [
      // Maine
      { id: 'portland-maine', name: 'Portland, Maine', lat: 43.6591, lng: -70.2568, state: 'ME', type: 'Harbor', description: 'Major harbor with excellent striped bass fishing' },
      { id: 'casco-bay', name: 'Casco Bay, Maine', lat: 43.7310, lng: -70.1010, state: 'ME', type: 'Bay', description: 'Large bay system known for striped bass' },
      { id: 'wells-harbor', name: 'Wells Harbor, Maine', lat: 43.3220, lng: -70.5810, state: 'ME', type: 'Harbor', description: 'Popular fishing harbor' },
      
      // New Hampshire
      { id: 'portsmouth-harbor', name: 'Portsmouth Harbor, NH', lat: 43.0718, lng: -70.7626, state: 'NH', type: 'Harbor', description: 'Historic harbor with great fishing' },
      { id: 'great-bay', name: 'Great Bay, NH', lat: 43.1067, lng: -70.8733, state: 'NH', type: 'Bay', description: 'Estuary system excellent for striped bass' },
      
      // Massachusetts
      { id: 'cape-cod-canal', name: 'Cape Cod Canal, MA', lat: 41.7614, lng: -70.5222, state: 'MA', type: 'Canal', description: 'Famous striped bass migration corridor' },
      { id: 'plymouth-harbor', name: 'Plymouth Harbor, MA', lat: 42.0001, lng: -70.6678, state: 'MA', type: 'Harbor', description: 'Historic harbor with excellent fishing' },
      { id: 'boston-harbor', name: 'Boston Harbor, MA', lat: 42.3554, lng: -71.0210, state: 'MA', type: 'Harbor', description: 'Urban fishing opportunities' },
      { id: 'gloucester', name: 'Gloucester, MA', lat: 42.6259, lng: -70.6731, state: 'MA', type: 'Harbor', description: 'Working fishing port' },
      { id: 'chatham', name: 'Chatham, MA', lat: 41.6821, lng: -69.9597, state: 'MA', type: 'Harbor', description: 'Cape Cod fishing hotspot' },
      { id: 'buzzards-bay', name: 'Buzzards Bay, MA', lat: 41.5389, lng: -70.7947, state: 'MA', type: 'Bay', description: 'Large bay system' },
      
      // Rhode Island
      { id: 'narragansett-bay', name: 'Narragansett Bay, RI', lat: 41.5389, lng: -71.4000, state: 'RI', type: 'Bay', description: 'Premier striped bass fishing destination' },
      { id: 'newport', name: 'Newport, RI', lat: 41.4901, lng: -71.3128, state: 'RI', type: 'Harbor', description: 'Famous harbor and fishing area' },
      { id: 'block-island', name: 'Block Island, RI', lat: 41.1681, lng: -71.5811, state: 'RI', type: 'Island', description: 'Offshore fishing paradise' },
      { id: 'point-judith', name: 'Point Judith, RI', lat: 41.3584, lng: -71.4834, state: 'RI', type: 'Point', description: 'Popular fishing point' },
      
      // Connecticut
      { id: 'long-island-sound-ct', name: 'Long Island Sound, CT', lat: 41.2033, lng: -72.2811, state: 'CT', type: 'Sound', description: 'Extensive fishing grounds' },
      { id: 'mystic', name: 'Mystic, CT', lat: 41.3712, lng: -71.9468, state: 'CT', type: 'Harbor', description: 'Historic seaport with fishing' },
      { id: 'thames-river', name: 'Thames River, CT', lat: 41.3556, lng: -72.0897, state: 'CT', type: 'River', description: 'River fishing opportunities' },
      { id: 'connecticut-river', name: 'Connecticut River Mouth, CT', lat: 41.2627, lng: -72.3439, state: 'CT', type: 'River', description: 'Major river system' },
      
      // New York
      { id: 'montauk-point', name: 'Montauk Point, NY', lat: 41.0718, lng: -71.8563, state: 'NY', type: 'Point', description: 'World-famous striped bass fishing' },
      { id: 'fire-island', name: 'Fire Island, NY', lat: 40.6448, lng: -73.0262, state: 'NY', type: 'Island', description: 'Barrier island fishing' },
      { id: 'jones-inlet', name: 'Jones Inlet, NY', lat: 40.5901, lng: -73.5712, state: 'NY', type: 'Inlet', description: 'Popular fishing inlet' },
      { id: 'shinnecock-inlet', name: 'Shinnecock Inlet, NY', lat: 40.8429, lng: -72.4737, state: 'NY', type: 'Inlet', description: 'Major fishing inlet' },
      { id: 'peconic-bay', name: 'Peconic Bay, NY', lat: 40.9176, lng: -72.4626, state: 'NY', type: 'Bay', description: 'Large bay system' },
      { id: 'great-south-bay', name: 'Great South Bay, NY', lat: 40.6690, lng: -73.1568, state: 'NY', type: 'Bay', description: 'Extensive bay fishing' },
      { id: 'jamaica-bay', name: 'Jamaica Bay, NY', lat: 40.6092, lng: -73.8370, state: 'NY', type: 'Bay', description: 'Urban fishing bay' },
      { id: 'hudson-river', name: 'Hudson River, NY', lat: 40.7589, lng: -73.9851, state: 'NY', type: 'River', description: 'Major river system' },
      
      // New Jersey
      { id: 'sandy-hook', name: 'Sandy Hook, NJ', lat: 40.4312, lng: -74.0473, state: 'NJ', type: 'Point', description: 'Premier surf fishing location' },
      { id: 'barnegat-inlet', name: 'Barnegat Inlet, NJ', lat: 39.7684, lng: -74.1093, state: 'NJ', type: 'Inlet', description: 'Major fishing inlet' },
      { id: 'island-beach-sp', name: 'Island Beach State Park, NJ', lat: 39.8126, lng: -74.0946, state: 'NJ', type: 'Beach', description: 'Pristine surf fishing' },
      { id: 'cape-may', name: 'Cape May, NJ', lat: 38.9351, lng: -74.9060, state: 'NJ', type: 'Point', description: 'Southern NJ fishing hotspot' },
      { id: 'delaware-bay-nj', name: 'Delaware Bay, NJ', lat: 39.1637, lng: -75.2771, state: 'NJ', type: 'Bay', description: 'Large bay system' },
      { id: 'raritan-bay', name: 'Raritan Bay, NJ', lat: 40.4584, lng: -74.2179, state: 'NJ', type: 'Bay', description: 'Productive fishing bay' },
      { id: 'highlands', name: 'Highlands, NJ', lat: 40.4051, lng: -73.9929, state: 'NJ', type: 'Harbor', description: 'Fishing town' }
    ]
  },
  "mid-atlantic": {
    name: "Mid-Atlantic",
    description: "Delaware to North Carolina",
    locations: [
      // Delaware
      { id: 'indian-river-inlet', name: 'Indian River Inlet, DE', lat: 38.6107, lng: -75.0724, state: 'DE', type: 'Inlet', description: 'Major DE fishing inlet' },
      { id: 'rehoboth-beach', name: 'Rehoboth Beach, DE', lat: 38.7193, lng: -75.0760, state: 'DE', type: 'Beach', description: 'Popular beach fishing' },
      { id: 'delaware-bay-de', name: 'Delaware Bay, DE', lat: 38.8737, lng: -75.2771, state: 'DE', type: 'Bay', description: 'Large bay system' },
      
      // Maryland
      { id: 'chesapeake-bay', name: 'Chesapeake Bay, MD', lat: 38.9784, lng: -76.4951, state: 'MD', type: 'Bay', description: 'Premier striped bass fishery' },
      { id: 'baltimore-harbor', name: 'Baltimore Harbor, MD', lat: 39.2847, lng: -76.6205, state: 'MD', type: 'Harbor', description: 'Urban harbor fishing' },
      { id: 'patapsco-river', name: 'Patapsco River, MD', lat: 39.2670, lng: -76.5358, state: 'MD', type: 'River', description: 'Chesapeake tributary' },
      { id: 'eastern-bay', name: 'Eastern Bay, MD', lat: 38.8751, lng: -76.3155, state: 'MD', type: 'Bay', description: 'Chesapeake Bay tributary' },
      { id: 'kent-island', name: 'Kent Island, MD', lat: 38.9751, lng: -76.3833, state: 'MD', type: 'Island', description: 'Bay bridge fishing' },
      { id: 'ocean-city', name: 'Ocean City, MD', lat: 38.3365, lng: -75.0849, state: 'MD', type: 'Resort', description: 'Surf and inlet fishing' },
      
      // Virginia
      { id: 'virginia-beach', name: 'Virginia Beach, VA', lat: 36.8529, lng: -75.9780, state: 'VA', type: 'Beach', description: 'Major surf fishing destination' },
      { id: 'chesapeake-bay-bridge', name: 'Bay Bridge, VA', lat: 37.0268, lng: -76.3897, state: 'VA', type: 'Bridge', description: 'Famous bridge fishing' },
      { id: 'lynnhaven-inlet', name: 'Lynnhaven Inlet, VA', lat: 36.9195, lng: -76.0804, state: 'VA', type: 'Inlet', description: 'Popular inlet fishing' },
      { id: 'rappahannock-river', name: 'Rappahannock River, VA', lat: 37.8321, lng: -76.7158, state: 'VA', type: 'River', description: 'Major Chesapeake tributary' },
      { id: 'james-river', name: 'James River, VA', lat: 37.2751, lng: -76.7158, state: 'VA', type: 'River', description: 'Historic river system' },
      
      // North Carolina
      { id: 'outer-banks', name: 'Outer Banks, NC', lat: 35.5582, lng: -75.4665, state: 'NC', type: 'Banks', description: 'World-class fishing destination' },
      { id: 'cape-hatteras', name: 'Cape Hatteras, NC', lat: 35.2319, lng: -75.5239, state: 'NC', type: 'Cape', description: 'Legendary fishing point' },
      { id: 'oregon-inlet', name: 'Oregon Inlet, NC', lat: 35.7888, lng: -75.5569, state: 'NC', type: 'Inlet', description: 'Major fishing inlet' },
      { id: 'hatteras-inlet', name: 'Hatteras Inlet, NC', lat: 35.2034, lng: -75.7274, state: 'NC', type: 'Inlet', description: 'Remote inlet fishing' },
      { id: 'pamlico-sound', name: 'Pamlico Sound, NC', lat: 35.4532, lng: -76.0804, state: 'NC', type: 'Sound', description: 'Vast sound system' },
      { id: 'roanoke-island', name: 'Roanoke Island, NC', lat: 35.9382, lng: -75.7274, state: 'NC', type: 'Island', description: 'Historic fishing area' }
    ]
  },
  "southeast": {
    name: "Southeast",
    description: "South Carolina to Florida",
    locations: [
      // South Carolina
      { id: 'charleston-harbor', name: 'Charleston Harbor, SC', lat: 32.7765, lng: -79.9311, state: 'SC', type: 'Harbor', description: 'Historic harbor fishing' },
      { id: 'folly-beach', name: 'Folly Beach, SC', lat: 32.6552, lng: -79.9403, state: 'SC', type: 'Beach', description: 'Popular surf fishing' },
      { id: 'hilton-head', name: 'Hilton Head, SC', lat: 32.2163, lng: -80.7526, state: 'SC', type: 'Island', description: 'Resort island fishing' },
      
      // Georgia
      { id: 'savannah', name: 'Savannah, GA', lat: 32.0835, lng: -81.0998, state: 'GA', type: 'Harbor', description: 'Historic port city' },
      { id: 'jekyll-island', name: 'Jekyll Island, GA', lat: 31.0746, lng: -81.4276, state: 'GA', type: 'Island', description: 'Barrier island fishing' },
      { id: 'st-simons-island', name: 'St. Simons Island, GA', lat: 31.1546, lng: -81.3912, state: 'GA', type: 'Island', description: 'Popular fishing island' },
      
      // Florida East Coast
      { id: 'fernandina-beach', name: 'Fernandina Beach, FL', lat: 30.6691, lng: -81.4614, state: 'FL', type: 'Beach', description: 'North Florida fishing' },
      { id: 'st-augustine', name: 'St. Augustine, FL', lat: 29.9012, lng: -81.3124, state: 'FL', type: 'Harbor', description: 'Historic city fishing' },
      { id: 'daytona-beach', name: 'Daytona Beach, FL', lat: 29.2108, lng: -81.0228, state: 'FL', type: 'Beach', description: 'Popular beach fishing' },
      { id: 'cape-canaveral', name: 'Cape Canaveral, FL', lat: 28.3922, lng: -80.6077, state: 'FL', type: 'Cape', description: 'Space coast fishing' },
      { id: 'sebastian-inlet', name: 'Sebastian Inlet, FL', lat: 27.8628, lng: -80.4692, state: 'FL', type: 'Inlet', description: 'Premier inlet fishing' },
      { id: 'jupiter-inlet', name: 'Jupiter Inlet, FL', lat: 26.9342, lng: -80.0728, state: 'FL', type: 'Inlet', description: 'South Florida inlet' },
      { id: 'lake-worth-inlet', name: 'Lake Worth Inlet, FL', lat: 26.7729, lng: -80.0365, state: 'FL', type: 'Inlet', description: 'Urban inlet fishing' }
    ]
  },
  "gulf-coast": {
    name: "Gulf Coast",
    description: "Florida Gulf to Texas",
    locations: [
      // Florida Gulf Coast
      { id: 'tampa-bay', name: 'Tampa Bay, FL', lat: 27.9506, lng: -82.4572, state: 'FL', type: 'Bay', description: 'Major Gulf bay system' },
      { id: 'charlotte-harbor', name: 'Charlotte Harbor, FL', lat: 26.9342, lng: -82.0748, state: 'FL', type: 'Harbor', description: 'Large harbor system' },
      { id: 'pine-island-sound', name: 'Pine Island Sound, FL', lat: 26.5729, lng: -82.1137, state: 'FL', type: 'Sound', description: 'Shallow water fishing' },
      { id: 'everglades-city', name: 'Everglades City, FL', lat: 25.8615, lng: -81.3856, state: 'FL', type: 'City', description: 'Everglades fishing' },
      { id: 'florida-keys', name: 'Florida Keys, FL', lat: 25.0343, lng: -80.4531, state: 'FL', type: 'Keys', description: 'Tropical fishing paradise' },
      
      // Alabama
      { id: 'mobile-bay', name: 'Mobile Bay, AL', lat: 30.6954, lng: -88.0399, state: 'AL', type: 'Bay', description: 'Major Alabama bay' },
      { id: 'orange-beach', name: 'Orange Beach, AL', lat: 30.2941, lng: -87.5756, state: 'AL', type: 'Beach', description: 'Popular beach destination' },
      { id: 'gulf-shores', name: 'Gulf Shores, AL', lat: 30.2460, lng: -87.7008, state: 'AL', type: 'Beach', description: 'Gulf coast fishing' },
      
      // Mississippi
      { id: 'biloxi', name: 'Biloxi, MS', lat: 30.3960, lng: -88.8853, state: 'MS', type: 'City', description: 'Historic fishing port' },
      { id: 'pascagoula', name: 'Pascagoula, MS', lat: 30.3657, lng: -88.5561, state: 'MS', type: 'Harbor', description: 'Industrial fishing port' },
      
      // Louisiana
      { id: 'venice', name: 'Venice, LA', lat: 29.2757, lng: -89.3507, state: 'LA', type: 'City', description: 'End of the road fishing' },
      { id: 'grand-isle', name: 'Grand Isle, LA', lat: 29.2633, lng: -89.9573, state: 'LA', type: 'Island', description: 'Barrier island fishing' },
      { id: 'new-orleans', name: 'New Orleans, LA', lat: 29.9511, lng: -90.0715, state: 'LA', type: 'City', description: 'Urban fishing opportunities' },
      
      // Texas
      { id: 'galveston', name: 'Galveston, TX', lat: 29.3013, lng: -94.7977, state: 'TX', type: 'Island', description: 'Historic island fishing' },
      { id: 'port-arthur', name: 'Port Arthur, TX', lat: 29.8850, lng: -93.9400, state: 'TX', type: 'Port', description: 'Industrial fishing port' },
      { id: 'corpus-christi', name: 'Corpus Christi, TX', lat: 27.8006, lng: -97.3964, state: 'TX', type: 'City', description: 'South Texas fishing' },
      { id: 'port-isabel', name: 'Port Isabel, TX', lat: 26.0740, lng: -97.2072, state: 'TX', type: 'Port', description: 'Far south Texas fishing' }
    ]
  },
  "great-lakes": {
    name: "Great Lakes",
    description: "Freshwater fishing opportunities",
    locations: [
      // Lake Superior
      { id: 'duluth', name: 'Duluth, MN', lat: 46.7867, lng: -92.1005, state: 'MN', type: 'Harbor', description: 'Western Lake Superior' },
      { id: 'grand-portage', name: 'Grand Portage, MN', lat: 47.9627, lng: -89.6815, state: 'MN', type: 'Harbor', description: 'North shore fishing' },
      
      // Lake Michigan
      { id: 'chicago', name: 'Chicago, IL', lat: 41.8781, lng: -87.6298, state: 'IL', type: 'Harbor', description: 'Urban Great Lakes fishing' },
      { id: 'milwaukee', name: 'Milwaukee, WI', lat: 43.0389, lng: -87.9065, state: 'WI', type: 'Harbor', description: 'Wisconsin fishing' },
      { id: 'traverse-city', name: 'Traverse City, MI', lat: 44.7631, lng: -85.6206, state: 'MI', type: 'Bay', description: 'Northern Michigan fishing' },
      
      // Lake Huron
      { id: 'saginaw-bay', name: 'Saginaw Bay, MI', lat: 43.8554, lng: -83.8496, state: 'MI', type: 'Bay', description: 'Major fishing bay' },
      { id: 'mackinac-straits', name: 'Mackinac Straits, MI', lat: 45.8174, lng: -84.7278, state: 'MI', type: 'Straits', description: 'Bridge area fishing' },
      
      // Lake Erie
      { id: 'cleveland', name: 'Cleveland, OH', lat: 41.4993, lng: -81.6944, state: 'OH', type: 'Harbor', description: 'Ohio fishing' },
      { id: 'buffalo', name: 'Buffalo, NY', lat: 42.8864, lng: -78.8784, state: 'NY', type: 'Harbor', description: 'Western NY fishing' },
      { id: 'erie', name: 'Erie, PA', lat: 42.1292, lng: -80.0851, state: 'PA', type: 'Harbor', description: 'Pennsylvania fishing' },
      
      // Lake Ontario
      { id: 'rochester', name: 'Rochester, NY', lat: 43.1566, lng: -77.6088, state: 'NY', type: 'Harbor', description: 'New York fishing' },
      { id: 'oswego', name: 'Oswego, NY', lat: 43.4555, lng: -76.5105, state: 'NY', type: 'Harbor', description: 'Central NY fishing' },
      { id: 'kingston', name: 'Kingston, ON', lat: 44.2312, lng: -76.4860, state: 'ON', type: 'Harbor', description: 'Eastern Ontario fishing' }
    ]
  },
  "west-coast": {
    name: "West Coast",
    description: "Pacific fishing opportunities",
    locations: [
      // Washington
      { id: 'seattle', name: 'Seattle, WA', lat: 47.6062, lng: -122.3321, state: 'WA', type: 'Harbor', description: 'Puget Sound fishing' },
      { id: 'bellingham', name: 'Bellingham, WA', lat: 48.7519, lng: -122.4787, state: 'WA', type: 'Bay', description: 'North Puget Sound' },
      { id: 'westport', name: 'Westport, WA', lat: 46.9042, lng: -124.1057, state: 'WA', type: 'Harbor', description: 'Ocean fishing port' },
      
      // Oregon
      { id: 'astoria', name: 'Astoria, OR', lat: 46.1879, lng: -123.8313, state: 'OR', type: 'Harbor', description: 'Columbia River mouth' },
      { id: 'newport', name: 'Newport, OR', lat: 44.6265, lng: -124.0534, state: 'OR', type: 'Harbor', description: 'Central Oregon coast' },
      { id: 'coos-bay', name: 'Coos Bay, OR', lat: 43.3665, lng: -124.2179, state: 'OR', type: 'Bay', description: 'Southern Oregon fishing' },
      
      // California
      { id: 'crescent-city', name: 'Crescent City, CA', lat: 41.7558, lng: -124.2026, state: 'CA', type: 'Harbor', description: 'Northern California fishing' },
      { id: 'eureka', name: 'Eureka, CA', lat: 40.8021, lng: -124.1637, state: 'CA', type: 'Harbor', description: 'Humboldt Bay fishing' },
      { id: 'san-francisco', name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194, state: 'CA', type: 'Bay', description: 'San Francisco Bay fishing' },
      { id: 'monterey', name: 'Monterey, CA', lat: 36.6002, lng: -121.8947, state: 'CA', type: 'Bay', description: 'Central California fishing' },
      { id: 'morro-bay', name: 'Morro Bay, CA', lat: 35.3658, lng: -120.8499, state: 'CA', type: 'Bay', description: 'Central coast fishing' },
      { id: 'santa-barbara', name: 'Santa Barbara, CA', lat: 34.4208, lng: -119.6982, state: 'CA', type: 'Harbor', description: 'Southern California fishing' },
      { id: 'los-angeles', name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437, state: 'CA', type: 'Harbor', description: 'Urban fishing opportunities' },
      { id: 'san-diego', name: 'San Diego, CA', lat: 32.7157, lng: -117.1611, state: 'CA', type: 'Bay', description: 'Southern California fishing' }
    ]
  }
}

export const useFishingLocations = () => {
  const selectedRegion = ref(null)
  const selectedLocation = ref(null)

  const regions = computed(() => Object.keys(FISHING_LOCATIONS).map(key => ({
    id: key,
    ...FISHING_LOCATIONS[key]
  })))

  const locations = computed(() => {
    if (!selectedRegion.value) return []
    return FISHING_LOCATIONS[selectedRegion.value]?.locations || []
  })

  const allLocations = computed(() => {
    return Object.values(FISHING_LOCATIONS).flatMap(region => region.locations)
  })

  const getLocationById = (id) => {
    return allLocations.value.find(location => location.id === id)
  }

  const setRegion = (regionId) => {
    selectedRegion.value = regionId
    selectedLocation.value = null
  }

  const setLocation = (locationId) => {
    const location = getLocationById(locationId)
    if (location) {
      selectedLocation.value = location
      // Also set the region
      for (const [regionKey, regionData] of Object.entries(FISHING_LOCATIONS)) {
        if (regionData.locations.find(loc => loc.id === locationId)) {
          selectedRegion.value = regionKey
          break
        }
      }
    }
  }

  const searchLocations = (query) => {
    if (!query) return []
    const searchTerm = query.toLowerCase()
    return allLocations.value.filter(location => 
      location.name.toLowerCase().includes(searchTerm) ||
      location.state.toLowerCase().includes(searchTerm) ||
      location.type.toLowerCase().includes(searchTerm) ||
      location.description.toLowerCase().includes(searchTerm)
    ).slice(0, 20) // Limit results
  }

  return {
    regions,
    locations,
    allLocations,
    selectedRegion,
    selectedLocation,
    setRegion,
    setLocation,
    getLocationById,
    searchLocations
  }
}