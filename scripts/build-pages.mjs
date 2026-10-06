/**
 * Renders the canonical markdown in api/_content.js into static HTML pages
 * under public/, and injects the no-JS homepage content into index.html.
 *
 * Running this is what keeps the HTML pages, the `Accept: text/markdown`
 * responses and the 404 body all telling the same story — the markdown is the
 * single source, this script is the only thing that writes the HTML.
 *
 * Usage: npm run build:pages   (also runs automatically as part of `npm run build`)
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

import { organization, person, homepageHead, generateMetadata } from './site-metadata.mjs';
import profile from '../src/data/portfolio.json' with { type: 'json' };
import { PAGES, SITE } from "../api/_content.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");

/** Pages that get a generated static HTML file at public/<slug>/index.html. */
const STATIC_PAGES = Object.keys(PAGES).filter(slug => slug !== "/");

const PERSON_ID = `${SITE}/#person`;
const ORG_ID = `${SITE}/#organization`;

/** Organization node — carries contactPoint + address for schema completeness. */
const ORGANIZATION = organization;

const escape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const STYLES = `
  :root { color-scheme: light dark; --bg:#fff8f4; --fg:#1a1a2e; --muted:#5a5a6e; --line:#e6ddd6; --code:#f3ece7; }
  @media (prefers-color-scheme: dark) {
    :root { --bg:#0a0a1a; --fg:#f0f0f5; --muted:#a0a0b5; --line:#23233a; --code:#15152b; }
  }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--fg); line-height:1.65;
         font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
         -webkit-font-smoothing:antialiased; }
  .wrap { max-width:46rem; margin:0 auto; padding:3rem 1.25rem 5rem; }
  nav { display:flex; flex-wrap:wrap; gap:1.25rem; padding-bottom:1.5rem;
        margin-bottom:2.5rem; border-bottom:1px solid var(--line); font-size:.95rem; }
  nav a { color:var(--muted); text-decoration:none; }
  nav a:hover { color:var(--fg); }
  h1 { font-size:clamp(1.9rem,5vw,2.6rem); line-height:1.15; margin:0 0 1.5rem; letter-spacing:-.02em; }
  h2 { font-size:1.35rem; margin:2.75rem 0 .85rem; letter-spacing:-.01em; }
  h3 { font-size:1.1rem; margin:2rem 0 .6rem; }
  p, li { color:var(--fg); }
  a { color:inherit; text-underline-offset:3px; }
  ul, ol { padding-left:1.25rem; }
  li { margin:.35rem 0; }
  hr { border:0; border-top:1px solid var(--line); margin:3rem 0 1.5rem; }
  code { background:var(--code); padding:.15em .4em; border-radius:4px;
         font-family:ui-monospace,SFMono-Regular,Menlo,monospace; font-size:.9em; }
  pre { background:var(--code); padding:1rem; border-radius:8px; overflow-x:auto; }
  pre code { background:none; padding:0; }
  .tablewrap { overflow-x:auto; }
  table { border-collapse:collapse; width:100%; font-size:.93rem; }
  th, td { border:1px solid var(--line); padding:.5rem .7rem; text-align:left; vertical-align:top; }
  footer { margin-top:3rem; padding-top:1.5rem; border-top:1px solid var(--line);
           color:var(--muted); font-size:.9rem; }
`;

const NAV = `<nav>
      <a href="/">Home</a><a href="/about">About</a><a href="/contact">Contact</a>
      <a href="/developers">Developers</a><a href="/projects">Projects</a>
      <a href="/privacy">Privacy</a><a href="/llms.txt">llms.txt</a>
    </nav>`;

/** Wrap markdown tables so wide content scrolls instead of breaking layout. */
function renderMarkdown(md) {
  return marked
    .parse(md, { mangle: false, headerIds: false })
    .replace(/<table>/g, '<div class="tablewrap"><table>')
    .replace(/<\/table>/g, "</table></div>");
}

