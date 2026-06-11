/* =========================================================
   STORY AUTO STACK SLIDER — SMOOTH VERSION
   Передняя карточка плавно уходит, следующая плавно становится главной
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const stage = document.querySelector("#storyCpStage");
  let cards = Array.from(document.querySelectorAll(".story-cp-card"));
  const dots = Array.from(document.querySelectorAll(".story-cp-dot"));

  if (!stage || cards.length < 2) return;

  const INTERVAL_TIME = 5000;
  const ANIMATION_TIME = 1250;

  const images = cards.map((card) => card.dataset.src).filter(Boolean);

  if (images.length === 0) return;

  let activeIndex = 0;
  let timer = null;
  let isAnimating = false;

  function imageAt(offset) {
    return images[(activeIndex + offset) % images.length];
  }

  function setInitialImages() {
    cards.forEach((card, index) => {
      card.style.backgroundImage = `url("${imageAt(index)}")`;
    });
  }

  function clearCardClasses() {
    cards.forEach((card) => {
      card.classList.remove(
        "is-front",
        "is-mid",
        "is-back",
        "is-dropping"
      );
    });
  }

  function applyStackClasses() {
    clearCardClasses();

    if (cards[0]) cards[0].classList.add("is-front");
    if (cards[1]) cards[1].classList.add("is-mid");
    if (cards[2]) cards[2].classList.add("is-back");
  }

  function restartDotTimer() {
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index === activeIndex);
      dot.classList.remove("is-timing");
    });

    const activeDot = dots[activeIndex];

    if (activeDot) {
      void activeDot.offsetWidth;
      activeDot.classList.add("is-timing");
    }
  }

  function nextStoryImage() {
    if (isAnimating || images.length <= 1) return;

    isAnimating = true;

    const oldFront = cards[0];

    // старая передняя карточка уходит вниз/назад
    oldFront.classList.remove("is-front");
    oldFront.classList.add("is-dropping");

    // следующая карточка плавно становится передней
    if (cards[1]) {
      cards[1].classList.remove("is-mid");
      cards[1].classList.add("is-front");
    }

    // третья карточка плавно становится второй
    if (cards[2]) {
      cards[2].classList.remove("is-back");
      cards[2].classList.add("is-mid");
    }

    setTimeout(() => {
      activeIndex = (activeIndex + 1) % images.length;

      // старую переднюю карточку переносим назад
      cards.push(cards.shift());

      const backCard = cards[cards.length - 1];
      backCard.classList.remove("is-dropping");
      backCard.classList.add("is-back");

      // ей даём следующую картинку для заднего слоя
      backCard.style.backgroundImage = `url("${imageAt(cards.length - 1)}")`;

      applyStackClasses();
      restartDotTimer();

      isAnimating = false;
    }, ANIMATION_TIME);
  }

  function goToImage(index) {
    if (isAnimating || index === activeIndex) return;

    activeIndex = index;

    cards.forEach((card, cardIndex) => {
      card.style.backgroundImage = `url("${imageAt(cardIndex)}")`;
    });

    applyStackClasses();
    restartDotTimer();
    restartAuto();
  }

  function startAuto() {
    stopAuto();
    restartDotTimer();

    timer = setInterval(() => {
      nextStoryImage();
    }, INTERVAL_TIME);
  }

  function stopAuto() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function restartAuto() {
    stopAuto();
    startAuto();
  }

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      goToImage(index);
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAuto();
    } else {
      restartAuto();
    }
  });

  setInitialImages();
  applyStackClasses();
  startAuto();
});