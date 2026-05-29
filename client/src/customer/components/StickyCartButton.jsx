import { Link } from "react-router-dom";
import { ArrowRight, ShoppingCart } from "./icons.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { formatCurrency } from "../../utils/formatCurrency.js";

export default function StickyCartButton() {
  const { totals } = useCart();

  if (!totals.itemCount) return null;

  return (
    <Link className="sticky-cart-button" to="/cart">
      <span><ShoppingCart size={18} /> {totals.itemCount} items</span>
      <strong>{formatCurrency(totals.grandTotal)}</strong>
      <em>View <ArrowRight size={16} /></em>
    </Link>
  );
}