function pageSchema(slug, page) {
  const url = `${SITE}${slug}`;
  const type = slug === "/privacy" ? "WebPage" : slug === "/contact" ? "ContactPage" : slug === "/about" ? "AboutPage" : "WebPage";
  return {
    "@context": "https://schema.org",
    "@graph": [
      ORGANIZATION,
      person,
      {
        "@type": type,
        "@id": `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        inLanguage: "en-US",
        isPartOf: { "@id": `${SITE}/#website` },
        about: { "@id": PERSON_ID },
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

function renderPage(slug, page) {
  const url = `${SITE}${slug}`;
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escape(page.title)}</title>
    <meta name="description" content="${escape(page.description)}" />
    <link rel="canonical" href="${url}" />
    <meta name="author" content="${profile.name}" />
    <link rel="icon" href="/favicon.ico" />
    <link rel="llms" type="text/plain" href="/llms.txt" title="LLM context about ${profile.name}" />
    <link rel="alternate" type="text/markdown" href="${url}" title="Markdown version (Accept: text/markdown)" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${escape(page.title)}" />
    <meta property="og:description" content="${escape(page.description)}" />
    <meta property="og:image" content="${SITE}/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${profile.name} — Build. Learn. Secure." />
    <meta property="og:site_name" content="${profile.name}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escape(page.title)}" />
    <meta name="twitter:description" content="${escape(page.description)}" />
    <meta name="twitter:image" content="${SITE}/og-image.png" />
    <meta name="twitter:image:alt" content="${profile.name} — Build. Learn. Secure." />
    <script type="application/ld+json">
${JSON.stringify(pageSchema(slug, page), null, 2)}
    </script>
    <style>${STYLES}</style>
  </head>
  <body>
    <div class="wrap">
    ${NAV}
    <main>
${renderMarkdown(page.markdown)}
    </main>
    <footer>
      <p>${profile.name} — India · <a href="${profile.links.linkedin}">Connect on LinkedIn</a></p>
      <p>Agents: start at <a href="/llms.txt">/llms.txt</a>. This page is also available as markdown via <code>Accept: text/markdown</code>.</p>
    </footer>
    </div>
  </body>
</html>
`;
}

const START = "<!-- BEGIN:static-content -->";
const END = "<!-- END:static-content -->";

/**
 * Inject the homepage markdown as real HTML into index.html so crawlers and
 * no-JS clients get an H1 and full prose. An inline script hides it the moment
 * JS is available, so the React app's visual design is untouched.
 */
async function injectHomepage() {
  const file = join(ROOT, "index.html");
  const html = (await readFile(file, "utf8")).replace(/<head>[\s\S]*?<\/head>/, () => homepageHead());

  const block = `${START}
    <style>
      #static-content { max-width: 46rem; margin: 0 auto; padding: 3rem 1.25rem 4rem;
        font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        line-height: 1.65; color: #1a1a2e; }
      html[data-theme="dark"] #static-content { color: #f0f0f5; }
      #static-content pre { overflow-x: auto; }
      #static-content[hidden] { display: none !important; }
    </style>
    <div id="static-content">
${renderMarkdown(PAGES["/"].markdown)}
      <p><a href="/about">About</a> · <a href="/contact">Contact</a> ·
         <a href="/developers">Developers</a> · <a href="/projects">Projects</a> ·
         <a href="/privacy">Privacy</a> · <a href="/llms.txt">llms.txt</a></p>
    </div>
    <script>
      // Progressive enhancement: no-JS clients and crawlers keep the prose
      // above; with JS the React app takes over, so hide it immediately.
      (function () {
        var el = document.getElementById("static-content");
        el.hidden = true;
        el.style.display = "none";
      })();
    </script>
    ${END}`;

  // Re-runs are idempotent: replace an existing block, otherwise insert one
  // above the React mount point. Only a missing anchor is an error.
  let next;
  if (html.includes(START)) {
    next = html.replace(new RegExp(`${START}[\\s\\S]*?${END}`), () => block);
  } else if (html.includes('<div id="root"></div>')) {
    next = html.replace(
      '<div id="root"></div>',
      `${block}\n    <div id="root"></div>`
    );
  } else {
    throw new Error(
      'index.html: no injection point — expected the static-content markers or <div id="root"></div>'
    );
  }
  await writeFile(file, next);
  console.log("  index.html (homepage no-JS content)");
}

console.log("Generating static pages from api/_content.js:");
for (const slug of STATIC_PAGES) {
  const page = PAGES[slug];
  if (!page) throw new Error(`No content defined for ${slug}`);
  if (slug === '/tools') {
    const dir = join(ROOT, 'tools');
    await mkdir(dir, { recursive: true });
    const html = renderPage(slug, page).replace(/<style>[\s\S]*?<\/style>/, style => `<noscript>${style}</noscript>`).replace('<body>', '<body><div id="root"></div><script type="module" src="/src/tools-entry.tsx"></script><noscript>').replace('</body>', '</noscript></body>');
    await writeFile(join(dir, 'index.html'), html);
    continue;
  }
  const dir = join(PUBLIC, slug.slice(1));
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "index.html"), renderPage(slug, page));
  console.log(`  public${slug}/index.html`);
}
await injectHomepage();
await generateMetadata();
console.log("Done.");
