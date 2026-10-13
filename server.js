const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const crypto = require("crypto");
const path = require("path");

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });
const {
  getRegistrationChallenge,
  getAuditEvents,
  getUser,
  getUsers,
  checkDatabase,
  recordAuditEvent,
  removeRegistrationChallenge,
  removeUser,
  saveRegistrationChallenge,
  saveUser,
} = require('./firestoreStore');

const app = express();
const PORT = process.env.PORT || 3001;
const GOOGLE_ROUTES_API_KEY = process.env.GOOGLE_ROUTES_API_KEY || '';
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const NOMINATIM_ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const NOMINATIM_USER_AGENT =
  'AllInOnePlanner/1.0 (South Africa travel planning app)';
const HOTEL_API_PROVIDER = process.env.HOTEL_API_PROVIDER || 'none';
const HOTEL_API_KEY = process.env.HOTEL_API_KEY || '';
const HOTEL_API_SECRET = process.env.HOTEL_API_SECRET || '';
const HOTEL_API_BASE_URL = process.env.HOTEL_API_BASE_URL || '';
const HOTEL_API_TOKEN_URL = process.env.HOTEL_API_TOKEN_URL || '';
const HOTEL_API_HOST = process.env.HOTEL_API_HOST || '';
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || '';
const EMAILJS_OTP_TEMPLATE_ID = process.env.EMAILJS_OTP_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || '';
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || '';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const AMADEUS_API_BASE_URL =
  process.env.AMADEUS_API_BASE_URL || 'https://test.api.amadeus.com';
const AMADEUS_AUTH_URL =
  process.env.AMADEUS_AUTH_URL ||
  `${AMADEUS_API_BASE_URL}/v1/security/oauth2/token`;
let amadeusToken = null;

app.use(cors());
app.use(express.json({ limit: '400kb' }));

// Log every request so you can see in the terminal whether the phone is even reaching this server.
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

const ROUTES_MATRIX_URL =
  'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix';
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
  const [salt, expected] = String(storedHash || '').split(':');
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(password, salt, 64).toString('hex');
  return (
    actual.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
  );
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

function ensureUserPlan(user) {
  if (!Array.isArray(user.dayPlan)) user.dayPlan = [];
  return user.dayPlan;
}

function isAdminEmail(email) {
  return String(email || '').trim().toLowerCase() === ADMIN_EMAIL;
}

function getRequestOrigin(req) {
  return (
    process.env.APP_BASE_URL || req.get('origin') || 'http://localhost:8081'
  );
}

async function sendEmailJsTemplate({ templateId, templateParams }) {
  if (!EMAILJS_SERVICE_ID || !templateId || !EMAILJS_PUBLIC_KEY) {
    throw new Error(
      'EmailJS is missing EMAILJS_PUBLIC_KEY. Add it to .env and restart the server.'
    );
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

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text().catch(() => '');
    throw new Error(
      message || 'EmailJS could not send the password reset email.'
    );
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
      app_name: 'ALL-IN-ONE-PLANNER',
    },
  });
}

async function sendLoginOtpEmail({ user, otp }) {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const timeString = expiresAt.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  await sendEmailJsTemplate({
    templateId: EMAILJS_OTP_TEMPLATE_ID,
    templateParams: {
      email: user.email,
      to_email: user.email,
      user_email: user.email,
      to_name: user.firstName,
      name: user.firstName,
      passcode: otp,
      otp_code: otp,
      code: otp,
      time: timeString,
      app_name: 'ALL-IN-ONE-PLANNER',
    },
  });
}

async function sendRegistrationOtpEmail({ email, firstName, otp }) {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const timeString = expiresAt.toLocaleTimeString('en-ZA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  await sendEmailJsTemplate({
    templateId: EMAILJS_OTP_TEMPLATE_ID,
    templateParams: {
      email,
      to_email: email,
      user_email: email,
      to_name: firstName,
      name: firstName,
      passcode: otp,
      otp_code: otp,
      code: otp,
      time: timeString,
      app_name: 'ALL-IN-ONE-PLANNER',
    },
  });
}

function publicUser(user) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    nationality: user.nationality,
    createdAt: user.createdAt,
    profilePhoto: user.profilePhoto || null,
    dayPlan: ensureUserPlan(user),
    isAdmin: isAdminEmail(user.email),
  };
}

function hotelApiEnabled() {
  if (HOTEL_API_PROVIDER.toLowerCase() === 'amadeus') {
    return Boolean(HOTEL_API_KEY && HOTEL_API_SECRET);
  }
  return HOTEL_API_PROVIDER !== 'none' && Boolean(HOTEL_API_BASE_URL);
}

