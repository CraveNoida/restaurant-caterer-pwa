import { useEffect, useState } from "react";
import { deliveryService } from "../../services/deliveryService.js";
import DeliveryOrderCard from "../components/DeliveryOrderCard.jsx";

export default function AssignedOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    deliveryService.getOrders()
      .then((data) => setOrders((data.orders || []).filter((order) => !["delivered", "cancelled"].includes(order.status))))
      .catch((err) => setError(err.message || "Unable to load assigned orders."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <section className="delivery-state">Loading assigned orders...</section>;
  if (error) return <section className="delivery-state error">{error}</section>;

  return (
    <section className="delivery-page">
      <div className="delivery-page-title">
        <span>Delivery queue</span>
        <h1>Assigned Orders</h1>
        <p>{orders.length} active order{orders.length === 1 ? "" : "s"} ready for action.</p>
      </div>
      <div className="delivery-list">
        {orders.length ? orders.map((order) => <DeliveryOrderCard key={order.orderId} order={order} />) : <div className="delivery-state">No assigned orders right now.</div>}
      </div>
    </section>
  );
}
