import Constants from "expo-constants";

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
  checkInDate,
  checkOutDate,
  adults = 2,
  roomQuantity = 1,
  signal,
} = {}) {
  const url = new URL(`${API_BASE}/hotels`);
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lng", String(longitude));
  if (checkInDate) url.searchParams.set("checkInDate", checkInDate);
  if (checkOutDate) url.searchParams.set("checkOutDate", checkOutDate);
  url.searchParams.set("adults", String(adults));
  url.searchParams.set("roomQuantity", String(roomQuantity));

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);
  if (signal) signal.addEventListener("abort", () => timeoutController.abort(), { once: true });

  try {
    const response = await fetch(url.toString(), { signal: timeoutController.signal });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error || `Hotel backend error (HTTP ${response.status}).`);
    return Array.isArray(data.hotels) ? data.hotels : [];
  } finally {
    clearTimeout(timeoutId);
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
    throw new Error(
      `Could not reach the account server at ${API_BASE}. Start node server.js and try again.`
    );
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
    throw new Error(
      `Could not reach the account server at ${API_BASE}. Start node server.js and try again.`
    );
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

export const verifyLoginOtp = (payload) =>
  postAuth('/auth/login/verify-otp', payload);
export const verifyRegistrationOtp = (payload) =>
  postAuth('/auth/register/verify-otp', payload);

async function accountRequest(path, { method = 'GET', body, adminEmail } = {}) {
  let response;
  let data;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(adminEmail ? { 'x-admin-email': adminEmail } : {}),
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
    throw error;
  }
  return data;
}

export const fetchUserProfile = (email) =>
  accountRequest(`/users/${encodeURIComponent(email)}/profile`);
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
export const fetchAdminUsers = (adminEmail) =>
  accountRequest('/admin/users', { adminEmail });
export const updateAdminUser = (adminEmail, email, profile) =>
  accountRequest(`/admin/users/${encodeURIComponent(email)}`, {
    method: 'PATCH',
    body: profile,
    adminEmail,
  });
export const deleteAdminUser = (adminEmail, email) =>
  accountRequest(`/admin/users/${encodeURIComponent(email)}`, {
    method: 'DELETE',
    adminEmail,
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
