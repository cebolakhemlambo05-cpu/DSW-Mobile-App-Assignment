export const attractions = [
  {
    id: "kruger",
    name: "Kruger National Park",
    category: "Wildlife",
    blurb: "South Africa's flagship safari park — Big Five country.",
    image:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800&auto=format&fit=crop",
    activities: [
      { id: "a1", name: "Morning Safari Drive", price: 950 },
      { id: "a2", name: "Sunset Bush Walk", price: 650 },
      { id: "a3", name: "Self-drive (own car)", price: 0, note: "Park fees only" },
    ],
    accommodations: [
      { id: "h1", name: "Kruger Gate Lodge", price: 850, distanceKm: 3 },
      { id: "h2", name: "Savanna Backpackers", price: 420, distanceKm: 8 },
      { id: "h3", name: "Luxury Bush Camp", price: 2200, distanceKm: 45 },
    ],
  },
  {
    id: "table-mountain",
    name: "Table Mountain",
    category: "Mountains",
    blurb: "Iconic flat-topped mountain overlooking Cape Town.",
    image:
      "https://images.unsplash.com/photo-1580060839134-75a50365ce4e?q=80&w=800&auto=format&fit=crop",
    activities: [
      { id: "a1", name: "Cableway Ticket (return)", price: 430 },
      { id: "a2", name: "Guided Hiking Trail", price: 380 },
      { id: "a3", name: "Sunset Viewing Deck Entry", price: 150 },
    ],
    accommodations: [
      { id: "h1", name: "Table Mountain View Guesthouse", price: 680, distanceKm: 1.5 },
      { id: "h2", name: "City Bowl Hostel", price: 350, distanceKm: 4 },
      { id: "h3", name: "Clifton Beach Villa", price: 3200, distanceKm: 6 },
    ],
  },
  {
    id: "soweto",
    name: "Soweto",
    category: "City & Culture",
    blurb: "Historic township with rich culture, food, and nightlife.",
    image:
      "https://images.unsplash.com/photo-1577948000111-9c970dfe3743?q=80&w=800&auto=format&fit=crop",
    activities: [
      { id: "a1", name: "Bicycle Tour", price: 400 },
      { id: "a2", name: "Apartheid Museum Entry", price: 150 },
      { id: "a3", name: "Township Food Crawl", price: 550 },
    ],
    accommodations: [
      { id: "h1", name: "Soweto Backpackers", price: 300, distanceKm: 2 },
      { id: "h2", name: "Vilakazi Street B&B", price: 720, distanceKm: 0.8 },
      { id: "h3", name: "Johannesburg City Hotel", price: 1400, distanceKm: 18 },
    ],
  },
];

export function getAttractionById(id) {
  return attractions.find((a) => a.id === id);
}
