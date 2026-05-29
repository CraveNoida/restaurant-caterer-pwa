import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock, MapPin, PackageCheck, Phone, Plus, ShoppingBag, Tag, Trash2, Truck } from "../components/icons.jsx";
import { useCart } from "../../context/CartContext.jsx";
import BillSummary from "../components/BillSummary.jsx";
import CartItem from "../components/CartItem.jsx";
import FoodCard from "../components/FoodCard.jsx";
import { recommendedDishes } from "../data/foodData.js";
import { useState } from "react";
import { calculateCartTotals } from "../../utils/orderUtils.js";
import { formatCurrency } from "../../utils/formatCurrency.js";

export default function Cart() {
  const { items, totals, clearCart } = useCart();
  const [fulfillment, setFulfillment] = useState("Delivery");
  const [schedule, setSchedule] = useState("");
  const navigate = useNavigate();
  const cartTotals = calculateCartTotals(items, { orderType: fulfillment });

  if (!items.length) {
    return (
      <div className="app-screen empty-screen">
        <span className="empty-icon"><ShoppingBag size={48} /></span>
        <h1>Your cart is empty</h1>
        <p>Add dishes from the menu to start your order.</p>
        <Link className="app-button" to="/menu"><ShoppingBag size={18} /> Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="app-screen cart-screen">
      <div className="cart-top-actions">
        <button className="icon-action" type="button" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={20} /></button>
        <div>
          <p>{totals.itemCount} items selected</p>
          <strong>Review your order</strong>
        </div>
        <button className="text-button" type="button" onClick={clearCart}><Trash2 size={15} /> Clear</button>
      </div>
      <section className="cart-promise-card">
        <div>
          <Truck size={22} />
          <span>Estimated delivery</span>
          <strong>35-45 min</strong>
        </div>
        <div>
          <MapPin size={22} />
          <span>Delivering to</span>
          <strong>Margao, Goa</strong>
        </div>
        <a href="tel:+918788611511"><Phone size={16} /> Call kitchen</a>
      </section>
      <section className="app-card order-type-card">
        <div>
          <strong>Ahmad Caterers</strong>
          <span>{fulfillment} order from restaurant kitchen</span>
        </div>
        <span>{fulfillment === "Pickup" ? "No delivery charge" : "Fast local delivery"}</span>
      </section>
      <section className="cart-item-list">
        {items.map((item) => (
          <CartItem item={item} key={item.cartKey || item.id} />
        ))}
      </section>
      <section className="smart-cart-options app-card">
        <h2><PackageCheck size={20} /> Order options</h2>
        <div className="segmented-control">
          {["Delivery", "Pickup"].map((option) => (
            <button key={option} type="button" className={fulfillment === option ? "active" : ""} onClick={() => setFulfillment(option)}>
              {option === "Delivery" ? <ShoppingBag size={16} /> : <PackageCheck size={16} />} {option}
            </button>
          ))}
        </div>
        <label className="input-with-icon">
          <Clock size={17} />
          <input type="datetime-local" value={schedule} onChange={(event) => setSchedule(event.target.value)} aria-label="Schedule order" />
        </label>
        <small className="muted-text">Schedule is a placeholder for now and will be passed to checkout after backend wiring.</small>
      </section>
      <section className="app-card add-ons-card">
        <h2><Plus size={18} /> Suggested add-ons</h2>
        <div>
          {["Cold drink", "Dessert", "Extra raita", "Salad"].map((addon) => (
            <button type="button" key={addon}><Plus size={14} /> {addon}</button>
          ))}
        </div>
      </section>
      <section className="coupon-box">
        <span><Tag size={17} /> Coupon</span>
        <input placeholder="Apply coupon code" />
        <small className="muted-text">Promo code support is ready for backend rules.</small>
      </section>
      <section className="app-section">
        <div className="section-title-row">
          <div>
            <p>Complete your meal</p>
            <h2>You may also like</h2>
          </div>
        </div>
        <div className="horizontal-food-list">
          {recommendedDishes.slice(0, 3).map((food) => (
            <FoodCard food={food} compact key={food.id} />
          ))}
        </div>
      </section>
      <BillSummary totals={cartTotals} />
      <Link className="checkout-bottom-bar cart-checkout-bar" to="/checkout">
        <span>
          <small>Grand total</small>
          <strong>{formatCurrency(cartTotals.grandTotal)}</strong>
        </span>
        <em>Proceed to Checkout <ArrowRight size={17} /></em>
      </Link>
    </div>
  );
}
