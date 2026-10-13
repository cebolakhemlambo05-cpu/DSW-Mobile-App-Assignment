# ALL-IN-ONE-PLANNER — React Native (Expo)

A port of the web prototype to a real React Native app, using Expo + plain `StyleSheet` (no NativeWind).

## Run it

```bash
npm install
npx expo start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with the **Expo Go** app on your phone.

## API configuration

The backend keeps optional API keys off the device. Create `backend/.env` with:

```env
PORT=3001
HOTEL_API_PROVIDER=none
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=replace_with_a_strong_unique_password
```

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to your admin login credentials in `backend/.env`; do not put them in the app or share/commit that file. Restart the backend after changing credentials.

Start the API with `node server.js` from the project root, then start Expo. Nearby accommodations, restaurants, fuel stops, and searched attractions use OpenStreetMap; no API key or account is required. The curated attraction catalog remains available when a remote attraction search is unavailable. Live hotel offers can optionally come from Amadeus when configured.

### Firestore account and day-plan storage

The API stores registered accounts, OTP challenges, and saved day plans in Cloud Firestore using the Firebase Admin SDK. Put the downloaded service-account JSON file in `backend/`; the provided `.gitignore` excludes Firebase Admin key files. Never add a service-account key to the app, share it, or commit it. If you use a different filename or location, set `FIREBASE_SERVICE_ACCOUNT_PATH` in `backend/.env` to its path relative to the project root. The service account must belong to the same Firebase project where you created Firestore. The backend requires Node.js 22 or newer.

To import the existing `data/app-data.json` records, run this once from the project root:

```bash
npm run migrate:firestore
```

The migration writes accounts to `plannerUsers`, pending registration OTPs to `plannerRegistrationChallenges`, and a completion marker to `plannerMetadata`. It leaves the original JSON file unchanged and refuses to repeat a completed migration unless `--force` is explicitly provided. After a successful migration, start the backend with `npm run server`. The Firestore Admin SDK bypasses Firestore security rules; the app uses the backend API rather than direct client database access.

The admin console includes user search and filters, 7/30-day registration and plan-save trends, API/Firestore reachability checks, and a CSV export limited to names, email addresses, nationality, join date, and saved-destination counts. Account and plan changes are recorded in the `plannerAuditEvents` collection; the console displays the latest 100 events. Audit history starts when this feature is deployed and does not reconstruct earlier changes. Event records exclude passwords, profile photos, and itinerary contents.

Attraction search calls `GET /api/attractions?query=mountains` and combines OpenStreetMap/Nominatim results with the curated local attraction catalog. Search results include mapped coordinates and contributor-provided details when available, but images are representative category images and ratings and visitor information are not verified. Nominatim is a community service with strict fair-use limits; the backend serializes requests, waits at least one second between searches, and briefly caches results. Display `© OpenStreetMap contributors` attribution wherever these results are shown.

The attraction detail screen queries nearby stays, restaurants, and fuel from `GET /api/nearby-places?lat=...&lng=...&category=all`. The backend posts a small-radius query to `https://overpass-api.de/api/interpreter` and retries via `https://overpass.kumi.systems/api/interpreter` if the primary public server is unavailable. Overpass results include mapped names and coordinates when contributors have recorded them; the app calculates approximate straight-line distances and can request driving routes separately. OSM does not provide dependable prices, ratings, booking availability, or photos. Public Overpass servers can be busy and enforce fair-use limits, so results are cached briefly and failures are reported. Display `© OpenStreetMap contributors` attribution wherever these results are shown.

Google Routes API (`POST /api/route-distances`) can calculate driving distance and estimated time only for entries with verified coordinates. It is optional and requires a separate `GOOGLE_ROUTES_API_KEY` in `backend/.env`; this endpoint is distinct from Places API and may require Google Cloud billing. Opening Google Maps directions from the app uses a Maps URL and does not call Places API.

When no hotel-offer provider is configured, accommodation cards use nearby OpenStreetMap listings with unknown prices and availability. Property details, photos, prices, ratings, and availability are shown only when provided by the configured hotel provider or mapped OSM tags. Confirm rates and availability directly with the property or a booking provider.

