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
GOOGLE_PLACES_API_KEY=your_google_places_api_key
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=replace_with_a_strong_unique_password
```

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to your admin login credentials in `backend/.env`; do not put them in the app or share/commit that file. Restart the backend after changing credentials.

### Admin website and secondary admin

The same login screen serves the mobile app and browser version. From the project folder, run `npm run web` to open the responsive browser app; signing in with the existing `ADMIN_EMAIL` and `ADMIN_PASSWORD` opens the admin console. Registered users continue into their planner, and unknown email/password combinations are rejected. The browser console and mobile app use the same API and Firestore records. The admin console refreshes every 15 seconds, and an active user app syncs account and plan data every 30 seconds.

To enable a secondary admin, set `SECONDARY_ADMIN_EMAIL` and `SECONDARY_ADMIN_PASSWORD` in `backend/.env` and restart the backend. Use a separate strong password. This account can view the dashboard, registered users, plans, audit events, health status, and CSV exports, but the server blocks account edits and deletions. The existing admin credentials remain the superuser and keep full admin permissions. Admin sign-ins use short-lived server-issued tokens; the backend expires them after 12 hours and clears them when it restarts.

The backend also reads the project-root `.env` file for server-side keys, without overriding values already set in `backend/.env`. Keep Google and hotel-provider keys unprefixed (not `EXPO_PUBLIC_`) so Expo does not bundle them into the app. Start the API with `node server.js` from the project root, then start Expo. Accommodation offers come only from the configured hotel provider; static catalog entries and Geoapify/OpenStreetMap place listings are not shown as stays. Restaurants, fuel stops, and searched attractions continue to use OpenStreetMap. Google Places photo lookup is best effort and may attach photos only to matching provider listings. Google Places photo usage may incur billing and requires displaying photo/author attribution. The curated attraction catalog remains available when a remote attraction search is unavailable. Live hotel offers can optionally come from Nuitee Connect, ScrapeBadger Google Hotels, or Amadeus.

Hotelbeds can also be selected with `HOTEL_API_PROVIDER=hotelbeds`. Add `HOTELBEDS_API_KEY` and `HOTELBEDS_API_SECRET` to `backend/.env`; the default base URL is the Hotelbeds test environment (`https://api.test.hotelbeds.com`). The backend signs requests with Hotelbeds' SHA-256 `X-Signature`, loads the South African hotel content catalog in pages, finds properties within 100 km of each attraction by coordinates, checks date-specific availability, and combines rates with descriptions, facilities, addresses, and images from Hotelbeds content. When a nearby property has no available rate for the selected dates, it can still show Hotelbeds property content and photos, with price left unavailable. Images are served from Hotelbeds' GIATA image host; Google Places photo lookup is not used for Hotelbeds results. Search is for display only; booking/confirmation is not implemented. Hotelbeds recommends synchronizing static content instead of repeatedly fetching it in real time, so this integration caches the catalog for 24 hours in memory; restarting the backend clears that cache. For production, use a persistent content cache and credentials approved for the production endpoint. Check `/api/health` for `hotelProviderConfigured`, then open an attraction's stay list; provider errors appear as a warning and nearby place results remain the fallback.

The accommodation screen uses Hotelbeds for live property details and rates. Travelers can select a check-in date and stay length, set a group of up to 27, choose one, two, or three guests per room, and add rooms. Room counts, check-in dates, and nights refresh Hotelbeds availability. The planner shows guests still needing a room and totals the selected rooms over the stay plus selected per-person attraction activities for the full group. Group size, room sharing/count, dates, nights, itemized estimate, references, method, and email status are saved to the Day Plan. `Reserve now` requires room allocation for the full group; it saves an in-app request but does not confirm a Hotelbeds booking or collect payment. Booking emails use separate `EMAILJS_BOOKING_SERVICE_ID`, `EMAILJS_BOOKING_TEMPLATE_ID`, `EMAILJS_BOOKING_PUBLIC_KEY`, and optional `EMAILJS_BOOKING_PRIVATE_KEY` values in `backend/.env`; they do not reuse the account email credentials. The template can use `to_email`, `to_name`, `booking_reference`, `payment_reference`, `property_name`, `attraction_name`, `check_in`, `check_out`, `guest_count`, `room_count`, `room_sharing`, `nights`, `activity_names`, `accommodation_total`, `activities_total`, `amount`, `currency`, `payment_method`, `booking_status`, `payment_status`, and `payment_notice`. Provider confirmation and payment processing remain pending.

### Firestore account and day-plan storage

The API stores registered accounts, OTP challenges, and saved day plans in Cloud Firestore using the Firebase Admin SDK. Put the downloaded service-account JSON file in `backend/`; the provided `.gitignore` excludes Firebase Admin key files. Never add a service-account key to the app, share it, or commit it. If you use a different filename or location, set `FIREBASE_SERVICE_ACCOUNT_PATH` in `backend/.env` to its path relative to the project root. The service account must belong to the same Firebase project where you created Firestore. The backend requires Node.js 22 or newer.

