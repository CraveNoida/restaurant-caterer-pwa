import { api } from "./api.js";

export const adminService = {
  dashboard: () => api.get("/admin/dashboard"),
  customers: (search = "") => api.get(`/admin/customers${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  deliveryBoys: () => api.get("/admin/delivery-boys"),
  createDeliveryBoy: (payload) => api.post("/admin/delivery-boys", payload),
  updateDeliveryBoy: (id, payload) => api.put(`/admin/delivery-boys/${id}`, payload),
  deleteDeliveryBoy: (id) => api.delete(`/admin/delivery-boys/${id}`),
  payments: () => api.get("/admin/payments"),
  updatePaymentStatus: (id, payload) => api.put(`/payments/${id}/status`, payload)
};

export const adminOrderService = {
  list: () => api.get("/orders"),
  get: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, orderStatus) => api.put(`/orders/${id}/status`, { orderStatus }),
  assignDelivery: (id, deliveryBoyId) => api.put(`/orders/${id}/assign-delivery`, { deliveryBoyId })
};

export const adminMenuService = {
  list: () => api.get("/menu"),
  create: (payload) => api.post("/menu", payload),
  update: (id, payload) => api.put(`/menu/${id}`, payload),
  delete: (id) => api.delete(`/menu/${id}`)
};

export const adminBookingService = {
  list: () => api.get("/bookings"),
  get: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, bookingStatus) => api.put(`/bookings/${id}/status`, { bookingStatus }),
  updateQuotation: (id, payload) => api.put(`/bookings/${id}/quotation`, payload)
};
