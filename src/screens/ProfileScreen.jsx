import React, { useState } from "react";
import { View, Text, Pressable, Alert, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Field from "../components/Field";
import { Header } from "./PrivacyScreen";
import { colors, fonts } from "../theme/theme";

export default function ProfileScreen({ user, onBack, onAdmin, onSave, onDelete }) {
  const [profile, setProfile] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    nationality: user?.nationality || "",
  });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onSave(profile);
      onBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Header title="Profile" onBack={onBack} />
      <View style={styles.content}>
        <Text style={styles.email}>{user?.email}</Text>
        <Field label="First name" value={profile.firstName} onChangeText={(firstName) => setProfile((p) => ({ ...p, firstName }))} />
        <Field label="Last name" value={profile.lastName} onChangeText={(lastName) => setProfile((p) => ({ ...p, lastName }))} />
        <Field label="Nationality" value={profile.nationality} onChangeText={(nationality) => setProfile((p) => ({ ...p, nationality }))} />
        <Pressable onPress={save} style={styles.primary}><Text style={styles.primaryText}>{saving ? "Saving..." : "Save profile"}</Text></Pressable>
        {user?.isAdmin && <Pressable onPress={onAdmin} style={styles.secondary}><Text style={styles.secondaryText}>Admin dashboard</Text></Pressable>}
        <Pressable
          onPress={() => Alert.alert("Delete account", "This removes your account from the local app data store.", [{ text: "Cancel" }, { text: "Delete", style: "destructive", onPress: onDelete }])}
        >
          <Text style={styles.deleteText}>Delete account</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  content: { padding: 20, gap: 14 },
  email: { color: colors.charcoal, opacity: 0.62 },
  primary: { padding: 14, borderRadius: 14, backgroundColor: colors.savanna, alignItems: "center" },
  primaryText: { color: colors.ivory, fontFamily: fonts.bodyBold },
  secondary: { padding: 14, borderRadius: 14, backgroundColor: colors.ivory, alignItems: "center" },
  secondaryText: { color: colors.charcoal, fontFamily: fonts.bodyBold },
  deleteText: { textAlign: "center", color: colors.terra, fontFamily: fonts.bodySemiBold, marginTop: 12 },
});
