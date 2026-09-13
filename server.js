const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const HOTEL_API_PROVIDER = process.env.HOTEL_API_PROVIDER || "none";
const HOTEL_API_KEY = process.env.HOTEL_API_KEY || "";
const HOTEL_API_SECRET = process.env.HOTEL_API_SECRET || "";
const HOTEL_API_BASE_URL = process.env.HOTEL_API_BASE_URL || "";
const HOTEL_API_TOKEN_URL = process.env.HOTEL_API_TOKEN_URL || "";
const HOTEL_API_HOST = process.env.HOTEL_API_HOST || "";
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || "";
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || "";
const EMAILJS_OTP_TEMPLATE_ID = process.env.EMAILJS_OTP_TEMPLATE_ID || "";
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || "";
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || "";
const AMADEUS_API_BASE_URL = process.env.AMADEUS_API_BASE_URL || "https://test.api.amadeus.com";
const AMADEUS_AUTH_URL = process.env.AMADEUS_AUTH_URL || `${AMADEUS_API_BASE_URL}/v1/security/oauth2/token`;
let amadeusToken = null;

app.use(cors());
app.use(express.json({ limit: "32kb" }));

// Log every request so you can see in the terminal whether the phone is even reaching this server.
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const BASE_PLACE_URL = "https://maps.googleapis.com/maps/api/place";
const APP_DATA_FILE = path.join(__dirname, "data", "app-data.json");

function readAppData() {
  try {
    return JSON.parse(fs.readFileSync(APP_DATA_FILE, "utf8"));
  } catch {
    return { users: [] };
  }
}

