export default defineNuxtConfig({
  devtools: { enabled: true },
  
  // Enable static site generation for GitHub Pages
  nitro: {
    prerender: {
      routes: ['/']
    }
  },
  
  // Configure for GitHub Pages deployment
  app: {
    baseURL: process.env.NODE_ENV === 'production' ? '/fishrpt/' : '/',
    buildAssetsDir: '/assets/'
  },
  
  modules: [
    '@nuxt/ui',
    '@vite-pwa/nuxt'
  ],

  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/fishrpt/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
    },
    manifest: {
      name: 'Fishing Report Pro',
      short_name: 'FishingPro',
      description: 'AI-powered fishing reports with weather, tides, and solunar data',
      theme_color: '#0ea5e9',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/fishrpt/',
      start_url: '/fishrpt/',
      icons: [
        {
          src: '/fishrpt/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/fishrpt/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
  },

  runtimeConfig: {
    // Private keys (only available on server-side)
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    
    // Public keys (exposed to client-side)
    public: {
      noaaApiUrl: 'https://api.weather.gov',
      tidesApiUrl: 'https://api.tidesandcurrents.noaa.gov/api/prod',
      solunarApiUrl: 'https://api.solunar.org',
      openMeteoApiUrl: 'https://marine-api.open-meteo.com/v1'
    }
  },

  css: ['~/assets/css/main.css'],

  // Enable static generation (ssr: false is for client-side rendering)
  ssr: false
})