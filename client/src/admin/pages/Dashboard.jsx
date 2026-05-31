import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService.js";
import { AdminPageState, StatusBadge, dateTime, money } from "./adminUtils.jsx";
import { CalendarDays, CreditCard, ReceiptText, Truck, Users, Utensils } from "../../customer/components/icons.jsx";
import { AdminCard, ProgressBars, StatCard } from "../components/AdminUI.jsx";

const metricIcons = [ReceiptText, CreditCard, CalendarDays, Truck, Utensils, CalendarDays, Users, Truck];

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
    ["Today's Orders", stats.todayOrders, "Live order intake"],
    ["Today's Revenue", money(stats.todayRevenue), "Collected today"],
    ["Pending Orders", stats.pendingOrders, "Needs attention"],
    ["Active Orders", stats.activeOrders, "In kitchen or delivery"],
    ["Completed Orders", stats.completedOrders, "Finished orders"],
    ["Catering Enquiries", stats.cateringEnquiries, "Event pipeline"],
    ["Total Customers", stats.totalCustomers, "Customer base"],
    ["Active Delivery Boys", stats.activeDeliveryBoys, "Available team"]
  ];
  const statusCounts = (data?.recentOrders || []).reduce((map, order) => ({
    ...map,
    [order.orderStatus]: (map[order.orderStatus] || 0) + 1
  }), {});
  const today = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "short" }).format(new Date());

  return (
    <section className="admin-page">
      <div className="admin-hero-panel">
        <div>
          <span className="admin-eyebrow">{today}</span>
          <h1>{greeting()}, Admin</h1>
          <p>Live restaurant operations, catering leads, payments, and delivery activity in one premium workspace.</p>
        </div>
        <div className="admin-actions">
          <Link to="/admin/menu">Add Menu Item</Link>
          <Link to="/admin/orders">View New Orders</Link>
          <Link to="/admin/bookings">View Catering Enquiries</Link>
        </div>
      </div>
      <div className="admin-stat-grid">
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
          <h2>Kitchen and delivery pulse</h2>
        </div>
        <ProgressBars items={["placed", "accepted", "preparing", "ready", "out_for_delivery", "delivered"].map((item) => ({
          label: item.replaceAll("_", " "),
          value: statusCounts[item] || 0
        }))} />
      </AdminCard>
      <div className="admin-two-column">
        <AdminCard title="Recent Orders" eyebrow="Live activity">
          <div className="admin-order-list">
            {(data?.recentOrders || []).map((order) => (
              <article className="admin-list-card" key={order._id}>
                <div>
                  <h3>{order.orderId}</h3>
                  <p>{order.customerName} - {order.customerPhone}</p>
                </div>
                <strong>{money(order.totalAmount)}</strong>
                <StatusBadge value={order.orderStatus} />
                <small>{dateTime(order.createdAt)}</small>
              </article>
            ))}
          </div>
        </AdminCard>
        <AdminCard title="Operations Summary" eyebrow="Catering CRM">
          <div className="admin-order-list">
            {(data?.recentBookings || []).map((booking) => (
              <article className="admin-list-card" key={booking._id}>
                <div>
                  <h3>{booking.bookingId}</h3>
                  <p>{booking.customerName} - {booking.phone}</p>
                </div>
                <strong>{booking.eventType}</strong>
                <StatusBadge value={booking.bookingStatus} />
              </article>
            ))}
            <div className="admin-list-card">
              <div>
                <h3>Pending tasks</h3>
                <p>Review new orders, active deliveries, and fresh catering leads.</p>
              </div>
              <StatusBadge value="pending" />
            </div>
          </div>
        </AdminCard>
      </div>
    </section>
  );
}
