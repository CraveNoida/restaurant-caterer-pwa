const paths = {
  ArrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
  ArrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  Bike: <path d="M5 17a3 3 0 1 0 0 .1M19 17a3 3 0 1 0 0 .1M8 17h4l3-7h2M7 10h4l2 7M5 10h2" />,
  CalendarDays: <path d="M8 2v4M16 2v4M3 9h18M5 5h14v16H5zM8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" />,
  CalendarClock: <path d="M8 2v4M16 2v4M3 9h18M5 5h10M5 5v16h7M16 14a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM16 16v3l2 1" />,
  CheckCircle2: <path d="M21 11.1V12a9 9 0 1 1-5.3-8.2M9 11l3 3L22 4" />,
  ChefHat: <path d="M6 13.5A4 4 0 0 1 8 6a5 5 0 0 1 8 0 4 4 0 0 1 2 7.5V21H6zM6 17h12" />,
  ChevronRight: <path d="M9 18l6-6-6-6" />,
  Clock: <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2" />,
  CreditCard: <path d="M3 6h18v12H3zM3 10h18M7 15h3" />,
  Headphones: <path d="M4 14a8 8 0 0 1 16 0v5a2 2 0 0 1-2 2h-2v-7h4M4 14h4v7H6a2 2 0 0 1-2-2z" />,
  Heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />,
  Home: <path d="M3 11l9-8 9 8M5 10v11h14V10M9 21v-7h6v7" />,
  Mail: <path d="M4 6h16v12H4zM4 7l8 6 8-6" />,
  MoreVertical: <path d="M12 8h.01M12 12h.01M12 16h.01" />,
  MapPin: <path d="M12 22s7-5.5 7-12a7 7 0 1 0-14 0c0 6.5 7 12 7 12zM12 10.5a2 2 0 1 0 0-.1" />,
  MapPinned: <path d="M12 22s7-5.5 7-12a7 7 0 1 0-14 0c0 6.5 7 12 7 12zM12 10.5a2 2 0 1 0 0-.1M3 22h18" />,
  MessageCircle: <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.7 8.7 0 0 1-3.7-.8L3 21l1.8-5A8.4 8.4 0 1 1 21 11.5z" />,
  Minus: <path d="M5 12h14" />,
  Package: <path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8" />,
  PackageCheck: <path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M9 17l2 2 4-5" />,
  ShieldCheck: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-5" />,
  PartyPopper: <path d="M5 21l4-12 6 6-10 6zM14 4l.5 3M19 5l-2 2M20 11l-3-.5M10 4l1 2" />,
  Phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2.1z" />,
  Plus: <path d="M12 5v14M5 12h14" />,
  ReceiptText: <path d="M6 2h12v20l-3-2-3 2-3-2-3 2zM9 7h6M9 11h6M9 15h4" />,
  RotateCcw: <path d="M3 7v6h6M3.5 13A8.5 8.5 0 1 0 6 4.5L3 7" />,
  Search: <path d="M11 19a8 8 0 1 1 5.7-2.3L21 21" />,
  ShoppingBag: <path d="M6 7h12l1 14H5zM9 7a3 3 0 0 1 6 0" />,
  ShoppingCart: <path d="M3 3h2l2.2 11h10.6L20 7H6M9 20a1 1 0 1 0 0-.1M18 20a1 1 0 1 0 0-.1" />,
  Star: <path d="M12 2l3 6 6.5.9-4.7 4.6 1.1 6.5L12 17l-5.9 3 1.1-6.5L2.5 8.9 9 8z" />,
  Tag: <path d="M20 13l-7 7L3 10V3h7l10 10zM7 7h.01" />,
  Trash2: <path d="M3 6h18M8 6V4h8v2M6 6l1 16h10l1-16M10 11v6M14 11v6" />,
  Truck: <path d="M3 5h12v11H3zM15 9h4l2 3v4h-6zM7 20a2 2 0 1 0 0-.1M17 20a2 2 0 1 0 0-.1" />,
  UserRound: <path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10z" />,
  Users: <path d="M16 21v-2a4 4 0 0 0-8 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.8M17 3.1a4 4 0 0 1 0 7.8" />,
  Utensils: <path d="M4 2v8a4 4 0 0 0 4 4v8M8 2v20M12 2v8M20 2v20M16 2v8a4 4 0 0 0 4 4" />,
  Wallet: <path d="M3 7h16a2 2 0 0 1 2 2v10H5a2 2 0 0 1-2-2zM3 7l3-4h13v4M17 13h.01" />
};

function makeIcon(name) {
  return function Icon({ size = 24, color = "currentColor", fill = "none", strokeWidth = 2, ...props }) {
    return (
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fill}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {paths[name]}
      </svg>
    );
  };
}

export const ArrowLeft = makeIcon("ArrowLeft");
export const ArrowRight = makeIcon("ArrowRight");
export const Bike = makeIcon("Bike");
export const CalendarDays = makeIcon("CalendarDays");
export const CalendarClock = makeIcon("CalendarClock");
export const CheckCircle2 = makeIcon("CheckCircle2");
export const ChefHat = makeIcon("ChefHat");
export const ChevronRight = makeIcon("ChevronRight");
export const Clock = makeIcon("Clock");
export const CreditCard = makeIcon("CreditCard");
export const Headphones = makeIcon("Headphones");
export const Heart = makeIcon("Heart");
export const Home = makeIcon("Home");
export const Mail = makeIcon("Mail");
export const MoreVertical = makeIcon("MoreVertical");
export const MapPin = makeIcon("MapPin");
export const MapPinned = makeIcon("MapPinned");
export const MessageCircle = makeIcon("MessageCircle");
export const Minus = makeIcon("Minus");
export const Package = makeIcon("Package");
export const PackageCheck = makeIcon("PackageCheck");
export const ShieldCheck = makeIcon("ShieldCheck");
export const PartyPopper = makeIcon("PartyPopper");
export const Phone = makeIcon("Phone");
export const Plus = makeIcon("Plus");
export const ReceiptText = makeIcon("ReceiptText");
export const RotateCcw = makeIcon("RotateCcw");
export const Search = makeIcon("Search");
export const ShoppingBag = makeIcon("ShoppingBag");
export const ShoppingCart = makeIcon("ShoppingCart");
export const Star = makeIcon("Star");
export const Tag = makeIcon("Tag");
export const Trash2 = makeIcon("Trash2");
export const Truck = makeIcon("Truck");
export const UserRound = makeIcon("UserRound");
export const Users = makeIcon("Users");
export const Utensils = makeIcon("Utensils");
export const Wallet = makeIcon("Wallet");
