import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(backendDirectory, ".env") });

const app = express();
const port = Number(process.env.PORT || 4000);
const apiKey = process.env.GOOGLE_PLACES_API_KEY;
const cacheTtl = Number(process.env.CACHE_TTL_MS || 6 * 60 * 60 * 1000);
const cachePath = path.join(backendDirectory, '.cache', 'places.json');
const nearbyUrl = 'https://places.googleapis.com/v1/places:searchNearby';
const textSearchUrl = 'https://places.googleapis.com/v1/places:searchText';
const includedTypes = [
  'tourist_attraction',
  'museum',
  'park',
  'zoo',
  'amusement_park',
  'art_gallery',
];
const southAfrica = {
  minLat: -34.85,
  maxLat: -22.1,
  minLng: 16.45,
  maxLng: 32.9,
};

app.use(cors());
app.use(express.json());

async function readCache() {
  try {
    return JSON.parse(await fs.readFile(cachePath, 'utf8'));
  } catch {
    return {};
  }
}

async function writeCache(cache) {
  await fs.mkdir(path.dirname(cachePath), { recursive: true });
  await fs.writeFile(cachePath, JSON.stringify(cache, null, 2));
}

async function googlePlaces(url, body, fieldMask) {
  if (!apiKey) throw new Error('GOOGLE_PLACES_API_KEY is not configured');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': fieldMask,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok)
    throw new Error(
      `Google Places returned ${response.status}: ${await response.text()}`
    );
  return response.json();
}

function toAttraction(place) {
  const location = place.location || {};
  return {
    id: place.id,
    googlePlaceId: place.id,
    name: place.displayName?.text || "Unnamed place",
    location: place.formattedAddress || "South Africa",
    category: place.primaryTypeDisplayName?.text || "Attraction",
    image: place.photos?.[0]?.name ? `/api/photos/${encodeURIComponent(place.photos[0].name)}` : fallbackImage(place.primaryType || place.primaryTypeDisplayName?.text),
    description: place.editorialSummary?.text || place.generativeSummary?.overview?.text || "",
    localFav: false,
    latitude: location.latitude,
    longitude: location.longitude,
    rating: place.rating,
    priceLevel: place.priceLevel,
    accommodations: [],
    activities: [],
    openingHours: place.regularOpeningHours?.weekdayDescriptions || [],
    phone: place.nationalPhoneNumber || place.internationalPhoneNumber,
    websiteUri: place.websiteUri,
  };
}

function fallbackImage(category = "") {
  const value = category.toLowerCase();
  if (value.includes("museum") || value.includes("gallery")) return "https://images.unsplash.com/photo-1564399579883-451a5d44ec08?w=800&h=500&fit=crop&auto=format";
  if (value.includes("park") || value.includes("zoo") || value.includes("wildlife")) return "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&h=500&fit=crop&auto=format";
  if (value.includes("mountain") || value.includes("hiking")) return "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=500&fit=crop&auto=format";
  if (value.includes("beach") || value.includes("coast") || value.includes("ocean")) return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=500&fit=crop&auto=format";
  return "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&h=500&fit=crop&auto=format";
}

function ensureAttractionImage(attraction) {
  return { ...attraction, image: attraction.image || fallbackImage(attraction.category) };
}

function grid(step = 2) {
  const cells = [];
  for (let lat = southAfrica.minLat; lat <= southAfrica.maxLat; lat += step) {
    for (let lng = southAfrica.minLng; lng <= southAfrica.maxLng; lng += step) {
      cells.push({ latitude: lat + step / 2, longitude: lng + step / 2 });
    }
  }
  return cells;
}

function matchesQuery(attraction, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const aliases = {
    mountains: ["mountain", "mountains", "hiking", "hike", "peak"],
    wildlife: ["wildlife", "safari", "animal", "animals", "game", "zoo"],
    coast: ["coast", "coastal", "beach", "ocean", "sea"],
    city: ["city", "urban", "culture", "museum", "gallery"],
  };
  const terms = aliases[normalized] || [normalized];
  const haystack = [attraction.name, attraction.location, attraction.category, attraction.description]
    .join(" ")
    .toLowerCase();
  return terms.some((term) => haystack.includes(term));
}

