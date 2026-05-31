import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, MapPin, PackageCheck, Phone, ShoppingBag, Trash2, Truck } from "../components/icons.jsx";
import { useCart } from "../../context/CartContext.jsx";
import BillSummary from "../components/BillSummary.jsx";
import CartItem from "../components/CartItem.jsx";
import { useState } from "react";
import { calculateCartTotals } from "../../utils/orderUtils.js";
import { formatCurrency } from "../../utils/formatCurrency.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { getDefaultCustomerLocation } from "../../utils/customerLocation.js";

export default function Cart() {
  const { items, totals, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [fulfillment, setFulfillment] = useState("Delivery");
  const navigate = useNavigate();
  const cartTotals = calculateCartTotals(items, { orderType: fulfillment });
  const locationText = getDefaultCustomerLocation(user) || (isAuthenticated ? "Set delivery location" : "Detect your location");

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
          <strong>{locationText}</strong>
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
