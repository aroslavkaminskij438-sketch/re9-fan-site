(function () {
  const topSlides = [
    {
      kicker: "ACTION",
      title: "Third Person View",
      text: [
        "The Third Person View camera perspective returns in Resident Evil Requiem.",
        "Updated controls enhance the tension of isolated environments while keeping every encounter dangerous and deliberate."
      ],
      video: "assets/img/Gameplay/01.mp4"
    },
    {
      kicker: "EXPLORATION",
      title: "Case Investigation",
      text: [
        "Search abandoned spaces, read clues and follow evidence linked to a growing chain of deaths.",
        "Exploration is slower, heavier and more dangerous when every room might hide a threat."
      ],
      video: "assets/img/Gameplay/03.mp4"
    },
    {
      kicker: "SURVIVAL HORROR",
      title: "Constant Pressure",
      text: [
        "Enemies, darkness and limited visibility force you to move carefully and think before committing.",
        "Requiem focuses on dread, atmosphere and the feeling that safety never lasts."
      ],
      video: "assets/img/Gameplay/04.mp4"
    }
  ];

  const bottomSlides = [
    {
      kicker: "RESOURCE MANAGEMENT",
      title: "Attaché Case",
      text: [
        "Carry weapons, ammo, healing items and mission-critical objects in the attaché case.",
        "Managing limited space under pressure is essential if you want to survive deeper into the nightmare."
      ],
      video: "assets/img/Gameplay/02.mp4"
    },
    {
      kicker: "TACTICAL LOADOUT",
      title: "Weapon Selection",
      text: [
        "Choosing what to carry becomes part of the tension when resources are limited and routes stay uncertain.",
        "A poor loadout can turn a manageable area into a desperate escape."
      ],
      video: "assets/img/Gameplay/01.mp4"
    },
    {
      kicker: "RECOVERY ITEMS",
      title: "Stay Alive",
      text: [
        "Healing supplies are valuable and cannot be wasted carelessly.",
        "Every item matters when damage accumulates and safe recovery points are scarce."
      ],
      video: "assets/img/Gameplay/03.mp4"
    }
  ];

  const topKicker = document.getElementById("gpTopKicker");
  const topTitle = document.getElementById("gpTopTitle");
  const topText = document.getElementById("gpTopText");
  const topVideo = document.getElementById("gpTopVideo");
  const topSource = topVideo?.querySelector("source");
  const topPrev = document.getElementById("gpTopPrev");
  const topNext = document.getElementById("gpTopNext");
  const topLine = document.getElementById("gpTopLine");
  const topPreview = document.getElementById("gpTopPreview");

  const bottomKicker = document.getElementById("gpBottomKicker");
  const bottomTitle = document.getElementById("gpBottomTitle");
  const bottomText = document.getElementById("gpBottomText");
  const bottomVideo = document.getElementById("gpBottomVideo");
  const bottomSource = bottomVideo?.querySelector("source");
  const bottomPrev = document.getElementById("gpBottomPrev");
  const bottomNext = document.getElementById("gpBottomNext");
  const bottomLine = document.getElementById("gpBottomLine");
  const bottomPreview = document.getElementById("gpBottomPreview");

  if (!topVideo || !bottomVideo || !topSource || !bottomSource) return;

  let topIndex = 0;
  let bottomIndex = 0;

  function setParagraphs(container, items) {
    container.innerHTML = items.map(p => `<p>${p}</p>`).join("");
  }

  function stopVideo(video, previewBtn) {
    video.pause();
    video.currentTime = 0;
    previewBtn?.classList.remove("is-playing");
  }

  function renderTop(index) {
    topIndex = (index + topSlides.length) % topSlides.length;
    const slide = topSlides[topIndex];

    stopVideo(topVideo, topPreview);

    topKicker.textContent = slide.kicker;
    topTitle.textContent = slide.title;
    setParagraphs(topText, slide.text);

    topSource.src = slide.video;
    topVideo.load();

    const topMax = topSlides.length - 1;
    const topMove = topMax > 0 ? (topIndex / topMax) * 285 : 0;
    topLine.style.transform = `translateX(${topMove}%)`;
  }

  function renderBottom(index) {
    bottomIndex = (index + bottomSlides.length) % bottomSlides.length;
    const slide = bottomSlides[bottomIndex];

    stopVideo(bottomVideo, bottomPreview);

    bottomKicker.textContent = slide.kicker;
    bottomTitle.textContent = slide.title;
    setParagraphs(bottomText, slide.text);

    bottomSource.src = slide.video;
    bottomVideo.load();

    const bottomMax = bottomSlides.length - 1;
    const bottomMove = bottomMax > 0 ? (bottomIndex / bottomMax) * 285 : 0;
    bottomLine.style.transform = `translateX(${bottomMove}%)`;
  }

  async function toggleVideo(video, previewBtn) {
    try {
      if (video.paused) {
        await video.play();
        previewBtn.classList.add("is-playing");
      } else {
        video.pause();
        previewBtn.classList.remove("is-playing");
      }
    } catch (e) {
      console.error("Video play error:", e);
    }
  }

  topPrev?.addEventListener("click", () => renderTop(topIndex - 1));
  topNext?.addEventListener("click", () => renderTop(topIndex + 1));

  bottomPrev?.addEventListener("click", () => renderBottom(bottomIndex - 1));
  bottomNext?.addEventListener("click", () => renderBottom(bottomIndex + 1));

  topPreview?.addEventListener("click", () => toggleVideo(topVideo, topPreview));
  bottomPreview?.addEventListener("click", () => toggleVideo(bottomVideo, bottomPreview));

  topVideo.addEventListener("ended", () => topPreview.classList.remove("is-playing"));
  bottomVideo.addEventListener("ended", () => bottomPreview.classList.remove("is-playing"));

  renderTop(0);
  renderBottom(0);
})();