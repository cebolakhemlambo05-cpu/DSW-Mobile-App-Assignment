
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "./PrivacyScreen";
import { identifyLandmark } from "../services/featureService";
import { ATTRACTIONS } from "../data/attractions";
import { colors, fonts } from "../theme/theme";

export default function TravelLensScreen({
  user,
  onBack,
  onSelectAttraction,
}) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const capture = async () => {
    if (!permission?.granted) {
      const next = await requestPermission();
      if (!next.granted) return;
    }

    if (!cameraRef.current || loading) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const picture = await cameraRef.current.takePictureAsync({
        quality: 0.55,
        base64: true,
      });

      if (!picture?.base64 || !picture?.uri) {
        throw new Error("The camera did not return a usable picture.");
      }

      setPhoto(picture.uri);

      const data = await identifyLandmark(user?.email, picture.base64);
      setResult(data);
    } catch (err) {
      setError(err.message || "Could not process this image.");
    } finally {
      setLoading(false);
    }
  };

  const permissionDenied =
    permission && !permission.granted && !permission.canAskAgain;

  const openAttraction = (item) => {
    const full = ATTRACTIONS.find(
      (attraction) => String(attraction.id) === String(item.id)
    );

    onSelectAttraction?.({ ...(full || {}), ...item });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Header title="Travel Lens" onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content}>
        {Platform.OS === "web" && (
          <Text style={styles.note}>
            Camera support depends on browser permissions and HTTPS or local
            development.
          </Text>
        )}

        <View style={styles.cameraWrap}>
          {permissionDenied ? (
            <View style={styles.center}>
              <Text style={styles.note}>
                Camera permission was denied. Enable it in your device
                settings to use Travel Lens.
              </Text>
            </View>
          ) : permission?.granted ? (
            <CameraView
              ref={cameraRef}
              style={styles.camera}
              facing="back"
            />
          ) : (
            <View style={styles.center}>
              <Text style={styles.note}>
                Travel Lens needs camera access to capture a landmark image.
              </Text>
              <Pressable
                onPress={requestPermission}
                style={styles.primary}
              >
                <Text style={styles.primaryText}>Allow camera</Text>
              </Pressable>
            </View>
          )}
        </View>

        <Pressable
          disabled={loading || !permission?.granted}
          onPress={capture}
          style={[
            styles.primary,
            (!permission?.granted || loading) && styles.disabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.ivory} />
          ) : (
            <Text style={styles.primaryText}>Capture landmark</Text>
          )}
        </Pressable>

        {photo && (
          <Image
            source={{ uri: photo }}
            style={styles.preview}
            resizeMode="cover"
          />
        )}

        {!!error && <Text style={styles.error}>{error}</Text>}

        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>
              {result.status === "identified"
                ? "Identified landmark"
                : "Recognition result"}
            </Text>

            {result.match ? (
              <>
                <Text style={styles.title}>{result.match.name}</Text>
                <Text style={styles.meta}>{result.match.location}</Text>
                <Text style={styles.body}>{result.match.description}</Text>

                {(result.match.facts || []).map((fact, index) => (
                  <Text key={`${index}-${fact}`} style={styles.fact}>
                    • {fact}
                  </Text>
                ))}

                {!!result.match.visitorInfo && (
                  <Text style={styles.visitor}>
                    {result.match.visitorInfo}
                  </Text>
                )}

                <Text style={styles.confidence}>
                  Confidence: {Math.round((result.confidence || 0) * 100)}%
                </Text>

                <Pressable
                  onPress={() => openAttraction(result.match)}
                  style={styles.secondary}
                >
                  <Text style={styles.secondaryText}>Open attraction</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.body}>
                  {result.message || "No matching landmark was found."}
                </Text>

                {(result.possibleMatches || []).map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => openAttraction(item)}
                    style={styles.matchRow}
                  >
                    <Text style={styles.matchName}>{item.name}</Text>
                    <Text style={styles.meta}>{item.location}</Text>
                  </Pressable>
                ))}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  content: { padding: 16, gap: 14 },
  cameraWrap: {
    height: 360,
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: colors.charcoal,
  },
  camera: { flex: 1 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    gap: 12,
  },
  note: {
    color: colors.charcoal,
    opacity: 0.68,
    textAlign: "center",
    lineHeight: 20,
  },
  primary: {
    minHeight: 48,
    borderRadius: 15,
    backgroundColor: colors.terra,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  disabled: { opacity: 0.55 },
  primaryText: { color: colors.ivory, fontFamily: fonts.bodyBold },
  preview: { height: 170, borderRadius: 18 },
  error: { color: colors.terra, fontFamily: fonts.bodySemiBold },
  resultCard: {
    gap: 9,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.ivory,
  },
  resultLabel: {
    color: colors.sky,
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: { color: colors.charcoal, fontFamily: fonts.display, fontSize: 24 },
  meta: { color: colors.charcoal, opacity: 0.56, fontSize: 12 },
  body: { color: colors.charcoal, opacity: 0.74, lineHeight: 20 },
  fact: { color: colors.charcoal, opacity: 0.78, lineHeight: 20 },
  visitor: {
    color: colors.savanna,
    fontFamily: fonts.bodySemiBold,
    lineHeight: 20,
  },
  confidence: { color: colors.charcoal, opacity: 0.55, fontSize: 12 },
  secondary: {
    padding: 12,
    borderRadius: 13,
    backgroundColor: colors.savanna,
    alignItems: "center",
  },
  secondaryText: { color: colors.ivory, fontFamily: fonts.bodyBold },
  matchRow: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.sand,
  },
  matchName: { color: colors.charcoal, fontFamily: fonts.bodyBold },
});
