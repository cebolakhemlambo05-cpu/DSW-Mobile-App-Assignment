"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AttractionCard;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const expo_linear_gradient_1 = require("expo-linear-gradient");
const theme_1 = require("../theme/theme");
const Icons_1 = require("./Icons");
const CATEGORY_COLOR = {
    Wildlife: "#3A5A40",
    Mountains: "#5a7a60",
    City: "#7A9E9F",
    Coast: "#4a8a8b",
};
function AttractionCard({ attraction: a, budget, onPress, }) {
  const cheapest = a.accommodations?.length
    ? Math.min(...a.accommodations.map((ac) => ac.pricePerNight))
    : null;
  const withinBudget = cheapest === null || cheapest <= budget;
    return (<react_native_1.Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.9 }]}>
      <react_native_1.View style={styles.imageWrap}>
        <react_native_1.Image source={{ uri: a.image }} style={styles.image}/>
        <expo_linear_gradient_1.LinearGradient colors={["rgba(0,0,0,0.45)", "transparent"]} style={react_native_1.StyleSheet.absoluteFill}/>
        <react_native_1.View style={styles.topRow}>
          <react_native_1.View style={[styles.categoryPill, { backgroundColor: CATEGORY_COLOR[a.category] || theme_1.colors.savanna }]}>
            <react_native_1.Text style={styles.categoryText}>{a.category}</react_native_1.Text>
          </react_native_1.View>
          {a.localFav && (<react_native_1.View style={styles.localFavPill}>
              <Icons_1.IconGem size={11} color={theme_1.colors.ivory}/>
              <react_native_1.Text style={styles.localFavText}>Local Fav</react_native_1.Text>
            </react_native_1.View>)}
        </react_native_1.View>
        <react_native_1.View style={styles.bottomText}>
          <react_native_1.Text style={styles.title}>{a.name}</react_native_1.Text>
          <react_native_1.View style={styles.locationRow}>
            <Icons_1.IconMapPin size={11} color="rgba(255,255,255,0.7)"/>
            <react_native_1.Text style={styles.location}> {a.location}</react_native_1.Text>
          </react_native_1.View>
        </react_native_1.View>
      </react_native_1.View>
      <react_native_1.View style={styles.footer}>
        <react_native_1.View>
          <react_native_1.Text style={styles.fromLabel}>Stays from</react_native_1.Text>
          <react_native_1.Text style={styles.price}>
            {cheapest === null ? "Activities only" : `R${cheapest.toLocaleString("en-ZA")}/night`}
          </react_native_1.Text>
        </react_native_1.View>
        <react_native_1.View style={[
            styles.budgetPill,
            { backgroundColor: withinBudget ? "rgba(122,158,159,0.1)" : "rgba(201,123,74,0.1)" },
        ]}>
          <react_native_1.Text style={[styles.budgetText, { color: withinBudget ? "#4a7a7b" : "#8a4a1a" }]}>
            {withinBudget ? "Within budget" : "Stretches budget"}
          </react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.Pressable>);
}
const styles = react_native_1.StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: 20,
        overflow: "hidden",
        backgroundColor: theme_1.colors.ivory,
        shadowColor: theme_1.colors.charcoal,
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
        marginBottom: 14,
    },
    imageWrap: { height: 160, backgroundColor: theme_1.colors.sand },
    image: { width: "100%", height: "100%" },
    topRow: {
        position: "absolute",
        top: 10,
        left: 10,
        right: 10,
        flexDirection: "row",
        gap: 6,
    },
    categoryPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
    categoryText: { fontSize: 10, fontFamily: theme_1.fonts.bodyBold, color: theme_1.colors.ivory, letterSpacing: 0.3 },
    localFavPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        backgroundColor: theme_1.colors.sky,
    },
    localFavText: { fontSize: 10, fontFamily: theme_1.fonts.bodyBold, color: theme_1.colors.ivory },
    bottomText: { position: "absolute", bottom: 10, left: 10, right: 10 },
    title: { color: theme_1.colors.ivory, fontSize: 15, fontFamily: theme_1.fonts.display, lineHeight: 19 },
    locationRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
    location: { color: "rgba(255,255,255,0.7)", fontSize: 11 },
    footer: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    fromLabel: { fontSize: 10, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.charcoal, opacity: 0.5, textTransform: "uppercase", letterSpacing: 0.3 },
    price: { fontSize: 16, fontFamily: theme_1.fonts.display, color: theme_1.colors.charcoal, marginTop: 2 },
    perNight: { fontSize: 11, fontFamily: theme_1.fonts.body, opacity: 0.5 },
    budgetPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
    budgetText: { fontSize: 11, fontFamily: theme_1.fonts.bodySemiBold },
});
