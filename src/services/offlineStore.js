import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import CryptoJS from "crypto-js";

const SESSION_KEY = "planner:active-session";
const ACCOUNT_PREFIX = "planner:account:";
const PENDING_PREFIX = "planner:pending:";
const VERIFIER_PREFIX = "planner:offline-verifier:";
const PBKDF2_ITERATIONS = 120000;

function accountKey(email) {
  return `${ACCOUNT_PREFIX}${encodeURIComponent(String(email).trim().toLowerCase())}`;
}

function pendingKey(email) {
  return `${PENDING_PREFIX}${encodeURIComponent(String(email).trim().toLowerCase())}`;
}

function verifierKey(email) {
  return `${VERIFIER_PREFIX}${encodeURIComponent(String(email).trim().toLowerCase())}`;
}

async function readVerifier(key) {
  if (typeof window === "undefined") {
    return SecureStore.getItemAsync(key);
  }
  return AsyncStorage.getItem(key);
}

async function writeVerifier(key, value) {
  if (typeof window === "undefined") {
    return SecureStore.setItemAsync(key, value);
  }
  return AsyncStorage.setItem(key, value);
}

async function deleteVerifier(key) {
  if (typeof window === "undefined") {
    return SecureStore.deleteItemAsync(key);
  }
  return AsyncStorage.removeItem(key);
}

export async function saveActiveSession(user) {
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
  await saveCachedAccount(user, user.dayPlan || []);
}

export async function restoreActiveSession() {
  const session = await AsyncStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
}

export async function clearActiveSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export async function saveCachedAccount(user, dayPlan = user.dayPlan || []) {
  const cachedUser = { ...user, dayPlan };
  await AsyncStorage.setItem(accountKey(user.email), JSON.stringify(cachedUser));
}

export async function restoreCachedAccount(email) {
  const account = await AsyncStorage.getItem(accountKey(email));
  return account ? JSON.parse(account) : null;
}

export async function removeCachedAccount(email) {
  await Promise.all([
    AsyncStorage.removeItem(accountKey(email)),
    AsyncStorage.removeItem(pendingKey(email)),
    deleteVerifier(verifierKey(email)),
  ]);
}

export async function savePendingChanges(email, changes) {
  const key = pendingKey(email);
  const existing = await AsyncStorage.getItem(key);
  await AsyncStorage.setItem(key, JSON.stringify({
    ...(existing ? JSON.parse(existing) : {}),
    ...changes,
  }));
}

export async function restorePendingChanges(email) {
  const pending = await AsyncStorage.getItem(pendingKey(email));
  return pending ? JSON.parse(pending) : null;
}

export async function clearPendingChanges(email, fields) {
  const key = pendingKey(email);
  const existing = await AsyncStorage.getItem(key);
  if (!existing) return;
  const pending = JSON.parse(existing);
  fields.forEach((field) => delete pending[field]);
  if (Object.keys(pending).length) {
    await AsyncStorage.setItem(key, JSON.stringify(pending));
  } else {
    await AsyncStorage.removeItem(key);
  }
}

export async function saveOfflineVerifier(email, password) {
  const salt = Crypto.getRandomBytes(16);
  const saltHex = Array.from(salt, (byte) => byte.toString(16).padStart(2, "0")).join("");
  const hash = CryptoJS.PBKDF2(password, CryptoJS.enc.Hex.parse(saltHex), {
    keySize: 256 / 32,
    iterations: PBKDF2_ITERATIONS,
    hasher: CryptoJS.algo.SHA256,
  }).toString();
  await writeVerifier(verifierKey(email), JSON.stringify({
    salt: saltHex,
    hash,
    iterations: PBKDF2_ITERATIONS,
  }));
}

export async function verifyOfflinePassword(email, password) {
  const stored = await readVerifier(verifierKey(email));
  if (!stored) return false;
  const verifier = JSON.parse(stored);
  const candidate = CryptoJS.PBKDF2(
    password,
    CryptoJS.enc.Hex.parse(verifier.salt),
    {
      keySize: 256 / 32,
      iterations: verifier.iterations,
      hasher: CryptoJS.algo.SHA256,
    }
  ).toString();
  return candidate === verifier.hash;
}
