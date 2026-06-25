// In-memory cache for AI generation results.
// Suitable for a single-instance deployment; swap for Redis if scaling horizontally.
const cache = new Map();

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const MAX_CACHE_ENTRIES = 100;

function getCacheKey(type, params) {
  // Keys are sorted before serializing so identical params always produce the same key
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

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCache(key, data) {
  // Evict the oldest entry once the cache hits its size limit
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

module.exports = { getCacheKey, getFromCache, setCache };