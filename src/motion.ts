import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function initScrollMotion(): void {
  if (prefersReducedMotion()) return;
  const root = document.documentElement;
  if (root.dataset.motionReady === "true") {
    ScrollTrigger.refresh();
    return;
  }
  root.dataset.motionReady = "true";

  gsap.utils.toArray<HTMLElement>(".essay-line").forEach((line) => {
    const inner = line.querySelector<HTMLElement>(".line-in");
    if (!inner) return;
    gsap.from(inner, {
      yPercent: 110,
      duration: 1.05,
      ease: "power4.out",
      scrollTrigger: {
        trigger: line,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });
  });

  gsap.utils.toArray<HTMLElement>(".reveal").forEach((node) => {
    if (node.closest(".works, .essay")) return;
    gsap.from(node, {
      y: 28,
      duration: 1,
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
    const reveal = target.closest<HTMLElement>(".piece, .reveal, .essay-line");
    if (!reveal) return;
    const inner = reveal.querySelector<HTMLElement>(".line-in");
    gsap.to(inner ?? reveal, { y: 0, yPercent: 0, duration: 0.3, overwrite: "auto", ease: "power2.out" });
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
