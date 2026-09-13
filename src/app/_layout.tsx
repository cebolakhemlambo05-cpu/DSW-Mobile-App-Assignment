import { Stack } from "expo-router";
import { DayPlanProvider } from "../context/DayPlanContext";

export default function RootLayout() {
  return (
    <DayPlanProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </DayPlanProvider>
  );
}
