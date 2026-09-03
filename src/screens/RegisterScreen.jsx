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
exports.default = RegisterScreen;
const react_1 = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_safe_area_context_1 = require("react-native-safe-area-context");
const theme_1 = require("../theme/theme");
const Field_1 = __importDefault(require("../components/Field"));
const Icons_1 = require("../components/Icons");
function RegisterScreen({ onSuccess, onLogin, onBack, }) {
    const [firstName, setFirstName] = (0, react_1.useState)("");
    const [lastName, setLastName] = (0, react_1.useState)("");
    const [email, setEmail] = (0, react_1.useState)("");
    const [nationality, setNationality] = (0, react_1.useState)("");
    const [password, setPassword] = (0, react_1.useState)("");
    const [confirm, setConfirm] = (0, react_1.useState)("");
    const [errors, setErrors] = (0, react_1.useState)({});
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [showPw, setShowPw] = (0, react_1.useState)(false);
    const [agreed, setAgreed] = (0, react_1.useState)(false);
    const [step, setStep] = (0, react_1.useState)(1);
    const validateStep1 = () => {
        const e = {};
        if (!firstName.trim())
            e.firstName = "First name is required";
        if (!lastName.trim())
            e.lastName = "Last name is required";
        if (!email.trim())
            e.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(email))
            e.email = "Enter a valid email address";
        return e;
    };
    const validateStep2 = () => {
        const e = {};
        if (!password)
            e.password = "Password is required";
        else if (password.length < 8)
            e.password = "Password must be at least 8 characters";
        if (!confirm)
            e.confirm = "Please confirm your password";
        else if (confirm !== password)
            e.confirm = "Passwords do not match";
        if (!agreed)
            e.agreed = "Please accept the terms to continue";
        return e;
    };
    const nextStep = () => {
        const e = validateStep1();
        if (Object.keys(e).length) {
            setErrors(e);
            return;
        }
        setErrors({});
        setStep(2);
    };
    const submit = () => {
        const e = validateStep2();
        if (Object.keys(e).length) {
            setErrors(e);
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            onSuccess(firstName);
        }, 1100);
    };
    const strengthColor = (i) => {
        if (password.length < [8, 10, 12][i])
            return "rgba(62,50,38,0.12)";
        return [theme_1.colors.mustard, theme_1.colors.sky, theme_1.colors.savanna][i];
    };
    const strengthLabel = password.length === 0 ? "" : password.length < 8 ? "Too short" : password.length < 10 ? "Fair" : password.length < 12 ? "Good" : "Strong";
    return (<react_native_1.KeyboardAvoidingView style={styles.flex} behavior={react_native_1.Platform.OS === "ios" ? "padding" : undefined}>
      <react_native_1.View style={styles.container}>
        <react_native_safe_area_context_1.SafeAreaView edges={["top"]} style={styles.header}>
          <react_native_1.Pressable onPress={step === 2 ? () => { setStep(1); setErrors({}); } : onBack} style={styles.backBtn}>
            <Icons_1.IconBack color={theme_1.colors.sand}/>
          </react_native_1.Pressable>
          <react_native_1.View style={styles.headerTextWrap}>
            <react_native_1.Text style={styles.brand}>All-in-one-planner</react_native_1.Text>
            <react_native_1.Text style={styles.title}>{step === 1 ? "Create account" : "Secure your account"}</react_native_1.Text>
            <react_native_1.Text style={styles.subtitle}>
              {step === 1 ? "Free forever — no credit card needed" : "Set a strong password to protect your plans"}
            </react_native_1.Text>
          </react_native_1.View>
          <react_native_1.View style={styles.stepRow}>
            <react_native_1.View style={styles.stepItem}>
              <react_native_1.View style={[styles.stepDot, { backgroundColor: theme_1.colors.terra }]}>
                <react_native_1.Text style={styles.stepDotText}>1</react_native_1.Text>
              </react_native_1.View>
              <react_native_1.Text style={styles.stepLabel}>Your info</react_native_1.Text>
            </react_native_1.View>
            <react_native_1.View style={styles.stepLine}/>
            <react_native_1.View style={styles.stepItem}>
              <react_native_1.View style={[styles.stepDot, { backgroundColor: step === 2 ? theme_1.colors.terra : "rgba(232,220,196,0.2)" }]}>
                <react_native_1.Text style={[styles.stepDotText, { color: step === 2 ? theme_1.colors.ivory : "rgba(232,220,196,0.5)" }]}>2</react_native_1.Text>
              </react_native_1.View>
              <react_native_1.Text style={[styles.stepLabel, { color: step === 2 ? "rgba(232,220,196,0.9)" : "rgba(232,220,196,0.4)" }]}>Password</react_native_1.Text>
            </react_native_1.View>
          </react_native_1.View>
        </react_native_safe_area_context_1.SafeAreaView>

        <react_native_1.View style={styles.curve}/>

        <react_native_1.ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
          {step === 1 ? (<>
              <react_native_1.View style={styles.row2}>
                <react_native_1.View style={{ flex: 1 }}>
                  <Field_1.default label="First name" value={firstName} onChangeText={setFirstName} placeholder="Sipho" error={errors.firstName}/>
                </react_native_1.View>
                <react_native_1.View style={{ flex: 1 }}>
                  <Field_1.default label="Last name" value={lastName} onChangeText={setLastName} placeholder="Dlamini" error={errors.lastName}/>
                </react_native_1.View>
              </react_native_1.View>
              <Field_1.default label="Email address" value={email} onChangeText={setEmail} placeholder="sipho@example.com" keyboardType="email-address" autoCapitalize="none" error={errors.email}/>
              <Field_1.default label="Nationality (optional)" value={nationality} onChangeText={setNationality} placeholder="e.g. South African, British…"/>

              <react_native_1.Pressable onPress={nextStep} style={styles.submitBtn}>
                <react_native_1.Text style={styles.submitText}>Continue →</react_native_1.Text>
              </react_native_1.Pressable>

              <react_native_1.View style={styles.dividerRow}>
                <react_native_1.View style={styles.dividerLine}/>
                <react_native_1.Text style={styles.dividerText}>or</react_native_1.Text>
                <react_native_1.View style={styles.dividerLine}/>
              </react_native_1.View>

              <react_native_1.Pressable onPress={onLogin} style={styles.outlineBtn}>
                <react_native_1.Text style={styles.outlineBtnText}>Already have an account? Sign in</react_native_1.Text>
              </react_native_1.Pressable>
            </>) : (<>
              <react_native_1.View style={{ gap: 6 }}>
                <react_native_1.Text style={styles.pwLabel}>Password</react_native_1.Text>
                <react_native_1.View style={styles.pwWrap}>
                  <react_native_1.TextInput value={password} onChangeText={setPassword} placeholder="Min. 8 characters" placeholderTextColor="rgba(62,50,38,0.35)" secureTextEntry={!showPw} style={[styles.pwInput, { borderColor: errors.password ? theme_1.colors.terra : "rgba(62,50,38,0.12)" }]}/>
                  <react_native_1.Pressable onPress={() => setShowPw(!showPw)} style={styles.showBtn}>
                    <react_native_1.Text style={styles.showBtnText}>{showPw ? "Hide" : "Show"}</react_native_1.Text>
                  </react_native_1.Pressable>
                </react_native_1.View>
                {password.length > 0 && (<react_native_1.View style={styles.strengthRow}>
                    {[0, 1, 2].map((i) => (<react_native_1.View key={i} style={[styles.strengthBar, { backgroundColor: strengthColor(i) }]}/>))}
                    <react_native_1.Text style={styles.strengthLabel}>{strengthLabel}</react_native_1.Text>
                  </react_native_1.View>)}
                {!!errors.password && <react_native_1.Text style={styles.errorText}>{errors.password}</react_native_1.Text>}
              </react_native_1.View>

              <Field_1.default label="Confirm password" value={confirm} onChangeText={setConfirm} placeholder="Repeat password" secureTextEntry={!showPw} error={errors.confirm}/>

              <react_native_1.Pressable onPress={() => setAgreed(!agreed)} style={[
                styles.termsBox,
                { backgroundColor: agreed ? "rgba(58,90,64,0.07)" : theme_1.colors.ivory, borderColor: errors.agreed ? theme_1.colors.terra : "rgba(62,50,38,0.1)" },
            ]}>
                <react_native_1.View style={[styles.checkbox, agreed ? { backgroundColor: theme_1.colors.savanna, borderWidth: 0 } : { borderWidth: 1.5, borderColor: "rgba(62,50,38,0.3)" }]}>
                  {agreed && <Icons_1.IconCheck color={theme_1.colors.ivory}/>}
                </react_native_1.View>
                <react_native_1.Text style={styles.termsText}>
                  I agree to the <react_native_1.Text style={styles.termsLink}>Terms of Service</react_native_1.Text> and <react_native_1.Text style={styles.termsLink}>Privacy Policy</react_native_1.Text>. My data will never be sold.
                </react_native_1.Text>
              </react_native_1.Pressable>
              {!!errors.agreed && <react_native_1.Text style={styles.errorText}>{errors.agreed}</react_native_1.Text>}

              <react_native_1.Pressable onPress={submit} disabled={loading} style={[styles.submitBtn, loading && { opacity: 0.8 }]}>
                {loading ? <react_native_1.ActivityIndicator color={theme_1.colors.ivory}/> : <react_native_1.Text style={styles.submitText}>Create my account →</react_native_1.Text>}
              </react_native_1.Pressable>

              <react_native_1.Text style={styles.terms}>Your plans are private and only visible to you</react_native_1.Text>
            </>)}
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
    title: { fontSize: 22, fontFamily: theme_1.fonts.display, color: theme_1.colors.ivory, textAlign: "center" },
    subtitle: { fontSize: 13, color: "rgba(232,220,196,0.65)", marginTop: 4, textAlign: "center" },
    stepRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 },
    stepItem: { flexDirection: "row", alignItems: "center", gap: 6 },
    stepDot: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    stepDotText: { fontSize: 11, fontFamily: theme_1.fonts.bodyBold, color: theme_1.colors.ivory },
    stepLabel: { fontSize: 10, fontFamily: theme_1.fonts.bodySemiBold, color: "rgba(232,220,196,0.8)" },
    stepLine: { width: 24, height: 1, backgroundColor: "rgba(232,220,196,0.3)" },
    curve: { height: 24, marginTop: -12, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: theme_1.colors.sand },
    body: { flex: 1, paddingHorizontal: 24 },
    bodyContent: { gap: 16, paddingBottom: 32, maxWidth: 420, width: "100%", alignSelf: "center" },
    row2: { flexDirection: "row", gap: 12 },
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
    strengthRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
    strengthBar: { flex: 1, height: 4, borderRadius: 2 },
    strengthLabel: { fontSize: 10, color: theme_1.colors.charcoal, opacity: 0.5, marginLeft: 4 },
    errorText: { fontSize: 11, color: theme_1.colors.terra },
    termsBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, padding: 12, borderWidth: 1.5 },
    checkbox: { width: 20, height: 20, borderRadius: 6, alignItems: "center", justifyContent: "center", marginTop: 1 },
    termsText: { fontSize: 12, lineHeight: 17, color: theme_1.colors.charcoal, opacity: 0.7, flex: 1 },
    termsLink: { textDecorationLine: "underline", color: theme_1.colors.savanna },
    submitBtn: { paddingVertical: 16, borderRadius: 18, backgroundColor: theme_1.colors.terra, alignItems: "center", marginTop: 6 },
    submitText: { fontSize: 14, fontFamily: theme_1.fonts.bodyBold, color: theme_1.colors.ivory },
    dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(62,50,38,0.12)" },
    dividerText: { fontSize: 12, color: theme_1.colors.charcoal, opacity: 0.4 },
    outlineBtn: { paddingVertical: 14, borderRadius: 18, alignItems: "center", borderWidth: 1.5, borderColor: theme_1.colors.savanna },
    outlineBtnText: { fontSize: 14, fontFamily: theme_1.fonts.bodySemiBold, color: theme_1.colors.savanna },
    terms: { textAlign: "center", fontSize: 11, color: theme_1.colors.charcoal, opacity: 0.4, marginTop: 4 },
});
