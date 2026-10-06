// Bridge module for cross-tab terminal state transfer.
// Kept separate from Terminal.tsx to avoid breaking lazy-load code splitting.

import type { Terminal as XTerminal } from "@xterm/xterm";

let activeInstance: XTerminal | null = null;

export function registerTerminalInstance(term: XTerminal | null): void {
  activeInstance = term;
}

export function getTerminalBuffer(): string[] | null {
  const term = activeInstance;
  if (!term) return null;

  const buf = term.buffer.active;
  const lines: string[] = [];
  for (let i = 0; i < buf.length; i++) {
    const line = buf.getLine(i);
    if (line) {
      lines.push(line.translateToString(true));
    }
  }
  // Trim trailing empty lines
  while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
    lines.pop();
  }
  return lines;
}
