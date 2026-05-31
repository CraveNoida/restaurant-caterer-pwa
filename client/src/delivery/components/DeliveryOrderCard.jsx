import { Link } from "react-router-dom";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { getStatusLabel } from "../../utils/orderUtils.js";
import { googleMapsRouteUrl } from "../../utils/mapUtils.js";

const deliveryStatusLabels = {
  assigned: "Assigned",
  picked_up: "Picked up",
  on_the_way: "On the way",
  delivered: "Delivered",
  failed_delivery: "Failed delivery"
};

export default function DeliveryOrderCard({ order }) {
  const routeUrl = googleMapsRouteUrl(order.customerLocation) || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.address || "")}`;

  return (
    <article className="delivery-order-card">
      <div>
        <span>{order.orderId}</span>
        <strong>{order.customerName}</strong>
        <small>{order.phone}</small>
      </div>
      <p>{order.address || "Pickup / address unavailable"}</p>
      <div className="delivery-card-meta">
        <b>{formatCurrency(order.totalAmount)}</b>
        <span>{order.paymentMethod} - {order.paymentStatus}</span>
      </div>
      <div className="delivery-card-actions">
        <span className="delivery-status">{deliveryStatusLabels[order.deliveryStatus] || getStatusLabel(order.status)}</span>
        <Link to={`/delivery/orders/${order.orderId}`}>View Details</Link>
        <a href={routeUrl} target="_blank" rel="noreferrer">Maps</a>
        {order.phone && <a href={`tel:${order.phone}`}>Call</a>}
      </div>
    </article>
  );
}
