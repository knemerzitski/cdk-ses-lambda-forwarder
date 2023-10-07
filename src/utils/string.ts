export function wrapString(s: string, maxLength: number) {
  if (s.length <= maxLength) return s;

  const lines = [];
  const lineCount = Math.ceil(s.length / maxLength);
  for (let i = 0; i < lineCount; i++) {
    lines.push(s.substring(i * maxLength, (i + 1) * maxLength));
  }
  return lines.join('\n');
}

export function isAsciiString(text: string): boolean {
  for (let i = 0; i < text.length; i++) {
    if (text[i].charCodeAt(0) > 127) return false;
  }
  return true;
}

export function sanitizeFileNameNoExt(str: string, maxLength = 256) {
  return str.replace(/[^\w\d\s_-]/g, '').slice(0, maxLength);
}
