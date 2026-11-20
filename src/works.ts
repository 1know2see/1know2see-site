import type { Project } from "./api";
import { currentLang } from "./i18n";

const KNOWN_LINKS: Record<string, string> = {
  "1know2see API": "https://api.1know2see.com",
};

const KNOWN_ZH: Record<string, string> = {
  "1know2see API": "我的第一个 Cloudflare Workers 与 D1 项目",
};

const STATUS_TEXT: Record<string, { zh: string; en: string }> = {
  active: { zh: "在运行", en: "Active" },
};

const API_ROUTES: Array<[string, string]> = [
  ["GET", "/projects"],
  ["GET", "/health"],
  ["D1", "database"],
];

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function dayStamp(input: string): { iso: string; label: string } {
  const day = input.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return { iso: "", label: input.trim() };
  return { iso: day, label: day };
}

function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function arrowIcon(): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 16 16");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.setAttribute("fill", "none");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M3 8h10M9 4l4 4-4 4");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "1.4");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");
  svg.append(path);
  return svg;
}

function applyRowLabel(row: HTMLElement): void {
  const lang = currentLang();
  const label = lang === "en" ? row.dataset.labelEn : row.dataset.labelZh;
  if (label) row.setAttribute("aria-label", label);
}

function poster(project: Project, indexLabel: string): HTMLElement {
  const board = element("div", "api-poster");
  const top = element("div", "api-poster-top");
  top.append(element("span", "", indexLabel), element("span", "", project.name === "1know2see API" ? "WORKER" : "WORK"));
  board.append(top);

  if (project.name === "1know2see API") {
    board.append(element("p", "api-poster-word", "API"));
    const routes = element("ul", "api-poster-routes");
    for (const [method, path] of API_ROUTES) {
      const row = element("li");
      row.append(element("span", "", method), element("span", "", path));
      routes.append(row);
    }
    board.append(routes);
  } else {
    board.append(element("p", "api-poster-word api-poster-name", project.name));
  }

  const visual = element("div", "case-visual");
  visual.setAttribute("aria-hidden", "true");
  visual.append(board);
  return visual;
}

export function refreshWorkLabels(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>(".case[data-label-zh]").forEach(applyRowLabel);
}

export function renderWorks(projects: Project[], list: HTMLOListElement): void {
  list.replaceChildren();
  if (projects.length === 0) {
    const item = element("li", "piece piece-empty");
    const copy = element("p", "empty-copy");
    copy.append(element("span", "zh", "接口里还没有公开的作品。"), element("span", "en", "Nothing public is on the API yet."));
    item.append(copy);
    list.append(item);
    return;
  }

  const total = pad(projects.length);
  projects.forEach((project, index) => {
    const item = element("li", "piece");
    item.dataset.projectId = project.id;
    const indexLabel = pad(index + 1);
    const href = KNOWN_LINKS[project.name];
    const row = href ? element("a", "case") : element("div", "case");
    if (row instanceof HTMLAnchorElement && href) {
      row.href = href;
      row.target = "_blank";
      row.rel = "noopener noreferrer";
      row.dataset.labelZh = `${project.name}，在新标签页打开接口`;
      row.dataset.labelEn = `${project.name}, open the API in a new tab`;
      applyRowLabel(row);
    }

    const meta = element("div", "case-meta");
    const indexRow = element("p", "case-index");
    indexRow.append(element("span", "", indexLabel), element("span", "slash", "/"), element("span", "", total));
    const title = element("h3", "case-title", project.name);
    const description = element("p", "case-desc");
    const gloss = KNOWN_ZH[project.name];
    if (project.description && gloss) {
      const english = element("span", "en", project.description);
      english.lang = "en";
      description.append(element("span", "zh", gloss), english);
    } else if (project.description) {
      description.append(element("span", "source", project.description));
    }

    const facts = element("p", "case-facts");
    const status = element("span", "status");
    const knownStatus = STATUS_TEXT[project.status];
    if (knownStatus) {
      const english = element("span", "en", knownStatus.en);
      english.lang = "en";
      status.append(element("span", "zh", knownStatus.zh), english);
    } else if (project.status) {
      status.append(element("span", "source", project.status));
    }
    const date = dayStamp(project.created_at);
    const time = element("time", "", date.label || "—");
    if (date.iso) time.dateTime = date.iso;
    facts.append(status, time);

    const go = element("span", "case-go");
    go.setAttribute("aria-hidden", "true");
    if (href) go.append(arrowIcon());
    meta.append(indexRow, title, description, facts, go);

    row.append(poster(project, indexLabel), meta);
    item.append(row);
    list.append(item);
  });
}
