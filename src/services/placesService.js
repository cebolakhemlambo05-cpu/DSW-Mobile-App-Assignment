import Constants from "expo-constants";
import { Platform } from "react-native";
import { restoreActiveSession } from "./offlineStore";

// --- API base URL resolution -------------------------------------------------
// The #1 cause of "failing to fetch" on a phone/emulator is that `localhost`
// on the device refers to the device itself, not your computer running the
// Express server. This resolves your computer's LAN IP automatically from the
// Expo dev server's own address, which works for physical devices, iOS
// simulator, and Android emulator alike.
//
// Override any time by setting EXPO_PUBLIC_API_URL in a .env file at the RN
// project root, e.g.  EXPO_PUBLIC_API_URL=http://192.168.1.42:3001/api
// (useful for a production/staging backend that isn't your dev machine).

function resolveApiBase() {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (Platform.OS === "web" && !__DEV__ && typeof window !== "undefined") {
    return `${window.location.origin}/api`;
  }

  const hostUri =
    // SDK 49+ (dev client / Expo Go)
    Constants.expoConfig?.hostUri ||
    // Older SDKs / some manifest shapes
    Constants.manifest2?.extra?.expoClient?.hostUri ||
    Constants.manifest?.debuggerHost;

  if (hostUri) {
    const host = String(hostUri).split(":")[0];
    if (host) return `http://${host}:3001/api`;
  }

  // Fallback: works on iOS simulator only (it shares the host's network stack).
  console.warn(
    "[placesService] Could not detect the Metro dev server host — falling back to localhost, " +
      "which will NOT work on a physical device or Android emulator. " +
      "Set EXPO_PUBLIC_API_URL in your .env to fix this."
  );
  return "http://localhost:3001/api";
}

const API_BASE = resolveApiBase();
console.log("[placesService] API_BASE =", API_BASE);

const REQUEST_TIMEOUT_MS = 20000;

async function readApiJson(response, endpointName) {
  const body = await response.text();
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    if (response.status === 404 || /^\s*<!doctype html|^\s*<html/i.test(body)) {
      throw new Error(
        `The backend at ${API_BASE} does not have the ${endpointName} endpoint yet. Stop the old server and restart it from the app folder with "node server.js".`
      );
    }
    throw new Error(`${endpointName} service returned a non-JSON response (HTTP ${response.status}).`);
  }
  return data;
}

export async function fetchSouthAfricaAttractions({
  query = "",
  category = "All",
  budget = 8000,
  signal,
} = {}) {
  const url = new URL(`${API_BASE}/attractions`);
  if (query.trim()) url.searchParams.set("query", query.trim());
  if (category && category !== "All") url.searchParams.set("category", category);
  url.searchParams.set("budget", String(budget));

  // Combine the caller's AbortSignal (used to cancel stale in-flight requests,
  // e.g. when the user keeps typing) with our own request timeout.
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);
  if (signal) {
    signal.addEventListener("abort", () => timeoutController.abort());
  }

  let response;
  try {
    response = await fetch(url.toString(), { signal: timeoutController.signal });
  } catch (error) {
    clearTimeout(timeoutId);
    if (error?.name === "AbortError") {
      // Either the caller cancelled it (new search typed) or it genuinely timed out.
      throw error;
    }
    // This is what a dead/unreachable backend looks like (wrong IP, server not
    // running, phone not on the same network, firewall blocking the port).
    throw new Error(
      `Could not reach the backend at ${API_BASE}. Is the server running, and is your phone ` +
        `on the same Wi-Fi network as your computer? (${error?.message ?? error})`
    );
  }
  clearTimeout(timeoutId);

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Backend returned a non-JSON response (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(data?.error || `Backend error (HTTP ${response.status}).`);
  }

  return Array.isArray(data.attractions) ? data.attractions : [];
}

