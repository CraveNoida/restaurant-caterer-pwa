import { useEffect, useMemo, useState } from "react";
import { adminService } from "../../services/adminService.js";
import { AdminPageState, dateTime, money } from "./adminUtils.jsx";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminService.customers()
      .then((data) => setCustomers(data.customers || []))
      .catch((err) => setError(err.message || "Unable to load customers."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => customers.filter((customer) => `${customer.name} ${customer.phone} ${customer.email}`.toLowerCase().includes(query.toLowerCase())), [customers, query]);
  const state = <AdminPageState loading={loading} error={error} empty={!filtered.length} emptyText="No customers found." />;
  if (loading || error) return state;

  return (
    <section className="admin-page">
      <div className="admin-page-head"><div><h1>Customers</h1><p>Customer records and contact shortcuts.</p></div></div>
      <div className="admin-toolbar"><input placeholder="Search customers" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      {!filtered.length ? state : <div className="admin-table-wrap"><table><thead><tr><th>Name</th><th>Phone</th><th>Email</th><th>Orders</th><th>Total Spent</th><th>Joined</th><th>Last Order</th><th>Actions</th></tr></thead><tbody>{filtered.map((customer) => <tr key={customer._id}><td>{customer.name}</td><td><a href={`tel:${customer.phone}`}>{customer.phone}</a></td><td>{customer.email || "N/A"}</td><td>{customer.totalOrders || 0}</td><td>{money(customer.totalSpent)}</td><td>{dateTime(customer.joinedDate || customer.createdAt)}</td><td>{dateTime(customer.lastOrderDate)}</td><td className="admin-row-actions"><button type="button" disabled>Details</button><a href={`https://wa.me/91${customer.phone}`} target="_blank" rel="noreferrer">WhatsApp</a></td></tr>)}</tbody></table></div>}
    </section>
  );
}
