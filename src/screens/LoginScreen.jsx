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
exports.default = LoginScreen;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const theme_1 = require("../theme/theme");
const Field_1 = __importDefault(require("../components/Field"));
const Icons_1 = require("../components/Icons");
function LoginScreen({ onSuccess, onRegister, onBack, }) {
    const [email, setEmail] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    const [errors, setErrors] = (0, react_1.useState)({});
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [showPw, setShowPw] = (0, react_1.useState)(false);
    const validate = () => {
        const e = {};
        if (!email.trim())
            e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email))
            e.email = "Enter a valid email address";
        if (!password)
            e.password = "Password is required";
        return e;
    };
    const submit = () => {
        const e = validate();
        if (Object.keys(e).length) {
            setErrors(e);
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onSuccess(email.split("@")[0]);
        }, 900);
    };
    return (<react_native_1.KeyboardAvoidingView style={styles.flex} behavior={react_native_1.Platform.OS === "ios" ? "padding" : undefined}>
      <react_native_1.View style={styles.container}>
        <react_native_safe_area_context_1.SafeAreaView edges={["top"]} style={styles.header}>
          <react_native_1.Pressable onPress={onBack} style={styles.backBtn}>
            <Icons_1.IconBack color={theme_1.colors.sand}/>
          </react_native_1.Pressable>
          <react_native_1.View style={styles.headerTextWrap}>
            <react_native_1.Text style={styles.brand}>All-in-one-planner</react_native_1.Text>
            <react_native_1.Text style={styles.title}>Welcome back</react_native_1.Text>
            <react_native_1.Text style={styles.subtitle}>Sign in to access your day plans</react_native_1.Text>
          </react_native_1.View>
        </react_native_safe_area_context_1.SafeAreaView>

        <react_native_1.View style={styles.curve}/>

        <react_native_1.ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
          <Field_1.default label="Email address" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" error={errors.email}/>

          <react_native_1.View style={{ gap: 6 }}>
            <react_native_1.Text style={styles.pwLabel}>Password</react_native_1.Text>
            <react_native_1.View style={styles.pwWrap}>
              <react_native_1.TextInput value={password} onChangeText={setPassword} placeholder="Your password" placeholderTextColor="rgba(62,50,38,0.35)" secureTextEntry={!showPw} onSubmitEditing={submit} style={[styles.pwInput, { borderColor: errors.password ? theme_1.colors.terra : "rgba(62,50,38,0.12)" }]}/>
              <react_native_1.Pressable onPress={() => setShowPw(!showPw)} style={styles.showBtn}>
                <react_native_1.Text style={styles.showBtnText}>{showPw ? "Hide" : "Show"}</react_native_1.Text>
              </react_native_1.Pressable>
            </react_native_1.View>
            {!!errors.password && <react_native_1.Text style={styles.errorText}>{errors.password}</react_native_1.Text>}
          </react_native_1.View>

          <react_native_1.Pressable style={styles.forgotWrap}>
            <react_native_1.Text style={styles.forgotText}>Forgot password?</react_native_1.Text>
          </react_native_1.Pressable>

          <react_native_1.Pressable onPress={submit} disabled={loading} style={[styles.submitBtn, loading && { opacity: 0.8 }]}>
            {loading ? <react_native_1.ActivityIndicator color={theme_1.colors.ivory}/> : <react_native_1.Text style={styles.submitText}>Sign in</react_native_1.Text>}
          </react_native_1.Pressable>

          <react_native_1.View style={styles.dividerRow}>
            <react_native_1.View style={styles.dividerLine}/>
            <react_native_1.Text style={styles.dividerText}>or</react_native_1.Text>
            <react_native_1.View style={styles.dividerLine}/>
          </react_native_1.View>

          <react_native_1.Pressable onPress={onRegister} style={styles.outlineBtn}>
            <react_native_1.Text style={styles.outlineBtnText}>Create a free account</react_native_1.Text>
          </react_native_1.Pressable>

          <react_native_1.Text style={styles.terms}>By signing in you agree to our Terms of Service & Privacy Policy</react_native_1.Text>
        </react_native_1.ScrollView>
      </react_native_1.View>
    </react_native_1.KeyboardAvoidingView>);
}
const styles = react_native_1.StyleSheet.create({
    flex: { flex: 1 },
    container: { flex: 1, backgroundColor: theme_1.colors.sand },
    header: { backgroundColor: theme_1.colors.savanna, paddingHorizontal: 20, paddingBottom: 32 },
    backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 8 },
    headerTextWrap: { alignItems: "center", paddingTop: 8 },
    brand: { fontSize: 10, fontFamily: theme_1.fonts.bodyBold, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,220,196,0.6)", marginBottom: 8 },
    title: { fontSize: 22, fontFamily: theme_1.fonts.display, color: theme_1.colors.ivory },
    subtitle: { fontSize: 13, color: "rgba(232,220,196,0.65)", marginTop: 4 },
    curve: { height: 24, marginTop: -12, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: theme_1.colors.sand },
    body: { flex: 1, paddingHorizontal: 24 },
    bodyContent: { gap: 16, paddingBottom: 32, maxWidth: 420, width: "100%", alignSelf: "center" },
    pwLabel: { fontSize: 11, fontFamily: theme_1.fonts.bodySemiBold, letterSpacing: 0.5, textTransform: "uppercase", color: theme_1.colors.charcoal, opacity: 0.6 },
    pwWrap: { position: "relative", justifyContent: "center" },
    pwInput: {
        width: "100%",
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingRight: 56,
        borderRadius: 12,
        fontSize: 14,
        fontFamily: theme_1.fonts.body,
        backgroundColor: theme_1.colors.ivory,
        color: theme_1.colors.charcoal,
        borderWidth: 1.5,
    },
    showBtn: { position: "absolute", right: 14 },
    showBtnText: { fontSize: 12, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.sky },
    errorText: { fontSize: 11, color: theme_1.colors.terra },
    forgotWrap: { alignItems: "flex-end" },
    forgotText: { fontSize: 12, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.sky },
    submitBtn: { paddingVertical: 16, borderRadius: 18, backgroundColor: theme_1.colors.terra, alignItems: "center", marginTop: 6 },
    submitText: { fontSize: 14, fontFamily: theme_1.fonts.bodyBold, color: theme_1.colors.ivory },
    dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(62,50,38,0.12)" },
    dividerText: { fontSize: 12, color: theme_1.colors.charcoal, opacity: 0.4 },
    outlineBtn: { paddingVertical: 14, borderRadius: 18, alignItems: "center", borderWidth: 1.5, borderColor: theme_1.colors.savanna },
    outlineBtnText: { fontSize: 14, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.savanna },
    terms: { textAlign: "center", fontSize: 11, color: theme_1.colors.charcoal, opacity: 0.4, marginTop: 4 },
});
