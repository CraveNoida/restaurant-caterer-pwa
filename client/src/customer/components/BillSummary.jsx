import { formatCurrency } from "../../utils/formatCurrency.js";
import { Bike, Package, ReceiptText } from "./icons.jsx";

export default function BillSummary({ totals }) {
  const itemTotal = totals.itemTotal ?? totals.subtotal ?? 0;
  const deliveryCharge = totals.deliveryCharge ?? 0;
  const packingCharge = totals.packingCharge ?? 0;
  const tax = totals.tax ?? 0;
  const discount = totals.discount ?? 0;
  const grandTotal = totals.grandTotal ?? totals.totalAmount ?? 0;

  return (
    <section className="app-card bill-summary-card">
      <h2><ReceiptText size={20} /> Bill Details</h2>
      <div>
        <span>Item total</span>
        <strong>{formatCurrency(itemTotal)}</strong>
      </div>
      <div>
        <span><Bike size={16} /> Delivery charge</span>
        <strong>{deliveryCharge ? formatCurrency(deliveryCharge) : "Free"}</strong>
      </div>
      <div>
        <span><Package size={16} /> Packing charge</span>
        <strong>{formatCurrency(packingCharge)}</strong>
      </div>
      {tax > 0 && (
        <div>
          <span>Taxes</span>
          <strong>{formatCurrency(tax)}</strong>
        </div>
      )}
      {discount > 0 && (
        <div className="discount-row">
          <span>Discount</span>
          <strong>-{formatCurrency(discount)}</strong>
        </div>
      )}
      <div className="grand-total">
        <span>Grand total</span>
        <strong>{formatCurrency(grandTotal)}</strong>
      </div>
    </section>
  );
}
