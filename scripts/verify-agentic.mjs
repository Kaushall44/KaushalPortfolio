/**
 * Verifies the agent-readiness contract against a live deployment.
 *
 *   npm run verify:agentic                       # checks https://kaushalrajgupta.is-a.dev
 *   npm run verify:agentic -- https://host       # checks a preview deployment
 *
 * Exits non-zero if any check fails, so it can gate a deploy.
 */
const BASE = (process.argv[2] || "https://kaushalrajgupta.is-a.dev").replace(/\/+$/, "");

let passed = 0;
const failures = [];

function check(name, ok, detail) {
  if (ok) {
    passed++;
    console.log(`  \x1b[32mPASS\x1b[0m  ${name}`);
  } else {
    failures.push(`${name} — ${detail}`);
    console.log(`  \x1b[31mFAIL\x1b[0m  ${name}\n        ${detail}`);
  }
}

const get = (path, headers = {}) =>
  fetch(`${BASE}${path}`, { headers, redirect: "follow" });

console.log(`\nVerifying agent readiness of ${BASE}\n`);

// 1. Real 404s for unknown paths (no soft-404 app shell).
for (const path of ["/definitely-not-a-real-path-9f3a", "/about/nope", "/api/nope"]) {
  const res = await get(path);
  check(`404: ${path} returns HTTP 404`, res.status === 404, `got ${res.status}`);
}

// 2. The 404 body points agents at the machine-readable index.
{
  const body = await (await get("/definitely-not-a-real-path-9f3a")).text();
  check(
    "404 body links to sitemap and llms.txt",
    body.includes("llms.txt") && body.includes("sitemap.xml"),
    "body did not mention llms.txt and sitemap.xml"
  );

  const md = await get("/definitely-not-a-real-path-9f3a", {
    Accept: "text/markdown",
  });
  check(
    "404 negotiates markdown",
    md.status === 404 &&
      (md.headers.get("content-type") || "").includes("text/markdown"),
    `got ${md.status} ${md.headers.get("content-type")}`
  );
}

// 3. Homepage has real content without JavaScript.
{
  const html = await (await get("/")).text();
  const text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  check("Homepage raw HTML has an <h1>", /<h1[\s>]/i.test(html), "no <h1> found");
  check(
    "Homepage raw HTML has 500+ chars of text",
    text.length >= 500,
    `only ${text.length} chars`
  );
}

// 4. acceptmarkdown.com content negotiation on canonical pages.
for (const path of ["/", "/about", "/contact", "/privacy", "/developers"]) {
  const res = await get(path, { Accept: "text/markdown" });
  const ct = res.headers.get("content-type") || "";
  const vary = res.headers.get("vary") || "";
  check(
    `markdown negotiation: ${path}`,
    res.ok && ct.includes("text/markdown"),
    `got ${res.status} content-type="${ct}"`
  );
  check(
    `Vary: Accept on ${path}`,
    /\baccept\b/i.test(vary),
    `vary="${vary || "none"}"`
  );
}

// 5. HTML variant still wins for browsers, and also advertises Vary.
{
  const res = await get("/about", { Accept: "text/html" });
  check(
    "HTML variant: /about serves HTML",
    (res.headers.get("content-type") || "").includes("text/html"),
    `got ${res.headers.get("content-type")}`
  );
  check(
    "HTML variant: /about sets Vary: Accept",
    /\baccept\b/i.test(res.headers.get("vary") || ""),
    `vary="${res.headers.get("vary") || "none"}"`
  );
}

// 6. Trust anchor pages exist with real content.
for (const path of ["/about", "/contact", "/privacy", "/developers"]) {
  const res = await get(path);
  const text = (await res.text())
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  check(
    `trust anchor: ${path} is 200 with 500+ chars`,
    res.status === 200 && text.length >= 500,
    `status ${res.status}, ${text.length} chars`
  );
}

// 7. Organization schema completeness.
{
  const html = await (await get("/about")).text();
  const blocks = [...html.matchAll(
    /<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi
  )].map((m) => m[1]);
  const nodes = blocks.flatMap((b) => {
    try {
      const parsed = JSON.parse(b);
      return parsed["@graph"] || [parsed];
    } catch {
      return [];
    }
  });
  const org = nodes.find((n) => n && n["@type"] === "Organization");
  check("Organization JSON-LD present", !!org, "no Organization node found");
  check(
    "Organization has contactPoint",
    !!org?.contactPoint,
    "contactPoint missing"
  );
  check(
    "Organization has PostalAddress",
    org?.address?.["@type"] === "PostalAddress",
    "address missing or not a PostalAddress"
  );
}

