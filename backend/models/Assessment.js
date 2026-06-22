const mongoose = require("mongoose");

const assessmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    config: {
      mcqCount: { type: Number, default: 0 },
      mcqMarks: { type: Number, default: 0 },
      shortCount: { type: Number, default: 0 },
      shortMarks: { type: Number, default: 0 },
      longCount: { type: Number, default: 0 },
      longMarks: { type: Number, default: 0 },
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    coveredWeeks: {
      type: [String],
      default: [],
    },
    difficultyDistribution: {
      easyPercent: { type: Number, default: 30 },
      mediumPercent: { type: Number, default: 50 },
      hardPercent: { type: Number, default: 20 },
    },
    mcqs: [
      {
        question: String,
        options: [String],
        correctAnswer: String,
        difficulty: String,
        bloomLevel: String,
      },
    ],
    shortQuestions: [
      {
        question: String,
        modelAnswer: String,
        difficulty: String,
        bloomLevel: String,
      },
    ],
    longQuestions: [
      {
        question: String,
        modelAnswer: String,
        difficulty: String,
        bloomLevel: String,
      },
    ],
    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assessment", assessmentSchema);