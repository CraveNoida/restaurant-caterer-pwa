import { Link, useParams } from "react-router-dom";
import { CheckCircle2, ChefHat, Clock, MessageCircle, PackageCheck, Phone, ReceiptText, Truck } from "../components/icons.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { getStatusLabel, normalizeStatus } from "../../utils/orderUtils.js";
import { PHONE_NUMBER, WHATSAPP_NUMBER } from "../components/homeData.js";
import { useEffect, useState } from "react";
import { orderService } from "../../services/orderService.js";
import { joinOrderTracking } from "../../services/socketService.js";

const timeline = [
  ["placed", "Order Placed", CheckCircle2],
  ["accepted", "Accepted", Clock],
  ["preparing", "Preparing", ChefHat],
  ["ready", "Ready", PackageCheck],
  ["out_for_delivery", "Out for Delivery", Truck],
  ["delivered", "Delivered", CheckCircle2]
];

function formatLastUpdated(value) {
  if (!value) return "Waiting for delivery partner";
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 10) return "Last updated just now";
  if (seconds < 60) return `Last updated ${seconds} seconds ago`;
  return `Last updated ${Math.round(seconds / 60)} minutes ago`;
}

export default function TrackOrder() {
  const { id } = useParams();
  const { getOrderById } = useCart();
  const [order, setOrder] = useState(() => getOrderById(id));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tracking, setTracking] = useState(null);
  const [trackingError, setTrackingError] = useState("");
  const [socketOnline, setSocketOnline] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    orderService
      .getOrder(id)
      .then((data) => {
        if (isMounted) {
          setOrder(data);
          setTracking({
            orderId: data.orderId,
            deliveryLocation: data.deliveryLocation,
            deliveryTracking: data.deliveryTracking
          });
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "Order not found.");
        setOrder(getOrderById(id));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!order?.orderId) return undefined;
    const session = joinOrderTracking(order.orderId, "customer", {
      onLocation: (payload) => setTracking(payload),
      onError: (message) => setTrackingError(message),
      onConnect: () => setSocketOnline(true),
      onDisconnect: () => setSocketOnline(false)
    });
    return () => session?.cleanup();
  }, [order?.orderId]);

  if (loading) {
    return (
      <div className="app-screen empty-screen">
        <span className="empty-icon"><ReceiptText size={48} /></span>
        <h1>Loading tracking</h1>
        <p>Fetching the latest order status.</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="app-screen empty-screen">
        <span className="empty-icon"><ReceiptText size={48} /></span>
        <h1>Order not found</h1>
        <p>{error || "This order could not be found."}</p>
        <Link className="app-button" to="/my-orders">Go to My Orders</Link>
      </div>
    );
  }

  const activeIndex = Math.max(0, timeline.findIndex(([status]) => status === normalizeStatus(order.status)));
  const liveLocation = tracking?.deliveryLocation || order.deliveryLocation;
  const trackingInfo = tracking?.deliveryTracking || order.deliveryTracking || {};
  const deliveryMapsUrl = liveLocation?.lat && liveLocation?.lng
    ? `https://www.google.com/maps/search/?api=1&query=${liveLocation.lat},${liveLocation.lng}`
    : "";

  return (
    <div className="app-screen track-screen">
      <section className="track-order-id-card app-card">
        <div>
          <span>Order ID</span>
          <strong>{order.orderId}</strong>
        </div>
        <span className="status-badge">{getStatusLabel(order.status)}</span>
      </section>

      <section className="app-card tracking-status-card">
        <div>
          <span>Estimated {order.orderType === "pickup" ? "pickup" : "delivery"}</span>
          <h2>{order.estimatedTime}</h2>
          <p>{order.orderType === "pickup" ? "We will keep it ready at the counter." : "Your food is being handled by the restaurant team."}</p>
          <p>Payment: {order.paymentMethod} - {order.paymentStatus}</p>
        </div>
        <Clock size={34} />
      </section>

      <section className="app-card live-location-card">
        <div>
          <span>Delivery partner location</span>
          <strong>{trackingInfo.isLive ? "Live tracking active" : liveLocation ? "Last known location" : "Waiting for delivery partner"}</strong>
          <p>{formatLastUpdated(liveLocation?.updatedAt || trackingInfo.lastUpdatedAt)}</p>
          {!socketOnline && <small>Realtime connection is reconnecting.</small>}
          {trackingError && <small>{trackingError}</small>}
        </div>
        <div className={trackingInfo.isLive ? "map-placeholder live" : "map-placeholder"}>
          <span>Location pin</span>
          <strong>{liveLocation ? "Delivery nearby" : "Tracking unavailable"}</strong>
          {liveLocation?.accuracy && <small>Accuracy about {Math.round(liveLocation.accuracy)} m</small>}
        </div>
        {deliveryMapsUrl && <a className="app-button outline full-width" href={deliveryMapsUrl} target="_blank" rel="noreferrer">Open delivery location in Google Maps</a>}
      </section>

      <section className="app-card timeline-card premium-timeline">
        <h2>Status Timeline</h2>
        {timeline.map(([status, label, Icon], index) => (
          <div className={index <= activeIndex ? "active" : ""} key={status}>
            <span><Icon size={14} /></span>
            <strong>{label}</strong>
            {index === activeIndex && <small>Current step</small>}
          </div>
        ))}
      </section>

      <section className="app-card support-card">
        <div>
          <strong>Need help with this order?</strong>
          <span>Call or WhatsApp the restaurant directly.</span>
        </div>
        <div className="button-row">
          <a className="app-button outline full-width" href={`tel:${PHONE_NUMBER}`}><Phone size={18} /> Call</a>
          <a className="app-button outline full-width" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi Ahmad Caterers, I need help with order ${order.orderId}.`)}`} target="_blank" rel="noreferrer"><MessageCircle size={18} /> WhatsApp</a>
        </div>
      </section>

      <section className="app-card order-summary-card">
        <h2>Order Summary</h2>
        {order.items.map((item) => (
          <div key={item.cartKey || item.id}>
            <span>{item.quantity} x {item.name}</span>
            <strong>{formatCurrency(item.price * item.quantity)}</strong>
          </div>
        ))}
        <div className="grand-total">
          <span>Total</span>
          <strong>{formatCurrency(order.totalAmount)}</strong>
        </div>
      </section>

      {order.orderType !== "pickup" && (
        <section className="app-card address-card">
          <h2>Delivery Address</h2>
          <p>{order.address}</p>
          {order.landmark && <span>Landmark: {order.landmark}</span>}
        </section>
      )}
    </div>
  );
}
