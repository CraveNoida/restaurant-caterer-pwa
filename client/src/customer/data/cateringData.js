import canapesImage from "../../assets/images/canapes.jpg";
import filetMignonImage from "../../assets/images/filet-mignon.jpg";
import heroImage from "../../assets/images/hero-bg.jpg";
import seafoodImage from "../../assets/images/seafood.jpg";

export const eventCategories = [
  { title: "Wedding Catering", image: heroImage, copy: "Elegant feasts and service teams." },
  { title: "Birthday Party", image: canapesImage, copy: "Snacks, mains, desserts, and party trays." },
  { title: "Corporate Event", image: seafoodImage, copy: "Buffets and packed meals for teams." },
  { title: "Outdoor Catering", image: filetMignonImage, copy: "Live counters and venue-ready service." },
  { title: "Family Function", image: canapesImage, copy: "Comfort menus for close gatherings." },
  { title: "Reception/Nikah", image: heroImage, copy: "Traditional menus for large guest counts." }
];

export const cateringPackages = [
  {
    name: "Basic Package",
    price: "from Rs 320/plate",
    features: ["2 starters", "2 mains", "Rice or biryani", "Dessert"]
  },
  {
    name: "Premium Package",
    price: "from Rs 650/plate",
    features: ["4 starters", "Live counter", "Premium mains", "Dessert counter"]
  },
  {
    name: "Custom Package",
    price: "quote on request",
    rate: 0,
    features: ["Custom menu", "Service staff", "Venue planning", "Special requirements"]
  },
  {
    name: "Royal Package",
    price: "from Rs 950/plate",
    rate: 950,
    features: ["6 starters", "Live counters", "Royal mains", "Dessert and beverage bar"]
  }
];

cateringPackages[0].rate = 320;
cateringPackages[1].rate = 650;

export const cateringSteps = [
  "Share event details",
  "Choose menu and package",
  "Confirm date and guest count",
  "Enjoy full catering service"
];

export const menuBuilderCategories = {
  Starters: ["Chicken Tikka", "Paneer Canapes", "Mutton Seekh Kebab", "Veg Cutlets"],
  "Main Course": ["Butter Chicken", "Veg Handi", "Mutton Korma", "Fish Curry"],
  "Rice/Biryani": ["Mutton Dum Biryani", "Chicken Biryani", "Veg Pulao", "Jeera Rice"],
  Breads: ["Naan", "Tandoori Roti", "Paratha"],
  Desserts: ["Gulab Jamun", "Fruit Custard", "Kheer"],
  Beverages: ["Fresh Lime Soda", "Sol Kadi", "Cold Drink"]
};

export const trustBadges = [
  "Hygienic Kitchen",
  "Fresh Ingredients",
  "On-Time Delivery",
  "Trusted for Events",
  "Direct Restaurant Support",
  "No Marketplace Commission",
  "Custom Menu Available"
];
