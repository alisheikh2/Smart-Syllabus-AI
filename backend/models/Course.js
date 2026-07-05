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
    // Mixed type, since the AI service always returns this as a single object
    studyMaterial: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: String,
      required: true,
    },
    isFallback: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Course", courseSchema);
