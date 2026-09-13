import React, { useState } from "react";
import { View, Text, StyleSheet, PanResponder, Animated } from "react-native";
import { colors } from "../constants/colors";

const TRACK_WIDTH = 280;
const MAX = 5000;

export default function BudgetSlider({ value = 1500, onChange }) {
  const [budget, setBudget] = useState(value);
  const pan = useState(new Animated.Value((value / MAX) * TRACK_WIDTH))[0];

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gesture) => {
      let newX = Math.max(0, Math.min(TRACK_WIDTH, gesture.moveX - 40));
      pan.setValue(newX);
      const newBudget = Math.round(((newX / TRACK_WIDTH) * MAX) / 50) * 50;
      setBudget(newBudget);
      onChange && onChange(newBudget);
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>MY DAILY BUDGET</Text>
      <Text style={styles.amount}>R{budget.toLocaleString()}</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.fill, { width: pan }]} />
        <Animated.View
          style={[styles.handle, { transform: [{ translateX: pan }] }]}
          {...panResponder.panHandlers}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", paddingVertical: 12 },
  label: { color: "rgba(250,246,239,0.6)", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  amount: { color: colors.ivory, fontSize: 28, fontWeight: "800", marginTop: 4, marginBottom: 12 },
  track: {
    width: TRACK_WIDTH,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(250,246,239,0.2)",
    justifyContent: "center",
  },
  fill: { position: "absolute", height: 6, borderRadius: 3, backgroundColor: colors.clay },
  handle: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.sand,
    marginLeft: -11,
    borderWidth: 2,
    borderColor: colors.clay,
  },
});
