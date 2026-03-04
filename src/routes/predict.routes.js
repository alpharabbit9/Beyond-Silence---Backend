import express from "express";
import axios from "axios";

const router = express.Router();

const PYTHON_MODEL_URL = process.env.PYTHON_MODEL_URL || "http://localhost:8000";

// POST /api/predict
router.post("/", async (req, res) => {
  try {
    const { frames } = req.body;

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No frames provided",
      });
    }

    console.log(`📥 Received ${frames.length} frames for prediction`);

    const modelResponse = await axios.post(
      `${PYTHON_MODEL_URL}/predict`,
      { frames: frames },
      {
        timeout: 60000,
        headers: { "Content-Type": "application/json" },
        maxContentLength: 100 * 1024 * 1024,
        maxBodyLength: 100 * 1024 * 1024,
      }
    );

    const prediction = modelResponse.data;
    console.log(
      `✅ Prediction: ${prediction.predicted_label} (${prediction.confidence}%)`
    );

    return res.json({
      success: true,
      data: {
        predicted_label: prediction.predicted_label,
        confidence: prediction.confidence,
        top5: prediction.top5,
        processing_time_ms: prediction.processing_time_ms,
      },
    });
  } catch (error) {
    console.error("❌ Prediction error:", error.message);

    if (error.code === "ECONNREFUSED") {
      return res.status(503).json({
        success: false,
        error: "Python model service is not running!",
      });
    }

    return res.status(500).json({
      success: false,
      error: error.response?.data?.detail || error.message,
    });
  }
});

// GET /api/predict/labels
router.get("/labels", (req, res) => {
  const labels = [
    "aam", "aaple", "ac", "aids", "alu", "anaros", "angur", "apartment",
    "attio", "audio cassette", "ayna", "baandej", "baat", "baba", "balti",
    "balu", "bhai", "biscuts", "bon", "boroi", "bottam", "bou", "cake",
    "capsule", "cha", "chacha", "chachi", "chadar", "chal", "chikissha",
    "chini", "chips", "chiruni", "chocolate", "chokh utha", "chosma",
    "churi", "clip", "cream", "dada", "dadi", "daeitto", "dal", "debor",
    "denadar", "dengue", "doctor", "dongson", "dulavai", "durbol", "jomoj",
    "juta", "konna", "maa", "tattha", "toothpaste", "tshirt", "tubelight",
    "tupi", "tv",
  ];
  res.json({ success: true, data: labels, total: labels.length });
});

export default router;