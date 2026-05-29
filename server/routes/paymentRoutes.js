import { Router } from "express";
import {
  createPaymentOrder,
  getPaymentById,
  getPayments,
  updatePaymentStatus,
  verifyPayment
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/create-order", protect, createPaymentOrder);
router.post("/verify", protect, verifyPayment);
router.get("/", protect, getPayments);
router.get("/:id", protect, getPaymentById);
router.put("/:id/status", protect, updatePaymentStatus);

export default router;
