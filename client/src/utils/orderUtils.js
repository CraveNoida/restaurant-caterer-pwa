export const CART_STORAGE_KEY = "ahmad_customer_cart";
export const ORDERS_STORAGE_KEY = "customerOrders";
export const LEGACY_ORDERS_STORAGE_KEY = "ahmad_customer_orders";
export const LATEST_ORDER_ID_KEY = "latestCustomerOrderId";
export const LEGACY_LAST_ORDER_KEY = "ahmad_last_order";

export const DELIVERY_CHARGE = 45;
export const PACKING_CHARGE = 20;
export const CATERING_BOOKINGS_KEY = "cateringBookings";
export const CATERING_QUOTES_KEY = "cateringQuoteRequests";

export const ACTIVE_ORDER_STATUSES = ["placed", "accepted", "preparing", "ready", "out_for_delivery"];
export const COMPLETED_ORDER_STATUSES = ["delivered"];
export const CANCELLED_ORDER_STATUSES = ["cancelled"];

const statusMap = {
  "order placed": "placed",
  accepted: "accepted",
  preparing: "preparing",
  ready: "ready",
  "out for delivery": "out_for_delivery",
  out_for_delivery: "out_for_delivery",
  delivered: "delivered",
  cancelled: "cancelled"
};

export function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

export function calculateCartTotals(items = [], options = {}) {
  const orderType = (options.orderType || options.fulfillment || "delivery").toString().toLowerCase();
  const subtotal = items.reduce((sum, item) => {
    return sum + safeNumber(item.price) * Math.max(1, safeNumber(item.quantity));
  }, 0);
  const deliveryCharge = subtotal > 0 && orderType !== "pickup" ? DELIVERY_CHARGE : 0;
  const packingCharge = subtotal > 0 ? PACKING_CHARGE : 0;
  const tax = safeNumber(options.tax);
  const discount = Math.min(safeNumber(options.discount), subtotal + deliveryCharge + packingCharge + tax);
  const grandTotal = Math.max(0, subtotal + deliveryCharge + packingCharge + tax - discount);
  const itemCount = items.reduce((sum, item) => sum + Math.max(1, safeNumber(item.quantity)), 0);

  return {
    subtotal,
    itemTotal: subtotal,
    deliveryCharge,
    packingCharge,
    tax,
    discount,
    grandTotal,
    totalAmount: grandTotal,
    itemCount,
    orderType
  };
}

export function normalizeStatus(status) {
  return statusMap[(status || "placed").toString().trim().toLowerCase()] || "placed";
}

export function getStatusLabel(status) {
  const normalized = normalizeStatus(status);
  return {
    placed: "Order Placed",
    accepted: "Accepted",
    preparing: "Preparing",
    ready: "Ready",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled"
  }[normalized];
}

export function generateOrderId() {
  const now = new Date();
  const year = now.getFullYear();
  const suffix = now.getTime().toString().slice(-6);
  return `ORD-${year}-${suffix}`;
}

export function normalizeOrder(order) {
  if (!order) return null;

  const checkout = order.checkoutDetails || {};
  const orderId = order.orderId || order.id || order._id || generateOrderId();
  const orderType = (order.orderType || checkout.fulfillment || "delivery").toString().toLowerCase();
  const items = Array.isArray(order.items) ? order.items : [];
  const totals = order.totals || calculateCartTotals(items, { orderType });
  const normalizedTotals = {
    ...calculateCartTotals(items, { orderType }),
    ...totals,
    subtotal: safeNumber(totals.subtotal ?? totals.itemTotal),
    itemTotal: safeNumber(totals.itemTotal ?? totals.subtotal),
    deliveryCharge: safeNumber(totals.deliveryCharge),
    packingCharge: safeNumber(totals.packingCharge),
    tax: safeNumber(totals.tax),
    discount: safeNumber(totals.discount),
    grandTotal: safeNumber(totals.grandTotal ?? totals.totalAmount)
  };

  return {
    ...order,
    _id: order._id,
    id: orderId,
    orderId,
    customerName: order.customerName || checkout.name || "",
    phone: order.phone || order.customerPhone || checkout.phone || "",
    email: order.email || checkout.email || "",
    items,
    subtotal: safeNumber(order.subtotal ?? normalizedTotals.subtotal),
    deliveryCharge: safeNumber(order.deliveryCharge ?? normalizedTotals.deliveryCharge),
    packingCharge: safeNumber(order.packingCharge ?? normalizedTotals.packingCharge),
    tax: safeNumber(order.tax ?? normalizedTotals.tax),
    discount: safeNumber(order.discount ?? normalizedTotals.discount),
    totalAmount: safeNumber(order.totalAmount ?? normalizedTotals.grandTotal),
    totals: {
      ...normalizedTotals,
      totalAmount: safeNumber(order.totalAmount ?? normalizedTotals.grandTotal)
    },
    orderType,
    address: order.address || order.deliveryAddress || checkout.address || "",
    houseDetails: order.houseDetails || checkout.houseDetails || "",
    rawDetectedAddress: order.rawDetectedAddress || checkout.rawDetectedAddress || "",
    landmark: order.landmark || checkout.landmark || "",
    customerLocation: order.customerLocation || checkout.customerLocation || checkout.deliveryLocation || null,
    deliveryLocation: order.deliveryLocation || null,
    deliveryTracking: order.deliveryTracking || null,
    paymentMethod: order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod || checkout.paymentMethod || "Cash on Delivery",
    paymentStatus: order.paymentStatus || "pending",
    transactionId: order.transactionId || order.payment?.transactionId || checkout.transactionId || "",
    paymentId: order.paymentId || order.payment?._id || "",
    orderStatus: normalizeStatus(order.orderStatus || order.status),
    status: normalizeStatus(order.orderStatus || order.status),
    deliveryStatus: order.deliveryStatus || (normalizeStatus(order.orderStatus || order.status) === "delivered" ? "delivered" : "assigned"),
    orderNotes: order.orderNotes || checkout.notes || "",
    estimatedTime: order.estimatedTime || order.eta || (orderType === "pickup" ? "25-30 min" : "35-45 min"),
    eta: order.eta || order.estimatedTime || (orderType === "pickup" ? "25-30 min" : "35-45 min"),
    createdAt: order.createdAt || new Date().toISOString(),
    checkoutDetails: {
      ...checkout,
      name: order.customerName || checkout.name || "",
      phone: order.phone || order.customerPhone || checkout.phone || "",
      email: order.email || checkout.email || "",
      address: order.address || order.deliveryAddress || checkout.address || "",
      houseDetails: order.houseDetails || checkout.houseDetails || "",
      rawDetectedAddress: order.rawDetectedAddress || checkout.rawDetectedAddress || "",
      landmark: order.landmark || checkout.landmark || "",
      customerLocation: order.customerLocation || checkout.customerLocation || checkout.deliveryLocation || null,
      deliveryLocation: checkout.deliveryLocation || order.customerLocation || null,
      paymentMethod: order.paymentMethod || checkout.paymentMethod || "Cash on Delivery",
      fulfillment: orderType === "pickup" ? "Pickup" : "Delivery",
      notes: order.orderNotes || checkout.notes || ""
    }
  };
}

