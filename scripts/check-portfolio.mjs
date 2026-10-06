import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import profile from '../src/data/portfolio.json' with { type: 'json' };
import { PAGES, renderMarkdown, resolvePage } from '../api/_content.js';
import { PROFILE, PROJECTS } from '../api/_data.js';
import middleware from '../middleware.ts';
import projects from '../api/v1/projects.ts';
import skills from '../api/v1/skills.ts';
import notfound from '../api/notfound.ts';
const read=p=>readFile(p,'utf8');
assert.equal(PROFILE.name,profile.name);
assert.deepEqual(PROJECTS,profile.projects);
assert.ok(profile.experience.every(role => role.points.length >= 3));
assert.equal(resolvePage('/constructor'),null);
for (const [slug,page] of Object.entries(PAGES)) {
 const path=slug==='/'?'index.html':slug==='/tools'?'tools/index.html':`public${slug}/index.html`;
 const html=await read(path);
 assert.ok(html.includes(page.title.replaceAll('&','&amp;')));
 assert.ok(renderMarkdown(slug).startsWith('---\n'));
 assert.ok(html.includes(profile.name));
 assert.ok(!/Avi Vashishta|Dock\.us|IIIT Delhi|100,000/.test(html));
}
const homepage=await read('index.html');
assert.ok(homepage.includes('el.hidden = true'));
assert.ok(homepage.includes('id="static-content"'));
const structured=JSON.parse(homepage.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
const person=structured['@graph'].find(n=>n['@type']==='Person');
assert.equal(person.name,profile.name);
assert.equal(person.alumniOf,undefined);
assert.equal(person.worksFor,undefined);
for(const p of profile.projects){
 assert.ok(p.repositoryUrl.startsWith(profile.links.github+'/'));
 const svg=await read(`public/assets/projects/${p.id}.svg`);
 assert.ok(svg.includes('<title>'+p.name));
}
for(const name of await readdir('public/assets/skills')) await access('public/assets/skills/'+name);
assert.ok(!(await readdir('public')).includes('blog'));
assert.ok(!(await read('src/index.tsx')).includes('posthog.init'));
for(const path of ['/about','/projects','/tools']) {
 const html=middleware(new Request('https://example.test'+path,{headers:{Accept:'text/html'}}));
 assert.equal(html.headers.get('x-middleware-rewrite'),null);
 const md=middleware(new Request('https://example.test'+path,{headers:{Accept:'text/markdown'}}));
 assert.ok(md.headers.get('x-middleware-rewrite').includes('/api/markdown?path='));
 assert.ok(md.headers.get('vary').includes('User-Agent'));
}
function invoke(handler,query={},method='GET',accept='application/json'){
 const res={headers:{},statusCode:200,setHeader(k,v){this.headers[k.toLowerCase()]=v;return this;},status(s){this.statusCode=s;return this;},json(body){this.body=body;return this;},send(body){this.body=body;return this;}};
 handler({method,query,headers:{accept,'x-forwarded-for':'127.0.0.1'},socket:{}},res);
 return res;
}
assert.ok(invoke(projects,{category:'ai'}).body.data.every(p=>p.category==='ai'));
assert.equal(invoke(projects,{category:'nope'}).statusCode,400);
assert.equal(invoke(projects,{},'DELETE').statusCode,405);
assert.deepEqual(invoke(skills,{group:'tools'}).body.data.tools,profile.skills.tools);
assert.equal(invoke(skills,{group:'nope'}).statusCode,400);
assert.equal(invoke(notfound,{path:'missing'}).statusCode,404);
assert.equal(invoke(notfound,{path:'api/missing'}).body.code,'not_found');
assert.ok(invoke(notfound,{path:'missing'},'GET','text/markdown').body.includes('sitemap.xml'));
const spec=JSON.parse(await read('public/openapi.json'));
assert.deepEqual(spec.paths['/skills'].get.parameters.find(p=>p.name==='group').schema.enum,Object.keys(profile.skills));
console.log('Portfolio checks passed: shared data, generated pages, JSON-LD, project artwork, API filters, errors, 404s, and middleware negotiation.');
