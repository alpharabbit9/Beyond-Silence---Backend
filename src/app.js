import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import learningRoutes from "./routes/learning.routes.js";
import predictRoutes from "./routes/predict.routes.js";
import connectDB from "./config/db.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/learning", learningRoutes);
app.use("/api/predict", predictRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("RBAC Server Running");
});

// ════════════════════════════════════════════
//  START SERVER LOCALLY + VERCEL SUPPORT
// ════════════════════════════════════════════
const PORT = process.env.PORT || 5000;

// If running locally (not on Vercel)
if (process.env.VERCEL !== "1") {
  const startServer = async () => {
    try {
      await connectDB();
      console.log("✅ Connected to MongoDB");

      app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Backend running on http://localhost:${PORT}`);
        console.log(`📡 Python model at ${process.env.PYTHON_MODEL_URL || "http://localhost:8000"}`);
      });
    } catch (err) {
      console.error("❌ Failed to start:", err.message);
    }
  };

  startServer();
}

// For Vercel serverless deployment
let isConnected = false;
export default async function handler(req, res) {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
  return app(req, res);
}