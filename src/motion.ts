import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Resting type stays put. A from-tween only hides a line while that reveal is
 * playing inside the viewport. Load, font swap, and hash jumps refresh the
 * triggers; anything already past the end — or in view with a trigger that
 * never played — is snapped to the end so it cannot stay clipped.
 */
let settleTimer = 0;
let settleNeedsRefresh = false;

function settleReveals(refresh = false): void {
  if (prefersReducedMotion()) return;
  if (refresh) ScrollTrigger.refresh();
  for (const trigger of ScrollTrigger.getAll()) {
    const anim = trigger.animation;
    if (!anim || trigger.vars.scrub) continue;
    const passedStart = trigger.progress > 0;
    const revealing = trigger.isActive && anim.progress() > 0 && anim.progress() < 1;
    if (passedStart && !revealing) anim.progress(1);
  }
}

function scheduleSettle(refresh = false): void {
  settleNeedsRefresh = settleNeedsRefresh || refresh;
  window.clearTimeout(settleTimer);
  settleTimer = window.setTimeout(() => {
    const refreshNow = settleNeedsRefresh;
    settleNeedsRefresh = false;
    settleReveals(refreshNow);
  }, 60);
}

function mountReveal(
  targets: gsap.TweenTarget,
  trigger: Element,
  options: { y?: number; yPercent?: number; duration: number; ease: string; start: string; stagger?: number },
): void {
  const from: gsap.TweenVars = {
    duration: options.duration,
    ease: options.ease,
    immediateRender: false,
    scrollTrigger: {
      trigger,
      start: options.start,
      toggleActions: "play none none none",
    },
  };
  if (options.y != null) from.y = options.y;
  if (options.yPercent != null) from.yPercent = options.yPercent;
  if (options.stagger != null) from.stagger = options.stagger;
  const tween = gsap.from(targets, from);
  if (tween.scrollTrigger && tween.scrollTrigger.progress > 0) tween.progress(1);
}

export function initScrollMotion(): void {
  if (prefersReducedMotion()) return;
  const root = document.documentElement;
  if (root.dataset.motionReady === "true") {
    settleReveals(true);
    return;
  }
  root.dataset.motionReady = "true";

  gsap.utils.toArray<HTMLElement>(".essay-line").forEach((line) => {
    const inner = line.querySelector<HTMLElement>(".line-in");
    if (!inner) return;
    mountReveal(inner, line, { yPercent: 110, duration: 1.05, ease: "power4.out", start: "top 88%" });
  });

  gsap.utils.toArray<HTMLElement>(".reveal").forEach((node) => {
    if (node.closest(".works, .essay")) return;
    mountReveal(node, node, { y: 28, duration: 1, ease: "power3.out", start: "top 88%" });
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

  window.addEventListener("hashchange", () => scheduleSettle(true));
  window.addEventListener("scroll", () => scheduleSettle(false), { passive: true });
  window.addEventListener("load", () => settleReveals(true));
  void document.fonts?.ready.then(() => settleReveals(true));
  window.requestAnimationFrame(() => settleReveals(true));
}

export function bindWorkMotion(list: HTMLElement): void {
  if (prefersReducedMotion()) return;
  ScrollTrigger.getAll().forEach((trigger) => {
    const node = trigger.trigger;
    if (node instanceof Node && (node === list || list.contains(node))) trigger.kill();
  });
  const items = list.querySelectorAll<HTMLElement>(".piece");
  if (!items.length) return;
  mountReveal(items, list, { y: 28, duration: 0.9, ease: "power3.out", start: "top 86%", stagger: 0.08 });
  settleReveals(true);
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
