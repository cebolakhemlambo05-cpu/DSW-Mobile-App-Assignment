// fetch-attraction-images.js
//
// Looks up each attraction on Wikipedia (free REST API, no key, no billing)
// and rewrites the `image: "..."` line for that attraction in attractions.jsx
// with a real, working photo URL.
//
// Usage:
//   node fetch-attraction-images.js
//
// Run this from the same folder as attractions.jsx. It writes the result to
// attractions.updated.jsx — check it looks right, then rename it over the
// original (or just diff the `image:` lines and copy them across by hand).

const fs = require("fs");
const path = require("path");

const SOURCE_FILE = path.join(__dirname, "attractions.jsx");
const OUTPUT_FILE = path.join(__dirname, "attractions.updated.jsx");

// Wikipedia asks that API clients identify themselves with a descriptive
// User-Agent — this isn't a key, just good-citizen etiquette.
const HEADERS = {
  "User-Agent": "SafariPlannerImageFetcher/1.1 (personal project)",
  Accept: "application/json",
};

const REQUEST_GAP_MS = 1800;

// A few attraction names are ambiguous (common words, or match other things
// on Wikipedia) — override the search query for those specifically. Every
// other attraction just searches "<name> South Africa".
const SEARCH_OVERRIDES = {
  23: "Sun City South Africa resort",
  24: "V&A Waterfront Cape Town",
  28: "Wild Coast South Africa",
  30: "Hole in the Wall Eastern Cape rock formation",
  19: "Boulders Beach South Africa penguins",
  13: "Hluhluwe-Imfolozi Park",
  44: "Transkei Wild Coast",
};

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Wraps fetch with retry-on-throttle behaviour. Wikipedia will 429 (or
// sometimes just refuse) if you hit it too fast — this backs off and tries
// again a couple of times instead of silently giving up.
async function fetchWithRetry(url, { retries = 4, baseDelayMs = 2000 } = {}) {
  let lastStatus = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(url, { headers: HEADERS });
    if (res.ok) return res;
    lastStatus = res.status;
    if (res.status === 429 || res.status >= 500) {
      const retryAfter = Number(res.headers.get("retry-after"));
      const wait = Number.isFinite(retryAfter)
        ? Math.max(baseDelayMs, retryAfter * 1000)
        : baseDelayMs * Math.pow(2, attempt);
      console.warn(`    (HTTP ${res.status} — backing off ${wait}ms, attempt ${attempt + 1}/${retries + 1})`);
      await sleep(wait);
      continue;
    }
    break; // not a retryable status (e.g. 404) — stop immediately
  }
  const err = new Error(`HTTP ${lastStatus}`);
  err.status = lastStatus;
  throw err;
}

// Search and request the page image in one API call. This avoids the second
// request that made the old script hit Wikipedia's rate limit so quickly.
async function fetchImageForQuery(query) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(
    query
  )}&gsrlimit=1&prop=pageimages&piprop=original|thumbnail&pithumbsize=1600&format=json&origin=*`;
  const res = await fetchWithRetry(url);
  const data = await res.json();
  const pages = data?.query?.pages;
  const page = pages ? Object.values(pages)[0] : null;
  return {
    title: page?.title || null,
    image: page?.original?.source || page?.thumbnail?.source || null,
  };
}

async function getImageForAttraction(id, name) {
  const query = SEARCH_OVERRIDES[id] || `${name} South Africa`;
  try {
    const result = await fetchImageForQuery(query);
    if (!result.title) {
      console.warn(`  ✗ [${id}] No Wikipedia match for "${query}"`);
      return null;
    }
    if (!result.image) {
      console.warn(`  ✗ [${id}] "${result.title}" has no usable photo`);
      return null;
    }
    console.log(`  ✓ [${id}] ${name} -> ${result.title}`);
    return result.image;
  } catch (error) {
    console.warn(`  ✗ [${id}] ${name} failed: ${error.message}`);
    return null;
  }
}

async function main() {
  if (!fs.existsSync(SOURCE_FILE)) {
    console.error(`Could not find attractions.jsx at ${SOURCE_FILE}`);
    process.exit(1);
  }

  let content = fs.readFileSync(SOURCE_FILE, "utf8");

  // Pull out {id, name} pairs directly from the file so this script stays in
  // sync even if you add/remove/reorder attractions later.
  const entryPattern = /id:\s*(\d+),\s*\n\s*name:\s*"([^"]*)"/g;
  const entries = [];
  let match;
  while ((match = entryPattern.exec(content)) !== null) {
    entries.push({ id: Number(match[1]), name: match[2] });
  }

  console.log(`Found ${entries.length} attractions. Looking up photos on Wikipedia...\n`);

  let updated = 0;
  for (const { id, name } of entries) {
    const image = await getImageForAttraction(id, name);
    await sleep(REQUEST_GAP_MS); // pace requests to avoid Wikipedia throttling

    if (!image) continue;

    // Replace only the `image:` line that immediately follows this
    // attraction's `id:`/`name:` pair (not any other attraction's).
    const targeted = new RegExp(
      `(id:\\s*${id},\\s*\\n\\s*name:\\s*"${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}",\\s*\\n\\s*image:\\s*")[^"]*(")`
    );
    if (targeted.test(content)) {
      content = content.replace(targeted, `$1${image}$2`);
      updated++;
    } else {
      console.warn(`  ⚠️  [${id}] Found an image but couldn't locate the line to replace — check formatting near "${name}"`);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, content, "utf8");
  console.log(`\nDone. Updated ${updated}/${entries.length} attraction images.`);
  console.log(`Written to: ${OUTPUT_FILE}`);
  console.log(`Review it, then replace your attractions.jsx with this file.`);
}

main();