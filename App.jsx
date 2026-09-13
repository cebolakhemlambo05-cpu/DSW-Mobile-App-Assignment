import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
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
import HomeScreen from "./src/screens/HomeScreen";
import AttractionScreen from "./src/screens/AttractionScreen";
import DayPlanScreen from "./src/screens/DayPlanScreen";
import HiddenGemsScreen from "./src/screens/HiddenGemsScreen";
import BudgetScreen from "./src/screens/BudgetScreen";
import ProfileScreen from "./src/screens/ProfileScreen";

export default function App() {
  const [frauncesLoaded] = useFraunces({ Fraunces_600SemiBold, Fraunces_700Bold });
  const [outfitLoaded] = useOutfit({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  const [authMode, setAuthMode] = useState("landing");
  const [currentUser, setCurrentUser] = useState(null);
  const [screen, setScreen] = useState("home");
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [dayPlan, setDayPlan] = useState([]);
  const [budget, setBudget] = useState(2500);

  if (!frauncesLoaded || !outfitLoaded) {
    return <View style={styles.loading} />;
  }

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

  const handleSignOut = () => {
    setCurrentUser(null);
    setAuthMode("landing");
    setDayPlan([]);
    setScreen("home");
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.root}>
        {!currentUser ? (
          <>
            {authMode === "landing" && <LandingScreen onMode={setAuthMode} />}
            {authMode === "login" && (
              <LoginScreen
                onSuccess={handleAuthSuccess}
                onRegister={() => setAuthMode("register")}
                onBack={() => setAuthMode("landing")}
              />
            )}
            {authMode === "register" && (
              <RegisterScreen
                onSuccess={handleAuthSuccess}
                onLogin={() => setAuthMode("login")}
                onBack={() => setAuthMode("landing")}
              />
            )}
          </>
        ) : (
          <>
            {screen === "home" && (
              <HomeScreen
                onSelect={selectAttraction}
                onViewPlan={() => setScreen("dayplan")}
                onViewGems={() => setScreen("gems")}
                onViewBudget={() => setScreen("budget")}
                onViewProfile={() => setScreen("profile")}
                planCount={dayPlan.length}
                currentUser={currentUser}
                onSignOut={handleSignOut}
              />
            )}
            {screen === "attraction" && selectedAttraction && (
              <AttractionScreen
                attraction={selectedAttraction}
                onBack={() => setScreen("home")}
                onAddToPlan={addToPlan}
                existingEntry={dayPlan.find(
                  (e) => e.attractionId === selectedAttraction.id
                )}
              />
            )}
            {screen === "dayplan" && (
              <DayPlanScreen
                plan={dayPlan}
                onBack={() => setScreen("home")}
                onRemove={(id) =>
                  setDayPlan((p) => p.filter((e) => e.attractionId !== id))
                }
                onClearAll={() => setDayPlan([])}
                onSelectAttraction={selectAttraction}
              />
            )}
            {screen === "gems" && (
              <HiddenGemsScreen
                onBack={() => setScreen("home")}
                onSelect={selectAttraction}
              />
            )}
            {screen === "budget" && (
              <BudgetScreen
                plan={dayPlan}
                onBack={() => setScreen("home")}
                onUpdateBudget={setBudget}
              />
            )}
            {screen === "profile" && (
              <ProfileScreen
                currentUser={currentUser}
                plan={dayPlan}
                budget={budget}
                onBack={() => setScreen("home")}
                onSignOut={handleSignOut}
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