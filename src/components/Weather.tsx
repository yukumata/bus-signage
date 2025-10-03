import { useEffect, useState } from 'react'
import axios from 'axios'
import './Weather.css'

interface WeatherData {
  dt: number
  main: {
    humidity: number
    temp: number
  }
  weather: { description: string; icon: string }[]
  rain?: {
    '3h': number
  }
}
interface ForecastItem {
  dt: number
  main: {
    humidity: number
    temp: number
  }
  weather: { description: string; icon: string }[]
  rain?: {
    '3h': number
  }
}

function Weather({ zipCode }: { zipCode: number }) {
  const [forecast, setForecast] = useState<WeatherData[]>([])

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const response_cordinate = await axios.get(
          `https://geoapi.heartrails.com/api/json?method=searchByPostal&postal=${zipCode}`
        )
        const locations = response_cordinate.data?.response?.location
        if (!locations || locations.length === 0) {
          console.log('該当する住所が見つかりませんでした。')
          return
        }
        const { x: lon, y: lat } = locations[0]

        const apiKey = '73ba8c476b36e28faf5a2bc05747bc07'
        const forecastRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast`,
          {
            params: {
              lat,
              lon,
              units: 'metric',
              appid: apiKey,
            },
          }
        )
        const today = new Date().toISOString().split('T')[0]
        const todayData: WeatherData[] = (
          forecastRes.data.list as ForecastItem[]
        ).filter((item) =>
          new Date(item.dt * 1000).toISOString().startsWith(today)
        )
        setForecast(todayData)
        console.log(todayData)
      } catch (error) {
        console.error('API取得エラー:', error)
      }
    }
    fetchCoordinates()
  }, [zipCode])
  return (
    <div className="frame">
      <h1>調整中</h1>
      <ul>
        {forecast.map((item) => (
          <li key={item.dt}>
            {new Date(item.dt * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}{' '}
            - {item.main.temp}°C - {item.weather[0].description} - 湿度{' '}
            {item.main.humidity}%{' '}
            {item.rain?.['3h'] ? `- 雨量 ${item.rain['3h']}mm` : ''}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Weather
