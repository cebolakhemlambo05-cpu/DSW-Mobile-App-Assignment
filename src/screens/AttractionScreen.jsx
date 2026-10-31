"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AttractionScreen;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const expo_linear_gradient_1 = require("expo-linear-gradient");
const theme_1 = require("../theme/theme");
const format_1 = require("../utils/format");
const Icons_1 = require("../components/Icons");
const Badge_1 = __importDefault(require("../components/Badge"));
const BudgetSlider_1 = __importDefault(require("../components/BudgetSlider"));
const AccomCard_1 = __importDefault(require("../components/AccomCard"));
const ActivityCard_1 = __importDefault(require("../components/ActivityCard"));
const AccomDetailModal_1 = __importDefault(require("../components/AccomDetailModal"));
const WeatherForecast_1 = __importDefault(require("../components/WeatherForecast"));
const BookingModal_1 = __importDefault(require("../components/BookingModal"));
const CheckInDatePicker_1 = __importDefault(require("../components/CheckInDatePicker"));
const placesService_1 = require("../services/placesService");
const expo_location_1 = require("expo-location");
function dateAfterDays(days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
}
function addDaysToDate(isoDate, days) {
    const date = new Date(`${isoDate}T12:00:00`);
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
}
function nightsBetween(checkIn, checkOut) {
    return Math.max(1, Math.round((new Date(`${checkOut}T00:00:00`) - new Date(`${checkIn}T00:00:00`)) / 86400000));
}
function distanceBetweenCoordinates(origin, destination) {
    const radians = (degrees) => degrees * Math.PI / 180;
    const latitudeDelta = radians(destination.latitude - origin.latitude);
    const longitudeDelta = radians(destination.longitude - origin.longitude);
    const value = Math.sin(latitudeDelta / 2) ** 2 +
        Math.cos(radians(origin.latitude)) * Math.cos(radians(destination.latitude)) *
        Math.sin(longitudeDelta / 2) ** 2;
    return 6371 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}
