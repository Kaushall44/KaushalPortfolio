export function parseWebUrl(input: string): URL {
  const url = new URL(input.trim());
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('Use a full HTTP or HTTPS URL without embedded credentials.');
  return url;
}
export function cleanUrl(input: string): string {
  const url = parseWebUrl(input);
  for (const key of Array.from(url.searchParams.keys())) {
    if (/^utm_/i.test(key) || /^(fbclid|gclid|dclid|msclkid|mc_cid|mc_eid)$/i.test(key)) url.searchParams.delete(key);
  }
  return url.href;
}
export async function sha256(data: string | ArrayBuffer): Promise<string> {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data;
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
}
