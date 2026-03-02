import Feedback from "../models/feedback.model.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

// USER → Add feedback
export const addFeedback = async (req, res) => {
  try {
    const { type, message } = req.body;

    if (!type) {
      return res.status(400).json({ message: "Type is required" });
    }

    let mediaUrl = null;

    // 🔥 If file exists → upload to Cloudinary
    if (req.file) {
      const uploadFromBuffer = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "feedbacks" }, // optional folder name
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );

          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
      };

      const result = await uploadFromBuffer();
      mediaUrl = result.secure_url; // ✅ this is what you save
    }

    const feedback = await Feedback.create({
      type,
      message,
      mediaUrl,   // ✅ now this will be saved
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

// USER & ADMIN → Delete feedback (admin can delete any, user can delete only own)
export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found"
      });
    }

    // ✅ If user is NOT admin → check ownership
    if (req.user.role !== "admin") {
      if (feedback.user.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: "You can delete only your own feedback"
        });
      }
    }

    await feedback.deleteOne();

    res.json({
      success: true,
      message: "Feedback deleted successfully"
    });

  } catch (error) {
    console.error("DELETE FEEDBACK ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};