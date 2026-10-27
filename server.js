const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

dotenv.config({ path: path.join(__dirname, 'backend', '.env') });
dotenv.config({
  path: path.join(__dirname, '.env'),
  override: false,
  quiet: true,
});
const {
  getRegistrationChallenge,
  getAuditEvents,
  getUserAuditEvents,
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
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || '';
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
const NUITEE_API_KEY = process.env.NUITEE_API_KEY || '';
const NUITEE_API_BASE_URL = (
  process.env.NUITEE_API_BASE_URL || 'https://api.liteapi.travel/v3.0'
).replace(/\/+$/, '');
const NUITEE_GUEST_NATIONALITY =
  process.env.NUITEE_GUEST_NATIONALITY || 'ZA';
const SCRAPEBADGER_API_KEY = process.env.SCRAPEBADGER_API_KEY || '';
const SCRAPEBADGER_CURRENCY = 'ZAR';
const HOTELBEDS_API_KEY = process.env.HOTELBEDS_API_KEY || '';
const HOTELBEDS_API_SECRET = process.env.HOTELBEDS_API_SECRET || '';
const HOTELBEDS_API_BASE_URL = (
  process.env.HOTELBEDS_API_BASE_URL || 'https://api.test.hotelbeds.com'
).replace(/\/+$/, '');
const HOTEL_API_BASE_URL = process.env.HOTEL_API_BASE_URL || '';
const HOTEL_API_TOKEN_URL = process.env.HOTEL_API_TOKEN_URL || '';
const HOTEL_API_HOST = process.env.HOTEL_API_HOST || '';
const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID || '';
const EMAILJS_OTP_TEMPLATE_ID = process.env.EMAILJS_OTP_TEMPLATE_ID || '';
const EMAILJS_BOOKING_TEMPLATE_ID = process.env.EMAILJS_BOOKING_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY || '';
const EMAILJS_PRIVATE_KEY = process.env.EMAILJS_PRIVATE_KEY || '';
const EMAILJS_BOOKING_SERVICE_ID = process.env.EMAILJS_BOOKING_SERVICE_ID || '';
const EMAILJS_BOOKING_PUBLIC_KEY = process.env.EMAILJS_BOOKING_PUBLIC_KEY || '';
const EMAILJS_BOOKING_PRIVATE_KEY = process.env.EMAILJS_BOOKING_PRIVATE_KEY || '';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
const SECONDARY_ADMIN_EMAIL = (process.env.SECONDARY_ADMIN_EMAIL || '').trim().toLowerCase();
const SECONDARY_ADMIN_PASSWORD = process.env.SECONDARY_ADMIN_PASSWORD || '';
const adminSessions = new Map();
const userSessions = new Map();
const bookingEmailAttempts = new Map();
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
  const safePath = req.path
    .replace(/^\/api\/users\/[^/]+/, '/api/users/:email')
    .replace(/^\/api\/admin\/users\/[^/]+/, '/api/admin/users/:email');
  console.log(`[${new Date().toISOString()}] ${req.method} ${safePath}`);
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
  const normalized = String(email || '').trim().toLowerCase();
  return normalized === ADMIN_EMAIL || normalized === SECONDARY_ADMIN_EMAIL;
}

function getRequestOrigin(req) {
  return (
    process.env.APP_BASE_URL || req.get('origin') || 'http://localhost:8081'
  );
}

async function sendEmailJsTemplate({
  templateId,
  templateParams,
  serviceId = EMAILJS_SERVICE_ID,
  publicKey = EMAILJS_PUBLIC_KEY,
  privateKey = EMAILJS_PRIVATE_KEY,
}) {
  if (!serviceId || !templateId || !publicKey) {
    throw new Error(
      'EmailJS is missing EMAILJS_PUBLIC_KEY. Add it to .env and restart the server.'
    );
  }

  const body = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: templateParams,
  };

  if (privateKey) {
    body.accessToken = privateKey;
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
  const provider = HOTEL_API_PROVIDER.toLowerCase();
  if (provider === 'hotelbeds')
    return Boolean(HOTELBEDS_API_KEY && HOTELBEDS_API_SECRET);
  if (provider === 'amadeus') {
    return Boolean(HOTEL_API_KEY && HOTEL_API_SECRET);
  }
  if (provider === 'nuitee') return Boolean(NUITEE_API_KEY);
  if (provider === 'scrapebadger') return Boolean(SCRAPEBADGER_API_KEY);
  return HOTEL_API_PROVIDER !== 'none' && Boolean(HOTEL_API_BASE_URL);
}

const hotelbedsContentCache = new Map();
let hotelbedsSouthAfricaCatalogRequest = null;
function hotelbedsSignature() {
  const timestamp = Math.floor(Date.now() / 1000);
  return crypto
    .createHash('sha256')
    .update(`${HOTELBEDS_API_KEY}${HOTELBEDS_API_SECRET}${timestamp}`)
    .digest('hex');
}

function hotelbedsHeaders() {
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Api-key': HOTELBEDS_API_KEY,
    'X-Signature': hotelbedsSignature(),
  };
}

async function hotelbedsRequest(pathname, { method = 'GET', query, body } = {}) {
  const url = new URL(`${HOTELBEDS_API_BASE_URL}${pathname}`);
  for (const [key, value] of Object.entries(query || {})) {
    if (value != null && value !== '') url.searchParams.set(key, String(value));
  }
  const response = await fetch(url, {
    method,
    headers: hotelbedsHeaders(),
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(25000),
  });
  const { body: responseBody, payload } = await readProviderResponse(response);
  if (!response.ok) {
    throw new Error(
      `Hotelbeds request failed (HTTP ${response.status}): ${providerErrorMessage(payload, responseBody, 'No error details returned')}`
    );
  }
  return payload;
}

async function getHotelbedsSouthAfricaCatalog() {
  const key = 'hotelbeds-hotels:country:ZA';
  const cached = hotelbedsContentCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.value;
  if (hotelbedsSouthAfricaCatalogRequest) return hotelbedsSouthAfricaCatalogRequest;

  hotelbedsSouthAfricaCatalogRequest = (async () => {
    const hotels = [];
    const pageSize = 1000;
    // Hotelbeds Content API supports up to 1,000 records per page.
    for (let from = 1; from <= 10000; from += pageSize) {
      const payload = await hotelbedsRequest('/hotel-content-api/1.0/hotels', {
        query: {
          fields: 'all',
          language: 'ENG',
          countryCode: 'ZA',
          from,
          to: from + pageSize - 1,
        },
      });
      const page = payload.hotels || payload.data || [];
      hotels.push(...page);
      if (page.length < pageSize) break;
    }
    hotelbedsContentCache.set(key, { value: hotels, expiresAt: Date.now() + 86400000 });
    return hotels;
  })();

  try {
    return await hotelbedsSouthAfricaCatalogRequest;
  } finally {
    hotelbedsSouthAfricaCatalogRequest = null;
  }
}

