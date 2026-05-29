import { useEffect, useMemo, useState } from "react";
import { deliveryService } from "../../services/deliveryService.js";
import DeliveryOrderCard from "../components/DeliveryOrderCard.jsx";

export default function DeliveryDashboard() {
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
    pickedUp: orders.filter((order) => order.deliveryStatus === "picked_up").length,
    onTheWay: orders.filter((order) => order.deliveryStatus === "on_the_way").length,
    deliveredToday: orders.filter((order) => (order.deliveryStatus === "delivered" || order.status === "delivered") && new Date(order.updatedAt || order.createdAt).toDateString() === new Date().toDateString()).length,
    failed: orders.filter((order) => order.deliveryStatus === "failed_delivery" || order.status === "cancelled").length
  }), [orders]);

  const activeOrders = orders.filter((order) => !["delivered", "cancelled"].includes(order.status));

  if (loading) return <section className="delivery-state">Loading dashboard...</section>;
  if (error) return <section className="delivery-state error">{error}</section>;

  return (
    <section className="delivery-page">
      <h1>Dashboard</h1>
      <div className="delivery-stat-grid">
        <Stat label="Assigned" value={stats.assigned} />
        <Stat label="Picked up" value={stats.pickedUp} />
        <Stat label="On the way" value={stats.onTheWay} />
        <Stat label="Delivered today" value={stats.deliveredToday} />
        <Stat label="Failed" value={stats.failed} />
      </div>
      <h2>Active Orders</h2>
      <div className="delivery-list">
        {activeOrders.length ? activeOrders.map((order) => <DeliveryOrderCard key={order.orderId} order={order} />) : <div className="delivery-state">No active assigned orders.</div>}
      </div>
    </section>
  );
}

function Stat({ label, value }) {
  return <article className="delivery-stat-card"><span>{label}</span><strong>{value}</strong></article>;
}
