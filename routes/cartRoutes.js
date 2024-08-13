import express from "express";
const router = express.Router();
import { authenticateJWT, requireRole } from "../middleware/authMiddleware.js";
import {
  getCartByUserId,
  addItemToCart,
  removeItemFromCart,
  updateCart,
  getAllCarts,
} from "../Controller/cartController.js";

router.get(
  "/cart/get-cart/all",
  authenticateJWT,
  requireRole(["admin"]),
  getAllCarts
);

router.get("/cart/get-cart-by-id", authenticateJWT, getCartByUserId);

router.post("/cart/add-to-cart", authenticateJWT, addItemToCart);

router.post(
  "/cart/remove-from-cart/:productId",
  authenticateJWT,
  removeItemFromCart
);

router.patch("/cart/update-cart", authenticateJWT, updateCart);

export default router;
