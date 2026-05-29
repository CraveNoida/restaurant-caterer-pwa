import { Router } from "express";
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItemById,
  getMenuItems,
  updateMenuItem
} from "../controllers/menuController.js";
import { protect } from "../middleware/authMiddleware.js";
import { requireAdmin } from "../middleware/adminMiddleware.js";

const router = Router();

router.get("/", getMenuItems);
router.get("/:id", getMenuItemById);
router.post("/", protect, requireAdmin, createMenuItem);
router.put("/:id", protect, requireAdmin, updateMenuItem);
router.delete("/:id", protect, requireAdmin, deleteMenuItem);

export default router;
