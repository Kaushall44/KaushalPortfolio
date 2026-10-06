import type { VercelRequest, VercelResponse } from "@vercel/node";
import { renderMarkdown, resolvePage } from "./_content.js";

/**
 * acceptmarkdown.com content negotiation.
 *
 * Reached through the content-negotiation middleware, which
 * pass the original path through as `?path=`. Always sets `Vary: Accept` so a
 * CDN never serves the markdown variant to a browser asking for HTML.
 */
export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Vary", "Accept, User-Agent, Accept-Encoding");

  if (req.method !== "GET" && req.method !== "HEAD") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const raw = (req.query.path as string) || req.url;
  const key = resolvePage(raw);

  if (!key) {
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    return res.status(404).send("# 404 — Not found\n");
  }

  res.setHeader("Content-Type", "text/markdown; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=3600");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("X-Robots-Tag", "noarchive");
  return res.status(200).send(renderMarkdown(key));
}
