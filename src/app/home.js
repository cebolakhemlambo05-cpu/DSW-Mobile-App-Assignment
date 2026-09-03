import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Image,
  SafeAreaView,
  TextInput,
  Dimensions
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "../constants/colors";

const { width } = Dimensions.get('window');

// Mock data for the home page
const categories = [
  { id: 1, name: "All", icon: "🌟" },
  { id: 2, name: "Wildlife", icon: "🦁" },
  { id: 3, name: "Mountains", icon: "⛰️" },
  { id: 4, name: "City", icon: "🏙️" },
  { id: 5, name: "Coast", icon: "🌊" },
];

const attractions = [
  { 
    id: 1, 
    name: "Kruger National Park", 
    location: "Limpopo / Mpumalanga",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400",
    price: "R280",
    category: "Wildlife",
    rating: 4.9,
    withinBudget: true
  },
  { 
    id: 2, 
    name: "Table Mountain", 
    location: "Cape Town",
    image: "https://images.unsplash.com/photo-1580060839136-c7b8b2e5f264?w=400",
    price: "R250",
    category: "Mountains",
    rating: 4.8,
    withinBudget: true
  },
  { 
    id: 3, 
    name: "Blyde River Canyon", 
    location: "Mpumalanga",
    image: "https://images.unsplash.com/photo-1520957280574-43f60a6eb64b?w=400",
    price: "R150",
    category: "Mountains",
    rating: 4.6,
    withinBudget: true
  },
  { 
    id: 4, 
    name: "V&A Waterfront", 
    location: "Cape Town",
    image: "https://images.unsplash.com/photo-1580060839136-c7b8b2e5f264?w=400",
    price: "R0",
    category: "City",
    rating: 4.7,
    withinBudget: true
  },
];

