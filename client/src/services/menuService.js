import { apiRequest } from "./api.js";
import { foodData } from "../customer/data/foodData.js";

function displayFoodType(foodType) {
  return foodType === "veg" ? "Veg" : "Non-Veg";
}

function normalizeOptions(options = {}) {
  return {
    portions: (options.portions || []).map((item) => (typeof item === "string" ? item : item.name)).filter(Boolean),
    spiceLevels: options.spiceLevels || ["Mild", "Medium", "Spicy"],
    addOns: (options.addOns || []).map((item) => (typeof item === "string" ? item : item.name)).filter(Boolean)
  };
}

export function normalizeMenuItem(item) {
  if (!item) return null;
  const fallbackImage = foodData[0]?.image || "";
  return {
    ...item,
    id: item._id || item.id,
    image: item.image || fallbackImage,
    foodType: item.foodType === "Veg" || item.foodType === "Non-Veg" ? item.foodType : displayFoodType(item.foodType),
    rating: item.rating || 4.5,
    prepTime: item.prepTime || "25-30 min",
    popularity: item.popularity || Math.round((item.rating || 4.5) * 20),
    isAvailable: item.isAvailable !== false,
    customizationOptions: normalizeOptions(item.customizationOptions),
    addOns: normalizeOptions(item.customizationOptions).addOns,
    tags: item.tags?.length ? item.tags : [item.category || "Popular"]
  };
}

function toQueryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") query.set(key, value);
  });
  return query.toString();
}

export const menuService = {
  getMenuItems: async (params = {}) => {
    const query = toQueryString(params);
    const data = await apiRequest(`/menu${query ? `?${query}` : ""}`);
    return (data?.items || []).map(normalizeMenuItem).filter(Boolean);
  },
  getMenuItem: async (id) => {
    const data = await apiRequest(`/menu/${id}`);
    return normalizeMenuItem(data?.item);
  }
};
