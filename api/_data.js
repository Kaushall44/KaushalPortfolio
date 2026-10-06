import profile from '../src/data/portfolio.json' with { type: 'json' };
export const API_VERSION = 'v1';
export const RATE_LIMIT = 60;
export const RATE_WINDOW_SECONDS = 60;
export const PROFILE = {
  ...profile,
  email: profile.email || undefined,
  education: [profile.education],
  experience: profile.experience.map(item => ({ ...item, summary: item.description })),
  availability: { contactUrl: profile.url + '/contact', preferredContact: profile.email ? 'email' : 'LinkedIn' },
  links: { ...profile.links, website: profile.url, llmsTxt: profile.url + '/llms.txt' },
};
export const PROJECTS = profile.projects;

/** Standard headers every JSON API response carries. */
export function apiHeaders(res, { remaining, resetSeconds }) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Vary", "Accept, Accept-Encoding");
  res.setHeader("X-API-Version", API_VERSION);
  // RFC 9239-style rate limit signalling so agents can self-throttle.
  res.setHeader("RateLimit-Limit", String(RATE_LIMIT));
  res.setHeader("RateLimit-Remaining", String(Math.max(0, remaining)));
  res.setHeader("RateLimit-Reset", String(resetSeconds));
  res.setHeader(
    "RateLimit-Policy",
    `${RATE_LIMIT};w=${RATE_WINDOW_SECONDS}`
  );
}

/**
 * RFC 9457 problem detail. Every non-2xx response across /api uses this shape,
 * so an agent can branch on `code` without parsing prose.
 */
export function problem(res, status, code, title, detail, extra = {}) {
  res.setHeader("Content-Type", "application/problem+json; charset=utf-8");
  return res.status(status).json({
    type: `https://kaushalrajgupta.is-a.dev/developers#${code}`,
    title,
    status,
    code,
    detail,
    instance: extra.instance,
    ...extra,
  });
}

const buckets = new Map();

/** Fixed-window limiter shared by the /api/v1 read endpoints. */
export function rateLimit(ip) {
  const now = Date.now();
  const entry = buckets.get(ip);
  if (!entry || now > entry.resetAt) {
    const resetAt = now + RATE_WINDOW_SECONDS * 1000;
    buckets.set(ip, { count: 1, resetAt });
    return { limited: false, remaining: RATE_LIMIT - 1, resetSeconds: RATE_WINDOW_SECONDS };
  }
  entry.count++;
  const resetSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
  return {
    limited: entry.count > RATE_LIMIT,
    remaining: RATE_LIMIT - entry.count,
    resetSeconds,
  };
}

export function clientIp(req) {
  return (
    (req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown"
  );
}
