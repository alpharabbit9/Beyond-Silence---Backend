import LearningWord from "../models/learningWord.model.js";

// GET all words
export const getAllLearningWords = async (req, res) => {
  try {
    const words = await LearningWord.find().sort({
      category: 1,
      banglaWord: 1,
    });

    res.status(200).json({
      success: true,
      count: words.length,
      data: words,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET single word
export const getSingleLearningWord = async (req, res) => {
  try {
    const word = await LearningWord.findById(req.params.id);

    if (!word) {
      return res.status(404).json({
        success: false,
        message: "Word not found",
      });
    }

    res.status(200).json({
      success: true,
      data: word,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};