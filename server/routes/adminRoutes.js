import { Router } from "express";
import {
  createDeliveryBoy,
  deleteDeliveryBoy,
  getAdminPayments,
  getCustomers,
  getDashboardStats,
  getDeliveryBoys,
  updateDeliveryBoy
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

const router = Router();

router.get("/dashboard", protect, requireAdmin, getDashboardStats);
router.get("/customers", protect, requireAdmin, getCustomers);
router.get("/delivery-boys", protect, requireAdmin, getDeliveryBoys);
router.post("/delivery-boys", protect, requireAdmin, createDeliveryBoy);
router.put("/delivery-boys/:id", protect, requireAdmin, updateDeliveryBoy);
router.delete("/delivery-boys/:id", protect, requireAdmin, deleteDeliveryBoy);
router.get("/payments", protect, requireAdmin, getAdminPayments);

export default router;
