const express = require("express");
const { syncUser } = require("../controllers/userController");
const verifyToken = require("../middleware/auth");

const router = express.Router();

router.post("/sync", verifyToken, syncUser);

module.exports = router;