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
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors, fonts } from "../theme/theme";
import Field from "../components/Field";
import { IconBack, IconCheck } from "../components/Icons";
import { cleanEmail, cleanName } from "../utils/validation";
import BrandLogo from "../components/BrandLogo";

const NATIONALITY_OPTIONS = [
  "South Africa",
  "United Kingdom",
  "United States",
  "Kenya",
  "Botswana",
  "Namibia",
  "Nigeria",
  "Zimbabwe",
  "Germany",
  "Canada",
  "Australia",
  "India",
  "United Arab Emirates",
  "France",
  "Other",
];

function SelectField({ label, value, onChangeText, options, placeholder, error }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.selectWrap}>
      <Text style={styles.selectLabel}>{label}</Text>
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        style={[styles.selectBox, { borderColor: error ? colors.terra : open ? colors.savanna : "rgba(62,50,38,0.12)" }]}
      >
        <Text style={[styles.selectText, { color: value ? colors.charcoal : "rgba(62,50,38,0.45)" }]}>
          {value || placeholder}
        </Text>
        <Text style={styles.dropdownCaret}>{open ? "▴" : "▾"}</Text>
      </Pressable>

      {open && (
        <View style={styles.dropdownList}>
          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                onChangeText(option);
                setOpen(false);
              }}
              style={[styles.dropdownItem, value === option && { backgroundColor: "rgba(58,90,64,0.08)" }]}
            >
              <Text style={styles.dropdownText}>{option}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

