import React, { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, fonts } from "../theme/theme";

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromIsoDate(value) {
  const [year, month, day] = String(value || "").split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : new Date();
}

export default function CheckInDatePicker({ visible, selectedDate, onSelect, onClose }) {
  const [displayMonth, setDisplayMonth] = useState(() => {
    const date = fromIsoDate(selectedDate);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const minimumDate = useMemo(() => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 1);
    return date;
  }, []);

  useEffect(() => {
    if (!visible) return;
    const selected = fromIsoDate(selectedDate);
    const visibleDate = selected < minimumDate ? minimumDate : selected;
    setDisplayMonth(new Date(visibleDate.getFullYear(), visibleDate.getMonth(), 1));
  }, [visible, selectedDate, minimumDate]);

  const year = displayMonth.getFullYear();
  const month = displayMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (cells.length % 7) cells.push(null);
  const minimumMonth = new Date(minimumDate.getFullYear(), minimumDate.getMonth(), 1);
  const canGoPrevious = displayMonth > minimumMonth;
  const monthLabel = displayMonth.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close date picker" />
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>YOUR STAY</Text>
              <Text style={styles.title}>Choose check-in</Text>
            </View>
            <Pressable onPress={onClose} accessibilityLabel="Close date picker" style={styles.closeButton}>
              <Text style={styles.closeText}>×</Text>
            </Pressable>
          </View>
          <View style={styles.monthRow}>
            <Pressable
              disabled={!canGoPrevious}
              onPress={() => setDisplayMonth(new Date(year, month - 1, 1))}
              accessibilityLabel="Previous month"
              style={[styles.monthArrow, !canGoPrevious && styles.disabled]}
            ><Text style={styles.arrowText}>‹</Text></Pressable>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <Pressable
              onPress={() => setDisplayMonth(new Date(year, month + 1, 1))}
              accessibilityLabel="Next month"
              style={styles.monthArrow}
            ><Text style={styles.arrowText}>›</Text></Pressable>
          </View>
          <View style={styles.calendarGrid}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <Text key={day} style={styles.weekday}>{day}</Text>
            ))}
            {cells.map((day, index) => {
              if (!day) return <View key={`blank-${index}`} style={styles.dayCell} />;
              const date = new Date(year, month, day);
              const isoDate = toIsoDate(date);
              const disabled = date < minimumDate;
              const selected = isoDate === selectedDate;
              return (
                <Pressable
                  key={isoDate}
                  disabled={disabled}
                  onPress={() => { onSelect(isoDate); onClose(); }}
                  accessibilityRole="button"
                  accessibilityLabel={`${date.toLocaleDateString("en-ZA", { dateStyle: "full" })}${selected ? ", selected" : ""}`}
                  style={[styles.dayCell, styles.dayButton, selected && styles.daySelected, disabled && styles.disabled]}
                >
                  <Text style={[styles.dayText, selected && styles.daySelectedText, disabled && styles.dayDisabledText]}>{day}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.hint}>Check-in dates start from tomorrow.</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "center", padding: 20, backgroundColor: "rgba(20,24,21,0.62)" },
  card: { borderRadius: 20, backgroundColor: colors.sand, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingVertical: 15, backgroundColor: colors.savanna },
  eyebrow: { color: colors.sand, fontSize: 9, fontFamily: fonts.bodySemiBold, letterSpacing: 1.2 },
  title: { marginTop: 3, color: colors.ivory, fontSize: 20, fontFamily: fonts.display },
  closeButton: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.14)" },
  closeText: { color: colors.ivory, fontSize: 25, lineHeight: 28 },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12 },
  monthArrow: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: colors.ivory },
  arrowText: { color: colors.savanna, fontSize: 26, lineHeight: 28 },
  monthLabel: { color: colors.charcoal, fontFamily: fonts.bodySemiBold, fontSize: 16 },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12 },
  weekday: { width: `${100 / 7}%`, textAlign: "center", color: colors.charcoal, opacity: 0.52, fontSize: 11, fontFamily: fonts.bodySemiBold, paddingVertical: 8 },
  dayCell: { width: `${100 / 7}%`, height: 42, alignItems: "center", justifyContent: "center" },
  dayButton: { borderRadius: 21 },
  daySelected: { backgroundColor: colors.terra },
  dayText: { color: colors.charcoal, fontSize: 13 },
  daySelectedText: { color: colors.ivory, fontFamily: fonts.bodySemiBold },
  dayDisabledText: { color: "#A9A193" },
  disabled: { opacity: 0.38 },
  hint: { textAlign: "center", color: colors.charcoal, opacity: 0.55, fontSize: 11, paddingHorizontal: 16, paddingTop: 6, paddingBottom: 16 },
});
