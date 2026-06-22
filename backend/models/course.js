const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
    },
    difficulty: {
      type: String,
    },
    syllabus: {
      type: Array,
      default: [],
    },
    studyMaterial: {
      type: Array,
      default: [],
    },
    createdBy: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);