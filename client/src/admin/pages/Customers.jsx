import { useEffect, useMemo, useState } from "react";
import { adminService } from "../../services/adminService.js";
import { AdminPageState, dateTime, money } from "./adminUtils.jsx";
import { DetailDrawer, InfoGrid, PageHeader, SearchInput } from "../components/AdminUI.jsx";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [selected, setSelected] = useState(null);
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
      <PageHeader title="Customers" subtitle="Customer CRM with order value, last activity, and contact shortcuts." eyebrow="Customer CRM" />
      <div className="admin-toolbar"><SearchInput placeholder="Search customers" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      {!filtered.length ? state : (
        <div className="admin-card-grid">
          {filtered.map((customer) => (
            <article className="admin-customer-card" key={customer._id}>
              <div className="admin-card-head">
                <span className="admin-avatar">{(customer.name || "C").slice(0, 1)}</span>
                <button type="button" onClick={() => setSelected(customer)}>Details</button>
              </div>
              <h3>{customer.name}</h3>
              <p><a href={`tel:${customer.phone}`}>{customer.phone}</a></p>
              <p>{customer.email || "No email"}</p>
              <div className="admin-detail-grid">
                <span><strong>Orders</strong>{customer.totalOrders || 0}</span>
                <span><strong>Spent</strong>{money(customer.totalSpent)}</span>
                <span><strong>Joined</strong>{dateTime(customer.joinedDate || customer.createdAt)}</span>
                <span><strong>Last order</strong>{dateTime(customer.lastOrderDate)}</span>
              </div>
              <div className="admin-row-actions">
                <a href={`tel:${customer.phone}`}>Call</a>
                <a href={`https://wa.me/91${customer.phone}`} target="_blank" rel="noreferrer">WhatsApp</a>
              </div>
            </article>
          ))}
        </div>
      )}
      {selected && (
        <DetailDrawer title={selected.name} subtitle="Customer profile" onClose={() => setSelected(null)}>
          <InfoGrid items={[
            ["Phone", <a href={`tel:${selected.phone}`}>{selected.phone}</a>],
            ["Email", selected.email],
            ["Total orders", selected.totalOrders || 0],
            ["Total spent", money(selected.totalSpent)],
            ["Joined", dateTime(selected.joinedDate || selected.createdAt)],
            ["Last order", dateTime(selected.lastOrderDate)]
          ]} />
          <div className="admin-row-actions">
            <a href={`tel:${selected.phone}`}>Call customer</a>
            <a href={`https://wa.me/91${selected.phone}`} target="_blank" rel="noreferrer">WhatsApp</a>
          </div>
        </DetailDrawer>
      )}
    </section>
  );
}