function writeAppData(data) {
  fs.mkdirSync(path.dirname(APP_DATA_FILE), { recursive: true });
  const tempFile = `${APP_DATA_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tempFile, APP_DATA_FILE);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, expected] = String(storedHash || "").split(":");
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString("hex");
  return actual.length === expected.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

function hashToken(token) {
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function getRequestOrigin(req) {
  return process.env.APP_BASE_URL || req.get("origin") || "http://localhost:8081";
}

async function sendEmailJsTemplate({ templateId, templateParams }) {
  if (!EMAILJS_SERVICE_ID || !templateId || !EMAILJS_PUBLIC_KEY) {
    throw new Error("EmailJS is missing EMAILJS_PUBLIC_KEY. Add it to .env and restart the server.");
  }

  const body = {
    service_id: EMAILJS_SERVICE_ID,
    template_id: templateId,
    user_id: EMAILJS_PUBLIC_KEY,
    template_params: templateParams,
  };

  if (EMAILJS_PRIVATE_KEY) {
    body.accessToken = EMAILJS_PRIVATE_KEY;
  }

  const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(message || "EmailJS could not send the password reset email.");
  }
}

async function sendPasswordResetEmail({ user, resetLink }) {
  await sendEmailJsTemplate({
    templateId: EMAILJS_TEMPLATE_ID,
    templateParams: {
      to_email: user.email,
      user_email: user.email,
      email: user.email,
      to_name: user.firstName,
      name: user.firstName,
      reset_link: resetLink,
      link: resetLink,
      app_name: "ALL-IN-ONE-PLANNER",
    },
  });
}

async function sendLoginOtpEmail({ user, otp }) {
  await sendEmailJsTemplate({
    templateId: EMAILJS_OTP_TEMPLATE_ID,
    templateParams: {
      to_email: user.email,
      user_email: user.email,
      email: user.email,
      to_name: user.firstName,
      name: user.firstName,
      otp_code: otp,
      code: otp,
      app_name: "ALL-IN-ONE-PLANNER",
    },
  });
}

function publicUser(user) {
  return { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email, nationality: user.nationality };
}

function hotelApiEnabled() {
  if (HOTEL_API_PROVIDER.toLowerCase() === "amadeus") {
    return Boolean(HOTEL_API_KEY && HOTEL_API_SECRET);
  }
  return HOTEL_API_PROVIDER !== "none" && Boolean(HOTEL_API_BASE_URL);
}

async function getAmadeusToken() {
  if (!HOTEL_API_KEY || !HOTEL_API_SECRET) return null;
  if (amadeusToken && amadeusToken.expiresAt > Date.now() + 60000) return amadeusToken.value;

  const response = await fetch(AMADEUS_AUTH_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: HOTEL_API_KEY,
      client_secret: HOTEL_API_SECRET,
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || "Amadeus authentication failed");
  }
  amadeusToken = {
    value: data.access_token,
    expiresAt: Date.now() + Number(data.expires_in || 1800) * 1000,
  };
  return data.access_token;
}

function mapHotelResults(payload) {
  const items = Array.isArray(payload?.hotels)
    ? payload.hotels
    : Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload?.data)
        ? payload.data
        : [];

  return items.slice(0, 10).map((hotel, index) => {
    const hotelInfo = hotel.hotel || hotel;
    const offer = hotel.offers?.[0] || hotel.offer || hotel;
    const priceValue = Number(
      hotel.pricePerNight ?? hotel.price ?? hotel.total_price ?? hotel.amount ??
      offer.price?.variations?.average?.base ?? offer.price?.total ?? offer.price?.base ??
      offer.ratePlan?.price?.amount ?? 1500
    );
    const numberOfNights = Number(hotel.numberOfNights || 1);
    const price = Number.isFinite(priceValue) ? priceValue / Math.max(numberOfNights, 1) : 1500;
    const addressValue = typeof hotelInfo.address === "string"
      ? hotelInfo.address
      : hotelInfo.address?.lines?.join(", ") || hotelInfo.cityCode || hotel.location || "South Africa";
    const amenities = Array.isArray(hotelInfo.amenities) && hotelInfo.amenities.length > 0
      ? hotelInfo.amenities
      : ["Wi-Fi", "Housekeeping"];
    const roomName = offer.room?.typeEstimated?.category || offer.room?.type || "Standard room";
    const roomPrice = Number(offer.price?.total || offer.price?.base || price);
    const name = hotelInfo.name || hotel.name || hotel.hotel_name || hotel.title || `Hotel ${index + 1}`;
    const rating = Number(hotelInfo.rating ?? hotel.rating ?? hotel.starRating ?? 4.1);

    return {
      id: hotelInfo.hotelId || hotelInfo.hotel_id || hotel.id || hotel.hotel_id || hotel.hotelId || `hotel-${index}`,
      name,
      type: hotelInfo.type || hotel.type || hotel.category || "Hotel",
      pricePerNight: Number.isFinite(price) ? price : 1500,
      distanceKm: Number(hotel.distanceKm ?? hotel.distance ?? hotel.distance_km ?? 0),
      rating: Number.isFinite(rating) ? rating : 4.1,
      peakDouble: true,
      localFav: Boolean(hotel.localFav) || index === 0,
      details: {
        image: hotelInfo.image || hotel.image || hotel.photo || hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80",
        description: hotelInfo.description || "Live accommodation offer from Amadeus.",
        address: addressValue,
        phone: hotelInfo.phone || hotel.phone || "Contact provider for booking details",
        checkIn: hotel.checkIn || "14:00",
        checkOut: hotel.checkOut || "10:00",
        cancellation: offer.policies?.cancellations?.[0]?.description || "Cancellation terms vary by provider.",
        amenities,
        roomTypes: hotel.roomTypes || [{
          name: roomName,
          pricePerNight: Number.isFinite(roomPrice) ? roomPrice / Math.max(numberOfNights, 1) : price,
          sleeps: Number(offer.guests?.adults || 2),
          beds: offer.room?.description?.text || "Contact provider for bed details",
        },
        ],
        reviews: hotel.reviews || [],
      },
    };
  });
}

async function fetchAmadeusHotelOffers(lat, lng, { checkInDate, checkOutDate, adults, roomQuantity } = {}) {
  if (!hotelApiEnabled()) return [];
  const token = await getAmadeusToken();
  const listUrl = new URL(`${AMADEUS_API_BASE_URL}/v1/reference-data/locations/hotels/by-geocode`);
  listUrl.searchParams.set("latitude", String(lat));
  listUrl.searchParams.set("longitude", String(lng));
  listUrl.searchParams.set("radius", "20");
  listUrl.searchParams.set("radiusUnit", "KM");
  listUrl.searchParams.set("hotelSource", "ALL");
  const listResponse = await fetch(listUrl, { headers: { Accept: "application/vnd.amadeus+json", Authorization: `Bearer ${token}` } });
  const listPayload = await listResponse.json();
  if (!listResponse.ok) throw new Error(listPayload.errors?.[0]?.detail || "Amadeus hotel list request failed");

  const hotelIds = (listPayload.data || []).map((hotel) => hotel.hotelId).filter(Boolean).slice(0, 20);
  if (hotelIds.length === 0) return [];

  const offersUrl = new URL(`${AMADEUS_API_BASE_URL}/v3/shopping/hotel-offers`);
  offersUrl.searchParams.set("hotelIds", hotelIds.join(","));
  offersUrl.searchParams.set("adults", String(adults));
  offersUrl.searchParams.set("roomQuantity", String(roomQuantity));
  offersUrl.searchParams.set("checkInDate", checkInDate);
  offersUrl.searchParams.set("checkOutDate", checkOutDate);
  offersUrl.searchParams.set("paymentPolicy", "NONE");
  offersUrl.searchParams.set("bestRateOnly", "true");
  const offersResponse = await fetch(offersUrl, { headers: { Accept: "application/vnd.amadeus+json", Authorization: `Bearer ${token}` } });
  const offersPayload = await offersResponse.json();
  if (!offersResponse.ok) throw new Error(offersPayload.errors?.[0]?.detail || "Amadeus hotel offers request failed");

  return mapHotelResults((offersPayload.data || []).map((hotel) => ({
    ...hotel,
    numberOfNights: Math.max(1, Math.round((new Date(checkOutDate) - new Date(checkInDate)) / 86400000)),
    distanceKm: Number(hotel.hotel?.distance?.value || 0),
  })));
}

async function fetchHotelOffers(lat, lng, options = {}) {
  if (HOTEL_API_PROVIDER.toLowerCase() === "amadeus") {
    return fetchAmadeusHotelOffers(lat, lng, options);
  }
  if (!hotelApiEnabled()) return [];

  let url;
  try {
    url = new URL(HOTEL_API_BASE_URL);
  } catch {
    return [];
  }
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lng));
  url.searchParams.set("radius", "10");

  const headers = { Accept: "application/json" };
  if (HOTEL_API_KEY) headers["x-api-key"] = HOTEL_API_KEY;
  if (HOTEL_API_HOST) headers.Host = HOTEL_API_HOST;

  if (HOTEL_API_PROVIDER.toLowerCase() === "amadeus") {
    const tokenData = await getAmadeusToken();
    if (tokenData?.access_token) headers.Authorization = `Bearer ${tokenData.access_token}`;
  } else if (HOTEL_API_KEY) {
    headers.Authorization = `Bearer ${HOTEL_API_KEY}`;
  }

  try {
    const response = await fetch(url.toString(), { headers });
    const data = await response.json();
    if (!response.ok) {
      console.warn("Hotel provider request failed:", data);
      return [];
    }
    return mapHotelResults(data);
  } catch (error) {
    console.warn("Hotel provider error:", error.message);
    return [];
  }
}

function buildPhotoUrl(reference) {
  if (!reference) return "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80";
  return `${BASE_PLACE_URL}/photo?maxwidth=1200&photo_reference=${encodeURIComponent(reference)}&key=${GOOGLE_PLACES_API_KEY}`;
}

function normalizeCategory(types = []) {
  const typeSet = new Set(types.map((t) => t.toLowerCase()));
  if (["park", "zoo", "national_park", "campground", "wildlife_park", "tourist_attraction"].some((t) => typeSet.has(t))) return "Wildlife";
  if (["beach", "coast", "ocean", "sea", "marina", "harbor"].some((t) => typeSet.has(t))) return "Coast";
  if (["mountain", "hiking_area", "mountain_range", "natural_feature"].some((t) => typeSet.has(t))) return "Mountains";
  return "City";
}

function inferDescription(place) {
  return place.editorial_summary?.overview || `Explore ${place.name} in South Africa and enjoy nearby stays and activities.`;
}

function getPriceFromLevel(level) {
  const map = { 0: 500, 1: 1200, 2: 2200, 3: 4200, 4: 7800 };
  return map[level] ?? 1800;
}

function createAccommodation(place, index) {
  return {
    id: `${place.place_id || "accom"}-${index}`,
    name: place.name,
    type: place.types?.[0] || "Accommodation",
    pricePerNight: getPriceFromLevel(place.price_level ?? 1),
    distanceKm: Number((Math.random() * 8 + 1).toFixed(1)),
    rating: Number((place.rating || 4.2).toFixed(1)),
    peakDouble: true,
    localFav: index % 3 === 0,
    details: {
      image: buildPhotoUrl(place.photos?.[0]?.photo_reference),
      description: `A convenient stay near ${place.name} with easy access to the destination and surrounding activities.`,
      address: place.formatted_address || "South Africa",
      phone: place.formatted_phone_number || "Call ahead for booking details",
      checkIn: "14:00",
      checkOut: "10:00",
      cancellation: "Flexible cancellation available on selected rooms.",
      amenities: ["Wi-Fi", "Parking", "Breakfast", "Local tours", "Housekeeping"],
      roomTypes: [
        { name: "Standard room", pricePerNight: getPriceFromLevel(place.price_level ?? 1), sleeps: 2, beds: "1 queen bed" },
        { name: "Twin room", pricePerNight: getPriceFromLevel(place.price_level ?? 1) + 400, sleeps: 2, beds: "2 single beds" },
      ],
      reviews: [{ author: "Traveller", rating: 4, text: "Good base for exploring the area and nearby sights." }],
    },
  };
}

function createActivities(place) {
  return [
    { id: `${place.place_id}-activity-1`, name: "Scenic viewpoint walk", pricePerPerson: 260, duration: "1.5 hrs", peakDouble: false, localFav: true },
    { id: `${place.place_id}-activity-2`, name: "Guided local tour", pricePerPerson: 620, duration: "2.5 hrs", peakDouble: true, localFav: false },
    { id: `${place.place_id}-activity-3`, name: "Sunset lookout", pricePerPerson: 180, duration: "1 hr", peakDouble: false, localFav: false },
  ];
}

async function fetchJson(url) {
  const response = await fetch(url);
  const data = await response.json();
  if (data.status && data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    // Surface Google's real reason (e.g. REQUEST_DENIED, OVER_QUERY_LIMIT) instead of a generic failure.
    throw new Error(`${data.status}: ${data.error_message || "Google Places API error"}`);
  }
  return data;
}

async function fetchNearbyLodging(lat, lng, placeId) {
  const hotelOffers = hotelApiEnabled() ? await fetchHotelOffers(lat, lng) : [];
  if (hotelOffers.length > 0) return hotelOffers;

  const nearbyUrl = `${BASE_PLACE_URL}/nearbysearch/json?location=${lat},${lng}&radius=8000&type=lodging&key=${GOOGLE_PLACES_API_KEY}`;
  const nearbyData = await fetchJson(nearbyUrl);

  return (nearbyData.results || [])
    .filter((entry) => entry.place_id !== placeId)
    .slice(0, 3)
    .map((hotel, index) => createAccommodation(hotel, index));
}

async function fetchGoogleHotelOffers(lat, lng, placeId) {
  if (!GOOGLE_PLACES_API_KEY) return [];

  const nearbyUrl = `${BASE_PLACE_URL}/nearbysearch/json?location=${lat},${lng}&radius=20000&type=lodging&key=${GOOGLE_PLACES_API_KEY}`;
  const nearbyData = await fetchJson(nearbyUrl);

  return (nearbyData.results || [])
    .filter((entry) => entry.place_id !== placeId)
    .slice(0, 10)
    .map((hotel, index) => createAccommodation(hotel, index));
}

async function enrichPlace(place) {
  const photo = place.photos?.[0]?.photo_reference;
  let nearby = [];
  try {
    nearby = await fetchNearbyLodging(place.geometry?.location?.lat, place.geometry?.location?.lng, place.place_id);
  } catch (error) {
    console.warn(`Lodging lookup failed for ${place.name}:`, error.message);
  }

  return {
    id: place.place_id,
    name: place.name,
    location: place.formatted_address || "South Africa",
    category: normalizeCategory(place.types || []),
    image: buildPhotoUrl(photo),
    description: inferDescription(place),
    localFav: nearby.some((stay) => stay.localFav) || false,
    accommodations: nearby.length > 0 ? nearby : [
      {
        id: `${place.place_id}-fallback`,
        name: `${place.name} Stay`,
        type: "Lodging",
        pricePerNight: getPriceFromLevel(place.price_level ?? 1),
        distanceKm: 1.4,
        rating: Number((place.rating || 4.3).toFixed(1)),
        peakDouble: true,
        localFav: true,
        details: {
          image: buildPhotoUrl(photo),
          description: `Comfortable lodging near ${place.name} for travellers exploring South Africa.`,
          address: place.formatted_address || "South Africa",
          phone: "Available on arrival",
          checkIn: "14:00",
          checkOut: "10:00",
          cancellation: "Flexible cancellation available",
          amenities: ["Wi-Fi", "Parking", "Breakfast"],
          roomTypes: [{ name: "Standard room", pricePerNight: getPriceFromLevel(place.price_level ?? 1), sleeps: 2, beds: "1 queen bed" }],
          reviews: [{ author: "Traveller", rating: 4.3, text: "Perfect base for a day trip around the area." }],
        },
      },
    ],
    activities: createActivities(place),
  };
}

// Runs `fn` over `items` with at most `limit` calls in flight at once, instead of
// awaiting one at a time (which is what was making requests time out).
async function mapWithConcurrency(items, limit, fn) {
  const results = new Array(items.length);
  let cursor = 0;
  async function worker() {
    while (cursor < items.length) {
      const idx = cursor++;
      try {
        results[idx] = await fn(items[idx], idx);
      } catch (error) {
        console.warn("Enrichment failed for item", idx, error.message);
        results[idx] = null;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results.filter(Boolean);
}

// Broader default coverage across provinces/categories. Each of these runs as a
// separate Google Text Search — they're now fetched in parallel (see Promise.all below).
const DEFAULT_QUERIES = [
  "tourist attractions in South Africa",
  "national parks and game reserves in South Africa",
  "mountains and hiking trails in South Africa",
  "beaches and coastal towns in South Africa",
  "museums and city landmarks in South Africa",
  "wildlife reserves in South Africa",
  "waterfalls and nature reserves in South Africa",
  "historic sites in South Africa",
];

async function textSearchWithPaging(query, maxPages = 2) {
  const results = [];
  let pageToken;
  for (let page = 0; page < maxPages; page++) {
    const url = pageToken
      ? `${BASE_PLACE_URL}/textsearch/json?pagetoken=${pageToken}&key=${GOOGLE_PLACES_API_KEY}`
      : `${BASE_PLACE_URL}/textsearch/json?query=${encodeURIComponent(query)}&region=za&language=en&key=${GOOGLE_PLACES_API_KEY}`;
    const data = await fetchJson(url);
    results.push(...(data.results || []));
    pageToken = data.next_page_token;
    if (!pageToken) break;
    // Google requires a short delay before a next_page_token becomes valid.
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  return results;
}

async function searchSouthAfricaPlaces(query, category) {
  const queries = query
    ? [`${query} South Africa`, `${query} South Africa attractions`]
    : DEFAULT_QUERIES;

  const perQueryResults = await Promise.all(
    queries.map((q) => textSearchWithPaging(q, query ? 2 : 1).catch((error) => {
      console.warn(`Query failed: "${q}" ->`, error.message);
      return [];
    }))
  );

  const seen = new Set();
  const results = [];
  for (const places of perQueryResults) {
    for (const place of places) {
      if (!place.geometry?.location) continue;
      if (!place.formatted_address || !place.formatted_address.toLowerCase().includes("south africa")) continue;
      if (category && category !== "All" && normalizeCategory(place.types || []) !== category) continue;
      const key = place.place_id || `${place.name}-${place.formatted_address}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push(place);
      }
    }
  }
  return results;
}

