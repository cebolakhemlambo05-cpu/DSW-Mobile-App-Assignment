import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconBack } from "../components/Icons";
import { fetchExpenseGroups, saveExpenseGroups } from "../services/featureService";
import { colors, fonts } from "../theme/theme";
import { fmt } from "../utils/format";
import { getPackingPlanKey } from "../utils/tripTools";

const createGroup = (name = "Trip group", plan = [], tripPlanKey = "") => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  name,
  tripPlanKey,
  members: ["Me"],
  expenses: [],
  settled: [],
  destinations: plan.map((entry) => ({
    attractionName: entry.attractionName,
    accommodationName: entry.accommodation?.name,
    checkInDate: entry.checkInDate,
    checkOutDate: entry.checkOutDate,
  })),
});

function calculate(group) {
  const balances = Object.fromEntries(group.members.map((member) => [member, 0]));
  const shares = Object.fromEntries(group.members.map((member) => [member, 0]));
  group.expenses.forEach((expense) => {
    const amount = Number(expense.amount);
    const customAmounts = expense.customAmounts || {};
    const hasCustomAmounts = Object.keys(customAmounts).length > 0;
    const participants = Array.isArray(expense.splitMembers) && expense.splitMembers.length
      ? expense.splitMembers.filter((member) => group.members.includes(member))
      : group.members;
    balances[expense.paidBy] = (balances[expense.paidBy] || 0) + amount;
    participants.forEach((member) => {
      const share = hasCustomAmounts
        ? Number(customAmounts[member] || 0)
        : amount / participants.length;
      shares[member] += share;
      balances[member] = (balances[member] || 0) - share;
    });
  });

  const debtors = Object.entries(balances)
    .filter(([, balance]) => balance < -0.01)
    .map(([name, balance]) => ({ name, remaining: -balance }));
  const creditors = Object.entries(balances)
    .filter(([, balance]) => balance > 0.01)
    .map(([name, balance]) => ({ name, remaining: balance }));
  const settlements = [];

  debtors.forEach((debtor) => {
    while (debtor.remaining > 0.01 && creditors.length > 0) {
      const creditor = creditors[0];
      const amount = Math.min(debtor.remaining, creditor.remaining);
      settlements.push({ from: debtor.name, to: creditor.name, amount });
      debtor.remaining -= amount;
      creditor.remaining -= amount;
      if (creditor.remaining <= 0.01) creditors.shift();
    }
  });

  return {
    balances,
    shares,
    settlements,
    total: group.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0),
  };
}

const settlementId = ({ from, to, amount }) =>
  `${from}|${to}|${Number(amount).toFixed(2)}`;

