import { Router } from "express";
import {
  createBooking,
  getBookingById,
  getBookings,
  getMyBookings,
  updateBookingStatus,
  updateQuotation
} from "../controllers/bookingController.js";
import { optionalProtect, protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

const router = Router();

router.post("/", optionalProtect, createBooking);
router.get("/my-bookings", protect, getMyBookings);
router.get("/", protect, requireAdmin, getBookings);
router.get("/:id", protect, getBookingById);
router.put("/:id/status", protect, requireAdmin, updateBookingStatus);
router.put("/:id/quotation", protect, requireAdmin, updateQuotation);

export default router;
