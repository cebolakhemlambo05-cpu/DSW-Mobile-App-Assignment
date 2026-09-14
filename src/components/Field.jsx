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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Field;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const theme_1 = require("../theme/theme");
function Field({ label, value, onChangeText, placeholder, error, secureTextEntry, keyboardType, autoCapitalize = "sentences", onSubmitEditing, }) {
    const [focused, setFocused] = (0, react_1.useState)(false);
    return (<react_native_1.View style={styles.wrap}>
      <react_native_1.Text style={styles.label}>{label}</react_native_1.Text>
      <react_native_1.TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="rgba(62,50,38,0.35)" secureTextEntry={secureTextEntry} keyboardType={keyboardType} autoCapitalize={autoCapitalize} onSubmitEditing={onSubmitEditing} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={[
            styles.input,
            { borderColor: error ? theme_1.colors.terra : focused ? theme_1.colors.savanna : "rgba(62,50,38,0.12)" },
        ]}/>
      {!!error && <react_native_1.Text style={styles.error}>{error}</react_native_1.Text>}
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    wrap: { gap: 6 },
    label: {
        fontSize: 11,
        fontFamily: theme_1.fonts.bodySemiBold,
        letterSpacing: 0.5,
        textTransform: "uppercase",
        color: theme_1.colors.charcoal,
        opacity: 0.6,
    },
    input: {
        width: "100%",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        fontSize: 14,
        fontFamily: theme_1.fonts.body,
        backgroundColor: theme_1.colors.ivory,
        color: theme_1.colors.charcoal,
        borderWidth: 1.5,
    },
    error: {
        fontSize: 11,
        color: theme_1.colors.terra,
        fontFamily: theme_1.fonts.body,
    },
});