const attractionFieldMask = "places.id,places.displayName,places.formattedAddress,places.location,places.primaryTypeDisplayName,places.photos,places.editorialSummary,places.rating,places.priceLevel,places.regularOpeningHours,places.nationalPhoneNumber,places.websiteUri";
const textSearchFieldMask = `${attractionFieldMask},nextPageToken`;

async function searchAttractions(query) {
  const byId = new Map();
  const searchTerms = {
    mountains: "mountains hiking peaks attractions",
    wildlife: "wildlife safari animals game reserves attractions",
    coast: "coast beaches ocean seaside attractions",
    city: "city culture museums galleries attractions",
  };
  const textQuery = `${searchTerms[query.trim().toLowerCase()] || query} in South Africa`;
  let pageToken;

  for (let page = 0; page < 3; page += 1) {
    const body = { textQuery, pageSize: 20 };
    if (pageToken) body.pageToken = pageToken;
    const result = await googlePlaces(textSearchUrl, body, textSearchFieldMask);
    for (const place of result.places || []) byId.set(place.id, toAttraction(place));
    pageToken = result.nextPageToken;
    if (!pageToken) break;
  }

  return [...byId.values()];
}

async function sweepAttractions() {
  const cache = await readCache();
  if (cache.attractions && cache.attractions.expiresAt > Date.now()) return cache.attractions.value;

  const byId = new Map();
  for (const center of grid()) {
    const result = await googlePlaces(
      nearbyUrl,
      {
        includedTypes,
        maxResultCount: 20,
        rankPreference: "DISTANCE",
        locationRestriction: { circle: { center, radius: 50000 } },
      },
      attractionFieldMask
    );
    for (const place of result.places || []) byId.set(place.id, toAttraction(place));
  }
  const textResult = await googlePlaces(
    textSearchUrl,
    { textQuery: "tourist attractions in South Africa", pageSize: 20 },
    textSearchFieldMask
  );
  for (const place of textResult.places || []) byId.set(place.id, toAttraction(place));
  const value = [...byId.values()];
  cache.attractions = { expiresAt: Date.now() + cacheTtl, value };
  await writeCache(cache);
  return value;
}

app.get("/health", (_req, res) => res.json({ ok: true, googlePlacesConfigured: Boolean(apiKey) }));

