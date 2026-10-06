import { work } from "../work";
import { bio, contact, education, experience, skills } from "./portfolioData";

export interface FileNode {
  type: "file";
  name: string;
  content: string;
}

export interface DirectoryNode {
  type: "directory";
  name: string;
  children: Record<string, FileSystemNode>;
}

export type FileSystemNode = FileNode | DirectoryNode;

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function buildProjectFiles(
  projects: typeof work[number]
): Record<string, FileNode> {
  const files: Record<string, FileNode> = {};
  for (const project of projects) {
    const slug = slugify(project.modalData.title);
    const fileName = `${slug}.txt`;
    const modalData = project.modalData as { title: string; desc: string; infoArr?: string[] };
    const techLine = modalData.infoArr
      ? `\nTechnologies: ${modalData.infoArr.join(", ")}`
      : "";
    const desc = project.modalData.desc.replace(/<[^>]*>/g, "");
    const links: string[] = [];
    if (project.cardData.url) {
      if ("githubUrl" in project.cardData.url && project.cardData.url.githubUrl)
        links.push(`GitHub: ${project.cardData.url.githubUrl}`);
      if (
        "youtubeUrl" in project.cardData.url &&
        project.cardData.url.youtubeUrl
      )
        links.push(`YouTube: ${project.cardData.url.youtubeUrl}`);
    }
    if (project.cardData.url?.liveUrl) links.push(`Demo: ${project.cardData.url.liveUrl}`);
    const linksLine = links.length ? `\n${links.join("\n")}` : "";
    files[fileName] = {
      type: "file",
      name: fileName,
      content: `${project.modalData.title}\n${"=".repeat(project.modalData.title.length)}\n${desc}${techLine}${linksLine}`,
    };
  }
  return files;
}

export function buildFileSystem(): DirectoryNode {
  return {
    type: "directory",
    name: "~",
    children: {
      "about.txt": {
        type: "file",
        name: "about.txt",
        content: `${bio.name}\n${"=".repeat(bio.name.length)}\n${bio.title}\n\n${bio.summary}\n\nInterests: ${bio.interests.join(", ")}`,
      },
      "contact.txt": {
        type: "file",
        name: "contact.txt",
        content: `Contact Information\n====================\nEmail:    ${contact.email}\nLinkedIn: ${contact.linkedin}\nGitHub:   ${contact.github}`,
      },
      "socials.txt": {
        type: "file",
        name: "socials.txt",
        content: `Social Links\n==============\nLinkedIn:  ${contact.linkedin}\nGitHub:    ${contact.github}\nEmail:     ${contact.email}`,
      },
      "education.txt": {
        type: "file",
        name: "education.txt",
        content: `Education\n=========\n${education.degree}\n${education.university}\nStudy period: ${education.year} (${education.status})`,
      },
      skills: {
        type: "directory",
        name: "skills",
        children: {
          "frontend.txt": {
            type: "file",
            name: "frontend.txt",
            content: `Frontend Skills\n================\n${skills.frontend.join(", ")}`,
          },
          "backend.txt": {
            type: "file",
            name: "backend.txt",
            content: `Backend Skills\n===============\n${skills.backend.join(", ")}`,
          },
          "tools.txt": {
            type: "file",
            name: "tools.txt",
            content: `Tools & Platforms\n==================\n${skills.tools.join(", ")}`,
          },
        },
      },
      projects: {
        type: "directory",
        name: "projects",
        children: {
          personal: {
            type: "directory",
            name: "personal",
            children: buildProjectFiles(work[0]),
          },
          web: {
            type: "directory",
            name: "web",
            children: buildProjectFiles(work[1]),
          },
          experiments: {
            type: "directory",
            name: "experiments",
            children: buildProjectFiles(work[2]),
          },
        },
      },
      experience: {
        type: "directory",
        name: "experience",
        children: Object.fromEntries(
          experience.map((exp) => {
            const slug = slugify(exp.company);
            const fileName = `${slug}.txt`;
            return [
              fileName,
              {
                type: "file" as const,
                name: fileName,
                content: `${exp.title} @ ${exp.company}\n${"=".repeat(`${exp.title} @ ${exp.company}`.length)}\n${exp.date}\n\n${exp.description}`,
              },
            ];
          })
        ),
      },
    },
  };
}

export function resolvePath(currentDir: string, target: string): string {
  if (!target || target === "~") return "~";
  if (target.startsWith("~/")) return target;
  if (target === "..") {
    const parts = currentDir.split("/");
    parts.pop();
    return parts.length === 0 ? "~" : parts.join("/");
  }
  if (target === ".") return currentDir;
  if (target.startsWith("/")) return "~" + target;

  // Handle multiple ../
  const parts = currentDir.split("/");
  const segments = target.split("/");
  for (const seg of segments) {
    if (seg === "..") {
      if (parts.length > 1) parts.pop();
    } else if (seg !== ".") {
      parts.push(seg);
    }
  }
  return parts.join("/");
}

export function resolvePathToNode(
  root: DirectoryNode,
  path: string
): FileSystemNode | null {
  if (path === "~") return root;
  const parts = path
    .replace(/^~\/?/, "")
    .split("/")
    .filter(Boolean);
  let current: FileSystemNode = root;
  for (const part of parts) {
    if (current.type !== "directory") return null;
    if (!(part in current.children)) return null;
    current = current.children[part];
  }
  return current;
}
