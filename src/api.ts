export const API_BASE = "https://api.1know2see.com";

export type SiteConfig = {
  name: string;
  tagline: string;
  theme: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
};

export type Health = {
  ok: boolean;
  version: string;
};

export type SiteData = {
  config: SiteConfig;
  projects: Project[];
  health: Health;
  source: "live" | "fallback";
};

export const FALLBACK_CONFIG: SiteConfig = {
  name: "1know2see",
  tagline: "Think deeper, see further",
  theme: "dark",
};

export const FALLBACK_PROJECTS: Project[] = [
  {
    id: "1",
    name: "1know2see API",
    description: "My first Cloudflare Workers and D1 project",
    status: "active",
    created_at: "2026-10-25",
  },
];

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value === null || typeof value !== "object") return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseConfig(value: unknown): SiteConfig | null {
  const record = asRecord(value);
  if (!record) return null;
  const name = asString(record.name);
  const tagline = asString(record.tagline);
  if (!name && !tagline) return null;
  return {
    name: name || FALLBACK_CONFIG.name,
    tagline: tagline || FALLBACK_CONFIG.tagline,
    theme: asString(record.theme) || FALLBACK_CONFIG.theme,
  };
}

export function parseProjects(value: unknown): Project[] | null {
  const record = asRecord(value);
  if (!record || !Array.isArray(record.projects)) return null;
  const projects: Project[] = [];
  for (const item of record.projects) {
    const project = asRecord(item);
    if (!project) continue;
    const name = asString(project.name);
    if (!name) continue;
    const id = project.id;
    projects.push({
      id: typeof id === "number" || typeof id === "string" ? String(id) : String(projects.length + 1),
      name,
      description: asString(project.description),
      status: asString(project.status) || "unknown",
      created_at: asString(project.created_at),
    });
  }
  return projects;
}

export function parseHealth(value: unknown): Health {
  const record = asRecord(value);
  if (!record) return { ok: false, version: "" };
  return {
    ok: record.status === "ok",
    version: asString(record.version),
  };
}

export function sameProjects(left: Project[], right: Project[]): boolean {
  if (left.length !== right.length) return false;
  return left.every((project, index) => {
    const other = right[index];
    if (!other) return false;
    return (
      project.name === other.name &&
      project.description === other.description &&
      project.status === other.status &&
      project.created_at.slice(0, 10) === other.created_at.slice(0, 10)
    );
  });
}

async function getJson(path: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(`${API_BASE}${path}`, {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function loadSiteData(timeoutMs = 4000): Promise<SiteData> {
  const signal = AbortSignal.timeout(timeoutMs);
  const [configResult, projectsResult, healthResult] = await Promise.allSettled([
    getJson("/config", signal),
    getJson("/projects", signal),
    getJson("/health", signal),
  ]);

  const config = configResult.status === "fulfilled" ? parseConfig(configResult.value) : null;
  const projects = projectsResult.status === "fulfilled" ? parseProjects(projectsResult.value) : null;
  const health = healthResult.status === "fulfilled" ? parseHealth(healthResult.value) : { ok: false, version: "" };
  const live = config !== null || projects !== null;

  return {
    config: config ?? FALLBACK_CONFIG,
    projects: projects ?? FALLBACK_PROJECTS,
    health,
    source: live ? "live" : "fallback",
  };
}