export default function ExpenseSplitterScreen({ user, plan = [], onBack, onSessionExpired }) {
  const [groups, setGroups] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [memberName, setMemberName] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("Me");
  const [splitMode, setSplitMode] = useState("equal");
  const [customShares, setCustomShares] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const saveQueue = useRef(Promise.resolve());
  const tripPlan = Array.isArray(plan) ? plan : [];
  const tripHasStay = tripPlan.some((entry) => entry.accommodation?.name);
  const tripPlanKey = getPackingPlanKey(tripPlan);
  const plannedTripTotal = tripPlan.reduce((total, entry) => {
    if (entry.booking?.amount != null) return total + (Number(entry.booking.amount) || 0);
    const rooms = Number(entry.roomQuantity || 1);
    const nights = Number(entry.stayNights || 1);
    const stayTotal = entry.accommodation
      ? Number(entry.accommodationTotal ?? Number(entry.accommodation.price || 0) * rooms * nights) || 0
      : 0;
    const activitiesTotal = (entry.activities || []).reduce(
      (sum, activity) => sum + (Number(activity.price) || 0),
      0
    ) * Number(entry.groupSize || 1);
    return total + stayTotal + activitiesTotal;
  }, 0);
  const plannedPartySize = Math.max(1, ...tripPlan.map((entry) => Number(entry.groupSize) || 1));

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadFailed(false);
    setError("");
    fetchExpenseGroups(user.email)
      .then((data) => {
        if (!active) return;
        const nextGroups = Array.isArray(data.groups)
          ? data.groups.filter((group) => group && typeof group === "object").map((group) => ({
              ...group,
              id: String(group.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
              members: Array.isArray(group.members) && group.members.length ? group.members : ["Me"],
              expenses: Array.isArray(group.expenses) ? group.expenses : [],
              settled: Array.isArray(group.settled) ? group.settled : [],
            }))
          : [];
        setGroups(nextGroups);
        setActiveId(nextGroups[0]?.id || "");
      })
      .catch((loadError) => {
        if (active) {
          if (loadError.code === "SESSION_EXPIRED") onSessionExpired?.();
          setLoadFailed(true);
          setError(loadError.message || "Could not load your expense groups.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user.email, reloadKey, onSessionExpired]);

  const active = groups.find((group) => group.id === activeId) || null;
  const summary = useMemo(() => active ? calculate(active) : null, [active]);

  const persist = async (nextGroups) => {
    setGroups(nextGroups);
    setError("");
    setNotice("");
    setSaving(true);
    saveQueue.current = saveQueue.current
      .catch(() => {})
      .then(() => saveExpenseGroups(user.email, nextGroups))
      .then(() => setNotice("Changes saved to your account."))
      .catch((saveError) => {
        if (saveError.code === "SESSION_EXPIRED") onSessionExpired?.();
        setError(saveError.message || "Changes could not be saved.");
      })
      .finally(() => setSaving(false));
    await saveQueue.current;
  };

  const updateActive = (patch) => {
    if (!active) return;
    void persist(groups.map((group) =>
      group.id === active.id ? { ...group, ...patch } : group
    ));
  };

  const addGroup = () => {
    if (loadFailed) return;
    if (!tripHasStay) {
      setError("Add an attraction and stay to your Day Plan before creating a trip expense group.");
      return;
    }
    const tripAnchor = tripPlan.find((entry) => entry.accommodation?.name) || tripPlan[0];
    const destinationName = tripAnchor?.attractionName;
    const nextGroup = createGroup(
      destinationName ? `Trip: ${destinationName}` : `Trip group ${groups.length + 1}`,
      tripPlan,
      tripPlanKey
    );
    const nextGroups = [...groups, nextGroup];
    setActiveId(nextGroup.id);
    setPaidBy(nextGroup.members[0]);
    void persist(nextGroups);
  };

  const addMember = () => {
    if (!active || loadFailed) return;
    const cleanName = memberName.trim();
    if (!cleanName) return;
    if (active.members.some((name) => name.toLowerCase() === cleanName.toLowerCase())) {
      setError("That member is already in this group.");
      return;
    }
    updateActive({
      members: [...active.members, cleanName],
      expenses: active.expenses.map((expense) => ({
        ...expense,
        splitMembers: Array.isArray(expense.splitMembers)
          ? expense.splitMembers
          : [...active.members],
      })),
    });
    setMemberName("");
  };

  const addExpense = () => {
    if (!active || loadFailed) return;
    const cleanTitle = title.trim();
    const numericAmount = Number(amount);
    if (!cleanTitle) {
      setError("Enter a description for this expense.");
      return;
    }
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }

    let customAmounts;
    if (splitMode === "custom") {
      const values = active.members.map((name) => Number(customShares[name]));
      if (values.some((value) => !Number.isFinite(value) || value < 0)) {
        setError("Enter a valid, non-negative amount for each member.");
        return;
      }
      const customTotal = values.reduce((sum, value) => sum + value, 0);
      if (Math.abs(customTotal - numericAmount) > 0.01) {
        setError("Custom member amounts must add up to the expense total.");
        return;
      }
      customAmounts = Object.fromEntries(
        active.members.map((name) => [name, Number(customShares[name])])
      );
    }

    updateActive({
      expenses: [
        ...active.expenses,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          title: cleanTitle,
          amount: numericAmount,
          paidBy: active.members.includes(paidBy) ? paidBy : active.members[0],
          splitMembers: [...active.members],
          ...(customAmounts ? { customAmounts } : {}),
        },
      ],
    });
    setTitle("");
    setAmount("");
    setCustomShares({});
    setSplitMode("equal");
  };

  const markSettlement = (settlement) => {
    if (!active || loadFailed) return;
    const id = settlementId(settlement);
    const settled = active.settled || [];
    updateActive({
      settled: settled.includes(id)
        ? settled.filter((entry) => entry !== id)
        : [...settled, id],
    });
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.header}>
        <Pressable onPress={onBack} style={styles.back} accessibilityRole="button" accessibilityLabel="Back to attractions">
          <IconBack color={colors.sand} />
        </Pressable>
        <Text style={styles.eyebrow}>TRAVEL TOGETHER</Text>
        <Text style={styles.heading}>Expense splitter</Text>
        <Text style={styles.subtitle}>Track shared costs and see who owes whom.</Text>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!!error && <Text accessibilityRole="alert" style={styles.error}>{error}</Text>}
        {!!notice && <Text style={styles.notice}>{notice}</Text>}
        {saving && <View style={styles.saving}><ActivityIndicator color={colors.savanna} /><Text style={styles.meta}>Saving changes…</Text></View>}

        {loading ? (
          <View style={styles.loading}><ActivityIndicator color={colors.savanna} /><Text style={styles.meta}>Loading your groups…</Text></View>
        ) : loadFailed ? (
          <View style={styles.card}>
            <Text style={styles.title}>Could not load travel groups</Text>
            <Text style={styles.meta}>Your saved groups are protected. Reconnect and retry before making changes.</Text>
            <Pressable onPress={() => setReloadKey((key) => key + 1)} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Retry</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.section}>Trip details from your Day Plan</Text>
              {tripPlan.length === 0 ? (
                <Text style={styles.meta}>Choose an attraction and stay, then save them to your Day Plan to link a new expense group to your trip.</Text>
              ) : tripPlan.map((entry) => (
                <View key={`trip-${entry.attractionId}`} style={styles.tripStop}>
                  <Text style={styles.rowLabel}>{entry.attractionName}</Text>
                  {entry.accommodation?.name
                    ? <Text style={styles.meta}>Stay: {entry.accommodation.name}</Text>
                    : <Text style={styles.meta}>No stay selected yet</Text>}
                  {!!entry.checkInDate && !!entry.checkOutDate && (
                    <Text style={styles.meta}>{entry.checkInDate} to {entry.checkOutDate}</Text>
                  )}
                </View>
              ))}
              <Text style={[styles.section, { marginTop: 6 }]}>Your travel groups</Text>
              <View style={styles.pills}>
                {groups.map((group) => (
                  <Pressable
                    key={group.id}
                    onPress={() => {
                      setActiveId(group.id);
                      setPaidBy(group.members[0] || "Me");
                      setError("");
                    }}
                    accessibilityRole="button"
                    accessibilityState={{ selected: activeId === group.id }}
                  >
                    <Text style={[styles.pill, activeId === group.id && styles.pillActive]}>{group.name}</Text>
                  </Pressable>
                ))}
                <Pressable onPress={addGroup} disabled={!tripHasStay} style={[styles.smallButton, !tripHasStay && styles.buttonDisabled]}>
                  <Text style={styles.smallButtonText}>{tripHasStay ? "+ New group" : "Choose a stay first"}</Text>
                </Pressable>
              </View>
              <View style={styles.budgetBox}>
                <Text style={styles.section}>Day Plan budget estimate</Text>
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Planned trip total</Text>
                  <Text style={styles.rowValue}>{fmt(plannedTripTotal)}</Text>
                </View>
                <Text style={styles.meta}>
                  About {fmt(plannedTripTotal / plannedPartySize)} per traveler from saved stays and activities. This estimate is separate from logged expenses.
                </Text>
              </View>
            </View>

            {active ? (
              <>
                <View style={styles.card}>
                  <Text style={styles.title}>{active.name}</Text>
                  <Text style={styles.meta}>Add everyone sharing costs so each person's split is accurate.</Text>
                  <Text style={styles.section}>Members</Text>
                  <View style={styles.pills}>
                    {active.members.map((name) => <Text key={name} style={styles.pill}>{name}</Text>)}
                  </View>
                  <TextInput
                    value={memberName}
                    onChangeText={setMemberName}
                    placeholder="Add a member's name"
                    placeholderTextColor="rgba(62,50,38,0.42)"
                    style={styles.input}
                    returnKeyType="done"
                    onSubmitEditing={addMember}
                    accessibilityLabel="New member name"
                  />
                  <Pressable onPress={addMember} style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>Add member</Text>
                  </Pressable>
                </View>

                <View style={styles.card}>
                  <Text style={styles.section}>Add an expense</Text>
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Dinner, accommodation, taxi…"
                    placeholderTextColor="rgba(62,50,38,0.42)"
                    style={styles.input}
                    accessibilityLabel="Expense description"
                  />
                  <TextInput
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="Amount in ZAR"
                    placeholderTextColor="rgba(62,50,38,0.42)"
                    style={styles.input}
                    keyboardType="decimal-pad"
                    accessibilityLabel="Expense amount in rand"
                  />
                  <Text style={styles.meta}>Paid by</Text>
                  <View style={styles.pills}>
                    {active.members.map((name) => (
                      <Pressable key={name} onPress={() => setPaidBy(name)} accessibilityRole="button" accessibilityState={{ selected: paidBy === name }}>
                        <Text style={[styles.pill, paidBy === name && styles.pillActive]}>{name}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={styles.meta}>Split method</Text>
                  <View style={styles.pills}>
                    {["equal", "custom"].map((mode) => (
                      <Pressable key={mode} onPress={() => setSplitMode(mode)} accessibilityRole="button" accessibilityState={{ selected: splitMode === mode }}>
                        <Text style={[styles.pill, splitMode === mode && styles.pillActive]}>
                          {mode === "equal" ? "Split equally" : "Set each share"}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  {splitMode === "custom" && active.members.map((name) => (
                    <TextInput
                      key={name}
                      value={customShares[name] ?? ""}
                      onChangeText={(value) => setCustomShares((previous) => ({ ...previous, [name]: value }))}
                      placeholder={`${name}'s share in ZAR`}
                      placeholderTextColor="rgba(62,50,38,0.42)"
                      style={styles.input}
                      keyboardType="decimal-pad"
                      accessibilityLabel={`${name}'s expense share`}
                    />
                  ))}
                  <Pressable onPress={addExpense} style={styles.primaryButton}>
                    <Text style={styles.primaryButtonText}>Add expense</Text>
                  </Pressable>
                </View>

                <View style={styles.card}>
                  <Text style={styles.section}>Trip summary</Text>
                  <Text style={styles.total}>{fmt(summary.total)}</Text>
                  <Text style={styles.meta}>Total shared expenses logged</Text>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Average per member</Text>
                    <Text style={styles.rowValue}>{fmt(summary.total / Math.max(1, active.members.length))}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>My share (Me)</Text>
                    <Text style={styles.rowValue}>{fmt(summary.shares.Me || 0)}</Text>
                  </View>
                  {Object.entries(summary.balances).map(([name, balance]) => (
                    <View key={name} style={styles.row}>
                      <Text style={styles.rowLabel}>{name}</Text>
                      <Text style={[styles.rowValue, { color: balance >= 0 ? colors.savanna : colors.terra }]}>
                        {balance > 0.01 ? `Gets back ${fmt(balance)}` : balance < -0.01 ? `Owes ${fmt(-balance)}` : "Even"}
                      </Text>
                    </View>
                  ))}
                  <Text style={styles.section}>Suggested settlements</Text>
                  {summary.settlements.length === 0 ? (
                    <Text style={styles.meta}>Everyone is even.</Text>
                  ) : summary.settlements.map((settlement) => {
                    const id = settlementId(settlement);
                    const settled = (active.settled || []).includes(id);
                    return (
                      <Pressable
                        key={id}
                        onPress={() => markSettlement(settlement)}
                        style={[styles.settlement, settled && styles.settlementDone]}
                        accessibilityRole="button"
                        accessibilityLabel={`${settled ? "Unmark" : "Mark"} ${settlement.from} paying ${settlement.to} as settled`}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rowLabel}>{settlement.from} pays {settlement.to}</Text>
                          <Text style={styles.meta}>{settled ? "Marked settled" : "Tap when paid"}</Text>
                        </View>
                        <Text style={styles.rowValue}>{fmt(settlement.amount)}</Text>
                      </Pressable>
                    );
                  })}
                  {active.expenses.length > 0 && (
                    <>
                      <Text style={styles.section}>Expenses</Text>
                      {active.expenses.map((entry) => (
                        <View key={entry.id} style={styles.row}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.rowLabel}>{entry.title}</Text>
                            <Text style={styles.meta}>Paid by {entry.paidBy}</Text>
                          </View>
                          <Text style={styles.rowValue}>{fmt(entry.amount)}</Text>
                        </View>
                      ))}
                    </>
                  )}
                </View>
              </>
            ) : (
              <View style={styles.card}>
                <Text style={styles.title}>Start a travel group</Text>
                <Text style={styles.meta}>Choose an attraction and accommodation, save it to your Day Plan, then create a group to split costs for that trip.</Text>
                <Pressable onPress={addGroup} disabled={!tripHasStay} style={[styles.primaryButton, !tripHasStay && styles.buttonDisabled]}>
                  <Text style={styles.primaryButtonText}>{tripHasStay ? "Create travel group" : "Add a stay to your Day Plan first"}</Text>
                </Pressable>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  header: { backgroundColor: colors.savanna, paddingHorizontal: 20, paddingBottom: 18 },
  back: { width: 38, height: 38, justifyContent: "center", marginBottom: 8 },
  eyebrow: { color: colors.sand, opacity: 0.7, fontSize: 10, fontFamily: fonts.bodySemiBold, letterSpacing: 1.2 },
  heading: { color: colors.ivory, fontSize: 25, fontFamily: fonts.display },
  subtitle: { color: colors.sand, opacity: 0.82, fontSize: 12, marginTop: 4 },
  content: { padding: 16, gap: 12, paddingBottom: 32 },
  card: { padding: 16, borderRadius: 18, backgroundColor: colors.ivory, gap: 11 },
  title: { fontFamily: fonts.display, fontSize: 22, color: colors.charcoal },
  section: { fontFamily: fonts.bodyBold, color: colors.sky, textTransform: "uppercase", fontSize: 11, letterSpacing: 0.7, marginTop: 3 },
  meta: { color: colors.charcoal, opacity: 0.6, fontSize: 12, lineHeight: 18 },
  pills: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  pill: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 999, overflow: "hidden", backgroundColor: colors.sand, color: colors.charcoal, fontFamily: fonts.bodyMedium, fontSize: 12 },
  pillActive: { backgroundColor: colors.savanna, color: colors.ivory },
  input: { minHeight: 46, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "rgba(62,50,38,0.14)", backgroundColor: colors.ivory, color: colors.charcoal, fontFamily: fonts.body, fontSize: 14 },
  primaryButton: { minHeight: 48, paddingHorizontal: 14, borderRadius: 14, backgroundColor: colors.savanna, alignItems: "center", justifyContent: "center" },
  primaryButtonText: { color: colors.ivory, fontFamily: fonts.bodyBold },
  secondaryButton: { minHeight: 44, padding: 11, borderRadius: 13, backgroundColor: colors.sand, alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { color: colors.charcoal, fontFamily: fonts.bodySemiBold },
  smallButton: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 999, backgroundColor: colors.terra },
  buttonDisabled: { opacity: 0.5 },
  smallButtonText: { color: colors.ivory, fontFamily: fonts.bodyBold, fontSize: 12 },
  total: { fontFamily: fonts.display, color: colors.savanna, fontSize: 32 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, paddingVertical: 5 },
  rowLabel: { color: colors.charcoal, fontFamily: fonts.bodySemiBold, fontSize: 13 },
  rowValue: { color: colors.charcoal, fontFamily: fonts.bodyBold, fontSize: 13 },
  settlement: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, padding: 12, borderRadius: 12, backgroundColor: colors.sand },
  settlementDone: { backgroundColor: "#E5EBDD" },
  tripStop: { gap: 3, paddingVertical: 6, borderTopWidth: 1, borderTopColor: "rgba(62,50,38,0.08)" },
  budgetBox: { gap: 7, marginTop: 6, padding: 12, borderRadius: 12, backgroundColor: colors.sand },
  loading: { alignItems: "center", gap: 10, padding: 24 },
  saving: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-end" },
  error: { padding: 12, borderRadius: 10, backgroundColor: "#FCE7E3", color: "#9B3328", fontSize: 12, lineHeight: 18 },
  notice: { color: colors.savanna, fontSize: 12, lineHeight: 18 },
});
