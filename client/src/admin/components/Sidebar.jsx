import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/menu", label: "Menu Items" },
  { to: "/admin/bookings", label: "Catering Bookings" },
  { to: "/admin/customers", label: "Customers" },
  { to: "/admin/delivery-boys", label: "Delivery Boys" },
  { to: "/admin/payments", label: "Payments" },
  { to: "/admin/reports", label: "Reports" },
  { to: "/admin/settings", label: "Settings" }
];

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="admin-sidebar">
      <h2>Ahmad Admin</h2>
      <nav aria-label="Admin navigation">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} onClick={onNavigate}>
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
