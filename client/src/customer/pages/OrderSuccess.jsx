import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, MapPinned, MessageCircle, Phone, ReceiptText } from "../components/icons.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { formatOrderWhatsAppMessage, getStatusLabel } from "../../utils/orderUtils.js";
import { PHONE_NUMBER, WHATSAPP_NUMBER } from "../components/homeData.js";
import { useEffect, useState } from "react";
import { orderService } from "../../services/orderService.js";
import { googleMapsUrl } from "../../utils/mapUtils.js";

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const { lastOrder, getOrderById } = useCart();
  const orderId = params.get("orderId");
  const fallbackOrder = getOrderById(orderId) || lastOrder;
  const [order, setOrder] = useState(fallbackOrder);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;
    let isMounted = true;
    setLoading(true);
    setError("");

    orderService
      .getOrder(orderId)
      .then((data) => {
        if (isMounted) setOrder(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "Unable to load latest order.");
        setOrder(fallbackOrder);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="app-screen empty-screen">
        <span className="empty-icon"><ReceiptText size={48} /></span>
        <h1>Loading order</h1>
        <p>Fetching your order confirmation.</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="app-screen empty-screen">
        <span className="empty-icon"><ReceiptText size={48} /></span>
        <h1>No recent order found</h1>
        <Link className="app-button" to="/menu">Order food</Link>
      </div>
    );
  }

  const message = formatOrderWhatsAppMessage(order, formatCurrency);
  const customerMapsUrl = googleMapsUrl(order.customerLocation);

  return (
    <div className="app-screen success-screen">
      <section className="success-card">
        <span className="success-icon"><CheckCircle2 size={62} /></span>
        <span>{getStatusLabel(order.status)}</span>
        <h1>Order placed successfully</h1>
        <p>Order ID: {order.orderId}</p>
        <strong>Estimated {order.orderType === "pickup" ? "pickup" : "delivery"}: {order.estimatedTime}</strong>
      </section>
      {error && <section className="success-banner error-banner"><strong>{error}</strong></section>}
      {order.paymentStatus === "paid" && <section className="success-banner"><strong>Payment received successfully.</strong></section>}
      {order.paymentStatus === "failed" && <section className="success-banner error-banner"><strong>Payment failed or was cancelled. Please contact the restaurant.</strong></section>}

      <section className="app-card success-detail-grid">
        <div>
          <span>Payment</span>
          <strong>{order.paymentMethod}</strong>
        </div>
        <div>
          <span>Payment status</span>
          <strong>{order.paymentStatus}</strong>
        </div>
        {order.transactionId && (
          <div>
            <span>Transaction ID</span>
            <strong>{order.transactionId}</strong>
          </div>
        )}
        <div>
          <span>Order type</span>
          <strong>{order.orderType === "pickup" ? "Pickup" : "Delivery"}</strong>
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

      <div className="button-stack">
        <Link className="app-button full-width" to={`/track-order/${order.orderId}`}><MapPinned size={18} /> Track Order</Link>
        {customerMapsUrl && <a className="app-button outline full-width" href={customerMapsUrl} target="_blank" rel="noreferrer"><MapPinned size={18} /> Open customer location in Maps</a>}
        <Link className="app-button outline full-width" to="/my-orders"><ReceiptText size={18} /> View My Orders</Link>
        <a className="app-button outline full-width" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">
          <MessageCircle size={18} /> WhatsApp Confirmation
        </a>
        <a className="app-button outline full-width" href={`tel:${PHONE_NUMBER}`}><Phone size={18} /> Call Restaurant</a>
      </div>
    </div>
  );
}
