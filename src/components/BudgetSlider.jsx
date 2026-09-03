"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BudgetSlider;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const slider_1 = __importDefault(require("@react-native-community/slider"));
const theme_1 = require("../theme/theme");
const MIN_BUDGET = 500;
const MAX_BUDGET = 8000;
function BudgetSlider({ value, onChange, label = "My Daily Budget", sublabel, }) {
    return (<react_native_1.View style={styles.wrap}>
      <react_native_1.View style={styles.headerRow}>
        <react_native_1.View style={{ flex: 1 }}>
          <react_native_1.Text style={styles.label}>{label}</react_native_1.Text>
          {!!sublabel && <react_native_1.Text style={styles.sublabel}>{sublabel}</react_native_1.Text>}
        </react_native_1.View>
        <react_native_1.View style={{ alignItems: "flex-end" }}>
          <react_native_1.Text style={styles.value}>R{value.toLocaleString("en-ZA")}</react_native_1.Text>
          <react_native_1.Text style={styles.unit}>per night</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>
      <slider_1.default style={styles.slider} minimumValue={MIN_BUDGET} maximumValue={MAX_BUDGET} step={50} value={value} onValueChange={onChange} minimumTrackTintColor={theme_1.colors.terra} maximumTrackTintColor={theme_1.colors.sand} thumbTintColor={theme_1.colors.terra}/>
      <react_native_1.View style={styles.rangeRow}>
        <react_native_1.Text style={styles.rangeText}>R500</react_native_1.Text>
        <react_native_1.Text style={styles.rangeText}>R8,000</react_native_1.Text>
      </react_native_1.View>
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    wrap: {
        borderRadius: 16,
        padding: 16,
        backgroundColor: theme_1.colors.ivory,
        shadowColor: theme_1.colors.charcoal,
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    headerRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    label: { fontSize: 12, fontFamily: theme_1.fonts.bodySemiBold, letterSpacing: 0.3, textTransform: "uppercase", color: theme_1.colors.terra },
    sublabel: { fontSize: 11, color: theme_1.colors.charcoal, opacity: 0.6, marginTop: 2 },
    value: { fontSize: 22, fontFamily: theme_1.fonts.display, color: theme_1.colors.charcoal },
    unit: { fontSize: 10, color: theme_1.colors.charcoal, opacity: 0.5 },
    slider: { width: "100%", height: 36 },
    rangeRow: { flexDirection: "row", justifyContent: "space-between", marginTop: -4 },
    rangeText: { fontSize: 10, color: theme_1.colors.charcoal, opacity: 0.4 },
});
