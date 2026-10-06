import { mkdir, writeFile } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import * as si from 'react-icons/si';
import { FiShield } from 'react-icons/fi';
import profile from '../src/data/portfolio.json' with { type: 'json' };
const esc = s => s.replaceAll('&','&amp;').replaceAll('<','&lt;');
await mkdir('public/assets/projects',{recursive:true});
await mkdir('public/assets/skills',{recursive:true});
const icons = [
 ['react','React',si.SiReact,'#61dafb'],['nextjs','Next.js',si.SiNextdotjs,'#ffffff'],
 ['typescript','TypeScript',si.SiTypescript,'#60a5fa'],['javascript','JavaScript',si.SiJavascript,'#f7df1e'],
 ['html5','HTML5',si.SiHtml5,'#fb923c'],['css3','CSS3',si.SiCss3,'#60a5fa'],
 ['tailwindcss','Tailwind CSS',si.SiTailwindcss,'#38bdf8'],['nodejs','Node.js',si.SiNodedotjs,'#86efac'],
 ['python','Python',si.SiPython,'#fde68a'],['firebase','Firebase',si.SiFirebase,'#ffca28'],
 ['git','Git',si.SiGit,'#f97316'],['github','GitHub',si.SiGithub,'#ffffff'],
 ['vite','Vite',si.SiVite,'#c4b5fd'],['security','Cybersecurity',FiShield,'#86efac'],
];
for(const [slug,label,Icon,color] of icons){
 const icon=renderToStaticMarkup(createElement(Icon,{size:108,color})).replace('<svg ','<svg x="66" y="42" ');
 await writeFile(`public/assets/skills/${slug}.svg`,`<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240"><title>${label}</title><rect x="4" y="4" width="232" height="232" rx="54" fill="#151823" stroke="#343845" stroke-width="3"/>${icon}<text x="120" y="195" fill="#f8fafc" text-anchor="middle" font-family="Arial,sans-serif" font-size="22" font-weight="600">${label}</text></svg>`);
}
const rect=(x,y,w,h,fill,rx=12)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}"/>`;
const line=(x,y,w,color='#3a4150')=>rect(x,y,w,6,color,3);
function scene(p){
 const c=p.color;
 if(p.motif==='campus') return `${rect(700,103,370,300,'#191e28',20)}${rect(722,126,120,25,c)}${line(722,170,245)}${[0,1,2].map(i=>`${rect(722+i*108,202,94,79,'#252d3b')}${rect(736+i*108,216,21,21,c,6)}${line(736+i*108,258,55)}`).join('')}${[0,1,2].map(i=>line(722,310+i*24,260-i*20,i===0?c:undefined)).join('')}`;
 if(p.motif==='ai') return `<g stroke="${c}" stroke-width="2" opacity=".6"><path d="M880 240L735 150M880 240L1030 150M880 240L735 345M880 240L1030 345"/></g>${[[735,150],[1030,150],[735,345],[1030,345]].map(([x,y])=>`${rect(x-30,y-30,60,60,'#262333',16)}<circle cx="${x}" cy="${y}" r="10" fill="${c}"/>`).join('')}<circle cx="880" cy="240" r="65" fill="#252333" stroke="${c}" stroke-width="2"/><path d="M853 240l19 19 36-40" stroke="${c}" fill="none" stroke-width="8" stroke-linecap="round"/>`;
 if(p.motif==='email') return `${rect(724,113,328,260,'#29221f',20)}${rect(748,138,280,32,c,6)}${line(748,198,192)}${line(748,222,253)}${line(748,246,229)}${rect(748,282,124,39,c,8)}<path d="M918 300h135v87H918z M918 300l67 50 68-50" fill="#141720" stroke="${c}" stroke-width="3"/>`;
 if(p.motif==='movies') return [0,1,2].map(i=>`<g transform="translate(${705+i*120} ${144+Math.abs(i-1)*20}) rotate(${(i-1)*-6} 54 100)">${rect(0,0,108,200,['#3d273a','#472c32','#2f2945'][i],13)}<circle cx="54" cy="80" r="29" fill="${c}" opacity="${.3+i*.2}"/><path d="M44 64l28 16-28 16z" fill="#12151f"/>${line(16,150,75)}${line(16,169,47)}</g>`).join('');
 return `${rect(691,111,379,278,'#151c28',18)}${rect(691,111,379,37,'#2a303d',18)}${[0,1,2].map(i=>`<circle cx="${711+i*18}" cy="130" r="5" fill="${['#fc7e7e','#fde68a','#86efac'][i]}"/>`).join('')}<text x="720" y="193" font-family="monospace" font-size="19" fill="${c}">${p.motif==='editor'?'&lt;Portfolio /&gt;':p.motif==='code'?'$ node ask.js':'$ whoami'}</text>${line(720,223,180,c)}${line(741,253,245)}${line(741,282,210)}${line(720,320,147,c)}`;
}
const ids = new Set();
for(const [i,project] of profile.projects.entries()){
 const p = { color: '#93c5fd', motif: 'code', tagline: 'An experiment in building better tools.', ...project };
 if (!/^[a-z0-9-]+$/.test(p.id) || ids.has(p.id)) throw new Error(`Project needs a unique lowercase slug: ${p.id}`);
 if (!/^#[0-9a-f]{6}$/i.test(p.color)) throw new Error(`Invalid banner color for ${p.id}`);
 if (!['Featured', 'Web Apps', 'Experiments'].includes(p.group)) throw new Error(`Unknown project group for ${p.id}`);
 ids.add(p.id);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600" viewBox="0 0 1200 600"><title>${esc(p.name)} project illustration</title><defs><radialGradient id="glow"><stop stop-color="${p.color}" stop-opacity=".13"/><stop offset="1" stop-color="${p.color}" stop-opacity="0"/></radialGradient><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" stroke="#fff" stroke-opacity=".025" fill="none"/></pattern></defs><rect width="1200" height="600" fill="#10131b"/><rect width="1200" height="600" fill="url(#grid)"/><ellipse cx="910" cy="270" rx="365" ry="350" fill="url(#glow)"/><path d="M640 80v440" stroke="#292d38"/>${rect(62,74,7,36,p.color,3)}<text x="86" y="99" font-family="Arial,sans-serif" font-size="18" letter-spacing="4" fill="${p.color}">KAUSHAL / SELECTED WORK</text><text x="62" y="252" font-family="Arial,sans-serif" font-size="${p.name.length>18?43:53}" font-weight="700" letter-spacing="-2" fill="#f9fafb">${esc(p.name)}</text><text x="64" y="300" font-family="Arial,sans-serif" font-size="21" fill="#a4acba">${esc(p.tagline)}</text><text x="64" y="390" font-family="monospace" font-size="17" fill="${p.color}">${esc(p.technologies.slice(0,3).join('  /  '))}</text>${scene(p)}<path d="M62 482H1138" stroke="#292d38"/><text x="64" y="532" font-family="monospace" font-size="17" fill="#7e889b">${String(i+1).padStart(2,'0')} — ${p.group.toUpperCase()}</text><text x="1136" y="532" text-anchor="end" font-family="monospace" font-size="17" fill="#7e889b">BUILD. LEARN. SECURE.</text></svg>`;
 await writeFile(`public/assets/projects/${p.id}.svg`,svg);
}
await writeFile('public/favicon.svg','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#10131b"/><path d="M18 15v34M43 16L23 32l22 17" fill="none" stroke="#f0732d" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>');
console.log(`Created ${profile.projects.length} original project banners and ${icons.length} skill icons.`);
