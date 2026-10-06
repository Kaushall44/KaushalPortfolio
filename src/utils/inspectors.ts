export function inspectUnicode(text: string) {
  if (!text) throw new Error('Paste text to inspect.');
  const findings: string[] = [];
  let offset = 0;
  const visible = [...text].map(char => {
    const code = char.codePointAt(0)!;
    const label = `U+${code.toString(16).toUpperCase().padStart(4, '0')}`;
    const suspicious = /[\p{Cf}\p{Zl}\p{Zp}]/u.test(char) || (/[\p{Cc}]/u.test(char) && !['\n', '\r', '\t'].includes(char)) || code === 0xa0 || code === 0x034f;
    if (suspicious) findings.push(`Position ${offset + 1}: ${label} — ${/[\u202a-\u202e\u2066-\u2069]/u.test(char) ? 'direction control' : 'invisible / special spacing'}`);
    offset++;
    return suspicious ? `[${label}]` : char;
  }).join('');
  const scripts = [['Latin', /\p{Script=Latin}/u], ['Cyrillic', /\p{Script=Cyrillic}/u], ['Greek', /\p{Script=Greek}/u]] as const;
  const present = scripts.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  return `Characters: ${[...text].length}\nSelected scripts detected: ${present.join(', ') || 'Other / none'}${present.length > 1 ? '\nMixed scripts: review identifiers for lookalikes.' : ''}\n\n${findings.join('\n') || 'No checked invisible characters found.'}\n\nRevealed text:\n${visible}\n\nThis checks format controls and selected scripts, not the full Unicode confusables database. Legitimate languages and emoji use invisible characters too.`;
}

export function inspectFile(bytes: Uint8Array, name: string, size: number, mime: string) {
  const match = (signature: number[], offset = 0) => signature.every((value, i) => bytes[offset + i] === value);
  let kind = 'Unknown';
  let extensions: string[] = [];
  if (match([0x89,0x50,0x4e,0x47,13,10,26,10])) { kind = 'PNG image'; extensions = ['png']; }
  else if (match([0xff,0xd8,0xff])) { kind = 'JPEG image'; extensions = ['jpg','jpeg']; }
  else if (match([0x47,0x49,0x46,0x38,0x37,0x61]) || match([0x47,0x49,0x46,0x38,0x39,0x61])) { kind = 'GIF image'; extensions = ['gif']; }
  else if (match([0x52,0x49,0x46,0x46]) && match([0x57,0x45,0x42,0x50], 8)) { kind = 'WebP image'; extensions = ['webp']; }
  else if (match([0x25,0x50,0x44,0x46,0x2d])) { kind = 'PDF document'; extensions = ['pdf']; }
  else if (match([0x50,0x4b,3,4]) || match([0x50,0x4b,5,6]) || match([0x50,0x4b,7,8])) { kind = 'ZIP container (possibly Office, EPUB, JAR, or APK)'; extensions = ['zip','docx','xlsx','pptx','epub','jar','apk','odt','ods','odp']; }
  else if (match([0x7f,0x45,0x4c,0x46])) { kind = 'ELF executable / object'; extensions = ['elf','so','o']; }
  else if (match([0x4d,0x5a])) { kind = 'DOS / Windows executable family'; extensions = ['exe','dll','sys','scr']; }
  else if (match([0x1f,0x8b])) { kind = 'GZIP archive'; extensions = ['gz','tgz']; }
  const extension = name.includes('.') ? name.split('.').pop()!.toLowerCase() : '';
  const comparison = !extensions.length ? 'Unsupported signature; no conclusion.' : extensions.includes(extension) ? 'Consistent with a known extension.' : 'Extension differs from the signature family. Review before opening.';
  const hex = Array.from(bytes.slice(0, 32), value => value.toString(16).padStart(2, '0')).join(' ');
  return `File: ${name}\nSize: ${size.toLocaleString()} bytes\nBrowser MIME hint: ${mime || 'Not supplied'}\nDetected family: ${kind}\nExtension: ${extension || 'None'}\n${comparison}\n\nFirst 32 bytes:\n${hex || '(empty)'}\n\nHeader inspection only. Signatures can be forged; this is not a malware scan or full file validation. The file is never executed or uploaded.`;
}
