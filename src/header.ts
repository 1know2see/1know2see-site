const PAPER = "#E8E8E3";
const INK = "#080807";

export function initHeaderTone(): void {
  const header = document.querySelector<HTMLElement>(".site-header");
  const zones = [...document.querySelectorAll<HTMLElement>(".band-ink")];
  if (!header || zones.length === 0) return;
  const theme = document.querySelector('meta[name="theme-color"]');
  const active = new Set<Element>();
  let observer: IntersectionObserver | null = null;

  const paint = (onInk: boolean) => {
    header.classList.toggle("on-ink", onInk);
    if (theme) theme.setAttribute("content", onInk ? INK : PAPER);
  };

  const watch = () => {
    observer?.disconnect();
    active.clear();
    const bar = Math.max(48, Math.ceil(header.getBoundingClientRect().height));
    const strip = 24;
    const bottomCut = Math.max(0, window.innerHeight - bar - strip);
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) active.add(entry.target);
          else active.delete(entry.target);
        }
        paint(active.size > 0);
      },
      { rootMargin: `-${bar}px 0px -${bottomCut}px 0px`, threshold: [0, 0.01] },
    );
    zones.forEach((zone) => observer?.observe(zone));
  };

  watch();
  const resize = new ResizeObserver(() => watch());
  resize.observe(header);
  window.addEventListener("resize", watch);
}
