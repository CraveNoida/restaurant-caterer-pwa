import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { deliveryService } from "../../services/deliveryService.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

export default function CompletedDeliveries() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    deliveryService.getOrders()
      .then((data) => setOrders((data.orders || []).filter((order) => order.deliveryStatus === "delivered" || order.status === "delivered")))
      .catch((err) => setError(err.message || "Unable to load completed deliveries."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <section className="delivery-state">Loading completed deliveries...</section>;
  if (error) return <section className="delivery-state error">{error}</section>;

  return (
    <section className="delivery-page">
      <h1>Completed</h1>
      <div className="delivery-list">
        {orders.length ? orders.map((order) => (
          <article className="delivery-order-card" key={order.orderId}>
            <div><span>{order.orderId}</span><strong>{order.customerName}</strong><small>{new Date(order.updatedAt || order.createdAt).toLocaleString("en-IN")}</small></div>
            <div className="delivery-card-meta"><b>{formatCurrency(order.totalAmount)}</b><span>{order.paymentMethod}</span></div>
            <Link to={`/delivery/orders/${order.orderId}`}>View details</Link>
          </article>
        )) : <div className="delivery-state">No completed deliveries yet.</div>}
      </div>
    </section>
  );
}
