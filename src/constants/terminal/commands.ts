import {
  DirectoryNode,
  FileSystemNode,
  buildFileSystem,
  resolvePath,
  resolvePathToNode,
} from "./fileSystem";
import { bio, contact, education, experience, skills } from "./portfolioData";
import { cowsayTemplate, nameAscii, neofetchArt } from "./asciiArt";
import { fortunes } from "./fortunes";

// ANSI color helpers
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[1;33m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;
const blue = (s: string) => `\x1b[34m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;

export interface CommandContext {
  args: string[];
  flags: Record<string, string | boolean>;
  currentDirectory: string;
  setDirectory: (dir: string) => void;
  writeln: (text: string) => void;
  write: (text: string) => void;
  clearTerminal: () => void;
  toggleTheme: () => void;
  setMatrixActive: (active: boolean) => void;
  setAiLoading: (loading: boolean) => void;
  enterChatMode: () => void;
  fileSystem: DirectoryNode;
  rawInput: string;
}

interface CommandDefinition {
  name: string;
  description: string;
  execute: (ctx: CommandContext) => void | Promise<void>;
}

function treeNode(
  node: FileSystemNode,
  prefix: string,
  isLast: boolean
): string[] {
  const connector = isLast ? "└── " : "├── ";
  const name =
    node.type === "directory" ? blue(node.name + "/") : node.name;
  const lines: string[] = [`${prefix}${connector}${name}`];
  if (node.type === "directory") {
    const entries = Object.values(node.children);
    entries.forEach((child, i) => {
      const childPrefix = prefix + (isLast ? "    " : "│   ");
      lines.push(...treeNode(child, childPrefix, i === entries.length - 1));
    });
  }
  return lines;
}

const commands: CommandDefinition[] = [
  // === UTILITY ===
  {
    name: "help",
    description: "Show available commands",
    execute: (ctx) => {
      const grouped: Record<string, CommandDefinition[]> = {
        Portfolio: [],
        "File System": [],
        Fun: [],
        Utility: [],
        AI: [],
      };
      const categoryMap: Record<string, string> = {
        about: "Portfolio", skills: "Portfolio", experience: "Portfolio",
        projects: "Portfolio", contact: "Portfolio", resume: "Portfolio",
        education: "Portfolio", socials: "Portfolio", whoami: "Portfolio",
        ls: "File System", cd: "File System", cat: "File System",
        pwd: "File System", tree: "File System",
        neofetch: "Fun", sudo: "Fun", matrix: "Fun", cowsay: "Fun",
        fortune: "Fun", theme: "Fun", ascii: "Fun",
        help: "Utility", clear: "Utility", history: "Utility",
        ai: "AI", chat: "AI",
      };
      for (const cmd of commands) {
        const cat = categoryMap[cmd.name] || "Utility";
        grouped[cat]?.push(cmd);
      }
      ctx.writeln(yellow("Available Commands:"));
      for (const [category, cmds] of Object.entries(grouped)) {
        if (cmds.length === 0) continue;
        ctx.writeln("");
        ctx.writeln(yellow(`  ${category}:`));
        for (const cmd of cmds) {
          ctx.writeln(`    ${green(cmd.name.padEnd(14))} ${cmd.description}`);
        }
      }
      ctx.writeln("");
      ctx.writeln(yellow('Type "ai <message>" to chat with an AI that knows about Kaushal.'));
    },
  },
  {
    name: "clear",
    description: "Clear terminal",
    execute: (ctx) => ctx.clearTerminal(),
  },
  {
    name: "history",
    description: "Show command history",
    execute: (ctx) => {
      ctx.writeln(yellow("Use arrow keys (↑/↓) to navigate command history."));
    },
  },

  // === PORTFOLIO ===
  {
    name: "about",
    description: "Display bio and about info",
    execute: (ctx) => {
      ctx.writeln(yellow(bio.name));
      ctx.writeln(bio.title);
      ctx.writeln("");
      ctx.writeln(bio.summary);
      ctx.writeln("");
      ctx.writeln(`Interests: ${bio.interests.join(", ")}`);
    },
  },
  {
    name: "skills",
    description: "List technical skills",
    execute: (ctx) => {
      ctx.writeln(yellow("Frontend:"));
      ctx.writeln(`  ${skills.frontend.join(", ")}`);
      ctx.writeln("");
      ctx.writeln(yellow("Backend:"));
      ctx.writeln(`  ${skills.backend.join(", ")}`);
      ctx.writeln("");
      ctx.writeln(yellow("Tools & Platforms:"));
      ctx.writeln(`  ${skills.tools.join(", ")}`);
    },
  },
  {
    name: "experience",
    description: "Show work experience",
    execute: (ctx) => {
      for (const exp of experience) {
        ctx.writeln(yellow(`${exp.title} @ ${exp.company}`));
        ctx.writeln(`  ${exp.date}`);
        ctx.writeln(`  ${exp.description}`);
        ctx.writeln("");
      }
    },
  },
  {
    name: "projects",
    description: "List projects (--personal, --web, --experiments)",
    execute: (ctx) => {
      const fs = ctx.fileSystem;
      const projectsDir = resolvePathToNode(fs, "~/projects") as DirectoryNode;
      if (!projectsDir) return;

      const showCategory = (name: string, dir: DirectoryNode) => {
        ctx.writeln(yellow(`  ${name}/`));
        for (const child of Object.values(dir.children)) {
          ctx.writeln(`    ${child.name}`);
        }
      };

      ctx.writeln(yellow("~/projects/"));
      if (ctx.flags.personal) {
        showCategory("personal", projectsDir.children.personal as DirectoryNode);
      } else if (ctx.flags.web) {
        showCategory("web", projectsDir.children.web as DirectoryNode);
      } else if (ctx.flags.experiments) {
        showCategory("experiments", projectsDir.children.experiments as DirectoryNode);
      } else {
        for (const [name, child] of Object.entries(projectsDir.children)) {
          if (child.type === "directory") showCategory(name, child);
        }
      }
    },
  },
  {
    name: "contact",
    description: "Show contact info",
    execute: (ctx) => {
      ctx.writeln(yellow("Contact Information"));
      ctx.writeln(`  Email:    ${contact.email}`);
      ctx.writeln(`  LinkedIn: ${contact.linkedin}`);
      ctx.writeln(`  GitHub:   ${contact.github}`);
    },
  },
  {
    name: "resume",
    description: "Open professional profile",
    execute: (ctx) => {
      ctx.writeln(yellow("Opening LinkedIn profile..."));
      window.open(contact.linkedin, "_blank", "noopener,noreferrer");
    },
  },
  {
    name: "education",
    description: "Show education details",
    execute: (ctx) => {
      ctx.writeln(yellow("Education"));
      ctx.writeln(`  ${education.degree}`);
      ctx.writeln(`  ${education.university}`);
      ctx.writeln(`  Study period: ${education.year} (${education.status})`);
    },
  },
  {
    name: "socials",
    description: "Show social links",
    execute: (ctx) => {
      ctx.writeln(yellow("Social Links"));
      ctx.writeln(`  LinkedIn:  ${contact.linkedin}`);
      ctx.writeln(`  GitHub:    ${contact.github}`);
      ctx.writeln(`  Email:     ${contact.email}`);
    },
  },
  {
    name: "whoami",
    description: "Who are you?",
    execute: (ctx) => {
      ctx.writeln("visitor@kaushal-portfolio");
      ctx.writeln("");
      ctx.writeln("Welcome! You're exploring Kaushal Raj Gupta's portfolio terminal.");
      ctx.writeln(`Type ${green('"help"')} to see what you can do here.`);
    },
  },

  // === FILE SYSTEM ===
  {
    name: "ls",
    description: "List directory contents",
    execute: (ctx) => {
      const target = ctx.args[0]
        ? resolvePath(ctx.currentDirectory, ctx.args[0])
        : ctx.currentDirectory;
      const node = resolvePathToNode(ctx.fileSystem, target);
      if (!node || node.type !== "directory") {
        ctx.writeln(red(`ls: cannot access '${ctx.args[0] || "."}': No such directory`));
        return;
      }
      const entries = Object.entries(node.children).map(([name, child]) => {
        if (child.type === "directory") return blue(name + "/");
        return name;
      });
      if (entries.length === 0) {
        ctx.writeln("(empty directory)");
        return;
      }
      ctx.writeln(entries.join("  "));
    },
  },
  {
    name: "cd",
    description: "Change directory",
    execute: (ctx) => {
      const target = ctx.args[0] || "~";
      const resolved = resolvePath(ctx.currentDirectory, target);
      const node = resolvePathToNode(ctx.fileSystem, resolved);
      if (!node || node.type !== "directory") {
        ctx.writeln(red(`cd: ${target}: No such directory`));
        return;
      }
      ctx.setDirectory(resolved);
    },
  },
  {
    name: "cat",
    description: "Read a file",
    execute: (ctx) => {
      const fileName = ctx.args[0];
      if (!fileName) {
        ctx.writeln(red("cat: missing file operand"));
        return;
      }
      const resolved = resolvePath(ctx.currentDirectory, fileName);
      const node = resolvePathToNode(ctx.fileSystem, resolved);
      if (!node) {
        ctx.writeln(red(`cat: ${fileName}: No such file or directory`));
        return;
      }
      if (node.type === "directory") {
        ctx.writeln(red(`cat: ${fileName}: Is a directory`));
        return;
      }
      for (const line of node.content.split("\n")) {
        ctx.writeln(line);
      }
    },
  },
  {
    name: "pwd",
    description: "Print working directory",
    execute: (ctx) => {
      ctx.writeln(ctx.currentDirectory);
    },
  },
  {
    name: "tree",
    description: "Show directory tree",
    execute: (ctx) => {
      const target = ctx.args[0]
        ? resolvePath(ctx.currentDirectory, ctx.args[0])
        : ctx.currentDirectory;
      const node = resolvePathToNode(ctx.fileSystem, target);
      if (!node || node.type !== "directory") {
        ctx.writeln(red(`tree: '${ctx.args[0] || "."}': Not a directory`));
        return;
      }
      ctx.writeln(blue(node.name + "/"));
      const entries = Object.values(node.children);
      entries.forEach((child, i) => {
        const treeLines = treeNode(child, "", i === entries.length - 1);
        treeLines.forEach((l) => ctx.writeln(l));
      });
    },
  },

  // === FUN / EASTER EGGS ===
  {
    name: "neofetch",
    description: "System info",
    execute: (ctx) => {
      const artLines = neofetchArt.split("\n");
      const infoLines = [
        bold("kaushal@portfolio"),
        "-----------------",
        `${bold("OS:")} Portfolio OS v2.0.26`,
        `${bold("Host:")} kaushalrajgupta.is-a.dev`,
        `${bold("Kernel:")} React 19 + Vite 7`,
        `${bold("Shell:")} TypeScript 5.7`,
        `${bold("DE:")} SCSS + Motion`,
        `${bold("WM:")} Zustand 5`,
        `${bold("Terminal:")} xterm.js`,
        `${bold("CPU:")} B.Tech CSE @ SOA / ITER (2024–2028)`,
        `${bold("GPU:")} Fullstack Developer`,
        `${bold("Memory:")} Always learning`,
        `${bold("Uptime:")} Building with curiosity`,
      ];
      const maxLines = Math.max(artLines.length, infoLines.length);
      for (let i = 0; i < maxLines; i++) {
        const art = green((artLines[i] || "").padEnd(22));
        const info = infoLines[i] || "";
        ctx.writeln(`${art}  ${info}`);
      }
    },
  },
  {
    name: "sudo",
    description: "Run with superuser privileges",
    execute: (ctx) => {
      if (ctx.args.join(" ").toLowerCase() === "hire-me") {
        ctx.writeln(yellow("=== PERMISSION GRANTED ==="));
        ctx.writeln("");
        ctx.writeln("Excellent decision! Kaushal would love to hear from you.");
        ctx.writeln("");
        ctx.writeln(`  Email:    ${green(contact.email)}`);
        ctx.writeln(`  LinkedIn: ${green(contact.linkedin)}`);
        ctx.writeln("");
        ctx.writeln(yellow("Initiating hiring sequence... Done."));
      } else {
        ctx.writeln(red(`sudo: ${ctx.args[0] || ""}: command not found`));
        ctx.writeln(`Did you mean: ${green("sudo hire-me")}?`);
      }
    },
  },
  {
    name: "matrix",
    description: "Enter the Matrix",
    execute: (ctx) => {
      ctx.setMatrixActive(true);
      ctx.writeln(yellow("Entering the Matrix... (press any key to exit)"));
    },
  },
  {
    name: "cowsay",
    description: "ASCII cow says your message",
    execute: (ctx) => {
      const message = ctx.args.join(" ") || "Moo! Hire Kaushal!";
      const result = cowsayTemplate(message);
      for (const line of result.split("\n")) {
        ctx.writeln(line);
      }
    },
  },
  {
    name: "fortune",
    description: "Random programming quote",
    execute: (ctx) => {
      const quote = fortunes[Math.floor(Math.random() * fortunes.length)];
      ctx.writeln("");
      ctx.writeln(quote);
      ctx.writeln("");
    },
  },
  {
    name: "theme",
    description: "Toggle theme (dark/light)",
    execute: (ctx) => {
      ctx.toggleTheme();
      ctx.writeln(yellow("Theme toggled."));
    },
  },
  {
    name: "ascii",
    description: "ASCII art of name",
    execute: (ctx) => {
      for (const line of nameAscii.split("\n")) {
        ctx.writeln(green(line));
      }
    },
  },

  // === AI ===
  {
    name: "ai",
    description: "Enter AI chat mode (or: ai <message> for one-shot)",
    execute: async (ctx) => {
      const message = ctx.args.join(" ");
      if (!message) {
        // Enter persistent chat mode
        ctx.enterChatMode();
        return;
      }
      // One-shot: send a single message with streaming
      await streamAiResponse(ctx, [{ role: "user", content: message }]);
    },
  },
  {
    name: "chat",
    description: "Enter AI chat mode",
    execute: (ctx) => {
      ctx.enterChatMode();
    },
  },
];

// Build registry map
const commandRegistry = new Map<string, CommandDefinition>();
for (const cmd of commands) {
  commandRegistry.set(cmd.name, cmd);
}

export { commandRegistry, commands };

// Input parser
export function parseInput(raw: string): {
  command: string;
  args: string[];
  flags: Record<string, string | boolean>;
} {
  const tokens = raw.trim().split(/\s+/);
  const command = (tokens[0] || "").toLowerCase();
  const args: string[] = [];
  const flags: Record<string, string | boolean> = {};

  for (let i = 1; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.startsWith("--")) {
      const [key, value] = token.slice(2).split("=");
      flags[key] = value || true;
    } else if (token.startsWith("-") && token.length > 1) {
      flags[token.slice(1)] = true;
    } else {
      args.push(token);
    }
  }

  return { command, args, flags };
}

// Cached file system
let cachedFS: ReturnType<typeof buildFileSystem> | null = null;
export function getFileSystem() {
  if (!cachedFS) cachedFS = buildFileSystem();
  return cachedFS;
}

// Streaming AI response helper
export async function streamAiResponse(
  ctx: { write: (text: string) => void; writeln: (text: string) => void; setAiLoading: (v: boolean) => void },
  messages: { role: string; content: string }[]
): Promise<string> {
  ctx.setAiLoading(true);
  let fullResponse = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    });

    if (!res.ok || !res.body) {
      ctx.writeln(red("AI service returned an error."));
      return "";
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let needsNewline = false;

    // Write the AI prefix
    ctx.write(`\x1b[35m`); // magenta for AI

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              done = true;
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                // Handle newlines in content
                const parts = parsed.content.split("\n");
                for (let i = 0; i < parts.length; i++) {
                  if (i > 0) {
                    ctx.write("\r\n");
                    needsNewline = false;
                  }
                  if (parts[i]) {
                    ctx.write(parts[i]);
                    needsNewline = true;
                  }
                }
                fullResponse += parsed.content;
              }
            } catch {
              // skip
            }
          }
        }
      }
    }

    // Reset color and newline
    ctx.write("\x1b[0m");
    if (needsNewline) ctx.write("\r\n");
  } catch {
    ctx.writeln(red("AI service is currently unavailable."));
  } finally {
    ctx.setAiLoading(false);
  }

  return fullResponse;
}
