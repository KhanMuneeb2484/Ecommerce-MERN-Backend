import express from "express";
const router = express.Router();
import { authenticateJWT, requireRole } from "../middleware/authMiddleware.js";

import {
  createCheckout,
  updateCheckoutStatus,
  getCheckout,
  getAllCheckouts,
} from "../Controller/checkoutController.js";

// Route to handle checkout

router.get(
  "/checkout/get-checkout/:checkoutId",
  authenticateJWT,
  requireRole(["admin"]),
  getCheckout
);

router.get(
  "/checkout/get-all-checkout",
  authenticateJWT,
  requireRole(["admin"]),
  getAllCheckouts
);

router.post("/checkout/create-checkout", authenticateJWT, createCheckout);

router.patch(
  "/checkout/update-checkout/:checkoutId",
  authenticateJWT,
  updateCheckoutStatus
);

export default router;
