import { useEffect, useRef, useState } from 'react';
import { inspectFile, inspectUnicode } from '../../utils/inspectors';

function Output({ value }: { value: string }) {
  const [status, setStatus] = useState('');
  return <div className="tool-result"><pre tabIndex={0}>{value || 'Your inspection will appear here.'}</pre>{value && <button onClick={async () => { try { await navigator.clipboard.writeText(value); setStatus('Copied.'); } catch { setStatus('Select the report to copy it manually.'); } }}>Copy report</button>}<p role="status">{status}</p></div>;
}
export function UnicodeLens() {
  const [text, setText] = useState('');
  const [report, setReport] = useState('');
  return <><p>Reveal hidden characters in copied commands, usernames, or messages without running them.</p><label>Text to inspect<textarea maxLength={20000} value={text} onChange={e => setText(e.target.value)} spellCheck={false} /></label><div className="tool-actions"><button disabled={!text} onClick={() => setReport(inspectUnicode(text))}>Reveal characters</button><button onClick={() => { const demo = 'pay\u200bpal.com | abc\u202etxt | p\u0430ypal'; setText(demo); setReport(inspectUnicode(demo)); }}>Try a hidden-character example</button></div><Output key={report} value={report} /><p className="tool-note">No text is uploaded. Findings are clues, not a phishing verdict. <a href="https://unicode.org/faq/security.html" target="_blank" rel="noreferrer">About Unicode security ↗</a></p></>;
}
export function FileInspector() {
  const [report, setReport] = useState('');
  const [busy, setBusy] = useState(false);
  return <><p>Does that “photo” really start with an image signature? Compare its first bytes with its filename.</p><label>Select any file<input type="file" disabled={busy} onChange={async e => {
    const file = e.target.files?.[0]; e.target.value = ''; if (!file) return;
    setBusy(true); setReport('Reading file header…');
    try { setReport(inspectFile(new Uint8Array(await file.slice(0, 64).arrayBuffer()), file.name, file.size, file.type)); } catch { setReport('Could not read this file. Try selecting it again.'); } finally { setBusy(false); }
  }} /></label><p className="tool-note">Only 64 bytes are read locally, even for large files. Supports PNG, JPEG, GIF, WebP, PDF, ZIP, GZIP, ELF and Windows executable families.</p><Output key={report} value={report} /><p className="tool-note"><a href="https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html#file-signature-validation" target="_blank" rel="noreferrer">Why signatures alone cannot prove safety ↗</a></p></>;
}
export function PhotoPrivacy() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState('image/jpeg');
  const [maxEdge, setMaxEdge] = useState(1920);
  const [quality, setQuality] = useState(85);
  const [output, setOutput] = useState<{ url: string; size: number; width: number; height: number; ext: string } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const objectUrl = useRef('');
  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; URL.revokeObjectURL(objectUrl.current); }, []);
  const reset = () => { URL.revokeObjectURL(objectUrl.current); objectUrl.current = ''; setOutput(null); setError(''); };
  const process = async () => {
    reset(); if (!file) return; setBusy(true);
    let bitmap: ImageBitmap | undefined;
    try {
      if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose a JPEG, PNG, or WebP image.');
      if (file.size > 20 * 1024 * 1024) throw new Error('Choose an image smaller than 20 MB.');
      bitmap = await createImageBitmap(file);
      if (bitmap.width * bitmap.height > 40_000_000) throw new Error('Choose an image below 40 megapixels.');
      const ratio = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * ratio)); canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
      const context = canvas.getContext('2d'); if (!context) throw new Error('Image conversion is unavailable in this browser.');
      if (format === 'image/jpeg') { context.fillStyle = '#fff'; context.fillRect(0,0,canvas.width,canvas.height); }
      context.drawImage(bitmap,0,0,canvas.width,canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(result => result ? resolve(result) : reject(new Error('Export failed. Try PNG.')), format, quality / 100));
      if (!mounted.current) return;
      objectUrl.current = URL.createObjectURL(blob);
      setOutput({ url: objectUrl.current, size: blob.size, width: canvas.width, height: canvas.height, ext: blob.type.split('/')[1] === 'jpeg' ? 'jpg' : blob.type.split('/')[1] });
      canvas.width = 0; canvas.height = 0;
    } catch (e) { if (mounted.current) setError(e instanceof Error ? e.message : 'This image could not be decoded.'); }
    finally { bitmap?.close(); if (mounted.current) setBusy(false); }
  };
  return <><p>Make a fresh image for sharing, resize it, and remove the original embedded camera, timestamp, and GPS metadata.</p><label>JPEG, PNG, or WebP · up to 20 MB<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e => { reset(); setFile(e.target.files?.[0] || null); }} /></label><label>Export format<select disabled={busy} value={format} onChange={e => { reset(); setFormat(e.target.value); }}><option value="image/jpeg">JPEG · smaller photos</option><option value="image/png">PNG · preserve transparency</option><option value="image/webp">WebP · compact images</option></select></label><label>Longest edge<select disabled={busy} value={maxEdge} onChange={e => { reset(); setMaxEdge(Number(e.target.value)); }}>{[1280,1920,2560,4096].map(n => <option key={n} value={n}>{n} pixels</option>)}</select></label>{format !== 'image/png' && <label>Quality: {quality}%<input disabled={busy} type="range" min="40" max="100" value={quality} onChange={e => { reset(); setQuality(Number(e.target.value)); }} /></label>}<button disabled={!file || busy} onClick={process}>{busy ? 'Processing locally…' : 'Create clean image'}</button><p role="alert">{error}</p>{output && <div className="photo-result"><img src={output.url} alt="Processed image preview" /><p>{output.width} × {output.height} · {(output.size / 1024).toFixed(1)} KB (original: {((file?.size || 0) / 1024).toFixed(1)} KB)</p><a href={output.url} download={`clean-image.${output.ext}`}>Download clean image ↓</a></div>}<p className="tool-note">Runs entirely on your device. A new bitmap export omits original metadata; it does not conceal faces, addresses, or other details visible in the image. Animated images become a single frame. JPEG uses a white background.</p></>;
}
