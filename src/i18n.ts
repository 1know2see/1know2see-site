export type Lang = "zh" | "en";

const COPY = {
  home: {
    zh: {
      title: "1know2see — 一只见二",
      description:
        "1know2see，一只见二。Think deeper, see further。个人站：把界面做清楚，把系统做稳，把文字留得住。",
    },
    en: {
      title: "1know2see — Think deeper, see further",
      description:
        "1know2see. Think deeper, see further. A personal site for clear interfaces, steady systems, and words worth staying with.",
    },
  },
  "404": {
    zh: {
      title: "未见 — 1know2see",
      description: "这一页不在视线里。",
    },
    en: {
      title: "Unseen — 1know2see",
      description: "This page is out of sight.",
    },
  },
} as const;

export function currentLang(): Lang {
  return document.documentElement.dataset.lang === "en" ? "en" : "zh";
}

function pageKey(): keyof typeof COPY {
  return document.documentElement.dataset.page === "404" ? "404" : "home";
}

function applyNamedLabels(lang: Lang): void {
  document.querySelectorAll<HTMLElement>("[data-label-zh]").forEach((node) => {
    const label = lang === "en" ? node.dataset.labelEn : node.dataset.labelZh;
    if (label) node.setAttribute("aria-label", label);
  });
}

export function applyLang(lang: Lang): void {
  const root = document.documentElement;
  root.dataset.lang = lang;
  root.lang = lang === "zh" ? "zh-Hans" : "en";
  const copy = COPY[pageKey()][lang];
  document.title = copy.title;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.setAttribute("content", copy.description);
  document.querySelectorAll<HTMLButtonElement>("[data-set-lang]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.setLang === lang));
  });
  applyNamedLabels(lang);
  try {
    localStorage.setItem("1k2s-lang", lang);
  } catch {
    /* private mode */
  }
  document.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
}

export function initI18n(): void {
  applyLang(currentLang());
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>("[data-set-lang]");
    if (!button?.dataset.setLang) return;
    const next: Lang = button.dataset.setLang === "en" ? "en" : "zh";
    if (next !== currentLang()) applyLang(next);
  });
}
