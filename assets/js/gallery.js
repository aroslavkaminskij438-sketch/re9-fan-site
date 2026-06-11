(function () {
  const boxes = Array.from(document.querySelectorAll(".img-box img"));
  if (!boxes.length) return;

  const lightbox = document.createElement("div");
  lightbox.className = "gallery-lightbox";
  lightbox.hidden = true;
  lightbox.innerHTML = '<button type="button" aria-label="Close gallery image">×</button><img alt="">';
  document.body.appendChild(lightbox);

  const image = lightbox.querySelector("img");
  const closeBtn = lightbox.querySelector("button");

  function close() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  boxes.forEach((img) => {
    img.addEventListener("click", () => {
      image.src = img.currentSrc || img.src;
      image.alt = img.alt || "Gallery image";
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
    });
  });

  closeBtn.addEventListener("click", close);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) close();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !lightbox.hidden) close();
  });
})();
