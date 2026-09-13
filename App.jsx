import React, { useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  useFonts as useFraunces,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import {
  useFonts as useOutfit,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from "@expo-google-fonts/outfit";

import { colors } from "./src/theme/theme";
import LandingScreen from "./src/screens/LandingScreen";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import ForgotPasswordScreen from "./src/screens/ForgotPasswordScreen";
import HomeScreen from "./src/screens/HomeScreen";
import AttractionScreen from "./src/screens/AttractionScreen";
import DayPlanScreen from "./src/screens/DayPlanScreen";
import { isStrongPassword, normalizeEmail, validateEmail, validateName } from "./src/utils/validation";
import { loginUser, registerUser, requestPasswordResetLink, resetUserPassword, verifyLoginOtp } from "./src/services/placesService";
import PrivacyScreen from "./src/screens/PrivacyScreen";
import AboutScreen from "./src/screens/AboutScreen";

export default function App() {
  const [frauncesLoaded] = useFraunces({ Fraunces_600SemiBold, Fraunces_700Bold });
  const [outfitLoaded] = useOutfit({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  const resetParams = getInitialResetParams();
  const [authMode, setAuthMode] = useState(resetParams ? "forgot" : "landing");
  const [passwordReset, setPasswordReset] = useState(resetParams);
  const [currentUser, setCurrentUser] = useState(null);
  const [screen, setScreen] = useState("home");
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [dayPlan, setDayPlan] = useState([]);

  if (!frauncesLoaded || !outfitLoaded) {
    return <View style={styles.loading}><ActivityIndicator color={colors.terra} size="large" /></View>;
  }

  const handleCreateAccount = async ({ firstName, lastName, email, nationality, password }) => {
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = normalizeEmail(email);
    const cleanNationality = nationality.trim();

    if (!validateName(cleanFirstName)) {
      return { ok: false, errors: { firstName: "Use 2–80 letters, spaces, apostrophes, dots, or hyphens." } };
    }

    if (!validateName(cleanLastName)) {
      return { ok: false, errors: { lastName: "Use 2–80 letters, spaces, apostrophes, dots, or hyphens." } };
    }

    if (!validateEmail(cleanEmail)) {
      return { ok: false, errors: { email: "Enter a valid email address." } };
    }

    if (!cleanNationality) {
      return { ok: false, errors: { nationality: "Please select your nationality." } };
    }

    if (!isStrongPassword(password) || password.length > 128) {
      return {
        ok: false,
        errors: {
          password: "Use 8+ characters with upper/lowercase, a number, and a symbol.",
        },
      };
    }

    try {
      const user = await registerUser({ firstName: cleanFirstName, lastName: cleanLastName, email: cleanEmail, nationality: cleanNationality, password });
      setCurrentUser(user.firstName);
      return { ok: true, userName: user.firstName };
    } catch (error) {
      return { ok: false, errors: error.errors || { form: error.message } };
    }
  };

  const handleLogin = async (email, password) => {
    const cleanEmail = normalizeEmail(email);

    if (!validateEmail(cleanEmail)) {
      return { ok: false, errors: { email: "Enter a valid email address." } };
    }

    if (!password) {
      return { ok: false, errors: { password: "Password is required." } };
    }

    try {
      const result = await loginUser({ email: cleanEmail, password });
      return { ok: true, otpRequired: true, email: result.email, challengeToken: result.challengeToken };
    } catch (error) {
      return { ok: false, errors: error.errors || { form: error.message } };
    }
  };

  const handleVerifyLoginOtp = async ({ email, challengeToken, otp }) => {
    const cleanEmail = normalizeEmail(email);
    const cleanOtp = String(otp || "").replace(/\D/g, "");

    if (!validateEmail(cleanEmail)) {
      return { ok: false, errors: { email: "Enter a valid email address." } };
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      return { ok: false, errors: { otp: "Enter the 6-digit code sent to your email." } };
    }

    try {
      const user = await verifyLoginOtp({ email: cleanEmail, challengeToken, otp: cleanOtp });
      setCurrentUser(user.firstName);
      return { ok: true, userName: user.firstName };
    } catch (error) {
      return { ok: false, errors: error.errors || { form: error.message } };
    }
  };

  const handleRequestPasswordReset = async (email) => {
    const cleanEmail = normalizeEmail(email);

    if (!validateEmail(cleanEmail)) {
      return { ok: false, errors: { email: "Enter a valid email address." } };
    }

    try {
      await requestPasswordResetLink({ email: cleanEmail });
      return { ok: true };
    } catch (error) {
      return { ok: false, errors: error.errors || { form: error.message } };
    }
  };

  const handleResetPassword = async (email, newPassword, token) => {
    const cleanEmail = normalizeEmail(email);

    if (!validateEmail(cleanEmail)) {
      return { ok: false, errors: { email: "Enter a valid email address." } };
    }

    if (!isStrongPassword(newPassword) || newPassword.length > 128) {
      return {
        ok: false,
        errors: {
          password: "Use 8+ characters with upper/lowercase, a number, and a symbol.",
        },
      };
    }

    try {
      const user = await resetUserPassword({ email: cleanEmail, password: newPassword, token });
      return { ok: true, userName: user.firstName };
    } catch (error) {
      return { ok: false, errors: error.errors || { form: error.message } };
    }
  };

  const selectAttraction = (a) => {
    setSelectedAttraction(a);
    setScreen("attraction");
  };

  const addToPlan = (entry) => {
    setDayPlan((prev) => {
      const idx = prev.findIndex((e) => e.attractionId === entry.attractionId);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = entry;
        return next;
      }
      return [...prev, entry];
    });
  };

  const handleAuthSuccess = (name) => setCurrentUser(name);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.root}>
        {!currentUser ? (
          <>
            {authMode === "landing" && <LandingScreen onMode={setAuthMode} onPrivacy={() => setAuthMode("privacy")} />}
            {authMode === "privacy" && (
              <PrivacyScreen
                onBack={() => setAuthMode("landing")}
                onPrivacy={() => setAuthMode("privacy")}
                onAbout={() => setAuthMode("about")}
              />
            )}
            {authMode === "about" && (
              <AboutScreen
                onBack={() => setAuthMode("landing")}
                onPrivacy={() => setAuthMode("privacy")}
                onAbout={() => setAuthMode("about")}
              />
            )}
            {authMode === "login" && (
              <LoginScreen
                onSuccess={handleAuthSuccess}
                onLogin={handleLogin}
                onVerifyOtp={handleVerifyLoginOtp}
                onRegister={() => setAuthMode("register")}
                onForgot={() => setAuthMode("forgot")}
                onBack={() => setAuthMode("landing")}
              />
            )}
            {authMode === "register" && (
              <RegisterScreen
                onSuccess={handleAuthSuccess}
                onCreateAccount={handleCreateAccount}
                onLogin={() => setAuthMode("login")}
                onBack={() => setAuthMode("landing")}
              />
            )}
            {authMode === "forgot" && (
              <ForgotPasswordScreen
                initialEmail={passwordReset?.email || ""}
                resetToken={passwordReset?.token || ""}
                onRequestReset={handleRequestPasswordReset}
                onResetPassword={handleResetPassword}
                onBack={() => {
                  setPasswordReset(null);
                  setAuthMode("login");
                }}
                onLogin={() => {
                  setPasswordReset(null);
                  setAuthMode("login");
                }}
              />
            )}
          </>
        ) : (
          <>
            {screen === "home" && (
              <HomeScreen
                onSelect={selectAttraction}
                onViewPlan={() => setScreen("dayplan")}
                planCount={dayPlan.length}
                currentUser={currentUser}
                onPrivacy={() => setScreen("privacy")}
                onAbout={() => setScreen("about")}
                onSignOut={() => {
                  setCurrentUser(null);
                  setAuthMode("landing");
                  setDayPlan([]);
                  setScreen("home");
                }}
              />
            )}
            {screen === "attraction" && selectedAttraction && (
              <AttractionScreen
                attraction={selectedAttraction}
                onBack={() => setScreen("home")}
                onAddToPlan={addToPlan}
                existingEntry={dayPlan.find((e) => e.attractionId === selectedAttraction.id)}
              />
            )}
            {screen === "dayplan" && (
              <DayPlanScreen
                plan={dayPlan}
                onBack={() => setScreen("home")}
                onRemove={(id) => setDayPlan((p) => p.filter((e) => e.attractionId !== id))}
                onClearAll={() => setDayPlan([])}
                onSelectAttraction={selectAttraction}
              />
            )}
            {screen === "privacy" && (
              <PrivacyScreen
                onBack={() => setScreen("home")}
                onPrivacy={() => setScreen("privacy")}
                onAbout={() => setScreen("about")}
              />
            )}
            {screen === "about" && (
              <AboutScreen
                onBack={() => setScreen("home")}
                onPrivacy={() => setScreen("privacy")}
                onAbout={() => setScreen("about")}
              />
            )}
          </>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.sand },
  loading: { flex: 1, backgroundColor: colors.sand },
});

function getInitialResetParams() {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const token = params.get("resetToken");
  const email = params.get("email");

  if (!token || !email) return null;
  return { token, email };
}
