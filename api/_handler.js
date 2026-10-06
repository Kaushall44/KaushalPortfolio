import { apiHeaders, clientIp, problem, rateLimit } from "./_data.js";

/**
 * Builds a read-only JSON endpoint with the conventions every /api/v1 route
 * shares: rate-limit signalling on every response, RFC 9457 problem details for
 * every failure, and CDN caching for the success path.
 *
 * @param {(req: import('@vercel/node').VercelRequest) =>
 *   { data: unknown, meta?: unknown } |
 *   { error: { status: number, code: string, title: string, detail: string, extra?: object } }
 * } resolve
 */
export function readOnlyJson(resolve) {
  return function handler(req, res) {
    const { limited, remaining, resetSeconds } = rateLimit(clientIp(req));
    apiHeaders(res, { remaining, resetSeconds });

    if (req.method !== "GET" && req.method !== "HEAD") {
      res.setHeader("Allow", "GET, HEAD");
      return problem(
        res,
        405,
        "method_not_allowed",
        "Method not allowed",
        `This endpoint is read-only. Use GET, not ${req.method}.`
      );
    }

    if (limited) {
      res.setHeader("Retry-After", String(resetSeconds));
      return problem(
        res,
        429,
        "rate_limited",
        "Too many requests",
        `Rate limit exceeded. Retry after ${resetSeconds} seconds.`,
        { retryAfterSeconds: resetSeconds }
      );
    }

    const result = resolve(req);
    if (result.error) {
      const { status, code, title, detail, extra } = result.error;
      return problem(res, status, code, title, detail, extra);
    }

    res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600");
    return res.status(200).json({
      apiVersion: "v1",
      data: result.data,
      ...(result.meta ? { meta: result.meta } : {}),
    });
  };
}
