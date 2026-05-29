import { Router } from "express";
import {
  getAssignedOrderById,
  getAssignedOrders,
  getDeliveryProfile,
  startOrderTracking,
  stopOrderTracking,
  updateOrderLocation,
  updateDeliveryStatus
} from "../controllers/deliveryController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireDelivery } from "../middleware/deliveryMiddleware.js";

const router = Router();

router.get("/orders", protect, requireDelivery, getAssignedOrders);
router.get("/orders/:id", protect, requireDelivery, getAssignedOrderById);
router.post("/orders/:id/start-tracking", protect, requireDelivery, startOrderTracking);
router.post("/orders/:id/stop-tracking", protect, requireDelivery, stopOrderTracking);
router.put("/orders/:id/location", protect, requireDelivery, updateOrderLocation);
router.put("/orders/:id/status", protect, requireDelivery, updateDeliveryStatus);
router.get("/profile", protect, requireDelivery, getDeliveryProfile);

export default router;
