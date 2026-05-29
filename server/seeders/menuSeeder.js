import "dotenv/config";
import { connectDB } from "../config/db.js";
import MenuItem from "../models/MenuItem.js";

const menuItems = [
  {
    name: "Chicken Dum Biryani",
    description: "Aromatic basmati rice layered with tender chicken and house spices.",
    price: 260,
    category: "Biryani",
    image: "",
    foodType: "nonveg",
    rating: 4.7,
    prepTime: "30 min",
    tags: ["biryani", "chicken", "popular"],
    customizationOptions: {
      portions: [
        { name: "Half", price: 0 },
        { name: "Full", price: 120 }
      ],
      spiceLevels: ["Mild", "Medium", "Spicy"],
      addOns: [{ name: "Extra raita", price: 30 }]
    }
  },
  {
    name: "Paneer Tikka Starter",
    description: "Char-grilled paneer cubes with peppers and smoky marinade.",
    price: 220,
    category: "Starters",
    image: "",
    foodType: "veg",
    rating: 4.5,
    prepTime: "20 min",
    tags: ["starter", "paneer", "veg"]
  },
  {
    name: "Chicken Cafreal",
    description: "Goan-style chicken cooked with green herbs and spices.",
    price: 320,
    category: "Chicken",
    image: "",
    foodType: "nonveg",
    rating: 4.6,
    prepTime: "35 min",
    tags: ["chicken", "goan"]
  },
  {
    name: "Mutton Rogan Josh",
    description: "Slow-cooked mutton curry with rich spices.",
    price: 420,
    category: "Mutton",
    image: "",
    foodType: "nonveg",
    rating: 4.8,
    prepTime: "45 min",
    tags: ["mutton", "curry"]
  },
  {
    name: "Prawn Masala",
    description: "Fresh prawns tossed in a coastal masala.",
    price: 380,
    category: "Seafood",
    image: "",
    foodType: "nonveg",
    rating: 4.6,
    prepTime: "30 min",
    tags: ["seafood", "prawns"]
  },
  {
    name: "Veg Kadai",
    description: "Seasonal vegetables cooked in kadai masala.",
    price: 210,
    category: "Veg",
    image: "",
    foodType: "veg",
    rating: 4.3,
    prepTime: "25 min",
    tags: ["veg", "curry"]
  },
  {
    name: "Gulab Jamun",
    description: "Classic warm dessert served with syrup.",
    price: 90,
    category: "Desserts",
    image: "",
    foodType: "veg",
    rating: 4.4,
    prepTime: "10 min",
    tags: ["dessert", "sweet"]
  },
  {
    name: "Fresh Lime Soda",
    description: "Refreshing lime soda, sweet or salted.",
    price: 70,
    category: "Beverages",
    image: "",
    foodType: "veg",
    rating: 4.2,
    prepTime: "5 min",
    tags: ["drink", "beverage"]
  },
  {
    name: "Family Biryani Combo",
    description: "Chicken biryani, starter, dessert, and drinks for a family meal.",
    price: 899,
    category: "Combos",
    image: "",
    foodType: "nonveg",
    rating: 4.7,
    prepTime: "40 min",
    tags: ["combo", "family", "biryani"]
  }
];

async function seedMenu() {
  await connectDB();
  await MenuItem.deleteMany({});
  await MenuItem.insertMany(menuItems);
  console.log(`Seeded ${menuItems.length} menu items`);
  await MenuItem.db.close();
}

seedMenu().catch((error) => {
  console.error(error);
  process.exit(1);
});
