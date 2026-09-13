function img(seed) {
  return `https://picsum.photos/seed/${seed}/800/600`;
}

export const attractions = [
  {
    id: "table-mountain",
    name: "Table Mountain",
    category: "Mountains",
    blurb: "Iconic flat-topped mountain overlooking Cape Town.",
    image: img("table-mountain"),
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
    id: "kruger",
    name: "Kruger National Park",
    category: "Wildlife",
    blurb: "South Africa's flagship safari park — Big Five country.",
    image: img("kruger"),
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
    id: "robben-island",
    name: "Robben Island",
    category: "History",
    blurb: "Former prison island where Nelson Mandela was held, now a museum.",
    image: img("robben-island"),
    activities: [
      { id: "a1", name: "Ferry + Guided Tour", price: 600 },
      { id: "a2", name: "Museum Entry Only", price: 250 },
    ],
    accommodations: [
      { id: "h1", name: "V&A Waterfront Inn", price: 900, distanceKm: 2 },
      { id: "h2", name: "Green Point Backpackers", price: 380, distanceKm: 3 },
      { id: "h3", name: "Waterfront Marina Hotel", price: 2600, distanceKm: 1.5 },
    ],
  },
  {
    id: "va-waterfront",
    name: "V&A Waterfront",
    category: "City & Culture",
    blurb: "Cape Town's busy harbourfront — shops, restaurants, and views of the harbour.",
    image: img("va-waterfront"),
    activities: [
      { id: "a1", name: "Harbour Boat Cruise", price: 350 },
      { id: "a2", name: "Two Oceans Aquarium Entry", price: 260 },
      { id: "a3", name: "Wander the Market", price: 0 },
    ],
    accommodations: [
      { id: "h1", name: "Waterfront Marina Hotel", price: 2600, distanceKm: 0.5 },
      { id: "h2", name: "Green Point Backpackers", price: 380, distanceKm: 2 },
      { id: "h3", name: "Sea Point Apartments", price: 950, distanceKm: 3 },
    ],
  },
  {
    id: "cape-point",
    name: "Cape Point",
    category: "Nature",
    blurb: "Dramatic cliffs where the Atlantic meets the peninsula's tip.",
    image: img("cape-point"),
    activities: [
      { id: "a1", name: "Nature Reserve Entry", price: 340 },
      { id: "a2", name: "Funicular to Lighthouse", price: 90 },
      { id: "a3", name: "Coastal Hiking Trail", price: 0 },
    ],
    accommodations: [
      { id: "h1", name: "Simon's Town Guesthouse", price: 720, distanceKm: 12 },
      { id: "h2", name: "Scarborough Beach Cottage", price: 1100, distanceKm: 8 },
      { id: "h3", name: "Ocean View Backpackers", price: 400, distanceKm: 15 },
    ],
  },
  {
    id: "boulders-beach",
    name: "Boulders Beach",
    category: "Wildlife",
    blurb: "Sheltered beach famous for its resident African penguin colony.",
    image: img("boulders-beach"),
    activities: [
      { id: "a1", name: "Beach & Penguin Colony Entry", price: 190 },
      { id: "a2", name: "Guided Penguin Walk", price: 280 },
    ],
    accommodations: [
      { id: "h1", name: "Simon's Town Guesthouse", price: 720, distanceKm: 2 },
      { id: "h2", name: "Boulders Backpackers", price: 390, distanceKm: 1 },
      { id: "h3", name: "Seaside Boutique Hotel", price: 1450, distanceKm: 3 },
    ],
  },
  {
    id: "chapmans-peak",
    name: "Chapman's Peak Drive",
    category: "Scenic Drive",
    blurb: "One of the world's most scenic coastal drives, hugging cliffs above the sea.",
    image: img("chapmans-peak"),
    activities: [
      { id: "a1", name: "Toll Road Drive-through", price: 55 },
      { id: "a2", name: "Lookout Point Picnic", price: 0 },
    ],
    accommodations: [
      { id: "h1", name: "Hout Bay Harbour Lodge", price: 890, distanceKm: 3 },
      { id: "h2", name: "Noordhoek Farm Cottage", price: 1050, distanceKm: 6 },
      { id: "h3", name: "Hout Bay Backpackers", price: 400, distanceKm: 4 },
    ],
  },
  {
    id: "stellenbosch",
    name: "Stellenbosch Winelands",
    category: "Food & Wine",
    blurb: "Historic university town at the heart of South Africa's wine country.",
    image: img("stellenbosch"),
    activities: [
      { id: "a1", name: "Wine Tasting (3 estates)", price: 450 },
      { id: "a2", name: "Vineyard Cycle Tour", price: 600 },
      { id: "a3", name: "Historic Walking Tour", price: 150 },
    ],
    accommodations: [
      { id: "h1", name: "Stellenbosch Wine Farm Stay", price: 1600, distanceKm: 5 },
      { id: "h2", name: "Dorp Street Guesthouse", price: 850, distanceKm: 1 },
      { id: "h3", name: "Student Backpackers", price: 320, distanceKm: 2 },
    ],
  },
  {
    id: "franschhoek",
    name: "Franschhoek",
    category: "Food & Wine",
    blurb: "The 'food and wine capital' of South Africa, set in a French Huguenot valley.",
    image: img("franschhoek"),
    activities: [
      { id: "a1", name: "Wine Tram Hop-on Hop-off", price: 380 },
      { id: "a2", name: "Fine Dining Tasting Menu", price: 950 },
      { id: "a3", name: "Huguenot Monument Visit", price: 0 },
    ],
    accommodations: [
      { id: "h1", name: "Franschhoek Valley Lodge", price: 2100, distanceKm: 3 },
      { id: "h2", name: "Main Road Guesthouse", price: 980, distanceKm: 1 },
      { id: "h3", name: "Backpackers on the Vine", price: 400, distanceKm: 2 },
    ],
  },
  {
    id: "garden-route",
    name: "Garden Route",
    category: "Nature",
    blurb: "Scenic stretch of coastline, forests, and lakes between Mossel Bay and Storms River.",
    image: img("garden-route"),
    activities: [
      { id: "a1", name: "Forest Canopy Tour", price: 750 },
      { id: "a2", name: "Lagoon Kayaking", price: 300 },
      { id: "a3", name: "Scenic Drive (self-guided)", price: 0 },
    ],
    accommodations: [
      { id: "h1", name: "Wilderness Beach Lodge", price: 1400, distanceKm: 5 },
      { id: "h2", name: "Garden Route Backpackers", price: 380, distanceKm: 3 },
      { id: "h3", name: "Forest Cabin Retreat", price: 1100, distanceKm: 10 },
    ],
  },
  {
    id: "knysna",
    name: "Knysna",
    category: "Nature",
    blurb: "Lagoon town on the Garden Route known for oysters, forests, and The Heads.",
    image: img("knysna"),
    activities: [
      { id: "a1", name: "Lagoon Ferry Cruise", price: 320 },
      { id: "a2", name: "Oyster Tasting", price: 180 },
      { id: "a3", name: "Featherbed Nature Reserve Hike", price: 450 },
    ],
    accommodations: [
      { id: "h1", name: "Knysna Waterfront Hotel", price: 1750, distanceKm: 1 },
      { id: "h2", name: "Lagoon View Backpackers", price: 360, distanceKm: 2 },
      { id: "h3", name: "The Heads Guesthouse", price: 1200, distanceKm: 4 },
    ],
  },
  {
    id: "tsitsikamma",
    name: "Tsitsikamma National Park",
    category: "Adventure",
    blurb: "Rugged coastline and forest, home to South Africa's highest bungee jump.",
    image: img("tsitsikamma"),
    activities: [
      { id: "a1", name: "Bloukrans Bungee Jump", price: 1850 },
      { id: "a2", name: "Suspension Bridge Walk", price: 220 },
      { id: "a3", name: "Otter Trail Day Hike", price: 350 },
    ],
    accommodations: [
      { id: "h1", name: "Storms River Mouth Rest Camp", price: 950, distanceKm: 2 },
      { id: "h2", name: "Tsitsikamma Backpackers", price: 380, distanceKm: 5 },
      { id: "h3", name: "Forest Canopy Lodge", price: 1600, distanceKm: 8 },
    ],
  },
  {
    id: "addo-elephant",
    name: "Addo Elephant National Park",
    category: "Wildlife",
    blurb: "Home to over 600 elephants plus lions, buffalo, and rare flightless dung beetles.",
    image: img("addo-elephant"),
    activities: [
      { id: "a1", name: "Guided Game Drive", price: 780 },
      { id: "a2", name: "Self-drive (own car)", price: 0, note: "Park fees only" },
      { id: "a3", name: "Night Safari", price: 620 },
    ],
    accommodations: [
      { id: "h1", name: "Addo Rest Camp", price: 900, distanceKm: 2 },
      { id: "h2", name: "Sundays River Backpackers", price: 350, distanceKm: 10 },
      { id: "h3", name: "Addo Safari Lodge", price: 2400, distanceKm: 6 },
    ],
  },
  {
    id: "wild-coast",
    name: "Wild Coast",
    category: "Nature",
    blurb: "Remote, dramatic Eastern Cape coastline with cliffs, waterfalls, and villages.",
    image: img("wild-coast"),
    activities: [
      { id: "a1", name: "Hole in the Wall Hike", price: 200 },
      { id: "a2", name: "Horseback Beach Ride", price: 450 },
      { id: "a3", name: "Village Cultural Visit", price: 300 },
    ],
    accommodations: [
      { id: "h1", name: "Coffee Bay Backpackers", price: 320, distanceKm: 3 },
      { id: "h2", name: "Wild Coast Beach Lodge", price: 1300, distanceKm: 5 },
      { id: "h3", name: "Community Guesthouse", price: 550, distanceKm: 4 },
    ],
  },
  {
    id: "hogsback",
    name: "Hogsback",
    category: "Nature",
    blurb: "Misty mountain village said to have inspired parts of Tolkien's Middle-earth.",
    image: img("hogsback"),
    activities: [
      { id: "a1", name: "Waterfall Hiking Trail", price: 100 },
      { id: "a2", name: "Labyrinth & Gardens Visit", price: 60 },
      { id: "a3", name: "Horse Trail Ride", price: 380 },
    ],
    accommodations: [
      { id: "h1", name: "Hogsback Forest Lodge", price: 950, distanceKm: 2 },
      { id: "h2", name: "Mountain Backpackers", price: 300, distanceKm: 3 },
      { id: "h3", name: "Away with the Fairies", price: 700, distanceKm: 1 },
    ],
  },
  {
    id: "durban-beachfront",
    name: "Durban Beachfront",
    category: "Coast",
    blurb: "Warm Indian Ocean waters, promenade, and a lively surf culture.",
    image: img("durban-beachfront"),
    activities: [
      { id: "a1", name: "Surf Lesson", price: 400 },
      { id: "a2", name: "Promenade Bike Rental", price: 150 },
      { id: "a3", name: "Beach Volleyball Rental", price: 80 },
    ],
    accommodations: [
      { id: "h1", name: "Golden Mile Hotel", price: 1300, distanceKm: 0.5 },
      { id: "h2", name: "Durban Backpackers", price: 320, distanceKm: 1 },
      { id: "h3", name: "Umhlanga Beachfront Suites", price: 2200, distanceKm: 15 },
    ],
  },
  {
    id: "ushaka",
    name: "uShaka Marine World",
    category: "Family",
    blurb: "Durban's beachfront aquarium and water park.",
    image: img("ushaka"),
    activities: [
      { id: "a1", name: "Aquarium + Water Park Combo", price: 380 },
      { id: "a2", name: "Dolphin Show Entry", price: 220 },
    ],
    accommodations: [
      { id: "h1", name: "Golden Mile Hotel", price: 1300, distanceKm: 1 },
      { id: "h2", name: "Durban Backpackers", price: 320, distanceKm: 2 },
      { id: "h3", name: "Point Waterfront Apartments", price: 900, distanceKm: 0.8 },
    ],
  },
  {
    id: "drakensberg",
    name: "Drakensberg Mountains",
    category: "Mountains",
    blurb: "Dramatic basalt peaks and valleys — a UNESCO World Heritage Site.",
    image: img("drakensberg"),
    activities: [
      { id: "a1", name: "Amphitheatre Day Hike", price: 250 },
      { id: "a2", name: "San Rock Art Tour", price: 350 },
      { id: "a3", name: "Horse Trail Ride", price: 500 },
    ],
    accommodations: [
      { id: "h1", name: "Drakensberg Mountain Resort", price: 1500, distanceKm: 3 },
      { id: "h2", name: "Berg Backpackers", price: 350, distanceKm: 5 },
      { id: "h3", name: "Cathedral Peak Lodge", price: 1900, distanceKm: 8 },
    ],
  },
  {
    id: "hluhluwe-imfolozi",
    name: "Hluhluwe-Imfolozi Park",
    category: "Wildlife",
    blurb: "Africa's oldest game reserve, credited with saving the white rhino.",
    image: img("hluhluwe-imfolozi"),
    activities: [
      { id: "a1", name: "Rhino Tracking Safari", price: 900 },
      { id: "a2", name: "Guided Game Drive", price: 700 },
      { id: "a3", name: "Self-drive (own car)", price: 0, note: "Park fees only" },
    ],
    accommodations: [
      { id: "h1", name: "Hilltop Rest Camp", price: 950, distanceKm: 2 },
      { id: "h2", name: "Zululand Backpackers", price: 380, distanceKm: 12 },
      { id: "h3", name: "Rhino Ridge Safari Lodge", price: 2800, distanceKm: 5 },
    ],
  },
  {
    id: "isimangaliso",
    name: "iSimangaliso Wetland Park",
    category: "Nature",
    blurb: "Wetland wilderness where hippos, crocodiles, and whales share the coast.",
    image: img("isimangaliso"),
    activities: [
      { id: "a1", name: "Hippo & Croc Boat Cruise", price: 380 },
      { id: "a2", name: "Whale Watching (seasonal)", price: 650 },
      { id: "a3", name: "Turtle Tour (seasonal)", price: 500 },
    ],
    accommodations: [
      { id: "h1", name: "St Lucia Lakeside Lodge", price: 1200, distanceKm: 2 },
      { id: "h2", name: "Wetlands Backpackers", price: 340, distanceKm: 3 },
      { id: "h3", name: "iSimangaliso Eco Camp", price: 1750, distanceKm: 6 },
    ],
  },
  {
    id: "soweto",
    name: "Soweto",
    category: "City & Culture",
    blurb: "Historic township with rich culture, food, and nightlife.",
    image: img("soweto"),
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
  {
    id: "apartheid-museum",
    name: "Apartheid Museum",
    category: "History",
    blurb: "Powerful museum documenting South Africa's journey from apartheid to democracy.",
    image: img("apartheid-museum"),
    activities: [
      { id: "a1", name: "Museum Entry", price: 150 },
      { id: "a2", name: "Guided Historical Tour", price: 320 },
    ],
    accommodations: [
      { id: "h1", name: "Johannesburg City Hotel", price: 1400, distanceKm: 5 },
      { id: "h2", name: "Maboneng Backpackers", price: 350, distanceKm: 8 },
      { id: "h3", name: "Sandton Business Suites", price: 2000, distanceKm: 15 },
    ],
  },
  {
    id: "constitution-hill",
    name: "Constitution Hill",
    category: "History",
    blurb: "Former prison and fort, now home to South Africa's Constitutional Court.",
    image: img("constitution-hill"),
    activities: [
      { id: "a1", name: "Heritage Site Tour", price: 120 },
      { id: "a2", name: "Constitutional Court Visit", price: 0 },
    ],
    accommodations: [
      { id: "h1", name: "Maboneng Backpackers", price: 350, distanceKm: 3 },
      { id: "h2", name: "Braamfontein Loft Stay", price: 800, distanceKm: 1 },
      { id: "h3", name: "Johannesburg City Hotel", price: 1400, distanceKm: 4 },
    ],
  },
  {
    id: "cradle-of-humankind",
    name: "Cradle of Humankind",
    category: "History",
    blurb: "UNESCO site with fossil caves tracing millions of years of human origins.",
    image: img("cradle-of-humankind"),
    activities: [
      { id: "a1", name: "Sterkfontein Caves Tour", price: 220 },
      { id: "a2", name: "Maropeng Visitor Centre Entry", price: 190 },
    ],
    accommodations: [
      { id: "h1", name: "Cradle Lodge", price: 1300, distanceKm: 3 },
      { id: "h2", name: "Muldersdrift Backpackers", price: 380, distanceKm: 6 },
      { id: "h3", name: "Maropeng Boutique Hotel", price: 1900, distanceKm: 1 },
    ],
  },
  {
    id: "pilanesberg",
    name: "Pilanesberg National Park",
    category: "Wildlife",
    blurb: "Malaria-free Big Five reserve set in an ancient volcanic crater.",
    image: img("pilanesberg"),
    activities: [
      { id: "a1", name: "Guided Game Drive", price: 750 },
      { id: "a2", name: "Self-drive (own car)", price: 0, note: "Park fees only" },
      { id: "a3", name: "Hot Air Balloon Safari", price: 3200 },
    ],
    accommodations: [
      { id: "h1", name: "Pilanesberg Safari Lodge", price: 2000, distanceKm: 2 },
      { id: "h2", name: "Bakgatla Backpackers", price: 360, distanceKm: 8 },
      { id: "h3", name: "Manyane Rest Camp", price: 900, distanceKm: 1 },
    ],
  },
  {
    id: "sun-city",
    name: "Sun City",
    category: "Entertainment",
    blurb: "Resort complex with a Valley of Waves water park and casino.",
    image: img("sun-city"),
    activities: [
      { id: "a1", name: "Valley of Waves Entry", price: 320 },
      { id: "a2", name: "Lost City Golf Round", price: 1200 },
    ],
    accommodations: [
      { id: "h1", name: "Sun City Resort Hotel", price: 2600, distanceKm: 0.5 },
      { id: "h2", name: "Bakgatla Backpackers", price: 360, distanceKm: 10 },
      { id: "h3", name: "Cabanas Sun City", price: 1400, distanceKm: 1 },
    ],
  },
  {
    id: "blyde-river-canyon",
    name: "Blyde River Canyon",
    category: "Nature",
    blurb: "One of the largest green canyons on Earth, with dramatic viewpoints.",
    image: img("blyde-river-canyon"),
    activities: [
      { id: "a1", name: "Three Rondavels Viewpoint", price: 60 },
      { id: "a2", name: "Canyon Boat Cruise", price: 350 },
      { id: "a3", name: "Bourke's Luck Potholes Walk", price: 45 },
    ],
    accommodations: [
      { id: "h1", name: "Canyon View Lodge", price: 1300, distanceKm: 3 },
      { id: "h2", name: "Panorama Backpackers", price: 350, distanceKm: 6 },
      { id: "h3", name: "Blyde Wilderness Camp", price: 900, distanceKm: 4 },
    ],
  },
  {
    id: "gods-window",
    name: "God's Window",
    category: "Nature",
    blurb: "Sweeping viewpoint over the Lowveld along the Panorama Route.",
    image: img("gods-window"),
    activities: [
      { id: "a1", name: "Viewpoint Entry", price: 40 },
      { id: "a2", name: "Rainforest Walk", price: 60 },
    ],
    accommodations: [
      { id: "h1", name: "Panorama Backpackers", price: 350, distanceKm: 5 },
      { id: "h2", name: "Graskop Guesthouse", price: 800, distanceKm: 8 },
      { id: "h3", name: "Canyon View Lodge", price: 1300, distanceKm: 10 },
    ],
  },
  {
    id: "pilgrims-rest",
    name: "Pilgrim's Rest",
    category: "History",
    blurb: "Restored 1870s gold rush village frozen in time.",
    image: img("pilgrims-rest"),
    activities: [
      { id: "a1", name: "Village Museum Pass", price: 90 },
      { id: "a2", name: "Gold Panning Experience", price: 150 },
    ],
    accommodations: [
      { id: "h1", name: "Historic Miner's Cottage", price: 950, distanceKm: 1 },
      { id: "h2", name: "Pilgrim's Rest Backpackers", price: 330, distanceKm: 2 },
      { id: "h3", name: "Graskop Guesthouse", price: 800, distanceKm: 15 },
    ],
  },
];


export const getAttractionById = (id) => {
  return attractions.find((attraction) => attraction.id === id);
};
