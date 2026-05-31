import { NavLink } from "react-router-dom";
import { CalendarDays, CreditCard, Home, PackageCheck, ReceiptText, ShieldCheck, Truck, Users, Utensils } from "../../customer/components/icons.jsx";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: Home },
  { to: "/admin/orders", label: "Orders", icon: ReceiptText },
  { to: "/admin/menu", label: "Menu Items", icon: Utensils },
  { to: "/admin/bookings", label: "Catering Bookings", icon: CalendarDays },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/delivery-boys", label: "Delivery Boys", icon: Truck },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/reports", label: "Reports", icon: PackageCheck },
  { to: "/admin/settings", label: "Settings", icon: ShieldCheck }
];

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <span>A</span>
        <div>
          <h2>Ahmad Admin</h2>
          <small>Restaurant control</small>
        </div>
      </div>
      <nav aria-label="Admin navigation">
        {links.map((link) => {
          const Icon = link.icon;
          return (
          <NavLink key={link.to} to={link.to} onClick={onNavigate}>
            <Icon size={18} />
            {link.label}
          </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
