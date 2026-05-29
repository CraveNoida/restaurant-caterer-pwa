import { EMAIL_ADDRESS, MAP_URL, PHONE_NUMBER, WHATSAPP_NUMBER } from "./homeData.js";
import Reveal from "./Reveal.jsx";

export default function ContactSection() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const clean = (value) => String(value || "").trim();
    const message = [
      "Hi Ahmad Caterers, I want to enquire about catering.",
      `Name: ${clean(data.get("name"))}`,
      `Event type: ${clean(data.get("event"))}`,
      `Guest count: ${clean(data.get("guests"))}`,
      `Details: ${clean(data.get("details"))}`
    ].join("\n");

    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  };

  return (
    <section className="contact-section" id="contact">
      <div className="container contact-grid">
        <Reveal className="contact-copy">
          <p className="eyebrow">Contact</p>
          <h2>Tell us what you are planning.</h2>
          <p>
            Send a quick enquiry for restaurant orders, catering packages, guest counts, dates, menus, and delivery
            needs.
          </p>
          <div className="contact-actions">
            <a className="btn btn-primary" href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">
              WhatsApp
            </a>
            <a className="btn btn-secondary" href={`tel:${PHONE_NUMBER}`}>
              Phone
            </a>
            <a className="btn btn-secondary" href={`mailto:${EMAIL_ADDRESS}`}>
              Email
            </a>
            <a className="btn btn-secondary" href={MAP_URL} target="_blank" rel="noreferrer">
              Map
            </a>
          </div>
        </Reveal>
        <Reveal as="form" className="enquiry-form" delay={120} onSubmit={handleSubmit}>
          <label>
            Name
            <input name="name" placeholder="Your name" required />
          </label>
          <label>
            Event type
            <input name="event" placeholder="Wedding, party, office lunch" required />
          </label>
          <label>
            Guest count
            <input name="guests" placeholder="Approx. guests" />
          </label>
          <label>
            Details
            <textarea name="details" placeholder="Date, venue, menu preferences" />
          </label>
          <button className="btn btn-primary" type="submit">
            Send WhatsApp enquiry
          </button>
        </Reveal>
      </div>
    </section>
  );
}
