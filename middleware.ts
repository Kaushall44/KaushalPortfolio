import { next, rewrite } from "@vercel/edge";

/**
 * Markdown delivery for agents.
 *
 * Three routes to the same markdown, because agents ask in three different ways:
 *   1. `Accept: text/markdown`  — the acceptmarkdown.com convention
 *   2. `/about.md`              — the .md URL-suffix convention
 *   3. `?mode=agent`            — an explicit agent view
 * plus a known AI crawler User-Agent, which gets markdown by default.
 *
 * This has to run in middleware rather than as a `has: accept` rewrite in
 * vercel.json: Vercel resolves the filesystem *before* applying rewrites, so
 * the static index.html for each of these paths always won and the rewrite
 * never fired. Middleware runs ahead of the filesystem.
 *
 * `Vary` covers Accept and User-Agent so a cache never crosses the variants.
 */
export const config = {
  matcher: [
    "/",
    "/about",
    "/contact",
    "/privacy",
    "/developers",
    "/projects",
    "/tools",
    "/tools.md",
    "/index.md",
    "/about.md",
    "/contact.md",
    "/privacy.md",
    "/developers.md",
    "/projects.md",
  ],
};

const NEGOTIABLE = new Set([
  "/",
  "/about",
  "/contact",
  "/privacy",
  "/developers",
  "/projects",
  "/tools",
]);

const VARY = "Accept, User-Agent, Accept-Encoding";

/** Crawlers that feed answer engines — they get markdown by default. */
const AI_BOTS =
  /(GPTBot|OAI-SearchBot|ChatGPT-User|ClaudeBot|Claude-Web|anthropic-ai|PerplexityBot|Perplexity-User|Google-Extended|Applebot-Extended|DeepSeekBot|ora-agent|CCBot|Bytespider|Amazonbot|MistralAI-User|cohere-ai|YouBot|Diffbot)/i;

export default function middleware(request: Request) {
  const url = new URL(request.url);
  const accept = request.headers.get("accept") || "";
  const ua = request.headers.get("user-agent") || "";

  // `/about.md` -> the markdown for `/about`; `/index.md` -> the homepage.
  let path = url.pathname.replace(/\/+$/, "") || "/";
  let suffixed = false;
  if (path.endsWith(".md")) {
    const stem = path.slice(0, -3);
    path = stem === "/index" ? "/" : stem;
    suffixed = true;
  }

  if (!NEGOTIABLE.has(path)) {
    return next({ headers: { Vary: VARY } });
  }

  // A known AI crawler gets markdown regardless of its Accept header — these
  // crawlers send a browser-like "text/html,...;q=0.9,*/*;q=0.8" by default,
  // so gating on Accept would never serve them markdown. Only the UA list
  // triggers this, so real browsers are unaffected.
  const wantsMarkdown =
    suffixed ||
    /\btext\/markdown\b/i.test(accept) ||
    url.searchParams.get("mode") === "agent" ||
    AI_BOTS.test(ua);

  if (!wantsMarkdown) {
    return next({ headers: { Vary: VARY } });
  }

  return rewrite(
    new URL(`/api/markdown?path=${encodeURIComponent(path)}`, request.url),
    { headers: { Vary: VARY } }
  );
}
