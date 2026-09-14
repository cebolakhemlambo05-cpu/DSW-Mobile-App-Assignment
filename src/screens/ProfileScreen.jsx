import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/theme";
import { IconBack } from "../components/Icons";

export default function ProfileScreen({ user, onBack, onAdmin, onSave, onDelete }) {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [nationality, setNationality] = useState(user.nationality || "");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onSave({ firstName, lastName, nationality });
      setMessage("Profile updated.");
    } catch (error) {
      setMessage(error.message || "Unable to update your profile.");
    } finally {
      setSaving(false);
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
        <View style={styles.identity}>
          <Text style={styles.avatar}>{(user.firstName || "U").slice(0, 1).toUpperCase()}</Text>
          <View><Text style={styles.name}>{user.firstName} {user.lastName}</Text><Text style={styles.email}>{user.email}</Text></View>
        </View>
        <Text style={styles.sectionTitle}>Personal details</Text>
        <Field label="First name" value={firstName} onChangeText={setFirstName} />
        <Field label="Surname" value={lastName} onChangeText={setLastName} />
        <Field label="Email" value={user.email} editable={false} />
        <Field label="Nationality" value={nationality} onChangeText={setNationality} />
        {!!message && <Text style={styles.message}>{message}</Text>}
        <Pressable onPress={save} disabled={saving} style={styles.primary}><Text style={styles.primaryText}>{saving ? "Saving..." : "Save changes"}</Text></Pressable>
        {user.isAdmin && <Pressable onPress={onAdmin} style={styles.secondary}><Text style={styles.secondaryText}>Open admin dashboard</Text></Pressable>}
        <Pressable onPress={removeAccount} style={styles.delete}><Text style={styles.deleteText}>Delete my account</Text></Pressable>
      </ScrollView>
    </View>
  );
}

function Field({ label, value, onChangeText, editable = true }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChangeText} editable={editable} style={[styles.input, !editable && styles.disabled]} /></View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  header: { backgroundColor: colors.savanna, paddingHorizontal: 20, paddingBottom: 26 },
  back: { width: 36, height: 36, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  eyebrow: { fontSize: 10, fontFamily: fonts.bodySemiBold, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(232,220,196,0.6)" },
  title: { fontSize: 25, fontFamily: fonts.display, color: colors.ivory, marginTop: 4 },
  subtitle: { color: colors.sand, opacity: 0.75, marginTop: 5 },
  content: { padding: 24, gap: 14 },
  identity: { flexDirection: "row", alignItems: "center", gap: 12, paddingBottom: 8 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.terra, color: colors.ivory, textAlign: "center", paddingTop: 12, fontFamily: fonts.display, fontSize: 20 },
  name: { fontFamily: fonts.display, fontSize: 18, color: colors.charcoal },
  email: { fontSize: 12, color: colors.charcoal, opacity: 0.55, marginTop: 3 },
  sectionTitle: { fontFamily: fonts.bodyBold, fontSize: 13, color: colors.savanna, textTransform: "uppercase", letterSpacing: 0.8, marginTop: 8 },
  field: { gap: 6 }, label: { fontSize: 11, fontFamily: fonts.bodySemiBold, textTransform: "uppercase", color: colors.charcoal, opacity: 0.6 },
  input: { backgroundColor: colors.ivory, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: colors.charcoal, fontFamily: fonts.body, borderWidth: 1, borderColor: "rgba(62,50,38,0.12)" },
  disabled: { opacity: 0.55 }, message: { color: colors.savanna, fontSize: 12 },
  primary: { backgroundColor: colors.terra, paddingVertical: 15, borderRadius: 16, alignItems: "center", marginTop: 4 }, primaryText: { color: colors.ivory, fontFamily: fonts.bodyBold },
  secondary: { borderWidth: 1.5, borderColor: colors.savanna, paddingVertical: 14, borderRadius: 16, alignItems: "center" }, secondaryText: { color: colors.savanna, fontFamily: fonts.bodySemiBold },
  delete: { alignItems: "center", padding: 10 }, deleteText: { color: colors.terra, fontFamily: fonts.bodySemiBold, fontSize: 12 },
});