To show live hotel offers and nightly prices, configure Amadeus credentials in `backend/.env` and set `HOTEL_API_PROVIDER=amadeus`:

```env
HOTEL_API_PROVIDER=amadeus
HOTEL_API_KEY=your_amadeus_client_id
HOTEL_API_SECRET=your_amadeus_client_secret
```

The hotel search currently requests rates for default dates seven and nine days from today (two nights), with two adults and one room; the backend API can accept explicit dates and occupancy, but the screen does not yet provide date or guest selectors. Prices and availability depend on Amadeus offers and may be unavailable for some properties. Keep Google and hotel-provider keys on the server. The app opens Google Maps directions with the selected accommodation name as the origin and the attraction as the destination; this uses a Maps directions link rather than requesting an in-app route from the Routes API.

OpenStreetMap search results are briefly cached in memory to reduce requests to public services. Restart the backend to clear this cache.

The attraction detail screen also shows a seven-day forecast for the attraction coordinates. The backend requests daily conditions from Open-Meteo; no weather API key is needed. Forecast details include daily high/low temperature, precipitation chance, and maximum wind speed.

## What changed vs. the web version

| Web | React Native |
|---|---|
| `div` / `span` | `View` / `Text` (all text **must** be inside `<Text>`) |
| Tailwind classes | `StyleSheet.create` objects, one per file |
| Inline `<svg>` icons | `react-native-svg` components (`src/components/Icons.jsx`) |
| `<input type="range">` | `@react-native-community/slider` (`src/components/BudgetSlider.tsx`) |
| Bottom-sheet `<div>` modal | `Modal` (`animationType="slide"`) + backdrop `Pressable` |
| CSS gradients | `expo-linear-gradient` |
| Google Fonts via `@import url(...)` | `@expo-google-fonts/fraunces` + `@expo-google-fonts/outfit`, loaded with `useFonts` in `App.jsx` before render |
| `useState`-driven screen routing | Kept as-is — same pattern, just rendering RN screens instead of divs. Swap in `@react-navigation/native` later if you want native transitions, deep links, or a tab bar. |
| Unsplash image URLs | Unchanged — `Image source={{ uri }}` loads remote images the same way `<img>` did |

## Project structure

```
App.jsx                      — root: font loading, auth flow, screen switch
src/
  theme/theme.jsx             — color palette + font family keys
  data/
    attractions.jsx           — mock data (unchanged from web version)
  utils/format.jsx            — fmt() Rand currency formatter
  components/
    Icons.jsx                 — all SVG icons (react-native-svg)
    Badge.jsx
    Field.jsx                 — labeled text input for auth forms
    BudgetSlider.jsx          — wraps @react-native-community/slider
    AttractionCard.jsx        — home screen grid card
    AccomCard.jsx             — accommodation list item
    ActivityCard.jsx
    AccomDetailModal.jsx      — full-detail bottom sheet
  screens/
    LandingScreen.jsx
    LoginScreen.jsx
    RegisterScreen.jsx        — 2-step form
    HomeScreen.jsx
    AttractionScreen.jsx
    DayPlanScreen.jsx
```

## Known gaps / things to double check on a device

- **Fonts**: Fraunces/Outfit are pulled from `@expo-google-fonts/*` packages rather than a `<link>` tag. If you'd rather bundle local `.ttf` files, swap the `useFonts` calls in `App.tsx`.
- **Slider styling**: `@react-native-community/slider` doesn't support the custom gradient-fill thumb CSS trick from the web version — it uses native track/thumb tint colors instead, which look slightly different per platform (this is expected/native behavior, not a bug).
- **Auth is still mocked** — `setTimeout` fake network delay, no real backend. Wire up your API of choice in `LoginScreen`/`RegisterScreen`'s `submit()`.
- **Screen transitions**: no slide/fade animation between screens yet since routing is just conditional rendering. If you want native stack transitions, wrap this in `@react-navigation/native-stack` — the screens are already split out to make that a quick swap.
- I haven't run `npm install` / `expo start` in this environment (no device/simulator here), so please do a first `npx expo start` pass and report back if anything doesn't compile — happy to fix.
