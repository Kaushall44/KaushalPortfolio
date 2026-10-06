import { writeFile } from 'node:fs/promises';
import profile from '../src/data/portfolio.json' with { type: 'json' };
import { PAGES, LAST_UPDATED } from '../api/_content.js';
const site = profile.url;
export const organization = {
  '@type': 'Organization', '@id': `${site}/#organization`, name: `${profile.name} Portfolio`, url: site,
  description: 'Personal portfolio of Kaushal Raj Gupta.', logo: `${site}/logo512.png`,
  address: { '@type': 'PostalAddress', addressLocality: profile.location.locality, addressRegion: profile.location.region, addressCountry: 'IN' },
  contactPoint: { '@type': 'ContactPoint', contactType: 'Portfolio inquiries', url: profile.links.linkedin, ...(profile.email ? { email: profile.email } : {}) },
  sameAs: [profile.links.github, profile.links.linkedin],
};
export const person = {
  '@type': 'Person', '@id': `${site}/#person`, name: profile.name, alternateName: [profile.shortName, profile.handle],
  description: profile.summary, url: site, image: `${site}/logo512.png`,
  ...(profile.email ? { email: profile.email } : {}),
  sameAs: [profile.links.github, profile.links.linkedin],
  knowsAbout: [...profile.skills.frontend, ...profile.skills.backend],
  memberOf: { '@type': 'CollegeOrUniversity', name: profile.education.university },
};
const esc = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function homepageHead() {
  const page = PAGES['/'];
  const graph = { '@context': 'https://schema.org', '@graph': [organization, person,
    { '@type': 'WebSite', '@id': `${site}/#website`, url: site, name: profile.name, description: page.description, inLanguage: 'en', publisher: { '@id': `${site}/#person` } },
    { '@type': 'ProfilePage', '@id': `${site}/#webpage`, url: site, name: page.title, mainEntity: { '@id': `${site}/#person` } },
    { '@type': 'ItemList', name: 'Selected projects', itemListElement: profile.projects.map((p,i)=>({ '@type': 'ListItem', position: i+1, name: p.name, url: p.repositoryUrl })) },
  ]};
  return `<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(page.title)}</title>
    <meta name="description" content="${esc(page.description)}" />
    <meta name="keywords" content="Kaushal Raj Gupta, Kaushall44, full stack developer, web developer, cybersecurity enthusiast, React, TypeScript, Python, SOA ITER, CampusConnect, SOA Nexus AI, developer portfolio" />
    <meta name="author" content="${esc(profile.name)}" />
    <meta name="theme-color" content="#fff8f4" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${site}/" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/manifest.json" />
    <link rel="llms" type="text/plain" href="/llms.txt" />
    <link rel="alternate" type="text/markdown" href="/index.md" />
    <link rel="help" href="/developers" />
    <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${site}/" />
    <meta property="og:site_name" content="${esc(profile.name)}" />
    <meta property="og:title" content="${esc(page.title)}" />
    <meta property="og:description" content="${esc(page.description)}" />
    <meta property="og:image" content="${site}/og-image.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="Kaushal Raj Gupta — Build. Learn. Secure." />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@kaushall44" />
    <meta name="twitter:title" content="${esc(page.title)}" />
    <meta name="twitter:description" content="${esc(page.description)}" />
    <meta name="twitter:image" content="${site}/og-image.png" />
    <meta name="twitter:image:alt" content="Kaushal Raj Gupta — Build. Learn. Secure." />
    <script>try { if (localStorage.getItem('darkMode') === 'true') document.documentElement.setAttribute('data-theme','dark'); } catch (e) {}</script>
    <style>html,body {margin:0;background:#fff8f4} html[data-theme="dark"],html[data-theme="dark"] body {background:#0a0a1a}</style>
    <script type="application/ld+json">${JSON.stringify(graph).replaceAll('<','\\u003c')}</script>
  </head>`;
}
export async function generateMetadata() {
  await writeFile('public/llms.txt', `# ${profile.name}\n\n> ${profile.headline}\n\n## When to use this site\n\nUse this site for questions about Kaushal Raj Gupta's projects, published skills, education, and selected experience. Do not infer employment, qualifications, or achievements that are not listed. Education is in progress; exploring skills are learning interests.\n\n${PAGES['/'].markdown}\n\n## Interfaces\n\n${site}/openapi.json\n${site}/api/v1/profile\n${site}/api/v1/projects\n${site}/api/v1/skills\n${site}/api/v1/experience\n`);
  await writeFile('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(PAGES).map(p=>`  <url><loc>${site}${p}</loc><lastmod>${LAST_UPDATED}</lastmod></url>`).join('\n')}\n</urlset>\n`);
  await writeFile('public/manifest.json', JSON.stringify({ name: `${profile.name} | Portfolio`, short_name: 'Kaushal', description: profile.headline, start_url: '/', display: 'standalone', theme_color: '#f0732d', background_color: '#fff8f4', icons: [{src:'/logo192.png',sizes:'192x192',type:'image/png'},{src:'/logo512.png',sizes:'512x512',type:'image/png'}] }, null, 2));
  await writeFile('public/.well-known/ai-catalog.json', JSON.stringify({ specVersion:'1.0', host:{displayName:profile.name,identifier:new URL(site).host}, entries: [
    { identifier:'portfolio-context', displayName:'Portfolio context', type:'text/plain',url:site+'/llms.txt',description:'Biography, projects, skills, education, and selected experience.' },
    { identifier:'portfolio-api',displayName:'Portfolio API',type:'application/openapi+json',url:site+'/openapi.json',description:'Read-only structured profile and optional AI chat.' },
    ...Object.entries(PAGES).map(([path,page])=>({identifier:'page-'+(path.slice(1)||'home'),displayName:page.title,type:'text/markdown',url:site+(path==='/'?'/index':path)+'.md',description:page.description})),
  ]},null,2));
}
