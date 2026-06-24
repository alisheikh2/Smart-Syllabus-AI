const express = require("express");
const { syncUser } = require("../controllers/userController");
const verifyToken = require("../middleware/auth");  // ← ADD

const router = express.Router();

router.post("/sync", verifyToken, syncUser);  // ← verifyToken ADD

module.exports = router;