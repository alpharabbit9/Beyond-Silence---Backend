import express from "express";
import {
  getAllLearningWords,
  getSingleLearningWord,
} from "../controllers/learning.controller.js";

const router = express.Router();

// Public routes
router.get("/", getAllLearningWords);
router.get("/:id", getSingleLearningWord);

export default router;