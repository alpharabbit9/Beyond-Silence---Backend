import "dotenv/config";
import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";
import learningRoutes from "./routes/learning.routes.js";
import connectDB from "./config/db.js";

const app = express();

// Connect DB (prevent multiple connections in serverless)
let isConnected = false;

const connectDatabase = async () => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }
};

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/learning", learningRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("RBAC Server Running");
});

// Export handler for Vercel
export default async function handler(req, res) {
  await connectDatabase();
  return app(req, res);
}