function hotelbedsImageUrl(image) {
  const pathValue = String(image.path || '').replace(/^\/+/, '');
  if (!pathValue) return '';
  const size = 'bigger/';
  return `https://photos.hotelbeds.com/giata/${size}${pathValue}`;
}

async function fetchHotelbedsHotelOffers(latitude, longitude, options = {}) {
  const { checkInDate, checkOutDate, adults = 2, roomQuantity = 1, attractionLocation = '', attractionName = '' } = options;
  const cacheKey = `hotelbeds:${latitude.toFixed(2)}:${longitude.toFixed(2)}:${checkInDate}:${checkOutDate}:${adults}:${roomQuantity}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;
  if (adults < 1 || roomQuantity < 1) throw new Error('Hotelbeds requires at least one adult and one room.');

  const hotels = await getHotelbedsSouthAfricaCatalog();
  const nearby = hotels.map((hotel) => ({
    ...hotel,
    distanceKm: distanceInKm(latitude, longitude, Number(hotel.coordinates?.latitude), Number(hotel.coordinates?.longitude)),
  })).filter((hotel) => Number.isFinite(hotel.distanceKm) && hotel.distanceKm <= 100)
    .sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 100);
  if (!nearby.length) {
    throw new Error('Hotelbeds has no geocoded properties within 100 km of this attraction.');
  }

  const availability = await hotelbedsRequest('/hotel-api/1.0/hotels', {
    method: 'POST',
    body: {
      stay: { checkIn: checkInDate, checkOut: checkOutDate },
      occupancies: [{ rooms: roomQuantity, adults, children: 0 }],
      hotels: { hotel: nearby.map((hotel) => Number(hotel.code)).filter(Number.isFinite) },
    },
  });
  const available = availability.hotels?.hotels || [];
  const contentByCode = new Map(nearby.map((hotel) => [String(hotel.code), hotel]));
  const nights = Math.max(1, Math.round((new Date(checkOutDate) - new Date(checkInDate)) / 86400000));
  // Keep nearby Hotelbeds properties visible when the requested dates have no
  // sellable offer; static content still provides useful descriptions/photos.
  const displayHotels = available.length
    ? available
    : nearby.slice(0, 20).map((content) => ({
        code: content.code,
        name: content.name?.content || content.name,
        rooms: [],
      }));
  const mapped = displayHotels.map((hotel, index) => {
    const content = contentByCode.get(String(hotel.code)) || {};
    const images = (content.images || []).map(hotelbedsImageUrl).filter(Boolean);
    const facilities = (content.facilities || []).map((facility) => facility.description?.content || facility.description).filter(Boolean);
    const descriptions = Array.isArray(content.description)
      ? content.description
      : Array.isArray(content.description?.content)
        ? content.description.content
        : [];
    const rate = hotel.rooms?.[0]?.rates?.[0] || {};
    const total = Number(rate.net ?? rate.sellingRate ?? rate.ratePerNight);
    const pricedRooms = Math.max(1, Number(rate.rooms) || roomQuantity);
    const name = hotel.name || content.name?.content || content.name || `Hotel ${index + 1}`;
    return {
      id: `hotelbeds:${hotel.code}`,
      name,
      type: hotel.categoryName || content.categoryCode || 'Hotel',
      pricePerNight: Number.isFinite(total) ? total / nights / pricedRooms : null,
      groupPricePerNight: Number.isFinite(total) ? total / nights : null,
      requestedRoomQuantity: roomQuantity,
      requestedAdultsPerRoom: adults,
      currency: rate.currency || 'ZAR',
      distanceKm: content.distanceKm,
      latitude: Number(content.coordinates?.latitude) || null,
      longitude: Number(content.coordinates?.longitude) || null,
      rating: Number(content.categoryCode?.match(/\d/)?.[0]) || null,
      peakDouble: false,
      localFav: false,
      source: 'Hotelbeds',
      details: {
        images,
        image: images[0] || '',
        imageAttribution: images.length ? 'Hotelbeds' : '',
        description: descriptions.map((item) => item.description || item.content || '').filter(Boolean).join('\n'),
        address: [content.address?.content || content.address, content.city?.content || content.city, content.countryCode].filter(Boolean).join(', ') || 'Address not provided by Hotelbeds',
        phone: content.phones?.[0]?.phoneNumber || 'Not provided by Hotelbeds',
        website: content.web || '',
        checkIn: 'Check with property',
        checkOut: 'Check with property',
        cancellation: rate.cancellationPolicies?.[0]?.description || 'Check the provider for cancellation terms.',
        rateAvailability: available.length > 0 ? 'Available for the selected dates' : 'No live offer returned for the selected dates',
        amenities: facilities,
        roomTypes: (hotel.rooms || []).flatMap((room) => (room.rates || []).slice(0, 3).map((roomRate) => ({
          name: [room.name, roomRate.boardName].filter(Boolean).join(' · ') || 'Room details not provided',
          pricePerNight: Number(roomRate.net) / nights / Math.max(1, Number(roomRate.rooms) || roomQuantity) || null,
          sleeps: adults,
          beds: roomRate.rateType || 'Contact provider for bed details',
        }))),
        reviews: [],
      },
    };
  });
  setCached(cacheKey, mapped);
  return mapped;
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

async function fetchScrapeBadgerHotelOffers(
  latitude,
  longitude,
  { checkInDate, checkOutDate, adults, attractionName, attractionLocation } = {}
) {
  const query = [attractionName, attractionLocation]
    .filter((part) => typeof part === 'string' && part.trim())
    .join(', ') || `${latitude},${longitude}`;
  const cacheKey = [
    'scrapebadger-hotels',
    query.toLowerCase(),
    checkInDate,
    checkOutDate,
    adults,
    SCRAPEBADGER_CURRENCY,
  ].join('|');
  const cachedHotels = getCached(cacheKey);
  if (cachedHotels) return cachedHotels;

  const url = new URL('https://scrapebadger.com/v1/google/hotels/search');
  url.searchParams.set('q', query);
  url.searchParams.set('check_in', checkInDate);
  url.searchParams.set('check_out', checkOutDate);
  url.searchParams.set('adults', String(adults));
  url.searchParams.set('currency', SCRAPEBADGER_CURRENCY);
  url.searchParams.set('gl', 'za');
  url.searchParams.set('hl', 'en');

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'x-api-key': SCRAPEBADGER_API_KEY,
    },
    signal: AbortSignal.timeout(20000),
  });
  const { body, payload } = await readProviderResponse(response);
  if (!response.ok) {
    throw new Error(
      `ScrapeBadger Google Hotels search failed (HTTP ${response.status}): ${providerErrorMessage(payload, body, 'No error details returned')}`
    );
  }
  if (!Array.isArray(payload?.properties)) {
    throw new Error('ScrapeBadger returned an invalid Google Hotels response.');
  }

  const hotels = payload.properties.map((property, index) => {
    const coordinates = property.gps_coordinates || {};
    const propertyLatitude = Number(coordinates.lat);
    const propertyLongitude = Number(coordinates.lng);
    const hasCoordinates =
      Number.isFinite(propertyLatitude) &&
      propertyLatitude >= -90 &&
      propertyLatitude <= 90 &&
      Number.isFinite(propertyLongitude) &&
      propertyLongitude >= -180 &&
      propertyLongitude <= 180;
    const nightlyRate = property.rate_per_night || {};
    const rawNightlyPrice = nightlyRate.lowest ?? nightlyRate.extracted;
    const nightlyPrice =
      rawNightlyPrice == null ? NaN : Number(rawNightlyPrice);
    const images = [
      ...(Array.isArray(property.images) ? property.images : []),
      property.thumbnail,
    ].filter(
      (image, imageIndex, allImages) =>
        typeof image === 'string' &&
        /^https:\/\//i.test(image) &&
        allImages.indexOf(image) === imageIndex
    );

    return {
      id:
        property.property_token ||
        `scrapebadger:${property.name}:${index}`,
      name: property.name,
      type:
        Number.isInteger(property.hotel_class) && property.hotel_class > 0
          ? `${property.hotel_class}-star hotel`
          : 'Hotel',
      pricePerNight: Number.isFinite(nightlyPrice) ? nightlyPrice : null,
      currency: nightlyRate.currency || SCRAPEBADGER_CURRENCY,
      distanceKm: hasCoordinates
        ? distanceInKm(
            latitude,
            longitude,
            propertyLatitude,
            propertyLongitude
          )
        : null,
      latitude: hasCoordinates ? propertyLatitude : null,
      longitude: hasCoordinates ? propertyLongitude : null,
      rating:
        property.overall_rating != null &&
        Number.isFinite(Number(property.overall_rating))
        ? Number(property.overall_rating)
        : null,
      reviewCount:
        property.reviews_count != null &&
        Number.isFinite(Number(property.reviews_count))
        ? Number(property.reviews_count)
        : null,
      peakDouble: false,
      localFav: false,
      source: 'ScrapeBadger Google Hotels',
      details: {
        images,
        image: images[0] || '',
        imageAttribution: images.length ? 'Google Hotels' : '',
        description: property.description || '',
        address: property.address || 'Address not provided by Google Hotels',
        website: '',
        checkIn: property.check_in_time || 'Check with property',
        checkOut: property.check_out_time || 'Check with property',
        cancellation: 'Check with the property for cancellation terms.',
        amenities: Array.isArray(property.amenities) ? property.amenities : [],
        roomTypes: [],
        reviews: [],
        propertyToken: property.property_token || '',
      },
    };
  });

  setCached(cacheKey, hotels);
  return hotels;
}

async function fetchNuiteeHotelOffers(
  latitude,
  longitude,
  { checkInDate, checkOutDate, adults, roomQuantity } = {}
) {
  if (adults < 1 || roomQuantity < 1) {
    throw new Error('Nuitee requires at least one adult and one room.');
  }
  const cacheKey = [
    'nuitee-hotels',
    latitude.toFixed(3),
    longitude.toFixed(3),
    checkInDate,
    checkOutDate,
    adults,
    roomQuantity,
    NUITEE_GUEST_NATIONALITY,
  ].join('|');
  const cachedHotels = getCached(cacheKey);
  if (cachedHotels) return cachedHotels;

  const numberOfNights = Math.max(
    1,
    Math.round(
      (new Date(checkOutDate) - new Date(checkInDate)) / 86400000
    )
  );
  const occupantsPerRoom = Array.from({ length: roomQuantity }, () => adults);
  const response = await fetch(`${NUITEE_API_BASE_URL}/hotels/rates`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-API-Key': NUITEE_API_KEY,
    },
    body: JSON.stringify({
      latitude,
      longitude,
      radius: 20000,
      checkin: checkInDate,
      checkout: checkOutDate,
      currency: 'ZAR',
      guestNationality: NUITEE_GUEST_NATIONALITY,
      occupancies: occupantsPerRoom.map((roomAdults) => ({
        adults: roomAdults,
      })),
      limit: 30,
      maxRatesPerHotel: 1,
      includeHotelData: true,
      timeout: 10,
    }),
    signal: AbortSignal.timeout(20000),
  });
  const payload = await response.json();
  if (!response.ok) {
    const providerMessage =
      payload.error?.message ||
      payload.message ||
      payload.error ||
      `HTTP ${response.status}`;
    throw new Error(`Nuitee hotel rates request failed: ${providerMessage}`);
  }

  if (!Array.isArray(payload.data)) {
    throw new Error('Nuitee returned an invalid hotel rates response.');
  }

  const hotels = payload.data.map((hotel, index) => {
    const roomTypes = Array.isArray(hotel.roomTypes) ? hotel.roomTypes : [];
    const rateOptions = roomTypes.flatMap((roomType) =>
      (Array.isArray(roomType.rates) ? roomType.rates : []).map((rate) => ({
        ...rate,
        roomName: roomType.name || rate.name || 'Room details not provided',
      }))
    );
    const rate = rateOptions[0] || {};
    const roomTotal = Array.isArray(rate.retailRate?.total)
      ? rate.retailRate.total.find((item) => Number.isFinite(Number(item.amount)))
      : null;
    const totalAmount = Number(roomTotal?.amount);
    const pricePerNight = Number.isFinite(totalAmount)
      ? totalAmount / numberOfNights / Math.max(1, roomQuantity)
      : null;
    const images = [
      ...(Array.isArray(hotel.hotelImages) ? hotel.hotelImages : []),
      ...(Array.isArray(hotel.images) ? hotel.images : []),
    ]
      .map((image) =>
        typeof image === 'string' ? image : image?.url || image?.imageUrl
      )
      .filter((image) => typeof image === 'string' && /^https?:\/\//i.test(image));
    const coordinates =
      hotel.location && typeof hotel.location === 'object'
        ? hotel.location
        : {};

    return {
      id: hotel.hotelId || hotel.id || `nuitee-hotel-${index}`,
      name: hotel.name || hotel.hotelName || `Hotel ${index + 1}`,
      type: 'Hotel',
      pricePerNight,
      currency: roomTotal?.currency || rate.retailRate?.currency || 'ZAR',
      distanceKm:
        hotel.distance != null && Number.isFinite(Number(hotel.distance))
          ? Number(hotel.distance)
          : null,
      latitude: Number(hotel.latitude ?? coordinates.latitude) || null,
      longitude: Number(hotel.longitude ?? coordinates.longitude) || null,
      rating:
        hotel.rating != null && Number.isFinite(Number(hotel.rating))
          ? Number(hotel.rating)
          : null,
      reviewCount:
        hotel.reviewCount != null && Number.isFinite(Number(hotel.reviewCount))
          ? Number(hotel.reviewCount)
          : null,
      peakDouble: false,
      localFav: false,
      source: 'Nuitee Connect',
      details: {
        images,
        image: images[0] || '',
        imageAttribution: images.length ? 'Nuitee Connect' : '',
        description: hotel.hotelDescription || hotel.description || '',
        address:
          (typeof hotel.address === 'string' && hotel.address) ||
          [
            hotel.address?.line1 || hotel.address?.street,
            hotel.address?.city || hotel.city,
            hotel.address?.country || hotel.country,
          ]
            .filter(Boolean)
            .join(', ') ||
          'Address not provided by Nuitee Connect',
        website: hotel.website || '',
        checkIn: hotel.checkIn || 'Check with property',
        checkOut: hotel.checkOut || 'Check with property',
        cancellation:
          rate.cancellationPolicies?.[0]?.description ||
          'Check the provider for cancellation terms.',
        amenities: Array.isArray(hotel.facilities || hotel.amenities)
          ? (hotel.facilities || hotel.amenities).map((facility) =>
              typeof facility === 'string'
                ? facility
                : facility.name || facility.facilityName
            ).filter(Boolean)
          : [],
        roomTypes: rateOptions.slice(0, 5).map((option) => {
          const optionTotal = Array.isArray(option.retailRate?.total)
            ? option.retailRate.total.find((item) =>
                Number.isFinite(Number(item.amount))
              )
            : null;
          const optionPrice = Number(optionTotal?.amount);
          return {
            name: option.roomName,
            pricePerNight: Number.isFinite(optionPrice)
              ? optionPrice / numberOfNights
              : null,
            sleeps:
              option.adultCount != null &&
              Number.isFinite(Number(option.adultCount))
              ? Number(option.adultCount)
              : null,
            beds: 'Contact provider for bed details',
          };
        }),
        reviews: [],
        offerId: rate.offerId || '',
      },
    };
  });
  setCached(cacheKey, hotels);
  return hotels;
}

async function fetchHotelOffers(lat, lng, options = {}) {
  const provider = HOTEL_API_PROVIDER.toLowerCase();
  if (provider === 'hotelbeds') {
    if (!hotelApiEnabled()) return [];
    return fetchHotelbedsHotelOffers(lat, lng, options);
  }
  if (provider === 'nuitee') {
    if (!hotelApiEnabled()) return [];
    return fetchNuiteeHotelOffers(lat, lng, options);
  }
  if (provider === 'amadeus') {
    return fetchAmadeusHotelOffers(lat, lng, options);
  }
  if (provider === 'scrapebadger') {
    if (!hotelApiEnabled()) return [];
    return fetchScrapeBadgerHotelOffers(lat, lng, options);
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

async function convertHotelPricesToZar(hotels) {
  const foreignCurrencies = Array.from(
    new Set(
      hotels
        .filter(
          (hotel) =>
            hotel.pricePerNight != null ||
            hotel.details?.roomTypes?.some((room) => room.pricePerNight != null)
        )
        .map((hotel) => String(hotel.currency || 'ZAR').toUpperCase())
        .filter((currency) => currency !== 'ZAR')
    )
  );
  if (foreignCurrencies.length === 0) {
    return {
      hotels: hotels.map((hotel) => ({ ...hotel, currency: 'ZAR' })),
      warning: '',
    };
  }

  let rates;
  let rateDate;
  let rateError = '';
  const cacheKey = `zar-exchange-rates|${foreignCurrencies.sort().join(',')}`;
  const cachedRates = getCached(cacheKey);
  if (cachedRates) {
    ({ rates, date: rateDate } = cachedRates);
  } else {
    const url = new URL('https://api.frankfurter.dev/v1/latest');
    url.searchParams.set('base', 'ZAR');
    url.searchParams.set('symbols', foreignCurrencies.join(','));
    try {
      const response = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(10000),
      });
      const { body, payload } = await readProviderResponse(response);
      if (!response.ok) {
        throw new Error(
          `Exchange-rate service failed (HTTP ${response.status}): ${providerErrorMessage(payload, body, 'No error details returned')}`
        );
      }
      if (
        payload?.base !== 'ZAR' ||
        !payload.rates ||
        typeof payload.rates !== 'object'
      ) {
        throw new Error('Exchange-rate service returned invalid rate data.');
      }
      rates = payload.rates;
      rateDate = payload.date;
      setCached(cacheKey, { rates, date: rateDate });
    } catch (error) {
      rateError = error.message || 'Could not fetch exchange rates.';
      rates = {};
    }
  }

  const unavailableCurrencies = new Set();
  const convertedHotels = hotels.map((hotel) => {
    const currency = String(hotel.currency || 'ZAR').toUpperCase();
    const exchangeRate = currency === 'ZAR' ? 1 : Number(rates[currency]);
    const canConvert = Number.isFinite(exchangeRate) && exchangeRate > 0;
    if (!canConvert && (hotel.pricePerNight != null || hotel.details?.roomTypes?.some((room) => room.pricePerNight != null))) {
      unavailableCurrencies.add(currency);
    }
    const convertAmount = (amount) =>
      amount == null || !Number.isFinite(Number(amount)) || !canConvert
        ? null
        : Math.round((Number(amount) / exchangeRate) * 100) / 100;
    const details = hotel.details ? { ...hotel.details } : undefined;
    if (details?.roomTypes) {
      details.roomTypes = details.roomTypes.map((room) => ({
        ...room,
        pricePerNight: convertAmount(room.pricePerNight),
      }));
    }
    if (currency !== 'ZAR' && canConvert && details) {
      details.exchangeRateSource = 'Frankfurter reference rates';
      details.exchangeRateDate = rateDate || '';
    }
    return {
      ...hotel,
      pricePerNight: convertAmount(hotel.pricePerNight),
      groupPricePerNight: convertAmount(hotel.groupPricePerNight),
      currency: 'ZAR',
      details,
    };
  });

  const warning = rateError
    ? `Foreign-currency prices were hidden because the ZAR exchange rate could not be retrieved: ${rateError}`
    : unavailableCurrencies.size > 0
      ? `Some foreign-currency prices were hidden because no ZAR exchange rate was available for ${Array.from(unavailableCurrencies).join(', ')}.`
      : foreignCurrencies.length > 0
        ? `Foreign-currency prices converted to ZAR using Frankfurter reference rates dated ${rateDate}.`
        : '';
  return { hotels: convertedHotels, warning };
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

async function readProviderResponse(response) {
  const body = await response.text();
  let payload;
  try {
    payload = body ? JSON.parse(body) : {};
  } catch {
    payload = null;
  }
  return { body, payload };
}

function providerErrorMessage(payload, body, fallback) {
  const message =
    payload?.message ||
    payload?.error?.message ||
    payload?.error ||
    payload?.status?.message ||
    (body && body.slice(0, 300));
  return typeof message === 'string' && message.trim()
    ? message.trim()
    : fallback;
}

function normalizePlaceName(name) {
  return String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function googlePlaceNameMatches(accommodationName, googleName) {
  const accommodation = normalizePlaceName(accommodationName);
  const google = normalizePlaceName(googleName);
  if (!accommodation || !google) return false;
  if (accommodation === google) return true;
  const shorterName =
    accommodation.length <= google.length ? accommodation : google;
  return shorterName.length >= 8 &&
    (accommodation.includes(google) || google.includes(accommodation));
}

async function searchGooglePlaceWithPhoto(accommodation) {
  const address = accommodation.details?.address;
  const textQuery = [accommodation.name, address]
    .filter((value) => typeof value === 'string' && value.trim())
    .join(', ');
  if (!textQuery) return null;

  const response = await fetch(
    'https://places.googleapis.com/v1/places:searchText',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
        'X-Goog-FieldMask':
          'places.displayName,places.location,places.photos',
      },
      body: JSON.stringify({
        textQuery,
        includedType: 'lodging',
        strictTypeFiltering: true,
        maxResultCount: 5,
        locationBias: {
          circle: {
            center: {
              latitude: accommodation.latitude,
              longitude: accommodation.longitude,
            },
            radius: 1000,
          },
        },
      }),
      signal: AbortSignal.timeout(15000),
    }
  );
  const { body, payload } = await readProviderResponse(response);
  if (!response.ok) {
    throw new Error(
      `Google Places text search failed (HTTP ${response.status}): ${providerErrorMessage(payload, body, 'No error details returned')}`
    );
  }
  if (!Array.isArray(payload?.places)) {
    throw new Error('Google Places returned an invalid text-search response.');
  }

  return payload.places
    .filter((place) =>
      googlePlaceNameMatches(accommodation.name, place.displayName?.text) &&
      Array.isArray(place.photos) &&
      place.photos.length > 0 &&
      typeof place.photos[0]?.name === 'string' &&
      Number.isFinite(place.location?.latitude) &&
      Number.isFinite(place.location?.longitude)
    )
    .map((place) => ({
      place,
      distance: distanceInKm(
        accommodation.latitude,
        accommodation.longitude,
        place.location.latitude,
        place.location.longitude
      ),
    }))
    .filter(({ distance }) => distance <= 0.5)
    .sort((left, right) => left.distance - right.distance)[0]?.place || null;
}

async function fetchGooglePhoto(photo) {
  const photoUrl = new URL(
    `https://places.googleapis.com/v1/${photo.name}/media`
  );
  photoUrl.searchParams.set('maxWidthPx', '900');
  photoUrl.searchParams.set('skipHttpRedirect', 'true');

  const response = await fetch(photoUrl, {
    headers: { 'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY },
    signal: AbortSignal.timeout(10000),
  });
  const { body, payload } = await readProviderResponse(response);
  if (!response.ok) {
    throw new Error(
      `Google Places photo request failed (HTTP ${response.status}): ${providerErrorMessage(payload, body, 'No error details returned')}`
    );
  }
  if (typeof payload?.photoUri !== 'string' || !payload.photoUri.startsWith('https://')) {
    throw new Error('Google Places returned an invalid photo URL.');
  }
  const result = {
    uri: payload.photoUri,
    attributions: Array.isArray(photo.authorAttributions)
      ? photo.authorAttributions
          .filter(
            (attribution) =>
              typeof attribution.displayName === 'string' &&
              attribution.displayName.trim()
          )
          .map((attribution) => ({
            displayName: attribution.displayName,
            uri:
              typeof attribution.uri === 'string'
                ? attribution.uri.startsWith('//')
                  ? `https:${attribution.uri}`
                  : attribution.uri
                : '',
          }))
      : [],
  };
  return result;
}

