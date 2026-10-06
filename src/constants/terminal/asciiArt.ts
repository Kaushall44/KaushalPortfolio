export const nameAscii = `
  < KAUSHAL RAJ GUPTA />
  BUILD. LEARN. SECURE.
`;

export const cowsayTemplate = (message: string) => {
  const maxLen = Math.min(message.length, 40);
  const lines: string[] = [];
  for (let i = 0; i < message.length; i += maxLen) {
    lines.push(message.slice(i, i + maxLen));
  }
  const width = Math.max(...lines.map((l) => l.length));
  const border = " " + "_".repeat(width + 2);
  const bottom = " " + "-".repeat(width + 2);

  let bubble: string;
  if (lines.length === 1) {
    bubble = `${border}\n< ${lines[0].padEnd(width)} >\n${bottom}`;
  } else {
    const mid = lines
      .map((l, i) => {
        const pad = l.padEnd(width);
        if (i === 0) return `/ ${pad} \\`;
        if (i === lines.length - 1) return `\\ ${pad} /`;
        return `| ${pad} |`;
      })
      .join("\n");
    bubble = `${border}\n${mid}\n${bottom}`;
  }

  return `${bubble}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
};

export const neofetchArt = `
  +---------+
  |  K / G  |
  |  >_     |
  +---------+
`;
