import { useEffect, useMemo, useState } from "react";
import { adminBookingService } from "../../services/adminService.js";
import { AdminPageState, StatusBadge, bookingStatuses, dateTime, money } from "./adminUtils.jsx";
import AdminToast from "../components/AdminToast.jsx";

export default function CateringBookings() {
  const [bookings, setBookings] = useState([]);
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [quotation, setQuotation] = useState({ quotationAmount: "", advancePaid: "", finalPayment: "", adminNotes: "" });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminBookingService.list()
      .then((data) => setBookings(data.bookings || []))
      .catch((err) => setError(err.message || "Unable to load catering bookings."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => bookings.filter((booking) => {
    const haystack = `${booking.customerName} ${booking.phone} ${booking.eventType}`.toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) && (!status || booking.bookingStatus === status);
  }), [bookings, query, status]);

  const updateBooking = (updated) => {
    setBookings((current) => current.map((item) => item._id === updated._id ? updated : item));
    setSelected(updated);
  };

  const updateStatus = async (booking, bookingStatus) => {
    const data = await adminBookingService.updateStatus(booking._id, bookingStatus);
    updateBooking(data.booking);
    setToast({ message: `Booking ${booking.bookingId} updated.` });
  };

  const saveQuotation = async () => {
    const data = await adminBookingService.updateQuotation(selected._id, {
      quotationAmount: Number(quotation.quotationAmount || selected.quotationAmount || 0),
      advancePaid: Number(quotation.advancePaid || selected.advancePaid || 0),
      finalPayment: Number(quotation.finalPayment || selected.finalPayment || 0),
      adminNotes: quotation.adminNotes || selected.adminNotes || ""
    });
    updateBooking(data.booking);
    setToast({ message: "Quotation saved." });
  };

  const state = <AdminPageState loading={loading} error={error} empty={!filtered.length} emptyText="No catering bookings match your filters." />;
  if (loading || error) return state;

  return (
    <section className="admin-page">
      <AdminToast toast={toast} onClose={() => setToast(null)} />
      <div className="admin-page-head"><div><h1>Catering Bookings</h1><p>Manage enquiries, quotations, and booking status.</p></div></div>
      <div className="admin-toolbar">
        <input placeholder="Search customer, phone, event" value={query} onChange={(event) => setQuery(event.target.value)} />
        <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{bookingStatuses.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      </div>
      {!filtered.length ? state : (
        <div className="admin-table-wrap">
          <table><thead><tr><th>Booking</th><th>Customer</th><th>Event</th><th>Guests</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>{filtered.map((booking) => (
              <tr key={booking._id}><td>{booking.bookingId}<br /><small>{dateTime(booking.createdAt)}</small></td><td>{booking.customerName}<br /><a href={`tel:${booking.phone}`}>{booking.phone}</a></td><td>{booking.eventType}<br />{dateTime(booking.eventDate)}</td><td>{booking.guestCount}</td><td><StatusBadge value={booking.bookingStatus} /></td><td className="admin-row-actions"><button type="button" onClick={() => { setSelected(booking); setQuotation({}); }}>View</button><a href={`https://wa.me/91${booking.phone}?text=${encodeURIComponent(`Hi, regarding catering enquiry ${booking.bookingId}`)}`} target="_blank" rel="noreferrer">WhatsApp</a></td></tr>
            ))}</tbody>
          </table>
        </div>
      )}
      {selected && (
        <section className="admin-detail-panel">
          <button type="button" onClick={() => setSelected(null)}>Close</button>
          <h2>{selected.bookingId}</h2>
          <div className="admin-detail-grid">
            <span><strong>Customer</strong>{selected.customerName}</span>
            <span><strong>Phone</strong><a href={`tel:${selected.phone}`}>{selected.phone}</a></span>
            <span><strong>Email</strong>{selected.email || "N/A"}</span>
            <span><strong>Event type</strong>{selected.eventType}</span>
            <span><strong>Event date</strong>{dateTime(selected.eventDate)}</span>
            <span><strong>Event time</strong>{selected.eventTime || "N/A"}</span>
            <span><strong>Venue</strong>{selected.venue || "N/A"}</span>
            <span><strong>Guest count</strong>{selected.guestCount}</span>
            <span><strong>Food preference</strong>{selected.foodPreference || "N/A"}</span>
            <span><strong>Package type</strong>{selected.packageType || "N/A"}</span>
            <span><strong>Selected menu items</strong>{selected.selectedMenuItems?.length || 0}</span>
            <span><strong>Estimated price</strong>{money(selected.estimatedPrice)}</span>
            <span><strong>Budget</strong>{selected.budget || "N/A"}</span>
            <span><strong>Quotation</strong>{money(selected.quotationAmount)}</span>
            <span><strong>Advance paid</strong>{money(selected.advancePaid)}</span>
            <span><strong>Final payment</strong>{money(selected.finalPayment)}</span>
            <span><strong>Status</strong><StatusBadge value={selected.bookingStatus} /></span>
            <span><strong>Created</strong>{dateTime(selected.createdAt)}</span>
          </div>
          <section className="admin-card slim">
            <strong>Special requirements</strong>
            <p>{selected.specialRequirements || "N/A"}</p>
            <strong>Admin notes</strong>
            <p>{selected.adminNotes || "N/A"}</p>
          </section>
          <div className="admin-inline-fields">
            <select value={selected.bookingStatus} onChange={(event) => updateStatus(selected, event.target.value)}>{bookingStatuses.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <input placeholder={`Quotation ${money(selected.quotationAmount)}`} value={quotation.quotationAmount || ""} onChange={(event) => setQuotation((current) => ({ ...current, quotationAmount: event.target.value }))} />
            <input placeholder={`Advance ${money(selected.advancePaid)}`} value={quotation.advancePaid || ""} onChange={(event) => setQuotation((current) => ({ ...current, advancePaid: event.target.value }))} />
            <input placeholder={`Final ${money(selected.finalPayment)}`} value={quotation.finalPayment || ""} onChange={(event) => setQuotation((current) => ({ ...current, finalPayment: event.target.value }))} />
          </div>
          <textarea placeholder="Admin notes" value={quotation.adminNotes ?? selected.adminNotes ?? ""} onChange={(event) => setQuotation((current) => ({ ...current, adminNotes: event.target.value }))} />
          <button type="button" onClick={saveQuotation}>Save quotation</button>
        </section>
      )}
    </section>
  );
}
