import express from "express";
import { register, login } from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";

const router = express.Router();

// Public
router.post("/register", register);
router.post("/login", login);

// Protected demo dashboards
router.get(
  "/user-dashboard",
  authMiddleware,
  roleMiddleware("user", "admin"),
  (req, res) => {
    res.json({ message: "Welcome User Dashboard" });
  }
);

router.get(
  "/admin-dashboard",
  authMiddleware,
  roleMiddleware("admin"),
  (req, res) => {
    res.json({ message: "Welcome Admin Dashboard" });
  }
);

export default router;