export default function RegisterScreen({
  onSuccess,
  onCreateAccount,
  onVerifyOtp,
  onLogin,
  onBack,
}) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [nationality, setNationality] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState('');
  const [challengeToken, setChallengeToken] = useState('');

  const redirectExistingAccountToLogin = () => {
    const message =
      'An account with this email already exists. Please try to log in.';
    setErrors({ form: message });

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.alert(message);
      onLogin();
      return;
    }

    Alert.alert('Account already exists', message, [
      { text: 'Go to login', onPress: onLogin },
    ]);
  };

  const isExistingAccountError = (nextErrors = {}) =>
    typeof nextErrors.email === 'string' &&
    nextErrors.email.toLowerCase().includes('already exists');

  const validateStep1 = () => {
    const nextErrors = {};

    if (!firstName.trim()) nextErrors.firstName = 'First name is required';
    if (!lastName.trim()) nextErrors.lastName = 'Last name is required';
    if (!email.trim()) nextErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email))
      nextErrors.email = 'Enter a valid email address';
    if (!nationality.trim())
      nextErrors.nationality = 'Please select your nationality';

    return nextErrors;
  };

  const validateStep2 = () => {
    const nextErrors = {};

    if (!password) {
      nextErrors.password = 'Password is required';
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(password)
    ) {
      nextErrors.password =
        'Use 8+ characters with upper/lowercase, a number, and a symbol';
    }

    if (!confirm) nextErrors.confirm = 'Please confirm your password';
    else if (confirm !== password)
      nextErrors.confirm = 'Passwords do not match';

    if (!agreed) nextErrors.agreed = 'Please accept the terms to continue';

    return nextErrors;
  };

  const nextStep = () => {
    const nextErrors = validateStep1();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setStep(2);
  };

  const submit = async () => {
    const nextErrors = validateStep2();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await onCreateAccount({
        firstName,
        lastName,
        email,
        nationality,
        password,
      });
      setLoading(false);

      if (!result.ok) {
        const resultErrors = result.errors || {};
        if (isExistingAccountError(resultErrors)) {
          setErrors({});
          redirectExistingAccountToLogin();
          return;
        }

        setErrors(resultErrors);
        return;
      }

      if (result.otpRequired) {
        setChallengeToken(result.challengeToken);
        setEmail(result.email || email);
        setOtp('');
        setErrors({});
        setStep(3);
        return;
      }

      onSuccess(result.userName);
    } catch (error) {
      setLoading(false);
      const resultErrors = error.errors || {
        form: 'Unable to create your account right now.',
      };
      if (isExistingAccountError(resultErrors)) {
        setErrors({});
        redirectExistingAccountToLogin();
        return;
      }

      setErrors(resultErrors);
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
          form: 'Unable to verify your registration code right now.',
        }
      );
    }
  };

  const strengthLabel =
    password.length === 0
      ? ''
      : password.length < 8
        ? 'Too short'
        : password.length < 10
          ? 'Fair'
          : password.length < 12
            ? 'Good'
            : 'Strong';

  const strengthColor = (index) => {
    if (password.length < [8, 10, 12][index]) return 'rgba(62,50,38,0.12)';
    return [colors.mustard, colors.sky, colors.savanna][index];
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.container}>
        <SafeAreaView edges={['top']} style={styles.header}>
          <Pressable
            onPress={
              step === 3
                ? () => {
                    setStep(2);
                    setErrors({});
                  }
                : step === 2
                ? () => {
                    setStep(1);
                    setErrors({});
                  }
                : onBack
            }
            style={styles.backBtn}
          >
            <IconBack color={colors.sand} />
          </Pressable>

          <View style={styles.headerTextWrap}>
            <BrandLogo dark compact />
            <Text style={styles.title}>
              {step === 1
                ? 'Create account'
                : step === 2
                  ? 'Secure your account'
                  : 'Verify your email'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 1
                ? 'Free forever — no credit card needed'
                : step === 2
                  ? 'Set a strong password to protect your plans'
                  : 'Enter the 6-digit code sent to your email'}
            </Text>
          </View>

          <View style={styles.stepRow}>
            <View style={styles.stepItem}>
              <View style={[styles.stepDot, { backgroundColor: colors.terra }]}>
                <Text style={styles.stepDotText}>1</Text>
              </View>
              <Text style={styles.stepLabel}>Your info</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor:
                      step === 2 ? colors.terra : 'rgba(232,220,196,0.2)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.stepDotText,
                    {
                      color:
                        step === 2 ? colors.ivory : 'rgba(232,220,196,0.5)',
                    },
                  ]}
                >
                  2
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color:
                      step === 2
                        ? 'rgba(232,220,196,0.9)'
                        : 'rgba(232,220,196,0.4)',
                  },
                ]}
              >
                Password
              </Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  {
                    backgroundColor:
                      step === 3 ? colors.terra : 'rgba(232,220,196,0.2)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.stepDotText,
                    {
                      color:
                        step === 3 ? colors.ivory : 'rgba(232,220,196,0.5)',
                    },
                  ]}
                >
                  3
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  {
                    color:
                      step === 3
                        ? 'rgba(232,220,196,0.9)'
                        : 'rgba(232,220,196,0.4)',
                  },
                ]}
              >
                Verify
              </Text>
            </View>
          </View>
        </SafeAreaView>

        <View style={styles.curve} />

        <ScrollView
          style={styles.body}
          contentContainerStyle={styles.bodyContent}
          keyboardShouldPersistTaps="handled"
        >
          {step === 1 ? (
            <>
              <View style={styles.row2}>
                <View style={{ flex: 1 }}>
                  <Field
                    label="First name"
                    value={firstName}
                    onChangeText={(value) => {
                      setFirstName(cleanName(value));
                      setErrors((prev) => ({ ...prev, firstName: undefined }));
                    }}
                    placeholder="Sipho"
                    error={errors.firstName}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Field
                    label="Last name"
                    value={lastName}
                    onChangeText={(value) => {
                      setLastName(cleanName(value));
                      setErrors((prev) => ({ ...prev, lastName: undefined }));
                    }}
                    placeholder="Dlamini"
                    error={errors.lastName}
                  />
                </View>
              </View>

              <Field
                label="Email address"
                value={email}
                onChangeText={(value) => {
                  setEmail(cleanEmail(value));
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="sipho@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
              />

              <SelectField
                label="Nationality"
                value={nationality}
                onChangeText={(value) => {
                  setNationality(value);
                  setErrors((prev) => ({ ...prev, nationality: undefined }));
                }}
                options={NATIONALITY_OPTIONS}
                placeholder="Select your nationality"
                error={errors.nationality}
              />

              <Pressable onPress={nextStep} style={styles.submitBtn}>
                <Text style={styles.submitText}>Continue →</Text>
              </Pressable>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable onPress={onLogin} style={styles.outlineBtn}>
                <Text style={styles.outlineBtnText}>
                  Already have an account? Sign in
                </Text>
              </Pressable>
            </>
          ) : step === 2 ? (
            <>
              {!!errors.form && (
                <Text style={styles.formError}>{errors.form}</Text>
              )}
              <View style={{ gap: 6 }}>
                <Text style={styles.pwLabel}>Password</Text>
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
                {password.length > 0 && (
                  <View style={styles.strengthRow}>
                    {[0, 1, 2].map((index) => (
                      <View
                        key={index}
                        style={[
                          styles.strengthBar,
                          { backgroundColor: strengthColor(index) },
                        ]}
                      />
                    ))}
                    <Text style={styles.strengthLabel}>{strengthLabel}</Text>
                  </View>
                )}
                {!!errors.password && (
                  <Text style={styles.errorText}>{errors.password}</Text>
                )}
              </View>

              <Field
                label="Confirm password"
                value={confirm}
                onChangeText={(value) => {
                  setConfirm(value.slice(0, 128));
                  setErrors((prev) => ({ ...prev, confirm: undefined }));
                }}
                placeholder="Repeat password"
                secureTextEntry={!showPw}
                error={errors.confirm}
              />

              <Pressable
                onPress={() => setAgreed((prev) => !prev)}
                style={[
                  styles.termsBox,
                  {
                    backgroundColor: agreed
                      ? 'rgba(58,90,64,0.07)'
                      : colors.ivory,
                    borderColor: errors.agreed
                      ? colors.terra
                      : 'rgba(62,50,38,0.1)',
                  },
                ]}
              >
                <View
                  style={[
                    styles.checkbox,
                    agreed
                      ? { backgroundColor: colors.savanna, borderWidth: 0 }
                      : { borderWidth: 1.5, borderColor: 'rgba(62,50,38,0.3)' },
                  ]}
                >
                  {agreed && <IconCheck color={colors.ivory} />}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{' '}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                  <Text style={styles.termsLink}>Privacy Policy</Text>. My data
                  will never be sold.
                </Text>
              </Pressable>

              {!!errors.agreed && (
                <Text style={styles.errorText}>{errors.agreed}</Text>
              )}

              <Pressable
                onPress={submit}
                disabled={loading}
                style={[styles.submitBtn, loading && { opacity: 0.8 }]}
              >
                {loading ? (
                  <ActivityIndicator color={colors.ivory} />
                ) : (
                  <Text style={styles.submitText}>Create my account →</Text>
                )}
              </Pressable>

              <Text style={styles.terms}>
                Your plans are private and only visible to you
              </Text>
            </>
          ) : (
            <>
              {!!errors.form && (
                <Text style={styles.formError}>{errors.form}</Text>
              )}
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
                  <Text style={styles.submitText}>Verify and create account</Text>
                )}
              </Pressable>

              <Pressable onPress={submit} disabled={loading} style={styles.resendWrap}>
                <Text style={styles.forgotText}>Resend code</Text>
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
  title: { fontSize: 22, fontFamily: fonts.display, color: colors.ivory, textAlign: "center" },
  subtitle: { fontSize: 13, color: "rgba(232,220,196,0.65)", marginTop: 4, textAlign: "center" },
  stepRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16 },
  stepItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  stepDot: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  stepDotText: { fontSize: 11, fontFamily: fonts.bodyBold, color: colors.ivory },
  stepLabel: { fontSize: 10, fontFamily: fonts.bodySemiBold, color: "rgba(232,220,196,0.8)" },
  stepLine: { width: 24, height: 1, backgroundColor: "rgba(232,220,196,0.3)" },
  curve: { height: 24, marginTop: -12, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: colors.sand },
  body: { flex: 1, paddingHorizontal: 24 },
  bodyContent: { gap: 16, paddingBottom: 32, maxWidth: 420, width: "100%", alignSelf: "center" },
  row2: { flexDirection: "row", gap: 12 },
  selectWrap: { gap: 6 },
  selectLabel: { fontSize: 11, fontFamily: fonts.bodySemiBold, letterSpacing: 0.5, textTransform: "uppercase", color: colors.charcoal, opacity: 0.6 },
  selectBox: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1.5, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.ivory },
  selectText: { fontSize: 14, fontFamily: fonts.body },
  dropdownCaret: { fontSize: 16, color: colors.charcoal, opacity: 0.7 },
  dropdownList: { backgroundColor: colors.ivory, borderRadius: 12, borderWidth: 1, borderColor: "rgba(62,50,38,0.12)", marginTop: 4, maxHeight: 220 },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "rgba(62,50,38,0.08)" },
  dropdownText: { fontSize: 14, fontFamily: fonts.body, color: colors.charcoal },
  pwLabel: { fontSize: 11, fontFamily: fonts.bodySemiBold, letterSpacing: 0.5, textTransform: "uppercase", color: colors.charcoal, opacity: 0.6 },
  pwWrap: { position: "relative", justifyContent: "center" },
  pwInput: { width: "100%", paddingHorizontal: 16, paddingVertical: 12, paddingRight: 56, borderRadius: 12, fontSize: 14, fontFamily: fonts.body, backgroundColor: colors.ivory, color: colors.charcoal, borderWidth: 1.5 },
  showBtn: { position: "absolute", right: 14 },
  showBtnText: { fontSize: 12, fontFamily: fonts.bodySemiBold, color: colors.sky },
  strengthRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthLabel: { fontSize: 10, color: colors.charcoal, opacity: 0.5, marginLeft: 4 },
  errorText: { fontSize: 11, color: colors.terra },
  formError: { fontSize: 12, lineHeight: 17, color: colors.terra, textAlign: "center", backgroundColor: "rgba(201,123,74,0.1)", borderRadius: 10, padding: 10 },
  otpMessage: { fontSize: 13, lineHeight: 19, color: colors.charcoal, opacity: 0.68, textAlign: "center" },
  resendWrap: { alignItems: "center", paddingVertical: 8 },
  forgotText: { fontSize: 12, fontFamily: fonts.bodySemiBold, color: colors.sky },
  termsBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, padding: 12, borderWidth: 1.5 },
  checkbox: { width: 20, height: 20, borderRadius: 6, alignItems: "center", justifyContent: "center", marginTop: 1 },
  termsText: { fontSize: 12, lineHeight: 17, color: colors.charcoal, opacity: 0.7, flex: 1 },
  termsLink: { textDecorationLine: "underline", color: colors.savanna },
  submitBtn: { paddingVertical: 16, borderRadius: 18, backgroundColor: colors.terra, alignItems: "center", marginTop: 6 },
  submitText: { fontSize: 14, fontFamily: fonts.bodyBold, color: colors.ivory },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(62,50,38,0.12)" },
  dividerText: { fontSize: 12, color: colors.charcoal, opacity: 0.4 },
  outlineBtn: { paddingVertical: 14, borderRadius: 18, alignItems: "center", borderWidth: 1.5, borderColor: colors.savanna },
  outlineBtnText: { fontSize: 14, fontFamily: fonts.bodySemiBold, color: colors.savanna },
  terms: { textAlign: "center", fontSize: 11, color: colors.charcoal, opacity: 0.4, marginTop: 4 },
});