// Simple in-memory cache so identical requests (e.g. re-opening the home screen,
// or a slider tick that lands back on the same budget) don't re-hit Google every time.
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map();

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.time > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function setCached(key, value) {
  cache.set(key, { value, time: Date.now() });
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Places API server is running", hotelProvider: HOTEL_API_PROVIDER, hasGoogleKey: Boolean(GOOGLE_PLACES_API_KEY) });
});

app.get("/api/hotels", async (req, res) => {
  try {
    const lat = Number(req.query.lat || 0);
    const lng = Number(req.query.lng || 0);
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ error: "lat and lng are required" });
    }
    const today = new Date();
    const defaultCheckIn = new Date(today.getTime() + 86400000 * 7).toISOString().slice(0, 10);
    const defaultCheckOut = new Date(today.getTime() + 86400000 * 9).toISOString().slice(0, 10);
    const checkInDate = String(req.query.checkInDate || defaultCheckIn);
    const checkOutDate = String(req.query.checkOutDate || defaultCheckOut);
    const adults = Number(req.query.adults || 2);
    const roomQuantity = Number(req.query.roomQuantity || 1);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(checkInDate) || !/^\d{4}-\d{2}-\d{2}$/.test(checkOutDate) || checkOutDate <= checkInDate) {
      return res.status(400).json({ error: "Use valid check-in and check-out dates" });
    }
    if (!Number.isInteger(adults) || adults < 1 || adults > 9 || !Number.isInteger(roomQuantity) || roomQuantity < 1 || roomQuantity > 5) {
      return res.status(400).json({ error: "Adults or room quantity is outside the supported range" });
    }
    let hotels = await fetchHotelOffers(lat, lng, { checkInDate, checkOutDate, adults, roomQuantity });
    if (hotels.length === 0) {
      hotels = await fetchGoogleHotelOffers(lat, lng);
    }
    return res.json({ hotels });
  } catch (error) {
    return res.status(500).json({ error: error.message || "Hotel provider request failed" });
  }
});

