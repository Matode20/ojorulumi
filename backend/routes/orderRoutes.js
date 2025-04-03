import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getAdminOrders,
  updateOrderStatus,
  createOrderFromSession,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", createOrder);
router.get("/admin", protectRoute, getAdminOrders);
router.patch("/:orderId/status", protectRoute, updateOrderStatus);
router.post("/create-from-session", protectRoute, createOrderFromSession);

export default router;
