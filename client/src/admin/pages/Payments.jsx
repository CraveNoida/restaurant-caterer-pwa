import { useEffect, useMemo, useState } from "react";
import { adminService } from "../../services/adminService.js";
import { AdminPageState, StatusBadge, dateTime, money } from "./adminUtils.jsx";
import AdminToast from "../components/AdminToast.jsx";

export default function Payments() {
  const [data, setData] = useState({ payments: [], orders: [] });
  const [method, setMethod] = useState("");
  const [status, setStatus] = useState("");
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService.payments()
      .then(setData)
      .catch((err) => setError(err.message || "Unable to load payments."))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(() => {
    const paymentOrderIds = new Set((data.payments || []).map((payment) => payment.orderId).filter(Boolean));
    return [
      ...(data.payments || []).map((payment) => ({
        id: payment._id,
        reference: payment.orderId || payment.bookingId || payment._id,
        customer: payment.customerId?.name || payment.customerId?.phone || "N/A",
        type: payment.paymentMethod,
        amount: payment.amount,
        status: payment.paymentStatus,
        transactionId: payment.transactionId || payment.razorpayPaymentId || payment.razorpayOrderId || "N/A",
        date: payment.createdAt,
        canMarkPaid: ["COD", "UPI"].includes(payment.paymentMethod) && payment.paymentStatus !== "paid"
      })),
      ...(data.orders || [])
        .filter((order) => !paymentOrderIds.has(order.orderId))
        .map((order) => ({
          id: order.orderId,
          reference: order.orderId,
          customer: order.customerName || order.customerPhone,
          type: order.paymentMethod,
          amount: order.totalAmount,
          status: order.paymentStatus,
          transactionId: order.transactionId || "N/A",
          date: order.createdAt,
          canMarkPaid: false
        }))
    ].filter((row) => (!method || row.type === method) && (!status || row.status === status));
  }, [data, method, status]);

  const summary = useMemo(() => {
    const result = {
      COD: 0,
      UPI: 0,
      Razorpay: 0,
      pending: 0,
      paid: 0,
      failed: 0,
      catering: 0
    };
    rows.forEach((row) => {
      if (row.type === "COD") result.COD += 1;
      if (row.type === "UPI") result.UPI += 1;
      if (row.type === "Razorpay") result.Razorpay += 1;
      if (result[row.status] !== undefined) result[row.status] += 1;
    });
    (data.payments || []).forEach((payment) => {
      if (payment.bookingId) result.catering += Number(payment.amount || 0);
    });
    return result;
  }, [rows, data]);

  const markPaid = async (row) => {
    try {
      const data = await adminService.updatePaymentStatus(row.id, { paymentStatus: "paid", transactionId: row.transactionId === "N/A" ? "manual_admin_paid" : row.transactionId });
      setData((current) => ({
        ...current,
        payments: current.payments.map((payment) => payment._id === row.id ? data.payment : payment)
      }));
      setToast({ message: "Payment marked as paid." });
    } catch (error) {
      setToast({ type: "error", message: error.message || "Could not update payment." });
    }
  };

  const state = <AdminPageState loading={loading} error={error} empty={!rows.length} emptyText="No payments found." />;
  if (loading || error || !rows.length) return state;

  return (
    <section className="admin-page">
      <AdminToast toast={toast} onClose={() => setToast(null)} />
      <div className="admin-page-head"><div><h1>Payments</h1><p>COD, UPI, Razorpay placeholders, and catering payments.</p></div></div>
      <div className="admin-toolbar">
        <select value={method} onChange={(event) => setMethod(event.target.value)}>
          <option value="">All methods</option>
          <option value="COD">COD</option>
          <option value="UPI">UPI</option>
          <option value="Razorpay">Razorpay</option>
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>
      <div className="admin-stat-grid">
        <article className="admin-stat-card"><span>COD Orders</span><strong>{summary.COD}</strong></article>
        <article className="admin-stat-card"><span>UPI Payments</span><strong>{summary.UPI}</strong></article>
        <article className="admin-stat-card"><span>Razorpay Placeholder</span><strong>{summary.Razorpay}</strong></article>
        <article className="admin-stat-card"><span>Catering Payments</span><strong>{money(summary.catering)}</strong></article>
        <article className="admin-stat-card"><span>Pending</span><strong>{summary.pending}</strong></article>
        <article className="admin-stat-card"><span>Paid</span><strong>{summary.paid}</strong></article>
        <article className="admin-stat-card"><span>Failed</span><strong>{summary.failed}</strong></article>
      </div>
      <div className="admin-table-wrap"><table><thead><tr><th>Reference</th><th>Customer</th><th>Method</th><th>Amount</th><th>Status</th><th>Transaction</th><th>Date</th><th>Action</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.reference}</td><td>{row.customer}</td><td>{row.type}</td><td>{money(row.amount)}</td><td><StatusBadge value={row.status} /></td><td>{row.transactionId}</td><td>{dateTime(row.date)}</td><td>{row.canMarkPaid ? <button type="button" onClick={() => markPaid(row)}>Mark paid</button> : "N/A"}</td></tr>)}</tbody></table></div>
    </section>
  );
}
