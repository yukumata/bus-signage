import { useEffect, useState } from "react";
import axios from "axios";
import {
  Cloud,
  Umbrella,
  Sun,
  CloudSun,
  CloudDrizzle,
  CloudSnow,
  CloudFog,
  Moon,
  CloudMoon,
  CloudLightning,
  Snowflake,
} from "lucide-react";
import "./Weather.css";

type WeatherData = {
  dt: number;
  main: {
    humidity: number;
    temp: number;
  };
  weather: { id: number; description: string; icon: string; main?: string }[];
  rain?: {
    "3h": number;
  };
};

function getWeatherIcon(id?: number, iconCode?: string, rainAmount: number = 0) {
  if (!id) return <Cloud className="icon gray" />;

  if (id === 800) {
    if (iconCode?.endsWith("n")) {
      return <Moon className="icon yellow" />;
    }
    return <Sun className="icon orange" />;
  } else if (id >= 801 && id <= 804) {
    if (iconCode?.endsWith("n")) {
      return <CloudMoon className="icon yellow" />;
    }
    return <Cloud className="icon gray" />;
  }

  switch (Math.floor(id / 100)) {
    case 2:
      if (rainAmount >= 50) return <CloudLightning className="icon red" />;
      if (rainAmount >= 20) return <CloudLightning className="icon purple" />;
      if (rainAmount >= 10) return <CloudLightning className="icon lightpurple" />;
      return <CloudLightning className="icon yellow" />;
    case 3:
      return <CloudDrizzle className="icon lightblue" />;
    case 5:
      if (rainAmount >= 50) return <Umbrella className="icon red" />;
      if (rainAmount >= 20) return <Umbrella className="icon purple" />;
      if (rainAmount >= 10) return <Umbrella className="icon lightpurple" />;
      return <Umbrella className="icon blue" />;
    case 6:
      if (id >= 611 && id <= 616) return <CloudSnow className="icon skyblue" />;
      return <Snowflake className="icon white" />;
    case 7:
      return <CloudFog className="icon gray" />;
    default:
      return <CloudSun className="icon orange" />;
  }
}

function getWeatherName(id?: number, rainAmount: number = 0): string {
  if (!id) return "不明";

  if (id === 800) return "晴れ";
  if (id >= 801 && id <= 804) return "くもり";

  switch (Math.floor(id / 100)) {
    case 2:
      if (rainAmount >= 80) return "猛烈な雷雨";
      if (rainAmount >= 50) return "非常に激しい雷雨";
      if (rainAmount >= 30) return "激しい雷雨";
      if (rainAmount >= 20) return "強い雷雨";
      if (rainAmount >= 10) return "やや強い雷雨";
      return "雷雨";
    case 3:
      return "霧雨";
    case 5:
      if (rainAmount >= 80) return "猛烈な雨";
      if (rainAmount >= 50) return "非常に激しい雨";
      if (rainAmount >= 30) return "激しい雨";
      if (rainAmount >= 20) return "強い雨";
      if (rainAmount >= 10) return "やや強い雨";
      return "雨";
    case 6:
      if (id >= 611 && id <= 616) return "みぞれ";
      if (id === 602 || id === 622) return "大雪";
      return "雪";
    case 7:
      return "霧";
    default:
      return "不明";
  }
}

export default function Weather({ zipCode }: { zipCode: number }) {
  const [forecast, setForecast] = useState<WeatherData[]>([]);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const response_cordinate = await axios.get(
          `https://geoapi.heartrails.com/api/json?method=searchByPostal&postal=${zipCode}`,
        );
        const locations = response_cordinate.data?.response?.location;
        if (!locations || locations.length === 0) {
          console.log("該当する住所が見つかりませんでした。");
          return;
        }
        const { x: lon, y: lat } = locations[0];

        const apiKey = "73ba8c476b36e28faf5a2bc05747bc07";
        if (!apiKey) {
          console.error("APIキーが設定されていません。");
          return;
        }

        const forecastRes = await axios.get(
          `https://api.openweathermap.org/data/2.5/forecast`,
          {
            params: {
              lat,
              lon,
              units: "metric",
              lang: "ja",
              appid: apiKey,
            },
          },
        );

        const now = Date.now();
        const list: WeatherData[] = forecastRes.data.list;
        const pastOne = [...list]
          .reverse().find((item) => item.dt * 1000 <= now);
        const futureData = [...list]
          .filter((item: WeatherData) => item.dt * 1000 > now)
          .slice(0, 6);
        const combinedData = pastOne ? [pastOne, ...futureData] : futureData;
        setForecast(combinedData);
      } catch (error) {
        console.error("API取得エラー:", error);
      }
    };
    fetchCoordinates();
  }, [zipCode]);

  return (
    <div className="weather-container">
      <div className="forecast-frame">
        <div className="title">現在の天気予報</div>
        {forecast.length === 0 ? (
          <div className="no-data">予報データがありません。</div>
        ) : (
          <div className="forecast-list">
            {forecast.map((item) => (
              <div className="forecast-card" key={item.dt}>
                <div className="time">
                  {new Date(item.dt * 1000).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                {getWeatherIcon(item.weather[0]?.id, item.weather[0]?.icon, item.rain?.['3h'] ?? 0)}
                <div className="desc">{getWeatherName(item.weather[0]?.id, item.rain?.['3h'] ?? 0)}</div>
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
  );
}