export function formatOrderItems(items = [], formatCurrency) {
  return items
    .map((item) => {
      const custom = [
        item.customizations?.spiceLevel && `Spice: ${item.customizations.spiceLevel}`,
        item.customizations?.portion && `Portion: ${item.customizations.portion}`,
        item.customizations?.addOns?.length ? `Add-ons: ${item.customizations.addOns.map((addOn) => typeof addOn === "string" ? addOn : addOn.name).join(", ")}` : "",
        item.customizations?.instruction && `Note: ${item.customizations.instruction}`
      ].filter(Boolean).join(", ");
      const lineTotal = safeNumber(item.price) * Math.max(1, safeNumber(item.quantity));
      return `${item.quantity} x ${item.name}${custom ? ` (${custom})` : ""} - ${formatCurrency(lineTotal)}`;
    })
    .join("\n");
}

export function formatOrderWhatsAppMessage(order, formatCurrency) {
  const normalized = normalizeOrder(order);
  if (!normalized) return "Hi Ahmad Caterers, I need help with my order.";

  return [
    "Hi Ahmad Caterers, please confirm my order.",
    `Order ID: ${normalized.orderId}`,
    `Name: ${normalized.customerName || "Not provided"}`,
    `Phone: ${normalized.phone || "Not provided"}`,
    normalized.orderType === "pickup"
      ? "Order type: Pickup"
      : `Address: ${normalized.houseDetails ? `${normalized.houseDetails}, ` : ""}${normalized.address || "Not provided"}${normalized.landmark ? `, Landmark: ${normalized.landmark}` : ""}`,
    `Items:\n${formatOrderItems(normalized.items, formatCurrency)}`,
    `Total: ${formatCurrency(normalized.totalAmount)}`,
    `Payment: ${normalized.paymentMethod}`,
    normalized.orderNotes ? `Notes: ${normalized.orderNotes}` : ""
  ].filter(Boolean).join("\n");
}

export const generateWhatsAppOrderMessage = formatOrderWhatsAppMessage;

export function generateWhatsAppCateringMessage(booking) {
  if (!booking) return "Hi Ahmad Caterers, I want to enquire about catering.";

  return [
    "Hi Ahmad Caterers, I want to enquire about catering.",
    `Name: ${booking.name || booking.customerName || "Not provided"}`,
    `Phone: ${booking.mobile || booking.phone || "Not provided"}`,
    booking.email ? `Email: ${booking.email}` : "",
    `Event type: ${booking.eventType || "Not provided"}`,
    `Date: ${booking.eventDate || booking.date || "Not provided"}`,
    `Time: ${booking.eventTime || booking.time || "Not provided"}`,
    `Venue: ${booking.venue || booking.location || "Not provided"}`,
    `Guest count: ${booking.guests || booking.guestCount || "Not provided"}`,
    `Food preference: ${booking.foodPreference || "Not provided"}`,
    booking.selectedPackage ? `Package: ${booking.selectedPackage}` : "",
    booking.selectedDishes?.length ? `Selected dishes: ${booking.selectedDishes.join(", ")}` : "",
    booking.budget ? `Budget: ${booking.budget}` : "",
    booking.requirements ? `Special requirements: ${booking.requirements}` : ""
  ].filter(Boolean).join("\n");
}
