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

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function dayStamp(input: string): { iso: string; label: string } {
  const day = input.trim().slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return { iso: "", label: input.trim() };
  return { iso: day, label: day.replaceAll("-", ".") };
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
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "22");
  svg.setAttribute("height", "22");
  svg.setAttribute("fill", "none");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M5 12h14M13 6l6 6-6 6");
  path.setAttribute("stroke", "currentColor");
  path.setAttribute("stroke-width", "1.5");
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

export function refreshWorkLabels(root: ParentNode): void {
  root.querySelectorAll<HTMLElement>(".piece-link[data-label-zh]").forEach(applyRowLabel);
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

  projects.forEach((project, index) => {
    const item = element("li", "piece reveal");
    item.dataset.projectId = project.id;
    const href = KNOWN_LINKS[project.name];
    const row = href ? element("a", "piece-link") : element("div", "piece-link");
    if (row instanceof HTMLAnchorElement && href) {
      row.href = href;
      row.target = "_blank";
      row.rel = "noopener noreferrer";
      row.dataset.labelZh = `${project.name}，在新标签页打开接口`;
      row.dataset.labelEn = `${project.name}, open the API in a new tab`;
      applyRowLabel(row);
    }

    const main = element("span", "piece-main");
    main.append(element("h3", "piece-title", project.name));
    const description = element("span", "piece-desc");
    const gloss = KNOWN_ZH[project.name];
    if (project.description && gloss) {
      const english = element("span", "en", project.description);
      english.lang = "en";
      description.append(element("span", "zh", gloss), english);
    } else if (project.description) {
      description.append(element("span", "source", project.description));
    }
    main.append(description);

    const meta = element("span", "piece-meta");
    const date = dayStamp(project.created_at);
    const time = element("time", "piece-date", date.label || "—");
    if (date.iso) time.dateTime = date.iso;
    const status = element("span", "status");
    const knownStatus = STATUS_TEXT[project.status];
    if (knownStatus) {
      const english = element("span", "en", knownStatus.en);
      english.lang = "en";
      status.append(element("span", "zh", knownStatus.zh), english);
    } else if (project.status) {
      status.append(element("span", "source", project.status));
    }
    meta.append(time, status);

    const go = element("span", "piece-go");
    go.setAttribute("aria-hidden", "true");
    if (href) go.append(arrowIcon());

    row.append(element("span", "piece-index", pad(index + 1)), main, meta, go);
    item.append(row);
    list.append(item);
  });
}
