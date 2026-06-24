const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

// ── Per-user AI call limiter ──────────────────
// Har user: max 10 AI requests per 15 minutes
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // max 10 requests per window
  keyGenerator: (req, res) => {
    // ✅ Token se aayi email use karo (verifyToken middleware ke baad)
    if (req.user?.email) {
      return req.user.email;
    }
    // Fallback: IPv6-safe IP key generator
    return ipKeyGenerator(req.ip);
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message:
        "You've made too many requests. Please wait 15 minutes before trying again.",
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Global IP limiter (bot protection) ───────
const globalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,             // max 60 requests per minute per IP
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
});

module.exports = { aiLimiter, globalLimiter };