const ROOT_MARGIN = "0px 0px -10% 0px";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isBelowTheFold(element) {
  return element.getBoundingClientRect().top >= window.innerHeight;
}

function reveal(element) {
  element.classList.remove("is-pending");
  element.classList.add("is-revealed");
}

export function initReveal() {
  if (!("IntersectionObserver" in window) || prefersReducedMotion()) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      observer.unobserve(entry.target);
    });
  }, { rootMargin: ROOT_MARGIN });

  document.querySelectorAll("[data-reveal]").forEach((element) => {
    if (!isBelowTheFold(element)) return;

    element.classList.add("is-pending");
    observer.observe(element);
  });
}
