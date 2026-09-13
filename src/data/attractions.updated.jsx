// attractions.js
// CRC - South African Attractions Catalogue
// 45 attractions
// Copy this entire file into your attractions.js

const makeAccommodation = ({
  id,
  name,
  image,
  description,
  priceFrom,
  rating,
  distanceKm,
  type,
  facilities,
  address,
  phone,
  checkIn = "14:00",
  checkOut = "10:00",
  roomTypes = [],
  cancellation = "Check the property's current cancellation policy before booking.",
  source
}) => ({
  id,
  name,
  image: resolveImage(image, DEFAULT_ACCOMMODATION_IMAGE),
  description,
  priceFrom,
  pricePerNight: priceFrom,
  rating,
  distanceKm,
  type,
  localFav: false,
  peakDouble: false,
  facilities,
  source,

  details: {
    image: resolveImage(image, DEFAULT_ACCOMMODATION_IMAGE),
    description,
    checkIn,
    checkOut,
    address,
    phone,
    amenities: facilities,
    roomTypes,
    cancellation,
    reviews: []
  }
});

const makeActivity = ({
  id,
  name,
  description,
  duration,
  pricePerPerson,
  bookingRequired = false,
  source
}) => ({
  id,
  name,
  description,
  duration,
  pricePerPerson,
  localFav: false,
  peakDouble: false,
  bookingRequired,
  source
});

const booking = (provider) => ({
  bookingRequired: true,
  availabilityStatus: "live-check",
  availabilityCheckedAt: "2026-09-09",
  bookingProvider: provider,
  bookingReference: null
});

const map = (name, region, latitude, longitude) => ({
  name,
  region,
  latitude,
  longitude,
  mapQuery: `${name}, ${region}, South Africa`,
  directionsAvailable: true
});

const CATEGORY_IMAGES = {
  Wildlife: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1000&h=650&fit=crop&auto=format",
  Mountains: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1000&h=650&fit=crop&auto=format",
  Coast: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&h=650&fit=crop&auto=format",
  Beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&h=650&fit=crop&auto=format",
  Nature: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1000&h=650&fit=crop&auto=format",
  City: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?w=1000&h=650&fit=crop&auto=format"
};

const DEFAULT_ATTRACTION_IMAGE = "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1000&h=650&fit=crop&auto=format";
const DEFAULT_ACCOMMODATION_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1000&h=650&fit=crop&auto=format";

const resolveImage = (image, fallback) =>
  typeof image === "string" && /^(https?:|data:)/.test(image) ? image : fallback;

const getAttractionImage = (attraction) =>
  resolveImage(attraction.image, CATEGORY_IMAGES[attraction.category] || DEFAULT_ATTRACTION_IMAGE);

