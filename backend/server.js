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

app.listen(port, () => console.log(`Planner API listening on http://localhost:${port}`));