async function attachGooglePlacePhotos(accommodations, latitude, longitude) {
  if (!GOOGLE_PLACES_API_KEY || accommodations.length === 0) {
    return { accommodations, photoWarning: '' };
  }
  const missingPhotoAccommodations = accommodations.filter(
    (accommodation) => !accommodation.details?.image
  );
  if (missingPhotoAccommodations.length === 0) {
    return { accommodations, photoWarning: '' };
  }
  const existingPhotoCount = accommodations.length - missingPhotoAccommodations.length;

  const cacheKey = `google-place-photos|${latitude.toFixed(3)}|${longitude.toFixed(3)}`;
  let googlePlaces = getCached(cacheKey);
  if (!googlePlaces) {
    const response = await fetch(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
          'X-Goog-FieldMask':
            'places.displayName,places.location,places.photos',
        },
        body: JSON.stringify({
          includedTypes: ['lodging'],
          maxResultCount: 20,
          rankPreference: 'DISTANCE',
          locationRestriction: {
            circle: {
              center: { latitude, longitude },
              radius: 5000,
            },
          },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );
    const { body, payload } = await readProviderResponse(response);
    if (!response.ok) {
      throw new Error(
        `Google Places search failed (HTTP ${response.status}): ${providerErrorMessage(payload, body, 'No error details returned')}`
      );
    }
    if (!Array.isArray(payload?.places)) {
      throw new Error('Google Places returned an invalid nearby-search response.');
    }
    googlePlaces = payload.places;
    setCached(cacheKey, googlePlaces);
  }

  const photoLookups = missingPhotoAccommodations
    .slice(0, 10)
    .map((accommodation) => {
      if (!Number.isFinite(accommodation.latitude) ||
          !Number.isFinite(accommodation.longitude)) {
        return null;
      }
      const accommodationName = normalizePlaceName(accommodation.name);
      if (!accommodationName) return null;

      const matchingPlace = googlePlaces
        .filter((place) =>
          googlePlaceNameMatches(accommodationName, place.displayName?.text) &&
          Array.isArray(place.photos) &&
          place.photos.length > 0 &&
          typeof place.photos[0]?.name === 'string' &&
          Number.isFinite(place.location?.latitude) &&
          Number.isFinite(place.location?.longitude)
        )
        .map((place) => ({
          place,
          distance: distanceInKm(
            accommodation.latitude,
            accommodation.longitude,
            place.location.latitude,
            place.location.longitude
          ),
        }))
        .filter(({ distance }) => distance <= 0.5)
        .sort((left, right) => left.distance - right.distance)[0];

      return matchingPlace
        ? Promise.resolve({
            accommodation,
            photo: matchingPlace.place.photos[0],
          })
        : searchGooglePlaceWithPhoto(accommodation).then((place) =>
            place
              ? { accommodation, photo: place.photos[0] }
              : null
          );
    })
    .filter(Boolean);

  const results = await Promise.allSettled(
    photoLookups.map(async (lookup) => {
      const match = await lookup;
      if (!match) return null;
      return {
        accommodation: match.accommodation,
        photo: await fetchGooglePhoto(match.photo),
      };
    })
  );

  let loadedPhotoCount = 0;
  let photoError = '';
  results.forEach((result) => {
    if (result.status !== 'fulfilled') {
      photoError ||= result.reason?.message || String(result.reason);
      console.warn('Could not load a Google Places accommodation photo:', result.reason);
      return;
    }
    if (!result.value) return;
    const { accommodation, photo } = result.value;
    const details = accommodation.details || (accommodation.details = {});
    details.image = photo.uri;
    details.images = [photo.uri];
    details.imageAttribution = 'Google Maps';
    details.photoAttributions = [
      { displayName: 'Google Maps', uri: 'https://maps.google.com/' },
      ...photo.attributions,
    ];
    loadedPhotoCount += 1;
  });

  const totalPhotoCount = existingPhotoCount + loadedPhotoCount;
  let photoWarning = totalPhotoCount === accommodations.length
    ? ''
    : totalPhotoCount > 0
      ? `Photos loaded for ${totalPhotoCount} of ${accommodations.length} accommodations; the remaining listings have no verified Google Places match.`
      : photoError
        ? `Google Places photo lookup failed: ${photoError}`
        : 'No verified Google Places photos matched these accommodation listings.';
  if (
    photoWarning.includes('Google Places') &&
    photoWarning.includes('HTTP 403')
  ) {
    photoWarning +=
      ' Check that Places API (New) is enabled for this Google Cloud project, billing is active, and the key permits server-side Places API requests.';
  }
  return { accommodations, photoWarning };
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
    category === 'all'
      ? Object.keys(overpassCategoryTags).filter((key) => key !== 'stay')
      : [category];
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
      const { body, payload } = await readProviderResponse(response);
      if (!response.ok) {
        errors.push(
          `${endpoint}: HTTP ${response.status}: ${providerErrorMessage(payload, body, 'No error details returned')}`
        );
        continue;
      }
      if (!payload) {
        errors.push(`${endpoint}: non-JSON response: ${body.slice(0, 300) || 'empty response'}`);
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
    hotelProviderConfigured: hotelApiEnabled(),
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
  const cacheKey = `nearby|${latitude.toFixed(3)}|${longitude.toFixed(3)}|${category}`;
  const cached = getCached(cacheKey);
  if (cached) return res.json({ ...cached, cached: true });

  try {
    let places = [];
    let warning = '';
    if (category === 'stay') {
      warning = 'Nearby accommodation listings are disabled here. View the Hotelbeds stays section for accommodation offers.';
    } else {
      places = await fetchOverpassPlaces(latitude, longitude, category);
    }
    const sources = new Set(places.map((place) => place.source));
    const result = {
      places,
      warning: warning || undefined,
      source: Array.from(sources).join(' and ') || (category === 'stay' ? 'Hotelbeds stays shown separately' : 'OpenStreetMap'),
      attribution: [
        sources.has('Geoapify') ? '© Geoapify' : null,
        sources.has('OpenStreetMap') ? '© OpenStreetMap contributors' : null,
      ]
        .filter(Boolean)
        .join(' · '),
    };
    setCached(cacheKey, result);
    return res.json(result);
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
      roomQuantity > 9
    ) {
      return res
        .status(400)
        .json({
          error: 'Adults or room quantity is outside the supported range',
        });
    }
    let hotels = [];
    let hotelWarning = '';
    if (
      HOTEL_API_PROVIDER.toLowerCase() === 'scrapebadger' &&
      !SCRAPEBADGER_API_KEY
    ) {
      hotelWarning =
        'ScrapeBadger is selected, but SCRAPEBADGER_API_KEY is not configured in backend/.env.';
    }
    if (
      HOTEL_API_PROVIDER.toLowerCase() === 'nuitee' &&
      !NUITEE_API_KEY
    ) {
      hotelWarning =
        'Nuitee is selected, but NUITEE_API_KEY is not configured in backend/.env.';
    }
    if (
      HOTEL_API_PROVIDER.toLowerCase() === 'hotelbeds' &&
      !(HOTELBEDS_API_KEY && HOTELBEDS_API_SECRET)
    ) {
      hotelWarning =
        'Hotelbeds is selected, but HOTELBEDS_API_KEY and HOTELBEDS_API_SECRET are not configured in backend/.env.';
    }
    if (hasCoordinates && hotelApiEnabled()) {
      try {
        hotels = await fetchHotelOffers(lat, lng, {
          checkInDate,
          checkOutDate,
          adults,
          roomQuantity,
          attractionName,
          attractionLocation,
        });
        if (hotels.length > 0) {
          const conversion = await convertHotelPricesToZar(hotels);
          hotels = conversion.hotels;
          if (conversion.warning) {
            hotelWarning = conversion.warning;
          }
        }
        if (hotels.length === 0 && !hotelWarning) {
          hotelWarning =
            HOTEL_API_PROVIDER.toLowerCase() === 'hotelbeds'
              ? 'Hotelbeds returned no available rates for these dates within 100 km of this attraction. Try different stay dates or check the Hotelbeds test inventory.'
              : 'The live hotel provider returned no properties for these dates and this location.';
        }
        if (
          HOTEL_API_PROVIDER.toLowerCase() === 'hotelbeds' &&
          hotels.length > 0 &&
          hotels.every((hotel) => hotel.pricePerNight == null)
        ) {
          const environmentLabel = HOTELBEDS_API_BASE_URL.includes('api.test.hotelbeds.com')
            ? 'Hotelbeds test inventory'
            : 'Hotelbeds';
          hotelWarning = `${environmentLabel} returned no priced room offers for ${checkInDate} to ${checkOutDate}. Showing ${hotels.length} nearby property details and photos only; these are not available offers. Try different dates or a destination with inventory in this Hotelbeds environment.`;
        }
      } catch (error) {
        const providerMessage = error.message || 'Live hotel search failed.';
        hotelWarning = HOTEL_API_PROVIDER.toLowerCase() === 'hotelbeds' &&
          /HTTP\s+403.*quota exceeded/i.test(providerMessage)
          ? 'Hotelbeds has exceeded its test API quota. Hotelbeds stays and live prices will return when the quota resets or Hotelbeds increases the account limit.'
          : providerMessage;
        console.warn('Live hotel search failed:', hotelWarning);
      }
    }
    if (hotels.length === 0 && hasCoordinates && !hotelWarning) {
      hotelWarning = 'No listings from the configured hotel provider were returned.';
    }
    let photoWarning;
    if (
      HOTEL_API_PROVIDER.toLowerCase() === 'hotelbeds' &&
      hotels.some((hotel) => hotel.source === 'Hotelbeds')
    ) {
      const withPhotos = hotels.filter((hotel) => hotel.details?.images?.length).length;
      if (withPhotos < hotels.length) {
        photoWarning = `Hotelbeds supplied photos for ${withPhotos} of ${hotels.length} nearby property listings.`;
      }
    }
    if (
      hotels.length > 0 &&
      GOOGLE_PLACES_API_KEY &&
      HOTEL_API_PROVIDER.toLowerCase() !== 'hotelbeds'
    ) {
      try {
        const photoResult = await attachGooglePlacePhotos(hotels, lat, lng);
        hotels = photoResult.accommodations;
        photoWarning = photoResult.photoWarning;
      } catch (error) {
        photoWarning = error.message || 'Google Places photo lookup failed.';
        if (
          photoWarning.includes('Google Places') &&
          photoWarning.includes('HTTP 403')
        ) {
          photoWarning +=
            ' Check that Places API (New) is enabled for this Google Cloud project, billing is active, and the key permits server-side Places API requests.';
        }
        console.warn(
          'Could not load Google Places accommodation photos:',
          photoWarning
        );
      }
    }
    return res.json({
      hotels,
      hotelWarning,
      photoWarning,
      source:
        hotels[0]?.source ||
        ({
          amadeus: 'Amadeus',
          nuitee: 'Nuitee Connect',
          hotelbeds: 'Hotelbeds',
        }[HOTEL_API_PROVIDER.toLowerCase()] || 'No accommodation provider results'),
      attribution: Array.from(
        new Set(
          hotels
            .map((hotel) => hotel.source)
            .filter((source) => source === 'Geoapify' || source === 'OpenStreetMap')
        )
      )
        .map((source) =>
          source === 'Geoapify'
            ? '© Geoapify'
            : '© OpenStreetMap contributors'
        )
        .join(' · ') || undefined,
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
  const accessToken = createUserSession(cleanEmail);
  return res.status(201).json({ user: { ...publicUser(user), accessToken } });
});

app.get('/api/auth/admin-role', (req, res) => {
  const email = String(req.query.email || '').trim().toLowerCase();
  if (email && ADMIN_EMAIL && ADMIN_PASSWORD && email === ADMIN_EMAIL) {
    return res.json({ role: 'superuser' });
  }
  if (email && SECONDARY_ADMIN_EMAIL && SECONDARY_ADMIN_PASSWORD && email === SECONDARY_ADMIN_EMAIL) {
    return res.json({ role: 'secondary-admin' });
  }
  return res.json({ role: null });
});

app.post("/api/auth/login", async (req, res) => {
  const cleanEmail = String(req.body?.email || "").trim().toLowerCase();
  const password = String(req.body?.password || "");

  const isPrimaryAdmin = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD && cleanEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD);
  const isSecondaryAdmin = Boolean(SECONDARY_ADMIN_EMAIL && SECONDARY_ADMIN_PASSWORD && cleanEmail === SECONDARY_ADMIN_EMAIL && password === SECONDARY_ADMIN_PASSWORD);
  if (isPrimaryAdmin || isSecondaryAdmin) {
    const role = isPrimaryAdmin ? 'superuser' : 'secondary-admin';
    const adminToken = crypto.randomBytes(32).toString('hex');
    adminSessions.set(adminToken, {
      email: cleanEmail,
      role,
      expiresAt: Date.now() + 12 * 60 * 60 * 1000,
    });
    return res.json({
      adminRequired: true,
      adminToken,
      role,
      user: {
        id: 'admin',
        firstName: isPrimaryAdmin ? 'Admin' : 'Secondary',
        lastName: isPrimaryAdmin ? 'Administrator' : 'Administrator',
        email: cleanEmail,
        nationality: '',
        dayPlan: [],
        isAdmin: true,
        adminRole: role,
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
  const accessToken = createUserSession(cleanEmail);
  return res.json({ user: { ...publicUser(user), accessToken } });
});

function requireAdmin(req, res) {
  const token = String(req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const session = adminSessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    if (session) adminSessions.delete(token);
    res.status(403).json({ errors: { form: 'Administrator access is required.' } });
    return null;
  }
  req.adminSession = session;
  return session;
}

function createUserSession(email) {
  const token = crypto.randomBytes(32).toString('hex');
  userSessions.set(hashToken(token), {
    email: String(email || '').trim().toLowerCase(),
    expiresAt: Date.now() + 12 * 60 * 60 * 1000,
  });
  return token;
}

function revokeUserSessions(email) {
  const cleanEmail = String(email || '').trim().toLowerCase();
  for (const [tokenHash, session] of userSessions) {
    if (session.email === cleanEmail) userSessions.delete(tokenHash);
  }
}

function requireUser(req, res) {
  const token = String(req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const tokenHash = token ? hashToken(token) : '';
  const session = tokenHash ? userSessions.get(tokenHash) : null;
  if (!session || session.expiresAt <= Date.now()) {
    if (session) userSessions.delete(tokenHash);
    res.status(401).json({ errors: { form: 'Please sign in again to access your account.' } });
    return null;
  }
  req.userSession = session;
  return session;
}

function requireAccountOwner(req, res) {
  const session = requireUser(req, res);
  if (!session) return null;
  if (String(req.params.email || '').trim().toLowerCase() !== session.email) {
    res.status(403).json({ errors: { form: 'You can only access your own account.' } });
    return null;
  }
  return session;
}

function requireSuperuser(req, res) {
  const session = requireAdmin(req, res);
  if (!session) return null;
  if (session.role !== 'superuser') {
    res.status(403).json({ errors: { form: 'Superuser access is required for this action.' } });
    return null;
  }
  return session;
}

app.post('/api/admin/logout', (req, res) => {
  const token = String(req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (token) adminSessions.delete(token);
  return res.json({ ok: true });
});

app.post('/api/auth/logout', (req, res) => {
  const token = String(req.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (token) userSessions.delete(hashToken(token));
  return res.json({ ok: true });
});

app.post('/api/booking-confirmation-email', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  if (
    !EMAILJS_BOOKING_SERVICE_ID ||
    !EMAILJS_BOOKING_TEMPLATE_ID ||
    !EMAILJS_BOOKING_PUBLIC_KEY
  ) {
    return res.status(503).json({
      error: 'Booking email is not configured. Set EMAILJS_BOOKING_SERVICE_ID, EMAILJS_BOOKING_TEMPLATE_ID, and EMAILJS_BOOKING_PUBLIC_KEY in backend/.env.',
    });
  }
  const booking = req.body?.booking || {};
  const email = String(booking.guestEmail || '').trim().toLowerCase();
  if (email !== session.email) {
    return res.status(403).json({ error: 'You can only send a booking email to your signed-in account.' });
  }
  const amount = Number(booking.amount);
  const adults = Number(booking.adults);
  const roomQuantity = Number(booking.roomQuantity || 1);
  const roomSharing = Number(booking.roomSharing || 2);
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    !booking.bookingReference ||
    !booking.paymentReference ||
    !booking.propertyName ||
    !/^\d{4}-\d{2}-\d{2}$/.test(String(booking.checkIn || '')) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(String(booking.checkOut || '')) ||
    !Number.isInteger(adults) || adults < 1 || adults > 27 ||
    !Number.isInteger(roomQuantity) || roomQuantity < 1 || roomQuantity > 9 ||
    !Number.isInteger(roomSharing) || roomSharing < 1 || roomSharing > 9 ||
    !Number.isFinite(amount) || amount <= 0
  ) {
    return res.status(400).json({ error: 'Booking confirmation details are incomplete or invalid.' });
  }
  const user = await getUser(email);
  if (!user || String(user.email || '').trim().toLowerCase() !== email) {
    return res.status(404).json({ error: 'The booking email must match a registered account.' });
  }
  const now = Date.now();
  const recentAttempts = (bookingEmailAttempts.get(email) || []).filter((time) => now - time < 60 * 60 * 1000);
  if (recentAttempts.length >= 3) {
    return res.status(429).json({ error: 'Too many booking emails were requested. Try again later.' });
  }
  recentAttempts.push(now);
  bookingEmailAttempts.set(email, recentAttempts);
  try {
    const amountText = new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: /^[A-Z]{3}$/.test(booking.currency || '') ? booking.currency : 'ZAR',
    }).format(amount);
    await sendEmailJsTemplate({
      templateId: EMAILJS_BOOKING_TEMPLATE_ID,
      serviceId: EMAILJS_BOOKING_SERVICE_ID,
      publicKey: EMAILJS_BOOKING_PUBLIC_KEY,
      privateKey: EMAILJS_BOOKING_PRIVATE_KEY,
      templateParams: {
        to_email: user.email,
        user_email: user.email,
        email: user.email,
        to_name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        booking_reference: String(booking.bookingReference),
        payment_reference: String(booking.paymentReference),
        property_name: String(booking.propertyName),
        attraction_name: String(booking.attractionName || ''),
        check_in: String(booking.checkIn),
        check_out: String(booking.checkOut),
        guest_count: String(adults),
        room_count: String(roomQuantity),
        room_sharing: String(roomSharing),
        nights: String(booking.nights || Math.max(1, Math.round((new Date(booking.checkOut) - new Date(booking.checkIn)) / 86400000))),
        amount: amountText,
        currency: booking.currency || 'ZAR',
        accommodation_total: new Intl.NumberFormat('en-ZA', {
          style: 'currency',
          currency: /^[A-Z]{3}$/.test(booking.currency || '') ? booking.currency : 'ZAR',
        }).format(Number(booking.accommodationTotal || 0)),
        activities_total: new Intl.NumberFormat('en-ZA', {
          style: 'currency',
          currency: 'ZAR',
        }).format(Number(booking.activitiesTotal || 0)),
        activity_names: Array.isArray(booking.activityNames) ? booking.activityNames.join(', ') : '',
        payment_method: String(booking.paymentMethod || ''),
        booking_status: 'Reservation request saved; provider confirmation is pending.',
        payment_status: 'Payment is due; payment processing is not connected yet.',
        payment_notice: 'Your reservation request and payment reference have been recorded. Accommodation confirmation and payment processing are pending.',
        app_name: 'ALL-IN-ONE-PLANNER',
      },
    });
    return res.json({ sent: true });
  } catch (error) {
    recentAttempts.pop();
    bookingEmailAttempts.set(email, recentAttempts);
    return res.status(502).json({ error: error.message || 'Could not send booking email.' });
  }
});

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

app.get('/api/users/:email/activity', async (req, res) => {
  const session = requireAccountOwner(req, res);
  if (!session) return;
  const events = await getUserAuditEvents(session.email);
  return res.json({ events });
});

app.get('/api/users/:email/profile', async (req, res) => {
  const session = requireAccountOwner(req, res);
  if (!session) return;
  const user = await getUser(session.email);
  if (!user) return res.status(404).json({ errors: { email: 'No account found.' } });
  return res.json({ user: publicUser(user) });
});

app.patch('/api/users/:email/profile', async (req, res) => {
  const session = requireAccountOwner(req, res);
  if (!session) return;
  const user = await getUser(session.email);
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
  const session = requireAccountOwner(req, res);
  if (!session) return;
  const user = await getUser(session.email);
  if (!user) return res.status(404).json({ errors: { email: 'No account found.' } });
  await recordAuditEvent({
    action: "account.deleted",
    actorEmail: user.email,
    targetEmail: user.email,
  });
  await Promise.all([removeUser(session.email), removeRegistrationChallenge(session.email)]);
  revokeUserSessions(session.email);
  return res.json({ ok: true });
});

app.get('/api/users/:email/plan', async (req, res) => {
  const session = requireAccountOwner(req, res);
  if (!session) return;
  const user = await getUser(session.email);
  if (!user) return res.status(404).json({ errors: { email: 'No account found.' } });
  return res.json({ plan: ensureUserPlan(user) });
});

app.put('/api/users/:email/plan', async (req, res) => {
  const session = requireAccountOwner(req, res);
  if (!session) return;
  const user = await getUser(session.email);
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
  const session = requireAccountOwner(req, res);
  if (!session) return;
  const user = await getUser(session.email);
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
  const session = requireAccountOwner(req, res);
  if (!session) return;
  const user = await getUser(session.email);
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
  if (!requireSuperuser(req, res)) return;
  const user = await getUser(req.params.email);
  if (!user) return res.status(404).json({ errors: { email: 'No account found.' } });
  user.firstName = String(req.body?.firstName ?? user.firstName).trim();
  user.lastName = String(req.body?.lastName ?? user.lastName).trim();
  user.nationality = String(req.body?.nationality ?? user.nationality).trim();
  if (!user.firstName || !user.lastName || !user.nationality) return res.status(400).json({ errors: { form: 'Name and nationality are required.' } });
  await saveUser(user);
  await recordAuditEvent({
    action: "admin.user.updated",
    actorEmail: req.adminSession.email,
    targetEmail: user.email,
  });
  return res.json({ user: publicUser(user) });
});

app.delete('/api/admin/users/:email', async (req, res) => {
  const adminSession = requireSuperuser(req, res);
  if (!adminSession) return;
  const email = String(req.params.email || '').trim().toLowerCase();
  if (!(await getUser(email))) return res.status(404).json({ errors: { email: 'No account found.' } });
  await recordAuditEvent({
    action: "admin.user.deleted",
    actorEmail: adminSession.email,
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
  revokeUserSessions(cleanEmail);
  return res.json({ user: publicUser(user) });
});

if (process.env.SERVE_WEB_APP === 'true') {
  const webBuildDirectory = path.join(__dirname, 'dist');
  const webIndex = path.join(webBuildDirectory, 'index.html');
  if (!fs.existsSync(webIndex)) {
    throw new Error('Web build not found. Run npm run build:web before starting the server.');
  }
  app.use(express.static(webBuildDirectory, { index: false }));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    return res.sendFile(webIndex);
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Planner API server listening on 0.0.0.0:${PORT}`);
  if (process.env.SERVE_WEB_APP === 'true') {
    console.log('Serving the Expo web app and API from this origin.');
  }
});
