import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Dimensions, Platform } from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/colors";

const { width, height } = Dimensions.get("window");

export default function HomePage({ navigation }) {
  const [budget, setBudget] = useState(2500);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Attractions data
  const attractions = [
    {
      id: 1,
      tag: "Wildlife",
      title: "Kruger National Park",
      location: "Limpopo / Mpumalanga",
      price: 280,
      image: require("../assets/kruger-elephant.jpg"),
    },
    {
      id: 2,
      tag: "Mountains",
      title: "Table Mountain",
      location: "Cape Town, Western Cape",
      price: 245,
      image: require("../assets/table-mountain.jpg"),
    },
    {
      id: 3,
      tag: "City",
      title: "Soweto Township",
      location: "Gauteng, Soweto",
      price: 195,
      image: require("../assets/soweto.jpeg"),
    },
    {
      id: 4,
      tag: "Coast",
      title: "Garden Route",
      location: "Western & Eastern Cape",
      price: 190,
      image: require("../assets/garden-route.png"),
    },
    {
      id: 5,
      tag: "Mountains",
      title: "Drakensberg Mountains",
      location: "KwaZulu-Natal",
      price: 160,
      image: require("../assets/drakensburg.jpg"),
    },
    {
    id: 6,
    tag: "Beach",
    title: "uShaka Marine World",
    location: "Durban, KwaZulu-Natal",
    price: 220,
    image: require("../assets/ushaka-marine.jpg"),
  },
  {
    id: 7,
    tag: "Beach",
    title: "Umhlanga Main Beach",
    location: "Umhlanga, KwaZulu-Natal",
    price: 0,
    image: require("../assets/umhlanga-beach.png"),
  },
  {
    id: 8,
    tag: "Beach",
    title: "Durban Golden Mile",
    location: "Durban, KwaZulu-Natal",
    price: 0,
    image: require("../assets/golden-mile.jpg"),
  },
  {
    id: 10,
    tag: "History",
    title: "Robben Island",
    location: "Cape Town, Western Cape",
    price: 400,
    image: require("../assets/robben-island.jpg"),
  },
  {
    id: 11,
    tag: "Mountains",
    title: "Tugela Falls",
    location: "Drakensberg, KwaZulu-Natal",
    price: 0,
    image: require("../assets/tugela-falls.jpg"),
  },
  ];

  // Filter attractions by category and budget
  const filteredAttractions = attractions.filter(
    (item) =>
      (selectedCategory === "All" || item.tag === selectedCategory) &&
      item.price <= budget
  );

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Section */}
      <View style={styles.headerSection}>
        <View style={styles.headerTop}>
          <Text style={styles.appTitle}>ALL-IN-ONE-PLANNER</Text>
          <View style={styles.headerRight}>
            <Text style={styles.greeting}>Hi, Mangi</Text>
            <TouchableOpacity onPress={() => navigation.replace("SignIn")}>
              <Text style={styles.signOut}>Sign out</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.headerBottom}>
          <Text style={styles.discoverText}>DISCOVER</Text>
          <Text style={styles.locationText}>South Africa</Text>
          <TouchableOpacity style={styles.dayPlanButton}>
            <Ionicons name="calendar-outline" size={width * 0.04} color={Colors.softIvory} />
            <Text style={styles.dayPlanText}>Day Plan</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#B0A090" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder='Search by vibe — "wildlife", "mountains", "Cape Town"'
          placeholderTextColor="#B0A090"
          selectionColor={Colors.deepSavannaGreen}
        />
      </View>

      {/* Budget Slider */}
      <View style={styles.sliderContainer}>
        <Text style={styles.sliderLabel}>MY DAILY BUDGET</Text>
        <Text style={styles.sliderSubLabel}>Accommodation is filtered to match</Text>
        <Text style={styles.sliderValue}>R{budget} per night</Text>
        <View style={styles.sliderRow}>
          <Text style={styles.sliderMin}>R500</Text>
          <Slider
            style={styles.slider}
            minimumValue={500}
            maximumValue={8000}
            step={100}
            value={budget}
            onValueChange={setBudget}
            minimumTrackTintColor={Colors.deepSavannaGreen}
            maximumTrackTintColor="#E8E0D8"
            thumbTintColor={Colors.deepSavannaGreen}
          />
          <Text style={styles.sliderMax}>R8,000</Text>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filters}>
        {["All", "Wildlife", "Mountains", "City", "Coast", "Beach", "History", "LocalFavs"].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedCategory === filter && styles.filterButtonActive,
            ]}
            onPress={() => setSelectedCategory(filter)}
          >
            <Text 
              style={[
                styles.filterText,
                selectedCategory === filter && styles.filterTextActive
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Attractions Count */}
      <Text style={styles.attractionCount}>
        {filteredAttractions.length} attractions within budget
      </Text>

      {/* Featured Attractions */}
      {filteredAttractions.map((item) => (
  <TouchableOpacity
    key={item.id}
    style={styles.card}
    activeOpacity={0.9}
    onPress={() => navigation.navigate("AttractionDetails", { attraction: item })}
  >
    <Image source={item.image} style={styles.cardImage} />
    <View style={styles.cardContent}>
      <Text style={styles.cardTag}>{item.tag}</Text>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardLocation}>{item.location}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.cardPrice}>STAYS FROM</Text>
        <Text style={styles.cardPriceAmount}>R{item.price}/night</Text>
        <View style={styles.budgetBadge}>
          <Text style={styles.cardBudget}>Within budget</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
))}


      {/* Footer */}
      <Text style={styles.footer}>Do not sell or share my personal info</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5e0c6',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  headerSection: {
    backgroundColor: Colors.deepSavannaGreen,
    paddingTop: Platform.OS === "ios" ? 50 : 40,
    paddingBottom: 16,
    paddingHorizontal: width * 0.05,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  appTitle: {
    color: Colors.softIvory,
    fontSize: width * 0.032,
    fontWeight: "600",
    letterSpacing: 1,
    opacity: 0.9,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  greeting: {
    color: Colors.softIvory,
    fontSize: width * 0.035,
    fontWeight: "500",
    marginRight: 12,
  },
  signOut: {
    color: Colors.terracottaClay,
    fontSize: width * 0.032,
    fontWeight: "500",
  },
  headerBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  discoverText: {
    color: Colors.softIvory,
    fontSize: width * 0.04,
    fontWeight: "500",
    opacity: 0.8,
    letterSpacing: 0.5,
  },
  locationText: {
    color: Colors.softIvory,
    fontSize: width * 0.055,
    fontWeight: "700",
    flex: 1,
    marginLeft: 4,
  },
  dayPlanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.terracottaClay,
    paddingVertical: height * 0.01,
    paddingHorizontal: width * 0.035,
    borderRadius: 6,
    minHeight: height * 0.04,
    justifyContent: "center",
  },
  dayPlanText: {
    color: Colors.softIvory,
    fontWeight: "600",
    fontSize: width * 0.032,
    marginLeft: width * 0.01,
    letterSpacing: 0.3,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.softIvory,
    marginHorizontal: width * 0.05,
    marginTop: -20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchBar: {
    flex: 1,
    fontSize: width * 0.035,
    color: Colors.charcoalBrown,
    padding: 0,
  },
  sliderContainer: {
    backgroundColor: Colors.softIvory,
    marginHorizontal: width * 0.05,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  sliderLabel: {
    fontSize: width * 0.032,
    fontWeight: "700",
    color: Colors.charcoalBrown,
    letterSpacing: 0.5,
  },
  sliderSubLabel: {
    fontSize: width * 0.028,
    color: '#8A7A6A',
    marginTop: 2,
    marginBottom: 8,
  },
  sliderValue: {
    fontSize: width * 0.04,
    fontWeight: "700",
    color: Colors.deepSavannaGreen,
    marginBottom: 4,
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  sliderMin: {
    fontSize: width * 0.028,
    color: '#8A7A6A',
    fontWeight: "500",
  },
  sliderMax: {
    fontSize: width * 0.028,
    color: '#8A7A6A',
    fontWeight: "500",
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: width * 0.05,
    marginTop: 20,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#E8E0D8',
    minWidth: width * 0.15,
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: Colors.deepSavannaGreen,
  },
  filterText: {
    color: '#5A4A3A',
    fontWeight: "500",
    fontSize: width * 0.03,
  },
  filterTextActive: {
    color: Colors.softIvory,
  },
  attractionCount: {
    fontSize: width * 0.035,
    fontWeight: "600",
    color: Colors.charcoalBrown,
    marginHorizontal: width * 0.05,
    marginBottom: 16,
  },
  card: {
    backgroundColor: Colors.softIvory,
    marginHorizontal: width * 0.05,
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardImage: {
    width: "100%",
    height: height * 0.2,
    resizeMode: "cover",
  },
  cardContent: {
    padding: 16,
  },
  cardTag: {
    color: Colors.deepSavannaGreen,
    fontWeight: "700",
    fontSize: width * 0.028,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: width * 0.045,
    fontWeight: "700",
    color: Colors.charcoalBrown,
    marginBottom: 2,
  },
  cardLocation: {
    fontSize: width * 0.032,
    color: '#8A7A6A',
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  cardPrice: {
    fontSize: width * 0.025,
    color: '#8A7A6A',
    fontWeight: "600",
    letterSpacing: 0.5,
    marginRight: 4,
  },
  cardPriceAmount: {
    fontSize: width * 0.032,
    fontWeight: "700",
    color: Colors.charcoalBrown,
    marginRight: 10,
  },
  budgetBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  cardBudget: {
    fontSize: width * 0.025,
    color: Colors.deepSavannaGreen,
    fontWeight: "600",
  },
  footer: {
    fontSize: width * 0.028,
    color: '#8A7A6A',
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
    textDecorationLine: "underline",
  },
});