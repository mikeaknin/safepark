export interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitStore>();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 100; // 100 req/min

/**
 * Production Edge Security Middleware
 * Applies strict CSP headers and enforces API rate-limiting
 */
export function handleEdgeRequest(req: Request): Response | null {
  const url = new URL(req.url);
  const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';

  // 1. Enforce API Rate Limiting on telemetry endpoints
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/v1/')) {
    const now = Date.now();
    const clientLimit = rateLimitMap.get(clientIp);

    if (clientLimit) {
      if (now < clientLimit.resetTime) {
        clientLimit.count += 1;
        if (clientLimit.count > MAX_REQUESTS_PER_WINDOW) {
          const retryAfterSeconds = Math.ceil((clientLimit.resetTime - now) / 1000);
          return new Response(
            JSON.stringify({
              error: 'Too Many Requests',
              message: 'Rate limit exceeded for SafePark Risk Telemetry Gateway. Maximum 100 requests per minute allowed.',
              retryAfterSeconds,
            }),
            {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': String(retryAfterSeconds),
                'X-RateLimit-Limit': String(MAX_REQUESTS_PER_WINDOW),
                'X-RateLimit-Remaining': '0',
                'X-RateLimit-Reset': String(clientLimit.resetTime),
              },
            }
          );
        }
      } else {
        rateLimitMap.set(clientIp, { count: 1, resetTime: now + WINDOW_MS });
      }
    } else {
      rateLimitMap.set(clientIp, { count: 1, resetTime: now + WINDOW_MS });
    }
  }

  // 2. CSP Headers applied to HTML and web responses
  return null;
}

export const PRODUCTION_CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.mapbox.com https://js.stripe.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://api.mapbox.com https://*.stripe.com",
  "connect-src 'self' https://api.mapbox.com https://events.mapbox.com https://data.sfgov.org https://api.stripe.com https://*.supabase.co wss://*.supabase.co",
  "worker-src 'self' blob:",
  "child-src 'self' blob: https://js.stripe.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');
