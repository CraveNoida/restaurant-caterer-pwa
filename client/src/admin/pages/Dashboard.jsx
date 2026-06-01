import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService.js";
import { AdminPageState, StatusBadge, dateTime, money } from "./adminUtils.jsx";
import { CreditCard, ReceiptText, Truck, Utensils } from "../../customer/components/icons.jsx";
import { AdminCard, ProgressBars, StatCard } from "../components/AdminUI.jsx";

const metricIcons = [ReceiptText, CreditCard, Utensils, Truck];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService.dashboard()
      .then(setData)
      .catch((err) => setError(err.message || "Unable to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  const state = <AdminPageState loading={loading} error={error} />;
  if (loading || error) return state;

  const stats = data?.stats || {};
  const cards = [
    ["Today's Orders", stats.todayOrders, "New today"],
    ["Today's Revenue", money(stats.todayRevenue), "Collected"],
    ["Pending Orders", stats.pendingOrders, "Needs action"],
    ["Active Delivery Boys", stats.activeDeliveryBoys, "Available"]
  ];
  const statusCounts = (data?.recentOrders || []).reduce((map, order) => ({
    ...map,
    [order.orderStatus]: (map[order.orderStatus] || 0) + 1
  }), {});
  const today = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "short" }).format(new Date());

  return (
    <section className="admin-page admin-dashboard-page">
      <div className="admin-hero-panel admin-dashboard-hero">
        <div>
          <span className="admin-eyebrow">{today}</span>
          <h1>{greeting()}, Admin</h1>
          <p>Important restaurant numbers and live order activity at a glance.</p>
        </div>
        <div className="admin-actions">
          <Link to="/admin/orders">View New Orders</Link>
        </div>
      </div>
      <div className="admin-stat-grid admin-dashboard-stats">
        {cards.map(([label, value, hint], index) => {
          const Icon = metricIcons[index] || ReceiptText;
          return (
            <StatCard key={label} icon={Icon} label={label} value={value} helper={hint} />
          );
        })}
      </div>
      <AdminCard className="admin-status-overview">
        <div>
          <span className="admin-eyebrow">Order Status</span>
          <h2>Live order pulse</h2>
        </div>
        <ProgressBars items={["placed", "accepted", "preparing", "ready", "out_for_delivery", "delivered"].map((item) => ({
          label: item.replaceAll("_", " "),
          value: statusCounts[item] || 0
        }))} />
      </AdminCard>
      <AdminCard title="Recent Orders" eyebrow="Live activity" className="admin-dashboard-recent">
        <div className="admin-order-list">
          {(data?.recentOrders || []).length ? (data?.recentOrders || []).slice(0, 4).map((order) => (
            <article className="admin-list-card" key={order._id}>
              <div>
                <h3>{order.orderId}</h3>
                <p>{order.customerName} - {order.customerPhone}</p>
              </div>
              <strong>{money(order.totalAmount)}</strong>
              <StatusBadge value={order.orderStatus} />
              <small>{dateTime(order.createdAt)}</small>
            </article>
          )) : <AdminPageState empty emptyText="No recent orders yet." />}
        </div>
      </AdminCard>
    </section>
  );
}
