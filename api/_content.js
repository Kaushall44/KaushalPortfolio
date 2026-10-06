import profile from '../src/data/portfolio.json' with { type: 'json' };
export const SITE = profile.url;
export const LAST_UPDATED = '2026-10-06';
const FOOTER = `\n\n---\n\n[Home](${SITE}/) · [About](${SITE}/about) · [Projects](${SITE}/projects) · [Contact](${SITE}/contact) · [Privacy](${SITE}/privacy)\n\nMachine-readable context: ${SITE}/llms.txt · Sitemap: ${SITE}/sitemap.xml · Developer portal: ${SITE}/developers\n`;
const PROJECTS = profile.projects.map(p => `### ${p.name}\n\n${p.description}\n\nBuilt with: ${p.technologies.join(', ')}.\n\n[Source code](${p.repositoryUrl})${p.url ? ` · [Live demo](${p.url})` : ''}`).join('\n\n');
const EXPERIENCE = profile.experience.map(e => `### ${e.title} — ${e.company}\n\n${e.date} · ${e.kind}\n\n${e.points.join('\n\n')}`).join('\n\n');
const SKILLS = Object.entries(profile.skills).map(([group, list]) => `- **${group === 'exploring' ? 'Currently exploring' : group[0].toUpperCase() + group.slice(1)}:** ${list.join(', ')}`).join('\n');
const CONTACT = profile.email ? `[${profile.email}](mailto:${profile.email})` : `[LinkedIn](${profile.links.linkedin})`;
export const PAGES = {
  '/': {
    title: `${profile.name} | ${profile.headline}`,
    description: 'Explore Kaushal Raj Gupta’s web applications, AI projects, skills, and cybersecurity interests. Computer Science student at SOA / ITER, India.',
    markdown: `# ${profile.name}\n\n## ${profile.headline}\n\n${profile.summary}\n\n## Education\n\n${profile.education.degree}, ${profile.education.university} — ${profile.education.institute}. ${profile.education.year}, ${profile.education.status.toLowerCase()}.\n\n## Selected projects\n\n${PROJECTS}\n\n## Skills\n\n${SKILLS}\n\n## Experience\n\n${EXPERIENCE}\n\n## Get in touch\n\nConnect through ${CONTACT}, or explore [my GitHub](${profile.links.github}).${FOOTER}`,
  },
  '/tools': {
    title: `Tools | ${profile.name}`,
    description: 'Private browser tools for cleaner links, photo privacy, file checksums, file signatures, and hidden Unicode characters.',
    markdown: `# The Toolbox\n\nPractical tools for everyday privacy and debugging. Enable JavaScript to use the interactive tools.\n\n- Link Lab: clean tracking parameters, inspect URLs, or explicitly create a public short link through is.gd.\n- Checksum Studio: calculate SHA-256 for text or a local file.\n- Photo Privacy Studio: re-export, resize, and compress images without original embedded metadata.\n- File Identity Inspector: compare known file signatures with filename extensions. This is not a malware scan.\n- Unicode Lens: reveal invisible characters and selected mixed scripts. This is not a complete confusable-character detector.\n\nAll processing stays in your browser except requested URL shortening. [Back to the portfolio](${SITE}/).${FOOTER}`,
  },
  '/about': {
    title: `About ${profile.name}`,
    description: 'Meet Kaushal Raj Gupta: full stack developer, Computer Science student at SOA / ITER, and cybersecurity enthusiast based in India.',
    markdown: `# About ${profile.name}\n\n${profile.summary}\n\nI enjoy turning practical problems into approachable digital tools: helping students organize campus life, making HTML email design easier, and exploring AI-assisted workflows. My public repositories document these experiments and the technologies behind them.\n\n## Education\n\nI am pursuing ${profile.education.degree} at ${profile.education.university}, ${profile.education.institute}. My study period is ${profile.education.year}; the degree is in progress.\n\n## Skills and interests\n\n${SKILLS}\n\nMy interests include ${profile.interests.join(', ')}. Cybersecurity and security operations are active learning areas.\n\n## Selected experience\n\n${EXPERIENCE}\n\n## Find my work\n\nExplore [selected projects](${SITE}/projects), [GitHub](${profile.links.github}), or [LinkedIn](${profile.links.linkedin}) for more context.${FOOTER}`,
  },
  '/projects': {
    title: `Projects | ${profile.name}`,
    description: 'Selected projects by Kaushal Raj Gupta: CampusConnect, SOA Nexus AI, Email Style Adjuster, Kaushal Movies, and developer tools.',
    markdown: `# Selected projects\n\nA collection of web applications, AI experiments, and developer interfaces. Each entry links to its public source repository. SOA Nexus AI is a team prototype; its demo mode is distinct from its optional live backend.\n\n${PROJECTS}${FOOTER}`,
  },
  '/contact': {
    title: `Contact ${profile.name}`,
    description: 'Connect with Kaushal Raj Gupta about web development, AI tools, cybersecurity learning, and project collaboration.',
    markdown: `# Get in touch\n\nHave a project idea, an internship opportunity, or a question about something I have built? I would be happy to connect.\n\n## Contact channels\n\n- Preferred contact: ${CONTACT}\n- GitHub: ${profile.links.github}\n- LinkedIn: ${profile.links.linkedin}\n\n## Start a conversation\n\nTell me a little about yourself and what you are working on. For a collaboration, include the project goal, the kind of contribution you need, and any relevant timeline. For questions about a repository, a link to the project and a clear description of your question are helpful.\n\n## Location\n\nI am based in India, in the Asia/Kolkata time zone (UTC+05:30). I study Computer Science and Engineering at SOA / ITER.\n\nThere is no contact form on this site. The links above take you to external platforms; please avoid sharing passwords, access tokens, or sensitive account information in messages.${FOOTER}`,
  },
  '/privacy': {
    title: `Privacy | ${profile.name}`,
    description: 'How this portfolio handles optional camera controls, browser storage, external resources, and AI chat.',
    markdown: `# Privacy\n\nLast reviewed: ${LAST_UPDATED}. This page describes the features included in this portfolio.\n\n## Camera controls\n\nHand-gesture and head-tracking controls are optional and require browser permission. Camera frames are processed on your device for navigation; this application does not upload or store the camera feed. Disable camera controls when you are finished. The browser may download MediaPipe model assets from external hosts.\n\n## Browser storage\n\nThe site uses browser storage for interface preferences, including your theme and whether you have seen the gesture introduction. You can clear this data through your browser settings. Some interactive features use browser messaging to coordinate portfolio tabs.\n\n## Browser tools\n\nChecksums, photo re-export, file-signature inspection, Unicode inspection, and URL cleaning run locally. Selected files and images are not uploaded. Choosing Shorten sends the URL through /api/shorten to is.gd to create a public link. Avoid private or signed URLs. The server temporarily caches shortening results and IP-based rate-limit counters in memory.\n\n## Optional AI chat\n\nIf the deployment has AI chat configured, messages you submit to the terminal AI assistant are sent to a server endpoint and then to OpenAI to generate a response. Do not include sensitive personal information. The server uses a temporary in-memory IP-based counter for rate limiting. Ordinary terminal commands run locally.\n\n## Analytics and hosting\n\nNo third-party analytics is initialized by this application. The hosting provider may process ordinary request logs for operation and security. External resources, such as fonts and model downloads, and sites opened through project links have their own privacy policies.\n\n## Contact\n\nFor questions about this portfolio, use ${CONTACT}.${FOOTER}`,
  },
  '/developers': {
    title: `Developer Portal | ${profile.name}`,
    description: 'Read-only portfolio APIs, markdown content negotiation, structured data, and integration guidance for Kaushal Raj Gupta’s portfolio.',
    markdown: `# Developer portal\n\nThis portfolio provides human-readable pages and machine-readable representations of the same profile. Start with [llms.txt](${SITE}/llms.txt), [OpenAPI](${SITE}/openapi.json), or [the sitemap](${SITE}/sitemap.xml).\n\n## Read-only API\n\n- GET /api/v1/profile — profile and education\n- GET /api/v1/experience — selected experience\n- GET /api/v1/skills — skills grouped by area\n- GET /api/v1/projects — selected public projects\n\nJSON responses include apiVersion and data. Read endpoints are public and rate-limited to 60 requests per IP per minute per function instance. Responses advertise RateLimit headers. Invalid requests use RFC 9457 problem details. See OpenAPI for supported filters.\n\n## Markdown pages\n\nCanonical pages support Accept: text/markdown, a .md suffix, and ?mode=agent. Known AI crawler user agents also receive markdown. Browser requests continue to receive HTML. Responses vary on Accept and User-Agent. Unknown paths return HTTP 404.\n\n## AI assistant\n\nPOST /api/v1/chat is an optional origin-restricted AI endpoint, limited to 10 requests per IP per minute per function instance. It requires the deployment owner to set OPENAI_API_KEY on the server. See [authentication guidance](${SITE}/auth.md) for request details. Never place API keys in client code.\n\n## URL-shortening tool\n\nPOST /api/shorten accepts a JSON url field and creates a public link through is.gd. It is unauthenticated and limited to 10 requests per IP per minute per function instance. Success returns a shorturl field; failures return an error field with a non-2xx status. This unversioned utility is separate from the read-only v1 API and its problem-detail contract.\n\n## Source accuracy\n\nProjects link to their public repositories. Learning interests are separated from skills, education is marked in progress, and team prototypes are identified as such. Use ${CONTACT} for questions that the published profile does not answer.${FOOTER}`,
  },
};
export function renderMarkdown(slug) {
  const page = PAGES[slug];
  if (!page) return null;
  const yaml = value => JSON.stringify(String(value));
  return ['---', `title: ${yaml(page.title)}`, `description: ${yaml(page.description)}`, `canonical: ${yaml(SITE + (slug === '/' ? '/' : slug))}`, `last-updated: ${yaml(LAST_UPDATED)}`, `author: ${yaml(profile.name)}`, 'language: "en"', '---', '', page.markdown].join('\n');
}
export function resolvePage(path) {
  if (!path) return null;
  const clean = path.split('?')[0].replace(/\/+$/, '') || '/';
  return Object.hasOwn(PAGES, clean) ? clean : null;
}
export const NOT_FOUND_MARKDOWN = `# 404 — Page not found\n\nThis path does not exist on ${SITE}.\n\n- [Homepage](${SITE}/)\n- [Site context](${SITE}/llms.txt)\n- [Sitemap](${SITE}/sitemap.xml)\n- [Developer portal](${SITE}/developers)\n`;
