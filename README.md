# Kaushal Raj Gupta — Portfolio

React 19, TypeScript, and Vite portfolio with a Three.js scene, optional MediaPipe
gesture navigation, an interactive terminal, project windows, and dark/light themes.

## Development

Use Node.js 22.18+ (or Node.js 24).

```sh
npm ci
npm run dev
npm run check
npm run build
```

`npm run build` regenerates static pages, checks the frontend, and writes `dist/`.
`npm run check` checks frontend and server TypeScript plus profile/API consistency.

## Update the portfolio

Edit `src/data/portfolio.json` for identity, contact links, skills, experience, and
projects. Edit `api/_content.js` for page wording. Then run `npm run build:pages`.
Do not edit generated public pages or the homepage static-content block manually.

Project banners are original SVG illustrations generated from the project data,
not screenshots or AI image requests. `npm run dev` and `npm run build` generate
them automatically. After editing projects while the dev server is running, run
`npm run build:artwork` to refresh the banners.

To add a project, append an entry to `projects` in `src/data/portfolio.json`:

```json
{
  "id": "my-new-project",
  "name": "My New Project",
  "group": "Featured",
  "category": "web",
  "tagline": "A short description of the idea.",
  "description": "Explain what it does and what you built.",
  "technologies": ["React", "TypeScript"],
  "repositoryUrl": "https://github.com/Kaushall44/my-new-project",
  "url": "https://your-live-demo.example",
  "color": "#86efac",
  "motif": "code"
}
```

Use a unique lowercase `id`. Groups are `Featured`, `Web Apps`, and `Experiments`.
Banner motifs are `campus`, `ai`, `email`, `movies`, `terminal`, `code`, or `editor`.
Leave `url` empty when there is no live demo. The banner appears at
`public/assets/projects/<id>.svg`; cards, terminal entries, APIs, and generated
pages use the same project data. Project sharing uses the current website origin
and a `#project=<id>` fragment, so it also works on the future domain.

`npm run build:artwork` also regenerates skill icons. The original
monogram and social image can be regenerated with `python scripts/build-brand.py`
(Pillow and Windows Arial fonts required). Generated assets are committed, so Python
is not needed for normal development or deployment.

## Hosting and AI chat

Vercel serves `dist/` plus the `api/` functions and `middleware.ts`. Keep the custom
404 routing: this app has no client-side router. Markdown content negotiation runs
in middleware before static files are served.

Set `OPENAI_API_KEY` only in the server environment to enable optional terminal AI
chat. Never place it under `src/`. The previous owner's analytics configuration has
been removed. No analytics is initialized by the app.

After deployment, run:

```sh
npm run verify:agentic -- https://your-deployment.example
```

The current canonical domain is temporarily `https://kaushalrajgupta.is-a.dev`,
which belongs to the old portfolio. A new `.site` domain is planned; do not deploy
over the old portfolio. Once the full new domain is confirmed,
update the profile, API discovery documents, `robots.txt`, and verification target.

See [personalization notes](docs/PERSONALIZATION.md) for researched sources,
outstanding profile details, and verification limits. Unused template publications,
legacy images, old gesture hooks, and conversion scripts have been removed.

## Toolbox

The standalone `/tools` page includes Link Lab (cleaning, inspection, shortening),
Checksum Studio, Photo Privacy Studio, File Identity Inspector, and Unicode Lens.
It has a separate Vite entry (`src/tools-entry.tsx`), so it does not load the
portfolio's 3D scenes or camera controls. `tools/index.html` is generated from
`api/_content.js` by `npm run build:pages`; do not edit its generated HTML.
Direct navigation and reloads work without an SPA catch-all rewrite.
After building, start `npm run preview` and run
`node scripts/check-tools-page.mjs http://localhost:4173` to check the built route,
asset responses, and separation from 3D/camera bundles. Preview does not emulate
Vercel middleware or serverless APIs; use `npm run dev` for local URL shortening.
Only shortening sends data off-device: `/api/shorten` submits the entered URL to
[is.gd](https://is.gd/apishorteningreference.php). It works in Vite development and
on Vercel, limits requests, and reports provider failures. No provider key is needed.
The other tools use browser APIs and do not store inputs. SHA-256 checksums and
file signatures do not scan files for malware. Photo export creates a new bitmap
without the original embedded metadata; visible personal details remain. Unicode
Lens highlights format controls and selected mixed scripts, not every confusable.

Research informing these tools:

- [ExifTool: metadata and GPS caveats](https://exiftool.org/faq.html)
- [MDN: canvas image export](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)
- [OWASP: file-signature validation limits](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html#file-signature-validation)
- [Unicode: spoofing and confusables](https://unicode.org/faq/security.html)

Window controls use macOS-style traffic lights, hover/focus glyphs, an animated
close and dock minimize/restore, and title-bar double-click to maximize/restore.
Minimizing a maximized window preserves its state. Motion respects reduced-motion
preferences, and the dock supports keyboard restoration.

The interactive design is adapted from the original portfolio by Avi Vashishta:
https://github.com/AVIVASHISHTA29/repository-2024.
