import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts } from "../theme/theme";
import Field from "../components/Field";
import { IconBack } from "../components/Icons";
import { cleanEmail } from "../utils/validation";
import BrandLogo from "../components/BrandLogo";

const ADMIN_EMAIL = 'allinoneplanner@gmail.com';
const ADMIN_PASSWORD = 'allinoneplanner@123';

export default function LoginScreen({
  onSuccess,
  onLogin,
  onVerifyOtp,
  onRegister,
  onForgot,
  onBack,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [challengeToken, setChallengeToken] = useState('');
  const [authStep, setAuthStep] = useState('password');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isAdminCredentials =
    email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;

  const validate = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      nextErrors.email = 'Enter a valid email address';
    }

    if (!password) {
      nextErrors.password = 'Password is required';
    }

    return nextErrors;
  };

  const submit = async () => {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await onLogin(email, password);
      setLoading(false);

      if (!result.ok) {
        setErrors(result.errors || {});
        return;
      }

      if (result.otpRequired) {
        setChallengeToken(result.challengeToken);
        setEmail(result.email || email);
        setOtp('');
        setAuthStep('otp');
        setErrors({});
        return;
      }

      onSuccess(result.userName);
    } catch (error) {
      setLoading(false);
      setErrors(error.errors || { form: 'Unable to sign in right now.' });
    }
  };

  const verifyOtp = async () => {
    const cleanOtp = otp.replace(/\D/g, '');
    if (!/^\d{6}$/.test(cleanOtp)) {
      setErrors({ otp: 'Enter the 6-digit code sent to your email.' });
      return;
    }

    setLoading(true);
    try {
      const result = await onVerifyOtp({
        email,
        challengeToken,
        otp: cleanOtp,
      });
      setLoading(false);

      if (!result.ok) {
        setErrors(result.errors || {});
        return;
      }

      onSuccess(result.userName);
    } catch (error) {
      setLoading(false);
      setErrors(
        error.errors || {
          form: 'Unable to verify your sign-in code right now.',
        }
      );
    }
  };

  const returnToPasswordStep = () => {
    setAuthStep('password');
    setChallengeToken('');
    setOtp('');
    setErrors({});
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.header}>
          <Pressable
            onPress={authStep === 'otp' ? returnToPasswordStep : onBack}
            style={styles.backBtn}
          >
            <IconBack color={colors.sand} />
          </Pressable>

          <View style={styles.headerTextWrap}>
            <BrandLogo dark compact />
            <Text style={styles.title}>
              {authStep === 'otp' ? 'Enter security code' : 'Welcome back'}
            </Text>
            <Text style={styles.subtitle}>
              {authStep === 'otp'
                ? 'Check your email for the 6-digit code'
                : 'Sign in to access your day plans'}
            </Text>
          </View>
        </SafeAreaView>

        <View style={styles.curve} />

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
        >
          {!!errors.form && <Text style={styles.formError}>{errors.form}</Text>}

          {authStep === 'password' ? (
            <>
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

              <View style={{ gap: 6 }}>
                <Text style={styles.pwLabel}>Password</Text>
                <View style={styles.pwWrap}>
                  <TextInput
                    value={password}
                    onChangeText={(value) => {
                      setPassword(value.slice(0, 128));
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    placeholder="Your password"
                    placeholderTextColor="rgba(62,50,38,0.35)"
                    secureTextEntry={!showPw}
                    onSubmitEditing={submit}
                    style={[
                      styles.pwInput,
                      {
                        borderColor: errors.password
                          ? colors.terra
                          : 'rgba(62,50,38,0.12)',
                      },
                    ]}
                  />
                  <Pressable
                    onPress={() => setShowPw((prev) => !prev)}
                    style={styles.showBtn}
                  >
                    <Text style={styles.showBtnText}>
                      {showPw ? 'Hide' : 'Show'}
                    </Text>
                  </Pressable>
                </View>
                {!!errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <Pressable onPress={onForgot} style={styles.forgotWrap}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>

              <Pressable
                onPress={submit}
                disabled={loading}
                style={[styles.submitBtn, loading && { opacity: 0.8 }]}
              >
                {loading ? (
                  <ActivityIndicator color={colors.ivory} />
                ) : (
                  <Text style={styles.submitText}>
                    {isAdminCredentials
                      ? 'Sign in as admin'
                      : 'Send security code'}
                  </Text>
                )}
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable onPress={onRegister} style={styles.outlineBtn}>
                <Text style={styles.outlineBtnText}>Create a free account</Text>
              </Pressable>
            </>
          ) : (
            <>
              <Text style={styles.otpMessage}>
                We sent a one-time code to {email}.
              </Text>
              <Field
                label="Security code"
                value={otp}
                onChangeText={(value) => {
                  setOtp(value.replace(/\D/g, '').slice(0, 6));
                  setErrors((prev) => ({ ...prev, otp: undefined }));
                }}
                placeholder="123456"
                keyboardType="number-pad"
                error={errors.otp}
              />

              <Pressable
                onPress={verifyOtp}
                disabled={loading}
                style={[styles.submitBtn, loading && { opacity: 0.8 }]}
              >
                {loading ? (
                  <ActivityIndicator color={colors.ivory} />
                ) : (
                  <Text style={styles.submitText}>Verify and sign in</Text>
                )}
              </Pressable>

              <Pressable
                onPress={submit}
                disabled={loading}
                style={styles.resendWrap}
              >
                <Text style={styles.forgotText}>Resend code</Text>
              </Pressable>
            </>
          )}

          <Text style={styles.terms}>
            By signing in you agree to our Terms of Service & Privacy Policy
          </Text>
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
  errorText: { fontSize: 11, color: colors.terra },
  formError: { fontSize: 12, lineHeight: 17, color: colors.terra, textAlign: "center", backgroundColor: "rgba(201,123,74,0.1)", borderRadius: 10, padding: 10 },
  otpMessage: { fontSize: 13, lineHeight: 19, color: colors.charcoal, opacity: 0.68, textAlign: "center" },
  forgotWrap: { alignItems: "flex-end" },
  resendWrap: { alignItems: "center", paddingVertical: 8 },
  forgotText: { fontSize: 12, fontFamily: fonts.bodySemiBold, color: colors.sky },
  submitBtn: { paddingVertical: 16, borderRadius: 18, backgroundColor: colors.terra, alignItems: "center", marginTop: 6 },
  submitText: { fontSize: 14, fontFamily: fonts.bodyBold, color: colors.ivory },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(62,50,38,0.12)" },
  dividerText: { fontSize: 12, color: colors.charcoal, opacity: 0.4 },
  outlineBtn: { paddingVertical: 14, borderRadius: 18, alignItems: "center", borderWidth: 1.5, borderColor: colors.savanna },
  outlineBtnText: { fontSize: 14, fontFamily: fonts.bodySemiBold, color: colors.savanna },
  terms: { textAlign: "center", fontSize: 11, color: colors.charcoal, opacity: 0.4, marginTop: 4 },
});