export default function HomeScreen() {
  // Get the name from URL parameters
  const params = useLocalSearchParams();
  const [userName, setUserName] = useState("Guest");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // If name is passed in URL, use it
    if (params.name) {
      setUserName(params.name);
    }
  }, [params.name]);

  const filteredAttractions = attractions.filter(item => 
    (selectedCategory === "All" || item.category === selectedCategory) &&
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     item.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, {userName}</Text>
            <TouchableOpacity onPress={() => router.push("/sign-in")}>
              <Text style={styles.signOut}>Sign out</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.profileButton}>
              <Text style={styles.profileIcon}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Discovery Section */}
        <View style={styles.discoverySection}>
          <Text style={styles.sectionTitle}>DISCOVER</Text>
          <Text style={styles.sectionSubtitle}>South Africa</Text>
          
          <TouchableOpacity style={styles.dayPlanButton}>
            <Text style={styles.dayPlanText}>Day Plan</Text>
            <Text style={styles.dayPlanArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder='Search by vibe — "wildlife", "mountains", "Cape Town"'
            placeholderTextColor="rgba(62,50,38,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.searchButton}>
            <Text style={styles.searchIcon}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Budget Section */}
        <View style={styles.budgetSection}>
          <View style={styles.budgetHeader}>
            <Text style={styles.budgetTitle}>MY DAILY BUDGET</Text>
            <Text style={styles.budgetSubtitle}>Accommodation is filtered to match</Text>
          </View>
          
          <View style={styles.budgetRow}>
            <View style={styles.budgetAmountContainer}>
              <Text style={styles.budgetCurrency}>R</Text>
              <Text style={styles.budgetAmount}>2 500</Text>
              <Text style={styles.budgetPerNight}>per night</Text>
            </View>
            <View style={styles.budgetDivider} />
            <View style={styles.budgetSpentContainer}>
              <Text style={styles.budgetSpentLabel}>Spent</Text>
              <Text style={styles.budgetSpentAmount}>K500</Text>
              <Text style={styles.budgetTotal}>R8,000</Text>
            </View>
          </View>
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.name && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.name)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.name && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results Info */}
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsText}>
            {filteredAttractions.length} attractions within budget
          </Text>
        </View>

        {/* Attractions List */}
        {filteredAttractions.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.attractionCard}
            onPress={() => router.push(`/attraction/${item.id}`)}
          >
            <Image source={{ uri: item.image }} style={styles.attractionImage} />
            <View style={styles.attractionInfo}>
              <View style={styles.attractionHeader}>
                <Text style={styles.attractionCategory}>{item.category}</Text>
                {item.withinBudget && (
                  <View style={styles.budgetBadge}>
                    <Text style={styles.budgetBadgeText}>Within budget</Text>
                  </View>
                )}
              </View>
              <Text style={styles.attractionName}>{item.name}</Text>
              <Text style={styles.attractionLocation}>{item.location}</Text>
              <View style={styles.attractionFooter}>
                <Text style={styles.attractionPrice}>STAYS FROM</Text>
                <Text style={styles.attractionPriceAmount}>{item.price} night</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.sand,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.charcoal,
  },
  signOut: {
    fontSize: 14,
    color: colors.skyBlue,
    fontWeight: "600",
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.ivory,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(62,50,38,0.1)",
  },
  profileIcon: {
    fontSize: 20,
  },
  discoverySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(62,50,38,0.5)",
    letterSpacing: 2,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.charcoal,
    marginBottom: 12,
  },
  dayPlanButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ivory,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(62,50,38,0.08)",
    alignSelf: "flex-start",
  },
  dayPlanText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.charcoal,
    marginRight: 8,
  },
  dayPlanArrow: {
    fontSize: 16,
    color: colors.skyBlue,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.ivory,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    fontSize: 14,
    color: colors.charcoal,
    borderWidth: 1,
    borderColor: "rgba(62,50,38,0.08)",
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: colors.clay,
    padding: 12,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  searchIcon: {
    fontSize: 20,
  },
  budgetSection: {
    backgroundColor: colors.charcoal,
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  budgetHeader: {
    marginBottom: 16,
  },
  budgetTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(250,246,239,0.7)",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  budgetSubtitle: {
    fontSize: 12,
    color: "rgba(250,246,239,0.5)",
  },
  budgetRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  budgetAmountContainer: {
    flex: 1,
  },
  budgetCurrency: {
    fontSize: 14,
    color: colors.ivory,
    fontWeight: "600",
  },
  budgetAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.ivory,
    marginTop: -4,
  },
  budgetPerNight: {
    fontSize: 12,
    color: "rgba(250,246,239,0.6)",
    marginTop: 2,
  },
  budgetDivider: {
    width: 1,
    height: 50,
    backgroundColor: "rgba(250,246,239,0.2)",
    marginHorizontal: 16,
  },
  budgetSpentContainer: {
    alignItems: "center",
  },
  budgetSpentLabel: {
    fontSize: 11,
    color: "rgba(250,246,239,0.5)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  budgetSpentAmount: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.mustard,
  },
  budgetTotal: {
    fontSize: 12,
    color: "rgba(250,246,239,0.5)",
    marginTop: 2,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  categoriesContent: {
    paddingRight: 20,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.ivory,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(62,50,38,0.06)",
  },
  categoryButtonActive: {
    backgroundColor: colors.charcoal,
    borderColor: colors.charcoal,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.charcoal,
  },
  categoryTextActive: {
    color: colors.ivory,
  },
  resultsInfo: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    color: "rgba(62,50,38,0.6)",
    fontWeight: "500",
  },
  attractionCard: {
    flexDirection: "row",
    backgroundColor: colors.ivory,
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(62,50,38,0.06)",
  },
  attractionImage: {
    width: 120,
    height: 130,
  },
  attractionInfo: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  attractionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  attractionCategory: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.skyBlue,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  budgetBadge: {
    backgroundColor: colors.savanna,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  budgetBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.ivory,
  },
  attractionName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.charcoal,
    marginTop: 4,
  },
  attractionLocation: {
    fontSize: 12,
    color: "rgba(62,50,38,0.5)",
    marginTop: 2,
  },
  attractionFooter: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  attractionPrice: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(62,50,38,0.4)",
    letterSpacing: 0.5,
    marginRight: 6,
  },
  attractionPriceAmount: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.clay,
  },
});
