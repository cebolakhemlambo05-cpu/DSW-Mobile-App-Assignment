const BUNDLED_ATTRACTION_IMAGES = [
  require("../../assets/attractions/forest.jpg"),
  require("../../assets/attractions/wildlife.jpg"),
  require("../../assets/attractions/mountains.jpg"),
  require("../../assets/attractions/coast.jpg"),
  require("../../assets/attractions/city.jpg"),
  require("../../assets/attractions/stay.jpg"),
  require("../../assets/attractions/cabin.jpg"),
  require("../../assets/attractions/architecture.jpg"),
];

export const DEFAULT_ATTRACTION_IMAGE = BUNDLED_ATTRACTION_IMAGES[0];

export function getAttractionFallbackImage(attraction) {
  const key = String(attraction?.id ?? attraction?.name ?? "attraction");
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }
  return BUNDLED_ATTRACTION_IMAGES[hash % BUNDLED_ATTRACTION_IMAGES.length];
}

export const DEFAULT_ACCOMMODATION_IMAGE =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=600&fit=crop&auto=format";

export const ACCOMMODATION_CATEGORY_IMAGES = {
  Wildlife:
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=900&h=600&fit=crop&auto=format",
  Mountains:
    "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=900&h=600&fit=crop&auto=format",
  Coast:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&h=600&fit=crop&auto=format",
  Beach:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&h=600&fit=crop&auto=format",
  Nature:
    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&h=600&fit=crop&auto=format",
  City:
    "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=900&h=600&fit=crop&auto=format",
};
