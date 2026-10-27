import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/theme";
import { IconBack } from "../components/Icons";
import { fetchUserActivity } from "../services/placesService";

export default function ProfileScreen({ user, onBack, onAdmin, onSave, onDelete }) {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [nationality, setNationality] = useState(user.nationality || "");
  const [profilePhoto, setProfilePhoto] = useState(user.profilePhoto || null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [pickingPhoto, setPickingPhoto] = useState(false);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState("");

  useEffect(() => {
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setNationality(user.nationality || "");
    setProfilePhoto(user.profilePhoto || null);
  }, [user.firstName, user.lastName, user.nationality, user.profilePhoto]);

  useEffect(() => {
    let active = true;
    setActivityLoading(true);
    setActivityError("");
    fetchUserActivity(user.email)
      .then((result) => { if (active) setActivity(result.events || []); })
      .catch((error) => { if (active) setActivityError(error.message || "Unable to load activity history."); })
      .finally(() => { if (active) setActivityLoading(false); });
    return () => { active = false; };
  }, [user.email]);

  const reloadActivity = async () => {
    setActivityLoading(true);
    setActivityError("");
    try {
      const result = await fetchUserActivity(user.email);
      setActivity(result.events || []);
    } catch (error) {
      setActivityError(error.message || "Unable to load activity history.");
    } finally {
      setActivityLoading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const result = await onSave({ firstName, lastName, nationality, profilePhoto });
      setMessage(result?.offline
        ? "Saved on this device. Changes will sync when you’re online."
        : "Profile updated.");
    } catch (error) {
      setMessage(error.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
    }
  };

  const savePhoto = async (photo) => {
    setProfilePhoto(photo);
    setSaving(true);
    try {
      const result = await onSave({
        firstName,
        lastName,
        nationality,
        profilePhoto: photo,
      });
      setMessage(result?.offline
        ? "Photo saved on this device. It will sync when you’re online."
        : photo ? "Profile picture saved." : "Profile picture removed.");
    } catch (error) {
      setMessage(error.message || "Unable to save your profile picture.");
    } finally {
      setSaving(false);
    }
  };

  const choosePhoto = async () => {
    setPickingPhoto(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.55,
        base64: true,
      });
      if (result.canceled) return;
      const photo = result.assets?.[0];
      if (!photo?.base64) {
        setMessage("Could not read that image. Please choose another photo.");
        return;
      }
      const dataUrl = `data:image/jpeg;base64,${photo.base64}`;
      if (dataUrl.length > 330_000) {
        setMessage("That photo is too large to sync. Please choose a smaller image.");
        return;
      }
      await savePhoto(dataUrl);
    } catch (error) {
      setMessage(error.message || "Unable to select a photo.");
    } finally {
      setPickingPhoto(false);
    }
  };

  const removeAccount = () => {
    Alert.alert("Delete account", "This permanently removes your account and saved plans.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await onDelete();
          } catch (error) {
            Alert.alert("Unable to delete account", error.message || "Please try again when you are online.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable onPress={onBack} style={styles.back}><IconBack color={colors.sand} /></Pressable>
        <Text style={styles.eyebrow}>Account</Text>
        <Text style={styles.title}>Your profile</Text>
        <Text style={styles.subtitle}>Keep your personal details up to date.</Text>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.form}>
          <View style={styles.identity}>
            <View style={styles.avatarContainer}>
              {profilePhoto ? (
                <Image
                  source={{ uri: profilePhoto }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                  accessibilityLabel={`${user.firstName || "User"} profile picture`}
                />
              ) : (
                <Text style={styles.avatar}>{(user.firstName || "U").slice(0, 1).toUpperCase()}</Text>
              )}
            </View>
            <View style={styles.identityDetails}>
              <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
              <Text style={styles.email}>{user.email}</Text>
            </View>
          </View>
          <View style={styles.photoActions}>
            <Pressable onPress={choosePhoto} disabled={pickingPhoto} style={styles.photoButton}>
              {pickingPhoto
                ? <ActivityIndicator color={colors.ivory} />
                : <Text style={styles.photoButtonText}>
                    {profilePhoto ? "Update profile picture" : "Upload profile picture"}
                  </Text>}
            </Pressable>
            {!!profilePhoto && (
              <Pressable onPress={() => savePhoto(null)} disabled={saving} style={styles.removePhoto}>
                <Text style={styles.removePhotoText}>Remove</Text>
              </Pressable>
            )}
          </View>
          <Text style={styles.sectionTitle}>Personal details</Text>
          <Field label="First name" value={firstName} onChangeText={setFirstName} />
          <Field label="Surname" value={lastName} onChangeText={setLastName} />
          <Field label="Email" value={user.email} editable={false} />
          <Field
            label="Nationality"
            value={nationality}
            onChangeText={setNationality}
            returnKeyType="go"
            blurOnSubmit
            onSubmitEditing={save}
          />
          {!!message && <Text style={styles.message}>{message}</Text>}
          <Pressable onPress={save} disabled={saving} style={styles.primary}><Text style={styles.primaryText}>{saving ? "Saving..." : "Save changes"}</Text></Pressable>
          {user.isAdmin && <Pressable onPress={onAdmin} style={styles.secondary}><Text style={styles.secondaryText}>Open admin dashboard</Text></Pressable>}
          <Pressable onPress={removeAccount} style={styles.delete}><Text style={styles.deleteText}>Delete my account</Text></Pressable>
        </View>
        <View style={styles.activityCard}>
          <View style={styles.activityHeading}>
            <View style={{ flex: 1 }}>
              <Text style={styles.activityTitle}>Activity timeline</Text>
              <Text style={styles.activityIntro}>Account and Day Plan changes recorded for your account.</Text>
            </View>
            <Pressable onPress={reloadActivity} disabled={activityLoading} accessibilityRole="button" accessibilityLabel="Refresh activity history">
              <Text style={styles.refreshText}>{activityLoading ? "Loading" : "Refresh"}</Text>
            </Pressable>
          </View>
          <Text style={styles.activityNote}>This history records sign-up, profile updates, and saved Day Plan changes. Searches, pages viewed, and button taps are not tracked here. Earlier activity may be unavailable if it happened before history tracking began.</Text>
          {activityLoading ? (
            <ActivityIndicator color={colors.terra} style={{ marginVertical: 18 }} />
          ) : activityError ? (
            <Text style={styles.activityError}>{activityError}</Text>
          ) : activity.length === 0 ? (
            <Text style={styles.emptyActivity}>No account activity recorded yet.</Text>
          ) : activity.map((event, index) => (
            <View key={event.id || `${event.action}-${event.occurredAt}-${index}`} style={styles.timelineRow}>
              <View style={styles.timelineMarker}><View style={styles.timelineDot} />{index < activity.length - 1 && <View style={styles.timelineLine} />}</View>
              <View style={styles.timelineContent}>
                <Text style={styles.timelineAction}>{activityTitle(event.action)}</Text>
                <Text style={styles.timelineDetail}>{activityDetail(event)}</Text>
                <Text style={styles.timelineDate}>{formatActivityDate(event.occurredAt)}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function activityTitle(action = "") {
  const labels = {
    "account.registered": "Account created",
    "profile.updated": "Profile updated",
    "plan.saved": "Day Plan saved",
    "account.deleted": "Account deleted",
  };
  return labels[action] || String(action).replace(/[._]/g, " ");
}

function activityDetail(event) {
  if (event.action === "plan.saved" && Number.isFinite(Number(event.metadata?.destinationCount))) {
    const count = Number(event.metadata.destinationCount);
    return `${count} destination${count === 1 ? "" : "s"} in your plan`;
  }
  if (event.action === "profile.updated" && event.metadata?.profilePhotoChanged) {
    return "Personal details or profile picture changed";
  }
  return "Account activity";
}

function formatActivityDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : date.toLocaleString();
}

function Field({ label, value, onChangeText, editable = true }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChangeText} editable={editable} style={[styles.input, !editable && styles.disabled]} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  header: { backgroundColor: colors.savanna, paddingHorizontal: 20, paddingBottom: 26, alignItems: "center" },
  back: { width: 36, height: 36, alignItems: "center", justifyContent: "center", marginBottom: 12, alignSelf: "flex-start" },
  eyebrow: { fontSize: 10, fontFamily: fonts.bodySemiBold, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(232,220,196,0.6)" },
  title: { fontSize: 25, fontFamily: fonts.display, color: colors.ivory, marginTop: 4, textAlign: "center" },
  subtitle: { color: colors.sand, opacity: 0.75, marginTop: 5, textAlign: "center" },
  content: { flexGrow: 1, padding: 24, justifyContent: "center", alignItems: "center" },
  form: { width: "100%", maxWidth: 520, gap: 14 },
  identity: { flexDirection: "column", alignItems: "center", gap: 12, paddingBottom: 8 },
  avatarContainer: { width: 88, height: 88, borderRadius: 44, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: colors.terra },
  avatar: { color: colors.ivory, textAlign: "center", fontFamily: fonts.display, fontSize: 32 },
  avatarImage: { position: "absolute", width: 88, height: 88, borderRadius: 44 },
  identityDetails: { alignItems: "center" },
  photoActions: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, marginTop: -6, flexWrap: "wrap" },
  photoButton: { minHeight: 40, paddingHorizontal: 14, borderRadius: 10, backgroundColor: colors.savanna, alignItems: "center", justifyContent: "center" },
  photoButtonText: { color: colors.ivory, fontFamily: fonts.bodySemiBold, fontSize: 11 },
  removePhoto: { padding: 10 },
  removePhotoText: { color: colors.terra, fontFamily: fonts.bodySemiBold, fontSize: 11 },
  name: { fontFamily: fonts.display, fontSize: 18, color: colors.charcoal },
  email: { fontSize: 12, color: colors.charcoal, opacity: 0.55, marginTop: 3 },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.savanna, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 8, textAlign: "center" },
  field: { gap: 6 }, label: { fontSize: 11, fontFamily: fonts.bodySemiBold, textTransform: "uppercase", color: colors.charcoal, opacity: 0.6 },
  input: { backgroundColor: colors.ivory, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: colors.charcoal, fontFamily: fonts.body, borderWidth: 1, borderColor: "rgba(62,50,38,0.12)" },
  disabled: { opacity: 0.55 }, message: { color: colors.savanna, fontSize: 12 },
  primary: { backgroundColor: colors.terra, paddingVertical: 15, borderRadius: 16, alignItems: "center", marginTop: 4 }, primaryText: { color: colors.ivory, fontFamily: fonts.bodyBold },
  secondary: { borderWidth: 1.5, borderColor: colors.savanna, paddingVertical: 14, borderRadius: 16, alignItems: "center" }, secondaryText: { color: colors.savanna, fontFamily: fonts.bodySemiBold },
  delete: { alignItems: "center", padding: 10 }, deleteText: { color: colors.terra, fontFamily: fonts.bodySemiBold, fontSize: 12 },
  activityCard: { width: "100%", maxWidth: 520, alignSelf: "center", marginTop: 22, padding: 18, borderRadius: 18, backgroundColor: colors.ivory, borderWidth: 1, borderColor: "rgba(62,50,38,0.1)" },
  activityHeading: { flexDirection: "row", alignItems: "center", gap: 12 },
  activityTitle: { color: colors.savanna, fontFamily: fonts.display, fontSize: 19 },
  activityIntro: { color: colors.charcoal, opacity: 0.65, fontSize: 11, lineHeight: 16, marginTop: 3 },
  refreshText: { color: colors.terra, fontFamily: fonts.bodySemiBold, fontSize: 11, padding: 8 },
  activityNote: { color: colors.charcoal, opacity: 0.58, fontSize: 10, lineHeight: 15, marginTop: 13, marginBottom: 5 },
  activityError: { color: colors.terra, fontSize: 12, lineHeight: 17, paddingVertical: 14 },
  emptyActivity: { color: colors.charcoal, opacity: 0.6, fontSize: 12, paddingVertical: 16 },
  timelineRow: { flexDirection: "row", minHeight: 67 },
  timelineMarker: { width: 20, alignItems: "center" },
  timelineDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.terra, marginTop: 5 },
  timelineLine: { width: 1, flex: 1, backgroundColor: "#D9D2C5", marginTop: 4 },
  timelineContent: { flex: 1, paddingLeft: 10, paddingBottom: 13 },
  timelineAction: { color: colors.charcoal, fontFamily: fonts.bodySemiBold, fontSize: 12 },
  timelineDetail: { color: colors.charcoal, opacity: 0.66, fontSize: 10, marginTop: 3 },
  timelineDate: { color: colors.charcoal, opacity: 0.5, fontSize: 9, marginTop: 4 },
});
