import { API_BASE_URL } from "../config/api";

async function request(path, options = {}) {
  let response;
  const url = `${API_BASE_URL}${path}`;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
  } catch (networkError) {
    const error = new Error(
      `Cannot reach the Travel Planner API at ${API_BASE_URL}. Start the backend with "npm run server" and, on a physical device, set EXPO_PUBLIC_API_URL to your computer's LAN address.`
    );
    error.cause = networkError;
    error.errors = { form: error.message };
    throw error;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || data.errors?.form || "Request failed");
    error.errors = data.errors;
    throw error;
  }
  return data;
}

export async function registerUser(payload) {
  return request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) });
}

export async function verifyRegistrationOtp(payload) {
  const data = await request("/api/auth/register/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.user;
}

export async function loginUser(payload) {
  return request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) });
}

export async function verifyLoginOtp(payload) {
  const data = await request("/api/auth/login/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.user;
}

export async function requestPasswordResetLink(payload) {
  return request("/api/auth/request-password-reset", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function resetUserPassword(payload) {
  const data = await request("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.user;
}

export async function saveUserPlan(email, plan) {
  const data = await request(`/api/users/${encodeURIComponent(email)}/plan`, {
    method: "PUT",
    body: JSON.stringify({ plan }),
  });
  return data.plan;
}

export async function updateUserProfile(email, profile) {
  return request(`/api/users/${encodeURIComponent(email)}/profile`, {
    method: "PATCH",
    body: JSON.stringify(profile),
  });
}

export async function deleteUserAccount(email) {
  return request(`/api/users/${encodeURIComponent(email)}`, { method: "DELETE" });
}

export async function listAdminUsers(adminEmail) {
  return request(`/api/admin/users?adminEmail=${encodeURIComponent(adminEmail)}`);
}

export async function updateAdminUser(adminEmail, email, profile) {
  return request(`/api/admin/users/${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers: { "x-admin-email": adminEmail },
    body: JSON.stringify(profile),
  });
}

export async function deleteAdminUser(adminEmail, email) {
  return request(`/api/admin/users/${encodeURIComponent(email)}`, {
    method: "DELETE",
    headers: { "x-admin-email": adminEmail },
  });
}

export { request as apiRequest };
