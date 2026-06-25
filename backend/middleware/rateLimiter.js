const { rateLimit, ipKeyGenerator } = require("express-rate-limit");

// Per-user limiter for AI generation endpoints — 10 requests per 15-minute window
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req, res) => {
    // Authenticated requests are tracked by email; verifyToken must run before this
    if (req.user?.email) {
      return req.user.email;
    }
    // Unauthenticated fallback, using the IPv6-safe helper
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

// Global IP-based limiter for basic bot/abuse protection — 60 requests per minute
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
});

module.exports = { aiLimiter, globalLimiter };