import React, { useState } from "react";
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { identifyLandmark } from "../services/featureService";
import { ATTRACTIONS } from "../data/attractions";
import { colors, fonts } from "../theme/theme";
import { IconBack } from "../components/Icons";

export default function TravelLensScreen({ user, onBack, onSelectAttraction }) {
  const [photo, setPhoto] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const processImage = async (picker) => {
    if (loading) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const picture = await picker();
      if (picture.canceled) return;
      const asset = picture.assets?.[0];
      if (!asset?.base64 || !asset?.uri) throw new Error("The camera did not return a usable picture.");
      setPhoto(asset.uri);
      const catalogue = ATTRACTIONS.map(({ id, name, location, description }) => ({ id, name, location, description }));
      setResult(await identifyLandmark(user?.email, asset.base64, catalogue));
    } catch (err) {
      setError(err.message || "Could not process this image.");
    } finally {
      setLoading(false);
    }
  };

  const capture = () => processImage(() => ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    base64: true,
    quality: 0.55,
  }));

  const choosePhoto = () => processImage(() => ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: false,
    base64: true,
    quality: 0.55,
  }));

  const openAttraction = (item) => {
    if (!item) return;
    const full = ATTRACTIONS.find((attraction) => String(attraction.id) === String(item.id) || attraction.name.toLowerCase() === String(item.name || "").toLowerCase());
    onSelectAttraction?.({ ...(full || {}), ...item, id: full?.id || item.id || `lens:${item.name}` });
  };
  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable onPress={onBack} style={styles.back} accessibilityLabel="Back"><IconBack color={colors.sand} /></Pressable>
        <Text style={styles.eyebrow}>DISCOVER A PLACE</Text>
        <Text style={styles.heading}>Travel Lens</Text>
        <Text style={styles.subtitle}>Point your camera at a landmark to learn more about it.</Text>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.content}>
        {Platform.OS === "web" && <Text style={styles.note}>Browser camera access requires permission and HTTPS (or localhost).</Text>}
        <View style={styles.cameraWrap}>
          {photo ? <Image source={{ uri: photo }} style={styles.camera} resizeMode="cover" /> : <View style={styles.center}><Text style={styles.cameraGlyph}>📷</Text><Text style={styles.note}>Take a clear photo of a landmark to identify it.</Text></View>}
        </View>
        <View style={styles.actions}>
          <Pressable disabled={loading} onPress={capture} style={[styles.primary, styles.action, loading && styles.disabled]}>
            {loading ? <ActivityIndicator color={colors.ivory} /> : <Text style={styles.primaryText}>Take photo with camera</Text>}
          </Pressable>
          <Pressable disabled={loading} onPress={choosePhoto} style={[styles.secondary, styles.action, loading && styles.disabled]}>
            <Text style={styles.secondaryText}>Choose from photos</Text>
          </Pressable>
        </View>
        {photo && <Image source={{ uri: photo }} style={styles.preview} resizeMode="cover" />}
        {!!error && <Text style={styles.error}>{error}</Text>}
        {result && <View style={styles.card}>
          <Text style={styles.label}>{result.status === "identified" ? "Identified landmark" : "Recognition result"}</Text>
          {result.match ? <>
            <Text style={styles.title}>{result.match.name}</Text>
            {!!result.match.location && <Text style={styles.meta}>{result.match.location}</Text>}
            {!!result.match.description && <Text style={styles.body}>{result.match.description}</Text>}
            {(result.match.facts || []).map((fact, index) => <Text key={`${index}-${fact}`} style={styles.body}>• {fact}</Text>)}
            {!!result.match.visitorInfo && <Text style={styles.visitor}>{result.match.visitorInfo}</Text>}
            <Text style={styles.meta}>Confidence: {Math.round((result.confidence || 0) * 100)}%</Text>
            <Pressable onPress={() => openAttraction(result.match)} style={styles.secondary}><Text style={styles.primaryText}>Open attraction</Text></Pressable>
          </> : <><Text style={styles.body}>{result.message || "No matching landmark was found."}</Text>
            {(result.possibleMatches || []).map((item) => <Pressable key={item.id || item.name} onPress={() => openAttraction(item)} style={styles.matchRow}><Text style={styles.matchName}>{item.name}</Text><Text style={styles.meta}>{item.location}</Text></Pressable>)}
          </>}
        </View>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  header: { backgroundColor: colors.savanna, paddingHorizontal: 20, paddingBottom: 18 },
  back: { width: 36, height: 36, justifyContent: "center", marginBottom: 8 },
  eyebrow: { color: colors.sand, opacity: 0.7, fontSize: 10, letterSpacing: 1.2, fontFamily: fonts.bodySemiBold },
  heading: { color: colors.ivory, fontSize: 25, fontFamily: fonts.display },
  subtitle: { color: colors.sand, opacity: 0.8, fontSize: 12, marginTop: 3 },
  content: { padding: 16, gap: 14 },
  cameraWrap: { height: 360, borderRadius: 22, overflow: "hidden", backgroundColor: colors.charcoal },
  camera: { flex: 1 },
  cameraGlyph: { fontSize: 42 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, gap: 12 },
  note: { color: colors.charcoal, opacity: 0.68, textAlign: "center", lineHeight: 20 },
  primary: { minHeight: 48, borderRadius: 15, backgroundColor: colors.terra, alignItems: "center", justifyContent: "center", paddingHorizontal: 16 },
  actions: { gap: 9 },
  action: { width: "100%" },
  disabled: { opacity: 0.55 },
  primaryText: { color: colors.ivory, fontFamily: fonts.bodyBold },
  preview: { height: 170, borderRadius: 18 },
  error: { color: colors.terra, fontFamily: fonts.bodySemiBold },
  card: { gap: 9, padding: 16, borderRadius: 18, backgroundColor: colors.ivory },
  label: { color: colors.sky, fontFamily: fonts.bodyBold, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6 },
  title: { color: colors.charcoal, fontFamily: fonts.display, fontSize: 24 },
  meta: { color: colors.charcoal, opacity: 0.56, fontSize: 12 },
  body: { color: colors.charcoal, opacity: 0.74, lineHeight: 20 },
  visitor: { color: colors.savanna, fontFamily: fonts.bodySemiBold, lineHeight: 20 },
  secondary: { minHeight: 48, padding: 12, borderRadius: 13, backgroundColor: colors.savanna, alignItems: "center", justifyContent: "center" },
  secondaryText: { color: colors.ivory, fontFamily: fonts.bodyBold },
  matchRow: { padding: 12, borderRadius: 12, backgroundColor: colors.sand },
  matchName: { color: colors.charcoal, fontFamily: fonts.bodyBold },
});
