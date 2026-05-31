import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService.js";
import { AdminPageState, StatusBadge, dateTime, money } from "./adminUtils.jsx";
import { CalendarDays, CreditCard, ReceiptText, Truck, Users, Utensils } from "../../customer/components/icons.jsx";

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
            <article className="admin-stat-card" key={label}>
              <span className="admin-stat-icon"><Icon size={18} /></span>
              <div>
                <span>{label}</span>
                <strong>{value ?? 0}</strong>
                <small>{hint}</small>
              </div>
            </article>
          );
        })}
      </div>
      <section className="admin-card admin-status-overview">
        <div>
          <span className="admin-eyebrow">Order Status</span>
          <h2>Kitchen and delivery pulse</h2>
        </div>
        <div className="admin-status-pipeline">
          {["placed", "accepted", "preparing", "ready", "out_for_delivery", "delivered"].map((item) => (
            <span key={item}><b>{statusCounts[item] || 0}</b>{item.replaceAll("_", " ")}</span>
          ))}
        </div>
      </section>
      <div className="admin-two-column">
        <section className="admin-card">
          <h2>Recent Orders</h2>
          <div className="admin-table-wrap">
            <table><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>{(data?.recentOrders || []).map((order) => (
                <tr key={order._id}><td>{order.orderId}</td><td>{order.customerName}<br />{order.customerPhone}</td><td>{money(order.totalAmount)}</td><td><StatusBadge value={order.orderStatus} /></td><td>{dateTime(order.createdAt)}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </section>
        <section className="admin-card">
          <h2>Recent Catering Enquiries</h2>
          <div className="admin-table-wrap">
            <table><thead><tr><th>Booking</th><th>Customer</th><th>Event</th><th>Status</th></tr></thead>
              <tbody>{(data?.recentBookings || []).map((booking) => (
                <tr key={booking._id}><td>{booking.bookingId}</td><td>{booking.customerName}<br />{booking.phone}</td><td>{booking.eventType}</td><td><StatusBadge value={booking.bookingStatus} /></td></tr>
              ))}</tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  );
}
