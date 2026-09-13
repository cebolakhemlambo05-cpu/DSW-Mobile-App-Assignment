export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:4000";

export async function fetchJson(path) {
	const response = await fetch(`${API_BASE_URL}${path}`);
	if (!response.ok) throw new Error(`API returned ${response.status}`);
	return response.json();
}