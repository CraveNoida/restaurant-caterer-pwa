export function formatCurrency(amount) {
  const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR"
  }).format(safeAmount);
}
