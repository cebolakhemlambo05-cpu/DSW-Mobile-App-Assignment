const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001";

export const API_BASE_URL = configuredApiUrl.replace(/\/+$/, "");

export async function fetchJson(path) {
	let response;
	try {
		response = await fetch(`${API_BASE_URL}${path}`);
	} catch (networkError) {
		const error = new Error(
			`Cannot reach the Travel Planner API at ${API_BASE_URL}. Start the backend with "npm run server" and check EXPO_PUBLIC_API_URL.`
		);
		error.cause = networkError;
		throw error;
	}
	if (!response.ok) throw new Error(`API returned ${response.status}`);
	return response.json();
}
