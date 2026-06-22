const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    photo: {
      type: String,
    },
    role: {
      type: String,
      default: "teacher",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);