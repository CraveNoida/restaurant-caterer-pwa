import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Clock, Mail, MapPin, MessageCircle, Phone, Users } from "../components/icons.jsx";
import { WHATSAPP_NUMBER } from "../components/homeData.js";
import { generateWhatsAppCateringMessage } from "../../utils/orderUtils.js";
import { bookingService } from "../../services/bookingService.js";
const initialForm = {
  name: "",
  mobile: "",
  email: "",
  eventType: "",
  eventDate: "",
  eventTime: "",
  venue: "",
  guests: "",
  foodPreference: "Both",
  budget: "",
  requirements: ""
};

export default function CateringBooking() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [lastMessage, setLastMessage] = useState("");
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const message = useMemo(() => generateWhatsAppCateringMessage(form), [form]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const validateForm = () => {
    const nextErrors = {};
    const phoneDigits = form.mobile.replace(/\D/g, "");

    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!/^[6-9]\d{9}$/.test(phoneDigits.slice(-10))) nextErrors.mobile = "Enter a valid 10 digit Indian mobile number.";
    if (!form.eventType.trim()) nextErrors.eventType = "Event type is required.";
    if (!form.eventDate) nextErrors.eventDate = "Event date is required.";
    if (!form.eventTime) nextErrors.eventTime = "Event time is required.";
    if (!form.venue.trim()) nextErrors.venue = "Venue is required.";
    if (!form.guests.trim()) nextErrors.guests = "Guest count is required.";
    if (!form.foodPreference) nextErrors.foodPreference = "Food preference is required.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    const payload = {
      customerName: form.name.trim(),
      phone: form.mobile.trim(),
      email: form.email.trim(),
      eventType: form.eventType.trim(),
      eventDate: form.eventDate,
      eventTime: form.eventTime,
      venue: form.venue.trim(),
      guestCount: Number(form.guests),
      foodPreference: form.foodPreference,
      packageType: "",
      selectedMenuItems: [],
      estimatedPrice: 0,
      budget: form.budget,
      specialRequirements: form.requirements.trim()
    };

    try {
      const data = await bookingService.createBooking(payload);
      const booking = data?.booking || payload;
      setLastMessage(generateWhatsAppCateringMessage({ ...form, ...booking }));
      setSubmitted(true);
      setForm(initialForm);
    } catch (error) {
      setErrors({ form: error.message || "Could not submit booking enquiry. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-screen booking-screen">
      {submitted && (
        <section className="success-banner">
          <strong>Enquiry submitted</strong>
          <span>Your catering enquiry has been saved. You can also send it on WhatsApp.</span>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lastMessage)}`} target="_blank" rel="noreferrer">
            <MessageCircle size={17} /> Send on WhatsApp
          </a>
        </section>
      )}
      {errors.form && <section className="success-banner error-banner"><strong>{errors.form}</strong></section>}
      <form className="app-card form-card" onSubmit={handleSubmit}>
        <h1><CalendarDays size={22} /> Catering Booking</h1>
        <label>Customer name<input required value={form.name} onChange={(event) => updateField("name", event.target.value)} />{errors.name && <small className="field-error">{errors.name}</small>}</label>
        <label>Mobile number<span className="input-with-icon"><Phone size={17} /><input required inputMode="tel" value={form.mobile} onChange={(event) => updateField("mobile", event.target.value)} /></span>{errors.mobile && <small className="field-error">{errors.mobile}</small>}</label>
        <label>Email optional<span className="input-with-icon"><Mail size={17} /><input type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} /></span></label>
        <label>Event type<input required value={form.eventType} onChange={(event) => updateField("eventType", event.target.value)} />{errors.eventType && <small className="field-error">{errors.eventType}</small>}</label>
        <div className="two-column-form">
          <label>Event date<span className="input-with-icon"><CalendarDays size={17} /><input required type="date" value={form.eventDate} onChange={(event) => updateField("eventDate", event.target.value)} /></span>{errors.eventDate && <small className="field-error">{errors.eventDate}</small>}</label>
          <label>Event time<span className="input-with-icon"><Clock size={17} /><input required type="time" value={form.eventTime} onChange={(event) => updateField("eventTime", event.target.value)} /></span>{errors.eventTime && <small className="field-error">{errors.eventTime}</small>}</label>
        </div>
        <label>Venue/location<span className="input-with-icon textarea-icon"><MapPin size={17} /><textarea required value={form.venue} onChange={(event) => updateField("venue", event.target.value)} /></span>{errors.venue && <small className="field-error">{errors.venue}</small>}</label>
        <label>Guest count<span className="input-with-icon"><Users size={17} /><input required inputMode="numeric" value={form.guests} onChange={(event) => updateField("guests", event.target.value)} /></span>{errors.guests && <small className="field-error">{errors.guests}</small>}</label>
        <fieldset className="radio-card-group">
          <legend>Food preference</legend>
          {["Veg", "Non-Veg", "Both"].map((option) => (
            <button type="button" className={form.foodPreference === option ? "active" : ""} onClick={() => updateField("foodPreference", option)} key={option}>
              {form.foodPreference === option && <CheckCircle2 size={15} />} {option}
            </button>
          ))}
          {errors.foodPreference && <small className="field-error">{errors.foodPreference}</small>}
        </fieldset>
        <fieldset className="chip-group">
          <legend>Budget range</legend>
          {["Under Rs 25k", "Rs 25k-75k", "Rs 75k+", "Custom"].map((budget) => (
            <button type="button" className={form.budget === budget ? "active" : ""} onClick={() => updateField("budget", budget)} key={budget}>{budget}</button>
          ))}
        </fieldset>
        <label>Special requirements<textarea value={form.requirements} onChange={(event) => updateField("requirements", event.target.value)} /></label>
        <button className="app-button full-width" type="submit" disabled={isSubmitting}><MessageCircle size={18} /> {isSubmitting ? "Submitting..." : "Submit enquiry"}</button>
      </form>
    </div>
  );
}
