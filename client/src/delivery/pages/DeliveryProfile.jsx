import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { deliveryService } from "../../services/deliveryService.js";

export default function DeliveryProfile() {
  const { logout, user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [completedDeliveries, setCompletedDeliveries] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    deliveryService.getProfile()
      .then((data) => {
        setProfile(data.deliveryBoy);
        setCompletedDeliveries(data.completedDeliveries || 0);
      })
      .catch((err) => setError(err.message || "Unable to load delivery profile."))
      .finally(() => setLoading(false));
  }, []);

  const deliveryUser = profile?.user || user;

  return (
    <section className="delivery-page">
      <h1>Profile</h1>
      {loading && <div className="delivery-state">Loading profile...</div>}
      {error && <div className="delivery-alert error">{error}</div>}
      {!loading && <article className="delivery-profile-card">
        <strong>{deliveryUser?.name || profile?.name || "Delivery partner"}</strong>
        <span>{deliveryUser?.phone || profile?.phone}</span>
        <span>{deliveryUser?.email || "No email"}</span>
        <span>{profile?.isAvailable ? "Active" : "Inactive"}</span>
        <b>{completedDeliveries} completed deliveries</b>
      </article>}
      <button className="delivery-primary-button" type="button" onClick={logout}>Logout</button>
    </section>
  );
}
