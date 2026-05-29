import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function DeliveryLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="delivery-app">
      <header className="delivery-header">
        <div>
          <h1>Delivery Panel</h1>
          <span>{user?.name || "Delivery partner"}</span>
        </div>
        <button type="button" onClick={logout}>Logout</button>
      </header>
      <main className="delivery-main">
        <Outlet />
      </main>
      <nav className="delivery-bottom-nav" aria-label="Delivery navigation">
        <NavLink to="/delivery/dashboard"><span>Dashboard</span></NavLink>
        <NavLink to="/delivery/orders"><span>Orders</span></NavLink>
        <NavLink to="/delivery/completed"><span>Completed</span></NavLink>
        <NavLink to="/delivery/profile"><span>Profile</span></NavLink>
      </nav>
    </div>
  );
}
