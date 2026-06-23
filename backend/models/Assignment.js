const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
  type:        { type: String }, // "mcq" | "short" | "long"
  question:    { type: String },
  options:     { type: [String], default: [] },  // MCQ only
  correctAnswer: { type: String },               // MCQ only
  modelAnswer: { type: String },                 // short/long
  marks:       { type: Number, default: 1 },
  difficulty:  { type: String },
  bloomLevel:  { type: String },
});

const assignmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true },
    totalMarks: { type: Number, default: 0 },
    dueDate: { type: Date, default: null },
    questions: [questionSchema],
    createdBy: { type: String, required: true },
    coveredWeeks: { type: [String], default: [] },
    difficultyDistribution: {
      easyPercent:   { type: Number, default: 30 },
      mediumPercent: { type: Number, default: 50 },
      hardPercent:   { type: Number, default: 20 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);