async function getAmadeusToken() {
  if (!HOTEL_API_KEY || !HOTEL_API_SECRET) return null;
  if (amadeusToken && amadeusToken.expiresAt > Date.now() + 60000)
    return amadeusToken.value;

  const response = await fetch(AMADEUS_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: HOTEL_API_KEY,
      client_secret: HOTEL_API_SECRET,
    }),
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) {
    throw new Error(
      data.error_description || data.error || 'Amadeus authentication failed'
    );
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

  return items.map((hotel, index) => {
    const hotelInfo = hotel.hotel || hotel;
    const offer = hotel.offers?.[0] || hotel.offer || hotel;
    const numberOfNights = Math.max(1, Number(hotel.numberOfNights || 1));
    const nightlyPriceValue =
      hotel.pricePerNight ??
        hotel.price ??
        hotel.amount ??
        offer.price?.variations?.average?.base ??
        offer.ratePlan?.price?.amount;
    const totalPriceValue =
      hotel.total_price ?? offer.price?.total ?? offer.price?.base;
    const nightlyPrice =
      nightlyPriceValue == null || nightlyPriceValue === ''
        ? NaN
        : Number(nightlyPriceValue);
    const totalPrice =
      totalPriceValue == null || totalPriceValue === ''
        ? NaN
        : Number(totalPriceValue);
    const price = Number.isFinite(nightlyPrice)
      ? nightlyPrice
      : Number.isFinite(totalPrice)
        ? totalPrice / numberOfNights
        : null;
    const currency =
      offer.price?.currency || hotel.currency || hotelInfo.currency || 'ZAR';
    const addressValue =
      typeof hotelInfo.address === 'string'
        ? hotelInfo.address
        : hotelInfo.address?.lines?.join(', ') ||
          hotelInfo.cityCode ||
          hotel.location ||
          'South Africa';
    const amenities = Array.isArray(hotelInfo.amenities)
      ? hotelInfo.amenities
      : [];
    const roomName =
      offer.room?.typeEstimated?.category ||
      offer.room?.type ||
      'Room details not provided';
    const roomPrice = Number(offer.price?.total || offer.price?.base);
    const name =
      hotelInfo.name ||
      hotel.name ||
      hotel.hotel_name ||
      hotel.title ||
      `Hotel ${index + 1}`;
    const rating = Number(
      hotelInfo.rating ?? hotel.rating ?? hotel.starRating
    );
    const images = [
      hotelInfo.image,
      hotel.image,
      hotel.photo,
      ...(Array.isArray(hotel.images) ? hotel.images : []),
    ].filter((image) => typeof image === 'string' && /^https?:\/\//.test(image));

    return {
      id:
        hotelInfo.hotelId ||
        hotelInfo.hotel_id ||
        hotel.id ||
        hotel.hotel_id ||
        hotel.hotelId ||
        `hotel-${index}`,
      name,
      type: hotelInfo.type || hotel.type || hotel.category || 'Hotel',
      pricePerNight: Number.isFinite(price) ? price : null,
      currency,
      distanceKm: Number(
        hotel.distanceKm ?? hotel.distance ?? hotel.distance_km ?? 0
      ),
      latitude: Number(hotelInfo.geoCode?.latitude || hotelInfo.latitude) || null,
      longitude: Number(hotelInfo.geoCode?.longitude || hotelInfo.longitude) || null,
      rating: Number.isFinite(rating) ? rating : null,
      peakDouble: false,
      localFav: Boolean(hotel.localFav),
      source: hotel.source || HOTEL_API_PROVIDER,
      details: {
        images,
        image: images[0] || '',
        description:
          hotelInfo.description || '',
        address: addressValue,
        phone:
          hotelInfo.phone ||
          hotel.phone ||
          'Not provided by the accommodation provider',
        website:
          hotelInfo.website ||
          hotelInfo.websiteUri ||
          hotel.website ||
          hotel.websiteUri ||
          '',
        checkIn: hotel.checkIn || 'Check with property',
        checkOut: hotel.checkOut || 'Check with property',
        cancellation:
          offer.policies?.cancellations?.[0]?.description ||
          'Check the provider for cancellation terms.',
        amenities,
        roomTypes: hotel.roomTypes || (Number.isFinite(roomPrice) ? [{
            name: roomName,
            pricePerNight: roomPrice / numberOfNights,
            sleeps:
              Number.isInteger(Number(offer.guests?.adults)) &&
              Number(offer.guests.adults) > 0
                ? Number(offer.guests.adults)
                : null,
            beds:
              offer.room?.description?.text ||
              'Contact provider for bed details',
          }] : []),
        reviews: hotel.reviews || [],
      },
    };
  });
}

async function fetchAmadeusHotelOffers(
  lat,
  lng,
  { checkInDate, checkOutDate, adults, roomQuantity } = {}
) {
  if (!hotelApiEnabled()) return [];
  const token = await getAmadeusToken();
  const listUrl = new URL(
    `${AMADEUS_API_BASE_URL}/v1/reference-data/locations/hotels/by-geocode`
  );
  listUrl.searchParams.set('latitude', String(lat));
  listUrl.searchParams.set('longitude', String(lng));
  listUrl.searchParams.set('radius', '20');
  listUrl.searchParams.set('radiusUnit', 'KM');
  listUrl.searchParams.set('hotelSource', 'ALL');
  const listResponse = await fetch(listUrl, {
    headers: {
      Accept: 'application/vnd.amadeus+json',
      Authorization: `Bearer ${token}`,
    },
  });
  const listPayload = await listResponse.json();
  if (!listResponse.ok)
    throw new Error(
      listPayload.errors?.[0]?.detail || 'Amadeus hotel list request failed'
    );

  const hotelIds = (listPayload.data || [])
    .map((hotel) => hotel.hotelId)
    .filter(Boolean)
    .slice(0, 20);
  if (hotelIds.length === 0) return [];

  const offersUrl = new URL(`${AMADEUS_API_BASE_URL}/v3/shopping/hotel-offers`);
  offersUrl.searchParams.set('hotelIds', hotelIds.join(','));
  offersUrl.searchParams.set('adults', String(adults));
  offersUrl.searchParams.set('roomQuantity', String(roomQuantity));
  offersUrl.searchParams.set('checkInDate', checkInDate);
  offersUrl.searchParams.set('checkOutDate', checkOutDate);
  offersUrl.searchParams.set('paymentPolicy', 'NONE');
  offersUrl.searchParams.set('bestRateOnly', 'true');
  const offersResponse = await fetch(offersUrl, {
    headers: {
      Accept: 'application/vnd.amadeus+json',
      Authorization: `Bearer ${token}`,
    },
  });
  const offersPayload = await offersResponse.json();
  if (!offersResponse.ok)
    throw new Error(
      offersPayload.errors?.[0]?.detail || 'Amadeus hotel offers request failed'
    );

  return mapHotelResults(
    (offersPayload.data || []).map((hotel) => ({
      ...hotel,
      numberOfNights: Math.max(
        1,
        Math.round((new Date(checkOutDate) - new Date(checkInDate)) / 86400000)
      ),
      distanceKm: Number(hotel.hotel?.distance?.value || 0),
    }))
  );
}

async function fetchHotelOffers(lat, lng, options = {}) {
  if (HOTEL_API_PROVIDER.toLowerCase() === 'amadeus') {
    return fetchAmadeusHotelOffers(lat, lng, options);
  }
  if (!hotelApiEnabled()) return [];

  let url;
  try {
    url = new URL(HOTEL_API_BASE_URL);
  } catch {
    return [];
  }
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set('radius', '10');

  const headers = { Accept: 'application/json' };
  if (HOTEL_API_KEY) headers['x-api-key'] = HOTEL_API_KEY;
  if (HOTEL_API_HOST) headers.Host = HOTEL_API_HOST;

  if (HOTEL_API_PROVIDER.toLowerCase() === 'amadeus') {
    const tokenData = await getAmadeusToken();
    if (tokenData?.access_token)
      headers.Authorization = `Bearer ${tokenData.access_token}`;
  } else if (HOTEL_API_KEY) {
    headers.Authorization = `Bearer ${HOTEL_API_KEY}`;
  }

  try {
    const response = await fetch(url.toString(), { headers });
    const data = await response.json();
    if (!response.ok) {
      console.warn('Hotel provider request failed:', data);
      return [];
    }
    return mapHotelResults(data);
  } catch (error) {
    console.warn('Hotel provider error:', error.message);
    return [];
  }
}

const overpassCategoryTags = {
  stay: ['tourism', '^(hotel|guest_house|hostel|motel|chalet|apartment|camp_site)$'],
  restaurant: ['amenity', '^(restaurant|cafe|fast_food)$'],
  fuel: ['amenity', '^fuel$'],
};

function distanceInKm(fromLat, fromLng, toLat, toLng) {
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(toLat - fromLat);
  const longitudeDelta = radians(toLng - fromLng);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(fromLat)) *
      Math.cos(radians(toLat)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return Number(
    (6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))).toFixed(1)
  );
}

