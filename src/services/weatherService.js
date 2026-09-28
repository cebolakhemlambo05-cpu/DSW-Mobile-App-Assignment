import { fetchJson } from "../config/api";

const WEATHER_CODE_LABELS = {
  0: "Clear sky",
  1: "Mostly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Foggy",
  51: "Light drizzle",
  53: "Drizzle",
  55: "Heavy drizzle",
  61: "Light rain",
  63: "Rain",
  65: "Heavy rain",
  71: "Light snow",
  73: "Snow",
  75: "Heavy snow",
  80: "Light showers",
  81: "Showers",
  82: "Heavy showers",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Severe thunderstorm",
};

export async function fetchWeatherSummary(latitude, longitude, days = 1) {
  const weather = await fetchJson(
    `/api/weather?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}&days=${encodeURIComponent(days)}`
  );

  return {
    ...weather,
    condition: WEATHER_CODE_LABELS[weather.code] || weather.condition || "Weather forecast",
    forecastDays: (weather.forecastDays || []).map((day) => ({
      ...day,
      condition: WEATHER_CODE_LABELS[day.code] || "Weather forecast",
    })),
  };
}

export function getWeatherAdvice(weather, activities = []) {
  if (!weather) {
    return {
      status: "checking",
      title: "Checking weather",
      message: "Loading today's activity forecast.",
    };
  }

  const activityText = activities
    .map((activity) => activity.name)
    .join(" ")
    .toLowerCase();
  const isOutdoor = /hike|walk|trail|beach|coast|safari|view|tour|boat|kayak|swim|dive|cycle|garden|wildlife|drive/.test(
    activityText
  );

  const concerns = [];
  if (weather.rainChance >= 60 || weather.rainMm >= 5) concerns.push("rain");
  if (weather.windKmh >= 35) concerns.push("strong wind");
  if (weather.uvIndex >= 8) concerns.push("very high UV");
  if (weather.tempMax >= 34) concerns.push("heat");
  if (weather.code >= 95) concerns.push("thunderstorms");

  if (concerns.length === 0) {
    return {
      status: "good",
      title: "Good weather for activities",
      message: `Right now it is ${weather.currentTemp ?? weather.tempMax}C. Today looks suitable: ${weather.condition.toLowerCase()}, ${weather.tempMin}-${weather.tempMax}C.`,
    };
  }

  if (isOutdoor) {
    return {
      status: "caution",
      title: "Weather caution",
      message: `Outdoor plans may be affected by ${concerns.join(", ")}. Consider earlier times or indoor backup options.`,
    };
  }

  return {
    status: "okay",
    title: "Mostly okay",
    message: `Weather has ${concerns.join(", ")}, but your selected activities may still work with planning.`,
  };
}

export function getPackingAdvice(weather, activities = [], stayDays = 1) {
  if (!weather) return [];

  const forecastDays = weather.forecastDays?.length
    ? weather.forecastDays
    : [weather];
  const maxRainChance = Math.max(...forecastDays.map((day) => day.rainChance || 0));
  const totalRainMm = forecastDays.reduce((sum, day) => sum + (day.rainMm || 0), 0);
  const maxUv = Math.max(...forecastDays.map((day) => day.uvIndex || 0));
  const maxTemp = Math.max(...forecastDays.map((day) => day.tempMax || 0));
  const minTemp = Math.min(...forecastDays.map((day) => day.tempMin || 0));
  const maxWind = Math.max(...forecastDays.map((day) => day.windMaxKmh || day.windKmh || 0));
  const hasStorms = forecastDays.some((day) => day.code >= 95);
  const activityText = activities.map((activity) => activity.name).join(" ").toLowerCase();
  const suggestions = [];

  if (maxRainChance >= 50 || totalRainMm >= 3) {
    suggestions.push("Umbrella");
    suggestions.push("Raincoat");
  }
  if (hasStorms) suggestions.push("Indoor backup plan");
  if (maxUv >= 6 || maxTemp >= 26) {
    suggestions.push("Sunscreen");
    suggestions.push("Hat");
    suggestions.push("Water bottle");
  }
  if (minTemp <= 14) suggestions.push("Warm jacket");
  if (maxWind >= 35) suggestions.push("Windbreaker");
  if (/hike|walk|trail|mountain|view/.test(activityText)) {
    suggestions.push("Comfortable walking shoes");
  }
  if (/beach|coast|swim|boat|kayak|dive/.test(activityText)) {
    suggestions.push("Swimwear");
    suggestions.push("Towel");
  }
  if (/safari|wildlife|game|drive/.test(activityText)) {
    suggestions.push("Neutral clothing");
    suggestions.push("Binoculars");
  }

  suggestions.push(`${Math.max(1, stayDays)} day${stayDays === 1 ? "" : "s"} of outfits`);

  return [...new Set(suggestions)].slice(0, 8);
}
