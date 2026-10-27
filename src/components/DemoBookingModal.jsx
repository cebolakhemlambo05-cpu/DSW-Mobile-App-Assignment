import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { colors, fonts } from "../theme/theme";
import { fmt } from "../utils/format";
import { sendBookingConfirmationEmail } from "../services/placesService";

function createReference(prefix) {
  return `${prefix}-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function nightsBetween(checkIn, checkOut) {
  const nights = Math.round((new Date(`${checkOut}T00:00:00`) - new Date(`${checkIn}T00:00:00`)) / 86400000);
  return Number.isFinite(nights) && nights > 0 ? nights : 0;
}

export default function DemoBookingModal({
  visible,
  accommodation,
  attractionName,
  guestName = "",
  guestEmail = "",
  adults = 2,
  roomSharing = 2,
  roomQuantity = 1,
  guestsNeedingRoom = 0,
  activities = [],
  checkInDate,
  checkOutDate,
  existingBooking,
  onClose,
  onBookingCreated,
  onReserved,
}) {
  const [step, setStep] = useState("details");
  const [fullName, setFullName] = useState(guestName);
  const [email, setEmail] = useState(guestEmail);
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [booking, setBooking] = useState(existingBooking || null);
  const [submitting, setSubmitting] = useState(false);
  const nights = nightsBetween(checkInDate, checkOutDate);
  const hasLiveRate = Number.isFinite(Number(accommodation?.pricePerNight)) && accommodation?.pricePerNight != null;
  const accommodationTotal = hasLiveRate && nights
    ? Number((Number(accommodation.pricePerNight) * roomQuantity * nights).toFixed(2))
    : null;
  const activityTotal = Number((activities.reduce((sum, activity) => sum + Number(activity.pricePerPerson || 0), 0) * adults).toFixed(2));
  const total = accommodationTotal == null ? null : Number((accommodationTotal + activityTotal).toFixed(2));
  const existingBookingMatches = !!existingBooking &&
    Number(existingBooking.adults) === adults &&
    Number(existingBooking.roomSharing) === roomSharing &&
    Number(existingBooking.roomQuantity) === roomQuantity &&
    Number(existingBooking.nights) === nights &&
    existingBooking.checkIn === checkInDate &&
    existingBooking.checkOut === checkOutDate &&
    existingBooking.propertyName === accommodation?.name &&
    Number(existingBooking.amount) === Number(total);

  useEffect(() => {
    if (!visible) return;
    setFullName(guestName || "");
    setEmail(guestEmail || "");
    setBooking(existingBookingMatches ? existingBooking : null);
    setPaymentMethod(existingBooking?.paymentMethod || "Card");
    setStep(existingBookingMatches ? "payment" : "details");
  }, [visible, guestName, guestEmail, existingBooking, existingBookingMatches]);

  const continueToPayment = () => {
    if (!fullName.trim() || !email.trim()) {
      Alert.alert("Guest details needed", "Enter the lead guest's name and email to continue.");
      return;
    }
    if (guestsNeedingRoom > 0) {
      Alert.alert("More rooms needed", `Add rooms for the remaining ${guestsNeedingRoom} guest${guestsNeedingRoom === 1 ? "" : "s"} before continuing.`);
      return;
    }
    if (!hasLiveRate || !nights) {
      Alert.alert("Live Hotelbeds offer needed", "Choose an accommodation with a valid Hotelbeds rate and stay dates before continuing.");
      return;
    }
    setBooking({
      bookingReference: createReference("AIO"),
      paymentReference: createReference("PAY"),
      accommodationId: accommodation.id,
      guestName: fullName.trim(),
      guestEmail: email.trim(),
      propertyName: accommodation.name,
      attractionName,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      nights,
      adults,
      roomSharing,
      roomQuantity,
      guestsNeedingRoom,
      accommodationTotal,
      activitiesTotal: activityTotal,
      amount: Number(total.toFixed(2)),
      activityNames: activities.map((activity) => activity.name),
      currency: accommodation?.currency || "ZAR",
      paymentStatus: "awaiting_payment",
      bookingStatus: "reservation_request",
      paymentMethod,
      emailStatus: "pending",
      provider: accommodation?.source || "Hotelbeds",
      createdAt: new Date().toISOString(),
    });
    setStep("payment");
  };

  const reserveNow = async () => {
    if (!booking || submitting) return;
    const reserved = {
      ...booking,
      guestName: fullName.trim(),
      guestEmail: email.trim(),
      paymentMethod,
      bookingStatus: "reservation_request_saved",
      paymentStatus: "awaiting_payment",
      emailStatus: "sending",
    };
    setSubmitting(true);
    try {
      await onBookingCreated?.(reserved);
      let emailStatus = "sent";
      let emailError = "";
      try {
        await sendBookingConfirmationEmail(reserved);
      } catch (error) {
        emailStatus = "not_sent";
        emailError = error.message || "Email could not be sent.";
      }
      const saved = { ...reserved, emailStatus, emailError };
      setBooking(saved);
      await onBookingCreated?.(saved);
      onReserved?.(saved);
    } finally {
      setSubmitting(false);
    }
  };

  const heading = step === "details" ? "Guest & stay details" : "Payment details";

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close booking" />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>HOTELBEDS OFFER · IN-APP RESERVATION</Text>
              <Text style={styles.title}>{heading}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.propertyCard}>
              <Text style={styles.propertyName}>{accommodation?.name || "Selected accommodation"}</Text>
              <Text style={styles.propertyMeta}>{attractionName} · {adults} guest{adults === 1 ? "" : "s"} · {roomQuantity} room{roomQuantity === 1 ? "" : "s"} · {roomSharing} sharing</Text>
              <Text style={styles.propertyMeta}>{checkInDate} to {checkOutDate}</Text>
              <Text style={styles.amount}>{fmt(booking?.amount ?? total, booking?.currency || accommodation?.currency || "ZAR")}</Text>
              <Text style={styles.fieldLabel}>ESTIMATED TOTAL · {nights} NIGHT{nights === 1 ? "" : "S"}</Text>
              {accommodationTotal != null && <Text style={styles.propertyMeta}>Stay: {fmt(accommodationTotal, accommodation?.currency || "ZAR")} · Activities: {fmt(activityTotal, "ZAR")}</Text>}
            </View>

            {step === "details" && (
              <>
                <Text style={styles.sectionTitle}>Lead guest</Text>
                <TextInput value={fullName} onChangeText={setFullName} placeholder="Full name" placeholderTextColor="#8D887D" style={styles.input} autoCapitalize="words" />
                <TextInput value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor="#8D887D" style={styles.input} keyboardType="email-address" autoCapitalize="none" />
                <Text style={styles.notice}>Guest count and dates are used for the Hotelbeds search and will be saved with this reservation request.</Text>
                <Pressable onPress={continueToPayment} disabled={!hasLiveRate || guestsNeedingRoom > 0} style={[styles.primary, (!hasLiveRate || guestsNeedingRoom > 0) && styles.primaryDisabled]}><Text style={styles.primaryText}>{guestsNeedingRoom > 0 ? `Add rooms for ${guestsNeedingRoom} more guest${guestsNeedingRoom === 1 ? "" : "s"}` : hasLiveRate ? "Continue to payment" : "Waiting for a live Hotelbeds rate"}</Text></Pressable>
              </>
            )}

            {step === "payment" && booking && (
              <>
                <View style={styles.referenceBox}>
                  <Text style={styles.fieldLabel}>BOOKING REFERENCE</Text><Text selectable style={styles.reference}>{booking.bookingReference}</Text>
                  <Text style={styles.fieldLabel}>PAYMENT REFERENCE</Text><Text selectable style={styles.reference}>{booking.paymentReference}</Text>
                  <Text style={styles.propertyMeta}>{booking.roomQuantity} room{booking.roomQuantity === 1 ? "" : "s"} · {booking.roomSharing} sharing · {booking.nights} night{booking.nights === 1 ? "" : "s"}</Text>
                  <Text style={styles.propertyMeta}>Stay: {fmt(booking.accommodationTotal, booking.currency)} · Activities: {fmt(booking.activitiesTotal, "ZAR")}</Text>
                  <Text style={styles.dueText}>Trip total: {fmt(booking.amount, booking.currency)}</Text>
                </View>
                <Text style={styles.sectionTitle}>Select how you plan to pay</Text>
                <View style={styles.methodRow}>{["Card", "Instant EFT", "Bank / ATM"].map((method) => <Pressable key={method} onPress={() => setPaymentMethod(method)} style={[styles.method, paymentMethod === method && styles.methodActive]}><Text style={[styles.methodText, paymentMethod === method && styles.methodTextActive]}>{method}</Text></Pressable>)}</View>
                <Text style={styles.notice}>Your preferred payment method will be saved with your reservation details.</Text>
                <Pressable onPress={reserveNow} disabled={submitting} style={[styles.primary, submitting && styles.primaryDisabled]}><Text style={styles.primaryText}>{submitting ? "Saving reservation…" : "Reserve now"}</Text></Pressable>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(20,24,21,0.62)" },
  sheet: { maxHeight: "92%", backgroundColor: colors.sand, borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: "hidden" },
  header: { flexDirection: "row", alignItems: "center", padding: 20, backgroundColor: colors.savanna },
  eyebrow: { color: colors.sand, fontSize: 10, fontFamily: fonts.bodySemiBold, letterSpacing: 1.1 },
  title: { marginTop: 4, color: colors.ivory, fontSize: 22, fontFamily: fonts.display },
  close: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.14)" },
  closeText: { color: colors.ivory, fontSize: 26, lineHeight: 30 },
  content: { padding: 18, gap: 12, paddingBottom: 28 },
  propertyCard: { padding: 16, borderRadius: 16, backgroundColor: colors.ivory, gap: 5 },
  propertyName: { color: colors.charcoal, fontFamily: fonts.bodySemiBold, fontSize: 16 },
  propertyMeta: { color: colors.charcoal, opacity: 0.65, fontSize: 12 },
  amount: { color: colors.terra, fontFamily: fonts.display, fontSize: 24, marginTop: 8 },
  sectionTitle: { color: colors.charcoal, fontFamily: fonts.bodySemiBold, fontSize: 14, marginTop: 4 },
  fieldLabel: { color: colors.charcoal, opacity: 0.55, fontFamily: fonts.bodySemiBold, fontSize: 10, letterSpacing: 1 },
  input: { minHeight: 46, borderWidth: 1, borderColor: "#D9D0BE", borderRadius: 12, backgroundColor: colors.ivory, paddingHorizontal: 12, color: colors.charcoal, fontSize: 14 },
  notice: { color: colors.charcoal, opacity: 0.68, fontSize: 12, lineHeight: 18, marginVertical: 4 },
  primary: { minHeight: 50, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: colors.terra, marginTop: 4, paddingHorizontal: 12 },
  primaryDisabled: { opacity: 0.55 },
  primaryText: { color: colors.ivory, fontFamily: fonts.bodySemiBold, fontSize: 14, textAlign: "center" },
  referenceBox: { padding: 16, borderRadius: 14, gap: 7, backgroundColor: colors.ivory, borderWidth: 1, borderColor: "#E6DDCC" },
  reference: { color: colors.savanna, fontFamily: fonts.bodySemiBold, fontSize: 18, letterSpacing: 1, marginBottom: 7 },
  dueText: { color: colors.terra, fontFamily: fonts.bodySemiBold, fontSize: 14, marginTop: 2 },
  methodRow: { flexDirection: "row", gap: 8 },
  method: { flex: 1, minHeight: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", paddingHorizontal: 4, backgroundColor: colors.ivory, borderWidth: 1, borderColor: "#D9D0BE" },
  methodActive: { borderColor: colors.terra, backgroundColor: "#F7E8DC" },
  methodText: { color: colors.charcoal, fontSize: 11, textAlign: "center" },
  methodTextActive: { color: colors.terra, fontFamily: fonts.bodySemiBold },
});
