import express from "express";
const router = express.Router();
import { authenticateJWT, requireRole } from "../middleware/authMiddleware.js";
import upload from "../middleware/productMulter.js"; // Import the Multer configuration

import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../Controller/productController.js";

// Create a product with images
router.post(
  "/product/create-product/create",
  authenticateJWT,
  requireRole(["admin"]),
  upload.array("productImages", 5), // Handle multiple image uploads
  createProduct
);
// Get a single product by ID
router.get("/product/get-product/:productId", authenticateJWT, getProduct);

// Get all products
router.get("/product/get-all-product", getProducts);

// Update a product by ID with images
router.patch(
  "/product/update-product/:productId",
  authenticateJWT,
  requireRole(["admin"]),
  upload.array("productImages", 5), // Handle multiple image uploads
  updateProduct
);

// Delete a product by ID
router.delete(
  "/product/delete-product/:productId",
  authenticateJWT,
  requireRole(["admin"]),
  deleteProduct
);

export default router;
