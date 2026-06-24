const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    uid: {
      type: String,
      unique: true,    // ← Firebase UID unique hoga
      sparse: true,    // ← Purane users ke liye null allow
    },
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