app.get("/api/attractions", async (req, res) => {
  try {
    if (!GOOGLE_PLACES_API_KEY) {
      return res.status(500).json({
        error: "Missing GOOGLE_PLACES_API_KEY. Add it to your .env file in the backend project root and restart the server.",
      });
    }

    const query = (req.query.query || "").toString().trim().slice(0, 100);
    const category = (req.query.category || "All").toString();
    const budget = Number(req.query.budget || 8000);

    const allowedCategories = new Set(["All", "Wildlife", "Coast", "Mountains", "City"]);
    if (!allowedCategories.has(category)) {
      return res.status(400).json({ error: "Invalid attraction category" });
    }
    if (!Number.isFinite(budget) || budget < 0 || budget > 1000000) {
      return res.status(400).json({ error: "Budget must be between 0 and 1000000" });
    }

    const cacheKey = `${query}|${category}|${budget}`;
    const cached = getCached(cacheKey);
    if (cached) {
      console.log(`Serving cached result for "${cacheKey}"`);
      return res.json({ attractions: cached, cached: true });
    }

    const rawPlaces = await searchSouthAfricaPlaces(query, category);
    console.log(`Found ${rawPlaces.length} candidate places for "${cacheKey}"`);

    // Cap BEFORE enriching (not after) — enrichment does an extra Google call per
    // place, so enriching everything found is what was making requests crawl/time out.
    const candidates = rawPlaces.slice(0, 30);

    const enriched = await mapWithConcurrency(candidates, 5, (place) => enrichPlace(place));

    const withinBudget = enriched.filter((attraction) => {
      const cheapest = Math.min(...attraction.accommodations.map((room) => room.pricePerNight));
      return !Number.isFinite(budget) || cheapest <= budget;
    });

    const results = withinBudget.slice(0, 18);
    setCached(cacheKey, results);

    return res.json({ attractions: results });
  } catch (error) {
    console.error("‼️  /api/attractions failed:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch attractions from Google Places",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Places API server listening on http://0.0.0.0:${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
  console.log(`  From your phone, use your computer's LAN IP instead of localhost.`);
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn("⚠️  GOOGLE_PLACES_API_KEY is not set — /api/attractions will fail until you add it to .env");
  }
});

app.post("/api/auth/register", (req, res) => {
  const { firstName, lastName, email, nationality, password } = req.body || {};
  const cleanEmail = String(email || "").trim().toLowerCase();
  const data = readAppData();
  if (!firstName || !lastName || !cleanEmail || !nationality || !password) {
    return res.status(400).json({ errors: { form: "All account fields are required." } });
  }
  if (data.users.some((user) => user.email === cleanEmail)) {
    return res.status(409).json({ errors: { email: "An account with this email already exists. Please sign in." } });
  }
  const user = {
    id: crypto.randomUUID(),
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    email: cleanEmail,
    nationality: String(nationality).trim(),
    passwordHash: hashPassword(String(password)),
    createdAt: new Date().toISOString(),
  };
  data.users.push(user);
  writeAppData(data);
  return res.status(201).json({ user: publicUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const cleanEmail = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const data = readAppData();
  const user = data.users.find((entry) => entry.email === cleanEmail);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ errors: { form: "Email or password is incorrect." } });
  }

  const otp = String(crypto.randomInt(100000, 1000000));
  const challengeToken = crypto.randomBytes(24).toString("hex");
  user.loginOtpHash = hashToken(otp);
  user.loginOtpChallengeHash = hashToken(challengeToken);
  user.loginOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  user.loginOtpAttempts = 0;
  writeAppData(data);

  try {
    await sendLoginOtpEmail({ user, otp });
    return res.json({ otpRequired: true, challengeToken, email: cleanEmail });
  } catch (error) {
    user.loginOtpHash = undefined;
    user.loginOtpChallengeHash = undefined;
    user.loginOtpExpiresAt = undefined;
    user.loginOtpAttempts = undefined;
    writeAppData(data);
    return res.status(500).json({ errors: { form: error.message || "Could not send your sign-in code." } });
  }
});

