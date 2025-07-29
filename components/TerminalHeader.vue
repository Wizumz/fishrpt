<template>
  <header class="terminal-header">
    <div class="header-container">
      <!-- Terminal Window Controls -->
      <div class="window-controls">
        <span class="control close"></span>
        <span class="control minimize"></span>
        <span class="control maximize"></span>
      </div>

      <!-- Terminal Info -->
      <div class="terminal-info">
        <span class="terminal-path">~/marine-weather</span>
        <span class="terminal-user">noaa@terminal</span>
      </div>

      <!-- Status Bar -->
      <div class="status-bar">
        <div class="status-item">
          <span class="status-icon">📡</span>
          <span :class="['status-text', connectionStatus]">
            {{ connectionStatus.toUpperCase() }}
          </span>
        </div>
        
        <div class="status-item">
          <span class="status-icon">🕒</span>
          <span class="status-text">{{ currentTime }}</span>
        </div>

        <div class="status-item">
          <span class="status-icon">🌊</span>
          <span class="status-text">NOAA DATA</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
// Reactive state for time and connection
const currentTime = ref('')
const connectionStatus = ref<'connected' | 'disconnected' | 'loading'>('connected')

// Update time every second
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US', { 
    hour12: false,
    timeZone: 'UTC',
    timeZoneName: 'short'
  })
}

// Check connection status
const checkConnection = async () => {
  try {
    connectionStatus.value = 'loading'
    // Simple connectivity check
    const response = await fetch('https://api.weather.gov/alerts', { 
      method: 'HEAD',
      mode: 'no-cors'
    })
    connectionStatus.value = 'connected'
  } catch (error) {
    connectionStatus.value = 'disconnected'
  }
}

// Lifecycle hooks
onMounted(() => {
  updateTime()
  checkConnection()
  
  // Update time every second
  setInterval(updateTime, 1000)
  
  // Check connection every 30 seconds
  setInterval(checkConnection, 30000)
})
</script>

<style scoped>
.terminal-header {
  background: var(--bg-secondary);
  border-bottom: 2px solid var(--border);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.window-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  display: block;
}

.control.close {
  background: #ff5f57;
}

.control.minimize {
  background: #ffbd2e;
}

.control.maximize {
  background: #28ca42;
}

.terminal-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 0.9rem;
}

.terminal-path {
  color: var(--accent-blue);
}

.terminal-user {
  color: var(--text-primary);
}

.status-bar {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  font-size: 0.8rem;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.5rem;
  background: var(--bg-tertiary);
  border-radius: 4px;
  border: 1px solid var(--border);
}

.status-icon {
  font-size: 0.7rem;
}

.status-text {
  color: var(--text-secondary);
  font-weight: 500;
}

.status-text.connected {
  color: var(--success);
}

.status-text.disconnected {
  color: var(--error);
}

.status-text.loading {
  color: var(--warning);
}

@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .status-bar {
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .status-item {
    font-size: 0.7rem;
    padding: 0.2rem 0.4rem;
  }
}
</style>