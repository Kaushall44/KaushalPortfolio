import { useState } from 'react';
import { PhotoPrivacy, FileInspector, UnicodeLens } from './PrivacyTools';
import { FiLink, FiHash, FiImage, FiEye, FiFileText } from 'react-icons/fi';
import { cleanUrl, parseWebUrl, sha256 } from '../../utils/toolbox';

function Result({ value }: { value: string }) {
  const [copied, setCopied] = useState('');
  return <div className="tool-result"><pre tabIndex={0}>{value || 'Your result will appear here.'}</pre>{value && <button onClick={async () => {
    try { await navigator.clipboard.writeText(value); setCopied('Copied.'); } catch { setCopied('Copy unavailable. Select the result to copy it manually.'); }
  }}>Copy result</button>}<span role="status">{copied}</span></div>;
}
function useResult() {
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => string | Promise<string>) => {
    setError(''); setResult(''); setBusy(true);
    try { setResult(await fn()); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to complete this action.'); } finally { setBusy(false); }
  };
  return { run, busy, output: <><p className="tool-error" role="alert">{error}</p><Result key={result} value={result} /></> };
}
function TextInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (s: string) => void; placeholder?: string }) {
  return <label>{label}<textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} spellCheck={false} maxLength={100000} /></label>;
}
function Links() {
  const [url, setUrl] = useState('');
  const { run, busy, output } = useResult();
  return <><TextInput label="Website URL" value={url} onChange={setUrl} placeholder="https://example.com/page?utm_source=newsletter" />
    <div className="tool-actions">
      <button disabled={busy} onClick={() => run(() => cleanUrl(url))}>Remove tracking parameters</button>
      <button disabled={busy} onClick={() => run(() => { const u = parseWebUrl(url); return `Protocol: ${u.protocol}\nHostname: ${u.hostname}\nPath: ${u.pathname}\nQuery parameters: ${Array.from(u.searchParams.keys()).join(', ') || 'None'}\nInternationalized hostname: ${u.hostname.includes('xn--') ? 'Yes (punycode)' : 'No'}\n\nThis inspects the URL only; it does not visit or certify the destination.`; })}>Inspect URL</button>
      <button disabled={busy || !url.trim()} onClick={() => run(async () => {
        parseWebUrl(url);
        const response = await fetch('/api/shorten', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: url.trim() }), signal: AbortSignal.timeout(15000) });
        const data = await response.json();
        if (!response.ok || !data.shorturl) throw new Error(data.error || 'Shortening is unavailable. Please try again later.');
        return data.shorturl;
      })}>{busy ? 'Working…' : 'Shorten with is.gd'}</button>
    </div><p className="tool-note">Cleaning and inspection stay in your browser. Shortening sends the entered URL to is.gd to create a public link. Avoid private or signed URLs. Removing tracking parameters may affect some links; check the result before sharing.</p>{output}</>;
}
function Hashes() {
  const [text, setText] = useState('');
  const { run, busy, output } = useResult();
  return <><TextInput label="Text to hash" value={text} onChange={setText} /><button disabled={busy} onClick={() => run(() => sha256(text))}>Calculate SHA-256</button>
    <label>Or choose a file (up to 10 MB)<input type="file" disabled={busy} onChange={e => {
      const file = e.target.files?.[0];
      if (file) void run(async () => { if (file.size > 10 * 1024 * 1024) throw new Error('Choose a file no larger than 10 MB.'); return sha256(await file.arrayBuffer()); });
      e.target.value = '';
    }} /></label><p className="tool-note">Files are read locally and never uploaded. Compare the checksum with a trusted reference to detect changes; a hash is not a malware scan.</p>{output}</>;
}
const tools = [
  { name: 'Link Lab', category: 'Daily life', description: 'Clean, inspect, and shorten links.', Icon: FiLink, Component: Links },
  { name: 'Checksum Studio', category: 'Security', description: 'SHA-256 for text and local files.', Icon: FiHash, Component: Hashes },
  { name: 'Photo Privacy Studio', category: 'Daily life', description: 'Remove photo metadata, resize, and compress.', Icon: FiImage, Component: PhotoPrivacy },
  { name: 'File Identity Inspector', category: 'Security', description: 'Compare file signatures with extensions.', Icon: FiFileText, Component: FileInspector },
  { name: 'Unicode Lens', category: 'Security', description: 'Reveal invisible text and direction controls.', Icon: FiEye, Component: UnicodeLens },
];
export default function Tools() {
  const [active, setActive] = useState(0);
  const ActiveTool = tools[active].Component;
  return <section id="tools" className="toolbox" aria-labelledby="tools-title">
    <p className="toolbox-eyebrow">SMALL TOOLS. EVERYDAY PROBLEMS.</p><h1 id="tools-title">The <span className="orange">Toolbox.</span></h1>
    <p className="toolbox-intro">A few useful things, built for your browser. Pick a tool and get straight to it.</p>
    <div className="toolbox-layout"><div className="toolbox-menu" role="tablist" aria-label="Choose a tool">{tools.map((tool, i) => <button key={tool.name} id={`tool-tab-${i}`} role="tab" tabIndex={i === active ? 0 : -1} aria-selected={i === active} aria-controls="tool-panel" onClick={() => setActive(i)} onKeyDown={event => {
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? tools.length - 1 : ['ArrowRight', 'ArrowDown'].includes(event.key) ? (i + 1) % tools.length : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? (i + tools.length - 1) % tools.length : null;
      if (next !== null) { event.preventDefault(); setActive(next); document.getElementById(`tool-tab-${next}`)?.focus(); }
    }}>
      <tool.Icon aria-hidden="true" /><span><small>{tool.category}</small><strong>{tool.name}</strong><span>{tool.description}</span></span>
    </button>)}</div><div id="tool-panel" className="toolbox-panel" role="tabpanel" aria-labelledby={`tool-tab-${active}`}><h3>{tools[active].name}</h3><ActiveTool key={active} /></div></div>
  </section>;
}
