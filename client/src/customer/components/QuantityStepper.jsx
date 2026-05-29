import { Minus, Plus } from "./icons.jsx";

export default function QuantityStepper({ quantity, onIncrease, onDecrease }) {
  return (
    <div className="quantity-stepper">
      <button type="button" onClick={onDecrease} aria-label="Decrease quantity"><Minus size={14} /></button>
      <span>{quantity}</span>
      <button type="button" onClick={onIncrease} aria-label="Increase quantity"><Plus size={14} /></button>
    </div>
  );
}