// 8. Agent instruction / when-to-use guidance.
{
  const res = await get("/llms.txt");
  const body = await res.text();
  check("llms.txt is 200", res.status === 200, `got ${res.status}`);
  check(
    "llms.txt has a when-to-use section",
    /when to use/i.test(body),
    "no 'when to use' heading found"
  );
}

// 9. Markdown via .md URL suffix.
for (const [path, key] of [
  ["/index.md", "/"],
  ["/about.md", "/about"],
  ["/developers.md", "/developers"],
]) {
  const res = await get(path);
  check(
    `.md suffix: ${path} -> markdown`,
    res.ok && (res.headers.get("content-type") || "").includes("text/markdown"),
    `got ${res.status} ${res.headers.get("content-type")} (for ${key})`
  );
}

// 10. Markdown via ?mode=agent and via AI crawler User-Agent.
{
  const modeRes = await get("/?mode=agent");
  check(
    "?mode=agent returns markdown",
    (modeRes.headers.get("content-type") || "").includes("text/markdown"),
    `got ${modeRes.headers.get("content-type")}`
  );

  const botRes = await get("/", { "User-Agent": "GPTBot/1.2" });
  check(
    "AI crawler UA receives markdown",
    (botRes.headers.get("content-type") || "").includes("text/markdown"),
    `got ${botRes.headers.get("content-type")}`
  );

  // A real browser must still get the app, not markdown.
  const browser = await get("/", {
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131 Safari/537.36",
  });
  check(
    "browsers still receive HTML",
    (browser.headers.get("content-type") || "").includes("text/html"),
    `got ${browser.headers.get("content-type")}`
  );
}

// 11. RFC 8288 Link headers and markdown alternate advertisement.
{
  const res = await get("/");
  const link = res.headers.get("link") || "";
  check("Link header present on /", !!link, "no Link header");
  check(
    'Link header advertises a text/markdown alternate',
    /type="?text\/markdown/.test(link),
    `link="${link.slice(0, 120)}"`
  );
  const html = await res.text();
  check(
    "homepage advertises <link rel=alternate type=text/markdown>",
    /rel="alternate"[^>]*type="text\/markdown"|type="text\/markdown"[^>]*rel="alternate"/.test(
      html
    ),
    "no markdown alternate link tag"
  );
}

// 12. robots.txt AI crawler policy.
{
  const body = await (await get("/robots.txt")).text();
  check(
    "robots.txt allows answer-engine crawlers",
    /GPTBot/.test(body) && /ClaudeBot/.test(body) && /PerplexityBot/.test(body),
    "missing GPTBot/ClaudeBot/PerplexityBot directives"
  );
  check(
    "robots.txt restricts training-only crawlers",
    /CCBot/.test(body) && /Bytespider/i.test(body),
    "missing CCBot/Bytespider directives"
  );
  check(
    "robots.txt declares Content-Signal",
    /Content-Signal:/i.test(body),
    "no Content-Signal directive"
  );
}

// 13. Markdown frontmatter metadata.
{
  const body = await (await get("/about.md")).text();
  check(
    "served markdown opens with YAML frontmatter",
    body.startsWith("---\n"),
    `starts with ${JSON.stringify(body.slice(0, 20))}`
  );
  for (const field of ["title:", "description:", "canonical:", "last-updated:"]) {
    check(
      `frontmatter carries ${field}`,
      body.slice(0, 600).includes(field),
      "field missing from frontmatter"
    );
  }
}

// 14. Well-known manifests and API description.
{
  const specs = [
    ["/openapi.json", "openapi"],
    ["/.well-known/ai-catalog.json", "specVersion"],
    ["/.well-known/api-catalog", "linkset"],
  ];
  for (const [path, key] of specs) {
    const res = await get(path);
    let json = null;
    try {
      json = JSON.parse(await res.text());
    } catch {
      /* handled below */
    }
    check(
      `${path} is 200 and valid JSON with "${key}"`,
      res.status === 200 && json && key in json,
      `status ${res.status}, ${json ? `missing ${key}` : "invalid JSON"}`
    );
  }

  const catalogCt =
    (await get("/.well-known/api-catalog")).headers.get("content-type") || "";
  check(
    "api-catalog uses the RFC 9727 linkset content type",
    catalogCt.includes("application/linkset+json"),
    `content-type="${catalogCt}"`
  );

  const auth = await get("/auth.md");
  const authBody = await auth.text();
  check(
    "/auth.md is markdown with real content",
    auth.status === 200 &&
      (auth.headers.get("content-type") || "").includes("text/markdown") &&
      authBody.length > 200,
    `status ${auth.status}, ${auth.headers.get("content-type")}, ${authBody.length} chars`
  );
}

