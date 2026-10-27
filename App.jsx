import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, View, StyleSheet } from "react-native";
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
import {
  loginUser,
  registerUser,
  requestPasswordResetLink,
  resetUserPassword,
  verifyLoginOtp,
  verifyRegistrationOtp,
  saveUserPlan,
  updateUserProfile,
  deleteUserAccount,
  fetchUserProfile,
  fetchUserPlan,
  logoutAdmin,
  logoutUser,
} from './src/services/placesService';
import {
  clearActiveSession,
  clearPendingChanges,
  removeCachedAccount,
  restoreActiveSession,
  restoreCachedAccount,
  restorePendingChanges,
  saveActiveSession,
  saveCachedAccount,
  saveOfflineVerifier,
  savePendingChanges,
  verifyOfflinePassword,
} from './src/services/offlineStore';
import PrivacyScreen from './src/screens/PrivacyScreen';
import AboutScreen from './src/screens/AboutScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AdminScreen from './src/screens/AdminScreen';

export default function App() {
  const [frauncesLoaded] = useFraunces({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });
  const [outfitLoaded] = useOutfit({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  const resetParams = getInitialResetParams();
  const [authMode, setAuthMode] = useState(resetParams ? 'forgot' : 'landing');
  const [passwordReset, setPasswordReset] = useState(resetParams);
  const [currentUser, setCurrentUser] = useState(null);
  const [screen, setScreen] = useState('home');
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [dayPlan, setDayPlan] = useState([]);
  const [restoringSession, setRestoringSession] = useState(true);
  const [syncNotice, setSyncNotice] = useState('');
  const pendingCredentials = useRef(null);
  const dayPlanRef = useRef(dayPlan);
  dayPlanRef.current = dayPlan;

  useEffect(() => {
    let active = true;

    const restore = async () => {
      try {
        const session = await restoreActiveSession();
        if (!session?.email) return;

        const cached = await restoreCachedAccount(session.email);
        const user = cached ? { ...session, ...cached } : session;
        const plan = Array.isArray(user.dayPlan) ? user.dayPlan : [];

        if (active) {
          setCurrentUser(user);
          setDayPlan(plan);
          if (user.isAdmin) setScreen('admin');
          setSyncNotice('Your saved account is available on this device.');
        }

      } catch (error) {
        console.error('Could not restore the saved session:', error);
      } finally {
        if (active) setRestoringSession(false);
      }
    };

    restore();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!currentUser?.email || currentUser.isAdmin) return undefined;
    let active = true;
    let syncing = false;

    const syncAccount = async () => {
      if (syncing) return;
      syncing = true;
      try {
        const pending = await restorePendingChanges(currentUser.email);
        let user = currentUser;
        if (pending?.profile) {
          const result = await updateUserProfile(currentUser.email, pending.profile);
          user = {
            ...user,
            ...result.user,
            profilePhoto: result.user.profilePhoto ??
              (pending.profile.profilePhoto !== undefined
                ? pending.profile.profilePhoto
                : user.profilePhoto),
          };
          await clearPendingChanges(currentUser.email, ['profile']);
        }

        let plan = dayPlanRef.current;
        if (Array.isArray(pending?.dayPlan)) {
          plan = pending.dayPlan;
          await saveUserPlan(currentUser.email, plan);
          await clearPendingChanges(currentUser.email, ['dayPlan']);
        }

        const [profileResult, planResult] = await Promise.all([
          fetchUserProfile(currentUser.email),
          fetchUserPlan(currentUser.email),
        ]);
        user = {
          ...user,
          ...profileResult.user,
          profilePhoto: profileResult.user.profilePhoto ?? user.profilePhoto,
        };
        plan = Array.isArray(planResult.plan) ? planResult.plan : plan;
        user.dayPlan = plan;
        if (!active) return;
        setCurrentUser(user);
        setDayPlan(plan);
        await saveActiveSession(user);
        setSyncNotice('');
      } catch {
        if (active) {
          setSyncNotice('Offline mode: saved data is available. Changes will sync when connected.');
        }
      } finally {
        syncing = false;
      }
    };

    const onAppStateChange = (state) => {
      if (state === 'active') syncAccount();
    };
    const appStateSubscription = AppState.addEventListener('change', onAppStateChange);
    if (typeof window !== 'undefined') window.addEventListener('online', syncAccount);
    const syncTimer = setInterval(() => {
      if (AppState.currentState === 'active') syncAccount();
    }, 30000);
    syncAccount();

    return () => {
      active = false;
      appStateSubscription.remove();
      clearInterval(syncTimer);
      if (typeof window !== 'undefined') window.removeEventListener('online', syncAccount);
    };
  }, [currentUser?.email, currentUser?.isAdmin]);

  if (!frauncesLoaded || !outfitLoaded || restoringSession) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.terra} size="large" />
      </View>
    );
  }

  const handleCreateAccount = async ({
    firstName,
    lastName,
    email,
    nationality,
    password,
  }) => {
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = normalizeEmail(email);
    const cleanNationality = nationality.trim();

    if (!validateName(cleanFirstName)) {
      return {
        ok: false,
        errors: {
          firstName: 'Use 2–80 letters, spaces, apostrophes, dots, or hyphens.',
        },
      };
    }

    if (!validateName(cleanLastName)) {
      return {
        ok: false,
        errors: {
          lastName: 'Use 2–80 letters, spaces, apostrophes, dots, or hyphens.',
        },
      };
    }

    if (!validateEmail(cleanEmail)) {
      return { ok: false, errors: { email: 'Enter a valid email address.' } };
    }

    if (!cleanNationality) {
      return {
        ok: false,
        errors: { nationality: 'Please select your nationality.' },
      };
    }

    if (!isStrongPassword(password) || password.length > 128) {
      return {
        ok: false,
        errors: {
          password:
            'Use 8+ characters with upper/lowercase, a number, and a symbol.',
        },
      };
    }

    try {
      pendingCredentials.current = { email: cleanEmail, password };
      const result = await registerUser({
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        nationality: cleanNationality,
        password,
      });
      return {
        ok: true,
        otpRequired: true,
        email: result.email,
        challengeToken: result.challengeToken,
      };
    } catch (error) {
      pendingCredentials.current = null;
      return { ok: false, errors: error.errors || { form: error.message } };
    }
  };

  const handleVerifyRegistrationOtp = async ({
    email,
    challengeToken,
    otp,
  }) => {
    const cleanEmail = normalizeEmail(email);
    const cleanOtp = String(otp || '').replace(/\D/g, '');

    if (!validateEmail(cleanEmail)) {
      return { ok: false, errors: { email: 'Enter a valid email address.' } };
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      return {
        ok: false,
        errors: { otp: 'Enter the 6-digit code sent to your email.' },
      };
    }

    try {
      const user = await verifyRegistrationOtp({
        email: cleanEmail,
        challengeToken,
        otp: cleanOtp,
      });
      const credentials = pendingCredentials.current;
      if (credentials?.email === cleanEmail) {
        await saveOfflineVerifier(cleanEmail, credentials.password);
      }
      pendingCredentials.current = null;
      setCurrentUser(user);
      setDayPlan(user.dayPlan || []);
      await saveActiveSession(user);
      return { ok: true, userName: user.firstName };
    } catch (error) {
      return { ok: false, errors: error.errors || { form: error.message } };
    }
  };

  const handleLogin = async (email, password) => {
    const cleanEmail = normalizeEmail(email);

    if (!validateEmail(cleanEmail)) {
      return { ok: false, errors: { email: 'Enter a valid email address.' } };
    }

    if (!password) {
      return { ok: false, errors: { password: 'Password is required.' } };
    }

    try {
      const result = await loginUser({ email: cleanEmail, password });
      if (result.adminRequired) {
        return {
          ok: true,
          adminRequired: true,
          userName: { ...result.user, adminToken: result.adminToken, adminRole: result.role },
        };
      }
      pendingCredentials.current = { email: cleanEmail, password };
      return {
        ok: true,
        otpRequired: true,
        email: result.email,
        challengeToken: result.challengeToken,
      };
    } catch (error) {
      if (error.code === 'NETWORK_UNAVAILABLE') {
        try {
          const cachedUser = await restoreCachedAccount(cleanEmail);
          if (
            cachedUser &&
            !cachedUser.isAdmin &&
            await verifyOfflinePassword(cleanEmail, password)
          ) {
            return { ok: true, offlineUser: cachedUser };
          }
        } catch (offlineError) {
          console.error('Offline sign-in could not be verified:', offlineError);
        }
      }
      return { ok: false, errors: error.errors || { form: error.message } };
    }
  };

  const handleVerifyLoginOtp = async ({ email, challengeToken, otp }) => {
    const cleanEmail = normalizeEmail(email);
    const cleanOtp = String(otp || '').replace(/\D/g, '');

    if (!validateEmail(cleanEmail)) {
      return { ok: false, errors: { email: 'Enter a valid email address.' } };
    }

    if (!/^\d{6}$/.test(cleanOtp)) {
      return {
        ok: false,
        errors: { otp: 'Enter the 6-digit code sent to your email.' },
      };
    }

    try {
      const user = await verifyLoginOtp({
        email: cleanEmail,
        challengeToken,
        otp: cleanOtp,
      });
      const credentials = pendingCredentials.current;
      if (credentials?.email === cleanEmail) {
        await saveOfflineVerifier(cleanEmail, credentials.password);
      }
      pendingCredentials.current = null;
      setCurrentUser(user);
      setDayPlan(user.dayPlan || []);
      await saveActiveSession(user);
      return { ok: true, userName: user.firstName };
    } catch (error) {
      return { ok: false, errors: error.errors || { form: error.message } };
    }
  };

  const handleRequestPasswordReset = async (email) => {
    const cleanEmail = normalizeEmail(email);

    if (!validateEmail(cleanEmail)) {
      return { ok: false, errors: { email: 'Enter a valid email address.' } };
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
      return { ok: false, errors: { email: 'Enter a valid email address.' } };
    }

    if (!isStrongPassword(newPassword) || newPassword.length > 128) {
      return {
        ok: false,
        errors: {
          password:
            'Use 8+ characters with upper/lowercase, a number, and a symbol.',
        },
      };
    }

    try {
      const user = await resetUserPassword({
        email: cleanEmail,
        password: newPassword,
        token,
      });
      return { ok: true, userName: user.firstName };
    } catch (error) {
      return { ok: false, errors: error.errors || { form: error.message } };
    }
  };

  const selectAttraction = (a) => {
    setSelectedAttraction(a);
    setScreen('attraction');
  };

  const persistPlan = async (nextPlan) => {
    if (!currentUser?.email) return;
    const updatedUser = { ...currentUser, dayPlan: nextPlan };
    setCurrentUser(updatedUser);
    await saveCachedAccount(updatedUser, nextPlan);
    await saveActiveSession(updatedUser);
    try {
      await saveUserPlan(currentUser.email, nextPlan);
      await clearPendingChanges(currentUser.email, ['dayPlan']);
      setSyncNotice('');
    } catch {
      await savePendingChanges(currentUser.email, { dayPlan: nextPlan });
      setSyncNotice('Saved on this device. Your plan will sync when you’re online.');
    }
  };

  const addToPlan = async (entry) => {
    const index = dayPlan.findIndex((item) => item.attractionId === entry.attractionId);
    const nextPlan = index >= 0
      ? dayPlan.map((item, itemIndex) => itemIndex === index ? entry : item)
      : [...dayPlan, entry];
    setDayPlan(nextPlan);
    await persistPlan(nextPlan);
  };

  const updatePlan = async (nextPlan) => {
    setDayPlan(nextPlan);
    await persistPlan(nextPlan);
  };

  const updatePlanGroupSize = async (groupSize) => {
    const nextPlan = dayPlan.map((entry) => {
      const roomQuantity = Number(entry.roomQuantity || entry.booking?.roomQuantity || 1);
      const roomSharing = Number(entry.roomSharing || entry.booking?.roomSharing || 2);
      const nights = Number(entry.stayNights || entry.booking?.nights || 1);
      const accommodationTotal = entry.accommodation
        ? Number(entry.accommodation.price || 0) * roomQuantity * nights
        : 0;
      const activitiesTotal = (entry.activities || []).reduce(
        (sum, activity) => sum + Number(activity.price || 0) * groupSize,
        0
      );
      const guestsNeedingRoom = entry.accommodation
        ? Math.max(0, groupSize - roomQuantity * roomSharing)
        : 0;
      const booking = entry.booking
        ? {
            ...entry.booking,
            adults: groupSize,
            roomQuantity,
            roomSharing,
            guestsNeedingRoom,
            accommodationTotal,
            activitiesTotal,
            amount: accommodationTotal + activitiesTotal,
          }
        : undefined;
      return {
        ...entry,
        groupSize,
        roomQuantity,
        roomSharing,
        guestsNeedingRoom,
        accommodationTotal,
        activitiesTotal,
        booking,
      };
    });
    await updatePlan(nextPlan);
  };

  const handleAuthSuccess = async (nameOrUser) => {
    const user = typeof nameOrUser === 'object'
      ? nameOrUser
      : { firstName: nameOrUser, dayPlan: [] };
    setCurrentUser((prev) => prev || user);
    setDayPlan(user.dayPlan || []);
    try {
      await saveActiveSession(user);
      setSyncNotice('Your account is saved on this device for offline access.');
    } catch (error) {
      console.error('Could not save the local session:', error);
    }
    if (user.isAdmin) setScreen('admin');
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.root}>
        {!currentUser ? (
          <>
            {authMode === 'landing' && (
              <LandingScreen
                onMode={setAuthMode}
                onPrivacy={() => setAuthMode('privacy')}
              />
            )}
            {authMode === 'privacy' && (
              <PrivacyScreen
                onBack={() => setAuthMode('landing')}
                onPrivacy={() => setAuthMode('privacy')}
                onAbout={() => setAuthMode('about')}
              />
            )}
            {authMode === 'about' && (
              <AboutScreen
                onBack={() => setAuthMode('landing')}
                onPrivacy={() => setAuthMode('privacy')}
                onAbout={() => setAuthMode('about')}
              />
            )}
            {authMode === 'login' && (
              <LoginScreen
                onSuccess={handleAuthSuccess}
                onLogin={handleLogin}
                onVerifyOtp={handleVerifyLoginOtp}
                onRegister={() => setAuthMode('register')}
                onForgot={() => setAuthMode('forgot')}
                onBack={() => setAuthMode('landing')}
              />
            )}
            {authMode === 'register' && (
              <RegisterScreen
                onSuccess={handleAuthSuccess}
                onCreateAccount={handleCreateAccount}
                onVerifyOtp={handleVerifyRegistrationOtp}
                onLogin={() => setAuthMode('login')}
                onBack={() => setAuthMode('landing')}
              />
            )}
            {authMode === 'forgot' && (
              <ForgotPasswordScreen
                initialEmail={passwordReset?.email || ''}
                resetToken={passwordReset?.token || ''}
                onRequestReset={handleRequestPasswordReset}
                onResetPassword={handleResetPassword}
                onBack={() => {
                  setPasswordReset(null);
                  setAuthMode('login');
                }}
                onLogin={() => {
                  setPasswordReset(null);
                  setAuthMode('login');
                }}
              />
            )}
          </>
        ) : (
          <>
            {screen === 'home' && (
              <HomeScreen
                onSelect={selectAttraction}
                onViewPlan={() => setScreen('dayplan')}
                planCount={dayPlan.length}
                currentUser={currentUser}
                syncNotice={syncNotice}
                onViewProfile={() => setScreen('profile')}
                onPrivacy={() => setScreen('privacy')}
                onAbout={() => setScreen('about')}
                onSignOut={async () => {
                  if (currentUser?.email && !currentUser.isAdmin) {
                    await persistPlan(dayPlan);
                    try { await logoutUser(); } catch {}
                  }
                  await clearActiveSession();
                  setCurrentUser(null);
                  setAuthMode('landing');
                  setScreen('home');
                }}
              />
            )}
            {screen === 'attraction' && selectedAttraction && (
              <AttractionScreen
                attraction={selectedAttraction}
                currentUser={currentUser}
                onBack={() => setScreen('home')}
                onGoToPlan={() => setScreen('dayplan')}
                onAddToPlan={addToPlan}
                existingEntry={dayPlan.find(
                  (e) => e.attractionId === selectedAttraction.id
                )}
              />
            )}
            {screen === 'dayplan' && (
              <DayPlanScreen
                plan={dayPlan}
                onBack={() => setScreen('home')}
                onRemove={(id) =>
                  updatePlan(dayPlan.filter((e) => e.attractionId !== id))
                }
                onClearAll={() => updatePlan([])}
                onSelectAttraction={selectAttraction}
                onGroupSizeChange={updatePlanGroupSize}
              />
            )}
            {screen === 'privacy' && (
              <PrivacyScreen
                onBack={() => setScreen('home')}
                onPrivacy={() => setScreen('privacy')}
                onAbout={() => setScreen('about')}
                onManageAccount={() => setScreen('profile')}
              />
            )}
            {screen === 'about' && (
              <AboutScreen
                onBack={() => setScreen('home')}
                onPrivacy={() => setScreen('privacy')}
                onAbout={() => setScreen('about')}
              />
            )}
            {screen === 'profile' && (
              <ProfileScreen
                user={currentUser}
                onBack={() => setScreen('home')}
                onAdmin={() => setScreen('admin')}
                onSave={async (profile) => {
                  const updatedUser = { ...currentUser, ...profile };
                  setCurrentUser(updatedUser);
                  await saveCachedAccount(updatedUser, dayPlan);
                  await saveActiveSession(updatedUser);
                  try {
                    const result = await updateUserProfile(currentUser.email, profile);
                    const savedUser = {
                      ...updatedUser,
                      ...result.user,
                      profilePhoto: result.user.profilePhoto ??
                        (profile.profilePhoto !== undefined
                          ? profile.profilePhoto
                          : updatedUser.profilePhoto),
                    };
                    setCurrentUser(savedUser);
                    await saveCachedAccount(savedUser, dayPlan);
                    await saveActiveSession(savedUser);
                    await clearPendingChanges(currentUser.email, ['profile']);
                    setSyncNotice('');
                    return { offline: false };
                  } catch {
                    await savePendingChanges(currentUser.email, { profile });
                    setSyncNotice('Profile saved on this device. It will sync when you’re online.');
                    return { offline: true };
                  }
                }}
                onDelete={async () => {
                  await deleteUserAccount(currentUser.email);
                  await removeCachedAccount(currentUser.email);
                  await clearActiveSession();
                  setCurrentUser(null);
                  setDayPlan([]);
                  setAuthMode('landing');
                  setScreen('home');
                }}
              />
            )}
            {screen === 'admin' && (
              <AdminScreen
                adminEmail={currentUser.email}
                adminToken={currentUser.adminToken}
                adminRole={currentUser.adminRole}
                onBack={async () => {
                  try { await logoutAdmin(currentUser.adminToken); } catch {}
                  await clearActiveSession();
                  setCurrentUser(null);
                  setAuthMode('landing');
                  setScreen('home');
                }}
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
