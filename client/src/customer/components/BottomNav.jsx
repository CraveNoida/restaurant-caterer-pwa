import { NavLink, useLocation } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import { CalendarDays, Home, ReceiptText, UserRound, Utensils } from "./icons.jsx";

const links = [
  { to: "/", label: "Home", icon: Home },
  { to: "/menu", label: "Menu", icon: Utensils },
  { to: "/catering", label: "Catering", icon: CalendarDays },
  { to: "/my-orders", label: "Orders", icon: ReceiptText },
  { to: "/profile", label: "Profile", icon: UserRound }
];

export default function BottomNav() {
  const { totals } = useCart();
  const location = useLocation();
  const isActive = (to, pathname) => {
    if (to === "/") return pathname === "/";
    if (to === "/menu") return pathname.startsWith("/menu") || pathname.startsWith("/food");
    if (to === "/my-orders") return pathname.startsWith("/my-orders") || pathname.startsWith("/track-order") || pathname.startsWith("/order-success");
    return pathname.startsWith(to);
  };

  return (
    <nav className="bottom-nav" aria-label="Customer app navigation">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} className={isActive(to, location.pathname) ? "active" : ""}>
          <span>
            <Icon size={19} />
            {to === "/menu" && totals.itemCount > 0 && <em className="nav-badge">{totals.itemCount}</em>}
          </span>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
