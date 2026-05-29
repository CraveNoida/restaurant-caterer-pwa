import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { adminService } from "../../services/adminService.js";
import { AdminPageState, StatusBadge, dateTime, money } from "./adminUtils.jsx";

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
    ["Today's Orders", stats.todayOrders],
    ["Today's Revenue", money(stats.todayRevenue)],
    ["Pending Orders", stats.pendingOrders],
    ["Active Orders", stats.activeOrders],
    ["Completed Orders", stats.completedOrders],
    ["Catering Enquiries", stats.cateringEnquiries],
    ["Total Customers", stats.totalCustomers],
    ["Active Delivery Boys", stats.activeDeliveryBoys]
  ];

  return (
    <section className="admin-page">
      <div className="admin-page-head">
        <div><h1>Dashboard</h1><p>Live restaurant operations overview.</p></div>
        <div className="admin-actions">
          <Link to="/admin/menu">Add Menu Item</Link>
          <Link to="/admin/orders">View New Orders</Link>
          <Link to="/admin/bookings">View Catering Enquiries</Link>
        </div>
      </div>
      <div className="admin-stat-grid">
        {cards.map(([label, value]) => <article className="admin-stat-card" key={label}><span>{label}</span><strong>{value ?? 0}</strong></article>)}
      </div>
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