// 15. REST API: typed JSON, rate-limit headers, RFC 9457 errors.
{
  for (const [path, shape] of [
    ["/api/v1/profile", (d) => d.name === "Kaushal Raj Gupta"],
    ["/api/v1/experience", (d) => Array.isArray(d) && d.length > 0],
    ["/api/v1/skills", (d) => Array.isArray(d.frontend)],
    ["/api/v1/projects", (d) => Array.isArray(d) && d.length > 0],
  ]) {
    const res = await get(path);
    let body = null;
    try {
      body = JSON.parse(await res.text());
    } catch {
      /* handled below */
    }
    check(
      `API: GET ${path} returns typed JSON`,
      res.status === 200 &&
        (res.headers.get("content-type") || "").includes("application/json") &&
        body?.apiVersion === "v1" &&
        shape(body.data),
      `status ${res.status}, ct=${res.headers.get("content-type")}`
    );
    check(
      `API: ${path} sends RateLimit headers`,
      res.headers.get("ratelimit-limit") &&
        res.headers.get("ratelimit-remaining") &&
        res.headers.get("ratelimit-policy"),
      `limit=${res.headers.get("ratelimit-limit")} policy=${res.headers.get("ratelimit-policy")}`
    );
  }

  // Query filters.
  const filtered = await (await get("/api/v1/projects?category=ai")).json();
  check(
    "API: ?category=ai filters projects",
    filtered.data.every((p) => p.category === "ai") && filtered.data.length > 0,
    `got ${filtered.data.length} items`
  );

  // Typed error model (RFC 9457).
  const bad = await get("/api/v1/projects?category=nope");
  const badBody = await bad.json();
  check(
    "API: invalid parameter returns RFC 9457 problem+json",
    bad.status === 400 &&
      (bad.headers.get("content-type") || "").includes("application/problem+json") &&
      badBody.code === "invalid_parameter" &&
      Array.isArray(badBody.allowedValues),
    `status ${bad.status}, ct=${bad.headers.get("content-type")}, code=${badBody.code}`
  );

  const missing = await get("/api/v1/does-not-exist");
  const missingCt = missing.headers.get("content-type") || "";
  check(
    "API: unknown /api path returns JSON 404, not HTML",
    missing.status === 404 && missingCt.includes("json"),
    `status ${missing.status}, ct=${missingCt}`
  );

  const wrongMethod = await fetch(`${BASE}/api/v1/profile`, { method: "DELETE" });
  check(
    "API: wrong method returns 405 problem+json",
    wrongMethod.status === 405 &&
      (wrongMethod.headers.get("content-type") || "").includes("problem+json"),
    `status ${wrongMethod.status}`
  );

  // OpenAPI spec describes what actually exists.
  const spec = await (await get("/openapi.json")).json();
  const ops = Object.values(spec.paths).flatMap((p) => Object.values(p));
  check(
    "OpenAPI: every operation has an operationId and description",
    ops.every((o) => o.operationId && o.description),
    `${ops.filter((o) => o.operationId && o.description).length}/${ops.length}`
  );
  check(
    "OpenAPI: declares path versioning",
    spec.servers.some((s) => /\/v\d+$/.test(s.url)),
    `servers: ${spec.servers.map((s) => s.url).join(", ")}`
  );
  check(
    "OpenAPI: documents a deprecation policy",
    /Sunset/i.test(spec.info.description) &&
      /Deprecation/i.test(spec.info.description),
    "no Sunset/Deprecation policy in info.description"
  );
  check(
    "OpenAPI: error responses use a typed Problem schema",
    Object.values(spec.components.responses).every((r) =>
      JSON.stringify(r).includes("#/components/schemas/Problem")
    ),
    "some error response lacks the Problem schema"
  );
}

// 16. Core machine-readable files.
for (const [path, needle] of [
  ["/robots.txt", "Sitemap:"],
  ["/sitemap.xml", "<urlset"],
]) {
  const res = await get(path);
  const body = await res.text();
  check(
    `machine-readable: ${path}`,
    res.status === 200 && body.includes(needle),
    `status ${res.status}, missing ${needle}`
  );
}

console.log(
  `\n${passed} passed, ${failures.length} failed\n` +
    (failures.length ? failures.map((f) => `  · ${f}`).join("\n") + "\n" : "")
);
process.exit(failures.length ? 1 : 0);
