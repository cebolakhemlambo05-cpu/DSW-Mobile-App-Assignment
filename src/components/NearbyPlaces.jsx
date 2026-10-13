import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { colors, fonts } from "../theme/theme";
import { fetchDrivingDistances, fetchNearbyPlaces } from "../services/placesService";

const CATEGORIES = [
  { id: "all", label: "All nearby", icon: "📍" },
  { id: "stay", label: "Stays", icon: "🛏️" },
  { id: "restaurant", label: "Restaurants", icon: "🍽️" },
  { id: "fuel", label: "Fuel", icon: "⛽" },
];

function formatDistance(distance) {
  return distance == null ? "Unavailable" : `${distance < 10 ? distance.toFixed(1) : Math.round(distance)} km`;
}

function straightLineDistanceKm(from, place) {
  if (
    !from ||
    !Number.isFinite(place.latitude) ||
    !Number.isFinite(place.longitude)
  ) {
    return null;
  }
  const radians = (degrees) => (degrees * Math.PI) / 180;
  const latitudeDelta = radians(place.latitude - from.latitude);
  const longitudeDelta = radians(place.longitude - from.longitude);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(from.latitude)) *
      Math.cos(radians(place.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function formatDuration(duration) {
  const seconds = Number.parseFloat(String(duration || "").replace(/s$/, ""));
  if (!Number.isFinite(seconds)) return null;
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours ? `${hours} hr ${minutes} min` : `${minutes} min`;
}

function priceDescription(place) {
  if (place.category === "stay") {
    return place.pricePerNight == null
      ? "Price not listed in OpenStreetMap"
      : `${place.currency === "ZAR" ? "R" : `${place.currency} `}${Number(place.pricePerNight).toLocaleString()} / night`;
  }
  if (place.category === "restaurant") {
    return place.priceLevelLabel
      ? `Google price level: ${place.priceLevelLabel}`
      : "Menu prices unavailable";
  }
  return "Fuel prices unavailable";
}

export default function NearbyPlaces({
  latitude,
  longitude,
  attractionName,
  attractionLocation,
}) {
  const [places, setPlaces] = useState([]);
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [expandedPlace, setExpandedPlace] = useState(null);
  const [routesToAttraction, setRoutesToAttraction] = useState({});
  const [routesFromUser, setRoutesFromUser] = useState({});
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState("");

  const loadPlaces = useCallback(async (signal) => {
    setLoading(true);
    setError("");
    try {
      const results = await fetchNearbyPlaces({
        latitude,
        longitude,
        category: "all",
        signal,
      });
      const uniquePlaces = new Map();
      results.forEach((place) => uniquePlaces.set(place.id, place));
      setPlaces(Array.from(uniquePlaces.values()));
      setRoutesToAttraction({});
      setRoutesFromUser({});
    } catch (loadError) {
      if (loadError?.name !== "AbortError") {
        setError(loadError?.message || "Could not load nearby places.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [latitude, longitude, attractionName, attractionLocation]);

  useEffect(() => {
    const routablePlaces = places.filter(
      (place) => Number.isFinite(place.latitude) && Number.isFinite(place.longitude)
    );
    if (routablePlaces.length === 0) {
      setRoutesToAttraction({});
      setRoutesFromUser({});
      setRouteLoading(false);
      setRouteError("");
      return undefined;
    }
    const controller = new AbortController();
    setRouteLoading(true);
    setRouteError("");
    fetchDrivingDistances({
      places: routablePlaces.map(
        ({ id, latitude: placeLatitude, longitude: placeLongitude }) => ({
          id,
          latitude: placeLatitude,
          longitude: placeLongitude,
        })
      ),
      attraction: { latitude, longitude },
      userLocation: userLocation || undefined,
      signal: controller.signal,
    })
      .then((routes) => {
        setRoutesToAttraction(routes.routesToAttraction);
        setRoutesFromUser(routes.routesFromUser);
      })
      .catch((routeRequestError) => {
        if (routeRequestError?.name !== "AbortError") {
          setRouteError(routeRequestError?.message || "Could not calculate driving distances.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setRouteLoading(false);
      });
    return () => controller.abort();
  }, [places, latitude, longitude, userLocation]);

  useEffect(() => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setPlaces([]);
      setError("Nearby OpenStreetMap search needs coordinates for this attraction.");
      return undefined;
    }
    const controller = new AbortController();
    loadPlaces(controller.signal);
    return () => controller.abort();
  }, [latitude, longitude, loadPlaces]);

  const requestUserLocation = () => {
    const geolocation = globalThis.navigator?.geolocation;
    if (!geolocation) {
      setLocationMessage("Location is not available in this browser. You can still see distance from the attraction.");
      return;
    }
    setLocationMessage("Getting your location...");
    geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ latitude: coords.latitude, longitude: coords.longitude });
        setLocationMessage("Getting driving distances from your current location...");
      },
      (locationError) => {
        setLocationMessage(
          locationError.code === 1
            ? "Location permission was denied. Allow location access in your browser settings to see distance from you."
            : "Could not get your location. Check your device location settings and try again."
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  };

  const visiblePlaces = useMemo(
    () => places
      .filter((place) => category === "all" || place.category === category)
      .sort((a, b) => {
        const distanceA = userLocation
          ? routesFromUser[a.id]?.distanceMeters ??
            (straightLineDistanceKm(userLocation, a) ?? Infinity) * 1000
          : routesToAttraction[a.id]?.distanceMeters ??
            (a.distanceFromAttractionKm ?? Infinity) * 1000;
        const distanceB = userLocation
          ? routesFromUser[b.id]?.distanceMeters ??
            (straightLineDistanceKm(userLocation, b) ?? Infinity) * 1000
          : routesToAttraction[b.id]?.distanceMeters ??
            (b.distanceFromAttractionKm ?? Infinity) * 1000;
        return (distanceA ?? Infinity) - (distanceB ?? Infinity);
      }),
    [places, category, userLocation, routesFromUser, routesToAttraction]
  );

  const openDirections = async (place) => {
    const destination =
      Number.isFinite(place.latitude) && Number.isFinite(place.longitude)
        ? `${place.latitude},${place.longitude}`
        : place.mapsQuery || place.name;
    const params = new URLSearchParams({
      api: "1",
      destination,
      ...(userLocation
        ? { origin: `${userLocation.latitude},${userLocation.longitude}` }
        : {}),
    });
    try {
      await Linking.openURL(`https://www.google.com/maps/dir/?${params.toString()}`);
    } catch {
      Alert.alert("Unable to open directions", "Please try again or open Google Maps on your device.");
    }
  };

  const openWebsite = async (website) => {
    try {
      await Linking.openURL(website);
    } catch {
      Alert.alert("Unable to open website", "Please try again or search for this place online.");
    }
  };

  const openMapAttribution = async () => {
    try {
      await Linking.openURL("https://www.openstreetmap.org/copyright");
    } catch {
      Alert.alert("Unable to open attribution", "OpenStreetMap is available at openstreetmap.org.");
    }
  };

  const openPriceSearch = async (place) => {
    const priceTerm = place.category === "stay"
      ? "nightly room rates"
      : place.category === "fuel"
        ? "fuel prices"
        : "menu prices";
    const query = `${place.name} ${priceTerm}`;
    try {
      await Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
    } catch {
      Alert.alert("Unable to check prices", "Please try again or contact this place directly.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Places near {attractionName}</Text>
          <Text style={styles.subtitle}>Mapped places, with approximate distance and directions</Text>
        </View>
        {loading && <ActivityIndicator color={colors.savanna} />}
      </View>

      <Pressable accessibilityRole="button" onPress={requestUserLocation} style={styles.locationButton}>
        <Text style={styles.locationButtonText}>
          {userLocation ? "Refresh my location" : "Show distance from my location"}
        </Text>
      </Pressable>
      {!!locationMessage && <Text style={styles.locationMessage}>{locationMessage}</Text>}
      {routeLoading && <Text style={styles.locationMessage}>Calculating driving distances with Google Routes...</Text>}
      {!!routeError && <Text style={styles.errorText}>{routeError}</Text>}

      <View style={styles.filters}>
        {CATEGORIES.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            onPress={() => setCategory(item.id)}
            style={[styles.filter, category === item.id && styles.filterSelected]}
          >
            <Text style={[styles.filterText, category === item.id && styles.filterTextSelected]}>
              {item.icon} {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {loading && places.length === 0 ? (
        <Text style={styles.message}>Finding nearby places...</Text>
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable accessibilityRole="button" onPress={() => loadPlaces()}>
            <Text style={styles.retry}>Try again</Text>
          </Pressable>
        </View>
      ) : visiblePlaces.length === 0 ? (
        <Text style={styles.message}>No places found for this category nearby.</Text>
      ) : (
        <View style={styles.placeList}>
          {visiblePlaces.map((place) => {
            const userRoute = routesFromUser[place.id];
            const attractionRoute = routesToAttraction[place.id];
            const userDistance = userRoute?.distanceMeters;
            const attractionDistance = attractionRoute?.distanceMeters;
            const expanded = expandedPlace === place.id;
            return (
              <View key={place.id} style={styles.card}>
                {place.image ? <Image source={{ uri: place.image }} style={styles.photo} /> : null}
                <View style={styles.cardContent}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>{place.name}</Text>
                    {!!place.rating && (
                      <Text style={styles.rating}>★ {place.rating}{place.reviewCount ? ` (${place.reviewCount})` : ""}</Text>
                    )}
                  </View>
                  <Text style={styles.type}>{place.type}</Text>
                  <Text style={styles.price}>{priceDescription(place)}</Text>
                  <Text style={styles.address}>{place.address}</Text>
                  {!!place.description && (
                    <Text style={styles.detailText}>{place.description}</Text>
                  )}
                  <Text style={styles.distances}>
                    {userLocation
                              ? `${userDistance == null ? `Approx. ${formatDistance(straightLineDistanceKm(userLocation, place))} straight-line from you` : `${formatDistance(userDistance / 1000)} drive from you`}${attractionDistance == null ? (place.distanceFromAttractionKm == null ? "" : ` · approx. ${formatDistance(place.distanceFromAttractionKm)} straight-line to ${attractionName}`) : ` · ${formatDistance(attractionDistance / 1000)} drive to ${attractionName}`}`
                      : attractionDistance == null
                                ? `Approx. ${formatDistance(place.distanceFromAttractionKm)} straight-line to ${attractionName}; driving route unavailable.`
                        : `${formatDistance(attractionDistance / 1000)} drive to ${attractionName}`}
                  </Text>
                  {(userRoute?.duration || attractionRoute?.duration) && (
                    <Text style={styles.routeTimes}>
                      {userRoute?.duration
                        ? `${formatDuration(userRoute.duration)} from you`
                        : ""}
                      {userRoute?.duration && attractionRoute?.duration ? " · " : ""}
                      {attractionRoute?.duration
                        ? `${formatDuration(attractionRoute.duration)} to attraction`
                        : ""}
                    </Text>
                  )}

                  {expanded && (
                    <View style={styles.details}>
                      {!!place.phone && <Text style={styles.detailText}>Phone: {place.phone}</Text>}
                      {place.openingHours.length > 0 && (
                        <>
                          <Text style={styles.detailHeading}>Opening hours</Text>
                          {place.openingHours.map((hours) => (
                            <Text key={hours} style={styles.detailText}>{hours}</Text>
                          ))}
                        </>
                      )}
                      <Text style={styles.disclaimer}>
                        OpenStreetMap data is community-maintained and may be incomplete. Prices, availability, ratings, and photos are not supplied by this search.
                      </Text>
                    </View>
                  )}

                  <View style={styles.actions}>
                    <Pressable accessibilityRole="button" onPress={() => openPriceSearch(place)} style={styles.more}>
                      <Text style={styles.moreText}>Check prices</Text>
                    </Pressable>
                    <Pressable accessibilityRole="button" onPress={() => openDirections(place)} style={styles.directions}>
                      <Text style={styles.actionText}>Find in Maps</Text>
                    </Pressable>
                    {!!place.website && (
                      <Pressable accessibilityRole="button" onPress={() => openWebsite(place.website)} style={styles.more}>
                        <Text style={styles.moreText}>Open result</Text>
                      </Pressable>
                    )}
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => setExpandedPlace(expanded ? null : place.id)}
                      style={styles.more}
                    >
                      <Text style={styles.moreText}>{expanded ? "Less details" : "More details"}</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}
      <Text style={styles.attribution}>
        Map data{" "}
        <Text accessibilityRole="link" onPress={openMapAttribution} style={styles.attributionLink}>
          © OpenStreetMap contributors
        </Text>
        {" "}· Driving routes and times from Google Routes may vary with traffic.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12, padding: 14, borderRadius: 16, backgroundColor: colors.ivory },
  header: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 17, fontFamily: fonts.display, color: colors.charcoal },
  subtitle: { fontSize: 11, color: colors.charcoal, opacity: 0.6, marginTop: 3 },
  locationButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.sand,
  },
  locationButtonText: { fontSize: 11, fontFamily: fonts.bodySemiBold, color: colors.savanna },
  locationMessage: { fontSize: 10, lineHeight: 15, color: colors.charcoal, opacity: 0.65 },
  filters: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  filter: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.sand },
  filterSelected: { backgroundColor: colors.savanna },
  filterText: { fontSize: 10, fontFamily: fonts.bodyMedium, color: colors.charcoal },
  filterTextSelected: { color: colors.ivory },
  placeList: { gap: 10 },
  card: { overflow: "hidden", borderRadius: 12, backgroundColor: colors.sand },
  photo: { width: "100%", height: 150, backgroundColor: colors.sand },
  cardContent: { padding: 12, gap: 4 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  name: { flex: 1, fontSize: 15, fontFamily: fonts.bodySemiBold, color: colors.charcoal },
  rating: { fontSize: 11, fontFamily: fonts.bodySemiBold, color: colors.charcoal },
  type: { fontSize: 10, color: colors.charcoal, opacity: 0.6 },
  price: { fontSize: 12, fontFamily: fonts.bodySemiBold, color: colors.savanna, marginTop: 3 },
  address: { fontSize: 11, lineHeight: 15, color: colors.charcoal, opacity: 0.75 },
  distances: { fontSize: 11, fontFamily: fonts.bodySemiBold, color: colors.terra, marginTop: 2 },
  routeTimes: { fontSize: 10, color: colors.charcoal, opacity: 0.7 },
  details: { gap: 4, paddingTop: 8 },
  detailHeading: { fontSize: 10, fontFamily: fonts.bodyBold, color: colors.savanna, marginTop: 4 },
  detailText: { fontSize: 10, lineHeight: 15, color: colors.charcoal, opacity: 0.75 },
  disclaimer: { fontSize: 9, lineHeight: 13, color: colors.charcoal, opacity: 0.6, marginTop: 5 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 },
  directions: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 9, backgroundColor: colors.savanna },
  actionText: { fontSize: 10, fontFamily: fonts.bodySemiBold, color: colors.ivory },
  more: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9, borderWidth: 1, borderColor: "rgba(62,50,38,0.2)" },
  moreText: { fontSize: 10, fontFamily: fonts.bodySemiBold, color: colors.charcoal },
  message: { fontSize: 11, lineHeight: 16, color: colors.charcoal, opacity: 0.65 },
  errorBox: { gap: 8 },
  errorText: { fontSize: 11, lineHeight: 16, color: "#9B3328" },
  retry: { fontSize: 11, fontFamily: fonts.bodySemiBold, color: colors.savanna },
  attribution: { fontSize: 9, lineHeight: 13, color: colors.charcoal, opacity: 0.45 },
  attributionLink: { textDecorationLine: "underline" },
});
