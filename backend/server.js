import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const backendDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(backendDirectory, ".env") });

const app = express();
const port = Number(process.env.PORT || 4000);
const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";
const NOMINATIM_USER_AGENT =
  "AllInOnePlanner/1.0 (South Africa travel planning app)";
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS || 10 * 60 * 1000);
const cache = new Map();
let lastRequestAt = 0;
let requestQueue = Promise.resolve();

app.use(cors());
app.use(express.json());

function categoryForResult(result) {
  const detail = `${result.class || ""} ${result.type || ""} ${
    result.display_name || ""
  }`.toLowerCase();
  if (/mountain|peak|volcano|cliff/.test(detail)) return "Mountains";
  if (/beach|coast|coastal|bay|ocean|harbour|cape/.test(detail)) return "Coast";
  if (/wildlife|zoo|national_park|nature_reserve|game_reserve|safari|park/.test(detail)) {
    return "Wildlife";
  }
  return "City";
}

function mapAttraction(result) {
  const latitude = Number(result.lat);
  const longitude = Number(result.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const category = categoryForResult(result);
  const name =
    result.name ||
    result.namedetails?.name ||
    result.display_name?.split(",")[0] ||
    "South Africa attraction";
  const images = {
    Wildlife:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1000&h=650&fit=crop&auto=format",
    Mountains:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&h=650&fit=crop&auto=format",
    Coast:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&h=650&fit=crop&auto=format",
    City:
      "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1000&h=650&fit=crop&auto=format",
  };
  const address = Object.values(result.address || {}).filter(Boolean);
  return {
    id: `osm-attraction:${result.osm_type || "place"}:${result.osm_id || `${latitude},${longitude}`}`,
    name,
    location: address.slice(1, 4).join(", ") || "South Africa",
    category,
    image: images[category],
    description:
      result.extratags?.description ||
      `${name} is a mapped OpenStreetMap result. Check the linked map for current visitor information.`,
    websiteUri: result.extratags?.website || result.extratags?.url || "",
    source: "OpenStreetMap",
    localFav: false,
    rating: null,
    map: { latitude, longitude, mapQuery: `${latitude},${longitude}` },
    accommodations: [],
    activities: [],
    osmAttribution: "© OpenStreetMap contributors",
  };
}

function queueNominatimRequest(url) {
  const request = requestQueue.then(async () => {
    const waitMs = Math.max(0, 1000 - (Date.now() - lastRequestAt));
    if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
    lastRequestAt = Date.now();

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": NOMINATIM_USER_AGENT,
        },
        signal: controller.signal,
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(
          payload.error || `OpenStreetMap search failed (HTTP ${response.status})`
        );
      }
      if (!Array.isArray(payload)) {
        throw new Error("OpenStreetMap search returned an invalid response");
      }
      return payload;
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("OpenStreetMap attraction search timed out");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  });
  requestQueue = request.then(
    () => undefined,
    () => undefined
  );
  return request;
}

app.get("/health", (_req, res) =>
  res.json({ ok: true, attractionSearch: "OpenStreetMap" })
);

app.get("/api/attractions", async (req, res) => {
  const query = typeof req.query.query === "string" ? req.query.query.trim().slice(0, 100) : "";
  const cacheKey = query.toLowerCase() || "south africa";
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return res.json({
      data: cached.value,
      cached: true,
      source: "OpenStreetMap",
      attribution: "© OpenStreetMap contributors",
    });
  }

  const url = new URL(NOMINATIM_ENDPOINT);
  url.searchParams.set("q", `${query || "tourist attractions"} South Africa`);
  url.searchParams.set("countrycodes", "za");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("extratags", "1");
  url.searchParams.set("namedetails", "1");
  url.searchParams.set("limit", "10");

  try {
    const data = (await queueNominatimRequest(url))
      .map(mapAttraction)
      .filter(Boolean);
    cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, value: data });
    return res.json({
      data,
      source: "OpenStreetMap",
      attribution: "© OpenStreetMap contributors",
    });
  } catch (error) {
    console.error("Attraction request failed:", error);
    return res.status(502).json({ error: error.message });
  }
});

app.listen(port, () => console.log(`Planner API listening on http://localhost:${port}`));
