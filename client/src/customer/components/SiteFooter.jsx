import logoImage from "../../assets/images/logo-site.png";
import { EMAIL_ADDRESS, galleryItems, navLinks, PHONE_NUMBER, WHATSAPP_NUMBER } from "./homeData.js";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <a className="brand" href="#home" aria-label="Ahmad Caterers">
            <span className="brand-mark">
              <img src={logoImage} alt="" />
            </span>
            <span>
              <strong>Ahmad Caterers</strong>
              <small>Restaurant and catering</small>
            </span>
          </a>
          <p>Restaurant orders, catering bookings, party trays, and event food service in Margao, Goa.</p>
        </div>
        <div>
          <h3>Customer Links</h3>
          {navLinks.map((link) => (
            <a href={link.href} key={link.href}>{link.label}</a>
          ))}
        </div>
        <div>
          <h3>Contact</h3>
          <a href={`tel:${PHONE_NUMBER}`}>{PHONE_NUMBER}</a>
          <a href={`mailto:${EMAIL_ADDRESS}`}>{EMAIL_ADDRESS}</a>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer">WhatsApp Ahmad Caterers</a>
        </div>
        <div>
          <h3>Gallery</h3>
          <div className="footer-gallery">
            {galleryItems.slice(0, 4).map((item) => (
              <img src={item.image} alt={item.caption} key={item.caption} />
            ))}
          </div>
        </div>
      </div>
      <div className="footer-bottom">Ahmad Caterers customer app placeholder.</div>
    </footer>
  );
}
