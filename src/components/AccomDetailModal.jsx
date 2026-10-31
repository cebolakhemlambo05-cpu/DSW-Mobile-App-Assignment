"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AccomDetailModal;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const expo_linear_gradient_1 = require("expo-linear-gradient");
const theme_1 = require("../theme/theme");
const format_1 = require("../utils/format");
const Badge_1 = __importDefault(require("./Badge"));
const Icons_1 = require("./Icons");
const { height: SCREEN_H, width: SCREEN_W } = react_native_1.Dimensions.get("window");
function AccomDetailModal({ visible, accom, attractionName, photoWarning, isSelected, onClose, onSelect, onDirections, }) {
    if (!accom)
        return null;
    const d = { ...(accom.details || {}) };
    if (!d.roomTypes)
        d.roomTypes = [];
    if (!d.amenities)
        d.amenities = [];
    if (!d.reviews)
        d.reviews = [];
    if (!d.cancellation)
        d.cancellation = "Check with property for cancellation terms.";
    if (!d.address)
        d.address = "Address not provided by the accommodation provider.";
    if (!d.phone)
        d.phone = "Phone number not provided by the accommodation provider.";
    if (!d.checkIn)
        d.checkIn = "Check with property";
    if (!d.checkOut)
        d.checkOut = "Check with property";
    const displayedRating = Number.isFinite(accom.rating) ? accom.rating : null;
    const displayedReviewCount = accom.reviewCount;
    const ratingCaption = displayedRating == null
        ? "Rating not supplied by provider"
        : accom.source === "Hotelbeds"
            ? `Property category · ${displayedRating}-star Hotelbeds classification`
            : displayedReviewCount > 0
                ? `Guest rating · ${displayedReviewCount} reviews · ${accom.source || "provider"}`
                : `Provider rating · ${accom.source || "source unavailable"}; review count unavailable`;
    const images = d.images?.length ? d.images : d.image ? [d.image] : [];
    const stars = Number.isFinite(displayedRating) ? Math.round(displayedRating) : 0;
    const checkPrices = async () => {
        const propertyWebsite = typeof d.website === "string" && /^https?:\/\//i.test(d.website)
            ? d.website
            : null;
        const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(`${accom.name} accommodation room prices`)}`;
        try {
            await react_native_1.Linking.openURL(propertyWebsite || searchUrl);
        }
        catch (_error) {
            react_native_1.Alert.alert("Unable to check prices", "Please try again or contact the accommodation directly.");
        }
    };
    const openPhotoAttribution = async (uri) => {
        try {
            await react_native_1.Linking.openURL(uri);
        }
        catch (_error) {
            react_native_1.Alert.alert("Unable to open photo credit", "Please try again later.");
        }
    };
    return (<react_native_1.Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <react_native_1.Pressable style={styles.backdrop} onPress={onClose}/>
      <react_native_1.View style={[styles.sheet, { maxHeight: SCREEN_H * 0.92 }]}>
        {/* Photo header */}
        <react_native_1.View style={styles.heroWrap}>
          {images.length > 0 ? (
            <react_native_1.ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {images.map((image, index) => (
                <react_native_1.Image key={`${image}-${index}`} source={{ uri: image }} style={[styles.hero, { width: SCREEN_W }]} />
              ))}
            </react_native_1.ScrollView>
          ) : (
            <react_native_1.View style={styles.noPhoto}>
              <react_native_1.Text style={styles.noPhotoText}>No property photos available</react_native_1.Text>
              {!!photoWarning && (
                <react_native_1.Text style={styles.photoWarning}>
                  {photoWarning}
                </react_native_1.Text>
              )}
            </react_native_1.View>
          )}
          <expo_linear_gradient_1.LinearGradient colors={["transparent", "rgba(0,0,0,0.1)", "rgba(0,0,0,0.6)"]} style={react_native_1.StyleSheet.absoluteFill}/>
          <react_native_1.Pressable onPress={onClose} style={styles.closeBtn}>
            <Icons_1.IconClose color="#fff"/>
          </react_native_1.Pressable>
          {accom.localFav && (<react_native_1.View style={styles.localFavPill}>
              <Icons_1.IconGem size={11} color={theme_1.colors.ivory}/>
              <react_native_1.Text style={styles.localFavText}> Local Favourite</react_native_1.Text>
            </react_native_1.View>)}
          <react_native_1.View style={styles.heroTextWrap}>
            <react_native_1.Text style={styles.heroTitle}>{accom.name}</react_native_1.Text>
            <react_native_1.View style={styles.heroMetaRow}>
              <Icons_1.IconMapPin size={12} color="rgba(255,255,255,0.75)"/>
              <react_native_1.Text style={styles.heroMeta}> {Number.isFinite(accom.distanceKm) ? `${accom.distanceKm}km to ${attractionName.split(" ")[0]} gate` : "Distance unavailable"}  ·  {accom.type}</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>
        </react_native_1.View>

        {!!d.photoAttributions?.length && (
          <react_native_1.View style={styles.photoCredits}>
            <react_native_1.Text style={styles.ratingSub}>Photo credits: </react_native_1.Text>
            {d.photoAttributions.map((attribution, index) => {
              const credit = typeof attribution === "string"
                ? { displayName: attribution, uri: "" }
                : attribution;
              return (
                <react_native_1.Text
                  key={`${credit.displayName}-${index}`}
                  accessibilityRole={credit.uri ? "link" : undefined}
                  onPress={credit.uri ? () => openPhotoAttribution(credit.uri) : undefined}
                  style={[styles.ratingSub, credit.uri ? styles.photoCreditLink : null]}
                >
                  {credit.displayName}{index < d.photoAttributions.length - 1 ? ", " : ""}
                </react_native_1.Text>
              );
            })}
          </react_native_1.View>
        )}
        <react_native_1.ScrollView style={styles.body} contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
          {/* Rating + price */}
          <react_native_1.View style={styles.ratingPriceRow}>
            <react_native_1.View>
              <react_native_1.View style={styles.starsRow}>
                {Array.from({ length: 5 }).map((_, i) => (<Icons_1.IconStar key={i} size={15} filled={i < stars}/>))}
                <react_native_1.Text style={styles.ratingNum}> {displayedRating}</react_native_1.Text>
              </react_native_1.View>
              <react_native_1.Text style={styles.ratingSub}>
                  {ratingCaption}
              </react_native_1.Text>
            </react_native_1.View>
            <react_native_1.View style={{ alignItems: "flex-end" }}>
              <react_native_1.Text style={styles.priceBig}>{(0, format_1.fmt)(accom.pricePerNight, accom.currency)}</react_native_1.Text>
              <react_native_1.Text style={styles.priceSub}>{accom.pricePerNight == null ? 'No verified live rate' : 'per room/night (from provider offer)'}</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>

          {/* Badges */}
          <react_native_1.View style={styles.badgeRow}>
            {accom.peakDouble && <Badge_1.default color="mustard" icon={<Icons_1.IconWarn />}>Prices double Dec/Easter</Badge_1.default>}
            {accom.localFav && <Badge_1.default color="sky" icon={<Icons_1.IconGem />}>Local Favourite</Badge_1.default>}
          </react_native_1.View>

          <react_native_1.Text style={styles.description}>{d.description}</react_native_1.Text>
          {/* Key info grid */}
          <react_native_1.View style={styles.infoGrid}>
            {[
            { icon: <Icons_1.IconClock color={theme_1.colors.sky}/>, label: "Check-in", value: d.checkIn },
            { icon: <Icons_1.IconClock color={theme_1.colors.sky}/>, label: "Check-out", value: d.checkOut },
            { icon: <Icons_1.IconMapPin color={theme_1.colors.sky}/>, label: "Address", value: d.address.split(",")[0] },
            { icon: <Icons_1.IconPhone color={theme_1.colors.sky}/>, label: "Phone", value: d.phone },
        ].map((item) => (<react_native_1.View key={item.label} style={styles.infoCard}>
                {item.icon}
                <react_native_1.View style={{ marginLeft: 8, flex: 1 }}>
                  <react_native_1.Text style={styles.infoLabel}>{item.label}</react_native_1.Text>
                  <react_native_1.Text style={styles.infoValue}>{item.value}</react_native_1.Text>
                </react_native_1.View>
              </react_native_1.View>))}
          </react_native_1.View>

          {/* Amenities */}
          <react_native_1.Text style={styles.sectionTitle}>Services & Amenities</react_native_1.Text>
          <react_native_1.View style={styles.amenitiesGrid}>
            {d.amenities.length ? d.amenities.map((a) => (<react_native_1.View key={a} style={styles.amenityRow}>
                <Icons_1.IconCheck color={theme_1.colors.sky}/>
                <react_native_1.Text style={styles.amenityText}> {a}</react_native_1.Text>
              </react_native_1.View>)) : (<react_native_1.Text style={styles.ratingSub}>Amenities have not been provided by this listing.</react_native_1.Text>)}
          </react_native_1.View>

          {/* Room types */}
          <react_native_1.Text style={styles.sectionTitle}>Room Types</react_native_1.Text>
          <react_native_1.View style={{ gap: 8 }}>
            {d.roomTypes.length ? d.roomTypes.map((r, index) => {
              const room = r && typeof r === "object"
                ? r
                : { name: typeof r === "string" ? r : "Room" };
              const sleeps = Number(room.sleeps);
              const occupancy = Number.isInteger(sleeps) && sleeps > 0
                ? `Sleeps ${sleeps} people per room`
                : "Occupancy not provided";
              const bedDetails = typeof room.beds === "string" && room.beds.trim()
                ? `${room.beds} · `
                : "";
              return (<react_native_1.View key={room.name || `room-${index}`} style={styles.roomRow}>
                <react_native_1.View style={{ flex: 1 }}>
                  <react_native_1.Text style={styles.roomName}>{room.name || "Room"}</react_native_1.Text>
                  <react_native_1.Text style={styles.roomMeta}>{bedDetails}{occupancy}</react_native_1.Text>
                </react_native_1.View>
                <react_native_1.Pressable accessibilityRole="button" onPress={checkPrices} style={styles.priceCheckButton}>
                  <react_native_1.Text style={styles.priceCheckText}>
                    {room.pricePerNight == null
                      ? "Check prices"
                      : `${(0, format_1.fmt)(room.pricePerNight, accom.currency)} /night`}
                  </react_native_1.Text>
                </react_native_1.Pressable>
              </react_native_1.View>);
            }) : (<>
              <react_native_1.Text style={styles.ratingSub}>Room types, occupancy and nightly rates are not provided by this listing.</react_native_1.Text>
              <react_native_1.Pressable accessibilityRole="button" onPress={checkPrices} style={styles.priceCheckButton}>
                <react_native_1.Text style={styles.priceCheckText}>Check prices</react_native_1.Text>
              </react_native_1.Pressable>
            </>)}
          </react_native_1.View>

          {/* Cancellation */}
          <react_native_1.View style={styles.cancellationBox}>
            <Icons_1.IconShield color={theme_1.colors.savanna}/>
            <react_native_1.View style={{ marginLeft: 10, flex: 1 }}>
              <react_native_1.Text style={styles.cancellationTitle}>Cancellation Policy</react_native_1.Text>
              <react_native_1.Text style={styles.cancellationText}>{d.cancellation}</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>

          {/* Reviews */}
          <react_native_1.Text style={styles.sectionTitle}>Guest Reviews</react_native_1.Text>
          <react_native_1.View style={{ gap: 10 }}>
            {d.reviews.length ? d.reviews.map((r) => (<react_native_1.View key={r.author} style={styles.reviewCard}>
                <react_native_1.View style={styles.reviewHeader}>
                  <react_native_1.Text style={styles.reviewAuthor}>{r.author}</react_native_1.Text>
                  <react_native_1.View style={{ flexDirection: "row", gap: 2 }}>
                    {Array.from({ length: 5 }).map((_, i) => (<Icons_1.IconStar key={i} size={11} filled={i < r.rating}/>))}
                  </react_native_1.View>
                </react_native_1.View>
                <react_native_1.Text style={styles.reviewText}>&ldquo;{r.text}&rdquo;</react_native_1.Text>
              </react_native_1.View>)) : (<react_native_1.Text style={styles.ratingSub}>Written reviews are not available from this provider.</react_native_1.Text>)}
          </react_native_1.View>
        </react_native_1.ScrollView>

        {/* Sticky footer */}
        <react_native_1.View style={styles.footer}>
          <react_native_1.Pressable accessibilityRole="button" onPress={onDirections} style={[styles.ctaBtn, styles.directionsCta]}>
            <react_native_1.Text style={styles.ctaText}>Directions</react_native_1.Text>
          </react_native_1.Pressable>
          <react_native_1.Pressable onPress={() => { onSelect(); onClose(); }} style={[styles.ctaBtn, { backgroundColor: isSelected ? theme_1.colors.savanna : theme_1.colors.terra }]}>
            {isSelected ? (<react_native_1.View style={styles.ctaRow}>
                <Icons_1.IconCheck color={theme_1.colors.ivory}/>
                <react_native_1.Text style={styles.ctaText}>  Selected for Day Plan</react_native_1.Text>
              </react_native_1.View>) : (<react_native_1.Text style={styles.ctaText}>Select this Stay →</react_native_1.Text>)}
          </react_native_1.Pressable>
          {isSelected && <react_native_1.Text style={styles.deselectHint}>Tap again to deselect</react_native_1.Text>}
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.Modal>);
}
const styles = react_native_1.StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: "rgba(62,50,38,0.55)" },
    sheet: {
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: theme_1.colors.ivory,
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        overflow: "hidden",
    },
    heroWrap: { height: 200, backgroundColor: theme_1.colors.sand },
    hero: { width: "100%", height: "100%" },
    noPhoto: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme_1.colors.sand },
    noPhotoText: { color: theme_1.colors.charcoal, fontSize: 12 },
    photoWarning: { color: theme_1.colors.charcoal, opacity: 0.65, fontSize: 10, textAlign: "center", marginTop: 8, paddingHorizontal: 24 },
    closeBtn: {
        position: "absolute",
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: "rgba(0,0,0,0.4)",
        alignItems: "center",
        justifyContent: "center",
    },
    localFavPill: {
        position: "absolute",
        top: 16,
        left: 16,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: theme_1.colors.sky,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    localFavText: { fontSize: 11, fontFamily: theme_1.fonts.bodyBold, color: theme_1.colors.ivory },
    heroTextWrap: { position: "absolute", bottom: 16, left: 16, right: 56 },
    heroTitle: { color: "#fff", fontSize: 20, fontFamily: theme_1.fonts.display, lineHeight: 24 },
    heroMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    heroMeta: { color: "rgba(255,255,255,0.75)", fontSize: 11 },
    body: { paddingHorizontal: 20, paddingTop: 20 },
    ratingPriceRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
    starsRow: { flexDirection: "row", alignItems: "center" },
    ratingNum: { fontSize: 13, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.charcoal, marginLeft: 2 },
    ratingSub: { fontSize: 11, color: theme_1.colors.charcoal, opacity: 0.5, marginTop: 2 },
    photoCredits: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 20, paddingTop: 8 },
    photoCreditLink: { textDecorationLine: "underline" },
    priceBig: { fontSize: 24, fontFamily: theme_1.fonts.display, color: theme_1.colors.charcoal },
    priceSub: { fontSize: 10, color: theme_1.colors.charcoal, opacity: 0.5 },
    badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 14 },
    description: { fontSize: 13, lineHeight: 19, color: theme_1.colors.charcoal, opacity: 0.8, marginBottom: 16 },
    infoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
    infoCard: {
        width: "47%",
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: theme_1.colors.sand,
        borderRadius: 12,
        padding: 12,
    },
    infoLabel: { fontSize: 9, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.charcoal, opacity: 0.5, textTransform: "uppercase", letterSpacing: 0.3 },
    infoValue: { fontSize: 12, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.charcoal, marginTop: 2 },
    sectionTitle: { fontSize: 12, fontFamily: theme_1.fonts.bodyBold, letterSpacing: 0.8, textTransform: "uppercase", color: theme_1.colors.savanna, marginBottom: 12, marginTop: 4 },
    amenitiesGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
    amenityRow: { flexDirection: "row", alignItems: "center", width: "50%", paddingVertical: 4 },
    amenityText: { fontSize: 12, color: theme_1.colors.charcoal },
    roomRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme_1.colors.sand,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    roomName: { fontSize: 14, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.charcoal },
    roomMeta: { fontSize: 11, color: theme_1.colors.charcoal, opacity: 0.6, marginTop: 2 },
    roomPrice: { fontSize: 16, fontFamily: theme_1.fonts.display, color: theme_1.colors.charcoal },
    roomPriceUnit: { fontSize: 10, fontFamily: theme_1.fonts.body, opacity: 0.5 },
    priceCheckButton: {
        minHeight: 40,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: theme_1.colors.savanna,
        alignItems: "center",
        justifyContent: "center",
    },
    priceCheckText: { fontSize: 12, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.ivory },
    cancellationBox: { flexDirection: "row", backgroundColor: theme_1.colors.sand, borderRadius: 12, padding: 16, marginTop: 20, marginBottom: 20 },
    cancellationTitle: { fontSize: 11, fontFamily: theme_1.fonts.bodyBold, textTransform: "uppercase", color: theme_1.colors.savanna, marginBottom: 4 },
    cancellationText: { fontSize: 12, lineHeight: 17, color: theme_1.colors.charcoal, opacity: 0.75 },
    reviewCard: { backgroundColor: theme_1.colors.sand, borderRadius: 12, padding: 14 },
    reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
    reviewAuthor: { fontSize: 12, fontFamily: theme_1.fonts.bodyBold, color: theme_1.colors.charcoal },
    reviewText: { fontSize: 12, lineHeight: 17, color: theme_1.colors.charcoal, opacity: 0.75 },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: "rgba(62,50,38,0.1)",
        backgroundColor: theme_1.colors.ivory,
    },
    ctaBtn: { paddingVertical: 15, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    directionsCta: { marginBottom: 8, backgroundColor: theme_1.colors.savanna },
    ctaRow: { flexDirection: "row", alignItems: "center" },
    ctaText: { fontSize: 14, fontFamily: theme_1.fonts.bodyBold, color: theme_1.colors.ivory },
    deselectHint: { textAlign: "center", fontSize: 11, color: theme_1.colors.charcoal, opacity: 0.5, marginTop: 8 },
});
