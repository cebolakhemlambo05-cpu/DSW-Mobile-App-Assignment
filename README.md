# ALL-IN-ONE-PLANNER — React Native (Expo)

A port of the web prototype to a real React Native app, using Expo + plain `StyleSheet` (no NativeWind).

## Run it

```bash
npm install
npx expo start
```

Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with the **Expo Go** app on your phone.

## Live accommodation options

Accommodation searches run through `server.js` and use the Google Places key already required by the attractions search. Copy `.env.example` to `.env` in the project root and set:

```env
GOOGLE_PLACES_API_KEY=YOUR_GOOGLE_PLACES_API_KEY
HOTEL_API_PROVIDER=google
```

Start the backend with `node server.js`, then start Expo. Opening an attraction calls `/api/hotels` using its coordinates. The backend finds nearby lodging through Google Places and returns multiple stays. The existing accommodation cards and detail sheet show the live name, estimated price, rating, address, amenities and contact details; the catalogue data remains as a fallback when no live result is available.

Google Places results are discovery data, not booking confirmations. Prices and availability should be verified with the accommodation before accepting payment or confirming a reservation.

## Account persistence and privacy

The backend stores registered users in `data/app-data.json`. Passwords are stored as salted `scrypt` hashes, never as plain text. Registration, login, and password reset use `/api/auth/register`, `/api/auth/login`, and `/api/auth/reset-password`. The app includes a Privacy & data screen from the landing and home footers.

This JSON store is intended for local development. Production deployments should use a managed database, secure sessions, rate limiting, email verification, encrypted backups, and a real password-reset flow.

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
