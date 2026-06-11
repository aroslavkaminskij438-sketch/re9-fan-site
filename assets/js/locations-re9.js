/* =========================================================
   LOCATIONS RE9 STYLE SLIDER
   Плавная лента: активная карточка по центру, соседние сбоку
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("#locations");
  const stage = document.querySelector("#locAlbumStage");
  const track = document.querySelector("#locAlbumTrack");
  const cards = Array.from(document.querySelectorAll(".loc-album-card"));

  const prevBtn = document.querySelector("#locAlbumPrev");
  const nextBtn = document.querySelector("#locAlbumNext");
  const progress = document.querySelector("#locAlbumProgress");

  if (!section || !stage || !track || cards.length === 0) return;

  const AUTOPLAY_TIME = 5000;

  const titles = [
    "Ruined City",
    "Destroyed Hall",
    "Red Isolation Corridor",
    "Medical Room",
    "Dark Corridor"
  ];

  let current = 0;
  let timer = null;
  let locked = false;

  function prepareCards() {
    cards.forEach((card, index) => {
      if (!card.dataset.title) {
        card.dataset.title = titles[index] || card.querySelector("img")?.alt || `Location ${index + 1}`;
      }

      if (!card.querySelector(".loc-card-label")) {
        const label = document.createElement("div");
        label.className = "loc-card-label";
        label.innerHTML = `
          <span>${String(index + 1).padStart(2, "0")}</span>
          <strong>${card.dataset.title}</strong>
        `;
        card.appendChild(label);
      }
    });
  }

  function updateClasses() {
    cards.forEach((card, index) => {
      card.classList.remove("is-active", "is-prev", "is-next");

      if (index === current) {
        card.classList.add("is-active");
      }

      if (index === (current - 1 + cards.length) % cards.length) {
        card.classList.add("is-prev");
      }

      if (index === (current + 1) % cards.length) {
        card.classList.add("is-next");
      }
    });
  }

  function centerActiveCard() {
    const card = cards[current];
    if (!card) return;

    const stageWidth = stage.clientWidth;
    const cardWidth = card.offsetWidth;
    const cardLeft = card.offsetLeft;

    const target = cardLeft - (stageWidth - cardWidth) / 2;

    track.style.transform = `translate3d(${-target}px, 0, 0)`;
  }

  function updateProgress() {
    if (!progress) return;

    const part = 100 / cards.length;

    progress.style.width = `${part}%`;
    progress.style.transform = `translate3d(${current * 100}%, -50%, 0)`;

    progress.classList.remove("is-timing");
    void progress.offsetWidth;
    progress.classList.add("is-timing");
  }

  function setActive(index) {
    if (locked) return;

    locked = true;
    current = (index + cards.length) % cards.length;

    updateClasses();

    requestAnimationFrame(() => {
      centerActiveCard();
      updateProgress();
    });

    window.setTimeout(() => {
      locked = false;
    }, 850);
  }

  function next() {
    setActive(current + 1);
  }

  function prev() {
    setActive(current - 1);
  }

  function startAutoplay() {
    stopAutoplay();

    timer = window.setInterval(() => {
      next();
    }, AUTOPLAY_TIME);
  }

  function stopAutoplay() {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  if (nextBtn) {
    nextBtn.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        next();
        restartAutoplay();
      },
      true
    );
  }

  if (prevBtn) {
    prevBtn.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        prev();
        restartAutoplay();
      },
      true
    );
  }

  cards.forEach((card, index) => {
    card.addEventListener("click", () => {
      setActive(index);
      restartAutoplay();
    });
  });

  window.addEventListener("resize", () => {
    centerActiveCard();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoplay();
    } else {
      startAutoplay();
    }
  });

  prepareCards();
  setActive(0);
  startAutoplay();
});