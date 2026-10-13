import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Field from "../components/Field";
import { Header } from "./PrivacyScreen";
import { fetchExpenseGroups, saveExpenseGroups } from "../services/featureService";
import { colors, fonts } from "../theme/theme";
import { fmt } from "../utils/format";

const blankGroup = (name = "Trip group") => ({ id: String(Date.now()), name, members: ["Me"], expenses: [], settled: [] });

function calculate(group) {
  const balances = Object.fromEntries(group.members.map((m) => [m, 0]));
  group.expenses.forEach((expense) => {
    const amount = Number(expense.amount || 0);
    balances[expense.paidBy] = (balances[expense.paidBy] || 0) + amount;
    const custom = expense.customAmounts || {};
    const hasCustom = Object.keys(custom).length > 0;
    group.members.forEach((member) => {
      const share = hasCustom ? Number(custom[member] || 0) : amount / group.members.length;
      balances[member] = (balances[member] || 0) - share;
    });
  });
  const debtors = Object.entries(balances).filter(([, v]) => v < -0.01).map(([name, value]) => ({ name, value: -value }));
  const creditors = Object.entries(balances).filter(([, v]) => v > 0.01).map(([name, value]) => ({ name, value }));
  const settlements = [];
  debtors.forEach((debtor) => {
    while (debtor.value > 0.01 && creditors.length) {
      const creditor = creditors[0];
      const amount = Math.min(debtor.value, creditor.value);
      settlements.push({ from: debtor.name, to: creditor.name, amount });
      debtor.value -= amount;
      creditor.value -= amount;
      if (creditor.value <= 0.01) creditors.shift();
    }
  });
  return { balances, settlements, total: group.expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0) };
}

