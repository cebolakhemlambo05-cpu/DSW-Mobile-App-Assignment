"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = LandingScreen;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const expo_linear_gradient_1 = require("expo-linear-gradient");
const theme_1 = require("../theme/theme");
const Icons_1 = require("../components/Icons");
const FEATURES = [
    { icon: "💰", text: "Budget slider filters out what you can't afford" },
    { icon: "📍", text: "Distance shown to attraction gate, not city centre" },
    { icon: "💎", text: "Hidden gems rated by South African locals" },
    { icon: "👥", text: "Group cost split in one tap" },
];
function LandingScreen({ onMode }) {
    return (<react_native_1.View style={styles.container}>
      <react_native_1.Image source={{ uri: "https://images.unsplash.com/photo-1760715752598-eac7633b472d?w=900&h=700&fit=crop&auto=format" }} style={react_native_1.StyleSheet.absoluteFill}/>
      <expo_linear_gradient_1.LinearGradient colors={["rgba(58,90,64,0.72)", "rgba(58,90,64,0.20)", "rgba(62,50,38,0.85)"]} locations={[0, 0.42, 1]} style={react_native_1.StyleSheet.absoluteFill}/>
      <react_native_safe_area_context_1.SafeAreaView style={styles.safe}>
        <react_native_1.ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <react_native_1.View style={styles.brandRow}>
            <react_native_1.View style={styles.brandIcon}>
              <Icons_1.IconHome />
            </react_native_1.View>
            <react_native_1.Text style={styles.brandLabel}>ALL-IN-ONE-PLANNER</react_native_1.Text>
          </react_native_1.View>

          <react_native_1.Text style={styles.headline}>
            Plan South Africa.{"\n"}
            <react_native_1.Text style={{ color: theme_1.colors.sand }}>Prices first,{"\n"}surprises never.</react_native_1.Text>
          </react_native_1.Text>
          <react_native_1.Text style={styles.subhead}>
            Budget-first travel planning — attractions, stays, and activities, all in one place. See every rand before you book.
          </react_native_1.Text>

          <react_native_1.View style={styles.features}>
            {FEATURES.map(({ icon, text }) => (<react_native_1.View key={text} style={styles.featurePill}>
                <react_native_1.Text style={styles.featureIcon}>{icon}</react_native_1.Text>
                <react_native_1.Text style={styles.featureText}>{text}</react_native_1.Text>
              </react_native_1.View>))}
          </react_native_1.View>
        </react_native_1.ScrollView>

        <react_native_1.View style={styles.ctaWrap}>
          <react_native_1.Pressable onPress={() => onMode("register")} style={styles.primaryBtn}>
            <react_native_1.Text style={styles.primaryBtnText}>Create a free account</react_native_1.Text>
          </react_native_1.Pressable>
          <react_native_1.Pressable onPress={() => onMode("login")} style={styles.secondaryBtn}>
            <react_native_1.Text style={styles.secondaryBtnText}>Sign in</react_native_1.Text>
          </react_native_1.Pressable>
          <react_native_1.Text style={styles.footerNote}>South Africa travel planning · Free forever</react_native_1.Text>
        </react_native_1.View>
      </react_native_safe_area_context_1.SafeAreaView>
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    container: { flex: 1, backgroundColor: theme_1.colors.savanna },
    safe: { flex: 1, justifyContent: "space-between" },
    scrollContent: { paddingHorizontal: 24, paddingTop: 12, flexGrow: 1, justifyContent: "center" },
    brandRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
    brandIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: theme_1.colors.terra, alignItems: "center", justifyContent: "center" },
    brandLabel: { fontSize: 11, fontFamily: theme_1.fonts.bodyBold, letterSpacing: 2, textTransform: "uppercase", color: theme_1.colors.sand },
    headline: { fontSize: 34, fontFamily: theme_1.fonts.display, color: "#fff", lineHeight: 40 },
    subhead: { marginTop: 16, fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 20, maxWidth: 300 },
    features: { marginTop: 28, gap: 8 },
    featurePill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        backgroundColor: "rgba(250,246,239,0.12)",
    },
    featureIcon: { fontSize: 16 },
    featureText: { fontSize: 12, color: "rgba(255,255,255,0.85)", fontFamily: theme_1.fonts.bodyMedium, flex: 1 },
    ctaWrap: { paddingHorizontal: 24, paddingBottom: 24, paddingTop: 16, gap: 12 },
    primaryBtn: { paddingVertical: 16, borderRadius: 18, backgroundColor: theme_1.colors.terra, alignItems: "center" },
    primaryBtnText: { color: theme_1.colors.ivory, fontSize: 14, fontFamily: theme_1.fonts.bodyBold },
    secondaryBtn: {
        paddingVertical: 14,
        borderRadius: 18,
        alignItems: "center",
        backgroundColor: "rgba(250,246,239,0.15)",
        borderWidth: 1.5,
        borderColor: "rgba(250,246,239,0.35)",
    },
    secondaryBtnText: { color: theme_1.colors.ivory, fontSize: 14, fontFamily: theme_1.fonts.bodySemiBold },
    footerNote: { textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 4 },
});