function categoryForOsmElement(tags = {}) {
  if (tags.amenity === 'fuel') return 'fuel';
  if (['restaurant', 'cafe', 'fast_food'].includes(tags.amenity)) {
    return 'restaurant';
  }
  return Object.prototype.hasOwnProperty.call(tags, 'tourism') ? 'stay' : null;
}

function coordinatesForOsmElement(element) {
  const latitude = Number(element.lat ?? element.center?.lat);
  const longitude = Number(element.lon ?? element.center?.lon);
  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }
  return { latitude, longitude };
}

function mapOsmElement(element, attractionLatitude, attractionLongitude) {
  const tags = element.tags || {};
  const category = categoryForOsmElement(tags);
  const coordinates = coordinatesForOsmElement(element);
  if (!category || !coordinates) return null;

  const address = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'],
    tags['addr:city'] || tags['addr:town'] || tags['addr:village'],
  ]
    .filter(Boolean)
    .join(', ');
  const name = tags.name || tags['name:en'];
  return {
    id: `osm:${element.type}:${element.id}`,
    category,
    type:
      category === 'stay'
        ? tags.tourism.replaceAll('_', ' ')
        : tags.cuisine || tags.amenity.replaceAll('_', ' '),
    name: name || (category === 'fuel' ? 'Unnamed fuel stop' : 'Unnamed place'),
    address: address || 'Address not available in OpenStreetMap',
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    distanceFromAttractionKm: distanceInKm(
      attractionLatitude,
      attractionLongitude,
      coordinates.latitude,
      coordinates.longitude
    ),
    rating: null,
    reviewCount: null,
    priceLevel: null,
    priceLevelLabel: null,
    pricePerNight: null,
    currency: 'ZAR',
    phone: tags.phone || tags['contact:phone'] || '',
    website: tags.website || tags['contact:website'] || '',
    mapsQuery: `${name || ''} ${address}`.trim(),
    openingHours: tags.opening_hours ? [tags.opening_hours] : [],
    description: tags.description || '',
    image: '',
    source: 'OpenStreetMap',
    attribution: '© OpenStreetMap contributors',
  };
}

const overpassInFlight = new Map();

function fetchOverpassPlaces(latitude, longitude, category) {
  const key = `${latitude.toFixed(3)}|${longitude.toFixed(3)}|${category}`;
  const cacheKey = `openstreetmap-data|${key}`;
  const cachedPlaces = getCached(cacheKey);
  if (cachedPlaces) return Promise.resolve(cachedPlaces);

  const pendingRequest = overpassInFlight.get(key);
  if (pendingRequest) return pendingRequest;

  const request = queryOverpassPlaces(latitude, longitude, category);
  overpassInFlight.set(key, request);
  request.then(
    (places) => {
      setCached(cacheKey, places);
      overpassInFlight.delete(key);
    },
    () => overpassInFlight.delete(key)
  );
  return request;
}