app.get("/api/attractions", async (req, res) => {
  try {
    const query = typeof req.query.query === "string" ? req.query.query : "";
    if (query.trim()) {
      const liveResults = await searchAttractions(query);
      const cache = await readCache();
      const cachedAttractions = cache.attractions?.value || [];
      const byId = new Map(liveResults.map((attraction) => [attraction.id, attraction]));
      for (const attraction of cachedAttractions) {
        if (matchesQuery(attraction, query)) byId.set(attraction.id, ensureAttractionImage(attraction));
      }
      return res.json({ data: [...byId.values()] });
    }
    const cache = await readCache();
    if (cache.browse && cache.browse.expiresAt > Date.now()) {
      return res.json({ data: cache.browse.value.map(ensureAttractionImage) });
    }
    const value = await searchAttractions("tourist attractions");
    cache.browse = { expiresAt: Date.now() + cacheTtl, value };
    await writeCache(cache);
    res.json({ data: value });
  } catch (error) {
    console.error("Attraction request failed:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/attractions/:id/lodging", async (req, res) => {
  try {
    const attractions = await sweepAttractions();
    const attraction = attractions.find((item) => item.id === req.params.id);
    if (!attraction) return res.status(404).json({ error: "Attraction not found" });
    const cache = await readCache();
    const cacheKey = `lodging:${attraction.id}`;
    if (cache[cacheKey] && cache[cacheKey].expiresAt > Date.now()) {
      return res.json({ data: cache[cacheKey].value });
    }
    const result = await googlePlaces(
      nearbyUrl,
      {
        includedTypes: ["lodging"],
        maxResultCount: 20,
        rankPreference: "DISTANCE",
        locationRestriction: { circle: { center: { latitude: attraction.latitude, longitude: attraction.longitude }, radius: 25000 } },
      },
      "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.priceLevel,places.photos,places.nationalPhoneNumber,places.websiteUri"
    );
    const value = (result.places || []).map((place) => ({
        id: place.id,
        name: place.displayName?.text || "Unnamed lodging",
        type: "Lodging",
        address: place.formattedAddress,
        latitude: place.location?.latitude,
        longitude: place.location?.longitude,
        rating: place.rating,
        priceLevel: place.priceLevel,
        pricePerNight: null,
        details: {
          image: place.photos?.[0]?.name ? `/api/photos/${encodeURIComponent(place.photos[0].name)}` : undefined,
          description: "Google Places does not provide live nightly rates, room types, amenities, or reviews.",
          address: place.formattedAddress || "",
          phone: place.nationalPhoneNumber || place.internationalPhoneNumber || "Not provided",
          checkIn: "Not provided",
          checkOut: "Not provided",
          cancellation: "Check the property website for current booking terms.",
          amenities: [],
          roomTypes: [],
          reviews: [],
        },
        phone: place.nationalPhoneNumber,
        websiteUri: place.websiteUri,
      }));
    cache[cacheKey] = { expiresAt: Date.now() + cacheTtl, value };
    await writeCache(cache);
    res.json({ data: value });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/photos/:photoName", async (req, res) => {
  if (!apiKey) return res.status(503).send("Google Places is not configured");
  const photoName = decodeURIComponent(req.params.photoName);
  const response = await fetch(`https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=800&key=${encodeURIComponent(apiKey)}`);
  if (!response.ok) return res.status(response.status).send(await response.text());
  const contentType = response.headers.get("content-type") || "image/jpeg";
  res.set("Content-Type", contentType);
  res.set("Cache-Control", "public, max-age=86400");
  res.send(Buffer.from(await response.arrayBuffer()));
});

// ---------------------------------------------------------------
// WEATHER — Open-Meteo (no API key required)
// ---------------------------------------------------------------
const WEATHER_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const weatherCache = new Map();

// WMO weather codes → human readable + emoji
const WMO_CODES = {
  0:  { label: 'Clear sky',            icon: '☀️' },
  1:  { label: 'Mainly clear',         icon: '🌤️' },
  2:  { label: 'Partly cloudy',        icon: '⛅' },
  3:  { label: 'Overcast',             icon: '☁️' },
  45: { label: 'Fog',                  icon: '🌫️' },
  48: { label: 'Depositing rime fog',  icon: '🌫️' },
  51: { label: 'Light drizzle',        icon: '🌦️' },
  53: { label: 'Moderate drizzle',     icon: '🌦️' },
  55: { label: 'Dense drizzle',        icon: '🌧️' },
  61: { label: 'Slight rain',          icon: '🌧️' },
  63: { label: 'Moderate rain',        icon: '🌧️' },
  65: { label: 'Heavy rain',           icon: '🌧️' },
  71: { label: 'Slight snow',          icon: '🌨️' },
  73: { label: 'Moderate snow',        icon: '🌨️' },
  75: { label: 'Heavy snow',           icon: '❄️' },
  80: { label: 'Rain showers',         icon: '🌦️' },
  81: { label: 'Moderate showers',     icon: '🌧️' },
  82: { label: 'Violent showers',      icon: '⛈️' },
  95: { label: 'Thunderstorm',         icon: '⛈️' },
  96: { label: 'Thunderstorm + hail',  icon: '⛈️' },
  99: { label: 'Thunderstorm + heavy hail', icon: '⛈️' },
};

function describeWeatherCode(code) {
  return WMO_CODES[code] || { label: 'Unknown', icon: '❓' };
}

app.get('/api/weather', async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    if (
      !Number.isFinite(lat) || !Number.isFinite(lng) ||
      lat < -90 || lat > 90 || lng < -180 || lng > 180
    ) {
      return res.status(400).json({ error: 'Valid lat and lng are required' });
    }

    const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`;
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.time < WEATHER_CACHE_TTL_MS) {
      return res.json({ data: cached.value, cached: true });
    }

    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lng));
    url.searchParams.set(
      'current',
      'temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,apparent_temperature'
    );
    url.searchParams.set('hourly', 'temperature_2m,weather_code');
    url.searchParams.set('forecast_days', '2');
    url.searchParams.set('timezone', 'auto');

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({
        error: `Open-Meteo returned ${response.status}`,
      });
    }
    const payload = await response.json();

    const current = payload.current || {};
    const hourly = payload.hourly || { times: [], temperature_2m: [], weather_code: [] };

    // Build next ~12 hourly slots starting from "now"
    const nowIso = current.time || new Date().toISOString().slice(0, 16);
    const times = hourly.time || [];
    const startIdx = Math.max(0, times.findIndex((t) => t >= nowIso));

    const nextHours = times
      .slice(startIdx, startIdx + 12)
      .map((time, i) => {
        const idx = startIdx + i;
        const code = hourly.weather_code?.[idx];
        const desc = describeWeatherCode(code);
        return {
          time,
          temp: Math.round(hourly.temperature_2m?.[idx] ?? 0),
          weatherCode: code,
          label: desc.label,
          icon: desc.icon,
        };
      });

    const currentDesc = describeWeatherCode(current.weather_code);

    const weather = {
      timezone: payload.timezone,
      current: {
        temp: Math.round(current.temperature_2m ?? 0),
        feelsLike: Math.round(current.apparent_temperature ?? 0),
        humidity: current.relative_humidity_2m ?? 0,
        windSpeed: current.wind_speed_10m ?? 0,
        weatherCode: current.weather_code,
        label: currentDesc.label,
        icon: currentDesc.icon,
        time: current.time,
      },
      hourly: nextHours,
    };

    weatherCache.set(cacheKey, { value: weather, time: Date.now() });
    return res.json({ data: weather });
  } catch (error) {
    console.error('Weather request failed:', error);
    return res.status(500).json({ error: error.message || 'Weather lookup failed' });
  }
});

// ---------------------------------------------------------------
// DIRECTIONS — Google Maps deep link builder (no cost)
// ---------------------------------------------------------------
app.get('/api/directions', (req, res) => {
  const toLat = Number(req.query.toLat);
  const toLng = Number(req.query.toLng);
  const toName = String(req.query.toName || 'Destination');
  const fromLat = Number(req.query.fromLat);
  const fromLng = Number(req.query.fromLng);
  const mode = ['driving', 'walking', 'bicycling', 'transit'].includes(
    String(req.query.mode)
  )
    ? String(req.query.mode)
    : 'driving';

  if (
    !Number.isFinite(toLat) || !Number.isFinite(toLng) ||
    toLat < -90 || toLat > 90 || toLng < -180 || toLng > 180
  ) {
    return res.status(400).json({ error: 'Valid toLat and toLng are required' });
  }

  const destination = `${toLat},${toLng}`;
  const url = new URL('https://www.google.com/maps/dir/');
  url.searchParams.set('api', '1');
  url.searchParams.set('destination', destination);
  url.searchParams.set('travelmode', mode);
  // Add destination name as a hint for the maps app
  if (Number.isFinite(fromLat) && Number.isFinite(fromLng)) {
    url.searchParams.set('origin', `${fromLat},${fromLng}`);
  }

  return res.json({
    url: url.toString(),
    destination: { name: toName, lat: toLat, lng: toLng },
    mode,
  });
});

app.listen(port, () => console.log(`Planner API listening on http://localhost:${port}`));