const attractions = [

  // ============================================================
  // 1. KRUGER NATIONAL PARK
  // ============================================================

  {
    id: 1,
    name: "Kruger National Park",
    image: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Kruger_Zebra.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Wildlife",
    location: "Limpopo & Mpumalanga, South Africa",

    description:
      "One of South Africa's flagship wildlife destinations, famous for the Big Five, extensive game-viewing areas, wilderness landscapes and a large network of visitor camps.",

    source: "SANParks / South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "kruger-letaba",
        name: "Letaba Rest Camp",
        image: "../assets/accommodation/kruger-letaba.jpg",
        description:
          "SANParks rest camp situated along the Letaba River with accommodation, restaurant, shop and visitor facilities.",
        priceFrom: 850,
        rating: 4.5,
        distanceKm: 0,
        type: "Rest Camp",
        facilities: [
          "Restaurant",
          "Shop",
          "Fuel",
          "Swimming pool",
          "Camp facilities",
          "River views",
          "Self-catering options"
        ],
        address: "Letaba Rest Camp, Kruger National Park",
        phone: "+27 13 735 6636",
        roomTypes: [
          "Cottages",
          "Bungalows",
          "Camping"
        ],
        source: "SANParks"
      })
    ],

    activities: [
      makeActivity({
        id: "kruger-game-drive",
        name: "Guided Game Drive",
        description: "Guided wildlife viewing through Kruger National Park.",
        duration: "2–3 hours",
        pricePerPerson: 650,
        bookingRequired: true,
        source: "SANParks"
      }),
      makeActivity({
        id: "kruger-self-drive",
        name: "Self-drive Safari",
        description: "Explore Kruger using the public visitor road network.",
        duration: "Flexible",
        pricePerPerson: 0,
        source: "SANParks"
      })
    ],

    booking: booking("SANParks"),

    map: map(
      "Kruger National Park",
      "Limpopo & Mpumalanga",
      -23.9884,
      31.5547
    ),

    dataQuality: {
      price: "planning-value",
      rating: "current-planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 2. TABLE MOUNTAIN
  // ============================================================

  {
    id: 2,
    name: "Table Mountain",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/dc/Table_Mountain_DanieVDM.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Nature",
    location: "Cape Town, Western Cape, South Africa",

    description:
      "Iconic flat-topped mountain overlooking Cape Town, offering hiking routes, viewpoints and access to the wider Table Mountain National Park area.",

    source: "SANParks / South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "table-smitswinkel",
        name: "Smitswinkel Tented Camp",
        image: "../assets/accommodation/smitswinkel.jpg",
        description:
          "Self-catering tented accommodation in the Table Mountain National Park area.",
        priceFrom: 965,
        rating: 4.4,
        distanceKm: 35,
        type: "Tented Camp",
        facilities: [
          "Self-catering",
          "Bedding",
          "Cooking facilities",
          "Nature setting",
          "Parking"
        ],
        address: "Table Mountain National Park",
        phone: "+27 21 712 0527",
        roomTypes: [
          "2-bed tent",
          "4-bed tent"
        ],
        source: "SANParks"
      })
    ],

    activities: [
      makeActivity({
        id: "table-hike",
        name: "Table Mountain Hiking",
        description:
          "Explore mountain hiking routes and viewpoints.",
        duration: "3–5 hours",
        pricePerPerson: 0,
        source: "SANParks"
      }),
      makeActivity({
        id: "table-cableway",
        name: "Table Mountain Cableway",
        description:
          "Scenic cableway experience providing access to the mountain summit.",
        duration: "1–2 hours",
        pricePerPerson: 450,
        bookingRequired: true,
        source: "Table Mountain Cableway"
      })
    ],

    booking: booking("SANParks / Table Mountain Cableway"),

    map: map(
      "Table Mountain",
      "Cape Town, Western Cape",
      -33.9628,
      18.4098
    ),

    dataQuality: {
      price: "verified-accommodation-price",
      rating: "current-planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 3. SOWETO
  // ============================================================

  {
    id: 3,
    name: "Soweto Township",
    image: "https://upload.wikimedia.org/wikipedia/commons/f/f4/Soweto-002.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Culture & History",
    location: "Johannesburg, Gauteng, South Africa",

    description:
      "Historic township in southwest Johannesburg known for its important role in South African history, heritage sites, local culture and township tourism.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "soweto-lodge",
        name: "Soweto Lodge",
        image: "../assets/accommodation/soweto-lodge.jpg",
        description:
          "Budget-friendly accommodation in the Soweto area.",
        priceFrom: 650,
        rating: 4.2,
        distanceKm: 2,
        type: "Guesthouse / Lodge",
        facilities: [
          "Wi-Fi",
          "Parking",
          "Breakfast",
          "Reception",
          "Dining nearby"
        ],
        address: "Soweto, Johannesburg",
        phone: "+27 11 000 0000",
        roomTypes: [
          "Standard Room",
          "Family Room"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "soweto-tour",
        name: "Soweto Township Tour",
        description:
          "Guided cultural and historical tour through Soweto.",
        duration: "Half day",
        pricePerPerson: 450,
        bookingRequired: true,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "soweto-heritage",
        name: "Heritage Visit",
        description:
          "Visit important historical and cultural locations.",
        duration: "2–4 hours",
        pricePerPerson: 250,
        bookingRequired: true,
        source: "South African Tourism"
      })
    ],

    booking: booking("Local tour operator / accommodation"),

    map: map(
      "Soweto",
      "Johannesburg, Gauteng",
      -26.2485,
      27.8540
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 4. GARDEN ROUTE
  // ============================================================

  {
    id: 4,
    name: "Garden Route",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Gardenroute_overview.gif?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Nature & Coast",
    location: "Western & Eastern Cape, South Africa",

    description:
      "Scenic coastal region known for beaches, forests, lakes, mountains and outdoor activities.",

    source: "South African Tourism / SANParks",

    accommodations: [
      makeAccommodation({
        id: "garden-storms",
        name: "Storms River Mouth Rest Camp",
        image: "../assets/accommodation/storms-river.jpg",
        description:
          "SANParks accommodation at Storms River Mouth in the Garden Route National Park.",
        priceFrom: 468,
        rating: 4.5,
        distanceKm: 0,
        type: "Rest Camp",
        facilities: [
          "Camping",
          "Sea views",
          "Visitor facilities",
          "Restaurant nearby",
          "Nature trails",
          "Self-catering"
        ],
        address: "Storms River Mouth, Garden Route National Park",
        phone: "+27 42 281 1607",
        roomTypes: [
          "Tent Sites",
          "Cottages",
          "Chalets"
        ],
        source: "SANParks"
      })
    ],

    activities: [
      makeActivity({
        id: "garden-hiking",
        name: "Coastal Hiking",
        description:
          "Explore coastal and forest hiking trails.",
        duration: "2–6 hours",
        pricePerPerson: 0,
        source: "SANParks"
      }),
      makeActivity({
        id: "garden-kayak",
        name: "Kayaking",
        description:
          "Explore sections of the Garden Route by kayak.",
        duration: "2 hours",
        pricePerPerson: 550,
        bookingRequired: true,
        source: "Local activity operator"
      })
    ],

    booking: booking("SANParks / local operators"),

    map: map(
      "Garden Route",
      "Western & Eastern Cape",
      -34.0151,
      23.9045
    ),

    dataQuality: {
      price: "verified-Storms-River-price",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 5. DRAKENSBERG
  // ============================================================

  {
    id: 5,
    name: "Drakensberg Mountains",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/22/South_Africa_-_Drakensberg_%2816261357780%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Mountains",
    location: "KwaZulu-Natal, South Africa",

    description:
      "South Africa's major mountain range, known for dramatic scenery, hiking opportunities and internationally important rock art.",

    source: "South African Tourism / UNESCO",

    accommodations: [
      makeAccommodation({
        id: "drakensberg-resort",
        name: "Drakensberg Mountain Resort",
        image: "../assets/accommodation/drakensberg.jpg",
        description:
          "Mountain accommodation providing access to hiking and scenic areas.",
        priceFrom: 1200,
        rating: 4.3,
        distanceKm: 5,
        type: "Resort / Lodge",
        facilities: [
          "Mountain views",
          "Hiking access",
          "Restaurant",
          "Parking",
          "Swimming pool",
          "Wi-Fi"
        ],
        address: "Drakensberg, KwaZulu-Natal",
        phone: "+27 36 000 0000",
        roomTypes: [
          "Standard Room",
          "Chalet",
          "Family Room"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "drakensberg-hike",
        name: "Mountain Hiking",
        description:
          "Explore hiking routes through the Drakensberg.",
        duration: "3–8 hours",
        pricePerPerson: 0,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "drakensberg-rock-art",
        name: "Rock Art Visit",
        description:
          "Explore areas containing San rock art.",
        duration: "2–4 hours",
        pricePerPerson: 250,
        bookingRequired: true,
        source: "South African Tourism / UNESCO"
      })
    ],

    booking: booking("Local accommodation / activity operator"),

    map: map(
      "Drakensberg Mountains",
      "KwaZulu-Natal",
      -28.7550,
      28.8950
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 6. ROBBEN ISLAND
  // ============================================================

  {
    id: 6,
    name: "Robben Island",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/24/Robben_Island_-_Cape_Town%2C_South_Africa_%283883849594%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Culture & History",
    location: "Cape Town, Western Cape, South Africa",

    description:
      "UNESCO World Heritage site associated with South Africa's political history and the history of imprisonment on the island.",

    source: "UNESCO / Robben Island Museum",

    accommodations: [
      makeAccommodation({
        id: "robben-cape-town",
        name: "Cape Town Waterfront Hotel",
        image: "../assets/accommodation/cape-town-waterfront.jpg",
        description:
          "Hotel accommodation near the Robben Island ferry departure area.",
        priceFrom: 1800,
        rating: 4.4,
        distanceKm: 2,
        type: "Hotel",
        facilities: [
          "Wi-Fi",
          "Breakfast",
          "Restaurant",
          "Parking",
          "Waterfront access"
        ],
        address: "Cape Town Waterfront",
        phone: "+27 21 000 0000",
        roomTypes: [
          "Standard Room",
          "Deluxe Room"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "robben-tour",
        name: "Robben Island Museum Tour",
        description:
          "Guided heritage experience on Robben Island.",
        duration: "Several hours",
        pricePerPerson: 600,
        bookingRequired: true,
        source: "Robben Island Museum"
      })
    ],

    booking: booking("Robben Island Museum"),

    map: map(
      "Robben Island",
      "Cape Town, Western Cape",
      -33.8069,
      18.3662
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 7. BLYDE RIVER CANYON
  // ============================================================

  {
    id: 7,
    name: "Blyde River Canyon",
    image: "https://upload.wikimedia.org/wikipedia/commons/f/fd/20131119_162543b.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Nature",
    location: "Mpumalanga, South Africa",

    description:
      "Major scenic canyon and natural landmark in Mpumalanga forming part of the Panorama Route.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "blyde-lodge",
        name: "Blyde Canyon Lodge",
        image: "../assets/accommodation/blyde.jpg",
        description:
          "Lodge accommodation near the Blyde River Canyon area.",
        priceFrom: 1100,
        rating: 4.4,
        distanceKm: 8,
        type: "Lodge",
        facilities: [
          "Mountain views",
          "Parking",
          "Wi-Fi",
          "Swimming pool",
          "Restaurant"
        ],
        address: "Blyde River Canyon, Mpumalanga",
        phone: "+27 13 000 0000",
        roomTypes: [
          "Standard Room",
          "Chalet"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "blyde-viewpoints",
        name: "Canyon Viewpoints",
        description:
          "Visit scenic viewpoints around the canyon.",
        duration: "Half day",
        pricePerPerson: 150,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "blyde-hiking",
        name: "Nature Hiking",
        description:
          "Explore local trails and viewpoints.",
        duration: "2–5 hours",
        pricePerPerson: 100,
        source: "South African Tourism"
      })
    ],

    booking: booking("Local accommodation / attraction"),

    map: map(
      "Blyde River Canyon",
      "Mpumalanga",
      -24.5167,
      30.8000
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 8. ADDO
  // ============================================================

  {
    id: 8,
    name: "Addo Elephant National Park",
    image: "https://upload.wikimedia.org/wikipedia/commons/9/94/Elephant_Addo.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Wildlife",
    location: "Eastern Cape, South Africa",

    description:
      "Major wildlife park known for elephants and diverse landscapes, with SANParks accommodation and visitor facilities.",

    source: "SANParks",

    accommodations: [
      makeAccommodation({
        id: "addo-main-camp",
        name: "Addo Main Camp",
        image: "../assets/accommodation/addo.jpg",
        description:
          "SANParks main rest camp with chalets, cottages, safari tents and camping.",
        priceFrom: 900,
        rating: 4.5,
        distanceKm: 0,
        type: "Rest Camp",
        facilities: [
          "Restaurant",
          "Shop",
          "Swimming pool",
          "Fuel",
          "Waterhole",
          "Underground hide"
        ],
        address: "Addo Elephant National Park",
        phone: "+27 42 233 8600",
        roomTypes: [
          "Chalet",
          "Cottage",
          "Safari Tent",
          "Camping"
        ],
        source: "SANParks / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "addo-game-drive",
        name: "Game Drive",
        description:
          "Wildlife viewing inside Addo Elephant National Park.",
        duration: "2–3 hours",
        pricePerPerson: 650,
        bookingRequired: true,
        source: "SANParks"
      }),
      makeActivity({
        id: "addo-self-drive",
        name: "Self-drive Safari",
        description:
          "Explore the park on the public visitor road network.",
        duration: "Flexible",
        pricePerPerson: 0,
        source: "SANParks"
      })
    ],

    booking: booking("SANParks"),

    map: map(
      "Addo Elephant National Park",
      "Eastern Cape",
      -33.4456,
      25.7453
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 9. iSIMANGALISO
  // ============================================================

  {
    id: 9,
    name: "iSimangaliso Wetland Park",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/03/GreaterStLucia.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Wetlands & Wildlife",
    location: "KwaZulu-Natal, South Africa",

    description:
      "Large protected wetland and coastal area with lakes, beaches, wildlife and diverse ecosystems.",

    source: "South African Tourism / UNESCO",

    accommodations: [
      makeAccommodation({
        id: "isimangaliso-stlucia",
        name: "St Lucia Safari Lodge",
        image: "../assets/accommodation/st-lucia.jpg",
        description:
          "Accommodation in the St Lucia area providing access to iSimangaliso experiences.",
        priceFrom: 1000,
        rating: 4.3,
        distanceKm: 3,
        type: "Lodge",
        facilities: [
          "Wi-Fi",
          "Parking",
          "Swimming pool",
          "Breakfast",
          "Tour booking"
        ],
        address: "St Lucia, KwaZulu-Natal",
        phone: "+27 35 000 0000",
        roomTypes: [
          "Standard Room",
          "Family Room"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "isimangaliso-boat",
        name: "Estuary Boat Cruise",
        description:
          "Wildlife and wetland viewing by boat.",
        duration: "2 hours",
        pricePerPerson: 450,
        bookingRequired: true,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "isimangaliso-beach",
        name: "Beach & Coastal Visit",
        description:
          "Explore protected coastal landscapes and beaches.",
        duration: "Flexible",
        pricePerPerson: 0,
        source: "South African Tourism"
      })
    ],

    booking: booking("Local operator / accommodation"),

    map: map(
      "iSimangaliso Wetland Park",
      "KwaZulu-Natal",
      -28.3770,
      32.4100
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 10. CAPE WINELANDS
  // ============================================================

  {
    id: 10,
    name: "Cape Winelands",
    image: "https://upload.wikimedia.org/wikipedia/commons/b/b8/FAFK14.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Food & Culture",
    location: "Western Cape, South Africa",

    description:
      "Scenic wine-producing region known for wine tasting, food, historic towns and mountain landscapes.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "winelands-guesthouse",
        name: "Cape Winelands Guesthouse",
        image: "../assets/accommodation/winelands.jpg",
        description:
          "Guesthouse accommodation in the Cape Winelands.",
        priceFrom: 1400,
        rating: 4.5,
        distanceKm: 3,
        type: "Guesthouse / Farm Stay",
        facilities: [
          "Wi-Fi",
          "Breakfast",
          "Parking",
          "Dining",
          "Garden",
          "Wine estate access"
        ],
        address: "Cape Winelands, Western Cape",
        phone: "+27 21 000 0000",
        roomTypes: [
          "Standard Room",
          "Luxury Room"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "winelands-tasting",
        name: "Wine Tasting",
        description:
          "Wine tasting at participating estates.",
        duration: "1–3 hours",
        pricePerPerson: 250,
        bookingRequired: true,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "winelands-food",
        name: "Food & Estate Tour",
        description:
          "Explore estate restaurants, scenery and local produce.",
        duration: "2–4 hours",
        pricePerPerson: 450,
        bookingRequired: true,
        source: "South African Tourism"
      })
    ],

    booking: booking("Wine estate / tour operator"),

    map: map(
      "Cape Winelands",
      "Western Cape",
      -33.9346,
      18.8602
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 11. ROBBERG
  // ============================================================

  {
    id: 11,
    name: "Robberg Nature Reserve",
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a3/Robberg_Nature_Reserve%2C_Plettenberg_Bay_-_53147416220.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Coast & Hiking",
    location: "Plettenberg Bay, Western Cape, South Africa",

    description:
      "Coastal reserve near Plettenberg Bay known for dramatic cliffs, beaches, hiking and marine scenery.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "robberg-plett",
        name: "Plettenberg Bay Coastal Lodge",
        image: "../assets/accommodation/plettenberg.jpg",
        description:
          "Coastal accommodation near Robberg Nature Reserve.",
        priceFrom: 1300,
        rating: 4.4,
        distanceKm: 6,
        type: "Lodge / Guesthouse",
        facilities: [
          "Wi-Fi",
          "Parking",
          "Breakfast",
          "Swimming pool",
          "Tour assistance"
        ],
        address: "Plettenberg Bay, Western Cape",
        phone: "+27 44 000 0000",
        roomTypes: [
          "Standard Room",
          "Family Room"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "robberg-hike",
        name: "Robberg Hiking",
        description:
          "Coastal hiking around the reserve.",
        duration: "2–5 hours",
        pricePerPerson: 100,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "robberg-coast",
        name: "Coastal Wildlife Viewing",
        description:
          "Enjoy coastal scenery and marine wildlife viewpoints.",
        duration: "1–3 hours",
        pricePerPerson: 0,
        source: "South African Tourism"
      })
    ],

    booking: booking("Reserve / nearby accommodation"),

    map: map(
      "Robberg Nature Reserve",
      "Plettenberg Bay, Western Cape",
      -34.0986,
      23.3786
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 12. GOLDEN GATE
  // ============================================================

  {
    id: 12,
    name: "Golden Gate Highlands National Park",
    image: "https://upload.wikimedia.org/wikipedia/commons/0/0e/Brandwag_-_panoramio.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Mountains & Wildlife",
    location: "Free State, South Africa",

    description:
      "Mountain park known for sandstone cliffs, highland scenery, hiking and wildlife.",

    source: "SANParks",

    accommodations: [
      makeAccommodation({
        id: "golden-glen-reenen",
        name: "Glen Reenen Rest Camp",
        image: "../assets/accommodation/glen-reenen.jpg",
        description:
          "SANParks accommodation in Golden Gate Highlands National Park.",
        priceFrom: 339,
        rating: 4.4,
        distanceKm: 0,
        type: "Rest Camp",
        facilities: [
          "Chalets",
          "Camping",
          "Self-catering",
          "Parking",
          "Mountain views"
        ],
        address: "Golden Gate Highlands National Park",
        phone: "+27 58 255 1000",
        roomTypes: [
          "Chalet",
          "Camping"
        ],
        source: "SANParks"
      })
    ],

    activities: [
      makeActivity({
        id: "golden-hiking",
        name: "Mountain Hiking",
        description:
          "Explore highland trails and sandstone landscapes.",
        duration: "2–6 hours",
        pricePerPerson: 0,
        source: "SANParks"
      }),
      makeActivity({
        id: "golden-scenic",
        name: "Scenic Drive",
        description:
          "Drive through the park's mountain scenery.",
        duration: "2–4 hours",
        pricePerPerson: 0,
        source: "SANParks"
      })
    ],

    booking: booking("SANParks"),

    map: map(
      "Golden Gate Highlands National Park",
      "Free State",
      -28.5167,
      28.6167
    ),

    dataQuality: {
      price: "verified-campsite-price",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 13. HLUHLUWE-IMFOLOZI
  // ============================================================

  {
    id: 13,
    name: "Hluhluwe-iMfolozi Park",
    image: "https://upload.wikimedia.org/wikipedia/commons/b/b5/Hluhluwe_green_hills_..._%2847294082242%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Wildlife",
    location: "KwaZulu-Natal, South Africa",

    description:
      "Major KwaZulu-Natal wildlife reserve with an important rhino conservation history and excellent game-viewing opportunities.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "hluhluwe-lodge",
        name: "Hluhluwe Safari Lodge",
        image: "../assets/accommodation/hluhluwe.jpg",
        description:
          "Safari lodge near Hluhluwe-iMfolozi Park.",
        priceFrom: 1450,
        rating: 4.3,
        distanceKm: 8,
        type: "Safari Lodge",
        facilities: [
          "Game viewing",
          "Restaurant",
          "Parking",
          "Swimming pool",
          "Wi-Fi"
        ],
        address: "Hluhluwe, KwaZulu-Natal",
        phone: "+27 35 000 0000",
        roomTypes: [
          "Safari Room",
          "Chalet"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "hluhluwe-game-drive",
        name: "Game Drive",
        description:
          "Wildlife viewing through the reserve.",
        duration: "2–3 hours",
        pricePerPerson: 700,
        bookingRequired: true,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "hluhluwe-rhino",
        name: "Rhino Conservation Experience",
        description:
          "Learn about the area's rhino conservation heritage.",
        duration: "2 hours",
        pricePerPerson: 500,
        bookingRequired: true,
        source: "South African Tourism"
      })
    ],

    booking: booking("Reserve / local operator"),

    map: map(
      "Hluhluwe-iMfolozi Park",
      "KwaZulu-Natal",
      -28.2250,
      31.9500
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 14. PILANESBERG
  // ============================================================

  {
    id: 14,
    name: "Pilanesberg National Park",
    image: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Animals_at_Pilanesberg_National_Park_4.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Wildlife",
    location: "North West, South Africa",

    description:
      "Wildlife reserve near Sun City with a road network suited to self-drive and guided game viewing.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "pilanesberg-lodge",
        name: "Pilanesberg Safari Lodge",
        image: "../assets/accommodation/pilanesberg.jpg",
        description:
          "Safari lodge close to Pilanesberg National Park.",
        priceFrom: 1600,
        rating: 4.4,
        distanceKm: 5,
        type: "Safari Lodge",
        facilities: [
          "Game drives",
          "Restaurant",
          "Pool",
          "Parking",
          "Wi-Fi"
        ],
        address: "Pilanesberg, North West",
        phone: "+27 14 000 0000",
        roomTypes: [
          "Standard Room",
          "Safari Chalet"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "pilanesberg-game-drive",
        name: "Game Drive",
        description:
          "Guided wildlife viewing.",
        duration: "2–3 hours",
        pricePerPerson: 700,
        bookingRequired: true,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "pilanesberg-self-drive",
        name: "Self-drive Safari",
        description:
          "Explore the park by vehicle.",
        duration: "Flexible",
        pricePerPerson: 0,
        source: "South African Tourism"
      })
    ],

    booking: booking("Park / lodge / tour operator"),

    map: map(
      "Pilanesberg National Park",
      "North West",
      -25.2600,
      27.0900
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 15. AUGRABIES
  // ============================================================

  {
    id: 15,
    name: "Augrabies Falls National Park",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/33/Augrabie%2C_Waterfalls%2C_South_Africa.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Waterfalls & Nature",
    location: "Northern Cape, South Africa",

    description:
      "National park centred on the Orange River and the spectacular Augrabies Falls.",

    source: "SANParks",

    accommodations: [
      makeAccommodation({
        id: "augrabies-chalet",
        name: "Augrabies Falls Chalet",
        image: "../assets/accommodation/augrabies.jpg",
        description:
          "SANParks chalet accommodation at Augrabies Falls National Park.",
        priceFrom: 1845,
        rating: 4.4,
        distanceKm: 0,
        type: "Chalet",
        facilities: [
          "Self-catering",
          "Park facilities",
          "Scenic viewpoints",
          "Parking",
          "Swimming pool"
        ],
        address: "Augrabies Falls National Park",
        phone: "+27 54 452 9200",
        roomTypes: [
          "Chalet",
          "Camping"
        ],
        source: "SANParks"
      })
    ],

    activities: [
      makeActivity({
        id: "augrabies-viewpoint",
        name: "Falls Viewpoints",
        description:
          "Visit viewpoints overlooking Augrabies Falls.",
        duration: "1–2 hours",
        pricePerPerson: 0,
        source: "SANParks"
      }),
      makeActivity({
        id: "augrabies-hiking",
        name: "Nature Trail",
        description:
          "Explore marked trails in the park.",
        duration: "2–4 hours",
        pricePerPerson: 0,
        source: "SANParks"
      })
    ],

    booking: booking("SANParks"),

    map: map(
      "Augrabies Falls National Park",
      "Northern Cape",
      -28.5953,
      20.3297
    ),

    dataQuality: {
      price: "verified-chalet-price",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 16. NAMAQUA
  // ============================================================

  {
    id: 16,
    name: "Namaqua National Park",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/db/Namaqua_NP4.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Flowers & Nature",
    location: "Northern Cape, South Africa",

    description:
      "Arid protected area famous for seasonal wildflowers and Namaqualand landscapes.",

    source: "SANParks",

    accommodations: [
      makeAccommodation({
        id: "namaqua-skilpad",
        name: "Skilpad Rest Camp",
        image: "../assets/accommodation/skilpad.jpg",
        description:
          "SANParks accommodation with chalets in Namaqua National Park.",
        priceFrom: 900,
        rating: 4.3,
        distanceKm: 0,
        type: "Rest Camp",
        facilities: [
          "Chalets",
          "Self-catering",
          "Nature setting",
          "Parking",
          "Braai facilities"
        ],
        address: "Namaqua National Park",
        phone: "+27 27 672 1948",
        roomTypes: [
          "Chalet"
        ],
        source: "SANParks / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "namaqua-flowers",
        name: "Wildflower Viewing",
        description:
          "Seasonal flower viewing during the flowering period.",
        duration: "2–5 hours",
        pricePerPerson: 0,
        source: "SANParks"
      }),
      makeActivity({
        id: "namaqua-drive",
        name: "Scenic Drive",
        description:
          "Explore the park's arid landscapes.",
        duration: "Flexible",
        pricePerPerson: 0,
        source: "SANParks"
      })
    ],

    booking: booking("SANParks"),

    map: map(
      "Namaqua National Park",
      "Northern Cape",
      -30.0000,
      17.6000
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 17. CANGO CAVES
  // ============================================================

  {
    id: 17,
    name: "Cango Caves",
    image: "https://upload.wikimedia.org/wikipedia/commons/9/92/Cango_Caves-001.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Caves & Nature",
    location: "Oudtshoorn, Western Cape, South Africa",

    description:
      "Major limestone cave attraction near Oudtshoorn with guided cave tours and impressive underground formations.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "cango-oudtshoorn",
        name: "Oudtshoorn Guesthouse",
        image: "../assets/accommodation/oudtshoorn.jpg",
        description:
          "Nearby Oudtshoorn accommodation.",
        priceFrom: 850,
        rating: 4.3,
        distanceKm: 30,
        type: "Guesthouse",
        facilities: [
          "Wi-Fi",
          "Breakfast",
          "Parking",
          "Swimming pool",
          "Tour assistance"
        ],
        address: "Oudtshoorn, Western Cape",
        phone: "+27 44 000 0000",
        roomTypes: [
          "Standard Room",
          "Family Room"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "cango-standard",
        name: "Cave Tour",
        description:
          "Guided tour through the cave system.",
        duration: "1 hour",
        pricePerPerson: 220,
        bookingRequired: true,
        source: "Cango Caves"
      }),
      makeActivity({
        id: "cango-adventure",
        name: "Adventure Cave Tour",
        description:
          "Adventure-oriented cave experience.",
        duration: "1.5 hours",
        pricePerPerson: 350,
        bookingRequired: true,
        source: "Cango Caves"
      })
    ],

    booking: booking("Cango Caves"),

    map: map(
      "Cango Caves",
      "Oudtshoorn, Western Cape",
      -33.4097,
      22.2167
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 18. CAPE POINT
  // ============================================================

  {
    id: 18,
    name: "Cape Point",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/78/Goodhope2.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Coast & Nature",
    location: "Cape Peninsula, Western Cape, South Africa",

    description:
      "Major Cape Peninsula landmark with dramatic coastal scenery, viewpoints and access to Table Mountain National Park.",

    source: "SANParks / South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "cape-point-smits",
        name: "Smitswinkel Tented Camp",
        image: "../assets/accommodation/smitswinkel.jpg",
        description:
          "SANParks tented accommodation in the wider Cape Point area.",
        priceFrom: 965,
        rating: 4.4,
        distanceKm: 25,
        type: "Tented Camp",
        facilities: [
          "Self-catering",
          "Bedding",
          "Cooking facilities",
          "Nature setting"
        ],
        address: "Table Mountain National Park",
        phone: "+27 21 712 0527",
        roomTypes: [
          "2-bed tent",
          "4-bed tent"
        ],
        source: "SANParks"
      })
    ],

    activities: [
      makeActivity({
        id: "cape-point-view",
        name: "Cape Point Viewpoints",
        description:
          "Visit viewpoints around Cape Point.",
        duration: "2–3 hours",
        pricePerPerson: 450,
        source: "SANParks"
      }),
      makeActivity({
        id: "cape-point-hike",
        name: "Cape Point Hiking",
        description:
          "Explore coastal trails.",
        duration: "2–5 hours",
        pricePerPerson: 0,
        source: "SANParks"
      })
    ],

    booking: booking("SANParks"),

    map: map(
      "Cape Point",
      "Western Cape",
      -34.3568,
      18.4973
    ),

    dataQuality: {
      price: "verified-SANParks-accommodation-price",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 19. BOULDERS BEACH
  // ============================================================

  {
    id: 19,
    name: "Boulders Beach",
    image: "https://upload.wikimedia.org/wikipedia/commons/9/95/Boulders_Beach_Suedafrika.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Beach & Wildlife",
    location: "Simon's Town, Western Cape, South Africa",

    description:
      "Protected coastal site famous for its African penguin colony, beaches and boardwalk viewing areas.",

    source: "SANParks / South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "boulders-smits",
        name: "Smitswinkel Tented Camp",
        image: "../assets/accommodation/smitswinkel.jpg",
        description:
          "SANParks accommodation in the wider Cape Peninsula area.",
        priceFrom: 965,
        rating: 4.4,
        distanceKm: 13,
        type: "Tented Camp",
        facilities: [
          "Self-catering",
          "Bedding",
          "Cooking facilities",
          "Nature setting"
        ],
        address: "Table Mountain National Park",
        phone: "+27 21 712 0527",
        roomTypes: [
          "2-bed tent",
          "4-bed tent"
        ],
        source: "SANParks"
      })
    ],

    activities: [
      makeActivity({
        id: "boulders-penguins",
        name: "Penguin Viewing",
        description:
          "View African penguins from designated areas and boardwalks.",
        duration: "1–2 hours",
        pricePerPerson: 190,
        source: "SANParks"
      }),
      makeActivity({
        id: "boulders-beach",
        name: "Beach Visit",
        description:
          "Visit the protected beaches around Boulders.",
        duration: "Flexible",
        pricePerPerson: 0,
        source: "SANParks"
      })
    ],

    booking: booking("SANParks"),

    map: map(
      "Boulders Beach",
      "Simon's Town, Western Cape",
      -34.1975,
      18.4520
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 20. KIRSTENBOSCH
  // ============================================================

  {
    id: 20,
    name: "Kirstenbosch National Botanical Garden",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/53/Kirstenbosch_National_Botanical_Garden_2024_7th_batch_09.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Gardens & Nature",
    location: "Cape Town, Western Cape, South Africa",

    description:
      "Major botanical garden on the eastern slopes of Table Mountain featuring South African plant life and scenic walking areas.",

    source: "SANBI / South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "kirstenbosch-cape-town",
        name: "Constantia / Newlands Guesthouse",
        image: "../assets/accommodation/newlands.jpg",
        description:
          "Nearby Cape Town accommodation in the Constantia or Newlands area.",
        priceFrom: 1200,
        rating: 4.4,
        distanceKm: 3,
        type: "Guesthouse / Hotel",
        facilities: [
          "Wi-Fi",
          "Breakfast",
          "Parking",
          "Garden",
          "Restaurant nearby"
        ],
        address: "Newlands, Cape Town",
        phone: "+27 21 000 0000",
        roomTypes: [
          "Standard Room",
          "Deluxe Room"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "kirstenbosch-garden",
        name: "Garden Walk",
        description:
          "Explore botanical collections and garden landscapes.",
        duration: "2–4 hours",
        pricePerPerson: 250,
        source: "SANBI"
      }),
      makeActivity({
        id: "kirstenbosch-skywalk",
        name: "Tree Canopy Walk",
        description:
          "Experience elevated views over the garden.",
        duration: "1 hour",
        pricePerPerson: 0,
        source: "SANBI"
      })
    ],

    booking: booking("SANBI / nearby accommodation"),

    map: map(
      "Kirstenbosch National Botanical Garden",
      "Cape Town, Western Cape",
      -33.9881,
      18.4328
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 21. HERMANUS
  // ============================================================

  {
    id: 21,
    name: "Hermanus",
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a7/Hermanus_Old_Harbour.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Coast & Wildlife",
    location: "Western Cape, South Africa",

    description:
      "Coastal town known for ocean scenery, coastal walks and seasonal whale viewing.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "hermanus-coastal",
        name: "Hermanus Coastal Guesthouse",
        image: "../assets/accommodation/hermanus.jpg",
        description:
          "Accommodation in Hermanus close to coastal attractions.",
        priceFrom: 1300,
        rating: 4.5,
        distanceKm: 2,
        type: "Guesthouse / Hotel",
        facilities: [
          "Wi-Fi",
          "Breakfast",
          "Parking",
          "Ocean views",
          "Restaurant nearby"
        ],
        address: "Hermanus, Western Cape",
        phone: "+27 28 000 0000",
        roomTypes: [
          "Standard Room",
          "Sea View Room"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "hermanus-whale",
        name: "Whale Watching",
        description:
          "Seasonal whale viewing from the coast or authorised operators.",
        duration: "2–3 hours",
        pricePerPerson: 1000,
        bookingRequired: true,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "hermanus-walk",
        name: "Cliff Path Walk",
        description:
          "Walk along Hermanus's coastal paths.",
        duration: "2–4 hours",
        pricePerPerson: 0,
        source: "South African Tourism"
      })
    ],

    booking: booking("Local operator / accommodation"),

    map: map(
      "Hermanus",
      "Western Cape",
      -34.4187,
      19.2345
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 22. KNYSNA
  // ============================================================

  {
    id: 22,
    name: "Knysna",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/50/Knysna_waterfront.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Coast & Forest",
    location: "Western Cape, South Africa",

    description:
      "Garden Route town centred on the Knysna Lagoon and surrounded by forests and coastal scenery.",

    source: "South African Tourism / SANParks",

    accommodations: [
      makeAccommodation({
        id: "knysna-lakes",
        name: "Knysna Lakes Guesthouse",
        image: "../assets/accommodation/knysna.jpg",
        description:
          "Accommodation in the Knysna Lakes and Garden Route area.",
        priceFrom: 1100,
        rating: 4.4,
        distanceKm: 2,
        type: "Lodge / Guesthouse",
        facilities: [
          "Wi-Fi",
          "Parking",
          "Lagoon access",
          "Restaurant nearby",
          "Breakfast"
        ],
        address: "Knysna, Western Cape",
        phone: "+27 44 000 0000",
        roomTypes: [
          "Standard Room",
          "Family Room"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "knysna-lagoon",
        name: "Lagoon Cruise",
        description:
          "Explore the Knysna Lagoon by boat.",
        duration: "2 hours",
        pricePerPerson: 450,
        bookingRequired: true,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "knysna-forest",
        name: "Forest Walk",
        description:
          "Explore the forests surrounding Knysna.",
        duration: "2–4 hours",
        pricePerPerson: 0,
        source: "South African Tourism"
      })
    ],

    booking: booking("Local operator / accommodation"),

    map: map(
      "Knysna",
      "Western Cape",
      -34.0363,
      23.0471
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 23. SUN CITY
  // ============================================================

  {
    id: 23,
    name: "Sun City",
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Sun_City_Casino%2C_Sun_City%2C_North_West%2C_South_Africa_%2819910947343%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Resort & Entertainment",
    location: "North West, South Africa",

    description:
      "Large resort destination near Pilanesberg offering accommodation, entertainment, leisure facilities and access to nearby wildlife experiences.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "sun-city-resort",
        name: "Sun City Resort Accommodation",
        image: "../assets/accommodation/sun-city.jpg",
        description:
          "Resort accommodation within Sun City.",
        priceFrom: 1800,
        rating: 4.5,
        distanceKm: 0,
        type: "Resort",
        facilities: [
          "Pools",
          "Restaurants",
          "Entertainment",
          "Golf",
          "Family activities",
          "Wi-Fi",
          "Spa"
        ],
        address: "Sun City, North West",
        phone: "+27 14 557 1000",
        roomTypes: [
          "Standard Room",
          "Luxury Room",
          "Family Room"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "sun-city-leisure",
        name: "Resort Leisure Activities",
        description:
          "Enjoy the resort's leisure and entertainment facilities.",
        duration: "Flexible",
        pricePerPerson: 350,
        bookingRequired: true,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "sun-city-pilanesberg",
        name: "Pilanesberg Safari",
        description:
          "Combine the resort visit with wildlife activities in nearby Pilanesberg.",
        duration: "Half day",
        pricePerPerson: 850,
        bookingRequired: true,
        source: "South African Tourism"
      })
    ],

    booking: booking("Sun City / local operators"),

    map: map(
      "Sun City",
      "North West",
      -25.3445,
      27.0970
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 24. V&A WATERFRONT
  // ============================================================

  {
    id: 24,
    name: "V&A Waterfront",
    image: "https://upload.wikimedia.org/wikipedia/commons/4/41/Signal_Hill_and_Ferris_wheel_from_Victoria_Wharf_balcony%2C_Cape_Town.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "City & Shopping",
    location: "Cape Town, Western Cape, South Africa",

    description:
      "Major Cape Town waterfront precinct with shopping, dining, entertainment, harbour views and visitor attractions.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "va-waterfront-hotel",
        name: "V&A Waterfront Hotel",
        image: "../assets/accommodation/va-waterfront.jpg",
        description:
          "Waterfront-area hotel accommodation.",
        priceFrom: 2200,
        rating: 4.5,
        distanceKm: 0.5,
        type: "Hotel",
        facilities: [
          "Wi-Fi",
          "Restaurant",
          "Parking",
          "Harbour access",
          "Concierge",
          "Pool"
        ],
        address: "V&A Waterfront, Cape Town",
        phone: "+27 21 000 0000",
        roomTypes: [
          "Standard Room",
          "Deluxe Room",
          "Suite"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "va-shopping",
        name: "Shopping & Dining",
        description:
          "Explore shops, restaurants and waterfront entertainment.",
        duration: "Flexible",
        pricePerPerson: 0,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "va-harbour",
        name: "Harbour Boat Experience",
        description:
          "Take a harbour or boat experience.",
        duration: "1–2 hours",
        pricePerPerson: 250,
        bookingRequired: true,
        source: "South African Tourism"
      })
    ],

    booking: booking("Waterfront operator / hotel"),

    map: map(
      "V&A Waterfront",
      "Cape Town, Western Cape",
      -33.9036,
      18.4208
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 25. CRADLE OF HUMANKIND
  // ============================================================

  {
    id: 25,
    name: "Cradle of Humankind",
    image: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Cradle_of_Humankind_in_Gauteng_map.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Heritage & Science",
    location: "Gauteng, South Africa",

    description:
      "UNESCO World Heritage area containing important fossil hominin sites and caves associated with human evolution research.",

    source: "UNESCO / South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "cradle-lodge",
        name: "Cradle of Humankind Lodge",
        image: "../assets/accommodation/cradle.jpg",
        description:
          "Lodge accommodation in the Cradle of Humankind area.",
        priceFrom: 1500,
        rating: 4.4,
        distanceKm: 5,
        type: "Lodge",
        facilities: [
          "Wi-Fi",
          "Restaurant",
          "Parking",
          "Nature setting",
          "Swimming pool"
        ],
        address: "Cradle of Humankind, Gauteng",
        phone: "+27 11 000 0000",
        roomTypes: [
          "Standard Room",
          "Luxury Room"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "cradle-caves",
        name: "Cave / Fossil Site Visit",
        description:
          "Explore authorised visitor areas associated with fossil sites.",
        duration: "2–4 hours",
        pricePerPerson: 300,
        bookingRequired: true,
        source: "UNESCO / site operator"
      }),
      makeActivity({
        id: "cradle-heritage",
        name: "Human Evolution Experience",
        description:
          "Learn about human evolution and fossil discoveries.",
        duration: "2–3 hours",
        pricePerPerson: 250,
        source: "UNESCO"
      })
    ],

    booking: booking("Site operator / nearby accommodation"),

    map: map(
      "Cradle of Humankind",
      "Gauteng",
      -25.9700,
      27.7100
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 26. MAPUNGUBWE
  // ============================================================

  {
    id: 26,
    name: "Mapungubwe National Park",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Mapungubwe%2C_Limpopo%2C_South_Africa_%2820535429052%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Wildlife & Heritage",
    location: "Limpopo, South Africa",

    description:
      "National park and cultural landscape associated with Mapungubwe, an important early southern African kingdom.",

    source: "SANParks / UNESCO",

    accommodations: [
      makeAccommodation({
        id: "mapungubwe-forest",
        name: "Limpopo Forest Tented Camp",
        image: "../assets/accommodation/mapungubwe.jpg",
        description:
          "SANParks tented accommodation in Mapungubwe National Park.",
        priceFrom: 1705,
        rating: 4.5,
        distanceKm: 0,
        type: "Tented Camp",
        facilities: [
          "Tented accommodation",
          "Self-catering",
          "Nature setting",
          "Park facilities",
          "Kitchen"
        ],
        address: "Mapungubwe National Park",
        phone: "+27 15 534 2018",
        roomTypes: [
          "Luxury Tent"
        ],
        source: "SANParks"
      })
    ],

    activities: [
      makeActivity({
        id: "mapungubwe-heritage",
        name: "Mapungubwe Heritage Experience",
        description:
          "Learn about the archaeological and cultural landscape.",
        duration: "2–4 hours",
        pricePerPerson: 350,
        bookingRequired: true,
        source: "SANParks / UNESCO"
      }),
      makeActivity({
        id: "mapungubwe-game",
        name: "Game Viewing",
        description:
          "Wildlife viewing in the national park.",
        duration: "2–3 hours",
        pricePerPerson: 650,
        bookingRequired: true,
        source: "SANParks"
      })
    ],

    booking: booking("SANParks"),

    map: map(
      "Mapungubwe National Park",
      "Limpopo",
      -22.1920,
      29.3730
    ),

    dataQuality: {
      price: "verified-Limpopo-Forest-price",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 27. ROYAL NATAL
  // ============================================================

  {
    id: 27,
    name: "Royal Natal National Park",
    image: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Royal_Natal_Drakensberg_2015.JPG?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Mountains",
    location: "KwaZulu-Natal, South Africa",

    description:
      "Mountain destination in the Drakensberg known for dramatic cliffs, hiking and scenic landscapes.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "royal-natal-resort",
        name: "Royal Natal Mountain Resort",
        image: "../assets/accommodation/royal-natal.jpg",
        description:
          "Mountain accommodation near Royal Natal National Park.",
        priceFrom: 1200,
        rating: 4.4,
        distanceKm: 4,
        type: "Resort / Lodge",
        facilities: [
          "Mountain views",
          "Hiking",
          "Restaurant",
          "Parking",
          "Wi-Fi"
        ],
        address: "Royal Natal, KwaZulu-Natal",
        phone: "+27 36 000 0000",
        roomTypes: [
          "Chalet",
          "Family Room"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "royal-natal-hike",
        name: "Drakensberg Hiking",
        description:
          "Explore mountain hiking routes.",
        duration: "3–8 hours",
        pricePerPerson: 0,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "royal-natal-scenic",
        name: "Scenic Viewpoints",
        description:
          "Enjoy views of the Amphitheatre and surrounding mountains.",
        duration: "2–4 hours",
        pricePerPerson: 0,
        source: "South African Tourism"
      })
    ],

    booking: booking("Park / resort / local accommodation"),

    map: map(
      "Royal Natal National Park",
      "KwaZulu-Natal",
      -28.6870,
      28.9370
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 28. WILD COAST
  // ============================================================

  {
    id: 28,
    name: "Wild Coast",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/34/Coffee_Bay.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Coast & Culture",
    location: "Eastern Cape, South Africa",

    description:
      "South African coastal region known for rugged scenery, beaches, rural landscapes and cultural experiences.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "wild-coast-lodge",
        name: "Wild Coast Coastal Lodge",
        image: "../assets/accommodation/wild-coast.jpg",
        description:
          "Coastal lodge accommodation in the Wild Coast region.",
        priceFrom: 1000,
        rating: 4.2,
        distanceKm: 3,
        type: "Lodge / Guesthouse",
        facilities: [
          "Sea views",
          "Meals",
          "Parking",
          "Walking trails",
          "Wi-Fi"
        ],
        address: "Wild Coast, Eastern Cape",
        phone: "+27 47 000 0000",
        roomTypes: [
          "Standard Room",
          "Chalet"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "wild-coast-hike",
        name: "Coastal Hiking",
        description:
          "Explore beaches, cliffs and coastal paths.",
        duration: "3–8 hours",
        pricePerPerson: 0,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "wild-coast-culture",
        name: "Cultural Experience",
        description:
          "Experience local communities, heritage and scenery.",
        duration: "2–4 hours",
        pricePerPerson: 350,
        bookingRequired: true,
        source: "South African Tourism"
      })
    ],

    booking: booking("Local accommodation / tour operator"),

    map: map(
      "Wild Coast",
      "Eastern Cape",
      -31.6000,
      29.5000
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 29. COFFEE BAY
  // ============================================================

  {
    id: 29,
    name: "Coffee Bay",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/34/Coffee_Bay.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Beach & Coast",
    location: "Eastern Cape, South Africa",

    description:
      "Wild Coast seaside village known for beaches, coastal scenery, fishing and outdoor activities.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "coffee-bay-lodge",
        name: "Coffee Bay Coastal Lodge",
        image: "../assets/accommodation/coffee-bay.jpg",
        description:
          "Accommodation near Coffee Bay's beaches and coastal attractions.",
        priceFrom: 750,
        rating: 4.1,
        distanceKm: 1,
        type: "Lodge / Backpacker / Guesthouse",
        facilities: [
          "Sea views",
          "Meals",
          "Wi-Fi",
          "Parking",
          "Activity booking"
        ],
        address: "Coffee Bay, Eastern Cape",
        phone: "+27 47 000 0000",
        roomTypes: [
          "Dormitory",
          "Standard Room",
          "Chalet"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "coffee-beach",
        name: "Beach Visit",
        description:
          "Enjoy Coffee Bay's coastal scenery and beaches.",
        duration: "Flexible",
        pricePerPerson: 0,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "coffee-hike",
        name: "Coastal Hiking",
        description:
          "Explore the Wild Coast on foot.",
        duration: "2–6 hours",
        pricePerPerson: 0,
        source: "South African Tourism"
      })
    ],

    booking: booking("Local accommodation / operator"),

    map: map(
      "Coffee Bay",
      "Eastern Cape",
      -31.9833,
      29.1500
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 30. HOLE IN THE WALL
  // ============================================================

  {
    id: 30,
    name: "Hole in the Wall",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/71/Hole_In_The_Wall.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Coast & Nature",
    location: "Eastern Cape, South Africa",

    description:
      "Natural rock formation on the Wild Coast south of Coffee Bay, with coastal scenery, hiking and birding opportunities.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "hole-wall-coffee-bay",
        name: "Coffee Bay / Hole in the Wall Lodge",
        image: "../assets/accommodation/hole-in-wall.jpg",
        description:
          "Nearby accommodation in the Coffee Bay and Hole in the Wall area.",
        priceFrom: 850,
        rating: 4.2,
        distanceKm: 5,
        type: "Lodge / Guesthouse",
        facilities: [
          "Sea views",
          "Meals",
          "Parking",
          "Walking trails",
          "Wi-Fi"
        ],
        address: "Hole in the Wall, Eastern Cape",
        phone: "+27 47 000 0000",
        roomTypes: [
          "Standard Room",
          "Chalet"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "hole-wall-hike",
        name: "Hole in the Wall Hike",
        description:
          "Walk to the natural rock formation and surrounding coastline.",
        duration: "2–4 hours",
        pricePerPerson: 0,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "hole-wall-birding",
        name: "Birding",
        description:
          "Enjoy birding opportunities around the coastal landscape.",
        duration: "Flexible",
        pricePerPerson: 0,
        source: "South African Tourism"
      })
    ],

    booking: booking("Local accommodation / operator"),

    map: map(
      "Hole in the Wall",
      "Eastern Cape",
      -31.9070,
      29.2030
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 31. CAPE AGULHAS
  // ============================================================

  {
    id: 31,
    name: "Cape Agulhas",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/d3/Map_of_South_Africa.svg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Coast & Heritage",
    location: "Western Cape, South Africa",

    description:
      "Southern Cape coastal destination associated with the southernmost point of Africa and historic lighthouse scenery.",

    source: "SANParks / South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "agulhas-chalet",
        name: "Agulhas Rest Camp Chalet",
        image: "../assets/accommodation/agulhas.jpg",
        description:
          "SANParks chalet accommodation in the Agulhas National Park area.",
        priceFrom: 1643,
        rating: 4.4,
        distanceKm: 0,
        type: "Chalet",
        facilities: [
          "Self-catering",
          "Parking",
          "Nature setting",
          "Park facilities"
        ],
        address: "Agulhas National Park",
        phone: "+27 28 435 6078",
        roomTypes: [
          "Chalet",
          "Family Chalet"
        ],
        source: "SANParks"
      })
    ],

    activities: [
      makeActivity({
        id: "agulhas-point",
        name: "Southernmost Point Visit",
        description:
          "Visit the iconic southern coastal point.",
        duration: "1–2 hours",
        pricePerPerson: 0,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "agulhas-lighthouse",
        name: "Lighthouse Visit",
        description:
          "Visit the historic Cape Agulhas lighthouse area.",
        duration: "1 hour",
        pricePerPerson: 100,
        source: "South African Tourism"
      })
    ],

    booking: booking("SANParks / local operator"),

    map: map(
      "Cape Agulhas",
      "Western Cape",
      -34.8333,
      20.0000
    ),

    dataQuality: {
      price: "verified-SANParks-price",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 32. WEST COAST NATIONAL PARK
  // ============================================================

  {
    id: 32,
    name: "West Coast National Park",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/54/Langebaan_lagoon%2C_West_Coast_National_Park.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Coast & Wildlife",
    location: "Western Cape, South Africa",

    description:
      "Coastal national park around the Langebaan Lagoon, known for beaches, lagoon scenery, birdlife and seasonal flowers.",

    source: "SANParks",

    accommodations: [
      makeAccommodation({
        id: "west-coast-abrahamskraal",
        name: "Abrahamskraal Cottage",
        image: "../assets/accommodation/abrahamskraal.jpg",
        description:
          "Self-catering SANParks cottage near a waterhole in West Coast National Park.",
        priceFrom: 1400,
        rating: 4.4,
        distanceKm: 0,
        type: "Self-catering Cottage",
        facilities: [
          "Self-catering",
          "Solar electricity",
          "Waterhole nearby",
          "Nature setting",
          "Kitchen"
        ],
        address: "West Coast National Park",
        phone: "+27 22 772 2144",
        roomTypes: [
          "Cottage"
        ],
        source: "SANParks / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "west-coast-flowers",
        name: "Seasonal Wildflower Viewing",
        description:
          "View seasonal spring flowers when conditions are suitable.",
        duration: "2–5 hours",
        pricePerPerson: 0,
        source: "SANParks"
      }),
      makeActivity({
        id: "west-coast-lagoon",
        name: "Lagoon & Birding",
        description:
          "Explore the lagoon and bird-rich wetlands.",
        duration: "2–4 hours",
        pricePerPerson: 0,
        source: "SANParks"
      })
    ],

    booking: booking("SANParks"),

    map: map(
      "West Coast National Park",
      "Western Cape",
      -33.0600,
      18.0600
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 33. KGALAGADI
  // ============================================================

  {
    id: 33,
    name: "Kgalagadi Transfrontier Park",
    image: "https://upload.wikimedia.org/wikipedia/commons/5/5d/Lioness_%28Panthera_leo%29_%286871765268%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Wildlife & Desert",
    location: "Northern Cape, South Africa / Botswana",

    description:
      "Transfrontier conservation area known for red Kalahari landscapes and desert-adapted wildlife.",

    source: "SANParks",

    accommodations: [
      makeAccommodation({
        id: "kgalagadi-twee",
        name: "Twee Rivieren Family Cottage",
        image: "../assets/accommodation/twee-rivieren.jpg",
        description:
          "SANParks family cottage at Twee Rivieren.",
        priceFrom: 2017,
        rating: 4.5,
        distanceKm: 0,
        type: "Family Cottage",
        facilities: [
          "Self-catering",
          "Kitchen",
          "Park facilities",
          "Wildlife setting",
          "Air conditioning"
        ],
        address: "Twee Rivieren, Kgalagadi Transfrontier Park",
        phone: "+27 54 561 2000",
        roomTypes: [
          "Family Cottage"
        ],
        source: "SANParks"
      })
    ],

    activities: [
      makeActivity({
        id: "kgalagadi-game",
        name: "Desert Wildlife Drive",
        description:
          "Wildlife viewing through the Kalahari landscape.",
        duration: "2–5 hours",
        pricePerPerson: 700,
        bookingRequired: true,
        source: "SANParks"
      }),
      makeActivity({
        id: "kgalagadi-birding",
        name: "Birding",
        description:
          "Birdwatching in the park's arid ecosystem.",
        duration: "Flexible",
        pricePerPerson: 0,
        source: "SANParks"
      })
    ],

    booking: booking("SANParks"),

    map: map(
      "Kgalagadi Transfrontier Park",
      "Northern Cape",
      -26.4667,
      20.6167
    ),

    dataQuality: {
      price: "verified-Twee-Rivieren-price",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 34. CAMDEBOO
  // ============================================================

  {
    id: 34,
    name: "Camdeboo National Park",
    image: "https://upload.wikimedia.org/wikipedia/commons/c/cd/Valley_of_Desolation_-_South_Africa_%282417725127%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Karoo Nature",
    location: "Eastern Cape, South Africa",

    description:
      "Karoo national park around Graaff-Reinet with striking landscapes and the Valley of Desolation.",

    source: "SANParks",

    accommodations: [
      makeAccommodation({
        id: "camdeboo-graaff",
        name: "Graaff-Reinet / Camdeboo Accommodation",
        image: "../assets/accommodation/camdeboo.jpg",
        description:
          "Accommodation in the Camdeboo and Graaff-Reinet area.",
        priceFrom: 1000,
        rating: 4.2,
        distanceKm: 5,
        type: "Lodge / Guesthouse",
        facilities: [
          "Parking",
          "Wi-Fi",
          "Karoo views",
          "Restaurant",
          "Breakfast"
        ],
        address: "Graaff-Reinet, Eastern Cape",
        phone: "+27 49 000 0000",
        roomTypes: [
          "Standard Room",
          "Family Room"
        ],
        source: "SANParks / South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "camdeboo-valley",
        name: "Valley of Desolation Viewpoints",
        description:
          "Visit the park's dramatic scenic viewpoints.",
        duration: "2–3 hours",
        pricePerPerson: 100,
        source: "SANParks"
      }),
      makeActivity({
        id: "camdeboo-drive",
        name: "Game / Scenic Drive",
        description:
          "Explore the Karoo landscapes by vehicle.",
        duration: "2–4 hours",
        pricePerPerson: 0,
        source: "SANParks"
      })
    ],

    booking: booking("SANParks / local accommodation"),

    map: map(
      "Camdeboo National Park",
      "Eastern Cape",
      -32.2500,
      24.5333
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 35. KAROO
  // ============================================================

  {
    id: 35,
    name: "Karoo National Park",
    image: "https://upload.wikimedia.org/wikipedia/commons/2/23/Karoo_National_Park_%2827088584151%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Karoo Nature",
    location: "Western Cape, South Africa",

    description:
      "Large Karoo national park with semi-desert scenery, wildlife and mountain landscapes near Beaufort West.",

    source: "SANParks",

    accommodations: [
      makeAccommodation({
        id: "karoo-afsaal",
        name: "Afsaal Cottage",
        image: "../assets/accommodation/karoo-afsaal.jpg",
        description:
          "SANParks cottage accommodation in Karoo National Park.",
        priceFrom: 1152.13,
        rating: 4.4,
        distanceKm: 0,
        type: "Cottage",
        facilities: [
          "Self-catering",
          "Kitchen",
          "Parking",
          "Nature setting",
          "Braai"
        ],
        address: "Karoo National Park",
        phone: "+27 23 415 2828",
        roomTypes: [
          "Afsaal Cottage"
        ],
        source: "SANParks"
      })
    ],

    activities: [
      makeActivity({
        id: "karoo-drive",
        name: "Game / Scenic Drive",
        description:
          "Explore Karoo landscapes and wildlife by vehicle.",
        duration: "2–5 hours",
        pricePerPerson: 0,
        bookingRequired: true,
        source: "SANParks"
      }),
      makeActivity({
        id: "karoo-hike",
        name: "Nature Hiking",
        description:
          "Explore designated walking routes.",
        duration: "2–5 hours",
        pricePerPerson: 0,
        source: "SANParks"
      })
    ],

    booking: booking("SANParks"),

    map: map(
      "Karoo National Park",
      "Western Cape",
      -32.3500,
      22.5833
    ),

    dataQuality: {
      price: "verified-low-season-price",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 36. MARAKELE
  // ============================================================

  {
    id: 36,
    name: "Marakele National Park",
    image: "https://upload.wikimedia.org/wikipedia/commons/8/84/Hill_in_Marakele_National_Park_South_Africa.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Wildlife & Mountains",
    location: "Limpopo, South Africa",

    description:
      "Mountainous wildlife park in Limpopo with scenic landscapes and diverse wildlife.",

    source: "SANParks",

    accommodations: [
      makeAccommodation({
        id: "marakele-bontle",
        name: "Bontle Safari Tent",
        image: "../assets/accommodation/bontle.jpg",
        description:
          "SANParks safari tent accommodation at Bontle Camp.",
        priceFrom: 1758,
        rating: 4.3,
        distanceKm: 0,
        type: "Safari Tent",
        facilities: [
          "Safari tent",
          "Bedding",
          "Nature setting",
          "Park facilities",
          "Braai"
        ],
        address: "Marakele National Park",
        phone: "+27 14 755 0000",
        roomTypes: [
          "Safari Tent"
        ],
        source: "SANParks"
      })
    ],

    activities: [
      makeActivity({
        id: "marakele-drive",
        name: "Game Drive",
        description:
          "Wildlife viewing in the park.",
        duration: "2–3 hours",
        pricePerPerson: 650,
        bookingRequired: true,
        source: "SANParks"
      }),
      makeActivity({
        id: "marakele-scenic",
        name: "Mountain Scenic Drive",
        description:
          "Explore Marakele's mountainous landscapes.",
        duration: "2–4 hours",
        pricePerPerson: 0,
        source: "SANParks"
      })
    ],

    booking: booking("SANParks"),

    map: map(
      "Marakele National Park",
      "Limpopo",
      -24.5000,
      27.5000
    ),

    dataQuality: {
      price: "verified-Bontle-price",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 37. MOUNTAIN ZEBRA
  // ============================================================

  {
    id: 37,
    name: "Mountain Zebra National Park",
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Equus_zebra_hartmannae_-_Etosha_2015.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Wildlife",
    location: "Eastern Cape, South Africa",

    description:
      "SANParks wildlife destination known for mountain zebra and scenic Karoo mountain landscapes.",

    source: "SANParks",

    accommodations: [
      makeAccommodation({
        id: "mountain-zebra-rock",
        name: "Rock Chalet",
        image: "../assets/accommodation/mountain-zebra.jpg",
        description:
          "SANParks Rock Chalet accommodation at Mountain Zebra National Park.",
        priceFrom: 4607,
        rating: 4.5,
        distanceKm: 0,
        type: "Chalet",
        facilities: [
          "Self-catering",
          "Kitchen",
          "Mountain views",
          "Park facilities",
          "Braai"
        ],
        address: "Mountain Zebra National Park",
        phone: "+27 48 881 2427",
        roomTypes: [
          "Rock Chalet"
        ],
        source: "SANParks"
      })
    ],

    activities: [
      makeActivity({
        id: "mountain-zebra-drive",
        name: "Game Drive",
        description:
          "Wildlife viewing in the park.",
        duration: "2–3 hours",
        pricePerPerson: 650,
        bookingRequired: true,
        source: "SANParks"
      }),
      makeActivity({
        id: "mountain-zebra-hike",
        name: "Mountain Hiking",
        description:
          "Explore designated mountain trails.",
        duration: "2–5 hours",
        pricePerPerson: 0,
        source: "SANParks"
      })
    ],

    booking: booking("SANParks"),

    map: map(
      "Mountain Zebra National Park",
      "Eastern Cape",
      -31.8667,
      25.4667
    ),

    dataQuality: {
      price: "verified-Rock-Chalet-price",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 38. TANKWA KAROO
  // ============================================================

  {
    id: 38,
    name: "Tankwa Karoo National Park",
    image: "https://upload.wikimedia.org/wikipedia/commons/c/c0/Springboks_in_Tankwa_Karoo_National_Park_%2837061227660%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Desert & Stargazing",
    location: "Northern Cape / Western Cape, South Africa",

    description:
      "Remote semi-desert national park known for stark Karoo scenery, dark skies and wilderness experiences.",

    source: "SANParks",

    accommodations: [
      makeAccommodation({
        id: "tankwa-campsite",
        name: "Volmoesfontein / Biesjiesfontein Campsite",
        image: "../assets/accommodation/tankwa.jpg",
        description:
          "SANParks camping accommodation in Tankwa Karoo National Park.",
        priceFrom: 192,
        rating: 4.2,
        distanceKm: 0,
        type: "Campsite",
        facilities: [
          "Camping",
          "Basic facilities",
          "Remote wilderness setting",
          "Dark skies"
        ],
        address: "Tankwa Karoo National Park",
        phone: "+27 27 341 7400",
        roomTypes: [
          "Campsite"
        ],
        source: "SANParks"
      })
    ],

    activities: [
      makeActivity({
        id: "tankwa-scenic",
        name: "Karoo Scenic Drive",
        description:
          "Explore the park's remote landscapes.",
        duration: "Flexible",
        pricePerPerson: 0,
        source: "SANParks"
      }),
      makeActivity({
        id: "tankwa-stars",
        name: "Stargazing",
        description:
          "Enjoy the remote dark-sky environment.",
        duration: "Evening",
        pricePerPerson: 0,
        source: "SANParks"
      })
    ],

    booking: booking("SANParks"),

    map: map(
      "Tankwa Karoo National Park",
      "Northern Cape / Western Cape",
      -32.2500,
      19.7500
    ),

    dataQuality: {
      price: "verified-campsite-price",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 39. PILGRIM'S REST
  // ============================================================

  {
    id: 39,
    name: "Pilgrim's Rest",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/39/Pilgrim_Rest.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Heritage",
    location: "Mpumalanga, South Africa",

    description:
      "Historic gold-rush town preserved as a heritage destination in the Mpumalanga highlands.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "pilgrims-rest-hotel",
        name: "Pilgrim's Rest Historic Hotel",
        image: "../assets/accommodation/pilgrims-rest.jpg",
        description:
          "Historic-style accommodation in Pilgrim's Rest.",
        priceFrom: 950,
        rating: 4.1,
        distanceKm: 1,
        type: "Historic Hotel / Guesthouse",
        facilities: [
          "Historic setting",
          "Parking",
          "Dining nearby",
          "Wi-Fi",
          "Breakfast"
        ],
        address: "Pilgrim's Rest, Mpumalanga",
        phone: "+27 13 768 1100",
        roomTypes: [
          "Standard Room",
          "Historic Room"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "pilgrims-heritage",
        name: "Historic Town Walk",
        description:
          "Explore preserved buildings and gold-rush heritage.",
        duration: "1–3 hours",
        pricePerPerson: 100,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "pilgrims-museum",
        name: "Heritage Museum Visit",
        description:
          "Learn about the town's gold-rush history.",
        duration: "1–2 hours",
        pricePerPerson: 100,
        source: "South African Tourism"
      })
    ],

    booking: booking("Local accommodation / heritage attraction"),

    map: map(
      "Pilgrim's Rest",
      "Mpumalanga",
      -24.8967,
      30.7617
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 40. STELLENBOSCH
  // ============================================================

  {
    id: 40,
    name: "Stellenbosch",
    image: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Stellenbosch_aerial_photo_from_north-west_2024-01.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Wine & Culture",
    location: "Western Cape, South Africa",

    description:
      "Historic Cape Winelands town known for wine estates, Cape Dutch architecture, food and mountain scenery.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "stellenbosch-guesthouse",
        name: "Stellenbosch Wine Estate Guesthouse",
        image: "../assets/accommodation/stellenbosch.jpg",
        description:
          "Guesthouse or estate accommodation in Stellenbosch.",
        priceFrom: 1500,
        rating: 4.5,
        distanceKm: 2,
        type: "Guesthouse / Farm Stay",
        facilities: [
          "Wi-Fi",
          "Breakfast",
          "Parking",
          "Wine estate access",
          "Dining",
          "Swimming pool"
        ],
        address: "Stellenbosch, Western Cape",
        phone: "+27 21 000 0000",
        roomTypes: [
          "Standard Room",
          "Luxury Room"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "stellenbosch-wine",
        name: "Wine Tasting",
        description:
          "Visit participating wine estates for tastings.",
        duration: "1–3 hours",
        pricePerPerson: 250,
        bookingRequired: true,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "stellenbosch-town",
        name: "Historic Town Walk",
        description:
          "Explore Stellenbosch's historic centre.",
        duration: "1–3 hours",
        pricePerPerson: 0,
        source: "South African Tourism"
      })
    ],

    booking: booking("Wine estate / accommodation"),

    map: map(
      "Stellenbosch",
      "Western Cape",
      -33.9321,
      18.8602
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 41. FRANSCHHOEK
  // ============================================================

  {
    id: 41,
    name: "Franschhoek",
    image: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Franschhoek_%28S%C3%BCdafrika%29.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Wine & Food",
    location: "Western Cape, South Africa",

    description:
      "Scenic Cape Winelands town known for vineyards, restaurants, mountain scenery and wine tourism.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "franschhoek-guesthouse",
        name: "Franschhoek Wine Estate Guesthouse",
        image: "../assets/accommodation/franschhoek.jpg",
        description:
          "Wine-estate or town accommodation in Franschhoek.",
        priceFrom: 1700,
        rating: 4.6,
        distanceKm: 2,
        type: "Guesthouse / Farm Stay",
        facilities: [
          "Wi-Fi",
          "Breakfast",
          "Parking",
          "Wine tasting nearby",
          "Restaurant",
          "Pool"
        ],
        address: "Franschhoek, Western Cape",
        phone: "+27 21 000 0000",
        roomTypes: [
          "Standard Room",
          "Luxury Room"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "franschhoek-wine",
        name: "Wine Tasting",
        description:
          "Visit participating estates and tasting rooms.",
        duration: "1–3 hours",
        pricePerPerson: 300,
        bookingRequired: true,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "franschhoek-food",
        name: "Food Experience",
        description:
          "Explore the area's food and wine culture.",
        duration: "2–4 hours",
        pricePerPerson: 500,
        bookingRequired: true,
        source: "South African Tourism"
      })
    ],

    booking: booking("Wine estate / accommodation"),

    map: map(
      "Franschhoek",
      "Western Cape",
      -33.9100,
      19.1200
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 42. DURBAN GOLDEN MILE
  // ============================================================

  {
    id: 42,
    name: "Durban Golden Mile",
    image: "https://upload.wikimedia.org/wikipedia/commons/b/b8/The_sun_set_of_GOLDEN_MILE.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Beach & City",
    location: "Durban, KwaZulu-Natal, South Africa",

    description:
      "Popular beachfront stretch in Durban with beaches, promenade activities, restaurants and city attractions.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "durban-golden-mile-hotel",
        name: "Golden Mile Beachfront Hotel",
        image: "../assets/accommodation/durban.jpg",
        description:
          "Durban beachfront hotel accommodation.",
        priceFrom: 1200,
        rating: 4.2,
        distanceKm: 0.5,
        type: "Hotel",
        facilities: [
          "Beach access",
          "Wi-Fi",
          "Pool",
          "Restaurant",
          "Parking"
        ],
        address: "Golden Mile, Durban",
        phone: "+27 31 000 0000",
        roomTypes: [
          "Standard Room",
          "Sea View Room"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "durban-beach",
        name: "Beach Visit",
        description:
          "Enjoy the Durban beachfront and promenade.",
        duration: "Flexible",
        pricePerPerson: 0,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "durban-promenade",
        name: "Promenade Walk",
        description:
          "Explore the Golden Mile promenade.",
        duration: "1–3 hours",
        pricePerPerson: 0,
        source: "South African Tourism"
      })
    ],

    booking: booking("Hotel / local operator"),

    map: map(
      "Durban Golden Mile",
      "Durban, KwaZulu-Natal",
      -29.8587,
      31.0218
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 43. BALLITO
  // ============================================================

  {
    id: 43,
    name: "Ballito",
    image: "https://upload.wikimedia.org/wikipedia/commons/f/ff/410104_Ballito_Bch_7.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Beach & Coast",
    location: "KwaZulu-Natal, South Africa",

    description:
      "KwaZulu-Natal coastal destination known for beaches, warm-water seaside activities and holiday accommodation.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "ballito-beach-hotel",
        name: "Ballito Beach Hotel",
        image: "../assets/accommodation/ballito.jpg",
        description:
          "Coastal hotel accommodation in Ballito.",
        priceFrom: 1300,
        rating: 4.3,
        distanceKm: 1,
        type: "Hotel / Resort",
        facilities: [
          "Beach access",
          "Pool",
          "Wi-Fi",
          "Restaurant",
          "Parking",
          "Breakfast"
        ],
        address: "Ballito, KwaZulu-Natal",
        phone: "+27 32 000 0000",
        roomTypes: [
          "Standard Room",
          "Sea View Room",
          "Family Room"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "ballito-beach",
        name: "Beach Day",
        description:
          "Relax and enjoy Ballito's beaches.",
        duration: "Flexible",
        pricePerPerson: 0,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "ballito-coast",
        name: "Coastal Activities",
        description:
          "Participate in available coastal recreation.",
        duration: "Varies",
        pricePerPerson: 450,
        bookingRequired: true,
        source: "South African Tourism"
      })
    ],

    booking: booking("Hotel / local operator"),

    map: map(
      "Ballito",
      "KwaZulu-Natal",
      -29.5380,
      31.2140
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 44. TRANSKEI COAST
  // ============================================================

  {
    id: 44,
    name: "Transkei Coast",
    image: "https://upload.wikimedia.org/wikipedia/commons/3/34/Coffee_Bay.jpg?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Coast & Culture",
    location: "Eastern Cape, South Africa",

    description:
      "Historic coastal region along the former Transkei, associated with the Wild Coast's rugged beaches, villages and cultural landscapes.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "transkei-coast-lodge",
        name: "Transkei Coastal Lodge",
        image: "../assets/accommodation/transkei.jpg",
        description:
          "Coastal lodge accommodation in the Transkei / Wild Coast region.",
        priceFrom: 900,
        rating: 4.1,
        distanceKm: 3,
        type: "Lodge / Guesthouse",
        facilities: [
          "Sea views",
          "Meals",
          "Walking trails",
          "Parking",
          "Wi-Fi"
        ],
        address: "Eastern Cape Wild Coast",
        phone: "+27 47 000 0000",
        roomTypes: [
          "Standard Room",
          "Chalet"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "transkei-hike",
        name: "Coastal Hiking",
        description:
          "Explore beaches, cliffs and rural coastal landscapes.",
        duration: "3–8 hours",
        pricePerPerson: 0,
        source: "South African Tourism"
      }),
      makeActivity({
        id: "transkei-culture",
        name: "Cultural Experience",
        description:
          "Learn about local communities and coastal heritage.",
        duration: "2–4 hours",
        pricePerPerson: 350,
        bookingRequired: true,
        source: "South African Tourism"
      })
    ],

    booking: booking("Local accommodation / operator"),

    map: map(
      "Transkei Coast",
      "Eastern Cape",
      -31.5000,
      29.5000
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  },


  // ============================================================
  // 45. SUTHERLAND
  // ============================================================

  {
    id: 45,
    name: "Sutherland",
    image: "https://upload.wikimedia.org/wikipedia/commons/b/b4/Sutherland_NC_skyline_2015.png?utm_source=en.wikipedia.org&utm_campaign=api&utm_content=original",
    category: "Stargazing & Karoo",
    location: "Northern Cape, South Africa",

    description:
      "Remote Karoo town famous for exceptionally dark skies and its astronomy facilities.",

    source: "South African Tourism",

    accommodations: [
      makeAccommodation({
        id: "sutherland-guesthouse",
        name: "Sutherland Guesthouse",
        image: "../assets/accommodation/sutherland.jpg",
        description:
          "Town or farm accommodation in Sutherland.",
        priceFrom: 900,
        rating: 4.3,
        distanceKm: 2,
        type: "Guesthouse / Farm Stay",
        facilities: [
          "Wi-Fi",
          "Parking",
          "Breakfast",
          "Stargazing access",
          "Restaurant"
        ],
        address: "Sutherland, Northern Cape",
        phone: "+27 23 000 0000",
        roomTypes: [
          "Standard Room",
          "Family Room"
        ],
        source: "South African Tourism / planning value"
      })
    ],

    activities: [
      makeActivity({
        id: "sutherland-observatory",
        name: "Observatory Visit",
        description:
          "Visit the astronomy facilities where tours are available.",
        duration: "1–3 hours",
        pricePerPerson: 180,
        bookingRequired: true,
        source: "South African Tourism / astronomy facility"
      }),
      makeActivity({
        id: "sutherland-stars",
        name: "Stargazing",
        description:
          "Experience the exceptionally dark Karoo night sky.",
        duration: "Evening",
        pricePerPerson: 250,
        bookingRequired: true,
        source: "South African Tourism"
      })
    ],

    booking: booking("Astronomy facility / accommodation"),

    map: map(
      "Sutherland",
      "Northern Cape",
      -32.3969,
      20.6614
    ),

    dataQuality: {
      price: "planning-value",
      rating: "planning-rating",
      availability: "live-check",
      image: "replace-with-licensed-image"
    }
  }

];

const normalizedAttractions = attractions.map((attraction) => ({
  ...attraction,
  image: getAttractionImage(attraction),
  accommodations: (attraction.accommodations || []).map((accommodation) => ({
    ...accommodation,
    image: resolveImage(accommodation.image, DEFAULT_ACCOMMODATION_IMAGE),
    details: {
      ...(accommodation.details || {}),
      image: resolveImage(accommodation.details?.image || accommodation.image, DEFAULT_ACCOMMODATION_IMAGE),
      amenities: accommodation.details?.amenities || accommodation.facilities || [],
      roomTypes: accommodation.details?.roomTypes || accommodation.roomTypes || [],
      reviews: accommodation.details?.reviews || [],
      cancellation: accommodation.details?.cancellation || "Check the property's current cancellation policy before booking."
    }
  }))
}));

export { normalizedAttractions as attractions, normalizedAttractions as ATTRACTIONS };
export default normalizedAttractions;