import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    profilePicture: { type: String, default: null },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    verificationToken: {
      type: String
    },

    verificationTokenExpires: {
      type: Date
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);