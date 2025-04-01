import express from "express";
import { protectRoute } from "../middleware/authMiddleware.js";
import {
  addToCart,
  getCartProducts,
  removeAllFromCart,
  updateQuantity,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute, addToCart);
router.delete("/", protectRoute, removeAllFromCart);
router.put("/:id", protectRoute, updateQuantity);
router.post("/clear", clearCart);

export default router;
