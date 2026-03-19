/**
 * Rate Limiting & DoS Protection
 *
 * Implements per-IP throttling with configurable limits for different endpoints.
 * Logs violations to Sentry for monitoring and alerting.
 */

import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export interface RateLimitConfig {
  /** Maximum requests allowed in the window */
  maxRequests: number;
  /** Time window in seconds */
  windowSeconds: number;
  /** Optional: Custom error message */
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (per-server instance)
// For production scaling, replace with Redis/Vercel KV
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Extract client IP from request headers
 * Works with Vercel, Cloudflare, and direct connections
 */
export function getClientIP(request: NextRequest): string {
  // Try various headers in order of preference
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwarded.split(',')[0].trim();
  }

  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback (should not happen in production)
  return 'unknown';
}

/**
 * Check if request is within rate limit
 * Returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = rateLimitStore.get(identifier);

  // If no entry or window expired, create new entry
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(identifier, entry);
  }

  // Increment counter
  entry.count++;

  // Check if over limit
  const allowed = entry.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - entry.count);

  return {
    allowed,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Rate limit middleware for Next.js API routes
 * Usage:
 *
 * export async function POST(request: NextRequest) {
 *   const rateLimitResult = await rateLimit(request, { maxRequests: 10, windowSeconds: 60 });
 *   if (rateLimitResult) return rateLimitResult; // Rate limited
 *
 *   // ... handle request
 * }
 */
export async function rateLimit(
  request: NextRequest,
  config: RateLimitConfig
): Promise<NextResponse | null> {
  const ip = getClientIP(request);
  const endpoint = new URL(request.url).pathname;
  const identifier = `${ip}:${endpoint}`;

  const result = checkRateLimit(identifier, config);

  // Add rate limit headers to all responses
  const headers = {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetAt).toISOString(),
  };

  if (!result.allowed) {
    // Log to Sentry
    Sentry.captureMessage(`Rate limit exceeded: ${ip} on ${endpoint}`, {
      level: 'warning',
      tags: {
        type: 'rate_limit',
        endpoint,
        ip,
      },
      extra: {
        maxRequests: config.maxRequests,
        windowSeconds: config.windowSeconds,
        resetAt: new Date(result.resetAt).toISOString(),
      },
    });

    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);

    return NextResponse.json(
      {
        error: config.message || 'Too many requests. Please try again later.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          ...headers,
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  return null; // Not rate limited
}

/**
 * Predefined rate limit configurations for different endpoint types
 */
export const RateLimitPresets = {
  /** Strict limit for expensive operations (calculator, bulk imports) */
  STRICT: {
    maxRequests: 10,
    windowSeconds: 60, // 10 requests per minute
  } as RateLimitConfig,

  /** Standard limit for regular API endpoints */
  STANDARD: {
    maxRequests: 60,
    windowSeconds: 60, // 60 requests per minute
  } as RateLimitConfig,

  /** Generous limit for lightweight endpoints (health checks, metadata) */
  GENEROUS: {
    maxRequests: 120,
    windowSeconds: 60, // 120 requests per minute
  } as RateLimitConfig,

  /** Very strict for public/unauthenticated endpoints prone to abuse */
  PUBLIC_CALCULATOR: {
    maxRequests: 5,
    windowSeconds: 300, // 5 requests per 5 minutes
    message: 'Too many calculations. Please wait before trying again.',
  } as RateLimitConfig,
};

/**
 * Verify hCaptcha token server-side
 */
export async function verifyHCaptcha(token: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET_KEY;

  if (!secret) {
    console.warn('HCAPTCHA_SECRET_KEY not configured');
    return false;
  }

  try {
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `response=${token}&secret=${secret}`,
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('hCaptcha verification failed:', error);
    Sentry.captureException(error, {
      tags: { type: 'captcha_verification' },
    });
    return false;
  }
}