export async function fetchAccommodationOffers({
  latitude,
  longitude,
  attractionName,
  attractionLocation,
  checkInDate,
  checkOutDate,
  adults = 2,
  roomQuantity = 1,
  signal,
} = {}) {
  const url = new URL(`${API_BASE}/hotels`);
  if (Number.isFinite(latitude)) url.searchParams.set("lat", String(latitude));
  if (Number.isFinite(longitude)) url.searchParams.set("lng", String(longitude));
  if (attractionName) url.searchParams.set("attractionName", attractionName);
  if (attractionLocation) url.searchParams.set("attractionLocation", attractionLocation);
  if (checkInDate) url.searchParams.set("checkInDate", checkInDate);
  if (checkOutDate) url.searchParams.set("checkOutDate", checkOutDate);
  url.searchParams.set("adults", String(adults));
  url.searchParams.set("roomQuantity", String(roomQuantity));

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);
  if (signal) signal.addEventListener("abort", () => timeoutController.abort(), { once: true });

  try {
    const response = await fetch(url.toString(), { signal: timeoutController.signal });
    const data = await readApiJson(response, "Hotel offers");
    if (!response.ok) throw new Error(data?.error || `Hotel backend error (HTTP ${response.status}).`);
    return {
      hotels: Array.isArray(data.hotels) ? data.hotels : [],
      hotelWarning:
        typeof data.hotelWarning === "string" ? data.hotelWarning : "",
      photoWarning:
        typeof data.photoWarning === "string" ? data.photoWarning : "",
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function sendBookingConfirmationEmail(booking) {
  const session = await restoreActiveSession();
  const response = await fetch(`${API_BASE}/booking-confirmation-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
    },
    body: JSON.stringify({ booking }),
  });
  const data = await readApiJson(response, "Booking confirmation email");
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(data?.errors?.form || "Your app sign-in session expired. Sign out and sign in again, then retry the booking email.");
    }
    throw new Error(data?.error || data?.errors?.form || `Email service failed (HTTP ${response.status}).`);
  }
  return data;
}

export async function fetchNearbyPlaces({
  latitude,
  longitude,
  category,
  signal,
} = {}) {
  const url = new URL(`${API_BASE}/nearby-places`);
  if (Number.isFinite(latitude)) url.searchParams.set("lat", String(latitude));
  if (Number.isFinite(longitude)) url.searchParams.set("lng", String(longitude));
  url.searchParams.set("category", String(category || "all"));

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 45000);
  const abortRequest = () => timeoutController.abort();
  if (signal) signal.addEventListener("abort", abortRequest, { once: true });

  try {
    const response = await fetch(url.toString(), { signal: timeoutController.signal });
    const data = await readApiJson(response, "Nearby places");
    if (!response.ok) {
      throw new Error(data?.error || `Nearby places request failed (HTTP ${response.status}).`);
    }
    if (!Array.isArray(data.places)) {
      throw new Error("Nearby places service returned an invalid response.");
    }
    return {
      places: data.places,
      warning: typeof data.warning === "string" ? data.warning : "",
    };
  } catch (error) {
    if (error?.name === "AbortError") {
      if (signal?.aborted) throw error;
      throw new Error("Nearby places request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw new Error(`Could not reach the nearby places service at ${API_BASE}. (${error.message})`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    if (signal) signal.removeEventListener("abort", abortRequest);
  }
}

export async function fetchDrivingDistances({
  places,
  attraction,
  userLocation,
  signal,
} = {}) {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);
  const abortRequest = () => timeoutController.abort();
  if (signal) signal.addEventListener("abort", abortRequest, { once: true });

  try {
    const response = await fetch(`${API_BASE}/route-distances`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ places, attraction, userLocation }),
      signal: timeoutController.signal,
    });
    const data = await readApiJson(response, "Routes API driving distance");
    if (!response.ok) {
      throw new Error(data?.error || `Driving distance request failed (HTTP ${response.status}).`);
    }
    if (!data.routesToAttraction || !data.routesFromUser) {
      throw new Error("Routes service returned invalid driving distances.");
    }
    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      if (signal?.aborted) throw error;
      throw new Error("Driving distance request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw new Error(`Could not reach the Routes service at ${API_BASE}. (${error.message})`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    if (signal) signal.removeEventListener("abort", abortRequest);
  }
}

export async function fetchWeatherForecast({
  latitude,
  longitude,
  days = 7,
  signal,
} = {}) {
  const url = new URL(`${API_BASE}/weather`);
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lng", String(longitude));
  url.searchParams.set("days", String(days));

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);
  const abortRequest = () => timeoutController.abort();
  if (signal) signal.addEventListener("abort", abortRequest, { once: true });

  try {
    const response = await fetch(url.toString(), { signal: timeoutController.signal });
    const data = await readApiJson(response, "Weather");
    if (!response.ok) {
      throw new Error(data?.error || `Weather request failed (HTTP ${response.status}).`);
    }
    if (!Array.isArray(data.days)) {
      throw new Error("Weather service returned an invalid forecast.");
    }
    return data;
  } catch (error) {
    if (error?.name === "AbortError") {
      if (signal?.aborted) throw error;
      throw new Error("Weather request timed out. Please try again.");
    }
    if (error instanceof TypeError) {
      throw new Error(`Could not reach the weather service at ${API_BASE}. (${error.message})`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
    if (signal) signal.removeEventListener("abort", abortRequest);
  }
}

async function postAuth(path, payload, returnResponse = false) {
  let response;
  let data;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    data = await response.json();
  } catch (error) {
    const networkError = new Error(
      `Could not reach the account server at ${API_BASE}. Start node server.js and try again.`
    );
    networkError.code = 'NETWORK_UNAVAILABLE';
    throw networkError;
  }
  if (!response.ok) {
    const error = new Error(
      data?.errors?.form ||
        data?.errors?.email ||
        'Authentication request failed.'
    );
    error.errors =
      data?.errors && Object.keys(data.errors).length > 0
        ? data.errors
        : { form: error.message };
    throw error;
  }
  return returnResponse ? data : data.user;
}

export const registerUser = (payload) =>
  postAuth('/auth/register', payload, true);
export const resetUserPassword = (payload) =>
  postAuth('/auth/reset-password', payload);

export async function loginUser(payload) {
  let response;
  let data;
  try {
    response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    data = await response.json();
  } catch (error) {
    const networkError = new Error(
      `Could not reach the account server at ${API_BASE}. Start node server.js and try again.`
    );
    networkError.code = 'NETWORK_UNAVAILABLE';
    throw networkError;
  }

  if (!response.ok) {
    const error = new Error(
      data?.errors?.form ||
        data?.errors?.email ||
        'Authentication request failed.'
    );
    error.errors =
      data?.errors && Object.keys(data.errors).length > 0
        ? data.errors
        : { form: error.message };
    throw error;
  }

  return data;
}

export async function getAdminRoleHint(email) {
  try {
    const response = await fetch(
      `${API_BASE}/auth/admin-role?email=${encodeURIComponent(String(email || '').trim().toLowerCase())}`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.role || null;
  } catch {
    return null;
  }
}

export const verifyLoginOtp = (payload) =>
  postAuth('/auth/login/verify-otp', payload);
export const verifyRegistrationOtp = (payload) =>
  postAuth('/auth/register/verify-otp', payload);

async function accountRequest(path, { method = 'GET', body, adminToken } = {}) {
  let response;
  let data;
  try {
    const session = adminToken ? null : await restoreActiveSession();
    const accessToken = adminToken || session?.accessToken;
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    data = await response.json();
  } catch (error) {
    throw new Error(
      `Could not reach the account server at ${API_BASE}. Start node server.js and try again.`
    );
  }
  if (!response.ok) {
    const error = new Error(
      data?.errors?.form || data?.errors?.email || 'Account request failed.'
    );
    error.errors = data?.errors || { form: error.message };
    error.status = response.status;
    throw error;
  }
  return data;
}

export const fetchUserProfile = (email) =>
  accountRequest(`/users/${encodeURIComponent(email)}/profile`);
export const fetchUserActivity = (email) =>
  accountRequest(`/users/${encodeURIComponent(email)}/activity`);
export const updateUserProfile = (email, profile) =>
  accountRequest(`/users/${encodeURIComponent(email)}/profile`, {
    method: 'PATCH',
    body: profile,
  });
export const deleteUserAccount = (email) =>
  accountRequest(`/users/${encodeURIComponent(email)}`, { method: 'DELETE' });
export const fetchUserPlan = (email) =>
  accountRequest(`/users/${encodeURIComponent(email)}/plan`);
export const saveUserPlan = (email, plan) =>
  accountRequest(`/users/${encodeURIComponent(email)}/plan`, {
    method: 'PUT',
    body: { plan },
  });
export const addUserPlanEntry = (email, entry) =>
  accountRequest(`/users/${encodeURIComponent(email)}/plan`, {
    method: 'POST',
    body: { entry },
  });
export const removeUserPlanEntry = (email, attractionId) =>
  accountRequest(
    `/users/${encodeURIComponent(email)}/plan/${encodeURIComponent(attractionId)}`,
    { method: 'DELETE' }
  );
export const fetchAdminUsers = (adminToken) =>
  accountRequest('/admin/users', { adminToken });
export const fetchAdminAuditEvents = (adminToken) =>
  accountRequest('/admin/audit-events', { adminToken });
export const fetchAdminHealth = (adminToken) =>
  accountRequest('/admin/health', { adminToken });
export const logoutAdmin = (adminToken) =>
  accountRequest('/admin/logout', { method: 'POST', adminToken });
export const logoutUser = () => accountRequest('/auth/logout', { method: 'POST' });
export const updateAdminUser = (adminToken, email, profile) =>
  accountRequest(`/admin/users/${encodeURIComponent(email)}`, {
    method: 'PATCH',
    body: profile,
    adminToken,
  });
export const deleteAdminUser = (adminToken, email) =>
  accountRequest(`/admin/users/${encodeURIComponent(email)}`, {
    method: 'DELETE',
    adminToken,
  });

export async function requestPasswordResetLink(payload) {
  let response;
  let data;
  try {
    response = await fetch(`${API_BASE}/auth/request-password-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    data = await response.json();
  } catch (error) {
    throw new Error(`Could not reach the account server at ${API_BASE}. Start node server.js and try again.`);
  }

  if (!response.ok) {
    const error = new Error(data?.errors?.form || data?.errors?.email || "Password reset request failed.");
    error.errors = data?.errors && Object.keys(data.errors).length > 0
      ? data.errors
      : { form: error.message };
    throw error;
  }

  return data;
}

export { API_BASE };
