import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/theme";
import { IconBack } from '../components/Icons';
import AppFooter from '../components/AppFooter';
import BrandLogo from '../components/BrandLogo';

export default function AboutScreen({ onBack, onPrivacy, onAbout }) {
  return (
    <View style={styles.screen}>
      <SafeAreaView edges={['top']} style={styles.header}>
        <Pressable onPress={onBack} style={styles.back}>
          <IconBack color={colors.sand} />
        </Pressable>
        <View style={styles.topLogo}><BrandLogo circle /></View>
        <Text style={styles.title}>About All-In-One-Planner</Text>
        <Text style={styles.subtitle}>
          Budget-first travel planning for South Africa.
        </Text>
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
    paddingBottom: 26,
    position: 'relative',
  },
  back: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  topLogo: { position: 'absolute', top: 12, right: 20 },
  title: { fontSize: 25, fontFamily: fonts.display, color: colors.ivory },
  subtitle: { color: colors.sand, opacity: 0.75, marginTop: 5 },
  content: { padding: 24, gap: 12 },
  heading: {
    fontSize: 15,
    fontFamily: fonts.bodyBold,
    color: colors.savanna,
    marginTop: 10,
  },
  body: { fontSize: 14, lineHeight: 21, color: colors.charcoal, opacity: 0.75 },
});
