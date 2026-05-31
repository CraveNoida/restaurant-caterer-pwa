import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Search, UserRound } from "./icons.jsx";
import logoImage from "../../assets/images/logo-site.png";
import { useAuth } from "../../context/AuthContext.jsx";
import { getDefaultCustomerLocation } from "../../utils/customerLocation.js";

const pageTitles = {
  "/": "Ahmad Caterers",
  "/menu": "Menu",
  "/cart": "Cart",
  "/checkout": "Checkout",
  "/order-success": "Order Success",
  "/my-orders": "My Orders",
  "/catering": "Catering",
  "/catering-booking": "Book Catering",
  "/profile": "Profile"
};

export default function AppHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const isHome = location.pathname === "/";
  const title = location.pathname.startsWith("/track-order")
    ? "Track Order"
    : location.pathname.startsWith("/food")
      ? "Food Details"
      : pageTitles[location.pathname] || "Ahmad Caterers";
  const showSearch = location.pathname === "/";
  const searchText = "Search biryani, starters, catering trays";
  const savedLocation = getDefaultCustomerLocation(user);
  const subtitle = savedLocation || (isAuthenticated ? "Set delivery location" : "Detect your location");

  const goBack = () => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <header className={`app-header ${showSearch ? "" : "compact"}`}>
      <div className="app-header-top">
        {!isHome && (
          <button className="back-button" type="button" onClick={goBack} aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
        )}
        <Link to="/" className="app-brand" aria-label="Ahmad Caterers home">
          {isHome && <img src={logoImage} alt="Ahmad Caterers" />}
          <span>
            <strong>{title}</strong>
            <small><MapPin size={13} /> {subtitle}</small>
          </span>
        </Link>
        <Link to="/profile" className="header-avatar" aria-label="Open profile">
          <UserRound size={20} />
        </Link>
      </div>
      {showSearch && (
        <Link to="/menu" className="header-search">
          <Search size={18} />
          {searchText}
        </Link>
      )}
    </header>
  );
}
