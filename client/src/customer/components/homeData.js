import beefTartareImage from "../../assets/images/beef-tartare.jpg";
import canapesImage from "../../assets/images/canapes.jpg";
import filetMignonImage from "../../assets/images/filet-mignon.jpg";
import heroImage from "../../assets/images/hero-bg.jpg";
import seafoodImage from "../../assets/images/seafood.jpg";

export const WHATSAPP_NUMBER = "918788611511";
export const PHONE_NUMBER = "+918788611511";
export const EMAIL_ADDRESS = "info@ahmadcaterers.com";
export const MAP_URL = "https://maps.google.com/?q=Ahmad+Caterers+Margao+Goa";

export const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#menu", label: "Menu" },
  { href: "#gallery", label: "Gallery" },
  { href: "#contact", label: "Contact" }
];

export const heroHighlights = [
  ["01", "Restaurant orders", "Fresh meals, party trays, and chef specials."],
  ["02", "Catering bookings", "Weddings, corporate events, family functions."],
  ["03", "Direct enquiries", "Call, email, or WhatsApp for quick planning."]
];

export const trustStats = [
  { target: 12, suffix: "+", label: "years of catering experience" },
  { target: 800, suffix: "+", label: "guests handled at large events" },
  { target: 4, suffix: ".9", label: "average customer rating" }
];

export const services = [
  ["01", "Wedding Catering", "Full-service menus, live counters, service staff, and event-ready presentation."],
  ["02", "Corporate Buffets", "Breakfast, lunch boxes, buffet spreads, and meeting refreshments for teams."],
  ["03", "Private Parties", "Birthdays, family gatherings, anniversaries, and intimate home celebrations."],
  ["04", "Restaurant Orders", "Signature biryani, seafood meals, grills, starters, and party platters."]
];

export const menuTabs = [
  {
    id: "signature",
    label: "Signature",
    title: "Ahmad Caterers signature spread",
    copy: "A rich selection of crowd favourites prepared for restaurant orders and event service.",
    items: ["Mutton Dum Biryani with raita", "Goan Fish Curry Rice", "Premium Grill Platter", "Party Canape Box"]
  },
  {
    id: "catering",
    label: "Catering",
    title: "Event-ready catering packages",
    copy: "Menus can be tailored for guest count, occasion, service style, and venue requirements.",
    items: ["Wedding feast packages", "Corporate buffet service", "Family function menus", "Custom dessert counters"]
  },
  {
    id: "delivery",
    label: "Delivery",
    title: "Fresh restaurant delivery",
    copy: "Order hot meals, trays, and curated party boxes directly from Ahmad Caterers.",
    items: ["Lunch and dinner orders", "Starter and platter boxes", "Advance party orders", "Direct WhatsApp support"]
  }
];

export const galleryItems = [
  { image: heroImage, caption: "Signature biryani" },
  { image: canapesImage, caption: "Premium canapes" },
  { image: seafoodImage, caption: "Seafood specials" },
  { image: filetMignonImage, caption: "Grill platters" },
  { image: beefTartareImage, caption: "Event starters" }
];

export const processSteps = [
  ["01", "Share event details", "Tell us your date, guest count, venue, and menu preferences."],
  ["02", "Choose the menu", "We help finalize dishes, portions, service style, and add-ons."],
  ["03", "Confirm booking", "Lock the date and coordinate delivery, counters, and staff needs."],
  ["04", "Enjoy the event", "Our team prepares, packs, serves, and supports the food experience."]
];

export const testimonials = [
  ["The food, service, and timing were excellent. Our family function felt completely handled.", "Ayesha Shaikh", "Wedding catering client"],
  ["Ahmad Caterers has become our go-to for office lunches and event buffets in Margao.", "Rohan Fernandes", "Corporate customer"]
];

export const clientTags = ["Weddings", "Corporate lunches", "Family events", "Party trays", "Restaurant delivery"];
