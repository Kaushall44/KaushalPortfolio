const buckets = new Map();
const cache = new Map();
let active = 0;
export function validateShortenUrl(value) {
  if (typeof value !== 'string' || value.length > 4096) throw new Error('Enter a URL of at most 4096 characters.');
  const url = new URL(value.trim());
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || !url.hostname.includes('.') || /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname) || /\.(local|localhost|internal)$/.test(url.hostname)) throw new Error('Enter a public HTTP or HTTPS URL without embedded credentials.');
  return url.href;
}
export async function requestShortLink(value, fetcher = fetch) {
  const url = validateShortenUrl(value);
  if (cache.has(url)) return cache.get(url);
  if (active >= 5) throw new Error('The shortening service is busy. Try again shortly.');
  active++;
  try {
    // Only the fixed provider is fetched; submitted destinations are never fetched here.
    const response = await fetcher('https://is.gd/create.php', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ format: 'json', url }), signal: AbortSignal.timeout(8000),
    });
    const data = await response.json();
    if (!response.ok || data.errorcode || typeof data.shorturl !== 'string') throw new Error('The provider could not shorten this URL.');
    const result = new URL(data.shorturl);
    if (result.protocol !== 'https:' || result.hostname !== 'is.gd') throw new Error('Unexpected response from the shortening provider.');
    if (cache.size >= 200) cache.delete(cache.keys().next().value);
    cache.set(url, result.href);
    return result.href;
  } finally { active--; }
}
export async function handleShorten(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  const send = (status, body) => { res.statusCode = status; res.end(JSON.stringify(body)); };
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(405, { error: 'Use POST to shorten a URL.' }); }
  const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0];
  const now = Date.now();
  for (const [key, entry] of buckets) if (entry.until < now) buckets.delete(key);
  if (!buckets.has(ip)) buckets.set(ip, { count: 0, until: now + 60000 });
  const bucket = buckets.get(ip);
  if (++bucket.count > 10) { res.setHeader('Retry-After', '60'); return send(429, { error: 'Too many requests. Try again in one minute.' }); }
  let input;
  try {
    input = req.body;
    if (input === undefined) {
      let raw = '';
      for await (const chunk of req) { raw += chunk; if (Buffer.byteLength(raw) > 8192) return send(413, { error: 'Request is too large.' }); }
      input = JSON.parse(raw);
    } else if (typeof input === 'string') input = JSON.parse(input);
    validateShortenUrl(input?.url);
  } catch { return send(400, { error: 'Enter a valid public HTTP or HTTPS URL (maximum 4096 characters).' }); }
  try { return send(200, { shorturl: await requestShortLink(input.url) }); }
  catch { return send(502, { error: 'The shortening provider is unavailable or rejected this URL. Try again later.' }); }
}
