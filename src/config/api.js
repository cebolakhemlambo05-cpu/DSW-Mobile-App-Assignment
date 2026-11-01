import Constants from "expo-constants";
import { Platform } from "react-native";

const configuredApiUrls = [
	process.env.EXPO_PUBLIC_API_URL,
	Constants.expoConfig?.extra?.publicApiUrl,
].filter(Boolean);

function normalizeApiBase(url) {
	const normalized = String(url).trim().replace(/\/+$/, "");
	try {
		const parsed = new URL(normalized);
		if (!["http:", "https:"].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) {
			return "";
		}
		return normalized.endsWith("/api") ? normalized : `${normalized}/api`;
	} catch {
		return "";
	}
}

const configuredApiUrl = configuredApiUrls
	.map(normalizeApiBase)
	.find(Boolean);

function resolveApiBase() {
	if (configuredApiUrl) return configuredApiUrl;
	if (configuredApiUrls.length) {
		console.warn("[api] Ignoring EXPO_PUBLIC_API_URL because it is not a valid HTTP(S) backend URL.");
	}
	if (Platform.OS === "web" && !__DEV__ && typeof window !== "undefined") {
		return `${window.location.origin}/api`;
	}

	const hostUri =
		Constants.expoConfig?.hostUri ||
		Constants.manifest2?.extra?.expoClient?.hostUri ||
		Constants.manifest?.debuggerHost;
	if (hostUri) {
		const host = String(hostUri).split(":")[0];
		if (host) return `http://${host}:3001/api`;
	}
	return "http://localhost:3001/api";
}

export const API_BASE = resolveApiBase();
export const API_BASE_URL = API_BASE.replace(/\/api\/?$/, "");

export async function fetchJson(path) {
	const apiPath = path.startsWith("/api/")
		? path
		: `/api${path.startsWith("/") ? path : `/${path}`}`;
	const response = await fetch(`${API_BASE_URL}${apiPath}`);
	if (!response.ok) throw new Error(`API returned ${response.status}`);
	return response.json();
}