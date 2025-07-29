export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    '@nuxt/ui',
    '@pinia/nuxt'
  ],

  ui: {
    global: true
  },

  app: {
    baseURL: '/fishrpt/',
    head: {
      title: 'Marine Weather Forecast',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { 
          name: 'description', 
          content: 'Real-time marine weather forecasts with NOAA data integration' 
        }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/fishrpt/favicon.ico' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      noaaApiUrl: 'https://api.weather.gov',
      tidesApiUrl: 'https://api.tidesandcurrents.noaa.gov/api/prod',
      openMeteoApiUrl: 'https://marine-api.open-meteo.com/v1',
      groqApiKey: process.env.GROQ_API_KEY || '',
      groqApiUrl: 'https://api.groq.com/openai/v1'
    }
  },

  nitro: {
    preset: 'github-pages'
  }
})