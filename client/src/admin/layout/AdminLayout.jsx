import { NavLink, Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { ReceiptText, Search, UserRound } from "../../customer/components/icons.jsx";

const quickLinks = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/menu", label: "Menu" },
  { to: "/admin/bookings", label: "Bookings" },
  { to: "/admin/delivery-boys", label: "Delivery" }
];

export default function AdminLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="admin-app">
      {isMenuOpen && <button type="button" className="admin-drawer-backdrop" aria-label="Close menu" onClick={() => setIsMenuOpen(false)} />}
      <div className={`admin-drawer${isMenuOpen ? " open" : ""}`}>
        <Sidebar onNavigate={() => setIsMenuOpen(false)} />
      </div>
      <Sidebar />
      <main className="admin-main">
        <header className="admin-topbar">
          <button type="button" className="admin-menu-button" onClick={() => setIsMenuOpen(true)}>Menu</button>
          <div className="admin-topbar-title">
            <span>Operations workspace</span>
            <strong>Good day, {user?.name || "Admin"}</strong>
          </div>
          <label className="admin-topbar-search">
            <Search size={16} />
            <input placeholder="Search orders, customers, bookings" />
          </label>
          <button type="button" className="admin-notification-button" aria-label="Notifications">
            <ReceiptText size={18} />
          </button>
          <div className="admin-topbar-profile">
            <span><UserRound size={18} /></span>
            <div>
              <strong>{user?.name || "Admin"}</strong>
              <small>{user?.email || user?.phone}</small>
            </div>
          </div>
          <button type="button" onClick={logout}>Logout</button>
        </header>
        <nav className="admin-quick-nav" aria-label="Quick admin navigation">
          {quickLinks.map((link) => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <Outlet />
      </main>
    </div>
  );
}
