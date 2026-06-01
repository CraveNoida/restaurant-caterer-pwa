import { useEffect, useMemo, useState } from "react";
import { adminBookingService } from "../../services/adminService.js";
import { AdminPageState, StatusBadge, bookingStatuses, dateTime, money } from "./adminUtils.jsx";
import AdminToast from "../components/AdminToast.jsx";
import { DetailDrawer, FilterChips, InfoGrid, PageHeader, SearchInput } from "../components/AdminUI.jsx";

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
      <PageHeader title="Catering Bookings" subtitle="Track event enquiries, quotations, advance payments, and confirmed catering work." eyebrow="Event CRM" />
      <div className="admin-toolbar">
        <SearchInput placeholder="Search customer, phone, event" value={query} onChange={(event) => setQuery(event.target.value)} />
        <FilterChips options={bookingStatuses} value={status} onChange={setStatus} />
      </div>
      {!filtered.length ? state : (
        <div className="admin-order-list">
          {filtered.map((booking) => (
            <article className="admin-list-card" key={booking._id}>
              <div>
                <h3>{booking.customerName}</h3>
                <p>{booking.bookingId} - <a href={`tel:${booking.phone}`}>{booking.phone}</a></p>
                <small>{booking.eventType} - {dateTime(booking.eventDate)}</small>
              </div>
              <strong>{booking.guestCount || 0} guests</strong>
              <span>{booking.budget || money(booking.estimatedPrice)}</span>
              <StatusBadge value={booking.bookingStatus} />
              <div className="admin-row-actions">
                <button type="button" onClick={() => { setSelected(booking); setQuotation({}); }}>View</button>
                <a href={`https://wa.me/91${booking.phone}?text=${encodeURIComponent(`Hi, regarding catering enquiry ${booking.bookingId}`)}`} target="_blank" rel="noreferrer">WhatsApp</a>
              </div>
            </article>
          ))}
        </div>
      )}
      {selected && (
        <DetailDrawer title={selected.bookingId} subtitle={`${selected.eventType} - ${dateTime(selected.eventDate)}`} onClose={() => setSelected(null)}>
          <InfoGrid items={[
            ["Customer", selected.customerName],
            ["Phone", <a href={`tel:${selected.phone}`}>{selected.phone}</a>],
            ["Email", selected.email],
            ["Venue", selected.venue],
            ["Guests", selected.guestCount],
            ["Budget", selected.budget],
            ["Estimated price", money(selected.estimatedPrice)],
            ["Quotation", money(selected.quotationAmount)],
            ["Advance paid", money(selected.advancePaid)],
            ["Final payment", money(selected.finalPayment)],
            ["Status", <StatusBadge value={selected.bookingStatus} />],
            ["Created", dateTime(selected.createdAt)]
          ]} />
          <section className="admin-card slim">
            <strong>Special requirements</strong>
            <p>{selected.specialRequirements || "Not provided"}</p>
            <strong>Admin notes</strong>
            <p>{selected.adminNotes || "No notes added"}</p>
          </section>
          <div className="admin-inline-fields">
            <select value={selected.bookingStatus} onChange={(event) => updateStatus(selected, event.target.value)}>{bookingStatuses.map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <input placeholder={`Quotation ${money(selected.quotationAmount)}`} value={quotation.quotationAmount || ""} onChange={(event) => setQuotation((current) => ({ ...current, quotationAmount: event.target.value }))} />
            <input placeholder={`Advance ${money(selected.advancePaid)}`} value={quotation.advancePaid || ""} onChange={(event) => setQuotation((current) => ({ ...current, advancePaid: event.target.value }))} />
            <input placeholder={`Final ${money(selected.finalPayment)}`} value={quotation.finalPayment || ""} onChange={(event) => setQuotation((current) => ({ ...current, finalPayment: event.target.value }))} />
          </div>
          <textarea placeholder="Admin notes" value={quotation.adminNotes ?? selected.adminNotes ?? ""} onChange={(event) => setQuotation((current) => ({ ...current, adminNotes: event.target.value }))} />
          <button type="button" onClick={saveQuotation}>Save quotation</button>
        </DetailDrawer>
      )}
    </section>
  );
}
