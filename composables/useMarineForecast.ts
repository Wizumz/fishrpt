import type { MarineLocation, ForecastData, AiSummaryResponse } from '~/types/marine'

export const useMarineForecast = () => {
  const config = useRuntimeConfig()
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // Enhanced caching with zone information
  const cache = new Map<string, { data: ForecastData; timestamp: number }>()
  const zoneCache = new Map<string, { data: any; timestamp: number }>()
  const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

  const fetchMarineForecast = async (location: MarineLocation): Promise<ForecastData> => {
    const cacheKey = `forecast_${location.anzCode}`
    const cached = cache.get(cacheKey)
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.data
    }

    loading.value = true
    error.value = null

    try {
      // Fetch zone information from NOAA API for enhanced metadata
      const zoneInfo = await fetchZoneInformation(location.anzCode)
      
      // Fetch the text forecast from NOAA
      const rawForecast = await fetchNoaaTextForecast(location.forecastUrl)
      const parsedForecast = parseNoaaForecast(rawForecast)

      // Generate AI summary
      let summary: string | undefined
      try {
        const aiSummary = await generateAiSummary(parsedForecast.raw)
        summary = aiSummary.summary
      } catch (aiError) {
        console.warn('AI summarization failed:', aiError)
      }

      const forecastData: ForecastData = {
        ...parsedForecast,
        summary,
        zoneInfo: zoneInfo?.properties || null,
        location: {
          ...location,
          name: zoneInfo?.properties?.name || location.name,
          description: zoneInfo?.properties?.name || location.description
        }
      }

      cache.set(cacheKey, { data: forecastData, timestamp: Date.now() })
      return forecastData
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch marine forecast'
      error.value = errorMessage
      console.error('Error fetching marine forecast:', err)
      throw new Error(errorMessage)
    } finally {
      loading.value = false
    }
  }

  // Fetch zone information from NOAA API
  const fetchZoneInformation = async (anzCode: string): Promise<any> => {
    const cacheKey = `zone_${anzCode}`
    const cached = zoneCache.get(cacheKey)
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
      return cached.data
    }

    try {
      const response = await $fetch(`${config.public.noaaApiUrl}/zones/forecast/${anzCode}`)
      zoneCache.set(cacheKey, { data: response, timestamp: Date.now() })
      return response
    } catch (err) {
      console.warn(`Failed to fetch zone information for ${anzCode}:`, err)
      return null
    }
  }

  const fetchNoaaTextForecast = async (forecastUrl: string): Promise<string> => {
    try {
      const response = await $fetch(forecastUrl, {
        method: 'GET',
        responseType: 'text',
        headers: {
          'User-Agent': 'Marine Weather Terminal (Educational Use)'
        }
      })
      
      if (typeof response !== 'string') {
        throw new Error('Invalid forecast response format')
      }
      
      return response
    } catch (err) {
      console.error('Error fetching NOAA text forecast:', err)
      throw new Error('Failed to fetch NOAA text forecast')
    }
  }

  const parseNoaaForecast = (rawText: string): Omit<ForecastData, 'summary' | 'zoneInfo' | 'location'> => {
    try {
      const lines = rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0)
      
      return {
        raw: rawText,
        issueTime: extractIssueTime(rawText),
        validTime: extractValidTime(rawText),
        synopsis: extractSection(rawText, 'SYNOPSIS', 'CONDITIONS'),
        conditions: extractConditions(rawText),
        outlook: extractOutlook(rawText),
        lastUpdated: new Date().toISOString()
      }
    } catch (err) {
      console.error('Error parsing NOAA forecast:', err)
      throw new Error('Failed to parse NOAA forecast data')
    }
  }

  const extractIssueTime = (text: string): string => {
    // Look for timestamp patterns in NOAA marine forecasts
    const patterns = [
      /(\d{1,2}:\d{2}\s+(AM|PM)\s+\w+\s+\w+\s+\w+\s+\d+\s+\d{4})/i,
      /(\d{4}\s+UTC\s+\w+\s+\w+\s+\d+\s+\d{4})/i,
      /(\w+\s+\d{1,2}\s+\d{4}\s+\d{1,2}:\d{2}\s+(AM|PM))/i
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        return match[1].trim()
      }
    }
    
    return 'Issue time not found'
  }

  const extractValidTime = (text: string): string => {
    // Look for valid time patterns
    const validPattern = /valid\s+through\s+([^.]+)/i
    const match = text.match(validPattern)
    return match ? match[1].trim() : 'Valid time not specified'
  }

  const extractSection = (text: string, startKeyword: string, endKeyword?: string): string => {
    const startPattern = new RegExp(`${startKeyword}[\\s\\S]*?(?=\\n\\n|$)`, 'i')
    const match = text.match(startPattern)
    
    if (!match) return ''
    
    let section = match[0]
    
    if (endKeyword) {
      const endPattern = new RegExp(`(.*?)\\b${endKeyword}\\b`, 'i')
      const endMatch = section.match(endPattern)
      if (endMatch) {
        section = endMatch[1]
      }
    }
    
    return section
      .replace(new RegExp(`^${startKeyword}\\s*`, 'i'), '')
      .trim()
  }

  const extractConditions = (text: string) => {
    return {
      winds: extractWinds(text),
      seas: extractSeas(text),
      weather: extractWeather(text),
      visibility: extractVisibility(text)
    }
  }

  const extractWinds = (text: string): string => {
    const windPatterns = [
      /winds?\s+([^.]+\.)/gi,
      /wind\s+([^.]+\.)/gi
    ]
    
    const matches: string[] = []
    for (const pattern of windPatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        matches.push(match[1].trim())
      }
    }
    
    return matches.length > 0 ? matches.join(' ') : 'Wind information not available'
  }

  const extractSeas = (text: string): string => {
    const seaPatterns = [
      /seas?\s+([^.]+\.)/gi,
      /waves?\s+([^.]+\.)/gi,
      /swell\s+([^.]+\.)/gi
    ]
    
    const matches: string[] = []
    for (const pattern of seaPatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        matches.push(match[1].trim())
      }
    }
    
    return matches.length > 0 ? matches.join(' ') : 'Sea conditions not available'
  }

  const extractWeather = (text: string): string => {
    const weatherPatterns = [
      /weather[:\s]+([^.]+\.)/gi,
      /(rain|snow|fog|thunderstorms?|showers?)[^.]*\./gi,
      /(sunny|cloudy|clear|overcast|partly\s+cloudy)[^.]*\./gi
    ]
    
    const matches: string[] = []
    for (const pattern of weatherPatterns) {
      let match
      while ((match = pattern.exec(text)) !== null) {
        matches.push(match[1] ? match[1].trim() : match[0].trim())
      }
    }
    
    return matches.length > 0 ? matches.join(' ') : 'Weather conditions not specified'
  }

  const extractVisibility = (text: string): string => {
    const visibilityPattern = /visibility[:\s]+([^.]+\.)/gi
    const match = visibilityPattern.exec(text)
    return match ? match[1].trim() : 'Visibility not specified'
  }

  const extractOutlook = (text: string): string[] => {
    // Look for outlook or extended forecast sections
    const outlookSection = extractSection(text, 'OUTLOOK', '')
    
    if (outlookSection) {
      return outlookSection
        .split(/\.\s+/)
        .map(s => s.trim())
        .filter(s => s.length > 10)
    }
    
    // Fallback: extract sentences that might be outlook
    const sentences = text
      .split(/\.\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && (
        s.toLowerCase().includes('outlook') ||
        s.toLowerCase().includes('extended') ||
        s.toLowerCase().includes('later') ||
        s.toLowerCase().includes('tonight') ||
        s.toLowerCase().includes('tomorrow')
      ))
    
    return sentences.slice(0, 3) // Limit to 3 outlook items
  }

  // Enhanced AI summary generation with multiple providers
  const generateAiSummary = async (forecastText: string): Promise<AiSummaryResponse> => {
    const prompt = `Please provide a concise 2-3 sentence summary of this marine weather forecast, focusing on the most important conditions for boaters and mariners:\n\n${forecastText}`
    
    const providers = [
      { name: 'openai', apiKey: config.public.openaiApiKey },
      { name: 'claude', apiKey: config.public.claudeApiKey },
      { name: 'groq', apiKey: config.public.groqApiKey }
    ]
    
    for (const provider of providers) {
      if (provider.apiKey) {
        try {
          const summary = await callAiProvider(provider.name, prompt, {
            apiKey: provider.apiKey,
            model: provider.name === 'openai' ? 'gpt-3.5-turbo' : 
                   provider.name === 'claude' ? 'claude-3-haiku-20240307' :
                   'llama3-8b-8192'
          })
          
          if (summary) {
            return {
              summary,
              provider: provider.name,
              timestamp: new Date().toISOString()
            }
          }
        } catch (err) {
          console.warn(`AI provider ${provider.name} failed:`, err)
        }
      }
    }
    
    // Fallback to simple summary
    const simpleSummary = generateSimpleSummary(forecastText)
    return {
      summary: simpleSummary,
      provider: 'fallback',
      timestamp: new Date().toISOString()
    }
  }

  const callAiProvider = async (provider: string, text: string, config: any): Promise<string | null> => {
    try {
      switch (provider) {
        case 'groq':
          return await callGrokApi(text, config.apiKey)
        case 'openai':
          return await callOpenAiApi(text, config.apiKey)
        case 'claude':
          return await callClaudeApi(text, config.apiKey)
        default:
          return null
      }
    } catch (err) {
      console.error(`Error calling ${provider} API:`, err)
      return null
    }
  }

  const callGrokApi = async (prompt: string, apiKey: string): Promise<string> => {
    // Placeholder for Grok API implementation
    // Note: Grok API endpoint and format may vary
    throw new Error('Grok API integration not yet implemented')
  }

  const callOpenAiApi = async (prompt: string, apiKey: string): Promise<string> => {
    const response = await $fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.3
      }
    })
    
    return response.choices[0]?.message?.content || ''
  }

  const callClaudeApi = async (prompt: string, apiKey: string): Promise<string> => {
    const response = await $fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: {
        model: 'claude-3-haiku-20240307',
        max_tokens: 150,
        messages: [{ role: 'user', content: prompt }]
      }
    })
    
    return response.content[0]?.text || ''
  }

  const generateSimpleSummary = (text: string): string => {
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20)
    
    // Find key information
    const windInfo = sentences.find(s => /wind/i.test(s))
    const seaInfo = sentences.find(s => /(sea|wave|swell)/i.test(s))
    const weatherInfo = sentences.find(s => /(rain|storm|clear|cloud)/i.test(s))
    
    const summaryParts = [windInfo, seaInfo, weatherInfo].filter(Boolean).slice(0, 2)
    
    if (summaryParts.length === 0) {
      return 'Marine conditions as described in the full forecast above.'
    }
    
    return summaryParts.join('. ') + (summaryParts.length > 0 && !summaryParts[summaryParts.length - 1]?.endsWith('.') ? '.' : '')
  }

  const clearCache = () => {
    cache.clear()
    zoneCache.clear()
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    fetchMarineForecast,
    fetchZoneInformation,
    clearCache
  }
}