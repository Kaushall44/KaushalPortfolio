import type { VercelRequest, VercelResponse } from "@vercel/node";
import { NOT_FOUND_MARKDOWN, SITE } from "./_content.js";

/**
 * Catch-all 404 handler.
 *
 * The site is a single-page app with no client-side router, so any path that
 * misses the filesystem is genuinely absent. Serving the app shell with a 200
 * (the Vite preset's default SPA fallback) makes agents believe every path
 * exists, so vercel.json routes unmatched paths here instead and this always
 * answers with a real 404 — as markdown when the client asks for it.
 */
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>404 — Page not found | Kaushal Raj Gupta</title>
<style>
  :root { color-scheme: light dark; }
  body { margin:0; min-height:100vh; display:flex; align-items:center; justify-content:center;
         background:#fff8f4; color:#1a1a2e;
         font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }
  @media (prefers-color-scheme: dark) { body { background:#0a0a1a; color:#f0f0f5; } }
  main { max-width:34rem; padding:2rem; }
  h1 { font-size:clamp(1.75rem,5vw,2.5rem); margin:0 0 .5rem; }
  p { line-height:1.6; opacity:.85; }
  ul { line-height:2; padding-left:1.1rem; }
  a { color:inherit; }
</style>
</head>
<body>
<main>
  <h1>404 — Page not found</h1>
  <p>This path does not exist on kaushalrajgupta.is-a.dev. Try one of these instead:</p>
  <ul>
    <li><a href="/">Homepage</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/developers">Developer portal &amp; API docs</a></li>
    <li><a href="/projects">Projects</a></li>
    <li><a href="/llms.txt">llms.txt</a> — full context for AI agents</li>
    <li><a href="/sitemap.xml">sitemap.xml</a> — every canonical URL</li>
  </ul>
  <p>Canonical pages also respond to <code>Accept: text/markdown</code>. See
     <a href="${SITE}/developers">the developer portal</a>.</p>
</main>
</body>
</html>`;

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Vary", "Accept, User-Agent, Accept-Encoding");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");
  res.setHeader("X-Robots-Tag", "noindex");

  const accept = String(req.headers.accept || "");
  const original = "/" + String(req.query.path || "").replace(/^\/+/, "");

  // Anything under /api answers in JSON — an agent probing the API surface
  // must never have to parse an HTML error page.
  if (original.startsWith("/api/") || original === "/api") {
    res.setHeader("Content-Type", "application/problem+json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(404).json({
      type: "https://kaushalrajgupta.is-a.dev/developers#not_found",
      title: "Endpoint not found",
      status: 404,
      code: "not_found",
      detail: `No API endpoint at ${original}. See the OpenAPI description for the endpoints that exist.`,
      instance: original,
      documentation: "https://kaushalrajgupta.is-a.dev/developers",
      openapi: "https://kaushalrajgupta.is-a.dev/openapi.json",
    });
  }
  if (accept.includes("text/markdown")) {
    res.setHeader("Content-Type", "text/markdown; charset=utf-8");
    return res.status(404).send(NOT_FOUND_MARKDOWN);
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(404).send(HTML);
}
