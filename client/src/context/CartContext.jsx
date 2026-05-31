import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  CART_STORAGE_KEY,
  LEGACY_LAST_ORDER_KEY,
  LEGACY_ORDERS_STORAGE_KEY,
  LATEST_ORDER_ID_KEY,
  ORDERS_STORAGE_KEY,
  calculateCartTotals,
  normalizeOrder
} from "../utils/orderUtils.js";
import { getFromLocalStorage, saveToLocalStorage } from "../utils/storageUtils.js";
import { orderService } from "../services/orderService.js";

const CartContext = createContext(null);

function getCartKey(food, customizations = {}) {
  const hasCustomizations = Object.values(customizations).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value)
  );

  if (!hasCustomizations) return food.id;

  return `${food.id}:${JSON.stringify({
    spiceLevel: customizations.spiceLevel || "",
    portion: customizations.portion || "",
    addOns: customizations.addOns || [],
    instruction: customizations.instruction || ""
  })}`;
}

function readStorage(key, fallback) {
  return getFromLocalStorage(key, fallback);
}

function maybeObjectId(value) {
  return /^[a-f\d]{24}$/i.test(value || "") ? value : undefined;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStorage(CART_STORAGE_KEY, []));
  const [orders, setOrders] = useState(() => {
    const savedOrders = readStorage(ORDERS_STORAGE_KEY, null) || readStorage(LEGACY_ORDERS_STORAGE_KEY, []);
    return savedOrders.map(normalizeOrder).filter(Boolean);
  });
  const [latestOrderId, setLatestOrderId] = useState(() => {
    const savedId = readStorage(LATEST_ORDER_ID_KEY, null);
    const legacyLastOrder = normalizeOrder(readStorage(LEGACY_LAST_ORDER_KEY, null));
    return savedId || legacyLastOrder?.orderId || null;
  });

  useEffect(() => {
    saveToLocalStorage(CART_STORAGE_KEY, items);
  }, [items]);

  useEffect(() => {
    const clearSavedOrders = () => {
      setOrders([]);
      setLatestOrderId(null);
      localStorage.removeItem(ORDERS_STORAGE_KEY);
      localStorage.removeItem(LEGACY_ORDERS_STORAGE_KEY);
      localStorage.removeItem(LATEST_ORDER_ID_KEY);
      localStorage.removeItem(LEGACY_LAST_ORDER_KEY);
    };

    window.addEventListener("auth-session-cleared", clearSavedOrders);
    return () => window.removeEventListener("auth-session-cleared", clearSavedOrders);
  }, []);

  useEffect(() => {
    saveToLocalStorage(ORDERS_STORAGE_KEY, orders);
  }, [orders]);

  useEffect(() => {
    if (latestOrderId) {
      saveToLocalStorage(LATEST_ORDER_ID_KEY, latestOrderId);
    }
  }, [latestOrderId]);

  const totals = useMemo(() => {
    return calculateCartTotals(items);
  }, [items]);

  const lastOrder = useMemo(
    () => orders.find((order) => order.orderId === latestOrderId || order.id === latestOrderId) || orders[0] || null,
    [orders, latestOrderId]
  );

  const addToCart = (food, customizations = {}) => {
    const cartKey = getCartKey(food, customizations);

    setItems((currentItems) => {
      const existing = currentItems.find((item) => item.cartKey === cartKey || (!item.cartKey && item.id === cartKey));
      if (existing) {
        return currentItems.map((item) =>
          (item.cartKey === cartKey || (!item.cartKey && item.id === cartKey)) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...currentItems, { ...food, cartKey, customizations, quantity: 1 }];
    });
  };

  const increaseQuantity = (id) => {
    setItems((currentItems) =>
      currentItems.map((item) => ((item.cartKey || item.id) === id ? { ...item, quantity: item.quantity + 1 } : item))
    );
  };

  const decreaseQuantity = (id) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        (item.cartKey || item.id) === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setItems((currentItems) => currentItems.filter((item) => (item.cartKey || item.id) !== id));
  };

  const clearCart = () => setItems([]);

  const reorder = (orderItems = []) => {
    setItems((currentItems) => {
      const nextItems = [...currentItems];

      orderItems.forEach((orderItem) => {
        const key = orderItem.cartKey || getCartKey(orderItem, orderItem.customizations || {});
        const existing = nextItems.find((item) => (item.cartKey || item.id) === key);
        if (existing) {
          existing.quantity += orderItem.quantity;
        } else {
          nextItems.push({ ...orderItem, cartKey: key });
        }
      });

      return nextItems;
    });
  };

  const placeOrder = async (checkoutDetails) => {
    const orderType = (checkoutDetails.fulfillment || checkoutDetails.orderType || "Delivery").toString().toLowerCase();
    const orderTotals = calculateCartTotals(items, { orderType });
    const payload = {
      customerName: checkoutDetails.name,
      customerPhone: checkoutDetails.phone,
      items: items.map((item) => ({
        menuItem: maybeObjectId(item._id || item.id),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        customizations: {
          ...item.customizations,
          addOns: (item.customizations?.addOns || []).map((addOn) =>
            typeof addOn === "string" ? { name: addOn, price: 0 } : addOn
          )
        }
      })),
      subtotal: orderTotals.subtotal,
      deliveryCharge: orderTotals.deliveryCharge,
      packingCharge: orderTotals.packingCharge,
      tax: orderTotals.tax,
      discount: orderTotals.discount,
      totalAmount: orderTotals.grandTotal,
      orderType,
      deliveryAddress: checkoutDetails.address || "",
      deliveryLocation: checkoutDetails.deliveryLocation,
      landmark: checkoutDetails.landmark || "",
      paymentMethod:
        checkoutDetails.paymentMethod === "Cash on Delivery"
          ? "COD"
          : checkoutDetails.paymentMethod === "Razorpay ready" || checkoutDetails.paymentMethod === "Razorpay Online"
            ? "Razorpay"
            : checkoutDetails.paymentMethod,
      paymentStatus: checkoutDetails.paymentStatus || "pending",
      transactionId: checkoutDetails.transactionId || "",
      orderNotes: checkoutDetails.notes || "",
      estimatedTime: orderType === "pickup" ? "25-30 min" : "35-45 min",
      checkoutDetails
    };

    const order = await orderService.createOrder(payload);
    setOrders((currentOrders) => [order, ...currentOrders]);
    setLatestOrderId(order.orderId);
    if (checkoutDetails.clearCartOnSuccess !== false) clearCart();
    return order;
  };

  const getOrderById = (id) => {
    if (!id) return null;
    return orders.find((order) => order.orderId === id || order.id === id) || null;
  };

  const value = useMemo(
    () => ({
      items,
      orders,
      lastOrder,
      totals,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      clearCart,
      reorder,
      placeOrder,
      getTotalsForOrder: (options) => calculateCartTotals(items, options),
      getOrderById
    }),
    [items, orders, lastOrder, totals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
