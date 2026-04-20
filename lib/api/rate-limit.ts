import { LRUCache } from 'lru-cache';
import { NextRequest } from 'next/server';
import { errorResponse } from './response';

type RateLimitConfig = {
  readonly interval: number; // ms
  readonly maxRequests: number;
};

export function createRateLimiter(config: RateLimitConfig) {
  const cache = new LRUCache<string, readonly number[]>({
    max: 500,
    ttl: config.interval,
  });

  return function rateLimit(req: NextRequest): Response | null {
    const ip =
      req.headers.get('x-forwarded-for') ??
      req.headers.get('x-real-ip') ??
      'unknown';
    const now = Date.now();
    const windowStart = now - config.interval;

    const timestamps = cache.get(ip) ?? [];
    const recentTimestamps = timestamps.filter((t) => t > windowStart);

    if (recentTimestamps.length >= config.maxRequests) {
      return errorResponse(
        'Terlalu banyak permintaan. Sila cuba sebentar lagi.',
        429,
      );
    }

    cache.set(ip, [...recentTimestamps, now]);
    return null; // not rate limited
  };
}