export default function ExpenseSplitterScreen({ user, onBack }) {
  const [groups, setGroups] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [member, setMember] = useState("");
  const [expense, setExpense] = useState({ title: "", amount: "", paidBy: "Me", category: "Food" });
  const [splitMode, setSplitMode] = useState("equal");
  const [customShares, setCustomShares] = useState({});

  useEffect(() => {
    fetchExpenseGroups(user.email).then((data) => {
      const next = data.groups?.length ? data.groups : [blankGroup(`${user.firstName || "My"} trip`)];
      setGroups(next);
      setActiveId(next[0].id);
    });
  }, [user.email, user.firstName]);

  const active = groups.find((g) => g.id === activeId) || groups[0] || blankGroup();
  const summary = useMemo(() => calculate(active), [active]);
  const persist = (next) => {
    setGroups(next);
    saveExpenseGroups(user.email, next).catch(console.error);
  };
  const updateActive = (patch) => persist(groups.map((g) => (g.id === active.id ? { ...g, ...patch } : g)));

  const addMember = () => {
    const name = member.trim();
    if (!name || active.members.includes(name)) return;
    updateActive({ members: [...active.members, name] });
    setMember("");
  };

  const addExpense = () => {
    const amount = Number(expense.amount);
    if (!expense.title.trim() || !Number.isFinite(amount) || amount <= 0) return;
    const customAmounts = splitMode === "custom"
      ? Object.fromEntries(
          active.members.map((name) => [name, Number(customShares[name] || 0)])
        )
      : undefined;
    if (splitMode === "custom") {
      const customTotal = Object.values(customAmounts).reduce((sum, value) => sum + value, 0);
      if (Math.abs(customTotal - amount) > 0.01) {
        Alert.alert("Custom split", "Custom member amounts must add up to the expense total.");
        return;
      }
    }
    updateActive({ expenses: [...active.expenses, { ...expense, id: String(Date.now()), amount, customAmounts }] });
    setExpense({ title: "", amount: "", paidBy: active.members[0], category: "Food" });
    setCustomShares({});
    setSplitMode("equal");
  };

  return (
    <SafeAreaView style={styles.screen}>
      <Header title="Expenses" onBack={onBack} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{active.name}</Text>
          <Text style={styles.meta}>Saved to {user.email}. Only this signed-in account can load these groups.</Text>
          <Pressable onPress={() => {
            const next = [...groups, blankGroup(`Trip group ${groups.length + 1}`)];
            persist(next);
            setActiveId(next[next.length - 1].id);
          }} style={styles.smallBtn}><Text style={styles.smallBtnText}>Create travel group</Text></Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Members</Text>
          <View style={styles.pills}>{active.members.map((m) => <Text key={m} style={styles.pill}>{m}</Text>)}</View>
          <Field placeholder="Add member name" value={member} onChangeText={setMember} />
          <Pressable onPress={addMember} style={styles.primary}><Text style={styles.primaryText}>Add member</Text></Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>New expense</Text>
          <Field placeholder="Accommodation, dinner, taxi..." value={expense.title} onChangeText={(title) => setExpense((e) => ({ ...e, title }))} />
          <Field placeholder="Amount in ZAR" value={String(expense.amount)} onChangeText={(amount) => setExpense((e) => ({ ...e, amount }))} keyboardType="numeric" />
          <Text style={styles.meta}>Paid by</Text>
          <View style={styles.pills}>{active.members.map((m) => (
            <Pressable key={m} onPress={() => setExpense((e) => ({ ...e, paidBy: m }))}>
              <Text style={[styles.pill, expense.paidBy === m && styles.pillActive]}>{m}</Text>
            </Pressable>
          ))}</View>
          <Text style={styles.meta}>Split method</Text>
          <View style={styles.pills}>
            {["equal", "custom"].map((mode) => (
              <Pressable key={mode} onPress={() => setSplitMode(mode)}>
                <Text style={[styles.pill, splitMode === mode && styles.pillActive]}>
                  {mode === "equal" ? "Equal" : "Custom amounts"}
                </Text>
              </Pressable>
            ))}
          </View>
          {splitMode === "custom" && active.members.map((name) => (
            <Field
              key={name}
              label={`${name} share`}
              placeholder="0"
              value={String(customShares[name] || "")}
              onChangeText={(value) => setCustomShares((prev) => ({ ...prev, [name]: value }))}
              keyboardType="numeric"
            />
          ))}
          <Pressable onPress={addExpense} style={styles.primary}><Text style={styles.primaryText}>Add expense</Text></Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.section}>Summary</Text>
          <Text style={styles.total}>{fmt(summary.total)}</Text>
          {Object.entries(summary.balances).map(([name, value]) => (
            <View key={name} style={styles.row}><Text style={styles.rowLabel}>{name}</Text><Text style={[styles.rowValue, { color: value >= 0 ? colors.savanna : colors.terra }]}>{fmt(value)}</Text></View>
          ))}
          <Text style={styles.section}>Simplified settlements</Text>
          {summary.settlements.length === 0 ? <Text style={styles.meta}>Everyone is even.</Text> : summary.settlements.map((s, index) => (
            <Pressable key={`${s.from}-${s.to}-${index}`} onPress={() => Alert.alert("Mark settled", `${s.from} paid ${s.to}?`, [{ text: "Cancel" }, { text: "Settled", onPress: () => updateActive({ settled: [...(active.settled || []), s] }) }])} style={styles.settlement}>
              <Text style={styles.rowLabel}>{s.from} pays {s.to}</Text>
              <Text style={styles.rowValue}>{fmt(s.amount)}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.sand },
  content: { padding: 16, gap: 12 },
  card: { padding: 16, borderRadius: 18, backgroundColor: colors.ivory, gap: 10 },
  title: { fontFamily: fonts.display, fontSize: 24, color: colors.charcoal },
  section: { fontFamily: fonts.bodyBold, color: colors.sky, textTransform: "uppercase", fontSize: 11, letterSpacing: 0.7 },
  meta: { color: colors.charcoal, opacity: 0.58, fontSize: 12, lineHeight: 18 },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: colors.sand, color: colors.charcoal, overflow: "hidden" },
  pillActive: { backgroundColor: colors.savanna, color: colors.ivory },
  primary: { padding: 13, borderRadius: 14, backgroundColor: colors.savanna, alignItems: "center" },
  primaryText: { color: colors.ivory, fontFamily: fonts.bodyBold },
  smallBtn: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.terra },
  smallBtnText: { color: colors.ivory, fontFamily: fonts.bodyBold, fontSize: 12 },
  total: { fontFamily: fonts.display, color: colors.savanna, fontSize: 32 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  settlement: { flexDirection: "row", justifyContent: "space-between", padding: 12, borderRadius: 12, backgroundColor: colors.sand },
  rowLabel: { color: colors.charcoal, fontFamily: fonts.bodySemiBold },
  rowValue: { color: colors.charcoal, fontFamily: fonts.bodyBold },
});