function AttractionScreen({ attraction, onBack, onAddToPlan, onGoToPlan, existingEntry, currentUser, }) {
    var _a, _b;
    const weatherLatitude = attraction.map?.latitude ?? attraction.latitude;
    const weatherLongitude = attraction.map?.longitude ?? attraction.longitude;
    const [budget, setBudget] = (0, react_1.useState)(2500);
    const [tab, setTab] = (0, react_1.useState)("stays");
    const [selectedAccom, setSelectedAccom] = (0, react_1.useState)((_a = existingEntry === null || existingEntry === void 0 ? void 0 : existingEntry.accommodation) === null || _a === void 0 ? void 0 : _a.id);
    const [selectedActivities, setSelectedActivities] = (0, react_1.useState)(new Set((_b = existingEntry === null || existingEntry === void 0 ? void 0 : existingEntry.activities.map((a) => a.id)) !== null && _b !== void 0 ? _b : []));
    const [showOffline, setShowOffline] = (0, react_1.useState)(false);
    const [viewingAccom, setViewingAccom] = (0, react_1.useState)(null);
    const [accommodations, setAccommodations] = (0, react_1.useState)([]);
    const [lodgingLoading, setLodgingLoading] = (0, react_1.useState)(false);
    const [lodgingError, setLodgingError] = (0, react_1.useState)("");
    const [userLocation, setUserLocation] = (0, react_1.useState)(null);
    const [locationMessage, setLocationMessage] = (0, react_1.useState)("");
    const [hotelWarning, setHotelWarning] = (0, react_1.useState)("");
    const [photoWarning, setPhotoWarning] = (0, react_1.useState)("");
    const [showDemoBooking, setShowDemoBooking] = (0, react_1.useState)(false);
    const [showCheckInPicker, setShowCheckInPicker] = (0, react_1.useState)(false);
    const [demoBooking, setDemoBooking] = (0, react_1.useState)((_a = existingEntry === null || existingEntry === void 0 ? void 0 : existingEntry.booking) !== null && _a !== void 0 ? _a : null);
    const [adults, setAdults] = (0, react_1.useState)(Math.max(1, Math.min(27, Number(existingEntry?.groupSize || existingEntry?.booking?.adults || 2))));
    const [roomSharing, setRoomSharing] = (0, react_1.useState)(Math.min(3, Math.max(1, Math.min(Number(existingEntry?.roomSharing || existingEntry?.booking?.roomSharing || 2), Number(existingEntry?.groupSize || existingEntry?.booking?.adults || 2)))));
    const [roomQuantity, setRoomQuantity] = (0, react_1.useState)(Math.min(9, Math.max(1, Number(existingEntry?.roomQuantity || existingEntry?.booking?.roomQuantity || 1))));
    const [checkInDate, setCheckInDate] = (0, react_1.useState)(() => existingEntry?.checkInDate || existingEntry?.booking?.checkIn || dateAfterDays(7));
    const [nights, setNights] = (0, react_1.useState)(Math.min(30, Math.max(1, Number(existingEntry?.stayNights || existingEntry?.booking?.nights || 2))));
    const checkOutDate = addDaysToDate(checkInDate, nights);
    const requestUserLocation = async () => {
      setLocationMessage("Getting your location...");
      try {
        const permission = await expo_location_1.requestForegroundPermissionsAsync();
        if (permission.status !== "granted") {
          setLocationMessage("Location permission was denied. Allow location access in your device settings to see distances.");
          return;
        }
        const position = await expo_location_1.getCurrentPositionAsync({
          accuracy: expo_location_1.Accuracy.Balanced,
        });
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationMessage("");
      } catch {
        setLocationMessage("Could not get your location. Check your device settings and try again.");
      }
    };
    (0, react_1.useEffect)(() => {
      setAccommodations([]);
      setLodgingError("");
      setHotelWarning("");
      setPhotoWarning("");
      setAccommodations((current) => current.map((hotel) =>
        hotel.source === "Hotelbeds" ? { ...hotel, pricePerNight: null, groupPricePerNight: null } : hotel
      ));
      const latitude = attraction.map?.latitude ?? attraction.latitude;
      const longitude = attraction.map?.longitude ?? attraction.longitude;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        setLodgingLoading(false);
        setLodgingError("Nearby accommodation search requires attraction coordinates.");
        return undefined;
      }
      const controller = new AbortController();
      let active = true;
      setLodgingLoading(true);
      (0, placesService_1.fetchAccommodationOffers)({
        latitude: Number.isFinite(latitude) ? latitude : undefined,
        longitude: Number.isFinite(longitude) ? longitude : undefined,
        attractionName: attraction.name,
        attractionLocation: attraction.location,
        checkInDate,
        checkOutDate,
        adults: roomSharing,
        roomQuantity,
        signal: controller.signal,
      })
        .then((result) => {
          if (!active) return;
          setHotelWarning(result.hotelWarning || "");
          setPhotoWarning(result.photoWarning || "");
          const byName = new Map();
          result.hotels
            .filter((accommodation) => accommodation.source === "Hotelbeds")
            .forEach((accommodation) => {
              const key = String(accommodation.name || accommodation.id).trim().toLowerCase();
              const current = byName.get(key);
              if (!current) {
                byName.set(key, accommodation);
                return;
              }
              const incomingHasPrice = accommodation.pricePerNight != null;
              const currentHasPrice = current.pricePerNight != null;
              const primary = incomingHasPrice && !currentHasPrice ? accommodation : current;
              const secondary = primary === accommodation ? current : accommodation;
              const image = accommodation.details?.image || current.details?.image || "";
              const images = accommodation.details?.images?.length
                ? accommodation.details.images
                : current.details?.images?.length
                  ? current.details.images
                  : image
                    ? [image]
                    : [];
              byName.set(key, {
                ...secondary,
                ...primary,
                details: {
                  ...(secondary.details || {}),
                  ...(primary.details || {}),
                  image,
                  images,
                  imageAttribution:
                    accommodation.details?.image
                      ? accommodation.details.imageAttribution
                      : current.details?.imageAttribution,
                  photoAttributions:
                    accommodation.details?.image
                      ? accommodation.details.photoAttributions
                      : current.details?.photoAttributions,
                },
              });
            });
          setAccommodations(Array.from(byName.values()));
        })
        .catch((error) => {
          if (active && error?.name !== "AbortError") {
            setLodgingError(error.message || "Live accommodation search failed.");
          }
        })
        .finally(() => {
          if (active) setLodgingLoading(false);
        });
      return () => {
        active = false;
        controller.abort();
      };
    }, [attraction, roomSharing, roomQuantity, checkInDate, checkOutDate]);
    const sortedAccoms = (0, react_1.useMemo)(() => [...accommodations].sort((a, b) => {
        const currencyA = String(a.currency || "ZAR").toUpperCase();
        const currencyB = String(b.currency || "ZAR").toUpperCase();
        const currencyRank = (currency) => currency === "ZAR" ? "0" : `1${currency}`;
        const currencyOrder = currencyRank(currencyA).localeCompare(currencyRank(currencyB));
        if (currencyOrder !== 0) return currencyOrder;
        const priceA = Number.isFinite(a.pricePerNight) ? a.pricePerNight : Infinity;
        const priceB = Number.isFinite(b.pricePerNight) ? b.pricePerNight : Infinity;
        return priceA - priceB || (b.rating || 0) - (a.rating || 0);
    }), [accommodations]);
    const hasNonRandAccommodationPrice = sortedAccoms.some(
        (accommodation) =>
            accommodation.pricePerNight != null &&
            String(accommodation.currency || "ZAR").toUpperCase() !== "ZAR"
    );
    const toggleActivity = (id) => {
        setSelectedActivities((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };
    const selectedAccomData = accommodations.find((a) => a.id === selectedAccom);
    const selectedActivityData = attraction.activities.filter((a) => selectedActivities.has(a.id));
    const totalActivityCost = selectedActivityData.reduce((s, a) => s + a.pricePerPerson * adults, 0);
    const guestsNeedingRoom = Math.max(0, adults - roomSharing * roomQuantity);
    const accommodationIsRand = !selectedAccomData || !selectedAccomData.currency || String(selectedAccomData.currency).toUpperCase() === "ZAR";
    const hasSelectedRate = !!selectedAccomData && selectedAccomData.pricePerNight != null && Number.isFinite(Number(selectedAccomData.pricePerNight));
    const accommodationTotal = hasSelectedRate && accommodationIsRand ? Number(selectedAccomData.pricePerNight) * roomQuantity * nights : 0;
    const totalIsPartial = guestsNeedingRoom > 0 || (!!selectedAccomData && (!hasSelectedRate || !accommodationIsRand));
    const totalCost = accommodationTotal + totalActivityCost;
    const bookingMatchesSelection = (booking) => !!booking &&
        booking.accommodationId === selectedAccomData?.id &&
        Number(booking.adults) === adults &&
        Number(booking.roomSharing) === roomSharing &&
        Number(booking.roomQuantity) === roomQuantity &&
        Number(booking.nights) === nights &&
        booking.checkIn === checkInDate &&
        booking.checkOut === checkOutDate &&
        Number(booking.amount) === Number(totalCost.toFixed(2));
    const createPlanEntry = (booking) => ({
        attractionId: attraction.id,
        attractionName: attraction.name,
        accommodation: selectedAccomData
            ? { id: selectedAccomData.id, name: selectedAccomData.name, price: selectedAccomData.pricePerNight, currency: selectedAccomData.currency || "ZAR" }
            : undefined,
        activities: selectedActivityData.map((a) => ({ id: a.id, name: a.name, price: a.pricePerPerson })),
        groupSize: adults,
        roomSharing,
        roomQuantity,
        guestsNeedingRoom,
        stayNights: nights,
        checkInDate,
        checkOutDate,
        accommodationTotal,
        activitiesTotal: totalActivityCost,
        booking,
    });
    const addToPlan = () => {
        const currentBooking = demoBooking || existingEntry?.booking;
        onAddToPlan(createPlanEntry(bookingMatchesSelection(currentBooking) ? currentBooking : undefined));
        onBack();
    };
    const saveDemoBooking = (booking) => {
        setDemoBooking(booking);
        return onAddToPlan(createPlanEntry(booking));
    };
    const finishDemoReservation = () => {
        setShowDemoBooking(false);
        onGoToPlan();
    };
    const openDirections = async () => {
        const { latitude, longitude, mapQuery } = attraction.map || {};
        const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);
        const destination = hasCoordinates
            ? `${latitude},${longitude}`
            : mapQuery || `${attraction.name}, ${attraction.location}`;
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
        try {
            await react_native_1.Linking.openURL(directionsUrl);
        }
        catch (_error) {
            react_native_1.Alert.alert("Unable to open directions", "Please try opening Google Maps on your device.");
        }
    };
    const openGeoapifyAttribution = async () => {
        try {
            await react_native_1.Linking.openURL("https://www.geoapify.com/");
        }
        catch (_error) {
            react_native_1.Alert.alert("Unable to open attribution", "Geoapify is available at geoapify.com.");
        }
    };
    const openAccommodationDirections = async (accommodation) => {
        const attractionMap = attraction.map || {};
        const hasDestinationCoordinates = Number.isFinite(attractionMap.latitude) && Number.isFinite(attractionMap.longitude);
        const hasOriginCoordinates = Number.isFinite(accommodation.latitude) && Number.isFinite(accommodation.longitude);
        const origin = hasOriginCoordinates
            ? `${accommodation.latitude},${accommodation.longitude}`
            : accommodation.details?.address || accommodation.name;
        const destination = hasDestinationCoordinates
            ? `${attractionMap.latitude},${attractionMap.longitude}`
            : attractionMap.mapQuery || `${attraction.name}, ${attraction.location}`;
        const directionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=driving`;
        try {
            await react_native_1.Linking.openURL(directionsUrl);
        }
        catch (_error) {
            react_native_1.Alert.alert("Unable to open directions", "Please try opening Google Maps on your device.");
        }
    };
    return (<react_native_1.View style={styles.screen}>
      <react_native_1.ScrollView showsVerticalScrollIndicator={false}>
        <react_native_1.View style={styles.hero}>
          <react_native_1.Image source={{ uri: attraction.image }} style={styles.heroImage}/>
          <expo_linear_gradient_1.LinearGradient colors={["rgba(0,0,0,0.3)", "transparent", "rgba(0,0,0,0.6)"]} locations={[0, 0.5, 1]} style={react_native_1.StyleSheet.absoluteFill}/>
          <react_native_1.Pressable onPress={onBack} style={styles.backBtn}>
            <Icons_1.IconBack color="#fff"/>
          </react_native_1.Pressable>
          <react_native_1.Pressable onPress={() => setShowOffline(!showOffline)} style={styles.offlineBtn}>
            <Icons_1.IconOffline color="#fff"/>
            <react_native_1.Text style={styles.offlineText}>{showOffline ? "Saved offline" : "Save offline"}</react_native_1.Text>
          </react_native_1.Pressable>
          <react_native_1.View style={styles.heroTextWrap}>
            {attraction.localFav && (<react_native_1.View style={{ marginBottom: 6, alignSelf: "flex-start" }}>
                <Badge_1.default color="sky" icon={<Icons_1.IconGem />}>Local Favourite</Badge_1.default>
              </react_native_1.View>)}
            <react_native_1.Text style={styles.heroTitle}>{attraction.name}</react_native_1.Text>
            <react_native_1.Text style={styles.heroLocation}>{attraction.location}</react_native_1.Text>
          </react_native_1.View>
        </react_native_1.View>

        <react_native_1.View style={styles.content}>
          <react_native_1.Text style={styles.description}>{attraction.description}</react_native_1.Text>
          <react_native_1.View style={styles.dataNotice}>
            <react_native_1.Text style={styles.dataNoticeTitle}>About this information</react_native_1.Text>
            <react_native_1.Text style={styles.dataNoticeText}>Reference: {attraction.source || "Not provided"}. Catalogue activity prices are planning estimates unless an official rate and source are shown. Confirm details with the operator. Live accommodation offers are requested for your selected dates and room setup; rates and availability can change.</react_native_1.Text>
          </react_native_1.View>

          <WeatherForecast_1.default latitude={weatherLatitude} longitude={weatherLongitude}/>

          <react_native_1.Pressable accessibilityRole="button" onPress={openDirections} style={styles.directionsBtn}>
            <react_native_1.Text style={styles.directionsBtnText}>Get directions in Google Maps</react_native_1.Text>
          </react_native_1.Pressable>

          <BudgetSlider_1.default value={budget} onChange={setBudget} label="Your budget per night"/>

          <react_native_1.View style={styles.tabRow}>
            {["stays", "activities"].map((t) => (<react_native_1.Pressable key={t} onPress={() => setTab(t)} style={[styles.tabBtn, tab === t && { backgroundColor: theme_1.colors.savanna }]}>
                <react_native_1.Text style={[styles.tabText, { color: tab === t ? theme_1.colors.ivory : theme_1.colors.charcoal, opacity: tab === t ? 1 : 0.6 }]}>
                  {t === "stays" ? "Where to Sleep" : "What to Do"}
                </react_native_1.Text>
              </react_native_1.Pressable>))}
          </react_native_1.View>

          <react_native_1.View style={styles.guestSelector}>
            <react_native_1.View style={styles.controlRow}>
              <react_native_1.View style={{ flex: 1 }}>
                <react_native_1.Text style={styles.guestTitle}>Travel party</react_native_1.Text>
                <react_native_1.Text style={styles.hintText}>{adults} guest{adults === 1 ? "" : "s"} · {checkInDate} to {checkOutDate}</react_native_1.Text>
              </react_native_1.View>
              <react_native_1.Pressable accessibilityLabel="Remove one guest" disabled={adults <= 1} onPress={() => { const next = Math.max(1, adults - 1); setAdults(next); setRoomQuantity((quantity) => Math.min(quantity, Math.max(1, Math.ceil(next / roomSharing)))); }} style={[styles.guestStepper, adults <= 1 && { opacity: 0.45 }]}><react_native_1.Text style={styles.guestStepperText}>−</react_native_1.Text></react_native_1.Pressable>
              <react_native_1.Text style={styles.guestCount}>{adults}</react_native_1.Text>
              <react_native_1.Pressable accessibilityLabel="Add one guest" disabled={adults >= 27} onPress={() => setAdults(Math.min(27, adults + 1))} style={[styles.guestStepper, adults >= 27 && { opacity: 0.45 }]}><react_native_1.Text style={styles.guestStepperText}>+</react_native_1.Text></react_native_1.Pressable>
            </react_native_1.View>
            <react_native_1.View style={{ gap: 6 }}>
              <react_native_1.Text style={styles.controlLabel}>Guests per room</react_native_1.Text>
              <react_native_1.View style={styles.choiceRow}>{[1, 2, 3].map((count) => (<react_native_1.Pressable key={count} onPress={() => { setRoomSharing(count); setRoomQuantity((quantity) => Math.min(quantity, Math.max(1, Math.ceil(adults / count)))); }} style={[styles.roomChoice, roomSharing === count && styles.roomChoiceActive]}><react_native_1.Text style={[styles.roomChoiceText, roomSharing === count && styles.roomChoiceTextActive]}>{count} {count === 1 ? "guest" : "sharing"}</react_native_1.Text></react_native_1.Pressable>))}</react_native_1.View>
            </react_native_1.View>
            <react_native_1.View style={styles.controlRow}>
              <react_native_1.View style={{ flex: 1 }}><react_native_1.Text style={styles.controlLabel}>Rooms</react_native_1.Text><react_native_1.Text style={styles.hintText}>{guestsNeedingRoom} guest{guestsNeedingRoom === 1 ? "" : "s"} still need a room</react_native_1.Text></react_native_1.View>
              <react_native_1.Pressable accessibilityLabel="Remove one room" disabled={roomQuantity <= 1} onPress={() => setRoomQuantity(Math.max(1, roomQuantity - 1))} style={[styles.guestStepper, roomQuantity <= 1 && { opacity: 0.45 }]}><react_native_1.Text style={styles.guestStepperText}>−</react_native_1.Text></react_native_1.Pressable>
              <react_native_1.Text style={styles.guestCount}>{roomQuantity}</react_native_1.Text>
              <react_native_1.Pressable accessibilityLabel="Add one room" disabled={roomQuantity >= Math.min(9, Math.ceil(adults / roomSharing))} onPress={() => setRoomQuantity(Math.min(9, Math.ceil(adults / roomSharing), roomQuantity + 1))} style={[styles.guestStepper, roomQuantity >= Math.min(9, Math.ceil(adults / roomSharing)) && { opacity: 0.45 }]}><react_native_1.Text style={styles.guestStepperText}>+</react_native_1.Text></react_native_1.Pressable>
            </react_native_1.View>
            <react_native_1.View style={styles.controlRow}>
              <react_native_1.View style={{ flex: 1 }}><react_native_1.Text style={styles.controlLabel}>Check-in</react_native_1.Text><react_native_1.Text style={styles.hintText}>{new Date(`${checkInDate}T12:00:00`).toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })}</react_native_1.Text></react_native_1.View>
              <react_native_1.Pressable accessibilityRole="button" accessibilityLabel="Choose check-in date" onPress={() => setShowCheckInPicker(true)} style={styles.dateButton}><react_native_1.Text style={styles.dateButtonText}>Change date</react_native_1.Text></react_native_1.Pressable>
            </react_native_1.View>
            <react_native_1.View style={styles.controlRow}>
              <react_native_1.View style={{ flex: 1 }}><react_native_1.Text style={styles.controlLabel}>Nights</react_native_1.Text><react_native_1.Text style={styles.hintText}>Check-out: {checkOutDate}</react_native_1.Text></react_native_1.View>
              <react_native_1.Pressable accessibilityLabel="Remove one night" disabled={nights <= 1} onPress={() => setNights(Math.max(1, nights - 1))} style={[styles.guestStepper, nights <= 1 && { opacity: 0.45 }]}><react_native_1.Text style={styles.guestStepperText}>−</react_native_1.Text></react_native_1.Pressable>
              <react_native_1.Text style={styles.guestCount}>{nights}</react_native_1.Text>
              <react_native_1.Pressable accessibilityLabel="Add one night" disabled={nights >= 30} onPress={() => setNights(Math.min(30, nights + 1))} style={[styles.guestStepper, nights >= 30 && { opacity: 0.45 }]}><react_native_1.Text style={styles.guestStepperText}>+</react_native_1.Text></react_native_1.Pressable>
            </react_native_1.View>
            <react_native_1.Text style={styles.hintText}>Live rates refresh for the selected room occupancy, room count and stay dates.</react_native_1.Text>
          </react_native_1.View>

          {tab === "stays" && (<react_native_1.View style={{ gap: 8 }}>
              <react_native_1.Pressable accessibilityRole="button" onPress={requestUserLocation} style={styles.locationButton}>
                <react_native_1.Text style={styles.locationButtonText}>{userLocation ? "Refresh my location" : "Show distance from my location"}</react_native_1.Text>
              </react_native_1.Pressable>
              {!!locationMessage && <react_native_1.Text style={styles.locationMessage}>{locationMessage}</react_native_1.Text>}
              <react_native_1.Text style={styles.hintText}>
                {sortedAccoms.length} stays · Prices sorted within each currency · Tap a card for details
              </react_native_1.Text>
              {hasNonRandAccommodationPrice && (
                <react_native_1.Text style={styles.hintText}>
                  Some prices are not in rand and are excluded from the Rand budget comparison.
                </react_native_1.Text>
              )}
              {sortedAccoms.some((ac) => ac.source === "OpenStreetMap") && (
                <react_native_1.Text style={styles.hintText}>
                  Mapped places © OpenStreetMap contributors · Rates and availability are not included.
                </react_native_1.Text>
              )}
              {sortedAccoms.some((ac) => ac.source === "Geoapify") && (
                <react_native_1.Text style={styles.hintText}>
                  <react_native_1.Text accessibilityRole="link" onPress={openGeoapifyAttribution} style={{ textDecorationLine: "underline" }}>
                    Powered by Geoapify
                  </react_native_1.Text>
                  {" "}· © OpenStreetMap contributors · Rates and availability are not included.
                </react_native_1.Text>
              )}
              {lodgingLoading && (<react_native_1.View style={{ paddingVertical: 30, alignItems: "center" }}><react_native_1.Text style={styles.emptyHint}>Loading nearby stays...</react_native_1.Text></react_native_1.View>)}
              {!!lodgingError && (<react_native_1.Text style={styles.errorHint}>Live accommodation search failed: {lodgingError}{sortedAccoms.length > 0 ? " Showing saved recommendations." : ""}</react_native_1.Text>)}
              {!!hotelWarning && (<react_native_1.Text style={styles.errorHint}>Hotel prices: {hotelWarning}</react_native_1.Text>)}
              {!!photoWarning && (<react_native_1.Text style={styles.errorHint}>Accommodation photos: {photoWarning}</react_native_1.Text>)}
              {!lodgingLoading && sortedAccoms.length === 0 && !lodgingError && (<react_native_1.View style={{ paddingVertical: 30, alignItems: "center" }}>
                  <react_native_1.Text style={styles.emptyHint}>No nearby accommodations were found. Try another attraction or check your hotel provider configuration.</react_native_1.Text>
                </react_native_1.View>)}
              {sortedAccoms.map((ac) => (<react_native_1.View key={ac.id} style={{ gap: 4 }}><AccomCard_1.default accom={ac} selected={selectedAccom === ac.id} overBudget={ac.pricePerNight != null && (!ac.currency || String(ac.currency).toUpperCase() === "ZAR") && ac.pricePerNight > budget} onView={() => setViewingAccom(ac)} onSelect={() => setSelectedAccom(selectedAccom === ac.id ? undefined : ac.id)} onDirections={() => openAccommodationDirections(ac)}/>{userLocation && (ac.latitude != null && ac.longitude != null && Number.isFinite(Number(ac.latitude)) && Number.isFinite(Number(ac.longitude)) ? <react_native_1.Text style={styles.locationMessage}>Approx. {distanceBetweenCoordinates(userLocation, { latitude: Number(ac.latitude), longitude: Number(ac.longitude) }).toFixed(1)} km from your location</react_native_1.Text> : <react_native_1.Text style={styles.locationMessage}>Location distance unavailable for this accommodation.</react_native_1.Text>)}</react_native_1.View>))}
            </react_native_1.View>)}

          {tab === "activities" && (<react_native_1.View style={{ gap: 8 }}>
              <react_native_1.Text style={styles.hintText}>Tap to add to your day plan · Prices per person</react_native_1.Text>
              {attraction.activities.map((act) => (<ActivityCard_1.default key={act.id} activity={act} selected={selectedActivities.has(act.id)} onToggle={() => toggleActivity(act.id)}/>))}
            </react_native_1.View>)}

          <react_native_1.View style={{ height: 90 }}/>
        </react_native_1.View>
      </react_native_1.ScrollView>

      {(selectedAccomData || selectedActivities.size > 0) && (<react_native_1.View style={styles.stickyCta}>
          <react_native_1.View style={styles.stickyRow}>
            <react_native_1.View>
              <react_native_1.Text style={styles.dayTotalLabel}>{!selectedAccomData ? "Activity estimate" : totalIsPartial ? "Current trip estimate" : "Estimated trip total"}</react_native_1.Text>
              <react_native_1.Text style={styles.dayTotalValue}>{totalIsPartial && selectedActivities.size === 0 ? "Rate unavailable" : (0, format_1.fmt)(totalCost)}</react_native_1.Text>
            </react_native_1.View>
            <react_native_1.View style={{ alignItems: "flex-end" }}>
              {selectedAccomData && (<react_native_1.Text style={styles.stickyDetail}>{roomQuantity} room{roomQuantity === 1 ? "" : "s"} · {nights} night{nights === 1 ? "" : "s"}</react_native_1.Text>)}
              {selectedActivities.size > 0 && (<react_native_1.Text style={styles.stickyDetail}>
                  {selectedActivities.size} activit{selectedActivities.size === 1 ? "y" : "ies"} · {(0, format_1.fmt)(totalActivityCost)}
                </react_native_1.Text>)}
            </react_native_1.View>
          </react_native_1.View>
          {selectedAccomData && (<react_native_1.Pressable onPress={() => setShowDemoBooking(true)} style={styles.addBtn}>
            <react_native_1.Text style={styles.addBtnText}>{demoBooking ? "View booking & payment reference" : "Book this stay"}</react_native_1.Text>
          </react_native_1.Pressable>)}
          <react_native_1.Pressable onPress={addToPlan} style={styles.addBtn}>
            <react_native_1.Text style={styles.addBtnText}>Add to Day Plan →</react_native_1.Text>
          </react_native_1.Pressable>
        </react_native_1.View>)}

      <AccomDetailModal_1.default visible={!!viewingAccom} accom={viewingAccom} attractionName={attraction.name} attractionLocation={attraction.location} photoWarning={photoWarning} isSelected={!!viewingAccom && selectedAccom === viewingAccom.id} onClose={() => setViewingAccom(null)} onSelect={() => viewingAccom && setSelectedAccom(selectedAccom === viewingAccom.id ? undefined : viewingAccom.id)} onDirections={() => viewingAccom && openAccommodationDirections(viewingAccom)}/>
      <CheckInDatePicker_1.default visible={showCheckInPicker} selectedDate={checkInDate} onSelect={setCheckInDate} onClose={() => setShowCheckInPicker(false)}/>
      <BookingModal_1.default
        visible={showDemoBooking}
        accommodation={selectedAccomData}
        attractionName={attraction.name}
        guestName={[currentUser?.firstName, currentUser?.lastName].filter(Boolean).join(" ")}
        guestEmail={currentUser?.email || ""}
        adults={adults}
        roomSharing={roomSharing}
        roomQuantity={roomQuantity}
        guestsNeedingRoom={guestsNeedingRoom}
        activities={selectedActivityData}
        checkInDate={checkInDate}
        checkOutDate={checkOutDate}
        existingBooking={demoBooking || existingEntry?.booking}
        onClose={() => setShowDemoBooking(false)}
        onBookingCreated={saveDemoBooking}
        onReserved={finishDemoReservation}
      />
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    screen: { flex: 1, backgroundColor: theme_1.colors.sand },
    hero: { height: 260, backgroundColor: theme_1.colors.sand },
    heroImage: { width: "100%", height: "100%" },
    backBtn: { position: "absolute", top: 48, left: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(0,0,0,0.3)", alignItems: "center", justifyContent: "center" },
    offlineBtn: { position: "absolute", top: 48, right: 16, flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.3)" },
    offlineText: { fontSize: 11, fontFamily: theme_1.fonts.bodySemiBold, color: "#fff" },
    heroTextWrap: { position: "absolute", bottom: 16, left: 16, right: 16 },
    heroTitle: { fontSize: 24, fontFamily: theme_1.fonts.display, color: "#fff", lineHeight: 28 },
    heroLocation: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 3 },
    content: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
    description: { fontSize: 14, lineHeight: 20, color: theme_1.colors.charcoal, opacity: 0.75 },
    dataNotice: { padding: 13, borderRadius: 13, backgroundColor: theme_1.colors.ivory, gap: 4 },
    dataNoticeTitle: { color: theme_1.colors.savanna, fontSize: 12, fontFamily: theme_1.fonts.bodySemiBold },
    dataNoticeText: { color: theme_1.colors.charcoal, opacity: 0.7, fontSize: 11, lineHeight: 16 },
    directionsBtn: { paddingVertical: 14, paddingHorizontal: 16, borderRadius: 14, backgroundColor: theme_1.colors.savanna, alignItems: "center" },
    directionsBtnText: { fontSize: 14, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.ivory },
    locationButton: { alignSelf: "flex-start", paddingHorizontal: 15, paddingVertical: 11, borderRadius: 12, backgroundColor: theme_1.colors.sand },
    locationButtonText: { color: theme_1.colors.savanna, fontFamily: theme_1.fonts.bodySemiBold, fontSize: 12 },
    locationMessage: { color: theme_1.colors.charcoal, opacity: 0.65, fontSize: 11, lineHeight: 16 },
    tabRow: { flexDirection: "row", borderRadius: 14, overflow: "hidden", backgroundColor: theme_1.colors.ivory, borderWidth: 1, borderColor: "rgba(62,50,38,0.1)" },
    tabBtn: { flex: 1, paddingVertical: 11, alignItems: "center" },
    tabText: { fontSize: 13, fontFamily: theme_1.fonts.bodySemiBold },
    guestSelector: { gap: 12, padding: 14, borderRadius: 14, backgroundColor: theme_1.colors.ivory },
    controlRow: { flexDirection: "row", alignItems: "center", gap: 10 },
    controlLabel: { fontSize: 12, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.charcoal },
    dateButton: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 10, backgroundColor: theme_1.colors.savanna },
    dateButtonText: { color: theme_1.colors.ivory, fontSize: 11, fontFamily: theme_1.fonts.bodySemiBold },
    choiceRow: { flexDirection: "row", gap: 6 },
    roomChoice: { flex: 1, alignItems: "center", paddingVertical: 8, paddingHorizontal: 5, borderRadius: 10, backgroundColor: theme_1.colors.sand, borderWidth: 1, borderColor: "#DED5C5" },
    roomChoiceActive: { backgroundColor: theme_1.colors.savanna, borderColor: theme_1.colors.savanna },
    roomChoiceText: { fontSize: 10, color: theme_1.colors.charcoal },
    roomChoiceTextActive: { color: theme_1.colors.ivory, fontFamily: theme_1.fonts.bodySemiBold },
    guestTitle: { fontSize: 13, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.charcoal, marginBottom: 3 },
    guestStepper: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme_1.colors.savanna, alignItems: "center", justifyContent: "center" },
    guestStepperText: { fontSize: 20, color: theme_1.colors.ivory, lineHeight: 24 },
    guestCount: { minWidth: 18, textAlign: "center", fontSize: 15, fontFamily: theme_1.fonts.bodyBold, color: theme_1.colors.charcoal },
    hintText: { fontSize: 11, color: theme_1.colors.charcoal, opacity: 0.5 },
    emptyHint: { fontSize: 13, color: theme_1.colors.charcoal, opacity: 0.5 },
    errorHint: { fontSize: 12, lineHeight: 18, color: "#9B3328" },
    stickyCta: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 16,
        borderRadius: 18,
        padding: 16,
        backgroundColor: theme_1.colors.savanna,
        shadowColor: theme_1.colors.savanna,
        shadowOpacity: 0.35,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    stickyRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
    dayTotalLabel: { fontSize: 10, fontFamily: theme_1.fonts.bodySemiBold, textTransform: "uppercase", letterSpacing: 0.5, color: "rgba(232,220,196,0.6)" },
    dayTotalValue: { fontSize: 20, fontFamily: theme_1.fonts.display, color: theme_1.colors.ivory },
    stickyDetail: { fontSize: 11, color: "rgba(232,220,196,0.7)" },
    addBtn: { paddingVertical: 13, borderRadius: 14, backgroundColor: theme_1.colors.terra, alignItems: "center" },
    addBtnText: { fontSize: 14, fontFamily: theme_1.fonts.bodyBold, color: theme_1.colors.ivory },
});
