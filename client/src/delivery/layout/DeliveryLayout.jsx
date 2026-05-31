import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { CheckCircle2, Home, ReceiptText, UserRound } from "../../customer/components/icons.jsx";

const navItems = [
  { to: "/delivery/dashboard", label: "Dashboard", icon: Home },
  { to: "/delivery/orders", label: "Orders", icon: ReceiptText },
  { to: "/delivery/completed", label: "Completed", icon: CheckCircle2 },
  { to: "/delivery/profile", label: "Profile", icon: UserRound }
];

export default function DeliveryLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="delivery-app">
      <header className="delivery-header">
        <div>
          <span>Ahmad Delivery</span>
          <h1>{user?.name || "Delivery partner"}</h1>
        </div>
        <button type="button" onClick={logout}>Logout</button>
      </header>
      <main className="delivery-main">
        <Outlet />
      </main>
      <nav className="delivery-bottom-nav" aria-label="Delivery navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink to={item.to} key={item.to}>
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
