import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, MessageCircle, PartyPopper, ShieldCheck, Users } from "../components/icons.jsx";
import heroImage from "../../assets/images/canapes.jpg";
import { cateringPackages, cateringSteps, eventCategories, menuBuilderCategories, trustBadges } from "../data/cateringData.js";
import { WHATSAPP_NUMBER } from "../components/homeData.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { CATERING_QUOTES_KEY, generateWhatsAppCateringMessage } from "../../utils/orderUtils.js";
import { getFromLocalStorage, saveToLocalStorage } from "../../utils/storageUtils.js";

export default function Catering() {
  const [eventType, setEventType] = useState("Wedding Catering");
  const [guestCount, setGuestCount] = useState(100);
  const [foodPreference, setFoodPreference] = useState("Both");
  const [selectedPackage, setSelectedPackage] = useState("Premium Package");
  const [selectedDishes, setSelectedDishes] = useState([]);
  const [quoteSaved, setQuoteSaved] = useState(false);

  const packageInfo = cateringPackages.find((item) => item.name === selectedPackage) || cateringPackages[1];
  const estimate = useMemo(() => {
    const rate = packageInfo.rate || 500;
    const min = guestCount * rate;
    const max = Math.round(min * 1.18);
    return { min, max };
  }, [guestCount, packageInfo]);

  const toggleDish = (dish) => {
    setSelectedDishes((current) => current.includes(dish) ? current.filter((item) => item !== dish) : [...current, dish]);
  };

  const quoteMessage = generateWhatsAppCateringMessage({
    eventType,
    guestCount,
    foodPreference,
    selectedPackage,
    selectedDishes,
    budget: `${formatCurrency(estimate.min)} - ${formatCurrency(estimate.max)}`
  });

  const saveQuote = () => {
    const quote = {
      id: `QR${Date.now().toString().slice(-6)}`,
      eventType,
      guestCount,
      foodPreference,
      selectedPackage,
      selectedDishes,
      estimate,
      createdAt: new Date().toISOString()
    };
    const saved = getFromLocalStorage(CATERING_QUOTES_KEY, []);
    saveToLocalStorage(CATERING_QUOTES_KEY, [quote, ...saved]);
    setQuoteSaved(true);
  };

  return (
    <div className="app-screen catering-screen">
      <section className="catering-hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(17,16,13,.92), rgba(17,16,13,.42)), url(${heroImage})` }}>
        <p>Catering by Ahmad Caterers</p>
        <h1>Plan a custom event menu in minutes.</h1>
        <Link className="app-button" to="/catering-booking"><CalendarDays size={18} /> Book Catering</Link>
      </section>

      <section className="app-card event-planner-card">
        <h2><PartyPopper size={21} /> Event Menu Builder</h2>
        <label>Event type</label>
        <div className="category-filter-row">
          {eventCategories.map((event) => (
            <button key={event.title} type="button" className={eventType === event.title ? "active" : ""} onClick={() => setEventType(event.title)}>
              {event.title.replace(" Catering", "")}
            </button>
          ))}
        </div>
        <label>Guest count</label>
        <div className="guest-counter">
          <button type="button" onClick={() => setGuestCount((count) => Math.max(10, count - 25))}>-</button>
          <strong><Users size={18} /> {guestCount} guests</strong>
          <button type="button" onClick={() => setGuestCount((count) => count + 25)}>+</button>
        </div>
        <label>Food preference</label>
        <div className="chip-group compact">
          {["Veg", "Non-Veg", "Both"].map((option) => (
            <button key={option} type="button" className={foodPreference === option ? "active" : ""} onClick={() => setFoodPreference(option)}>{option}</button>
          ))}
        </div>
      </section>

      <section className="app-section package-comparison-section">
        <div className="section-title-row">
          <div>
            <p>Choose package</p>
            <h2>Package comparison</h2>
          </div>
          <span>{selectedPackage}</span>
        </div>
        <div className="package-list">
          {cateringPackages.map((item) => (
            <button className={`app-card package-card-app selectable ${selectedPackage === item.name ? "selected" : ""}`} key={item.name} type="button" onClick={() => setSelectedPackage(item.name)}>
              <span>{selectedPackage === item.name ? "Selected" : "Tap to select"}</span>
              <div>
                <h3>{item.name}</h3>
                <strong>{item.price}</strong>
              </div>
              <ul>
                {item.features.map((feature) => (
                  <li key={feature}><CheckCircle2 size={15} /> {feature}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </section>

      <section className="app-card budget-card">
        <p>Estimated budget</p>
        <h2>{formatCurrency(estimate.min)} - {formatCurrency(estimate.max)}</h2>
        <span>Final quote depends on venue, menu, live counters, and service staff.</span>
      </section>

      <section className="app-card menu-builder-card">
        <h2>Choose dishes</h2>
        {Object.entries(menuBuilderCategories).map(([category, dishes]) => (
          <div className="builder-category" key={category}>
            <h3>{category}</h3>
            <div className="chip-group compact">
              {dishes.map((dish) => (
                <button key={dish} type="button" className={selectedDishes.includes(dish) ? "active" : ""} onClick={() => toggleDish(dish)}>
                  {dish}
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      {quoteSaved && <section className="success-banner"><strong>Quote saved</strong><span>Your event quote request has been saved locally.</span></section>}

      <div className="button-row">
        <button className="app-button full-width" type="button" onClick={saveQuote}>Get Quote</button>
        <a className="app-button outline full-width" href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(quoteMessage)}`} target="_blank" rel="noreferrer">
          <MessageCircle size={18} /> WhatsApp Quote
        </a>
      </div>

      <section className="event-grid">
        {eventCategories.slice(0, 4).map((event) => (
          <Link className="event-card" to="/catering-booking" key={event.title}>
            <img src={event.image} alt={event.title} />
            <strong><PartyPopper size={17} /> {event.title}</strong>
            <span>{event.copy}</span>
          </Link>
        ))}
      </section>

      <section className="trust-grid">
        {trustBadges.map((badge) => (
          <article className="trust-card" key={badge}>
            <ShieldCheck size={20} />
            <span>{badge}</span>
          </article>
        ))}
      </section>

      <section className="app-card how-card">
        <h2>How catering works</h2>
        {cateringSteps.map((step, index) => (
          <div key={step}>
            <span>{index + 1}</span>
            <strong>{step}</strong>
          </div>
        ))}
      </section>
      <Link className="app-button full-width checkout-button" to="/catering-booking"><CalendarDays size={18} /> Book Catering</Link>
    </div>
  );
}
