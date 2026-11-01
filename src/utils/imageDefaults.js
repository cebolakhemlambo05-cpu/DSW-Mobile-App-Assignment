export const DEFAULT_ATTRACTION_IMAGE =
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=900&h=600&fit=crop&auto=format";

export const ATTRACTION_FALLBACK_IMAGES = [
  DEFAULT_ATTRACTION_IMAGE,
  "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=900&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=900&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?w=900&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=900&h=600&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?w=900&h=600&fit=crop&auto=format",
];

export function getAttractionFallbackImage(attraction) {
  const key = String(attraction?.id ?? attraction?.name ?? "attraction");
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }
  return ATTRACTION_FALLBACK_IMAGES[hash % ATTRACTION_FALLBACK_IMAGES.length];
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
