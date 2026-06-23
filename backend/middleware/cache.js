// Simple in-memory cache
// Production mein Redis use karo
const cache = new Map();

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCacheKey(type, params) {
  // Sorted JSON so order matter na kare
  return `${type}:${JSON.stringify(
    Object.keys(params).sort().reduce((acc, k) => {
      acc[k] = params[k];
      return acc;
    }, {})
  )}`;
}

function getFromCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  // Expired check
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCache(key, data) {
  // Max 100 entries rakho memory overflow se bachao
  if (cache.size >= 100) {
    // Sabse purani entry delete karo
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

module.exports = { getCacheKey, getFromCache, setCache };