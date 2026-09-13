import React, { useState } from "react";
import { View, Text, ImageBackground, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from "react-native";
import Colors from "../constants/colors";

const { width, height } = Dimensions.get("window");

export default function AttractionDetails({ route }) {
  const { attraction, budget } = route.params; // ✅ budget passed from HomePage
  const [activeTab, setActiveTab] = useState("WhereToSleep");

  // Example accommodation options (you can expand this list)
  const stays = [
    {
      id: 1,
      name: "Hazyview Backpackers",
      distance: "14 km from park gate",
      rating: 4.1,
      price: 280,
      amenities: "Free Wi-Fi • Shared kitchen",
    },
    {
      id: 2,
      name: "Kruger Safari Lodge",
      distance: "5 km from park gate",
      rating: 4.6,
      price: 1200,
      amenities: "Pool • Restaurant • Safari tours",
    },
    {
      id: 3,
      name: "Budget Bush Camp",
      distance: "20 km from park gate",
      rating: 3.9,
      price: 180,
      amenities: "Basic huts • Shared bathrooms",
    },
  ];

  // Filter stays by budget
  const filteredStays = stays.filter((stay) => stay.price <= budget);

  return (
    <ScrollView style={styles.container}>
      {/* Background Image */}
      <ImageBackground source={attraction.image} style={styles.heroImage}>
        <View style={styles.overlay}>
          <Text style={styles.title}>{attraction.title}</Text>
          <Text style={styles.location}>{attraction.location}</Text>
          <Text style={styles.description}>
            One of Africa’s greatest wildlife reserves, home to the Big Five across 20,000 km² of bushveld.
          </Text>
        </View>
      </ImageBackground>

      {/* Budget Info */}
      <View style={styles.budgetBox}>
        <Text style={styles.budgetText}>MY DAILY BUDGET</Text>
        <Text style={styles.budgetValue}>R{budget} per night</Text>
        {attraction.price <= budget ? (
          <Text style={styles.withinBudget}>This attraction fits your budget ✅</Text>
        ) : (
          <Text style={styles.overBudget}>This attraction is above your budget ❌</Text>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "WhereToSleep" && styles.tabActive]}
          onPress={() => setActiveTab("WhereToSleep")}
        >
          <Text style={[styles.tabText, activeTab === "WhereToSleep" && styles.tabTextActive]}>
            Where to Sleep
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "WhatToDo" && styles.tabActive]}
          onPress={() => setActiveTab("WhatToDo")}
        >
          <Text style={[styles.tabText, activeTab === "WhatToDo" && styles.tabTextActive]}>
            What to Do
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === "WhereToSleep" ? (
        <View>
          {filteredStays.length > 0 ? (
            filteredStays.map((stay) => (
              <View key={stay.id} style={styles.card}>
                <Text style={styles.cardTitle}>{stay.name}</Text>
                <Text style={styles.cardSubtitle}>{stay.distance}</Text>
                <Text style={styles.cardDetails}>⭐ {stay.rating} • R{stay.price}/night • {stay.amenities}</Text>
                <TouchableOpacity style={styles.planButton}>
                  <Text style={styles.planButtonText}>Select for plan</Text>
                </TouchableOpacity>
                <Text style={styles.link}>View details, amenities & reviews</Text>
              </View>
            ))
          ) : (
            <Text style={styles.overBudget}>No stays available within your budget ❌</Text>
          )}
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Activities</Text>
          <Text style={styles.activity}>• Morning Game Drive (3 hrs) — R950/pp</Text>
          <Text style={styles.activity}>• Sunset Bush Walk (2 hrs) — R650/pp</Text>
          <Text style={styles.activity}>• Self-Drive (Full day) — R232/pp</Text>
          <Text style={styles.activity}>• Night Safari Drive (2.5 hrs) — R780/pp</Text>
          <Text style={styles.activity}>• Bird Watching Walk (2 hrs) — R420/pp</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  heroImage: { width: "100%", height: height * 0.3, justifyContent: "flex-end" },
  overlay: { backgroundColor: "rgba(0,0,0,0.4)", padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", color: "#fff" },
  location: { fontSize: 16, color: "#eee", marginVertical: 4 },
  description: { fontSize: 14, color: "#ddd" },

  budgetBox: { padding: 16, backgroundColor: Colors.softIvory },
  budgetText: { fontSize: 14, fontWeight: "bold", color: Colors.charcoalBrown },
  budgetValue: { fontSize: 16, fontWeight: "600", color: Colors.deepSavannaGreen },
  withinBudget: { fontSize: 14, color: Colors.deepSavannaGreen, marginTop: 6 },
  overBudget: { fontSize: 14, color: Colors.terracottaClay, marginTop: 6 },

  tabs: { flexDirection: "row", marginVertical: 10 },
  tabButton: { flex: 1, padding: 12, alignItems: "center", backgroundColor: "#eee" },
  tabActive: { backgroundColor: Colors.deepSavannaGreen },
  tabText: { fontSize: 14, fontWeight: "600", color: Colors.charcoalBrown },
  tabTextActive: { color: Colors.softIvory },

  card: { padding: 16, backgroundColor: Colors.softIvory, margin: 16, borderRadius: 8 },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 6 },
  cardSubtitle: { fontSize: 14, color: "#555", marginBottom: 4 },
  cardDetails: { fontSize: 14, color: "#333", marginBottom: 10 },
  planButton: { backgroundColor: Colors.terracottaClay, padding: 10, borderRadius: 6, alignItems: "center" },
  planButtonText: { color: Colors.softIvory, fontWeight: "bold" },
  link: { fontSize: 12, color: Colors.deepSavannaGreen, marginTop: 8, textDecorationLine: "underline" },

  activity: { fontSize: 14, marginBottom: 6, color: Colors.charcoalBrown },
});
