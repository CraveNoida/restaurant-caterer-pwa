import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, Headphones, Home, MapPin, MoreVertical, Phone, ReceiptText, ShieldCheck, Star, UserRound } from "../components/icons.jsx";
import WhatsAppButton from "../components/WhatsAppButton.jsx";
import { PHONE_NUMBER } from "../components/homeData.js";
import { useCart } from "../../context/CartContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import { bookingService } from "../../services/bookingService.js";

export default function Profile() {
  const { orders } = useCart();
  const { user, isAuthenticated, loading, logout, fetchProfile } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    if (isAuthenticated) fetchProfile().catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let isMounted = true;

    bookingService
      .getMyBookings()
      .then((data) => {
        if (isMounted) setBookings(data);
      })
      .catch((error) => {
        if (isMounted) setBookingError(error.message || "Unable to load catering bookings.");
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);

  return (
    <div className="app-screen profile-screen premium-profile-screen">
      <section className="premium-profile-card">
        <div className="premium-profile-avatar"><UserRound size={42} /></div>
        <div>
          <h1>{loading ? "Loading profile" : user?.name || "Guest Customer"}</h1>
          <p>{isAuthenticated ? [user?.phone, user?.email].filter(Boolean).join(" | ") : "Login to sync orders and catering bookings."}</p>
        </div>
      </section>

      {!isAuthenticated && (
        <div className="button-row">
          <Link className="app-button full-width" to="/login">Login</Link>
          <Link className="app-button outline full-width" to="/register">Register</Link>
        </div>
      )}

      <section className="premium-stat-grid profile-premium-stats">
        <ProfileStat icon={ReceiptText} label="Orders" value={orders.length} />
        <ProfileStat icon={CalendarDays} label="Bookings" value={bookings.length} />
        <ProfileStat icon={Star} label="Kitchen rating" value="4.9" />
      </section>

      <section className="premium-loyalty-card">
        <Star size={58} />
        <div>
          <h2>Ahmad Priority</h2>
          <p>Future loyalty placeholder for repeat food orders and catering customers.</p>
        </div>
      </section>

      <section className="premium-profile-section">
        <h2><MapPin size={23} /> Saved Addresses</h2>
        {user?.addresses?.length ? (
          user.addresses.map((address) => (
            <article className="premium-address-card" key={`${address.label}-${address.addressLine}`}>
              <span><Home size={23} /></span>
              <div>
                <strong>{address.label || "Address"}</strong>
                <p>{[address.addressLine, address.city, address.state, address.pincode].filter(Boolean).join(", ")}</p>
              </div>
              <button type="button" aria-label="Address options"><MoreVertical size={21} /></button>
            </article>
          ))
        ) : (
          <article className="premium-address-card">
            <span><Home size={23} /></span>
            <div>
              <strong>Address placeholder</strong>
              <p>{isAuthenticated ? "Saved addresses will appear here." : "Login to save delivery addresses."}</p>
            </div>
            <button type="button" aria-label="Address options"><MoreVertical size={21} /></button>
          </article>
        )}
      </section>

      <section className="premium-profile-menu">
        {!isAuthenticated && <ProfileLink to="/login" icon={UserRound} label="Login / Register" />}
        <ProfileLink to="/my-orders" icon={ReceiptText} label="My Orders" />
        <ProfileLink to="/catering-booking" icon={CalendarDays} label="Catering bookings" />
        <ProfileLink to="/catering" icon={Home} label="Event menu builder" />
        <ProfileLink to="/menu" icon={ShieldCheck} label="Recommended dishes" />
      </section>

      <section className="premium-profile-section">
        <h2><CalendarDays size={23} /> My Catering Bookings</h2>
        {!isAuthenticated ? (
          <p className="muted-text">Login to view saved catering booking enquiries.</p>
        ) : bookingError ? (
          <p className="field-error">{bookingError}</p>
        ) : bookings.length ? (
          bookings.slice(0, 3).map((booking) => (
            <article className="premium-address-card" key={booking._id || booking.bookingId}>
              <span><CalendarDays size={23} /></span>
              <div>
                <strong>{booking.bookingId || booking.eventType}</strong>
                <p>{booking.eventType} - {booking.guestCount} guests</p>
              </div>
            </article>
          ))
        ) : (
          <p className="muted-text">No catering enquiries yet.</p>
        )}
      </section>

      <section className="premium-profile-section support">
        <h2><Headphones size={23} /> Help & Support</h2>
        <div className="premium-support-grid">
          <a href={`tel:${PHONE_NUMBER}`}><Phone size={22} /> Call restaurant</a>
          <WhatsAppButton message="Hi Ahmad Caterers, I need help with my order.">WhatsApp restaurant</WhatsAppButton>
        </div>
      </section>
      {isAuthenticated && <button className="app-button outline full-width" type="button" onClick={logout}>Logout</button>}
    </div>
  );
}

function ProfileStat({ icon: Icon, label, value }) {
  return (
    <article className="premium-stat-card">
      <span><Icon size={22} fill={Icon === Star ? "currentColor" : "none"} /></span>
      <div>
        <small>{label}</small>
        {value && <strong>{value}</strong>}
      </div>
    </article>
  );
}

function ProfileLink({ to, icon: Icon, label }) {
  return (
    <Link to={to}>
      <span><Icon size={20} /></span>
      <strong>{label}</strong>
      <ChevronRight size={21} />
    </Link>
  );
}
