import { apiRequest } from "./api.js";
import { normalizeOrder } from "../utils/orderUtils.js";

export const orderService = {
  getMyOrders: async () => {
    const data = await apiRequest("/orders/my-orders");
    return (data?.orders || []).map(normalizeOrder).filter(Boolean);
  },
  getOrder: async (id) => {
    const data = await apiRequest(`/orders/${id}`);
    return normalizeOrder(data?.order);
  },
  getLocation: async (id) => {
    const data = await apiRequest(`/orders/${id}/location`);
    return data?.tracking;
  },
  createOrder: async (payload) => {
    const data = await apiRequest("/orders", { method: "POST", body: JSON.stringify(payload) });
    return normalizeOrder(data?.order);
  }
};
