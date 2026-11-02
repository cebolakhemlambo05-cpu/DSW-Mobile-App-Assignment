import React, { useState } from "react";
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/theme";
import { IconBack } from '../components/Icons';
import AppFooter from '../components/AppFooter';
import BrandLogo from '../components/BrandLogo';
import { ATTRACTION_PHOTO_CREDITS } from "../data/attractionPhotoCredits";

export default function AboutScreen({ onBack, onPrivacy, onAbout }) {
  const [showPhotoCredits, setShowPhotoCredits] = useState(false);

  const openPhotoSource = async (sourceUrl) => {
    try {
      await Linking.openURL(sourceUrl);
    } catch (error) {
      console.warn("Could not open the attraction photo source:", error);
      Alert.alert("Unable to open source", "Please try again when you have an internet connection.");
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={onBack} style={styles.back}>
          <IconBack color={colors.sand} />
        </Pressable>
        <View style={styles.headingRow}>
          <BrandLogo circle />
          <View style={styles.headingCopy}>
            <Text style={styles.title}>About All-In-One-Planner</Text>
            <Text style={styles.subtitle}>
              Budget-first travel planning for South Africa.
            </Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>The idea</Text>
        <Text style={styles.body}>
          All-In-One-Planner helps tourists discover South Africa's best attractions,
          find the cheapest and best nearby places to sleep, and understand the
          full cost of a day before they book.
        </Text>

        <Text style={styles.heading}>How it works</Text>
        <Text style={styles.body}>
          Search by travel style, choose an attraction, compare accommodation by
          price and distance to the attraction gate, explore activities and costs,
          then add everything to a Day Plan with an automatic total.
        </Text>

        <Text style={styles.heading}>Made for budget confidence</Text>
        <Text style={styles.body}>
          The daily budget slider filters results to what you can afford. Local
          favourites surface less obvious experiences, peak-time warnings flag
          price risks, and the group split calculator shows each traveller's share.
          Saved attraction information can also be prepared for offline use.
        </Text>

        <Text style={styles.heading}>Why it matters</Text>
        <Text style={styles.body}>
          The app brings discovery, accommodation, activities, pricing, and
          planning into one transparent place instead of making travellers switch
          between several services and a calculator.
        </Text>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ expanded: showPhotoCredits }}
          onPress={() => setShowPhotoCredits((visible) => !visible)}
          style={styles.creditToggle}
        >
          <Text style={styles.heading}>Attraction photo credits ({ATTRACTION_PHOTO_CREDITS.length})</Text>
          <Text style={styles.body}>
            {showPhotoCredits ? "Hide photo credits" : "View creators, licenses, and source links"}
          </Text>
        </Pressable>
        {showPhotoCredits && ATTRACTION_PHOTO_CREDITS.map((credit) => (
          <View key={credit.id} style={styles.creditRow}>
            <Text style={styles.creditTitle}>{credit.name}</Text>
            <Text style={styles.body}>
              Photo by {credit.author}. {credit.license}. Resized for offline use.
            </Text>
            <Pressable onPress={() => openPhotoSource(credit.sourceUrl)}>
              <Text style={styles.creditLink}>View Wikimedia source and license</Text>
            </Pressable>
          </View>
        ))}

        <Text style={styles.heading}>Version</Text>
        <Text style={styles.body}>All-In-One-Planner 1.0.0</Text>
      </ScrollView>

      <AppFooter onPrivacy={onPrivacy} onAbout={onAbout} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  header: {
    backgroundColor: colors.savanna,
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  back: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headingCopy: { flex: 1 },
  title: { fontSize: 22, fontFamily: fonts.display, color: colors.ivory },
  subtitle: { color: colors.sand, opacity: 0.75, marginTop: 5, fontSize: 12, lineHeight: 18 },
  content: { padding: 24, gap: 12 },
  heading: {
    fontSize: 15,
    fontFamily: fonts.bodyBold,
    color: colors.savanna,
    marginTop: 10,
  },
  body: { fontSize: 14, lineHeight: 21, color: colors.charcoal, opacity: 0.75 },
  creditToggle: { gap: 4, paddingVertical: 8 },
  creditRow: {
    gap: 4,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.ivory,
  },
  creditTitle: {
    fontSize: 14,
    fontFamily: fonts.bodyBold,
    color: colors.charcoal,
  },
  creditLink: {
    color: colors.sky,
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
  },
});
