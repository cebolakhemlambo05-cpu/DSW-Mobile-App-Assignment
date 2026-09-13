"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Badge;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
const PALETTE = {
    sky: { bg: "rgba(122,158,159,0.15)", border: "rgba(122,158,159,0.3)", text: "#3a7a7b" },
    mustard: { bg: "rgba(212,162,76,0.15)", border: "rgba(212,162,76,0.3)", text: "#9a6e1a" },
    green: { bg: "rgba(58,90,64,0.1)", border: "rgba(58,90,64,0.25)", text: "#3A5A40" },
    terra: { bg: "rgba(201,123,74,0.15)", border: "rgba(201,123,74,0.3)", text: "#8a4a1a" },
};
function Badge({ children, color, icon, }) {
    const p = PALETTE[color];
    return (<react_native_1.View style={[styles.badge, { backgroundColor: p.bg, borderColor: p.border }]}>
      {icon}
      <react_native_1.Text style={[styles.text, { color: p.text }]}>{children}</react_native_1.Text>
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 999,
        borderWidth: 1,
    },
    text: {
        fontSize: 10,
        fontFamily: theme_1.fonts.bodyBold,
        letterSpacing: 0.3,
    },
});
