import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { deliveryService } from "../../services/deliveryService.js";
import DeliveryOrderCard from "../components/DeliveryOrderCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { CheckCircle2, ReceiptText, Truck } from "../../customer/components/icons.jsx";

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    deliveryService.getOrders()
      .then((data) => setOrders(data.orders || []))
      .catch((err) => setError(err.message || "Unable to load assigned orders."))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => ({
    assigned: orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length,
    onTheWay: orders.filter((order) => order.deliveryStatus === "on_the_way").length,
    deliveredToday: orders.filter((order) => (order.deliveryStatus === "delivered" || order.status === "delivered") && new Date(order.updatedAt || order.createdAt).toDateString() === new Date().toDateString()).length,
  }), [orders]);

  const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status));
  const nextOrders = activeOrders.slice(0, 3);

  if (loading) return <section className="delivery-state">Loading dashboard...</section>;
  if (error) return <section className="delivery-state error">{error}</section>;

  return (
    <section className="delivery-page delivery-dashboard-page">
      <div className="delivery-page-title delivery-dashboard-title">
        <div>
          <span>Delivery dashboard</span>
          <h1>Hi, {user?.name || "Partner"}</h1>
          <p>Focus on active work, route status, and today&apos;s completed deliveries.</p>
        </div>
      </div>
      <div className="delivery-stat-grid">
        <Stat label="Assigned" value={stats.assigned} icon={ReceiptText} />
        <Stat label="On the way" value={stats.onTheWay} icon={Truck} />
        <Stat label="Delivered today" value={stats.deliveredToday} icon={CheckCircle2} />
      </div>
      <div className="delivery-section-head">
        <h2>Next Orders</h2>
        <Link to="/delivery/orders">View all {activeOrders.length}</Link>
      </div>
      <div className="delivery-list">
        {nextOrders.length ? nextOrders.map((order) => <DeliveryOrderCard key={order.orderId} order={order} />) : <div className="delivery-state">No active assigned orders.</div>}
      </div>
    </section>
  );
}

function Stat({ label, value, icon: Icon }) {
  return (
    <article className="delivery-stat-card">
      <span className="delivery-stat-icon"><Icon size={18} /></span>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
