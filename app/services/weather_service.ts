import env from '#start/env'

export interface WeatherData {
  city: string
  temperature: number
  description: string
  icon: string
  tempMin: number
  tempMax: number
  humidity: number
  windSpeed: number
}

interface OpenWeatherMapResponse {
  name: string
  main: {
    temp: number
    temp_min: number
    temp_max: number
    humidity: number
  }
  weather: Array<{
    description: string
    icon: string
  }>
  wind: {
    speed: number
  }
}

export async function fetchWeatherData(city: string): Promise<WeatherData | null> {
  try {
    const apiKey = env.get('OPENWEATHERMAP_API_KEY')
    const url = new URL('https://api.openweathermap.org/data/2.5/weather')
    url.searchParams.append('q', city)
    url.searchParams.append('appid', apiKey)
    url.searchParams.append('units', 'metric')
    url.searchParams.append('lang', 'fr')

    const response = await fetch(url.toString(), {
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      console.error('Weather API error:', response.status, response.statusText)
      return null
    }

    const data = (await response.json()) as OpenWeatherMapResponse

    return {
      city: data.name,
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      tempMin: Math.round(data.main.temp_min),
      tempMax: Math.round(data.main.temp_max),
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
    }
  } catch (error) {
    console.error('Weather API error:', error)
    return null
  }
}
