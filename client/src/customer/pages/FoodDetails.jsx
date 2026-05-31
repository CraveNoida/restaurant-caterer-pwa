import { Link, useParams } from "react-router-dom";
import { Clock, Plus, Star, Utensils } from "../components/icons.jsx";
import { useEffect, useState } from "react";
import { useCart } from "../../context/CartContext.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";
import FoodCard from "../components/FoodCard.jsx";
import QuantityStepper from "../components/QuantityStepper.jsx";
import { menuService } from "../../services/menuService.js";

export default function FoodDetails() {
  const { id } = useParams();
  const [food, setFood] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { items, addToCart, increaseQuantity, decreaseQuantity } = useCart();
  const [spiceLevel, setSpiceLevel] = useState("Medium");
  const [portion, setPortion] = useState("Full");
  const [addOns, setAddOns] = useState([]);
  const [instruction, setInstruction] = useState("");

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError("");

    Promise.all([menuService.getMenuItem(id), menuService.getMenuItems()])
      .then(([item, list]) => {
        if (!isMounted) return;
        setFood(item);
        setRecommendations(list.filter((dish) => dish.id !== item?.id).slice(0, 3));
      })
      .catch((err) => {
        if (!isMounted) return;
        setFood(null);
        setError(err.message || "Unable to load this menu item.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="app-screen empty-screen">
        <span className="empty-icon"><Utensils size={48} /></span>
        <h1>Loading dish</h1>
        <p>Fetching menu details.</p>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="app-screen empty-screen">
        <h1>Food item not found</h1>
        <p>This dish is unavailable or the menu link is invalid.</p>
        {error && <p>{error}</p>}
        <Link className="app-button" to="/menu">Back to menu</Link>
      </div>
    );
  }

  const hasCustomSelection = spiceLevel !== "Medium" || portion !== "Full" || addOns.length > 0 || instruction.trim();
  const cartItem = !hasCustomSelection
    ? items.find((item) => item.id === food.id && !Object.values(item.customizations || {}).some((value) => Array.isArray(value) ? value.length > 0 : Boolean(value)))
    : null;
  const toggleAddOn = (addOn) => {
    setAddOns((current) => current.includes(addOn) ? current.filter((item) => item !== addOn) : [...current, addOn]);
  };
  const portions = food.customizationOptions?.portions?.length ? food.customizationOptions.portions : ["Half", "Full", "Family Pack"];
  const spiceLevels = food.customizationOptions?.spiceLevels || ["Mild", "Medium", "Spicy"];
  const availableAddOns = food.customizationOptions?.addOns || food.addOns || [];

  return (
    <div className="app-screen food-detail-screen">
      <img className="food-detail-image" src={food.image} alt={food.name} />
      <section className="food-detail-card">
        {error && <small className="field-error">{error}</small>}
        <span className={food.foodType === "Veg" ? "food-type veg" : "food-type non-veg"}>{food.foodType}</span>
        <h1>{food.name}</h1>
        <p>{food.description}</p>
        <div className="food-detail-meta">
          <strong>{formatCurrency(food.price)}</strong>
          <span><Star size={16} fill="currentColor" /> {food.rating}</span>
          <span><Clock size={16} /> {food.prepTime}</span>
        </div>
        <section className="customization-panel">
          <h2>Customize your order</h2>
          <div>
            <p>Spice level</p>
            <div className="chip-group compact">
              {(spiceLevels.length ? spiceLevels : ["Mild", "Medium", "Spicy"]).map((option) => (
                <button key={option} type="button" className={spiceLevel === option ? "active" : ""} onClick={() => setSpiceLevel(option)}>{option}</button>
              ))}
            </div>
          </div>
          <div>
            <p>Portion</p>
            <div className="chip-group compact">
              {portions.map((option) => (
                <button key={option} type="button" className={portion === option ? "active" : ""} onClick={() => setPortion(option)}>{option}</button>
              ))}
            </div>
          </div>
          {availableAddOns.length > 0 && (
            <div>
              <p>Add-ons</p>
              <div className="chip-group compact">
                {availableAddOns.map((addOn) => (
                  <button key={addOn} type="button" className={addOns.includes(addOn) ? "active" : ""} onClick={() => toggleAddOn(addOn)}>{addOn}</button>
                ))}
              </div>
            </div>
          )}
          <label>Special instruction<textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} placeholder="Less oil, extra onions, packing note..." /></label>
        </section>
        {cartItem ? (
          <QuantityStepper
            quantity={cartItem.quantity}
            onIncrease={() => increaseQuantity(food.id)}
            onDecrease={() => decreaseQuantity(food.id)}
          />
        ) : (
          <button
            className="app-button full-width"
            type="button"
            disabled={!food.isAvailable}
            onClick={() => addToCart(food, { spiceLevel, portion, addOns, instruction: instruction.trim() })}
          >
            <Plus size={18} /> {food.isAvailable ? "Add to cart" : "Currently unavailable"}
          </button>
        )}
      </section>
      <section className="app-section">
        <div className="section-title-row">
          <h2>You may also like</h2>
          <Link to="/menu">Menu</Link>
        </div>
        <div className="horizontal-food-list">
          {recommendations.map((item) => (
            <FoodCard food={item} compact key={item.id} />
          ))}
        </div>
      </section>
    </div>
  );
}