async function queryOverpassPlaces(latitude, longitude, category) {
  const selectedCategories =
    category === 'all' ? Object.keys(overpassCategoryTags) : [category];
  const filters = selectedCategories.map((key) => {
    const [tag, expression] = overpassCategoryTags[key];
    return `nwr(around:3000,${latitude},${longitude})["${tag}"~"${expression}"];`;
  });
  const query = `[out:json][timeout:20];(${filters.join('')});out center 50;`;
  const errors = [];

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          Accept: 'application/json',
          'User-Agent': 'AllInOnePlanner/1.0',
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });
      const payload = await response.json();
      if (!response.ok) {
        errors.push(`${endpoint}: HTTP ${response.status}`);
        continue;
      }
      if (!Array.isArray(payload.elements)) {
        errors.push(`${endpoint}: invalid Overpass response`);
        continue;
      }

      return payload.elements
        .map((element) => mapOsmElement(element, latitude, longitude))
        .filter((place) => place && selectedCategories.includes(place.category))
        .sort(
          (left, right) =>
            left.distanceFromAttractionKm - right.distanceFromAttractionKm
        );
    } catch (error) {
      errors.push(
        error.name === 'AbortError'
          ? `${endpoint}: request timed out`
          : `${endpoint}: ${error.message}`
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw new Error(
    `OpenStreetMap search failed on the available Overpass servers. ${errors.join('; ')}`
  );
}

let nominatimLastRequestAt = 0;
let nominatimQueue = Promise.resolve();

function queueNominatimRequest(searchUrl) {
  const request = nominatimQueue.then(async () => {
    const waitMs = Math.max(0, 1000 - (Date.now() - nominatimLastRequestAt));
    if (waitMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
    nominatimLastRequestAt = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(searchUrl, {
        headers: {
          Accept: 'application/json',
          'User-Agent': NOMINATIM_USER_AGENT,
        },
        signal: controller.signal,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(
          payload.error ||
            `OpenStreetMap search failed (HTTP ${response.status})`
        );
      }
      if (!Array.isArray(payload)) {
        throw new Error('OpenStreetMap search returned an invalid response');
      }
      return payload;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('OpenStreetMap attraction search timed out');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  });
  nominatimQueue = request.then(
    () => undefined,
    () => undefined
  );
  return request;
}

function attractionCategory(result) {
  const details = `${result.class || ''} ${result.type || ''} ${
    result.display_name || ''
  }`.toLowerCase();
  if (/mountain|peak|volcano|cliff/.test(details)) return 'Mountains';
  if (/beach|coast|coastal|bay|ocean|harbour|cape/.test(details)) return 'Coast';
  if (/wildlife|zoo|national_park|nature_reserve|game_reserve|safari|park/.test(details)) {
    return 'Wildlife';
  }
  return 'City';
}

function attractionImageForCategory(category) {
  const images = {
    Wildlife:
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1000&h=650&fit=crop&auto=format',
    Mountains:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&h=650&fit=crop&auto=format',
    Coast:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&h=650&fit=crop&auto=format',
    City:
      'https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1000&h=650&fit=crop&auto=format',
  };
  return images[category];
}

function mapNominatimAttraction(result) {
  const latitude = Number(result.lat);
  const longitude = Number(result.lon);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    !result.osm_type ||
    result.osm_id == null
  ) {
    return null;
  }
  const category = attractionCategory(result);
  const name =
    result.name ||
    result.namedetails?.name ||
    result.display_name?.split(',')[0] ||
    'South Africa attraction';
  const addressParts = Object.values(result.address || {}).filter(Boolean);
  const location = addressParts.slice(1, 4).join(', ') || 'South Africa';
  return {
    id: `osm-attraction:${result.osm_type}:${result.osm_id}`,
    name,
    location,
    category,
    image: attractionImageForCategory(category),
    description:
      result.extratags?.description ||
      `${name} is a mapped OpenStreetMap result. Check the linked map for current visitor information.`,
    websiteUri: result.extratags?.website || result.extratags?.url || '',
    source: 'OpenStreetMap',
    localFav: false,
    rating: null,
    map: {
      latitude,
      longitude,
      mapQuery: `${latitude},${longitude}`,
    },
    accommodations: [],
    activities: [],
    osmAttribution: '© OpenStreetMap contributors',
  };
}

async function searchOsmAttractions(query, category) {
  const searchUrl = new URL(NOMINATIM_ENDPOINT);
  const categoryTerms = {
    Wildlife: 'wildlife reserve national park',
    Coast: 'coast beach',
    Mountains: 'mountain',
    City: 'museum landmark',
  };
  searchUrl.searchParams.set(
    'q',
    `${query || categoryTerms[category] || 'tourist attraction'} South Africa`
  );
  searchUrl.searchParams.set('countrycodes', 'za');
  searchUrl.searchParams.set('format', 'jsonv2');
  searchUrl.searchParams.set('addressdetails', '1');
  searchUrl.searchParams.set('extratags', '1');
  searchUrl.searchParams.set('namedetails', '1');
  searchUrl.searchParams.set('limit', '10');

  const cacheKey = `nominatim-attractions|${query.toLowerCase()}|${category}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const results = (await queueNominatimRequest(searchUrl))
    .map(mapNominatimAttraction)
    .filter((attraction) => attraction)
    .filter((attraction) => category === 'All' || attraction.category === category);
  setCached(cacheKey, results);
  return results;
}

function toRouteWaypoint(latitude, longitude) {
  return {
    waypoint: {
      location: {
        latLng: {
          latitude: Number(latitude),
          longitude: Number(longitude),
        },
      },
    },
  };
}

async function fetchGoogleRouteMatrix(origins, destinations) {
  if (!GOOGLE_ROUTES_API_KEY) {
    throw new Error('GOOGLE_ROUTES_API_KEY is not configured');
  }
  const response = await fetch(ROUTES_MATRIX_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_ROUTES_API_KEY,
      'X-Goog-FieldMask':
        'originIndex,destinationIndex,distanceMeters,duration,status,condition',
    },
    body: JSON.stringify({
      origins: origins.map(({ latitude, longitude }) =>
        toRouteWaypoint(latitude, longitude)
      ),
      destinations: destinations.map(({ latitude, longitude }) =>
        toRouteWaypoint(latitude, longitude)
      ),
      travelMode: 'DRIVE',
      routingPreference: 'TRAFFIC_AWARE',
    }),
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 403 || data.error?.status === 'PERMISSION_DENIED') {
      throw new Error(
        'Google denied Routes API access. Enable Routes API, confirm billing is active, and check that the API key restrictions allow it.'
      );
    }
    throw new Error(
      data.error?.message ||
        `Routes API distance matrix failed (HTTP ${response.status})`
    );
  }
  if (!Array.isArray(data)) {
    throw new Error('Routes API returned an invalid distance matrix');
  }
  return data;
}

function routeSummary(element) {
  if (
    element.status?.code != null &&
    element.status.code !== 0
  ) {
    return null;
  }
  if (!Number.isFinite(element.distanceMeters)) return null;
  return {
    distanceMeters: element.distanceMeters,
    duration: element.duration || null,
  };
}

// Short-lived cache for public map and weather requests.
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

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    message: 'Planner API server is running',
    hotelProvider: HOTEL_API_PROVIDER,
    routesConfigured: Boolean(GOOGLE_ROUTES_API_KEY),
  });
});

app.get('/api/weather', async (req, res) => {
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lng);
  const days = Number(req.query.days || 7);
  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return res.status(400).json({ error: 'Valid lat and lng coordinates are required' });
  }
  if (!Number.isInteger(days) || days < 1 || days > 7) {
    return res.status(400).json({ error: 'days must be an integer from 1 to 7' });
  }

  const cacheKey = `weather|${latitude.toFixed(3)}|${longitude.toFixed(3)}|${days}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json(cached);

  const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
  weatherUrl.searchParams.set('latitude', String(latitude));
  weatherUrl.searchParams.set('longitude', String(longitude));
  weatherUrl.searchParams.set('daily', [
    'weather_code',
    'temperature_2m_max',
    'temperature_2m_min',
    'precipitation_probability_max',
    'wind_speed_10m_max',
  ].join(','));
  weatherUrl.searchParams.set('forecast_days', String(days));
  weatherUrl.searchParams.set('timezone', 'auto');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  try {
    const response = await fetch(weatherUrl, { signal: controller.signal });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(
        payload.reason || `Weather provider returned HTTP ${response.status}`
      );
    }
    const daily = payload.daily;
    if (
      !Array.isArray(daily?.time) ||
      !Array.isArray(daily?.weather_code) ||
      !Array.isArray(daily?.temperature_2m_max) ||
      !Array.isArray(daily?.temperature_2m_min)
    ) {
      throw new Error('Weather provider returned an incomplete forecast');
    }
    const forecast = {
      timezone: payload.timezone,
      days: daily.time.map((date, index) => ({
        date,
        weatherCode: daily.weather_code[index],
        maxTemperatureC: daily.temperature_2m_max[index],
        minTemperatureC: daily.temperature_2m_min[index],
        precipitationChance: daily.precipitation_probability_max?.[index] ?? null,
        windSpeedKmh: daily.wind_speed_10m_max?.[index] ?? null,
      })),
    };
    setCached(cacheKey, forecast);
    return res.json(forecast);
  } catch (error) {
    const message = error.name === 'AbortError'
      ? 'Weather provider request timed out'
      : error.message || 'Weather provider request failed';
    return res.status(502).json({ error: message });
  } finally {
    clearTimeout(timeoutId);
  }
});

