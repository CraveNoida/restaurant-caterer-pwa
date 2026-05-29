import { api } from "./api.js";

export const paymentService = {
  createOrder: (payload) => api.post("/payments/create-order", payload),
  verify: (payload) => api.post("/payments/verify", payload),
  updateStatus: (id, payload) => api.put(`/payments/${id}/status`, payload),
  list: () => api.get("/payments")
};