app.post("/api/auth/login/verify-otp", (req, res) => {
  const cleanEmail = String(req.body?.email || "").trim().toLowerCase();
  const otp = String(req.body?.otp || "").replace(/\D/g, "");
  const challengeToken = String(req.body?.challengeToken || "");
  const data = readAppData();
  const user = data.users.find((entry) => entry.email === cleanEmail);

  if (
    !user ||
    !user.loginOtpHash ||
    !user.loginOtpChallengeHash ||
    !challengeToken ||
    hashToken(challengeToken) !== user.loginOtpChallengeHash
  ) {
    return res.status(400).json({ errors: { form: "This sign-in code request is invalid. Please sign in again." } });
  }

  if (!user.loginOtpExpiresAt || Date.now() > new Date(user.loginOtpExpiresAt).getTime()) {
    return res.status(400).json({ errors: { form: "This sign-in code has expired. Please sign in again." } });
  }

  if (Number(user.loginOtpAttempts || 0) >= 5) {
    return res.status(429).json({ errors: { form: "Too many incorrect codes. Please sign in again." } });
  }

  if (!/^\d{6}$/.test(otp) || hashToken(otp) !== user.loginOtpHash) {
    user.loginOtpAttempts = Number(user.loginOtpAttempts || 0) + 1;
    writeAppData(data);
    return res.status(401).json({ errors: { otp: "Enter the 6-digit code sent to your email." } });
  }

  user.loginOtpHash = undefined;
  user.loginOtpChallengeHash = undefined;
  user.loginOtpExpiresAt = undefined;
  user.loginOtpAttempts = undefined;
  writeAppData(data);
  return res.json({ user: publicUser(user) });
});

