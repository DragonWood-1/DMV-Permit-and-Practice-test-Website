interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  Array.from(rateLimitStore.entries()).forEach(([key, entry]) => {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  });
}, 5 * 60 * 1000);

/**
 * Rate limit function
 * @param ip - Client IP address
 * @param key - Rate limit key (e.g., 'questions', 'submit')
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
export function rateLimit(
  ip: string,
  key: string,
  limit: number,
  windowMs: number
): boolean {
  const storeKey = `${ip}:${key}`;
  const now = Date.now();

  const entry = rateLimitStore.get(storeKey);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(storeKey, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (entry.count >= limit) {
    return false;
  }

  entry.count++;
  return true;
}

export function getRateLimitInfo(
  ip: string,
  key: string
): { remaining: number; resetTime: number } | null {
  const storeKey = `${ip}:${key}`;
  const entry = rateLimitStore.get(storeKey);

  if (!entry) return null;

  return {
    remaining: Math.max(0, entry.count),
    resetTime: entry.resetTime,
  };
}
