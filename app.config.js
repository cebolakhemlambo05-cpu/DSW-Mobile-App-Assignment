const fs = require("node:fs");
const path = require("node:path");
const dotenv = require("dotenv");

function readPublicApiUrl(filePath) {
  if (!fs.existsSync(filePath)) return "";
  return dotenv.parse(fs.readFileSync(filePath, "utf8")).EXPO_PUBLIC_API_URL || "";
}

function isHttpUrl(value) {
  try {
    const url = new URL(String(value).trim());
    return (
      ["http:", "https:"].includes(url.protocol) &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

function readEasPreviewApiUrl() {
  const filePath = path.join(__dirname, "eas.json");
  if (!fs.existsSync(filePath)) return "";
  const easConfig = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return easConfig.build?.preview?.env?.EXPO_PUBLIC_API_URL || "";
}

const apiUrlCandidates = [
  process.env.EXPO_PUBLIC_API_URL,
  readPublicApiUrl(path.join(__dirname, ".env")),
  readPublicApiUrl(path.join(__dirname, "backend", ".env")),
  readEasPreviewApiUrl(),
].filter(Boolean);
const publicApiUrl = apiUrlCandidates.find(isHttpUrl) || "";

if (apiUrlCandidates.some((candidate) => !isHttpUrl(candidate))) {
  console.warn(
    "Ignoring an invalid EXPO_PUBLIC_API_URL. Set it to an HTTP(S) backend URL; never put API keys in this variable."
  );
}

if (publicApiUrl) {
  process.env.EXPO_PUBLIC_API_URL = publicApiUrl;
} else {
  delete process.env.EXPO_PUBLIC_API_URL;
}

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    ...(publicApiUrl ? { publicApiUrl } : {}),
  },
});
