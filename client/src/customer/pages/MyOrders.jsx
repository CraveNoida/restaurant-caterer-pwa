import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock, MapPin, ReceiptText, RotateCcw, ShoppingBag } from "../components/icons.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";
import {
  ACTIVE_ORDER_STATUSES,
  CANCELLED_ORDER_STATUSES,
  COMPLETED_ORDER_STATUSES,
  getStatusLabel,
  normalizeStatus
} from "../../utils/orderUtils.js";
import { orderService } from "../../services/orderService.js";

const tabs = [
  { id: "active", label: "Active", statuses: ACTIVE_ORDER_STATUSES },
  { id: "completed", label: "Completed", statuses: COMPLETED_ORDER_STATUSES },
  { id: "cancelled", label: "Cancelled", statuses: CANCELLED_ORDER_STATUSES }
];

export default function MyOrders() {
  const { reorder } = useCart();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [loading, setLoading] = useState(isAuthenticated);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError("");
    orderService
      .getMyOrders()
      .then((data) => {
        if (isMounted) setOrders(data);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || "Unable to load orders.");
        setOrders([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated]);
  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [orders]
  );
  const counts = tabs.reduce((result, tab) => {
    result[tab.id] = sortedOrders.filter((order) => tab.statuses.includes(normalizeStatus(order.status))).length;
    return result;
  }, {});
  const visibleTab = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  const visibleOrders = sortedOrders.filter((order) => visibleTab.statuses.includes(normalizeStatus(order.status)));

  if (loading) {
    return (
      <div className="app-screen empty-screen">
        <span className="empty-icon"><ReceiptText size={48} /></span>
        <h1>Loading orders</h1>
        <p>Fetching your saved orders.</p>
      </div>
    );
  }

  if (!isAuthenticated && !orders.length) {
    return (
      <div className="app-screen empty-screen">
        <span className="empty-icon"><ReceiptText size={48} /></span>
        <h1>Login to view saved orders</h1>
        <p>Your backend orders will appear here after login.</p>
        <Link className="app-button" to="/login">Login</Link>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="app-screen empty-screen">
        <span className="empty-icon"><ReceiptText size={48} /></span>
        <h1>No orders yet</h1>
        <p>Your active and previous orders will appear here.</p>
        <Link className="app-button" to="/menu"><ShoppingBag size={18} /> Order food</Link>
      </div>
    );
  }

  return (
    <div className="app-screen orders-screen premium-orders-screen">
      <section className="premium-stat-grid">
        <StatCard icon={Clock} label="Active" value={counts.active} />
        <StatCard icon={CheckCircle2} label="Completed" value={counts.completed} />
        <StatCard icon={ShoppingBag} label="Total orders" value={orders.length} />
      </section>
      {error && <section className="success-banner error-banner"><strong>{error}</strong></section>}

      <section className="premium-order-tabs" role="tablist" aria-label="Order filters">
        {tabs.map((tab) => (
          <button key={tab.id} type="button" className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>
            {tab.label} ({counts[tab.id]})
          </button>
        ))}
      </section>

      <section className="premium-order-list">
        {visibleOrders.length ? (
          visibleOrders.map((order) => <PremiumOrderCard order={order} onReorder={reorder} key={order.orderId} />)
        ) : (
          <div className="app-card empty-order-tab">
            <ReceiptText size={34} />
            <h2>No {visibleTab.label.toLowerCase()} orders</h2>
            <p>Orders in this status will appear here.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <article className="premium-stat-card">
      <span><Icon size={22} /></span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>
    </article>
  );
}

function PremiumOrderCard({ order, onReorder }) {
  const firstItem = order.items[0];
  const itemSummary = order.items.slice(0, 2).map((item) => `${item.quantity} x ${item.name}`).join(", ");
  const extraItems = Math.max(0, order.items.length - 2);

  return (
    <article className="premium-order-card">
      <div className="premium-order-head">
        <span className="order-icon-bubble"><ReceiptText size={22} /></span>
        <div>
          <h2>{order.orderId}</h2>
          <p>{new Date(order.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })}</p>
        </div>
        <span className="premium-status-badge">{getStatusLabel(order.status)}</span>
      </div>

      <div className="premium-order-item">
        {firstItem?.image && <img src={firstItem.image} alt={firstItem.name} />}
        <div>
          <strong>{itemSummary}{extraItems ? ` +${extraItems} more` : ""}</strong>
          <span>{order.paymentMethod} - {order.paymentStatus}</span>
        </div>
      </div>

      <div className="premium-order-footer">
        <div className="premium-order-actions">
          <Link to={`/track-order/${order.orderId}`}><MapPin size={17} /> Track</Link>
          <button type="button" onClick={() => onReorder(order.items)}><RotateCcw size={17} /> Reorder</button>
          <Link to={`/track-order/${order.orderId}`}><ReceiptText size={17} /> Details</Link>
        </div>
        <strong>{formatCurrency(order.totalAmount)}</strong>
      </div>
    </article>
  );
}
