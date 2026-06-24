const User = require("../models/User");

const syncUser = async (req, res) => {
  try {
    // ✅ Firebase se verified email/uid lo — body se nahi
    const { email, uid } = req.user;
    const { name, photo } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email, photo, uid });  // uid bhi save karo
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { syncUser };