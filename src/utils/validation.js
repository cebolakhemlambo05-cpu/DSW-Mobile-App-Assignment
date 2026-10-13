export function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

export const cleanEmail = normalizeEmail;

export function cleanName(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

export function validateEmail(value) {
  return /^\S+@\S+\.\S+$/.test(normalizeEmail(value));
}

export function validateName(value) {
  return /^[A-Za-zÀ-ÖØ-öø-ÿ.' -]{2,80}$/.test(cleanName(value));
}

export function isStrongPassword(value) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(
    String(value || "")
  );
}
