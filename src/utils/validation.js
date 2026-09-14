const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[\p{L}][\p{L} .'-]*$/u;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,128}$/;

export const normalizeEmail = (value = "") => value.trim().toLowerCase();

export const validateEmail = (value) => {
  const email = normalizeEmail(value);
  return email.length <= 254 && EMAIL_PATTERN.test(email);
};

export const validateName = (value) => {
  const name = value.trim();
  return name.length >= 2 && name.length <= 80 && NAME_PATTERN.test(name);
};

export const isStrongPassword = (value = "") => PASSWORD_PATTERN.test(value);

export const cleanName = (value = "") => value.replace(/[^\p{L} .'-]/gu, "").slice(0, 80);
export const cleanEmail = (value = "") => value.replace(/\s/g, "").slice(0, 254);