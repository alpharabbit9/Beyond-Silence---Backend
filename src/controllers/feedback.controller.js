import Feedback from "../models/feedback.model.js";
import cloudinary from "../config/cloudinary.js";


// USER → Add feedback
export const addFeedback = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    const { type, message } = req.body;

    if (!type) {
      return res.status(400).json({ message: "Type is required" });
    }

    let fileData = null;

    if (req.file) {
      fileData = {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer // THIS is the file
      };
    }

    const feedback = await Feedback.create({
      type,
      message,
      file: fileData,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      data: feedback
    });

  } catch (error) {
    console.error("ADD FEEDBACK ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};


// USER → Get my feedback
export const getMyFeedback = async (req, res) => {
  try {
    const data = await Feedback.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// USER → History (approved only)
export const getHistory = async (req, res) => {
  try {
    const data = await Feedback.find({
      user: req.user.id,
      status: "approved"
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ADMIN → Get all feedback
export const getAllFeedback = async (req, res) => {
  const data = await Feedback.find().populate("user", "email");
  res.json(data);
};


// ADMIN → Approve
export const approveFeedback = async (req, res) => {
  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { status: "approved" },
    { new: true }
  );

  res.json(feedback);
};


// ADMIN → Reject
export const rejectFeedback = async (req, res) => {
  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { status: "rejected" },
    { new: true }
  );

  res.json(feedback);
};