app.get('/api/nearby-places', async (req, res) => {
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lng);
  const category = String(req.query.category || 'all');
  if (
    !Number.isFinite(latitude) ||
    latitude < -90 ||
    latitude > 90 ||
    !Number.isFinite(longitude) ||
    longitude < -180 ||
    longitude > 180
  ) {
    return res.status(400).json({ error: 'Valid lat and lng coordinates are required' });
  }
  const allowedCategories = ['all', 'stay', 'restaurant', 'fuel'];
  if (!allowedCategories.includes(category)) {
    return res.status(400).json({
      error: `category must be one of: ${allowedCategories.join(', ')}`,
    });
  }
  const cacheKey = `openstreetmap|${latitude.toFixed(3)}|${longitude.toFixed(3)}|${category}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json({ places: cached, cached: true });

  try {
    const places = await fetchOverpassPlaces(latitude, longitude, category);
    setCached(cacheKey, places);
    return res.json({
      places,
      source: 'OpenStreetMap',
      attribution: '© OpenStreetMap contributors',
    });
  } catch (error) {
    return res.status(502).json({
      error: error.message || 'Nearby places search failed',
    });
  }
});

app.post('/api/route-distances', async (req, res) => {
  const { places, attraction, userLocation } = req.body || {};
  const isCoordinate = (point) =>
    point &&
    Number.isFinite(Number(point.latitude)) &&
    Number(point.latitude) >= -90 &&
    Number(point.latitude) <= 90 &&
    Number.isFinite(Number(point.longitude)) &&
    Number(point.longitude) >= -180 &&
    Number(point.longitude) <= 180;

  if (!Array.isArray(places) || places.length > 60 || !isCoordinate(attraction)) {
    return res.status(400).json({
      error: 'Provide up to 60 places and valid attraction coordinates',
    });
  }
  if (userLocation != null && !isCoordinate(userLocation)) {
    return res.status(400).json({ error: 'Invalid user location coordinates' });
  }
  const validPlaces = places.filter(
    (place) => typeof place.id === 'string' && isCoordinate(place)
  );
  if (validPlaces.length !== places.length) {
    return res.status(400).json({ error: 'Every place needs an id and valid coordinates' });
  }
  if (places.length === 0) {
    return res.json({ routesToAttraction: {}, routesFromUser: {} });
  }

  try {
    const attractionElements = await fetchGoogleRouteMatrix(
      validPlaces,
      [attraction]
    );
    const routesToAttraction = {};
    for (const element of attractionElements) {
      const place = validPlaces[element.originIndex];
      if (place) routesToAttraction[place.id] = routeSummary(element);
    }

    let routesFromUser = {};
    if (userLocation) {
      const userElements = await fetchGoogleRouteMatrix(
        [userLocation],
        validPlaces
      );
      routesFromUser = Object.fromEntries(
        userElements.map((element) => {
          const place = validPlaces[element.destinationIndex];
          return [place?.id, routeSummary(element)];
        }).filter(([id]) => id)
      );
    }

    return res.json({ routesToAttraction, routesFromUser });
  } catch (error) {
    return res.status(502).json({
      error: error.message || 'Could not calculate driving distances',
    });
  }
});

app.get('/api/hotels', async (req, res) => {
  try {
    const hasCoordinates = req.query.lat != null || req.query.lng != null;
    const lat = Number(req.query.lat || 0);
    const lng = Number(req.query.lng || 0);
    const attractionName = String(req.query.attractionName || '').trim().slice(0, 100);
    const attractionLocation = String(req.query.attractionLocation || '').trim().slice(0, 200);
    if (hasCoordinates && (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    )) {
      return res.status(400).json({ error: 'lat and lng are required' });
    }
    if (!hasCoordinates && !attractionName) {
      return res.status(400).json({
        error: 'Provide attractionName or valid coordinates for accommodation search',
      });
    }
    const today = new Date();
    const defaultCheckIn = new Date(today.getTime() + 86400000 * 7)
      .toISOString()
      .slice(0, 10);
    const defaultCheckOut = new Date(today.getTime() + 86400000 * 9)
      .toISOString()
      .slice(0, 10);
    const checkInDate = String(req.query.checkInDate || defaultCheckIn);
    const checkOutDate = String(req.query.checkOutDate || defaultCheckOut);
    const adults = Number(req.query.adults || 2);
    const roomQuantity = Number(req.query.roomQuantity || 1);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(checkInDate) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(checkOutDate) ||
      checkOutDate <= checkInDate
    ) {
      return res
        .status(400)
        .json({ error: 'Use valid check-in and check-out dates' });
    }
    if (
      !Number.isInteger(adults) ||
      adults < 1 ||
      adults > 9 ||
      !Number.isInteger(roomQuantity) ||
      roomQuantity < 1 ||
      roomQuantity > 5
    ) {
      return res
        .status(400)
        .json({
          error: 'Adults or room quantity is outside the supported range',
        });
    }
    let hotels = hasCoordinates
      ? await fetchHotelOffers(lat, lng, {
          checkInDate,
          checkOutDate,
          adults,
          roomQuantity,
        })
        : [];
    if (hotels.length === 0) {
        if (hasCoordinates) {
            const osmPlaces = await fetchOverpassPlaces(lat, lng, 'all');
            const osmStays = osmPlaces.filter((place) => place.category === 'stay');
          hotels = osmStays.map((place) => ({
            id: place.id,
            name: place.name,
            type: place.type,
            pricePerNight: null,
            currency: 'ZAR',
            distanceKm: place.distanceFromAttractionKm,
            latitude: place.latitude,
            longitude: place.longitude,
            rating: null,
            reviewCount: null,
            peakDouble: false,
            localFav: false,
            source: 'OpenStreetMap',
            details: {
              images: [],
              image: '',
              description:
                'Mapped accommodation from OpenStreetMap. Prices and availability are not provided.',
              address: place.address,
              phone: place.phone,
              website: place.website,
              checkIn: 'Check with property',
              checkOut: 'Check with property',
              cancellation: 'Contact the property for cancellation terms.',
              amenities: [],
              roomTypes: [],
              reviews: [],
              attribution: place.attribution,
            },
          }));
        }
    }
    return res.json({
        hotels,
        source:
          hotels[0]?.source ||
          (HOTEL_API_PROVIDER.toLowerCase() === 'amadeus'
            ? 'Amadeus'
            : 'OpenStreetMap'),
        attribution: hotels.some((hotel) => hotel.source === 'OpenStreetMap')
          ? '© OpenStreetMap contributors'
          : undefined,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || 'Hotel provider request failed' });
  }
});

app.get('/api/attractions', async (req, res) => {
  try {
    const query = String(req.query.query || '').trim().slice(0, 100);
    const category = String(req.query.category || 'All');

    const allowedCategories = new Set([
      'All',
      'Wildlife',
      'Coast',
      'Mountains',
      'City',
    ]);
    if (!allowedCategories.has(category)) {
      return res.status(400).json({ error: 'Invalid attraction category' });
    }

    const attractions = await searchOsmAttractions(query, category);
    return res.json({
      attractions,
      source: 'OpenStreetMap',
      attribution: '© OpenStreetMap contributors',
    });
  } catch (error) {
    console.error('/api/attractions failed:', error);
    return res.status(500).json({
      error: error.message || 'Failed to search OpenStreetMap attractions',
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Planner API server listening on http://0.0.0.0:${PORT}`);
  console.log(`  Health check: http://localhost:${PORT}/api/health`);
  console.log(
    `  From your phone, use your computer's LAN IP instead of localhost.`
  );
});

