import assert from 'node:assert/strict';

const base = process.argv[2] || 'http://127.0.0.1:4173';
const request = path => fetch(new URL(path, base), { signal: AbortSignal.timeout(10000) });
const response = await request('/tools');
assert.equal(response.status, 200, 'Direct /tools navigation must work');
const html = await response.text();
assert.match(html, /<title>Tools \| Kaushal Raj Gupta<\/title>/);
assert.match(html, /Photo Privacy Studio/);
assert.match(html, /File Identity Inspector/);
assert.match(html, /Unicode Lens/);
assert.doesNotMatch(html, /(?:src|href)="[^"\s]*(?:three-|mediapipe-|home-)[^"\s]*\.js"/);
const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"\s]+\.(?:js|css))"/g)].map(match => match[1]);
assert.ok(assets.some(path => /tools-.*\.js$/.test(path)), 'Tools must have its own compiled entry');
for (const asset of new Set(assets)) assert.equal((await request(asset)).status, 200, `Asset missing: ${asset}`);
const homepage = await (await request('/')).text();
assert.doesNotMatch(homepage, /src="[^"\s]*tools-[^"\s]*\.js"/);
console.log('Built /tools route, metadata, independent entry, and referenced assets passed. No 3D or camera preloads.');
console.log('This is an HTTP smoke check, not browser interaction or Vercel middleware verification.');