app.post("/api/auth/request-password-reset", async (req, res) => {
  const cleanEmail = String(req.body?.email || "").trim().toLowerCase();
  const data = readAppData();
  const user = data.users.find((entry) => entry.email === cleanEmail);

  if (!user) {
    return res.status(404).json({ errors: { email: "No account found with this email address." } });
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordTokenHash = hashToken(token);
  user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  writeAppData(data);

  const resetLink = `${getRequestOrigin(req).replace(/\/$/, "")}/?resetToken=${encodeURIComponent(token)}&email=${encodeURIComponent(cleanEmail)}`;

  try {
    await sendPasswordResetEmail({ user, resetLink });
    return res.json({ ok: true });
  } catch (error) {
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    writeAppData(data);
    return res.status(500).json({ errors: { form: error.message || "Could not send the password reset email." } });
  }
});

app.post("/api/auth/reset-password", (req, res) => {
  const cleanEmail = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const token = String(req.body?.token || "");
  const data = readAppData();
  const user = data.users.find((entry) => entry.email === cleanEmail);
  if (!user) return res.status(404).json({ errors: { email: "No account found with this email address." } });

  if (!token || !user.resetPasswordTokenHash || hashToken(token) !== user.resetPasswordTokenHash) {
    return res.status(400).json({ errors: { form: "This password reset link is invalid. Request a new reset link." } });
  }

  if (!user.resetPasswordExpiresAt || Date.now() > new Date(user.resetPasswordExpiresAt).getTime()) {
    return res.status(400).json({ errors: { form: "This password reset link has expired. Request a new reset link." } });
  }

  user.passwordHash = hashPassword(password);
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpiresAt = undefined;
  writeAppData(data);
  return res.json({ user: publicUser(user) });
});
