import { useCart } from "../../context/CartContext.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";
import QuantityStepper from "./QuantityStepper.jsx";
import { Trash2 } from "./icons.jsx";

export default function CartItem({ item }) {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const itemKey = item.cartKey || item.id;
  const details = [
    item.customizations?.spiceLevel && `Spice: ${item.customizations.spiceLevel}`,
    item.customizations?.portion && `Portion: ${item.customizations.portion}`,
    item.customizations?.addOns?.length ? `Add-ons: ${item.customizations.addOns.join(", ")}` : "",
    item.customizations?.instruction && `Note: ${item.customizations.instruction}`
  ].filter(Boolean);

  return (
    <article className="cart-item-card">
      <img src={item.image} alt={item.name} />
      <div>
        <span className={`food-type-badge ${item.foodType === "Veg" ? "veg" : "non-veg"}`}>
          {item.foodType || "Non-Veg"}
        </span>
        <h3>{item.name}</h3>
        <p>{formatCurrency(item.price)} each</p>
        {details.length > 0 && <small className="cart-customization">{details.join(" | ")}</small>}
        <button type="button" onClick={() => removeFromCart(itemKey)}><Trash2 size={15} /> Remove</button>
      </div>
      <div className="cart-item-actions">
        <QuantityStepper
          quantity={item.quantity}
          onIncrease={() => increaseQuantity(itemKey)}
          onDecrease={() => decreaseQuantity(itemKey)}
        />
        <strong>{formatCurrency(item.price * item.quantity)}</strong>
      </div>
    </article>
  );
}
