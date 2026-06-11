/* =========================================================
   PRODUCTS SCROLL / REVEAL ANIMATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".products-home-banner");
  const card = document.querySelector(".products-banner-card");

  if (!section || !card) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          section.classList.add("products-in-view");
        }
      });
    },
    {
      threshold: 0.35,
    }
  );

  observer.observe(section);

  function updateParallax() {
    const rect = section.getBoundingClientRect();
    const windowH = window.innerHeight;

    if (rect.bottom < 0 || rect.top > windowH) return;

    const progress = (windowH - rect.top) / (windowH + rect.height);
    const clamped = Math.max(0, Math.min(1, progress));

    const move = (clamped - 0.5) * 36;

    card.style.setProperty("--products-bg-x", `${34 + move * 0.12}%`);
    card.style.setProperty("--products-bg-y", `${50 + move * 0.03}%`);
  }

  updateParallax();

  window.addEventListener("scroll", updateParallax, { passive: true });
  window.addEventListener("resize", updateParallax);
});