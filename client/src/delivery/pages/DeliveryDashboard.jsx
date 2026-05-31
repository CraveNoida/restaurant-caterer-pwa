import { useEffect, useMemo, useState } from "react";
import { deliveryService } from "../../services/deliveryService.js";
import DeliveryOrderCard from "../components/DeliveryOrderCard.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { CheckCircle2, PackageCheck, ReceiptText, Truck } from "../../customer/components/icons.jsx";

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
      <div className="delivery-hero-card">
        <div>
          <span>Online delivery workspace</span>
          <h1>Hi, {user?.name || "Partner"}</h1>
          <p>Keep assigned orders moving with route, call, status, and live GPS controls close at hand.</p>
        </div>
        <b>Active</b>
      </div>
      <div className="delivery-stat-grid">
        <Stat label="Assigned" value={stats.assigned} icon={ReceiptText} />
        <Stat label="Picked up" value={stats.pickedUp} icon={PackageCheck} />
        <Stat label="On the way" value={stats.onTheWay} icon={Truck} />
        <Stat label="Delivered today" value={stats.deliveredToday} icon={CheckCircle2} />
        <Stat label="Failed" value={stats.failed} icon={ReceiptText} />
      </div>
      <div className="delivery-section-head">
        <h2>Active Orders</h2>
        <span>{activeOrders.length} assigned</span>
      </div>
      <div className="delivery-list">
        {activeOrders.length ? activeOrders.map((order) => <DeliveryOrderCard key={order.orderId} order={order} />) : <div className="delivery-state">No active assigned orders.</div>}
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
