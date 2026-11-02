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

const CATALOG_ATTRACTION_IMAGES = {
  1: require("../../assets/attractions/catalog/1.jpg"),
  2: require("../../assets/attractions/catalog/2.jpg"),
  3: require("../../assets/attractions/catalog/3.jpg"),
  4: require("../../assets/attractions/catalog/4.jpg"),
  5: require("../../assets/attractions/catalog/5.jpg"),
  6: require("../../assets/attractions/catalog/6.jpg"),
  7: require("../../assets/attractions/catalog/7.jpg"),
  8: require("../../assets/attractions/catalog/8.jpg"),
  9: require("../../assets/attractions/catalog/9.jpg"),
  10: require("../../assets/attractions/catalog/10.jpg"),
  11: require("../../assets/attractions/catalog/11.jpg"),
  12: require("../../assets/attractions/catalog/12.jpg"),
  13: require("../../assets/attractions/catalog/13.jpg"),
  14: require("../../assets/attractions/catalog/14.jpg"),
  15: require("../../assets/attractions/catalog/15.jpg"),
  16: require("../../assets/attractions/catalog/16.jpg"),
  17: require("../../assets/attractions/catalog/17.jpg"),
  18: require("../../assets/attractions/catalog/18.jpg"),
  19: require("../../assets/attractions/catalog/19.jpg"),
  20: require("../../assets/attractions/catalog/20.jpg"),
  21: require("../../assets/attractions/catalog/21.jpg"),
  22: require("../../assets/attractions/catalog/22.jpg"),
  23: require("../../assets/attractions/catalog/23.jpg"),
  24: require("../../assets/attractions/catalog/24.jpg"),
  25: require("../../assets/attractions/catalog/25.jpg"),
  26: require("../../assets/attractions/catalog/26.jpg"),
  27: require("../../assets/attractions/catalog/27.jpg"),
  28: require("../../assets/attractions/catalog/28.jpg"),
  29: require("../../assets/attractions/catalog/29.jpg"),
  30: require("../../assets/attractions/catalog/30.jpg"),
  31: require("../../assets/attractions/catalog/31.jpg"),
  32: require("../../assets/attractions/catalog/32.jpg"),
  33: require("../../assets/attractions/catalog/33.jpg"),
  34: require("../../assets/attractions/catalog/34.jpg"),
  35: require("../../assets/attractions/catalog/35.jpg"),
  36: require("../../assets/attractions/catalog/36.jpg"),
  37: require("../../assets/attractions/catalog/37.jpg"),
  38: require("../../assets/attractions/catalog/38.jpg"),
  39: require("../../assets/attractions/catalog/39.jpg"),
  40: require("../../assets/attractions/catalog/40.jpg"),
  41: require("../../assets/attractions/catalog/41.jpg"),
  42: require("../../assets/attractions/catalog/42.jpg"),
  43: require("../../assets/attractions/catalog/43.jpg"),
  44: require("../../assets/attractions/catalog/44.jpg"),
  45: require("../../assets/attractions/catalog/45.jpg"),
};

export const DEFAULT_ATTRACTION_IMAGE = BUNDLED_ATTRACTION_IMAGES[0];

export function getAttractionFallbackImage(attraction) {
  const catalogImage = CATALOG_ATTRACTION_IMAGES[Number(attraction?.id)];
  if (catalogImage) return catalogImage;

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
