import { useEffect, useMemo, useState } from "react";
import { adminService } from "../../services/adminService.js";
import { AdminPageState, StatusBadge, dateTime, money } from "./adminUtils.jsx";
import AdminToast from "../components/AdminToast.jsx";
import { FilterChips, PageHeader, StatCard } from "../components/AdminUI.jsx";
import { CreditCard, ReceiptText, Wallet } from "../../customer/components/icons.jsx";

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
        customer: payment.customerId?.name || payment.customerId?.phone || "Customer not linked",
        type: payment.paymentMethod,
        amount: payment.amount,
        status: payment.paymentStatus,
        transactionId: payment.transactionId || payment.razorpayPaymentId || payment.razorpayOrderId || "Not recorded",
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
          transactionId: order.transactionId || "Not recorded",
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
      const data = await adminService.updatePaymentStatus(row.id, { paymentStatus: "paid", transactionId: row.transactionId === "Not recorded" ? "manual_admin_paid" : row.transactionId });
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
      <PageHeader title="Payments" subtitle="Finance dashboard for collections, pending payments, COD, UPI, and failed transactions." eyebrow="Finance" />
      <div className="admin-toolbar">
        <FilterChips options={["COD", "UPI", "Razorpay"]} value={method} onChange={setMethod} allLabel="All methods" />
        <FilterChips options={["pending", "paid", "failed"]} value={status} onChange={setStatus} allLabel="All statuses" />
      </div>
      <div className="admin-stat-grid">
        <StatCard icon={Wallet} label="Total Collected" value={summary.paid} helper="Paid records" />
        <StatCard icon={ReceiptText} label="Pending" value={summary.pending} helper="Needs follow-up" />
        <StatCard icon={CreditCard} label="COD" value={summary.COD} helper="Cash orders" />
        <StatCard icon={CreditCard} label="UPI" value={summary.UPI} helper="UPI payments" />
        <StatCard icon={CreditCard} label="Failed" value={summary.failed} helper="Payment issues" />
        <StatCard icon={Wallet} label="Catering Payments" value={money(summary.catering)} helper="Event revenue" />
      </div>
      <div className="admin-order-list">
        {rows.map((row) => (
          <article className="admin-list-card" key={row.id}>
            <div>
              <h3>{row.reference}</h3>
              <p>{row.customer} - {dateTime(row.date)}</p>
              <small>{row.transactionId}</small>
            </div>
            <strong>{money(row.amount)}</strong>
            <span className="admin-tag">{row.type}</span>
            <StatusBadge value={row.status} />
            <div className="admin-row-actions">
              {row.canMarkPaid ? <button type="button" onClick={() => markPaid(row)}>Mark paid</button> : <button type="button" disabled>Settled</button>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
