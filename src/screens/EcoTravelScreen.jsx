
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Field from "../components/Field";
import { Header } from "./PrivacyScreen";
import {
  fetchEcoProfile,
  saveEcoProfile,
} from "../services/featureService";
import { colors, fonts } from "../theme/theme";

const FACTORS = [
  { mode: "Walking", factor: 0, points: 15 },
  { mode: "Cycling", factor: 0, points: 15 },
  { mode: "Bus", factor: 0.089, points: 8 },
  { mode: "Car", factor: 0.192, points: 0 },
];

const EMPTY_PROFILE = { choices: [], points: 0 };

export default function EcoTravelScreen({ user, onBack }) {
  const [distance, setDistance] = useState("10");
  const [destination, setDestination] = useState("");
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user?.email) return;

    fetchEcoProfile(user.email)
      .then((data) => {
        setProfile(data.profile || EMPTY_PROFILE);
      })
      .catch(() => {
        Alert.alert(
          "Eco-Travel",
          "Your saved profile could not be loaded. Please try again later."
        );
      });
  }, [user?.email]);

  const estimates = useMemo(() => {
    const km = Math.max(0, Number(distance) || 0);

    return FACTORS.map((item) => ({
      ...item,
      emissions: km * item.factor,
    }));
  }, [distance]);

  const best = estimates.reduce((winner, item) =>
    item.emissions < winner.emissions ? item : winner
  );

  const totalPoints = Number(profile.points) || 0;
  const choices = profile.choices || [];

  const openUber = async () => {
    const place = destination.trim();

    if (!place) {
      Alert.alert("Destination required", "Enter where you want to go.");
      return;
    }

    const url =
      "https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=" +
      encodeURIComponent(place);

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        "Unable to open Uber",
        "Please try again or open the Uber app manually."
      );
    }
  };

  const choose = async (item) => {
    if (!user?.email) {
      Alert.alert("Sign in required", "Please sign in to save your trips.");
      return;
    }

    const km = Number(distance);

    if (!Number.isFinite(km) || km <= 0) {
      Alert.alert("Invalid distance", "Enter a distance greater than zero.");
      return;
    }

    if (saving) return;

    const pointsEarned = item.points;
    const next = {
      points: totalPoints + pointsEarned,
      choices: [
        ...choices,
        {
          id: String(Date.now()),
          mode: item.mode,
          distanceKm: km,
          emissionsKg: item.emissions,
          points: pointsEarned,
          verified: false,
          createdAt: new Date().toISOString(),
        },
      ],
    };

    setSaving(true);

    try {
      await saveEcoProfile(user.email, next);
      setProfile(next);

      Alert.alert(
        "Trip plan saved!",
        `Your ${item.mode.toLowerCase()} plan was saved. You earned ${pointsEarned} planning points. These points do not confirm that the trip took place.`
      );
    } catch {
      Alert.alert(
        "Couldn't save",
        "Your trip wasn't saved. Please check your connection and try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Header title="Eco Challenge" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.hero}>
          <Text style={styles.label}>Your eco-score</Text>
          <Text style={styles.score}>{totalPoints}</Text>
          <Text style={styles.heroBody}>
            Planning points earned for choosing lower-emission transport.
            They do not verify real-world travel.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Find a ride</Text>
          <Text style={styles.body}>
            Enter your destination to open Uber's ride flow.
            Check the ride details in Uber before confirming a booking.
          </Text>

          <Field
            label="Destination"
            value={destination}
            onChangeText={setDestination}
          />

          <Pressable style={styles.uberButton} onPress={openUber}>
            <Text style={styles.chooseText}>Continue to Uber</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Compare transport</Text>

          <Field
            label="Distance in km"
            value={distance}
            onChangeText={setDistance}
            keyboardType="numeric"
          />

          <Text style={styles.body}>
            Estimated emissions in kg CO2e per passenger-km:
            walking and cycling 0, bus 0.089, car 0.192.
            Actual emissions vary by vehicle, route, occupancy and conditions.
          </Text>
        </View>

        <View style={styles.card}>
          {estimates.map((item) => (
            <View
              key={item.mode}
              style={[
                styles.option,
                item.mode === best.mode && styles.best,
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.mode}>{item.mode}</Text>
                <Text style={styles.body}>
                  {item.emissions.toFixed(2)} kg CO2e estimated
                </Text>
                <Text style={styles.points}>
                  {item.points} planning points
                </Text>
              </View>

              <Pressable
                disabled={saving}
                onPress={() => choose(item)}
                style={[styles.choose, saving && styles.disabled]}
              >
                <Text style={styles.chooseText}>
                  {saving ? "Saving..." : "Plan trip"}
                </Text>
              </Pressable>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Achievements</Text>

          <Text style={styles.mode}>
            {totalPoints >= 100
              ? "Low-carbon route champion"
              : totalPoints >= 50
              ? "Sustainable planner"
              : "Your journey starts here"}
          </Text>

          <Text style={styles.body}>
            Choose lower-emission transport to build your planning score.
          </Text>

          <Text style={styles.section}>Recent trip plans</Text>

          {choices.length === 0 ? (
            <Text style={styles.body}>
              Your saved trip plans will appear here.
            </Text>
          ) : (
            choices
              .slice(-5)
              .reverse()
              .map((choice) => (
                <Text key={choice.id} style={styles.history}>
                  {choice.mode}: {choice.distanceKm} km,{" "}
                  {(Number(choice.emissionsKg) || 0).toFixed(2)} kg CO2e,
                  {" "}+{choice.points} points
                </Text>
              ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.sand,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  hero: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.savanna,
    gap: 6,
  },
  label: {
    color: "rgba(250,246,239,0.8)",
    fontFamily: fonts.bodyBold,
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 0.7,
  },
  score: {
    color: colors.ivory,
    fontFamily: fonts.display,
    fontSize: 52,
  },
  heroBody: {
    color: colors.ivory,
    lineHeight: 19,
  },
  body: {
    color: colors.charcoal,
    opacity: 0.75,
    lineHeight: 19,
  },
  card: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.ivory,
    gap: 10,
  },
  section: {
    color: colors.sky,
    fontFamily: fonts.bodyBold,
    textTransform: "uppercase",
    fontSize: 11,
    letterSpacing: 0.7,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.sand,
  },
  best: {
    borderWidth: 1,
    borderColor: colors.savanna,
  },
  mode: {
    color: colors.charcoal,
    fontFamily: fonts.bodyBold,
  },
  points: {
    color: colors.sky,
    fontSize: 12,
    marginTop: 3,
  },
  choose: {
    minWidth: 85,
    padding: 10,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: colors.terra,
  },
  uberButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: colors.charcoal,
  },
  chooseText: {
    color: colors.ivory,
    fontFamily: fonts.bodyBold,
  },
  disabled: {
    opacity: 0.5,
  },
  history: {
    color: colors.charcoal,
    opacity: 0.75,
    fontSize: 12,
    lineHeight: 19,
  },
});
