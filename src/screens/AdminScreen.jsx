import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "./PrivacyScreen";
import { listAdminUsers } from "../services/placesService";
import { colors, fonts } from "../theme/theme";

export default function AdminScreen({ adminEmail, onBack }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    listAdminUsers(adminEmail).then((data) => setUsers(data.users || [])).catch((err) => setError(err.message));
  }, [adminEmail]);

  return (
    <SafeAreaView style={styles.screen}>
      <Header title="Admin" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        {!!error && <Text style={styles.error}>{error}</Text>}
        {users.map((user) => (
          <View key={user.email} style={styles.card}>
            <Text style={styles.name}>{user.firstName} {user.lastName}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <Text style={styles.email}>{user.dayPlan?.length || 0} planned stops</Text>
          </View>
        ))}
        <Pressable onPress={onBack} style={styles.primary}><Text style={styles.primaryText}>Sign out admin</Text></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  content: { padding: 16, gap: 10 },
  card: { padding: 14, borderRadius: 14, backgroundColor: colors.ivory },
  name: { fontFamily: fonts.bodyBold, color: colors.charcoal },
  email: { color: colors.charcoal, opacity: 0.62, marginTop: 2 },
  error: { color: colors.terra },
  primary: { padding: 14, borderRadius: 14, backgroundColor: colors.savanna, alignItems: "center", marginTop: 10 },
  primaryText: { color: colors.ivory, fontFamily: fonts.bodyBold },
});
