import { Outlet, useLocation } from "react-router-dom";
import AppHeader from "../components/AppHeader.jsx";
import BottomNav from "../components/BottomNav.jsx";
import FloatingWhatsApp from "../components/FloatingWhatsApp.jsx";
import StickyCartButton from "../components/StickyCartButton.jsx";

export default function CustomerLayout() {
  const location = useLocation();
  const showHeader = !["/login", "/register"].includes(location.pathname);
  const hasCompactHeader = location.pathname !== "/";
  const hideStickyCart = ["/cart", "/checkout", "/order-success"].some((path) => location.pathname.startsWith(path)) ||
    location.pathname.startsWith("/track-order");
  const hideFloatingWhatsApp = hideStickyCart || ["/my-orders", "/profile"].some((path) => location.pathname.startsWith(path));

  return (
    <div className={`customer-app app-mobile-shell ${hasCompactHeader ? "has-compact-header" : ""}`}>
      {showHeader && <AppHeader />}
      <main className="app-main">
        <Outlet />
      </main>
      {!hideStickyCart && <StickyCartButton />}
      {!hideFloatingWhatsApp && <FloatingWhatsApp />}
      <BottomNav />
    </div>
  );
}
