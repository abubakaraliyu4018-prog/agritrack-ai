// Weather integration via Open-Meteo (free, no API key required).
import { getCoordsForState } from "./data/nigeria.js";

const BASE_URL = process.env.OPEN_METEO_BASE_URL || "https://api.open-meteo.com/v1";

// Geocode a Nigerian state name to lat/lon using Open-Meteo's geocoding API.
async function geocode(state) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    state
  )}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  if (data.results && data.results.length > 0) {
    return { lat: data.results[0].latitude, lon: data.results[0].longitude };
  }
  // Fallback to our static coordinate table.
  const coords = getCoordsForState(state);
  if (coords) return coords;
  throw new Error(`Could not geocode state: ${state}`);
}

// Fetch current conditions + 7-day forecast for a state.
export async function getWeatherForState(state) {
  const { lat, lon } = await geocode(state);
  const params = new URLSearchParams({
    latitude: lat,
    longitude: lon,
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum",
    timezone: "Africa/Lagos",
    forecast_days: "7"
  });
  const url = `${BASE_URL}/forecast?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather forecast failed");
  const data = await res.json();

  return {
    state,
    location: { lat, lon },
    current: data.current
      ? {
          temperature: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          apparent: data.current.apparent_temperature,
          precipitation: data.current.precipitation,
          weatherCode: data.current.weather_code,
          windSpeed: data.current.wind_speed_10m
        }
      : null,
    daily: (data.daily?.time || []).map((date, i) => ({
      date,
      weatherCode: data.daily.weather_code?.[i],
      tempMax: data.daily.temperature_2m_max?.[i],
      tempMin: data.daily.temperature_2m_min?.[i],
      precipProb: data.daily.precipitation_probability_max?.[i],
      precipSum: data.daily.precipitation_sum?.[i]
    })),
    source: "Open-Meteo"
  };
}

// Human-readable summary of the weather for the AI prompt.
export function summarizeWeather(weather) {
  if (!weather || !weather.current) return "Weather data unavailable.";
  const c = weather.current;
  const today = weather.daily?.[0];
  const lines = [
    `Current temperature: ${c.temperature}°C (feels like ${c.apparent}°C)`,
    `Humidity: ${c.humidity ?? "n/a"}%`,
    `Precipitation now: ${c.precipitation ?? 0}mm`,
    `Wind: ${c.windSpeed ?? "n/a"} km/h`
  ];
  if (today) {
    lines.push(
      `Today: high ${today.tempMax}°C, low ${today.tempMin}°C, rain probability ${today.precipProb ?? 0}%`
    );
  }
  if (weather.daily && weather.daily.length > 1) {
    const rainDays = weather.daily
      .slice(1)
      .filter((d) => (d.precipProb || 0) >= 50)
      .map((d) => d.date);
    if (rainDays.length) {
      lines.push(`Rain likely in the next 7 days on: ${rainDays.join(", ")}`);
    } else {
      lines.push("No significant rain expected in the next 7 days.");
    }
  }
  return lines.join(". ");
}