User API routes require a short-lived bearer session issued after email-code verification. The server stores only a hash of each session token in memory, expires sessions after 12 hours, and revokes them on logout, password reset, or account deletion. Restarting the server clears these sessions, so users need to sign in again. On iOS and Android, the app stores the session token in the platform secure store; browser builds use browser storage. Local account and plan caches still use AsyncStorage and are not encrypted by the app. Serve the API over HTTPS before using real personal information: local development HTTP does not encrypt network traffic. This is a development setup, not a complete production security review.

To import the existing `data/app-data.json` records, run this once from the project root:

```bash
npm run migrate:firestore
```

The migration writes accounts to `plannerUsers`, pending registration OTPs to `plannerRegistrationChallenges`, and a completion marker to `plannerMetadata`. It leaves the original JSON file unchanged and refuses to repeat a completed migration unless `--force` is explicitly provided. After a successful migration, start the backend with `npm run server`. The Firestore Admin SDK bypasses Firestore security rules; the app uses the backend API rather than direct client database access.

The admin console includes user search and filters, 7/30-day registration and plan-save trends, API/Firestore reachability checks, and a CSV export limited to names, email addresses, nationality, join date, and saved-destination counts. Account and plan changes are recorded in the `plannerAuditEvents` collection; the console displays the latest 100 events. Audit history starts when this feature is deployed and does not reconstruct earlier changes. Event records exclude passwords, profile photos, and itinerary contents.

Attraction search calls `GET /api/attractions?query=mountains` and combines OpenStreetMap/Nominatim results with the curated local attraction catalog. Search results include mapped coordinates and contributor-provided details when available, but images are representative category images and ratings and visitor information are not verified. Nominatim is a community service with strict fair-use limits; the backend serializes requests, waits at least one second between searches, and briefly caches results. Display `© OpenStreetMap contributors` attribution wherever these results are shown.

The attraction detail screen shows Hotelbeds offers in its “Where to Sleep” section. The nearby places panel uses OpenStreetMap for restaurants and fuel only; it does not include accommodation listings. Overpass queries retry via `https://overpass.kumi.systems/api/interpreter` if `https://overpass-api.de/api/interpreter` is unavailable. Results include names and coordinates when recorded by their data sources; the app calculates approximate straight-line distances and can request driving routes separately. Public Overpass servers can be busy and enforce fair-use limits, so results are cached briefly. Display OpenStreetMap attribution wherever its data is shown.

Google Routes API (`POST /api/route-distances`) can calculate driving distance and estimated time only for entries with verified coordinates. It is optional and requires a separate `GOOGLE_ROUTES_API_KEY` in `backend/.env`; this endpoint is distinct from Places API and may require Google Cloud billing. Opening Google Maps directions from the app uses a Maps URL and does not call Places API.

When no hotel-offer provider is configured or it returns no properties, the accommodation list remains empty and displays a provider warning. Non-Hotelbeds nearby and static catalog properties are not substituted into the Hotelbeds offer list. Property details, prices, ratings, and availability are shown only when provided by the configured hotel provider. Confirm rates and availability directly with the property or a booking provider.

To use ScrapeBadger Google Hotels, put the API key in the server-side `backend/.env` file and select the provider:

```env
HOTEL_API_PROVIDER=scrapebadger
SCRAPEBADGER_API_KEY=your_scrapebadger_api_key
```

The backend searches Google Hotels using the attraction name and location and the requested stay dates and adult count, then maps available rates, ratings, amenities, and image URLs into the accommodation cards. It requests ZAR from ScrapeBadger and converts any foreign-currency rates returned by a provider into ZAR using the latest available Frankfurter exchange rates. If a currency rate is unavailable, that price is hidden rather than shown with a misleading currency label; the app reports the conversion date or issue. Converted amounts are reference estimates, so confirm the final price with the booking provider. ScrapeBadger searches cost credits per successful request and are cached by location and stay details for 10 minutes. Some properties may not include prices, images, or coordinates. If the provider fails or returns no properties, the list remains empty and displays a provider warning. Keep the key out of the mobile app and do not share or commit `backend/.env`.

To show live hotel offers and nightly prices from Nuitee Connect, configure the Nuitee sandbox key in `backend/.env` and set `HOTEL_API_PROVIDER=nuitee`:

```env
HOTEL_API_PROVIDER=nuitee
NUITEE_API_KEY=your_nuitee_sandbox_api_key
NUITEE_API_BASE_URL=https://api.liteapi.travel/v3.0
NUITEE_GUEST_NATIONALITY=ZA
```

Nuitee Connect authenticates with the server-side `X-API-Key` header. The backend searches a 20 km radius around the selected attraction, with the requested dates and guest count, and maps available rates and hotel details into the accommodation cards. The current screen defaults to dates seven and nine days from today and two adults; the API accepts explicit dates and occupancy, but date and guest selectors are not available on the screen yet. The sandbox is for testing only; do not expect its rates or availability to represent production inventory. This integration searches and displays offers only; it does not prebook or complete reservations. Keep the key private and out of the mobile app.

To show live hotel offers from Amadeus instead, configure credentials in `backend/.env` and set `HOTEL_API_PROVIDER=amadeus`:

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