app.post('/api/auth/register', async (req, res) => {
  const { firstName, lastName, email, nationality, password } = req.body || {};
  const cleanEmail = String(email || '')
    .trim()
    .toLowerCase();
  if (!firstName || !lastName || !cleanEmail || !nationality || !password) {
    return res
      .status(400)
      .json({ errors: { form: 'All account fields are required.' } });
  }
  if (await getUser(cleanEmail)) {
    return res
      .status(409)
      .json({
        errors: {
          email: 'An account with this email already exists. Please sign in.',
        },
      });
  }
  const otp = String(crypto.randomInt(100000, 1000000));
  const challengeToken = crypto.randomBytes(24).toString('hex');
  const registrationChallenge = {
    firstName: String(firstName).trim(),
    lastName: String(lastName).trim(),
    email: cleanEmail,
    nationality: String(nationality).trim(),
    passwordHash: hashPassword(String(password)),
    otpHash: hashToken(otp),
    challengeHash: hashToken(challengeToken),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    attempts: 0,
  };

  try {
    await sendRegistrationOtpEmail({
      email: cleanEmail,
      firstName: registrationChallenge.firstName,
      otp,
    });
    await saveRegistrationChallenge(registrationChallenge);
    return res.json({ otpRequired: true, challengeToken, email: cleanEmail });
  } catch (error) {
    await removeRegistrationChallenge(cleanEmail);
    return res
      .status(500)
      .json({
        errors: {
          form: error.message || 'Could not send your registration code.',
        },
      });
  }
});

