<template>
  <div class="location-picker">
    <!-- Search Input -->
    <div class="search-container">
      <div class="search-input-wrapper">
        <span class="prompt">$</span>
        <input
          v-model="searchTerm"
          type="text"
          placeholder="Search marine forecast locations..."
          class="search-input"
          @focus="showSuggestions = true"
          @blur="delayedHideSuggestions"
          @keydown.enter="selectFirstSuggestion"
        />
        <div class="search-icon">🔍</div>
      </div>
    </div>

    <!-- Region Filter -->
    <div class="region-filter">
      <div class="filter-label">Region:</div>
      <div class="filter-buttons">
        <button
          v-for="region in regions"
          :key="region.value"
          :class="['filter-btn', { active: selectedRegion === region.value }]"
          @click="selectedRegion = region.value"
        >
          {{ region.label }}
        </button>
      </div>
    </div>

    <!-- Location Suggestions -->
    <div v-if="showSuggestions && filteredLocations.length > 0" class="suggestions">
      <div class="suggestions-header">
        <span class="prompt">></span>
        Available Locations ({{ filteredLocations.length }})
      </div>
      <div class="suggestions-list">
        <div
          v-for="location in filteredLocations.slice(0, 20)"
          :key="location.id"
          class="suggestion-item"
          @click="selectLocation(location)"
        >
          <div class="location-info">
            <div class="location-name">{{ location.name }}</div>
            <div class="location-details">
              <span class="anz-code">{{ location.anzCode }}</span>
              <span class="separator">•</span>
              <span class="description">{{ location.description }}</span>
            </div>
          </div>
          <div class="location-status">
            <span v-if="location.stationId" class="station-available" title="Tidal data available">📊</span>
            <span class="region-tag">{{ getRegionLabel(location.region) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Popular Locations -->
    <div v-if="!showSuggestions || searchTerm === ''" class="popular-locations">
      <h3 class="popular-title">
        <span class="prompt">></span> Popular East Coast Locations
      </h3>
      <div class="popular-grid">
        <div
          v-for="location in popularLocations"
          :key="location.id"
          class="popular-item"
          @click="selectLocation(location)"
        >
          <div class="popular-name">{{ location.name }}</div>
          <div class="popular-code">{{ location.anzCode }}</div>
        </div>
      </div>
    </div>

    <!-- No Results -->
    <div v-if="showSuggestions && filteredLocations.length === 0 && searchTerm" class="no-results">
      <div class="no-results-message">
        <span class="prompt">$</span>
        No locations found for "{{ searchTerm }}"
      </div>
      <div class="suggestion-text">
        Try searching for common names like "Long Island", "Cape Cod", or specific ANZ codes like "ANZ335"
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MarineLocation } from '~/types/marine'

// Emits
const emit = defineEmits<{
  'location-selected': [location: MarineLocation]
}>()

// Reactive state
const searchTerm = ref('')
const selectedRegion = ref<string>('all')
const showSuggestions = ref(false)

// Available regions
const regions = [
  { value: 'all', label: 'All Regions' },
  { value: 'east_coast', label: 'East Coast' },
  { value: 'west_coast', label: 'West Coast' },
  { value: 'gulf', label: 'Gulf of Mexico' },
  { value: 'great_lakes', label: 'Great Lakes' }
]

// Composables
const { locations, popularLocations, loading } = useMarineLocations()

// Computed
const filteredLocations = computed(() => {
  let filtered = locations.value

  // Filter by region
  if (selectedRegion.value !== 'all') {
    filtered = filtered.filter(loc => loc.region === selectedRegion.value)
  }

  // Filter by search term
  if (searchTerm.value.trim()) {
    const term = searchTerm.value.toLowerCase()
    filtered = filtered.filter(loc =>
      loc.name.toLowerCase().includes(term) ||
      loc.description.toLowerCase().includes(term) ||
      loc.anzCode.toLowerCase().includes(term)
    )
  }

  return filtered
})

// Methods
const selectLocation = (location: MarineLocation) => {
  emit('location-selected', location)
  searchTerm.value = location.name
  showSuggestions.value = false
}

const selectFirstSuggestion = () => {
  if (filteredLocations.value.length > 0) {
    selectLocation(filteredLocations.value[0])
  }
}

const delayedHideSuggestions = () => {
  // Delay hiding to allow click events on suggestions
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

const getRegionLabel = (region: string) => {
  return regions.find(r => r.value === region)?.label || region
}

// Watch for region changes
watch(selectedRegion, () => {
  if (searchTerm.value) {
    showSuggestions.value = true
  }
})
</script>

<style scoped>
.location-picker {
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  border-radius: 8px;
  padding: 2rem;
  position: relative;
}

.search-container {
  margin-bottom: 2rem;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  background: var(--bg-tertiary);
  border: 2px solid var(--border);
  border-radius: 6px;
  padding: 0.75rem 1rem;
  transition: border-color 0.3s ease;
}

.search-input-wrapper:focus-within {
  border-color: var(--accent-blue);
}

.prompt {
  color: var(--accent-blue);
  margin-right: 0.5rem;
  font-weight: bold;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 1rem;
  outline: none;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-icon {
  color: var(--text-muted);
  margin-left: 0.5rem;
}

.region-filter {
  margin-bottom: 2rem;
}

.filter-label {
  color: var(--text-primary);
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-family: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: var(--bg-primary);
  border-color: var(--accent-blue);
}

.filter-btn.active {
  background: var(--accent-blue);
  color: var(--bg-primary);
  border-color: var(--accent-blue);
}

.suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  border-radius: 8px;
  margin-top: 0.5rem;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.suggestions-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  color: var(--text-primary);
  font-weight: 600;
}

.suggestions-list {
  max-height: 320px;
  overflow-y: auto;
}

.suggestion-item {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.suggestion-item:hover {
  background: var(--bg-tertiary);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.location-info {
  flex: 1;
}

.location-name {
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.location-details {
  color: var(--text-muted);
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.anz-code {
  color: var(--accent-blue);
  font-weight: 500;
}

.separator {
  color: var(--border);
}

.location-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.station-available {
  font-size: 0.8rem;
}

.region-tag {
  background: var(--bg-tertiary);
  color: var(--text-muted);
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  font-size: 0.7rem;
  border: 1px solid var(--border);
}

.popular-locations {
  margin-top: 2rem;
}

.popular-title {
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  font-size: 1.2rem;
}

.popular-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.popular-item {
  background: var(--bg-tertiary);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.popular-item:hover {
  background: var(--bg-primary);
  border-color: var(--accent-blue);
  transform: translateY(-2px);
}

.popular-name {
  color: var(--text-primary);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.popular-code {
  color: var(--accent-blue);
  font-size: 0.9rem;
}

.no-results {
  padding: 2rem;
  text-align: center;
}

.no-results-message {
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.suggestion-text {
  color: var(--text-muted);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .location-picker {
    padding: 1rem;
  }
  
  .popular-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-buttons {
    flex-direction: column;
  }
  
  .filter-btn {
    text-align: center;
  }
  
  .suggestion-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .location-status {
    align-self: flex-end;
  }
}
</style>