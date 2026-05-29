import { formatCurrency } from "../../utils/formatCurrency.js";

export const orderStatuses = ["placed", "accepted", "preparing", "ready", "out_for_delivery", "delivered", "cancelled"];
export const bookingStatuses = ["new", "contacted", "quotation_sent", "confirmed", "advance_paid", "completed", "cancelled"];

export function AdminPageState({ loading, error, empty, emptyText = "No data found." }) {
  if (loading) return <section className="admin-state">Loading...</section>;
  if (error) return <section className="admin-state error">{error}</section>;
  if (empty) return <section className="admin-state">{emptyText}</section>;
  return null;
}

export function StatusBadge({ value }) {
  return <span className={`admin-status ${String(value || "").replaceAll("_", "-")}`}>{String(value || "unknown").replaceAll("_", " ")}</span>;
}

export function money(value) {
  return formatCurrency(Number(value || 0));
}

export function dateTime(value) {
  return value ? new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "N/A";
}

export function todayKey(value) {
  return new Date(value).toISOString().slice(0, 10);
}
