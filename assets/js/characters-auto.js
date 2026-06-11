/* =========================================================
   CHARACTERS AUTO SWITCH + IMAGE SWITCH
   Каждые 5 секунд переключает сначала картинки персонажа,
   потом переходит к следующему персонажу
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector("#characters");
  const thumbs = Array.from(document.querySelectorAll(".re-char-thumb"));

  const nextImgBtn = document.querySelector("#capChNextImg");
  const prevImgBtn = document.querySelector("#capChPrevImg");

  if (!section || thumbs.length === 0) return;

  const INTERVAL_TIME = 9000;

  let currentCharacterIndex = Math.max(
    0,
    thumbs.findIndex((thumb) => thumb.classList.contains("active"))
  );

  let currentImageIndex = 0;
  let timer = null;
  let internalClick = false;

  function getImagesCount(characterIndex) {
    const thumb = thumbs[characterIndex];
    if (!thumb) return 1;

    try {
      const images = JSON.parse(thumb.dataset.images || "[]");
      return Math.max(images.length, 1);
    } catch {
      return 1;
    }
  }

  function resetProgress() {
    thumbs.forEach((thumb) => {
      thumb.classList.remove("is-timing");
    });

    const activeThumb = thumbs[currentCharacterIndex];
    if (!activeThumb) return;

    // перезапуск CSS-анимации
    void activeThumb.offsetWidth;
    activeThumb.classList.add("is-timing");
  }

  function clickCharacter(index) {
    if (!thumbs[index]) return;

    internalClick = true;
    thumbs[index].click();
    internalClick = false;

    currentCharacterIndex = index;
    currentImageIndex = 0;

    resetProgress();
  }

  function clickNextImage() {
    if (!nextImgBtn) return false;

    internalClick = true;
    nextImgBtn.click();
    internalClick = false;

    currentImageIndex += 1;
    resetProgress();

    return true;
  }

  function nextCharacter() {
    const nextIndex = (currentCharacterIndex + 1) % thumbs.length;
    clickCharacter(nextIndex);
  }

  function autoStep() {
    const imagesCount = getImagesCount(currentCharacterIndex);

    // Если у персонажа есть ещё следующая картинка — переключаем картинку
    if (currentImageIndex < imagesCount - 1) {
      clickNextImage();
      return;
    }

    // Если картинки закончились — следующий персонаж
    nextCharacter();
  }

  function startAuto() {
    stopAuto();
    resetProgress();

    timer = setInterval(() => {
      autoStep();
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

  // Ручной выбор персонажа
  thumbs.forEach((thumb, index) => {
    thumb.addEventListener("click", () => {
      if (internalClick) return;

      currentCharacterIndex = index;
      currentImageIndex = 0;
      restartAuto();
    });
  });

  // Ручная кнопка следующей картинки
  if (nextImgBtn) {
    nextImgBtn.addEventListener("click", () => {
      if (internalClick) return;

      const imagesCount = getImagesCount(currentCharacterIndex);
      currentImageIndex = (currentImageIndex + 1) % imagesCount;

      resetProgress();
      restartAuto();
    });
  }

  // Ручная кнопка предыдущей картинки
  if (prevImgBtn) {
    prevImgBtn.addEventListener("click", () => {
      if (internalClick) return;

      const imagesCount = getImagesCount(currentCharacterIndex);
      currentImageIndex =
        (currentImageIndex - 1 + imagesCount) % imagesCount;

      resetProgress();
      restartAuto();
    });
  }

  // Когда вкладка скрыта — останавливаем
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAuto();
    } else {
      restartAuto();
    }
  });

  startAuto();
});