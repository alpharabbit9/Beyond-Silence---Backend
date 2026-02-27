import express from "express";
import upload from "../middleware/upload.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";
import roleMiddleware from "../middleware/role.middleware.js";
import {
  addFeedback,
  getMyFeedback,
  getHistory,
  getAllFeedback,
  approveFeedback,
  rejectFeedback
} from "../controllers/feedback.controller.js";

const router = express.Router();

// USER
router.post("/", authMiddleware, upload.single("file"), addFeedback);
router.get("/my", authMiddleware, getMyFeedback);
router.get("/history", authMiddleware, getHistory);

// ADMIN
router.get("/admin/all", authMiddleware, roleMiddleware("admin"), getAllFeedback);
router.patch("/admin/:id/approve", authMiddleware, roleMiddleware("admin"), approveFeedback);
router.patch("/admin/:id/reject", authMiddleware, roleMiddleware("admin"), rejectFeedback);

export default router;