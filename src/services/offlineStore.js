import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";
import CryptoJS from "crypto-js";

const SESSION_KEY = "planner:active-session";
const ACCOUNT_PREFIX = "planner:account:";
const PENDING_PREFIX = "planner:pending:";
const VERIFIER_PREFIX = "planner_offline_verifier_";
const LEGACY_VERIFIER_PREFIX = "planner:offline-verifier:";
const AUTH_TOKENS_KEY = "planner_auth_tokens";
const LEGACY_AUTH_TOKENS_KEY = "planner:auth-tokens";
const PBKDF2_ITERATIONS = 120000;

async function readAuthTokens() {
  let stored;
  if (Platform.OS !== "web") {
    stored = await SecureStore.getItemAsync(AUTH_TOKENS_KEY);
  } else {
    stored = await AsyncStorage.getItem(AUTH_TOKENS_KEY);
    if (!stored) stored = await AsyncStorage.getItem(LEGACY_AUTH_TOKENS_KEY);
  }
  return stored ? JSON.parse(stored) : {};
}

async function writeAuthTokens(tokens) {
  const serialized = JSON.stringify(tokens);
  if (Platform.OS !== "web") {
    return SecureStore.setItemAsync(AUTH_TOKENS_KEY, serialized);
  }
  return AsyncStorage.setItem(AUTH_TOKENS_KEY, serialized);
}

async function deleteAuthTokens() {
  if (Platform.OS !== "web") {
    return SecureStore.deleteItemAsync(AUTH_TOKENS_KEY);
  }
  return Promise.all([
    AsyncStorage.removeItem(AUTH_TOKENS_KEY),
    AsyncStorage.removeItem(LEGACY_AUTH_TOKENS_KEY),
  ]);
}

function accountKey(email) {
  return `${ACCOUNT_PREFIX}${encodeURIComponent(String(email).trim().toLowerCase())}`;
}

function pendingKey(email) {
  return `${PENDING_PREFIX}${encodeURIComponent(String(email).trim().toLowerCase())}`;
}

function verifierKey(email) {
  const normalizedEmail = String(email).trim().toLowerCase();
  return `${VERIFIER_PREFIX}${CryptoJS.SHA256(normalizedEmail).toString()}`;
}

function legacyVerifierKey(email) {
  return `${LEGACY_VERIFIER_PREFIX}${encodeURIComponent(String(email).trim().toLowerCase())}`;
}

async function readVerifier(key, email) {
  if (Platform.OS !== "web") {
    return SecureStore.getItemAsync(key);
  }
  const stored = await AsyncStorage.getItem(key);
  return stored || AsyncStorage.getItem(legacyVerifierKey(email));
}

async function writeVerifier(key, value) {
  if (Platform.OS !== "web") {
    return SecureStore.setItemAsync(key, value);
  }
  return AsyncStorage.setItem(key, value);
}

async function deleteVerifier(key, email) {
  if (Platform.OS !== "web") {
    return SecureStore.deleteItemAsync(key);
  }
  return Promise.all([
    AsyncStorage.removeItem(key),
    AsyncStorage.removeItem(legacyVerifierKey(email)),
  ]);
}

export async function saveActiveSession(user) {
  const { accessToken, adminToken, ...sessionData } = user;
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
  await writeAuthTokens({ accessToken, adminToken });
  await saveCachedAccount(sessionData, user.dayPlan || []);
}

export async function restoreActiveSession() {
  const session = await AsyncStorage.getItem(SESSION_KEY);
  if (!session) return null;
  const [sessionData, tokens] = await Promise.all([
    Promise.resolve(JSON.parse(session)),
    readAuthTokens(),
  ]);
  return { ...sessionData, ...tokens };
}

export async function clearActiveSession() {
  await Promise.all([AsyncStorage.removeItem(SESSION_KEY), deleteAuthTokens()]);
}

export async function saveCachedAccount(user, dayPlan = user.dayPlan || []) {
  const { accessToken, adminToken, ...userData } = user;
  const cachedUser = { ...userData, dayPlan };
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
    deleteVerifier(verifierKey(email), email),
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
  const stored = await readVerifier(verifierKey(email), email);
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