app.post('/api/auth/register/verify-otp', async (req, res) => {
  const cleanEmail = String(req.body?.email || '')
    .trim()
    .toLowerCase();
  const otp = String(req.body?.otp || '').replace(/\D/g, '');
  const challengeToken = String(req.body?.challengeToken || '');
  const challenge = await getRegistrationChallenge(cleanEmail);

  if (
    !challenge ||
    !challengeToken ||
    hashToken(challengeToken) !== challenge.challengeHash
  ) {
    return res
      .status(400)
      .json({
        errors: {
          form: 'This registration code request is invalid. Please start again.',
        },
      });
  }

  if (
    !challenge.expiresAt ||
    Date.now() > new Date(challenge.expiresAt).getTime()
  ) {
    return res
      .status(400)
      .json({
        errors: {
          form: 'This registration code has expired. Please start again.',
        },
      });
  }

  if (Number(challenge.attempts || 0) >= 5) {
    return res
      .status(429)
      .json({
        errors: { form: 'Too many incorrect codes. Please start again.' },
      });
  }

  if (!/^\d{6}$/.test(otp) || hashToken(otp) !== challenge.otpHash) {
    challenge.attempts = Number(challenge.attempts || 0) + 1;
    await saveRegistrationChallenge(challenge);
    return res
      .status(401)
      .json({ errors: { otp: 'Enter the 6-digit code sent to your email.' } });
  }

  if (await getUser(cleanEmail)) {
    await removeRegistrationChallenge(cleanEmail);
    return res
      .status(409)
      .json({
        errors: {
          email: 'An account with this email already exists. Please sign in.',
        },
      });
  }

  const user = {
    id: crypto.randomUUID(),
    firstName: challenge.firstName,
    lastName: challenge.lastName,
    email: challenge.email,
    nationality: challenge.nationality,
    passwordHash: challenge.passwordHash,
    createdAt: new Date().toISOString(),
    dayPlan: [],
  };
  await saveUser(user);
  await recordAuditEvent({
    action: "account.registered",
    actorEmail: cleanEmail,
    targetEmail: cleanEmail,
  });
  await removeRegistrationChallenge(cleanEmail);
  return res.status(201).json({ user: publicUser(user) });
});

app.post("/api/auth/login", async (req, res) => {
  const cleanEmail = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  if (
    ADMIN_EMAIL &&
    ADMIN_PASSWORD &&
    cleanEmail === ADMIN_EMAIL &&
    password === ADMIN_PASSWORD
  ) {
    return res.json({
      adminRequired: true,
      user: {
        id: 'admin',
        firstName: 'Admin',
        lastName: 'Administrator',
        email: ADMIN_EMAIL,
        nationality: '',
        dayPlan: [],
        isAdmin: true,
      },
    });
  }

  const user = await getUser(cleanEmail);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ errors: { form: "Email or password is incorrect." } });
  }

  const otp = String(crypto.randomInt(100000, 1000000));
  const challengeToken = crypto.randomBytes(24).toString("hex");
  user.loginOtpHash = hashToken(otp);
  user.loginOtpChallengeHash = hashToken(challengeToken);
  user.loginOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  user.loginOtpAttempts = 0;
  await saveUser(user);

  try {
    await sendLoginOtpEmail({ user, otp });
    return res.json({ otpRequired: true, challengeToken, email: cleanEmail });
  } catch (error) {
    user.loginOtpHash = undefined;
    user.loginOtpChallengeHash = undefined;
    user.loginOtpExpiresAt = undefined;
    user.loginOtpAttempts = undefined;
    await saveUser(user);
    return res.status(500).json({ errors: { form: error.message || "Could not send your sign-in code." } });
  }
});

app.post("/api/auth/login/verify-otp", async (req, res) => {
  const cleanEmail = String(req.body?.email || "").trim().toLowerCase();
  const otp = String(req.body?.otp || "").replace(/\D/g, "");
  const challengeToken = String(req.body?.challengeToken || "");
  const user = await getUser(cleanEmail);

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
    await saveUser(user);
    return res.status(401).json({ errors: { otp: "Enter the 6-digit code sent to your email." } });
  }

  user.loginOtpHash = undefined;
  user.loginOtpChallengeHash = undefined;
  user.loginOtpExpiresAt = undefined;
  user.loginOtpAttempts = undefined;
  await saveUser(user);
  return res.json({ user: publicUser(user) });
});

function requireAdmin(req, res) {
  const adminEmail = String(req.get('x-admin-email') || req.query.adminEmail || '').trim().toLowerCase();
  if (!isAdminEmail(adminEmail)) {
    res.status(403).json({ errors: { form: 'Administrator access is required.' } });
    return null;
  }
  return adminEmail;
}

app.get('/api/admin/health', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    await checkDatabase();
    return res.json({
      api: 'online',
      database: 'online',
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Admin health check failed:', error);
    return res.status(503).json({
      api: 'online',
      database: 'offline',
      checkedAt: new Date().toISOString(),
      errors: { form: 'The API is running but Firestore could not be reached.' },
    });
  }
});

app.get('/api/admin/audit-events', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const events = await getAuditEvents(1000);
  return res.json({ events });
});

app.get('/api/users/:email/profile', async (req, res) => {
  const user = await getUser(req.params.email);
  if (!user) return res.status(404).json({ errors: { email: 'No account found.' } });
  return res.json({ user: publicUser(user) });
});

