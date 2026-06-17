import crypto from 'crypto';
import { allStateSlugs } from '@/data/states';

/**
 * Sanitize user input by stripping HTML tags and trimming whitespace
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[a-z]+;/gi, '') // Remove HTML entities
    .trim()
    .slice(0, 1000); // Limit length
}

/**
 * Validate that a slug corresponds to a known US state
 */
export function validateStateSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') return false;
  const sanitized = slug.toLowerCase().trim();
  return allStateSlugs.includes(sanitized);
}

/**
 * Validate test type
 */
export function validateTestType(type: string): type is 'permit' | 'drivers' | 'motorcycle' {
  return ['permit', 'drivers', 'motorcycle'].includes(type);
}

/**
 * Hash an IP address using SHA-256 for privacy
 */
export function hashIP(ip: string): string {
  return crypto
    .createHash('sha256')
    .update(ip + (process.env.IP_HASH_SALT || 'dmv-salt'))
    .digest('hex');
}

/**
 * Extract the real client IP from the request, considering proxies
 */
export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    // Take the first IP in the chain (the original client)
    const firstIP = forwardedFor.split(',')[0].trim();
    if (isValidIP(firstIP)) return firstIP;
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP && isValidIP(realIP)) return realIP;

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP && isValidIP(cfConnectingIP)) return cfConnectingIP;

  return '0.0.0.0';
}

/**
 * Basic IP address validation
 */
function isValidIP(ip: string): boolean {
  // IPv4
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 (simplified)
  const ipv6Regex = /^[0-9a-fA-F:]+$/;

  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.');
    return parts.every((part) => parseInt(part) <= 255);
  }

  return ipv6Regex.test(ip) && ip.length <= 45;
}

/**
 * Generate a CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Validate API key
 */
export function validateApiKey(providedKey: string | null): boolean {
  const expectedKey = process.env.SCRAPE_API_KEY;
  if (!expectedKey || !providedKey) return false;

  // Use timing-safe comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(providedKey),
      Buffer.from(expectedKey)
    );
  } catch {
    return false;
  }
}
