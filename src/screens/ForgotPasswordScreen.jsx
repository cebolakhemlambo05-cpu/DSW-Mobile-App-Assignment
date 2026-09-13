import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/theme";
import Field from "../components/Field";
import { IconBack, IconCheck } from "../components/Icons";
import { cleanEmail } from "../utils/validation";

export default function ForgotPasswordScreen({ initialEmail = "", resetToken = "", onRequestReset, onResetPassword, onBack, onLogin }) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isResetLink = Boolean(resetToken);

  const validateEmailRequest = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = "Enter a valid email address";
    }

    return nextErrors;
  };

  const validatePasswordReset = () => {
    const nextErrors = validateEmailRequest();

    if (!password) {
      nextErrors.password = "New password is required";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password)) {
      nextErrors.password = "Use 8+ characters with upper/lowercase, a number, and a symbol";
    }

    if (!confirm) {
      nextErrors.confirm = "Please confirm the new password";
    } else if (confirm !== password) {
      nextErrors.confirm = "Passwords do not match";
    }

    return nextErrors;
  };

  const handleRequestLink = async () => {
    const nextErrors = validateEmailRequest();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await onRequestReset(email);
      setLoading(false);
      if (!result.ok) {
        setErrors(result.errors || {});
        return;
      }
      setSubmitted(true);
      setErrors({});
    } catch (error) {
      setLoading(false);
      setErrors(error.errors || { form: "Unable to send your reset link right now." });
    }
  };

  const handleResetPassword = async () => {
    const nextErrors = validatePasswordReset();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await onResetPassword(email, password, resetToken);
      setLoading(false);
      if (!result.ok) {
        setErrors(result.errors || {});
        return;
      }
      setSubmitted(true);
      setErrors({});
    } catch (error) {
      setLoading(false);
      setErrors(error.errors || { form: "Unable to reset your password right now." });
    }
  };

  const strengthLabel = password.length === 0 ? "" : password.length < 8 ? "Too short" : password.length < 10 ? "Fair" : password.length < 12 ? "Good" : "Strong";

  const strengthColor = (i) => {
    if (password.length < [8, 10, 12][i]) return "rgba(62,50,38,0.12)";
    return [colors.mustard, colors.sky, colors.savanna][i];
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={styles.container}>
        <SafeAreaView edges={["top"]} style={styles.header}>
          <Pressable onPress={onBack} style={styles.backBtn}>
            <IconBack color={colors.sand} />
          </Pressable>

          <View style={styles.headerTextWrap}>
            <Text style={styles.brand}>ALL-IN-ONE-PLANNER</Text>
            <Text style={styles.title}>{isResetLink ? "Create new password" : "Reset password"}</Text>
            <Text style={styles.subtitle}>
              {isResetLink ? "Set a stronger password to secure your account" : "Enter your email and we will send a reset link"}
            </Text>
          </View>
        </SafeAreaView>

        <View style={styles.curve} />

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
          {submitted ? (
            <View style={styles.successCard}>
              <View style={styles.successIconWrap}>
                <IconCheck color={colors.ivory} size={22} />
              </View>
              <Text style={styles.successTitle}>{isResetLink ? "Password updated" : "Check your email"}</Text>
              <Text style={styles.successText}>
                {isResetLink
                  ? "Your password has been reset successfully. You can sign in with your new credentials."
                  : "We sent a password reset link to your email address. Open it to create a new password."}
              </Text>
              <Pressable onPress={onLogin} style={styles.submitBtn}>
                <Text style={styles.submitText}>Back to sign in</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {!!errors.form && <Text style={styles.formError}>{errors.form}</Text>}
              <Field
                label="Email address"
                value={email}
                onChangeText={(value) => {
                  setEmail(cleanEmail(value));
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              {isResetLink && (
                <>
                  <View style={{ gap: 6 }}>
                    <Text style={styles.pwLabel}>New password</Text>
                    <View style={styles.pwWrap}>
                      <TextInput
                        value={password}
                        onChangeText={(value) => {
                          setPassword(value.slice(0, 128));
                          setErrors((prev) => ({ ...prev, password: undefined }));
                        }}
                        placeholder="Min. 8 characters"
                        placeholderTextColor="rgba(62,50,38,0.35)"
                        secureTextEntry={!showPw}
                        style={[styles.pwInput, { borderColor: errors.password ? colors.terra : "rgba(62,50,38,0.12)" }]}
                      />
                      <Pressable onPress={() => setShowPw((prev) => !prev)} style={styles.showBtn}>
                        <Text style={styles.showBtnText}>{showPw ? "Hide" : "Show"}</Text>
                      </Pressable>
                    </View>
                    {password.length > 0 && (
                      <View style={styles.strengthRow}>
                        {[0, 1, 2].map((i) => (
                          <View key={i} style={[styles.strengthBar, { backgroundColor: strengthColor(i) }]} />
                        ))}
                        <Text style={styles.strengthLabel}>{strengthLabel}</Text>
                      </View>
                    )}
                    {!!errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                  </View>

                  <Field
                    label="Confirm new password"
                    value={confirm}
                    onChangeText={(value) => {
                      setConfirm(value.slice(0, 128));
                      setErrors((prev) => ({ ...prev, confirm: undefined }));
                    }}
                    placeholder="Repeat password"
                    secureTextEntry={!showPw}
                    error={errors.confirm}
                  />
                </>
              )}

              <Pressable
                onPress={isResetLink ? handleResetPassword : handleRequestLink}
                disabled={loading}
                style={[styles.submitBtn, loading && { opacity: 0.8 }]}
              >
                {loading ? <ActivityIndicator color={colors.ivory} /> : <Text style={styles.submitText}>{isResetLink ? "Update password" : "Send reset link"}</Text>}
              </Pressable>
            </>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.sand },
  header: { backgroundColor: colors.savanna, paddingHorizontal: 20, paddingBottom: 32 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  headerTextWrap: { alignItems: "center", paddingTop: 8 },
  brand: { fontSize: 10, fontFamily: fonts.bodyBold, letterSpacing: 2, textTransform: "uppercase", color: "rgba(232,220,196,0.6)", marginBottom: 8 },
  title: { fontSize: 22, fontFamily: fonts.display, color: colors.ivory },
  subtitle: { fontSize: 13, color: "rgba(232,220,196,0.65)", marginTop: 4 },
  curve: { height: 24, marginTop: -12, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: colors.sand },
  body: { flex: 1, paddingHorizontal: 24 },
  bodyContent: { gap: 16, paddingBottom: 32, maxWidth: 420, width: "100%", alignSelf: "center" },
  successCard: { alignItems: "center", backgroundColor: colors.ivory, borderRadius: 18, padding: 24, marginTop: 24 },
  successIconWrap: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.savanna, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  successTitle: { fontSize: 22, fontFamily: fonts.display, color: colors.charcoal, marginBottom: 8 },
  successText: { fontSize: 14, color: "rgba(62,50,38,0.7)", textAlign: "center", lineHeight: 21 },
  pwLabel: { fontSize: 11, fontFamily: fonts.bodySemiBold, letterSpacing: 0.5, textTransform: "uppercase", color: colors.charcoal, opacity: 0.6 },
  pwWrap: { position: "relative", justifyContent: "center" },
  pwInput: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 56,
    borderRadius: 12,
    fontSize: 14,
    fontFamily: fonts.body,
    backgroundColor: colors.ivory,
    color: colors.charcoal,
    borderWidth: 1.5,
  },
  showBtn: { position: "absolute", right: 14 },
  showBtnText: { fontSize: 12, fontFamily: fonts.bodySemiBold, color: colors.sky },
  strengthRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 10, color: colors.charcoal, opacity: 0.5, marginLeft: 4 },
  errorText: { fontSize: 11, color: colors.terra },
  formError: { fontSize: 12, lineHeight: 17, color: colors.terra, textAlign: "center", backgroundColor: "rgba(201,123,74,0.1)", borderRadius: 10, padding: 10 },
  submitBtn: { paddingVertical: 16, borderRadius: 18, backgroundColor: colors.terra, alignItems: "center", marginTop: 6 },
  submitText: { fontSize: 14, fontFamily: fonts.bodyBold, color: colors.ivory },
});
