import { Router } from "express";
import {
  assignDeliveryBoy,
  createOrder,
  getOrderLocation,
  getMyOrders,
  getOrderById,
  getOrders,
  updateOrderStatus
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

const router = Router();

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/", protect, requireAdmin, getOrders);
router.get("/:id/location", protect, getOrderLocation);
router.get("/:id", protect, getOrderById);
router.put("/:id/status", protect, requireAdmin, updateOrderStatus);
router.put("/:id/assign-delivery", protect, requireAdmin, assignDeliveryBoy);

export default router;
