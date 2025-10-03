import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  Cloud,
  Umbrella,
  Sun,
  CloudSun,
  CloudDrizzle,
  CloudSnow,
  CloudFog,
} from 'lucide-react'
import './Weather.css'

type WeatherData = {
  dt: number
  main: {
    humidity: number
    temp: number
  }
  weather: { description: string; icon: string; main?: string }[]
  rain?: {
    '3h': number
  }
}

function getWeatherIcon(main?: string) {
  if (!main) return <Cloud className="icon gray" />
  switch (main.toLowerCase()) {
    case 'clear':
      return <Sun className="icon yellow" />
    case 'clouds':
      return <Cloud className="icon gray" />
    case 'rain':
      return <Umbrella className="icon blue" />
    case 'drizzle':
      return <CloudDrizzle className="icon lightblue" />
    case 'snow':
      return <CloudSnow className="icon sky" />
    case 'fog':
      return <CloudFog className="icon gray" />
    case 'mist':
      return <CloudFog className="icon gray" />
    case 'haze':
      return <CloudFog className="icon gray" />
    default:
      return <CloudSun className="icon orange" />
  }
}

export default function Weather({ zipCode }: { zipCode: number }) {
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
        if (!apiKey) {
          console.error('APIキーが設定されていません。')
          return
        }

        const forecastRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast`,
          {
            params: {
              lat,
              lon,
              units: 'metric',
              lang: 'ja',
              appid: apiKey,
            },
          }
        )

        const now = Date.now()
        const futureData: WeatherData[] = forecastRes.data.list
          .filter((item: WeatherData) => item.dt * 1000 > now)
          .slice(0, 5)
        setForecast(futureData)
      } catch (error) {
        console.error('API取得エラー:', error)
      }
    }
    fetchCoordinates()
  }, [zipCode])

  return (
    <div className="weather-container">
      <div className="forecast-frame">
        {forecast.length === 0 ? (
          <div className="no-data">予報データがありません。</div>
        ) : (
          <div className="forecast-list">
            {forecast.map((item) => (
              <div className="forecast-card" key={item.dt}>
                <div className="time">
                  {new Date(item.dt * 1000).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                {getWeatherIcon(item.weather[0]?.main)}
                <div className="desc">{item.weather[0]?.description}</div>
                <div className="temp">{Math.round(item.main.temp)}°C</div>
                <div className="humidity">湿度 {item.main.humidity}%</div>
                {/* {item.rain?.['3h'] && (
                  <div className="rain">雨量 {item.rain['3h']}mm</div>
                )} */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
