import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/theme";
import { IconBack } from "../components/Icons";

export default function ProfileScreen({ user, onBack, onAdmin, onSave, onDelete }) {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [nationality, setNationality] = useState(user.nationality || "");
  const [profilePhoto, setProfilePhoto] = useState(user.profilePhoto || null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [pickingPhoto, setPickingPhoto] = useState(false);

  useEffect(() => {
    setFirstName(user.firstName || "");
    setLastName(user.lastName || "");
    setNationality(user.nationality || "");
    setProfilePhoto(user.profilePhoto || null);
  }, [user.firstName, user.lastName, user.nationality, user.profilePhoto]);

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
      { text: "Delete", style: "destructive", onPress: onDelete },
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
      </ScrollView>
    </View>
  );
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
});
