import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { deliveryService } from "../../services/deliveryService.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { getStatusLabel } from "../../utils/orderUtils.js";
import DeliveryConfirm from "../components/DeliveryConfirm.jsx";
import DeliveryToast from "../components/DeliveryToast.jsx";
import { joinOrderTracking } from "../../services/socketService.js";
import { LiveTrackingMap } from "../../components/maps/index.js";
import { formatAccuracy, googleMapsRouteUrl, googleMapsUrl } from "../../utils/mapUtils.js";

const statusActions = [
  ["picked_up", "Picked up"],
  ["on_the_way", "On the way"],
  ["delivered", "Delivered"],
  ["failed_delivery", "Failed delivery"]
];

const deliveryStatusLabels = {
  assigned: "Assigned",
  picked_up: "Picked up",
  on_the_way: "On the way",
  delivered: "Delivered",
  failed_delivery: "Failed delivery"
};

const MIN_LOCATION_INTERVAL = 7000;
const MIN_LOCATION_MOVE_METERS = 20;

function formatLastUpdated(value) {
  if (!value) return "No location shared yet";
  const seconds = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 10) return "Updated just now";
  if (seconds < 60) return `Updated ${seconds} seconds ago`;
  return `Updated ${Math.round(seconds / 60)} minutes ago`;
}

function distanceMeters(a, b) {
  if (!a || !b) return Infinity;
  const toRad = (value) => (value * Math.PI) / 180;
  const earth = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earth * Math.asin(Math.sqrt(h));
}

