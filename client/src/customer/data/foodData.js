import beefTartareImage from "../../assets/images/beef-tartare.jpg";
import canapesImage from "../../assets/images/canapes.jpg";
import filetMignonImage from "../../assets/images/filet-mignon.jpg";
import heroImage from "../../assets/images/hero-bg.jpg";
import seafoodImage from "../../assets/images/seafood.jpg";

const defaultCustomizationOptions = {
  portions: ["Half", "Full", "Family Pack"],
  spiceLevels: ["Mild", "Medium", "Spicy"],
  addOns: ["Extra Raita", "Extra Gravy", "Cold Drink", "Dessert"]
};

const createFood = (food) => {
  const customizationOptions = {
    ...defaultCustomizationOptions,
    ...(food.customizationOptions || {}),
    addOns: food.addOns || food.customizationOptions?.addOns || defaultCustomizationOptions.addOns
  };
  const tags = food.tags || [food.tag || "Popular"];

  return {
    ...food,
    tags,
    tag: food.tag || tags[0],
    customizationOptions,
    addOns: customizationOptions.addOns
  };
};

export const foodData = [
  createFood({
    id: "mutton-dum-biryani",
    name: "Mutton Dum Biryani",
    description: "Slow-cooked basmati rice, tender mutton, saffron aroma, and raita.",
    price: 340,
    category: "Biryani",
    foodType: "Non-Veg",
    rating: 4.9,
    prepTime: "30 min",
    popularity: 98,
    isAvailable: true,
    image: heroImage,
    tags: ["Best Seller", "Chef Special"],
    addOns: ["Extra Raita", "Cold Drink", "Dessert"]
  }),
  createFood({
    id: "goan-fish-thali",
    name: "Goan Fish Thali",
    description: "Fish curry, rice, fried fish, salad, pickle, and sol kadi.",
    price: 280,
    category: "Seafood",
    foodType: "Non-Veg",
    rating: 4.8,
    prepTime: "25 min",
    popularity: 92,
    isAvailable: true,
    image: seafoodImage,
    tags: ["Chef Special", "Goan Favorite"],
    addOns: ["Extra Gravy", "Cold Drink"]
  }),
  createFood({
    id: "party-canape-box",
    name: "Party Canape Box",
    description: "Assorted premium starters for small gatherings and meetings.",
    price: 420,
    category: "Starters",
    foodType: "Veg",
    rating: 4.7,
    prepTime: "35 min",
    popularity: 88,
    isAvailable: true,
    image: canapesImage,
    tags: ["New", "Party Pack"],
    addOns: ["Cold Drink", "Dessert"]
  }),
  createFood({
    id: "premium-grill-platter",
    name: "Premium Grill Platter",
    description: "Grilled chicken mains, sauces, breads, and seasonal sides.",
    price: 520,
    category: "Chicken",
    foodType: "Non-Veg",
    rating: 4.8,
    prepTime: "40 min",
    popularity: 90,
    isAvailable: true,
    image: filetMignonImage,
    tags: ["Chef Special", "Protein Rich"],
    addOns: ["Extra Gravy", "Cold Drink", "Dessert"]
  }),
  createFood({
    id: "mutton-seekh-kebab",
    name: "Mutton Seekh Kebab",
    description: "Juicy minced mutton kebabs with mint chutney and onions.",
    price: 260,
    category: "Mutton",
    foodType: "Non-Veg",
    rating: 4.6,
    prepTime: "22 min",
    popularity: 78,
    isAvailable: true,
    image: beefTartareImage,
    tags: ["Best Seller", "Starter"],
    addOns: ["Extra Raita", "Cold Drink"]
  }),
  createFood({
    id: "veg-handi",
    name: "Veg Handi",
    description: "Creamy mixed vegetable curry finished with aromatic spices.",
    price: 220,
    category: "Veg",
    foodType: "Veg",
    rating: 4.5,
    prepTime: "28 min",
    popularity: 70,
    isAvailable: true,
    image: canapesImage,
    tags: ["Comfort", "Veg Favorite"],
    addOns: ["Extra Gravy", "Dessert"]
  }),
  createFood({
    id: "chicken-biryani",
    name: "Chicken Biryani",
    description: "Layered chicken biryani with fragrant rice and house masala.",
    price: 300,
    category: "Biryani",
    foodType: "Non-Veg",
    rating: 4.7,
    prepTime: "30 min",
    popularity: 86,
    isAvailable: true,
    image: heroImage,
    tags: ["Popular", "Best Value"],
    addOns: ["Extra Raita", "Cold Drink"]
  }),
  createFood({
    id: "butter-chicken-combo",
    name: "Butter Chicken Combo",
    description: "Butter chicken, naan, rice, salad, and a chilled drink.",
    price: 390,
    category: "Combos",
    foodType: "Non-Veg",
    rating: 4.7,
    prepTime: "32 min",
    popularity: 83,
    isAvailable: true,
    image: filetMignonImage,
    tags: ["Combo", "Filling"],
    addOns: ["Extra Gravy", "Dessert"]
  }),
  createFood({
    id: "gulab-jamun",
    name: "Gulab Jamun",
    description: "Soft dessert dumplings served warm in cardamom syrup.",
    price: 110,
    category: "Desserts",
    foodType: "Veg",
    rating: 4.6,
    prepTime: "10 min",
    popularity: 74,
    isAvailable: true,
    image: canapesImage,
    tags: ["Sweet"],
    customizationOptions: { portions: ["Regular", "Family Pack"], spiceLevels: [], addOns: [] }
  }),
  createFood({
    id: "fresh-lime-soda",
    name: "Fresh Lime Soda",
    description: "Refreshing sweet, salted, or mixed lime soda.",
    price: 80,
    category: "Beverages",
    foodType: "Veg",
    rating: 4.4,
    prepTime: "8 min",
    popularity: 66,
    isAvailable: true,
    image: seafoodImage,
    tags: ["Cool"],
    customizationOptions: { portions: ["Regular"], spiceLevels: [], addOns: [] }
  }),
  createFood({
    id: "seafood-platter",
    name: "Seafood Platter",
    description: "Assorted fish fry, prawns, chutneys, and fresh salad.",
    price: 560,
    category: "Seafood",
    foodType: "Non-Veg",
    rating: 4.8,
    prepTime: "38 min",
    popularity: 81,
    isAvailable: false,
    image: seafoodImage,
    tags: ["Seasonal", "Unavailable"],
    addOns: ["Cold Drink", "Dessert"]
  })
];

export const popularDishes = foodData.filter((item) => item.isAvailable).slice(0, 4);
export const todaysSpecial = foodData[0];
export const recommendedDishes = [...foodData].filter((item) => item.isAvailable).sort((a, b) => b.popularity - a.popularity).slice(0, 5);
export const bestSellers = foodData.filter((item) => item.tags.includes("Best Seller"));
