const image = (id) =>
  `https://images.unsplash.com/${id}?w=1200&h=800&fit=crop&auto=format`;

export const ATTRACTIONS = [
  {
    id: 1,
    name: "Kruger National Park",
    location: "Limpopo & Mpumalanga, South Africa",
    category: "Wildlife",
    image: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Kruger_Zebra.JPG",
    description:
      "One of Africa's best-known wildlife reserves, known for self-drive safaris, guided game drives and rich biodiversity.",
    latitude: -23.9884,
    longitude: 31.5547,
    localFav: true,
    facts: [
      "Kruger was proclaimed in 1898 as the Sabie Game Reserve before becoming a national park in 1926.",
      "The park protects archaeological sites including Masorini and Thulamela.",
    ],
    visitorInfo:
      "Book gates, camps and guided drives in advance during peak holiday periods.",
    accommodations: [
      {
        id: "kruger-letaba",
        name: "Letaba Rest Camp",
        type: "Rest camp",
        pricePerNight: 850,
        distanceKm: 0,
        rating: 4.4,
        details: {
          image: image("photo-1516426122078-c23e76319801"),
          description: "A central SANParks-style base for game drives.",
          address: "Kruger National Park",
          amenities: ["Parking", "Restaurant", "Game drives"],
        },
      },
    ],
    activities: [
      { id: "kruger-game-drive", name: "Guided game drive", pricePerPerson: 620, duration: "3 hrs" },
      { id: "kruger-bush-walk", name: "Bush walk", pricePerPerson: 460, duration: "2 hrs" },
    ],
  },
  {
    id: 2,
    name: "Table Mountain",
    location: "Cape Town, Western Cape, South Africa",
    category: "Mountains",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Table_Mountain_DanieVDM.jpg",
    description:
      "Cape Town's flat-topped landmark offers hiking trails, cableway access and sweeping views across the city and coast.",
    latitude: -33.9628,
    longitude: 18.4098,
    localFav: true,
    facts: [
      "Table Mountain is part of a national park and the Cape Floristic Region World Heritage Site.",
      "The aerial cableway opened in 1929 and has carried millions of visitors.",
    ],
    visitorInfo:
      "Check cableway weather closures before travelling; conditions can change quickly.",
    accommodations: [
      {
        id: "table-smitswinkel",
        name: "Smitswinkel Tented Camp",
        type: "Tented camp",
        pricePerNight: 965,
        distanceKm: 9,
        rating: 4.2,
        details: {
          image: image("photo-1500530855697-b586d89ba3ee"),
          description: "Simple nature accommodation within easy reach of Cape Peninsula routes.",
          address: "Table Mountain National Park",
          amenities: ["Trails", "Self-catering", "Nature"],
        },
      },
    ],
    activities: [
      { id: "table-cableway", name: "Cableway visit", pricePerPerson: 430, duration: "2 hrs" },
      { id: "table-hike", name: "Guided hike", pricePerPerson: 700, duration: "4 hrs" },
    ],
  },
  {
    id: 3,
    name: "Soweto Township",
    location: "Johannesburg, Gauteng, South Africa",
    category: "City",
    image: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Soweto-002.jpg",
    description:
      "A culturally significant Johannesburg area known for Vilakazi Street, museums, local food and anti-apartheid history.",
    latitude: -26.2485,
    longitude: 27.854,
    facts: [
      "Vilakazi Street is associated with Nelson Mandela and Archbishop Desmond Tutu.",
      "The 1976 student uprising is commemorated at the Hector Pieterson Museum.",
    ],
    visitorInfo: "Use reputable guided tours for context and respectful local routing.",
    accommodations: [
      { id: "soweto-lodge", name: "Soweto Lodge", type: "Guest lodge", pricePerNight: 650, distanceKm: 2, rating: 4.1 },
    ],
    activities: [
      { id: "soweto-history", name: "History walking tour", pricePerPerson: 350, duration: "2 hrs" },
      { id: "soweto-food", name: "Local food stop", pricePerPerson: 220, duration: "1 hr" },
    ],
  },
  {
    id: 42,
    name: "Durban Golden Mile",
    location: "Durban, KwaZulu-Natal, South Africa",
    category: "Coast",
    image: "https://upload.wikimedia.org/wikipedia/commons/b/b8/The_sun_set_of_GOLDEN_MILE.jpg",
    description:
      "Durban's beachfront promenade links swimming beaches, restaurants and family attractions along the Indian Ocean.",
    latitude: -29.8587,
    longitude: 31.0218,
    visitorInfo: "Swim at beaches with lifeguards and check local beach notices.",
    facts: ["The promenade has long been a central Durban leisure route."],
    accommodations: [
      { id: "durban-golden-mile-hotel", name: "Golden Mile Beachfront Hotel", type: "Hotel", pricePerNight: 1200, distanceKm: 0.4, rating: 4.0 },
    ],
    activities: [
      { id: "durban-beach", name: "Beach Visit", pricePerPerson: 0, duration: "Flexible" },
      { id: "durban-cycle", name: "Promenade cycle", pricePerPerson: 180, duration: "1 hr" },
    ],
  },
  {
    id: 9,
    name: "iSimangaliso Wetland Park",
    location: "KwaZulu-Natal, South Africa",
    category: "Wildlife",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/03/GreaterStLucia.jpg",
    description:
      "A UNESCO-listed wetland landscape with lakes, dunes, beaches, wildlife and estuary experiences.",
    latitude: -28.377,
    longitude: 32.41,
    facts: ["iSimangaliso means miracle or wonder in isiZulu."],
    visitorInfo: "Plan routes and park gates ahead; distances between sections can be significant.",
    accommodations: [
      { id: "isimangaliso-stlucia", name: "St Lucia Safari Lodge", type: "Safari lodge", pricePerNight: 1000, distanceKm: 3, rating: 4.3 },
    ],
    activities: [
      { id: "isimangaliso-boat", name: "Estuary boat cruise", pricePerPerson: 390, duration: "2 hrs" },
      { id: "isimangaliso-beach", name: "Cape Vidal beach trip", pricePerPerson: 120, duration: "Half day" },
    ],
  },
];
