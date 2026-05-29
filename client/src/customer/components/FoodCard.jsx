import { Link } from "react-router-dom";
import { Heart, Plus, Star } from "./icons.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";
import QuantityStepper from "./QuantityStepper.jsx";

export default function FoodCard({ food, compact = false }) {
  const { items, addToCart, increaseQuantity, decreaseQuantity } = useCart();
  const cartItem = items.find((item) => item.id === food.id && !Object.values(item.customizations || {}).some((value) => Array.isArray(value) ? value.length > 0 : Boolean(value)));

  return (
    <article className={`app-food-card${compact ? " compact" : ""}${food.isAvailable ? "" : " unavailable"}`}>
      <Link to={`/food/${food.id}`} className="food-image-wrap">
        <img src={food.image} alt={food.name} />
        <span className={food.foodType === "Veg" ? "food-type veg" : "food-type non-veg"}>{food.foodType}</span>
      </Link>
      <div className="food-card-body">
        <div className="food-card-top">
          <span>{food.tags?.[0] || food.tag}</span>
          <b><Star size={13} fill="currentColor" /> {food.rating}</b>
        </div>
        <Link to={`/food/${food.id}`}>
          <h3>{food.name}</h3>
        </Link>
        <p>{food.description}</p>
        <div className="food-card-bottom">
          <strong>{formatCurrency(food.price)}</strong>
          {cartItem ? (
            <QuantityStepper
              quantity={cartItem.quantity}
              onIncrease={() => increaseQuantity(cartItem.cartKey || cartItem.id)}
              onDecrease={() => decreaseQuantity(cartItem.cartKey || cartItem.id)}
            />
          ) : (
            <button className="add-food-button" type="button" disabled={!food.isAvailable} onClick={() => addToCart(food)}>
              <Plus size={15} /> {food.isAvailable ? "Add" : "Sold out"}
            </button>
          )}
        </div>
      </div>
      <button className="favorite-button" type="button" aria-label={`Favorite ${food.name}`}>
        <Heart size={16} />
      </button>
    </article>
  );
}
