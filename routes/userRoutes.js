import express from "express";
import { authenticateJWT, requireRole } from "../middleware/authMiddleware.js";
import {
  createUser,
  getUsers,
  getUser,
  updateUser,
  authUser,
  deleteUser,
  verifyEmail,
} from "../Controller/userController.js";

const router = express.Router();

router.post("/user/register-user", createUser);

router.get(
  "/user/get-all-users",
  authenticateJWT,
  requireRole(["admin"]),
  getUsers
);

router.get("/user/get-user-by-id", authenticateJWT, getUser);

router.patch("/user/update-user/", authenticateJWT, updateUser);

router.post("/user/login-user", authUser);

router.delete(
  "/user/delete-user/",
  authenticateJWT,
  requireRole(["admin"]),
  deleteUser
);

router.get("/user/verify-user/:token", authenticateJWT, verifyEmail);

export default router;
