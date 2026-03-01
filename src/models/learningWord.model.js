import mongoose from "mongoose";

const learningWordSchema = new mongoose.Schema(
  {
    banglaWord: {
      type: String,
      required: true,
      trim: true,
    },
    englishWord: {
      type: String,
      required: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const LearningWord = mongoose.model("LearningWord", learningWordSchema);

export default LearningWord;