import { apiRequest } from "./api.js";

export const bookingService = {
  createBooking: (payload) => apiRequest("/bookings", { method: "POST", body: JSON.stringify(payload) }),
  getMyBookings: async () => {
    const data = await apiRequest("/bookings/my-bookings");
    return data?.bookings || [];
  }
};
