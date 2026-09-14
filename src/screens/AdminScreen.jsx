import React, { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fonts } from "../theme/theme";
import { IconBack } from "../components/Icons";
import { deleteAdminUser, fetchAdminUsers, updateAdminUser } from "../services/placesService";

export default function AdminScreen({ adminEmail, onBack }) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [confirmingEmail, setConfirmingEmail] = useState("");
  const [deletingEmail, setDeletingEmail] = useState("");

  const load = async () => {
    try {
      const result = await fetchAdminUsers(adminEmail);
      setUsers(result.users || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Unable to load users.");
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (user) => {
    setDeletingEmail(user.email);
    setError("");
    try {
      await deleteAdminUser(adminEmail, user.email);
      setUsers((currentUsers) => currentUsers.filter((entry) => entry.email !== user.email));
      setConfirmingEmail("");
    } catch (requestError) {
      setError(requestError.message || "Unable to delete this user.");
    } finally {
      setDeletingEmail("");
    }
  };

  const save = async () => {
    await updateAdminUser(adminEmail, editing.email, editing);
    setEditing(null);
    load();
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable onPress={onBack} style={styles.back}><IconBack color={colors.sand} /></Pressable>
        <Text style={styles.eyebrow}>Administration</Text>
        <Text style={styles.title}>User directory</Text>
        <Text style={styles.subtitle}>{users.length} registered user{users.length === 1 ? "" : "s"}</Text>
      </SafeAreaView>
      <ScrollView contentContainerStyle={styles.content}>
        {!!error && <Text style={styles.error}>{error}</Text>}
        {users.map((user) => editing?.email === user.email ? (
          <View key={user.email} style={styles.card}>
            <Text style={styles.email}>{user.email}</Text>
            <TextInput value={editing.firstName} onChangeText={(value) => setEditing({ ...editing, firstName: value })} style={styles.input} placeholder="First name" />
            <TextInput value={editing.lastName} onChangeText={(value) => setEditing({ ...editing, lastName: value })} style={styles.input} placeholder="Surname" />
            <TextInput value={editing.nationality} onChangeText={(value) => setEditing({ ...editing, nationality: value })} style={styles.input} placeholder="Nationality" />
            <View style={styles.actions}><Pressable onPress={save} style={styles.primary}><Text style={styles.primaryText}>Save</Text></Pressable><Pressable onPress={() => setEditing(null)} style={styles.cancel}><Text>Cancel</Text></Pressable></View>
          </View>
        ) : (
          <View key={user.email} style={styles.card}>
            <View style={styles.cardTop}><View><Text style={styles.name}>{user.firstName} {user.lastName}</Text><Text style={styles.email}>{user.email}</Text></View><Text style={styles.planCount}>{(user.dayPlan || []).length} plan item{(user.dayPlan || []).length === 1 ? "" : "s"}</Text></View>
            <Text style={styles.detail}>Nationality: {user.nationality}</Text>
            <Text style={styles.detail}>Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}</Text>
            <Text style={styles.planTitle}>Day plan</Text>
            {(user.dayPlan || []).length === 0 ? <Text style={styles.detail}>No saved items.</Text> : user.dayPlan.map((entry) => <Text key={entry.attractionId} style={styles.planItem}>{entry.attractionName || entry.attractionId}</Text>)}
            <View style={styles.actions}>
              <Pressable onPress={() => setEditing({ ...user })} style={styles.secondary}><Text style={styles.secondaryText}>Edit user</Text></Pressable>
              {confirmingEmail === user.email ? (
                <View style={styles.confirmActions}>
                  <Text style={styles.confirmText}>Delete user and all saved data?</Text>
                  <Pressable onPress={() => remove(user)} disabled={deletingEmail === user.email} style={styles.delete}><Text style={styles.deleteText}>{deletingEmail === user.email ? "Deleting..." : "Confirm delete"}</Text></Pressable>
                  <Pressable onPress={() => setConfirmingEmail("")} disabled={Boolean(deletingEmail)} style={styles.cancel}><Text>Cancel</Text></Pressable>
                </View>
              ) : (
                <Pressable onPress={() => setConfirmingEmail(user.email)} style={styles.delete}><Text style={styles.deleteText}>Delete</Text></Pressable>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand }, header: { backgroundColor: colors.savanna, paddingHorizontal: 20, paddingBottom: 26 }, back: { width: 36, height: 36, alignItems: "center", justifyContent: "center", marginBottom: 12 }, eyebrow: { fontSize: 10, fontFamily: fonts.bodySemiBold, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(232,220,196,0.6)" }, title: { fontSize: 25, fontFamily: fonts.display, color: colors.ivory, marginTop: 4 }, subtitle: { color: colors.sand, opacity: 0.75, marginTop: 5 }, content: { padding: 16, gap: 12 }, card: { backgroundColor: colors.ivory, borderRadius: 16, padding: 16, gap: 8 }, cardTop: { flexDirection: "row", justifyContent: "space-between", gap: 10 }, name: { fontFamily: fonts.display, fontSize: 17, color: colors.charcoal }, email: { fontSize: 12, color: colors.charcoal, opacity: 0.55 }, planCount: { color: colors.sky, fontFamily: fonts.bodySemiBold, fontSize: 11 }, detail: { fontSize: 12, color: colors.charcoal, opacity: 0.7 }, planTitle: { color: colors.savanna, fontFamily: fonts.bodyBold, fontSize: 11, textTransform: "uppercase", marginTop: 4 }, planItem: { fontSize: 12, color: colors.charcoal, paddingLeft: 8 }, actions: { flexDirection: "row", gap: 8, marginTop: 6, alignItems: "center" }, confirmActions: { flex: 1, gap: 4 }, confirmText: { color: colors.terra, fontSize: 11, fontFamily: fonts.bodySemiBold }, primary: { flex: 1, backgroundColor: colors.terra, padding: 11, borderRadius: 12, alignItems: "center" }, primaryText: { color: colors.ivory, fontFamily: fonts.bodyBold }, secondary: { flex: 1, borderWidth: 1, borderColor: colors.savanna, padding: 10, borderRadius: 12, alignItems: "center" }, secondaryText: { color: colors.savanna, fontFamily: fonts.bodySemiBold, fontSize: 12 }, cancel: { padding: 11, alignItems: "center" }, delete: { padding: 10, alignItems: "center" }, deleteText: { color: colors.terra, fontFamily: fonts.bodySemiBold, fontSize: 12 }, input: { backgroundColor: colors.sand, borderRadius: 10, padding: 11, color: colors.charcoal }, error: { color: colors.terra, textAlign: "center", padding: 10 },
});