app.patch('/api/users/:email/profile', async (req, res) => {
  const user = await getUser(req.params.email);
  if (!user) return res.status(404).json({ errors: { email: 'No account found.' } });

  const firstName = String(req.body?.firstName ?? user.firstName).trim();
  const lastName = String(req.body?.lastName ?? user.lastName).trim();
  const nationality = String(req.body?.nationality ?? user.nationality).trim();
  const profilePhoto = Object.prototype.hasOwnProperty.call(req.body || {}, 'profilePhoto')
    ? req.body.profilePhoto
    : user.profilePhoto ?? null;
  if (!firstName || !lastName || !nationality) {
    return res.status(400).json({ errors: { form: 'Name and nationality are required.' } });
  }
  if (
    profilePhoto !== null &&
    (typeof profilePhoto !== 'string' ||
      !/^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(profilePhoto) ||
      profilePhoto.length > 350_000)
  ) {
    return res.status(400).json({
      errors: { profilePhoto: 'Choose a JPEG photo smaller than 250 KB.' },
    });
  }

  user.firstName = firstName;
  user.lastName = lastName;
  user.nationality = nationality;
  user.profilePhoto = profilePhoto;
  await saveUser(user);
  await recordAuditEvent({
    action: "profile.updated",
    actorEmail: user.email,
    targetEmail: user.email,
    metadata: { profilePhotoChanged: Object.prototype.hasOwnProperty.call(req.body || {}, 'profilePhoto') },
  });
  return res.json({ user: publicUser(user) });
});

app.delete('/api/users/:email', async (req, res) => {
  const user = await getUser(req.params.email);
  if (!user) return res.status(404).json({ errors: { email: 'No account found.' } });
  await recordAuditEvent({
    action: "account.deleted",
    actorEmail: user.email,
    targetEmail: user.email,
  });
  await removeUser(req.params.email);
  return res.json({ ok: true });
});

app.get('/api/users/:email/plan', async (req, res) => {
  const user = await getUser(req.params.email);
  if (!user) return res.status(404).json({ errors: { email: 'No account found.' } });
  return res.json({ plan: ensureUserPlan(user) });
});

app.put('/api/users/:email/plan', async (req, res) => {
  const user = await getUser(req.params.email);
  if (!user) return res.status(404).json({ errors: { email: 'No account found.' } });
  if (!Array.isArray(req.body?.plan)) return res.status(400).json({ errors: { plan: 'Plan must be an array.' } });
  user.dayPlan = req.body.plan;
  await saveUser(user);
  await recordAuditEvent({
    action: "plan.saved",
    actorEmail: user.email,
    targetEmail: user.email,
    metadata: { destinationCount: user.dayPlan.length },
  });
  return res.json({ plan: user.dayPlan });
});

app.post('/api/users/:email/plan', async (req, res) => {
  const user = await getUser(req.params.email);
  if (!user) return res.status(404).json({ errors: { email: 'No account found.' } });
  if (!req.body?.entry || typeof req.body.entry !== 'object') return res.status(400).json({ errors: { entry: 'A plan entry is required.' } });
  const plan = ensureUserPlan(user);
  const index = plan.findIndex((entry) => entry.attractionId === req.body.entry.attractionId);
  if (index >= 0) plan[index] = req.body.entry;
  else plan.push(req.body.entry);
  await saveUser(user);
  await recordAuditEvent({
    action: "plan.saved",
    actorEmail: user.email,
    targetEmail: user.email,
    metadata: { destinationCount: plan.length },
  });
  return res.status(index >= 0 ? 200 : 201).json({ plan });
});

app.delete('/api/users/:email/plan/:attractionId', async (req, res) => {
  const user = await getUser(req.params.email);
  if (!user) return res.status(404).json({ errors: { email: 'No account found.' } });
  user.dayPlan = ensureUserPlan(user).filter((entry) => entry.attractionId !== req.params.attractionId);
  await saveUser(user);
  await recordAuditEvent({
    action: "plan.saved",
    actorEmail: user.email,
    targetEmail: user.email,
    metadata: { destinationCount: user.dayPlan.length },
  });
  return res.json({ plan: user.dayPlan });
});

app.get('/api/admin/users', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const users = await getUsers();
  return res.json({ users: users.map(publicUser) });
});

app.patch('/api/admin/users/:email', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const user = await getUser(req.params.email);
  if (!user) return res.status(404).json({ errors: { email: 'No account found.' } });
  user.firstName = String(req.body?.firstName ?? user.firstName).trim();
  user.lastName = String(req.body?.lastName ?? user.lastName).trim();
  user.nationality = String(req.body?.nationality ?? user.nationality).trim();
  if (!user.firstName || !user.lastName || !user.nationality) return res.status(400).json({ errors: { form: 'Name and nationality are required.' } });
  await saveUser(user);
  await recordAuditEvent({
    action: "admin.user.updated",
    actorEmail: req.get('x-admin-email'),
    targetEmail: user.email,
  });
  return res.json({ user: publicUser(user) });
});

app.delete('/api/admin/users/:email', async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const email = String(req.params.email || '').trim().toLowerCase();
  if (!(await getUser(email))) return res.status(404).json({ errors: { email: 'No account found.' } });
  await recordAuditEvent({
    action: "admin.user.deleted",
    actorEmail: req.get('x-admin-email'),
    targetEmail: email,
  });
  await Promise.all([removeUser(email), removeRegistrationChallenge(email)]);
  return res.json({ ok: true });
});

app.post("/api/auth/request-password-reset", async (req, res) => {
  const cleanEmail = String(req.body?.email || "").trim().toLowerCase();
  const user = await getUser(cleanEmail);

  if (!user) {
    return res.status(404).json({ errors: { email: "No account found with this email address." } });
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordTokenHash = hashToken(token);
  user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  await saveUser(user);

  const resetLink = `${getRequestOrigin(req).replace(/\/$/, "")}/?resetToken=${encodeURIComponent(token)}&email=${encodeURIComponent(cleanEmail)}`;

  try {
    await sendPasswordResetEmail({ user, resetLink });
    return res.json({ ok: true });
  } catch (error) {
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpiresAt = undefined;
    await saveUser(user);
    return res.status(500).json({ errors: { form: error.message || "Could not send the password reset email." } });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  const cleanEmail = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");
  const token = String(req.body?.token || "");
  const user = await getUser(cleanEmail);
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
  await saveUser(user);
  return res.json({ user: publicUser(user) });
});