export default function DeliveryOrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [tracking, setTracking] = useState(null);
  const [trackingError, setTrackingError] = useState("");
  const [socketState, setSocketState] = useState("offline");
  const watchIdRef = useRef(null);
  const socketSessionRef = useRef(null);
  const lastSentRef = useRef({ at: 0, location: null });

  useEffect(() => {
    deliveryService.getOrder(id)
      .then((data) => {
        setOrder(data.order);
        setTracking({
          orderId: data.order.orderId,
          deliveryLocation: data.order.deliveryLocation,
          deliveryTracking: data.order.deliveryTracking
        });
      })
      .catch((err) => setError(err.message || "Unable to load order."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!order?.orderId) return undefined;
    socketSessionRef.current = joinOrderTracking(order.orderId, "delivery", {
      onLocation: (payload) => setTracking(payload),
      onError: (message) => setTrackingError(message),
      onConnect: () => setSocketState("online"),
      onDisconnect: () => setSocketState("offline")
    });

    return () => {
      socketSessionRef.current?.cleanup();
      socketSessionRef.current = null;
    };
  }, [order?.orderId]);

  useEffect(() => () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation?.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const clearWatcher = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  };

  const sendLocation = async (coords) => {
    const location = {
      lat: coords.latitude,
      lng: coords.longitude,
      accuracy: coords.accuracy,
      heading: coords.heading,
      speed: coords.speed
    };
    const now = Date.now();
    const moved = distanceMeters(lastSentRef.current.location, location);
    if (now - lastSentRef.current.at < MIN_LOCATION_INTERVAL && moved < MIN_LOCATION_MOVE_METERS) return;

    lastSentRef.current = { at: now, location };
    setTrackingError("");
    if (socketSessionRef.current?.socket?.connected) {
      socketSessionRef.current.emitLocation(location);
      return;
    }

    try {
      const data = await deliveryService.updateLocation(order.orderId, location);
      setOrder(data.order);
      setTracking(data.tracking);
    } catch (err) {
      setTrackingError(err.message || "Could not send location update.");
    }
  };

  const startLiveTracking = async () => {
    if (!navigator.geolocation) {
      setTrackingError("This browser does not support location sharing.");
      return;
    }
    if (!window.isSecureContext) {
      setTrackingError("Location sharing on mobile requires HTTPS or localhost. Open this app through a secure URL to allow GPS permission.");
      return;
    }

    try {
      setTrackingError("");
      const data = await deliveryService.startTracking(order.orderId);
      setOrder(data.order);
      setTracking(data.tracking);
      clearWatcher();
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => sendLocation(position.coords),
        (geoError) => {
          const message = geoError.code === geoError.PERMISSION_DENIED
            ? "Location permission denied. Allow location access to share live tracking."
            : geoError.code === geoError.POSITION_UNAVAILABLE
              ? "Location is unavailable right now."
              : "Location request timed out. Please try again.";
          setTrackingError(message);
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      );
      setToast({ message: "Live tracking active." });
    } catch (err) {
      setTrackingError(err.message || "Could not start live tracking.");
    }
  };

  const stopLiveTracking = async () => {
    clearWatcher();
    try {
      const data = await deliveryService.stopTracking(order.orderId);
      setOrder(data.order);
      setTracking(data.tracking);
      setToast({ message: "Tracking stopped." });
    } catch (err) {
      setTrackingError(err.message || "Could not stop tracking.");
    }
  };

  const updateStatus = async (deliveryStatus) => {
    try {
      const data = await deliveryService.updateStatus(order.orderId, deliveryStatus);
      if (["delivered", "failed_delivery"].includes(deliveryStatus)) clearWatcher();
      setOrder(data.order);
      setToast({ message: `Status updated to ${data.deliveryStatus.replaceAll("_", " ")}.` });
    } catch (err) {
      setToast({ type: "error", message: err.message || "Unable to update status." });
    } finally {
      setPendingStatus(null);
    }
  };

  const requestStatus = (deliveryStatus) => {
    if (["delivered", "failed_delivery"].includes(deliveryStatus)) {
      setPendingStatus(deliveryStatus);
      return;
    }
    updateStatus(deliveryStatus);
  };

  if (loading) return <section className="delivery-state">Loading order...</section>;
  if (error || !order) return <section className="delivery-state error">{error || "Order not found."}</section>;

  const customerLocation = order.customerLocation;
  const mapsUrl = googleMapsRouteUrl(customerLocation) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address || "")}`;
  const liveLocation = tracking?.deliveryLocation || order.deliveryLocation;
  const trackingInfo = tracking?.deliveryTracking || order.deliveryTracking || {};
  const deliveryMapsUrl = googleMapsUrl(liveLocation);
  const phone = order.phone;

  return (
    <section className="delivery-page">
      <DeliveryToast toast={toast} onClose={() => setToast(null)} />
      <Link className="delivery-back-link" to="/delivery/orders">Back to orders</Link>
      <article className="delivery-detail-card">
        <span>{order.orderId}</span>
        <h1>{order.customerName}</h1>
        {order.houseDetails && <small>House / Flat / Floor: {order.houseDetails}</small>}
        <p>{order.address}</p>
        {order.landmark && <small>Landmark: {order.landmark}</small>}
        <b>{deliveryStatusLabels[order.deliveryStatus] || getStatusLabel(order.status)}</b>
      </article>
      <div className="delivery-action-grid">
        <a href={`tel:${phone}`}>Call Customer</a>
        <a href={`https://wa.me/91${phone}?text=${encodeURIComponent(`Hi, I am delivering order ${order.orderId}.`)}`} target="_blank" rel="noreferrer">WhatsApp</a>
        <a href={mapsUrl} target="_blank" rel="noreferrer">Open Route in Google Maps</a>
      </div>
      <section className="delivery-detail-card delivery-tracking-card">
        <div className="delivery-tracking-head">
          <div>
            <h2>Live GPS Tracking</h2>
            <p>{trackingInfo.isLive ? "Live tracking active" : "Tracking stopped"}</p>
          </div>
          <span className={trackingInfo.isLive ? "delivery-live-badge live" : "delivery-live-badge"}>{trackingInfo.isLive ? "Live" : "Offline"}</span>
        </div>
        <p>{formatLastUpdated(liveLocation?.updatedAt || trackingInfo.lastUpdatedAt)}</p>
        <p>GPS connection: {socketState === "online" ? "Realtime connected" : "Waiting to reconnect"}</p>
        {liveLocation?.accuracy && <p>{formatAccuracy(liveLocation)}</p>}
        {trackingError && <p className="delivery-error-text">{trackingError}</p>}
        <LiveTrackingMap
          className="delivery-map-card"
          customerLocation={customerLocation}
          deliveryLocation={liveLocation}
          subtitle={customerLocation ? "Customer pin and your live location" : "Customer GPS pin not shared"}
          title="Delivery route map"
        />
        <div className="delivery-tracking-actions">
          <button type="button" className="start" onClick={startLiveTracking} disabled={trackingInfo.isLive && watchIdRef.current !== null}>Start Live Tracking</button>
          <button type="button" className="stop" onClick={stopLiveTracking} disabled={!trackingInfo.isLive && watchIdRef.current === null}>Stop Live Tracking</button>
          {customerLocation && <a href={mapsUrl} target="_blank" rel="noreferrer">Open Route in Google Maps</a>}
          {deliveryMapsUrl && <a href={deliveryMapsUrl} target="_blank" rel="noreferrer">Open Delivery Location</a>}
        </div>
      </section>
      <section className="delivery-detail-card">
        <h2>Order Items</h2>
        {order.items.map((item) => <div className="delivery-line-item" key={`${item.name}-${item.quantity}`}><span>{item.quantity} x {item.name}</span><strong>{formatCurrency(item.price * item.quantity)}</strong></div>)}
        <div className="delivery-total"><span>Total</span><strong>{formatCurrency(order.totalAmount)}</strong></div>
      </section>
      <section className="delivery-detail-card">
        <h2>Payment</h2>
        <p>{order.paymentMethod} - {order.paymentStatus}</p>
        <h2>Notes</h2>
        <p>{order.orderNotes || "No order notes."}</p>
        <h2>Restaurant pickup</h2>
        <p>Ahmad Caterers kitchen, Margao, Goa</p>
      </section>
      <section className="delivery-status-actions">
        {statusActions.map(([value, label]) => <button key={value} type="button" disabled={order.deliveryStatus === value} onClick={() => requestStatus(value)}>{label}</button>)}
      </section>
      <DeliveryConfirm
        actionLabel={pendingStatus === "delivered" ? "Mark delivered" : "Mark failed"}
        body={`Confirm ${pendingStatus?.replaceAll("_", " ")} for ${order.orderId}?`}
        isOpen={Boolean(pendingStatus)}
        onClose={() => setPendingStatus(null)}
        onConfirm={() => updateStatus(pendingStatus)}
        title="Confirm status update"
      />
    </section>
  );
}
