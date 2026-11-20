import { FALLBACK_PROJECTS, loadSiteData, sameProjects } from "./api";
import { initHeaderTone } from "./header";
import { currentLang, initI18n } from "./i18n";
import { bindWorkMotion, initScrollMotion, initScrollSpy } from "./motion";
import { refreshWorkLabels, renderWorks } from "./works";

function fieldLang(value: string): string {
  return /[\u3400-\u9fff]/.test(value) ? "zh-Hans" : "en";
}

function applyConfig(name: string, tagline: string): void {
  document.querySelectorAll<HTMLElement>("[data-field='tagline']").forEach((node) => {
    if (node.textContent !== tagline) node.textContent = tagline;
    node.lang = fieldLang(tagline);
  });
  document.querySelectorAll<HTMLElement>("[data-field='name']").forEach((node) => {
    if (node.textContent !== name) node.textContent = name;
  });
}

function showHealth(version: string): void {
  const pill = document.getElementById("api-status");
  if (!pill) return;
  const versionNode = pill.querySelector(".api-ver");
  if (versionNode) versionNode.textContent = version ? version.replace(/^v/, "") : "";
  pill.hidden = false;
}

function announceWorks(count: number): void {
  const live = document.getElementById("works-live");
  if (!live) return;
  live.textContent =
    currentLang() === "en" ? `Work updated. ${count} public.` : `作品已更新，共 ${count} 件。`;
}

initI18n();
document.addEventListener("langchange", () => {
  const works = document.getElementById("works");
  if (works) refreshWorkLabels(works);
});

const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());

void document.fonts?.load('900 16px "Schibsted Grotesk"');
void document.fonts?.load('900 16px "Noto Sans SC"');
void document.fonts?.load('400 16px "Schibsted Grotesk"');
void document.fonts?.load('400 16px "Noto Sans SC"');
void document.fonts?.load('400 16px "IBM Plex Mono"');

initHeaderTone();
initScrollSpy();
initScrollMotion();

void loadSiteData().then((data) => {
  applyConfig(data.config.name, data.config.tagline);
  if (data.health.ok) showHealth(data.health.version);
  const works = document.querySelector<HTMLOListElement>("#works");
  if (!works || data.source !== "live" || sameProjects(data.projects, FALLBACK_PROJECTS)) return;
  renderWorks(data.projects, works);
  refreshWorkLabels(works);
  bindWorkMotion(works);
  announceWorks(data.projects.length);
});
