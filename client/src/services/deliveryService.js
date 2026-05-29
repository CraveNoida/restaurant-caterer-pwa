import { api } from "./api.js";
import { normalizeOrder } from "../utils/orderUtils.js";

function normalizeDeliveryPayload(data) {
  return {
    ...data,
    orders: (data?.orders || []).map(normalizeOrder).filter(Boolean),
    order: data?.order ? normalizeOrder(data.order) : undefined
  };
}

export const deliveryService = {
  getOrders: async () => normalizeDeliveryPayload(await api.get("/delivery/orders")),
  getOrder: async (id) => normalizeDeliveryPayload(await api.get(`/delivery/orders/${id}`)),
  startTracking: async (id) => normalizeDeliveryPayload(await api.post(`/delivery/orders/${id}/start-tracking`, {})),
  stopTracking: async (id) => normalizeDeliveryPayload(await api.post(`/delivery/orders/${id}/stop-tracking`, {})),
  updateLocation: async (id, location) => normalizeDeliveryPayload(await api.put(`/delivery/orders/${id}/location`, location)),
  updateStatus: async (id, deliveryStatus) =>
    normalizeDeliveryPayload(await api.put(`/delivery/orders/${id}/status`, { deliveryStatus })),
  getProfile: () => api.get("/delivery/profile")
};
