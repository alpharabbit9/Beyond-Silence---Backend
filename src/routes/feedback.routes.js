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
  rejectFeedback,
  deleteFeedback
} from "../controllers/feedback.controller.js";

const router = express.Router();

// USER
router.post("/", authMiddleware, upload.single("file"), addFeedback);
router.get("/my", authMiddleware, getMyFeedback);
router.get("/history", authMiddleware, getHistory);
// USER → delete own feedback
router.delete("/:id", authMiddleware, deleteFeedback);

// ADMIN
router.get("/admin/all", authMiddleware, roleMiddleware("admin"), getAllFeedback);
router.patch("/admin/:id/approve", authMiddleware, roleMiddleware("admin"), approveFeedback);
router.patch("/admin/:id/reject", authMiddleware, roleMiddleware("admin"), rejectFeedback);
// ADMIN → delete any feedback
router.delete("/admin/:id", authMiddleware, roleMiddleware("admin"), deleteFeedback);

export default router;