import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, MapPin, PackageCheck, Phone, Search, ShieldCheck, ShoppingBag, Star, Truck } from "../components/icons.jsx";
import heroImage from "../../assets/images/hero-bg.jpg";
import canapesImage from "../../assets/images/canapes.jpg";
import seafoodImage from "../../assets/images/seafood.jpg";
import { bestSellers, popularDishes, recommendedDishes, todaysSpecial } from "../data/foodData.js";
import { categoryData } from "../data/categoryData.js";
import { eventCategories, trustBadges } from "../data/cateringData.js";
import FoodCard from "../components/FoodCard.jsx";
import WhatsAppButton from "../components/WhatsAppButton.jsx";
import { PHONE_NUMBER } from "../components/homeData.js";
import { useCart } from "../../context/CartContext.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";

export default function Home() {
  const { orders, reorder } = useCart();
  const lastOrder = orders[0];

  return (
    <div className="app-screen home-screen">
      <section className="greeting-card">
        <div>
          <p>Good food, planned faster</p>
          <h1>Welcome to Ahmad Caterers</h1>
        </div>
        <span>Open today</span>
      </section>

      <section className="location-card">
        <div>
          <span><MapPin size={14} /> Delivering to</span>
          <strong>Margao, Goa</strong>
        </div>
        <a href={`tel:${PHONE_NUMBER}`}><Phone size={16} /> Call</a>
      </section>

      <Link to="/menu" className="app-search"><Search size={18} /> Search biryani, starters, catering trays...</Link>

      <section className="app-hero-card" style={{ backgroundImage: `linear-gradient(90deg, rgba(17,16,13,.92), rgba(17,16,13,.35)), url(${heroImage})` }}>
        <p>Ahmad Caterers</p>
        <h1>Order food or book catering in a few taps.</h1>
        <div>
          <Link className="app-button" to="/menu"><ShoppingBag size={18} /> Order now</Link>
          <Link className="app-button ghost" to="/catering"><CalendarDays size={18} /> Book catering</Link>
        </div>
      </section>

      {lastOrder && (
        <section className="repeat-order-card app-card">
          <div>
            <p>Repeat last order</p>
            <h2>{lastOrder.items.slice(0, 2).map((item) => item.name).join(", ")}</h2>
            <span>{formatCurrency(lastOrder.totalAmount ?? lastOrder.totals?.grandTotal)} | {lastOrder.items.length} items</span>
          </div>
          <button className="app-button small" type="button" onClick={() => reorder(lastOrder.items)}>
            <ShoppingBag size={16} /> Reorder
          </button>
        </section>
      )}

      <section className="quick-actions-grid">
        <Link to="/menu"><ShoppingBag size={22} /> <span>Order Food</span></Link>
        <Link to="/catering-booking"><CalendarDays size={22} /> <span>Book Catering</span></Link>
        <a href={`tel:${PHONE_NUMBER}`}><Phone size={22} /> <span>Call Now</span></a>
        <WhatsAppButton message="Hi Ahmad Caterers, I want to order food or book catering.">WhatsApp</WhatsAppButton>
      </section>

      <section className="app-section">
        <div className="section-title-row">
          <div>
            <p>Explore</p>
            <h2>Food categories</h2>
          </div>
          <Link to="/menu">View menu <ChevronRight size={16} /></Link>
        </div>
        <div className="category-pill-row">
          {categoryData.slice(1).map((category) => (
            <Link to={`/menu?category=${encodeURIComponent(category)}`} key={category}>{category}</Link>
          ))}
        </div>
      </section>

      <section className="app-section">
        <div className="section-title-row">
          <div>
            <p>Smart picks</p>
            <h2>Recommended for you</h2>
          </div>
          <Link to="/menu">See all <ChevronRight size={16} /></Link>
        </div>
        <div className="horizontal-food-list">
          {recommendedDishes.map((food) => (
            <FoodCard food={food} compact key={food.id} />
          ))}
        </div>
      </section>

      <section className="special-card">
        <img src={todaysSpecial.image} alt={todaysSpecial.name} />
        <div>
          <p>Today's Special</p>
          <h2>{todaysSpecial.name}</h2>
          <span>{todaysSpecial.description}</span>
          <Link className="app-button small" to={`/food/${todaysSpecial.id}`}>View dish <ChevronRight size={16} /></Link>
        </div>
      </section>

      <section className="app-section">
        <div className="section-title-row">
          <div>
            <p>Most ordered</p>
            <h2>Best sellers</h2>
          </div>
          <Link to="/menu">Order <ChevronRight size={16} /></Link>
        </div>
        <div className="horizontal-food-list">
          {(bestSellers.length ? bestSellers : popularDishes).map((food) => (
            <FoodCard food={food} compact key={food.id} />
          ))}
        </div>
      </section>

      <section className="app-section">
        <div className="section-title-row">
          <div>
            <p>Catering</p>
            <h2>Events we serve</h2>
          </div>
          <Link to="/catering">Details <ChevronRight size={16} /></Link>
        </div>
        <div className="catering-preview-grid">
          {eventCategories.slice(0, 4).map((event) => (
            <Link to="/catering-booking" className="mini-event-card" key={event.title}>
              <img src={event.image} alt={event.title} />
              <strong>{event.title}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section className="event-shortcut-card">
        <div>
          <p>Planning an event?</p>
          <h2>Build a custom menu for weddings, nikah, birthdays, and corporate events.</h2>
          <Link className="app-button small" to="/catering">Plan catering <ChevronRight size={16} /></Link>
        </div>
        <CalendarDays size={46} />
      </section>

      <section className="trust-grid">
        {trustBadges.slice(0, 4).map((badge, index) => {
          const Icon = [PackageCheck, ShieldCheck, Truck, Star][index] || ShieldCheck;
          return (
            <article className="trust-card" key={badge}>
              <Icon size={20} />
              <span>{badge}</span>
            </article>
          );
        })}
      </section>

      <section className="compact-gallery">
        <img src={canapesImage} alt="Catering starters" />
        <img src={seafoodImage} alt="Seafood catering" />
        <div>
          <p><Star size={16} fill="currentColor" /> Reviews</p>
          <h2>4.9 rated by families and teams</h2>
          <span>Trusted for wedding feasts, corporate meals, and restaurant delivery.</span>
        </div>
      </section>
    </div>
  );
}
