import { apiRequest } from "./placesService";

const userPath = (email, suffix) => `/api/users/${encodeURIComponent(email)}${suffix}`;

export const identifyLandmark = (email, imageBase64) =>
  apiRequest("/api/travel-lens/identify", {
    method: "POST",
    body: JSON.stringify({ email, imageBase64 }),
  });

export const fetchExpenseGroups = (email) => apiRequest(userPath(email, "/expense-groups"));
export const saveExpenseGroups = (email, groups) =>
  apiRequest(userPath(email, "/expense-groups"), {
    method: "PUT",
    body: JSON.stringify({ groups }),
  });

export const fetchPackingLists = (email) => apiRequest(userPath(email, "/packing-lists"));
export const savePackingLists = (email, lists) =>
  apiRequest(userPath(email, "/packing-lists"), {
    method: "PUT",
    body: JSON.stringify({ lists }),
  });

export const fetchEcoProfile = (email) => apiRequest(userPath(email, "/eco-profile"));
export const saveEcoProfile = (email, profile) =>
  apiRequest(userPath(email, "/eco-profile"), {
    method: "PUT",
    body: JSON.stringify({ profile }),
  });
