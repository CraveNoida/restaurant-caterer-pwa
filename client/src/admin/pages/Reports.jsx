import { useEffect, useMemo, useState } from "react";
import { adminBookingService, adminOrderService } from "../../services/adminService.js";
import { AdminPageState, money, todayKey } from "./adminUtils.jsx";
import { AdminCard, PageHeader, ProgressBars, StatCard } from "../components/AdminUI.jsx";
import { CalendarDays, CreditCard, ReceiptText, Utensils } from "../../customer/components/icons.jsx";

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
      <PageHeader title="Reports" subtitle="Analytics for revenue, orders, catering leads, payment methods, and top selling items." eyebrow="Analytics" />
      <div className="admin-stat-grid">
        <StatCard icon={CreditCard} label="Total Revenue" value={money(report.revenue)} helper="Non-cancelled orders" />
        <StatCard icon={ReceiptText} label="Orders" value={orders.length} helper="All order records" />
        <StatCard icon={CalendarDays} label="Catering Leads" value={bookings.length} helper="Event enquiries" />
        <StatCard icon={Utensils} label="Completed / Cancelled" value={`${report.completed} / ${report.cancelled}`} helper="Fulfillment quality" />
      </div>
      <div className="admin-two-column">
        <AdminCard title="Daily Orders"><ProgressBars items={Object.entries(report.daily).map(([label, value]) => ({ label, value }))} /></AdminCard>
        <AdminCard title="Monthly Orders"><ProgressBars items={Object.entries(report.monthlyOrders).map(([label, value]) => ({ label, value }))} /></AdminCard>
        <AdminCard title="Monthly Revenue"><ProgressBars items={Object.entries(report.monthlyRevenue).map(([label, value]) => ({ label, value: Number(value || 0), display: money(value) }))} /></AdminCard>
        <AdminCard title="Payment Method Summary"><ProgressBars items={Object.entries(report.paymentMethods).map(([label, value]) => ({ label, value }))} /></AdminCard>
        <AdminCard title="Catering Lead Summary"><ProgressBars items={Object.entries(report.cateringByStatus).map(([label, value]) => ({ label: label.replaceAll("_", " "), value }))} /></AdminCard>
        <AdminCard title="Top Selling Items"><ProgressBars items={report.topItems.map(([label, value]) => ({ label, value }))} /></AdminCard>
      </div>
    </section>
  );
}
