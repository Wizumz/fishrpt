<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
    <NuxtPage />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'

// SEO and meta tags
useHead({
  title: 'Fishing Report Pro',
  meta: [
    {
      name: 'description',
      content: 'AI-powered fishing reports with real-time weather, tides, solunar data, and fishing predictions.'
    },
    {
      name: 'keywords',
      content: 'fishing report, tides, weather, solunar, fishing forecast, marine weather'
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, user-scalable=no'
    },
    {
      name: 'theme-color',
      content: '#0ea5e9'
    }
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: '/favicon.ico'
    }
  ]
})

// PWA install prompt handling
onMounted(() => {
  let deferredPrompt
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    
    // Show custom install button or banner
    console.log('PWA install prompt available')
  })
  
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed')
    deferredPrompt = null
  })
})
</script>