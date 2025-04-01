import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getAdminOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/admin", protectRoute, getAdminOrders);
router.patch("/:orderId/status", protectRoute, updateOrderStatus);

export default router;
