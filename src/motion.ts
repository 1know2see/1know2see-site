import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function initPreloader(onDone: () => void): void {
  const preloader = document.getElementById("preloader");
  const chrome = document.querySelectorAll<HTMLElement>("header, main, footer");
  if (!preloader || prefersReducedMotion()) {
    preloader?.remove();
    onDone();
    return;
  }

  chrome.forEach((node) => node.setAttribute("inert", ""));
  let settled = false;
  let lifted = false;
  let liftTween: gsap.core.Tween | null = null;

  const finish = () => {
    if (settled) return;
    settled = true;
    window.removeEventListener("keydown", onKey);
    const focusedInside = preloader.contains(document.activeElement);
    preloader.remove();
    chrome.forEach((node) => node.removeAttribute("inert"));
    if (focusedInside) document.getElementById("content")?.focus();
    onDone();
  };

  const runLift = (fast: boolean) => {
    if (settled) return;
    if (lifted && liftTween) {
      if (fast) liftTween.timeScale(3);
      return;
    }
    lifted = true;
    liftTween = gsap.to(preloader, {
      yPercent: -100,
      duration: fast ? 0.32 : 0.92,
      ease: "power4.inOut",
      overwrite: "auto",
      onComplete: finish,
    });
  };

  const intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .from(".pl-line", { scaleY: 0, duration: 0.7, stagger: 0.08, transformOrigin: "50% 50%" })
    .from(".pl-mark", { autoAlpha: 0, y: 18, duration: 0.55 }, "-=0.2")
    .from(".pl-zh", { autoAlpha: 0, y: 12, duration: 0.45 }, "-=0.32")
    .to(".pl-line.a", { x: -14, duration: 0.55, ease: "power2.inOut" }, "-=0.05")
    .to(".pl-line.b", { x: 14, duration: 0.55, ease: "power2.inOut" }, "<")
    .to({}, { duration: 0.18 });

  const requestSkip = () => {
    if (settled) return;
    intro.kill();
    runLift(true);
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") requestSkip();
  };

  document.getElementById("pl-skip")?.addEventListener("click", requestSkip);
  document.getElementById("skip-link")?.addEventListener("click", () => {
    intro.kill();
    liftTween?.kill();
    finish();
  });
  window.addEventListener("keydown", onKey);
  window.setTimeout(finish, 6500);

  const fonts = Promise.race([
    (document.fonts?.ready ?? Promise.resolve()).then(() => undefined).catch(() => undefined),
    wait(2400),
  ]);
  void Promise.all([intro.then(), fonts]).then(() => runLift(false));
}

export function initScrollMotion(): void {
  if (prefersReducedMotion()) return;
  const root = document.documentElement;
  if (root.dataset.motionReady === "true") {
    ScrollTrigger.refresh();
    return;
  }
  root.dataset.motionReady = "true";

  const hero = document.querySelector(".hero");
  const lineA = document.querySelector(".sight-line.a");
  const lineB = document.querySelector(".sight-line.b");
  if (hero && lineA && lineB) {
    gsap.to(lineA, {
      x: -28,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.65 },
    });
    gsap.to(lineB, {
      x: 28,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.65 },
    });
  }

  gsap.utils.toArray<HTMLElement>(".reveal").forEach((node) => {
    if (node.closest(".works")) return;
    gsap.from(node, {
      y: 32,
      duration: 1.05,
      ease: "power3.out",
      scrollTrigger: {
        trigger: node,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });
  });

  const works = document.getElementById("works");
  if (works) bindWorkMotion(works);

  document.addEventListener("focusin", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const reveal = target.closest<HTMLElement>(".piece, .reveal");
    if (!reveal) return;
    gsap.to(reveal, { y: 0, duration: 0.35, overwrite: "auto", ease: "power2.out" });
  });

  void document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

export function bindWorkMotion(list: HTMLElement): void {
  if (prefersReducedMotion()) return;
  ScrollTrigger.getAll().forEach((trigger) => {
    const node = trigger.trigger;
    if (node instanceof Node && (node === list || list.contains(node))) trigger.kill();
  });
  const items = list.querySelectorAll<HTMLElement>(".piece");
  if (!items.length) return;
  gsap.from(items, {
    y: 28,
    duration: 0.9,
    stagger: 0.08,
    ease: "power3.out",
    scrollTrigger: {
      trigger: list,
      start: "top 86%",
      toggleActions: "play none none none",
    },
  });
  ScrollTrigger.refresh();
}

export function initFrame(): void {
  const frame = document.querySelector(".frame");
  const paper = document.querySelector(".philosophy");
  if (!(frame instanceof HTMLElement) || !paper) return;
  const observer = new IntersectionObserver(
    (entries) => {
      const onPaper = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.42);
      frame.classList.toggle("on-paper", onPaper);
    },
    { threshold: [0, 0.42, 0.7] },
  );
  observer.observe(paper);
}

export function initScrollSpy(): void {
  const links = [...document.querySelectorAll<HTMLAnchorElement>(".nav a[href^='#']")];
  const sections = links
    .map((link) => document.querySelector<HTMLElement>(link.getAttribute("href") || ""))
    .filter((section): section is HTMLElement => section !== null);
  if (!sections.length) return;

  const ratios = new Map<Element, number>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
      }
      let best: Element | null = null;
      let bestRatio = 0;
      for (const [element, ratio] of ratios) {
        if (ratio > bestRatio) {
          best = element;
          bestRatio = ratio;
        }
      }
      const id = best instanceof HTMLElement ? `#${best.id}` : "";
      for (const link of links) {
        if (id && link.getAttribute("href") === id) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      }
    },
    { rootMargin: "-40% 0px -45% 0px", threshold: [0.1, 0.25, 0.5] },
  );
  sections.forEach((section) => observer.observe(section));
}
