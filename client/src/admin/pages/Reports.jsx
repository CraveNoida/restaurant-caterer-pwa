import { useEffect, useMemo, useState } from "react";
import { adminBookingService, adminOrderService } from "../../services/adminService.js";
import { AdminPageState, money, todayKey } from "./adminUtils.jsx";

export default function Reports() {
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([adminOrderService.list(), adminBookingService.list()])
      .then(([orderData, bookingData]) => {
        setOrders(orderData.orders || []);
        setBookings(bookingData.bookings || []);
      })
      .catch((err) => setError(err.message || "Unable to load reports."))
      .finally(() => setLoading(false));
  }, []);

  const report = useMemo(() => {
    const revenue = orders.filter((order) => order.orderStatus !== "cancelled").reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const daily = orders.reduce((map, order) => ({ ...map, [todayKey(order.createdAt)]: (map[todayKey(order.createdAt)] || 0) + 1 }), {});
    const monthlyOrders = {};
    const monthlyRevenue = {};
    const paymentMethods = {};
    const topItems = {};
    orders.forEach((order) => {
      const month = new Date(order.createdAt).toISOString().slice(0, 7);
      monthlyOrders[month] = (monthlyOrders[month] || 0) + 1;
      if (order.orderStatus !== "cancelled") monthlyRevenue[month] = (monthlyRevenue[month] || 0) + Number(order.totalAmount || 0);
      paymentMethods[order.paymentMethod] = (paymentMethods[order.paymentMethod] || 0) + 1;
      order.items?.forEach((item) => { topItems[item.name] = (topItems[item.name] || 0) + Number(item.quantity || 0); });
    });
    const cateringByStatus = bookings.reduce((map, booking) => ({ ...map, [booking.bookingStatus]: (map[booking.bookingStatus] || 0) + 1 }), {});
    return {
      revenue,
      completed: orders.filter((order) => order.orderStatus === "delivered").length,
      cancelled: orders.filter((order) => order.orderStatus === "cancelled").length,
      daily,
      monthlyOrders,
      monthlyRevenue,
      paymentMethods,
      cateringByStatus,
      topItems: Object.entries(topItems).sort((a, b) => b[1] - a[1]).slice(0, 5)
    };
  }, [orders]);

  const state = <AdminPageState loading={loading} error={error} empty={!orders.length && !bookings.length} emptyText="No report data yet." />;
  if (loading || error) return state;

  return (
    <section className="admin-page">
      <div className="admin-page-head"><div><h1>Reports</h1><p>Basic order, revenue, and catering summaries.</p></div></div>
      <div className="admin-stat-grid">
        <article className="admin-stat-card"><span>Total Revenue</span><strong>{money(report.revenue)}</strong></article>
        <article className="admin-stat-card"><span>Monthly Orders</span><strong>{orders.length}</strong></article>
        <article className="admin-stat-card"><span>Catering Enquiries</span><strong>{bookings.length}</strong></article>
        <article className="admin-stat-card"><span>Completed / Cancelled</span><strong>{report.completed} / {report.cancelled}</strong></article>
      </div>
      <div className="admin-two-column">
        <section className="admin-card"><h2>Daily Orders</h2>{Object.entries(report.daily).map(([date, count]) => <p key={date}>{date}: {count}</p>)}</section>
        <section className="admin-card"><h2>Monthly Orders</h2>{Object.entries(report.monthlyOrders).map(([month, count]) => <p key={month}>{month}: {count}</p>)}</section>
        <section className="admin-card"><h2>Monthly Revenue</h2>{Object.entries(report.monthlyRevenue).map(([month, amount]) => <p key={month}>{month}: {money(amount)}</p>)}</section>
        <section className="admin-card"><h2>Payment Methods</h2>{Object.entries(report.paymentMethods).map(([method, count]) => <p key={method}>{method}: {count}</p>)}</section>
        <section className="admin-card"><h2>Catering Enquiry Summary</h2>{Object.entries(report.cateringByStatus).map(([status, count]) => <p key={status}>{status}: {count}</p>)}</section>
        <section className="admin-card"><h2>Top Selling Items</h2>{report.topItems.map(([name, count]) => <p key={name}>{name}: {count}</p>)}</section>
      </div>
    </section>
  );
}
