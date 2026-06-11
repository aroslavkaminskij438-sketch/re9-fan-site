(function () {
  const DEFAULT_AVATAR = "assets/img/avatars/avatar.png";

  function getClient() {
    if (!window.supabase) {
      console.warn("Supabase SDK not loaded.");
      return null;
    }

    if (!window.supabaseClient) {
      window.supabaseClient = window.supabase.createClient(
        window.RE9_SUPABASE_URL,
        window.RE9_SUPABASE_ANON_KEY
      );
    }

    return window.supabaseClient;
  }

  async function getSessionSafe() {
    const client = getClient();

    if (!client) return null;

    const { data, error } = await client.auth.getSession();

    if (error) {
      console.error("getSession error:", error);
      return null;
    }

    return data?.session || null;
  }

  async function initUserMenu() {
    const userBox = document.getElementById("userBox");
    const loginLink = document.getElementById("loginLink");

    if (!userBox && !loginLink) return;

    const userBtn = document.getElementById("userBtn");
    const userMenu = document.getElementById("userMenu");
    const userName = document.getElementById("userName");
    const userAva = document.getElementById("userAva");
    const logoutBtn = document.getElementById("logoutBtn");
    const openProfile = document.getElementById("openProfile");

    const client = getClient();
    const session = await getSessionSafe();

    if (!client || !session) {
      if (userBox) userBox.hidden = true;
      if (loginLink) loginLink.hidden = false;
      return;
    }

    const user = session.user;
    const meta = user.user_metadata || {};
    const username = meta.username || user.email || "User";

    if (userBox) userBox.hidden = false;
    if (loginLink) loginLink.hidden = true;

    if (userName) {
      userName.textContent = String(username).toUpperCase();
    }

    if (userAva) {
      userAva.src = meta.avatar_url || DEFAULT_AVATAR;
    }

    function closeMenu() {
      if (userMenu) {
        userMenu.hidden = true;
      }
    }

    userBtn?.addEventListener("click", (event) => {
      event.stopPropagation();

      if (userMenu) {
        userMenu.hidden = !userMenu.hidden;
      }
    });

    userMenu?.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    document.addEventListener("click", closeMenu);

    openProfile?.addEventListener("click", () => {
      closeMenu();
      location.href = "profile.html";
    });

    logoutBtn?.addEventListener("click", async () => {
      await client.auth.signOut();
      closeMenu();
      location.href = "login.html";
    });
  }

  const dict = {
    ru: {
      title_big: "RESIDENT EVIL",
      title_small: "requiem",
      date: "27.02.2026",
      cta: "Доступно сейчас →",
      news_title: "Новости",
      trailer_title: "Трейлер",
      about_kicker: "ОБ ИГРЕ",
      story_title: "Сюжет",
      characters_kicker: "ПЕРСОНАЖИ",
      locations_title: "Локации",
      gameplay_title: "ГЕЙМПЛЕЙ",
      products_title: "Продукты",
      support_title: "Поддержка",
      support_text: "Есть вопрос, идея или баг? Напиши — отвечу на почту.",
      support_email_placeholder: "name@example.com",
      support_message_placeholder: "Напиши сообщение...",
      support_send: "Отправить →",
      follow_text: "Подписаться",
      whats_new: "Что нового",
      preview: "PREVIEW",
      profile: "Профиль",
      logout: "Выйти",
      login: "Войти",
      products_stub: "Мерч/издания/ссылки."
    },

    en: {
      title_big: "RESIDENT EVIL",
      title_small: "requiem",
      date: "2/27/2026",
      cta: "Available now →",
      news_title: "News",
      trailer_title: "Trailer",
      about_kicker: "ABOUT",
      story_title: "Story",
      characters_kicker: "CHARACTERS",
      locations_title: "Locations",
      gameplay_title: "GAMEPLAY",
      products_title: "Products",
      support_title: "Support",
      support_text: "Have a question, idea, or bug report? Send a message — I’ll reply by email.",
      support_email_placeholder: "name@example.com",
      support_message_placeholder: "Write your message...",
      support_send: "Send →",
      follow_text: "Follow",
      whats_new: "What's New",
      preview: "PREVIEW",
      profile: "Profile",
      logout: "Logout",
      login: "Login",
      products_stub: "Merch / editions / links."
    }
  };

  function applyLang(lang) {
    const langDict = dict[lang] || dict.en;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.dataset.i18n;

      if (langDict[key] !== undefined) {
        el.textContent = langDict[key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.dataset.i18nPlaceholder;

      if (langDict[key] !== undefined) {
        el.setAttribute("placeholder", langDict[key]);
      }
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      const key = el.dataset.i18nAria;

      if (langDict[key] !== undefined) {
        el.setAttribute("aria-label", langDict[key]);
      }
    });

    document.documentElement.lang = lang;

    document.querySelectorAll(".lang").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
    });

    localStorage.setItem("lang", lang);
  }

  function initLang() {
    document.querySelectorAll(".lang").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.preventDefault();

        const lang = btn.dataset.lang || "en";
        applyLang(lang);
      });
    });

    applyLang(localStorage.getItem("lang") || "ru");
  }

  function initSideNav() {
    const nav = document.querySelector(".side-nav");

    if (!nav) return;

    const dots = Array.from(nav.querySelectorAll(".dot"));

    const targets = dots
      .map((dot) => dot.getAttribute("href"))
      .filter(Boolean)
      .map((href) => (href.startsWith("#") ? href.slice(1) : null))
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const id = visible.target.id;

        dots.forEach((dot) => {
          dot.classList.toggle("active", dot.getAttribute("href") === `#${id}`);
        });
      },
      {
        threshold: [0.2, 0.35, 0.5, 0.65]
      }
    );

    targets.forEach((target) => observer.observe(target));
  }

  function initSmoothSite() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) return;

    document.documentElement.style.scrollBehavior = "smooth";

    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');

      if (!link) return;

      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = document.querySelector(href);

      if (!target) return;

      event.preventDefault();

      const top = target.getBoundingClientRect().top + window.scrollY - 20;

      window.scrollTo({
        top,
        behavior: "smooth"
      });
    });
  }

  function initHorizontalDrag(container, itemSelector, options = {}) {
    if (!container) return;

    const items = Array.from(container.querySelectorAll(itemSelector));

    if (!items.length) return;

    const prevBtn = options.prevBtn || null;
    const nextBtn = options.nextBtn || null;
    const currentEl = options.currentEl || null;
    const totalEl = options.totalEl || null;
    const bar = options.bar || null;
    const progress = options.progress || null;

    if (totalEl) {
      totalEl.textContent = String(items.length).padStart(2, "0");
    }

    function getGap() {
      const styles = getComputedStyle(container);
      const gap = parseFloat(styles.gap || "20");

      return Number.isFinite(gap) ? gap : 20;
    }

    function getStep() {
      return items[0].getBoundingClientRect().width + getGap();
    }

    function getIndex() {
      const step = getStep();

      if (step <= 0) return 0;

      return Math.round(container.scrollLeft / step);
    }

    function update() {
      const maxScroll = container.scrollWidth - container.clientWidth;
      const index = Math.max(0, Math.min(items.length - 1, getIndex()));

      if (currentEl) {
        currentEl.textContent = String(index + 1).padStart(2, "0");
      }

      if (prevBtn) {
        prevBtn.disabled = container.scrollLeft <= 2;
      }

      if (nextBtn) {
        nextBtn.disabled = container.scrollLeft >= maxScroll - 2;
      }

      if (bar && progress) {
        const barWidth = bar.clientWidth;
        const segmentWidth = Math.max(42, Math.min(86, barWidth * 0.16));

        progress.style.width = `${segmentWidth}px`;

        if (maxScroll <= 0) {
          progress.style.transform = "translate3d(0, -50%, 0)";
        } else {
          const ratio = container.scrollLeft / maxScroll;
          const x = ratio * (barWidth - segmentWidth);

          progress.style.transform = `translate3d(${x}px, -50%, 0)`;
        }
      }
    }

    prevBtn?.addEventListener("click", () => {
      container.scrollTo({
        left: Math.max(0, container.scrollLeft - getStep()),
        behavior: "smooth"
      });
    });

    nextBtn?.addEventListener("click", () => {
      container.scrollTo({
        left: Math.min(
          container.scrollWidth - container.clientWidth,
          container.scrollLeft + getStep()
        ),
        behavior: "smooth"
      });
    });

    bar?.addEventListener("click", (event) => {
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const maxScroll = container.scrollWidth - container.clientWidth;

      container.scrollTo({
        left: ratio * maxScroll,
        behavior: "smooth"
      });
    });

    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    let moved = false;

    container.addEventListener("mousedown", (event) => {
      if (event.button !== 0) return;

      isDown = true;
      moved = false;
      startX = event.pageX;
      startScroll = container.scrollLeft;

      container.classList.add("dragging");
    });

    window.addEventListener("mousemove", (event) => {
      if (!isDown) return;

      event.preventDefault();

      const walk = event.pageX - startX;

      if (Math.abs(walk) > 5) {
        moved = true;
      }

      container.scrollLeft = startScroll - walk;
    });

    window.addEventListener("mouseup", () => {
      isDown = false;
      container.classList.remove("dragging");
    });

    container.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", (event) => {
        if (moved) {
          event.preventDefault();
        }
      });
    });

    container.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    update();
  }

  function initNewsSlider() {
    initHorizontalDrag(document.getElementById("newsSlider"), ".news-card", {
      prevBtn: document.querySelector(".news-arrow.left"),
      nextBtn: document.querySelector(".news-arrow.right"),
      bar: document.getElementById("newsBar"),
      progress: document.getElementById("newsProgress")
    });
  }

  function initTrailerSlider() {
    initHorizontalDrag(document.getElementById("trailersTrack"), ".tr-card", {
      prevBtn: document.getElementById("trailersPrev"),
      nextBtn: document.getElementById("trailersNext"),
      currentEl: document.getElementById("trailersCurrent"),
      totalEl: document.getElementById("trailersTotal")
    });
  }

  function initStoryCp() {
    const stage = document.getElementById("storyCpStage");
    const dotsWrap = document.getElementById("storyCpDots");

    if (!stage || !dotsWrap) return;

    const cards = Array.from(stage.querySelectorAll(".story-cp-card"));
    const dots = Array.from(dotsWrap.querySelectorAll(".story-cp-dot"));

    if (!cards.length) return;

    cards.forEach((card) => {
      const src = card.dataset.src;

      if (src) {
        card.style.backgroundImage = `url("${src}")`;
      }
    });

    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = ((nextIndex % cards.length) + cards.length) % cards.length;

      cards.forEach((card) => {
        card.classList.remove("is-front", "is-mid", "is-back", "is-dropping");
      });

      cards[index]?.classList.add("is-front");
      cards[(index + 1) % cards.length]?.classList.add("is-mid");
      cards[(index + 2) % cards.length]?.classList.add("is-back");

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();

      timer = setInterval(() => {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }

      timer = null;
    }

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const next = Number(dot.dataset.index);

        if (Number.isFinite(next)) {
          show(next);
          start();
        }
      });
    });

    stage.addEventListener("mouseenter", stop);
    stage.addEventListener("mouseleave", start);

    show(0);
    start();
  }

  function initStoryStack() {
    const stage = document.getElementById("storyStackStage");
    const dotsWrap = document.getElementById("storyStackDots");

    if (!stage || !dotsWrap) return;

    const cards = Array.from(stage.querySelectorAll(".story-card"));
    const dots = Array.from(dotsWrap.querySelectorAll(".story-stack-dot"));

    if (!cards.length) return;

    cards.forEach((card) => {
      const src = card.dataset.src;

      if (src) {
        card.style.backgroundImage = `url("${src}")`;
      }
    });

    let index = 0;
    let timer = null;

    function show(nextIndex) {
      index = ((nextIndex % cards.length) + cards.length) % cards.length;

      cards.forEach((card) => {
        card.classList.remove("is-front", "is-mid", "is-back", "is-dropping");
      });

      cards[index]?.classList.add("is-front");
      cards[(index + 1) % cards.length]?.classList.add("is-mid");
      cards[(index + 2) % cards.length]?.classList.add("is-back");

      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();

      timer = setInterval(() => {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }

      timer = null;
    }

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const next = Number(dot.dataset.index);

        if (Number.isFinite(next)) {
          show(next);
          start();
        }
      });
    });

    stage.addEventListener("mouseenter", stop);
    stage.addEventListener("mouseleave", start);

    show(0);
    start();
  }

  function initCharacters() {
    const thumbsWrap = document.getElementById("capChThumbs");
    const frame = document.getElementById("capChFrame");
    const nameEl = document.getElementById("capChName");
    const roleEl = document.getElementById("capChRole");
    const textEl = document.getElementById("capChText");
    const idxEl = document.getElementById("capChIdx");
    const totalEl = document.getElementById("capChTotal");
    const dotsWrap = document.getElementById("capChImgDots");
    const prevImg = document.getElementById("capChPrevImg");
    const nextImg = document.getElementById("capChNextImg");
    const stage = document.querySelector(".re-char-stage");

    if (!thumbsWrap || !frame || !nameEl || !roleEl || !textEl || !dotsWrap) return;

    const thumbs = Array.from(thumbsWrap.querySelectorAll(".re-char-thumb"));

    if (!thumbs.length) return;

    let currentChar = Math.max(0, thumbs.findIndex((btn) => btn.classList.contains("active")));
    let currentImg = 0;
    let imgEls = [];
    let timer = null;

    function safeJson(value, fallback) {
      try {
        return JSON.parse(value);
      } catch {
        return fallback;
      }
    }

    function renderText(text) {
      textEl.innerHTML = "";

      String(text || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .forEach((line) => {
          const p = document.createElement("p");
          p.textContent = line;
          textEl.appendChild(p);
        });
    }

    function showImage(index) {
      if (!imgEls.length) return;

      currentImg = ((index % imgEls.length) + imgEls.length) % imgEls.length;

      imgEls.forEach((img, imgIndex) => {
        img.classList.toggle("active", imgIndex === currentImg);
      });

      dotsWrap.querySelectorAll(".cap-ch-dot").forEach((dot, dotIndex) => {
        dot.classList.toggle("active", dotIndex === currentImg);
      });
    }

    function startAuto() {
      stopAuto();

      timer = setInterval(() => {
        showImage(currentImg + 1);
      }, 4500);
    }

    function stopAuto() {
      if (timer) {
        clearInterval(timer);
      }

      timer = null;
    }

    function setCharacter(index) {
      currentChar = ((index % thumbs.length) + thumbs.length) % thumbs.length;
      currentImg = 0;

      const btn = thumbs[currentChar];
      const images = safeJson(btn.dataset.images || "[]", []);
      const name = btn.dataset.name || "Unknown";
      const role = btn.dataset.role || "Unknown";
      const text = btn.dataset.text || "";

      thumbs.forEach((thumb, thumbIndex) => {
        thumb.classList.toggle("active", thumbIndex === currentChar);
      });

      nameEl.textContent = name;
      roleEl.textContent = role;
      renderText(text);

      if (idxEl) {
        idxEl.textContent = String(currentChar + 1).padStart(2, "0");
      }

      if (totalEl) {
        totalEl.textContent = String(thumbs.length).padStart(2, "0");
      }

      frame.innerHTML = "";
      dotsWrap.innerHTML = "";

      imgEls = images.map((src, imgIndex) => {
        const img = document.createElement("img");

        img.src = src;
        img.alt = name;
        img.className = "cap-ch-photo";

        if (imgIndex === 0) {
          img.classList.add("active");
        }

        frame.appendChild(img);

        const dot = document.createElement("button");

        dot.type = "button";
        dot.className = "cap-ch-dot";
        dot.textContent = String(imgIndex + 1);

        dot.addEventListener("click", () => {
          showImage(imgIndex);
          startAuto();
        });

        if (imgIndex === 0) {
          dot.classList.add("active");
        }

        dotsWrap.appendChild(dot);

        return img;
      });

      showImage(0);
      startAuto();
    }

    thumbs.forEach((thumb, index) => {
      thumb.addEventListener("click", () => {
        setCharacter(index);
      });
    });

    prevImg?.addEventListener("click", () => {
      showImage(currentImg - 1);
      startAuto();
    });

    nextImg?.addEventListener("click", () => {
      showImage(currentImg + 1);
      startAuto();
    });

    stage?.addEventListener("mouseenter", stopAuto);
    stage?.addEventListener("mouseleave", startAuto);

    setCharacter(currentChar);
  }

  function initSupportForm() {
    const form = document.getElementById("supportForm");
    const status = document.getElementById("formStatus");

    if (!form || !status) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      try {
        const formData = new FormData(form);

        const response = await fetch(form.action, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json"
          }
        });

        if (response.ok) {
          status.textContent = "✓ Message sent successfully";
          status.style.color = "#7CFC00";
          form.reset();
        } else {
          status.textContent = "✖ Error sending message";
          status.style.color = "#ff4d4d";
        }
      } catch (err) {
        console.error(err);
        status.textContent = "✖ Network error";
        status.style.color = "#ff4d4d";
      }
    });
  }

  function initProductsTabs() {
    const tabs = Array.from(document.querySelectorAll(".prod-tab"));
    const panels = Array.from(document.querySelectorAll(".prod-panel"));

    if (!tabs.length || !panels.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target =
          tab.dataset.target ||
          tab.dataset.tab ||
          tab.dataset.spec ||
          tab.getAttribute("aria-controls");

        tabs.forEach((btn) => {
          const isActive = btn === tab;
          btn.classList.toggle("active", isActive);
          btn.setAttribute("aria-selected", String(isActive));
        });
        panels.forEach((panel) => panel.classList.remove("active"));

        if (target) {
          document.getElementById(target)?.classList.add("active");
          document.querySelector(`.prod-panel[data-panel="${target}"]`)?.classList.add("active");
        }
      });
    });
  }

  function initSysReqModal() {
    const modal = document.getElementById("sysreqModal") || document.querySelector(".sysreq-modal");
    const openBtn = document.getElementById("openSysReq") || document.querySelector(".products-req-btn");
    const closeBtn = document.getElementById("closeSysReq") || document.querySelector(".sysreq-close");
    const backdrop = document.querySelector(".sysreq-backdrop");

    if (!modal || !openBtn) return;

    function openModal() {
      modal.hidden = false;
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      modal.hidden = true;
      document.body.style.overflow = "";
    }

    openBtn.addEventListener("click", openModal);
    closeBtn?.addEventListener("click", closeModal);
    backdrop?.addEventListener("click", closeModal);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !modal.hidden) {
        closeModal();
      }
    });

    const tabs = Array.from(document.querySelectorAll(".sysreq-tab"));
    const panels = Array.from(document.querySelectorAll(".sysreq-panel"));

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const target = tab.dataset.spec || tab.dataset.target || tab.dataset.tab;

        tabs.forEach((btn) => btn.classList.remove("active"));

        panels.forEach((panel) => {
          panel.classList.toggle("active", panel.dataset.panel === target);
        });

        tab.classList.add("active");
      });
    });
  }

function initLocationsAlbum() {
  const stage = document.getElementById("locAlbumStage");
  const track = document.getElementById("locAlbumTrack");
  const prevBtn = document.getElementById("locAlbumPrev");
  const nextBtn = document.getElementById("locAlbumNext");
  const bar = document.getElementById("locAlbumBar");
  const progress = document.getElementById("locAlbumProgress");

  if (!stage || !track) return;

  const cards = Array.from(track.querySelectorAll(".loc-album-card"));

  if (!cards.length) return;

  let index = 0;
  let isDragging = false;
  let startX = 0;
  let dragX = 0;
  let currentOffset = 0;

  // ставим подписи из alt, если data-title не задан
  cards.forEach((card, cardIndex) => {
    const img = card.querySelector("img");

    if (!card.dataset.title && img?.alt) {
      card.dataset.title = img.alt;
    }

    if (!card.dataset.code) {
      card.dataset.code = String(cardIndex + 1).padStart(2, "0");
    }
  });

  function getGap() {
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "28");

    return Number.isFinite(gap) ? gap : 28;
  }

  function getCardWidth() {
    return cards[0]?.getBoundingClientRect().width || 1;
  }

  function getStep() {
    return getCardWidth() + getGap();
  }

  function getMaxOffset() {
    return Math.max(0, track.scrollWidth - stage.clientWidth);
  }

  function getOffsetForIndex(nextIndex) {
    const cardWidth = getCardWidth();
    const step = getStep();

    const centeredOffset =
      nextIndex * step - (stage.clientWidth - cardWidth) / 2;

    return Math.max(0, Math.min(centeredOffset, getMaxOffset()));
  }

  function setActiveCards() {
    cards.forEach((card, cardIndex) => {
      card.classList.toggle("active", cardIndex === index);
      card.classList.toggle("prev", cardIndex < index);
      card.classList.toggle("next", cardIndex > index);
    });
  }

  function updateProgress() {
    if (!bar || !progress) return;

    const barWidth = bar.clientWidth;
    const segment = Math.max(44, Math.min(90, barWidth / cards.length));
    const maxX = Math.max(0, barWidth - segment);
    const ratio = cards.length <= 1 ? 0 : index / (cards.length - 1);
    const x = ratio * maxX;

    progress.style.width = `${segment}px`;
    progress.style.transform = `translate3d(${x}px, -50%, 0)`;
  }

  function goTo(nextIndex, withTransition = true) {
    index = ((nextIndex % cards.length) + cards.length) % cards.length;

    currentOffset = getOffsetForIndex(index);

    track.style.transition = withTransition
      ? "transform .72s cubic-bezier(.16, 1, .3, 1)"
      : "none";

    track.style.transform = `translate3d(${-currentOffset}px, 0, 0)`;

    setActiveCards();
    updateProgress();
  }

  prevBtn?.addEventListener("click", () => {
    goTo(index - 1);
  });

  nextBtn?.addEventListener("click", () => {
    goTo(index + 1);
  });

  bar?.addEventListener("click", (event) => {
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const nextIndex = Math.round(ratio * (cards.length - 1));

    goTo(nextIndex);
  });

  stage.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;

    isDragging = true;
    startX = event.clientX;
    dragX = 0;

    stage.classList.add("dragging");
    track.style.transition = "none";

    stage.setPointerCapture?.(event.pointerId);
  });

  stage.addEventListener("pointermove", (event) => {
    if (!isDragging) return;

    dragX = event.clientX - startX;

    const nextOffset = Math.max(
      0,
      Math.min(currentOffset - dragX, getMaxOffset())
    );

    track.style.transform = `translate3d(${-nextOffset}px, 0, 0)`;
  });

  function endDrag() {
    if (!isDragging) return;

    isDragging = false;
    stage.classList.remove("dragging");

    if (Math.abs(dragX) > 55) {
      if (dragX < 0) {
        goTo(index + 1);
      } else {
        goTo(index - 1);
      }
    } else {
      goTo(index);
    }
  }

  stage.addEventListener("pointerup", endDrag);
  stage.addEventListener("pointercancel", endDrag);
  stage.addEventListener("pointerleave", endDrag);

  window.addEventListener("resize", () => {
    goTo(index, false);
  });

  goTo(0, false);
}

  function initGameplay() {
    const groups = [
      {
        text: {
          kicker: document.getElementById("gpTextKicker1"),
          title: document.getElementById("gpTextTitle1"),
          body: document.getElementById("gpTextBody1")
        },
        prev: document.getElementById("gpPrev1"),
        next: document.getElementById("gpNext1"),
        line: document.getElementById("gpLine1"),
        video: document.getElementById("gpVideo1"),
        preview: document.getElementById("gpPreview1"),
        slides: [
          {
            kicker: "ACTION",
            title: "Knife Actions",
            body: [
              "Use close-range attacks to interrupt enemy pressure and create room in tight encounters.",
              "Defensive timing and aggressive follow-up can shift the pace of combat in your favor."
            ],
            video: "assets/img/Gameplay/01.mp4"
          },
          {
            kicker: "SURVIVAL",
            title: "Resource Control",
            body: [
              "Ammunition, healing and timing matter. Waste less. Survive longer.",
              "Every room can turn into a problem if you enter without a plan."
            ],
            video: "assets/img/Gameplay/02.mp4"
          },
          {
            kicker: "COMBAT",
            title: "Pressure Encounters",
            body: [
              "Enemies push distance, block escape lines and force quick decisions.",
              "Positioning is often more important than raw firepower."
            ],
            video: "assets/img/Gameplay/03.mp4"
          }
        ]
      },
      {
        text: {
          kicker: document.getElementById("gpTextKicker2"),
          title: document.getElementById("gpTextTitle2"),
          body: document.getElementById("gpTextBody2")
        },
        prev: document.getElementById("gpPrev2"),
        next: document.getElementById("gpNext2"),
        line: document.getElementById("gpLine2"),
        video: document.getElementById("gpVideo2"),
        preview: document.getElementById("gpPreview2"),
        slides: [
          {
            kicker: "EXPLORATION",
            title: "Investigate the Scene",
            body: [
              "Read the environment, check locked paths and collect evidence.",
              "The map is not only a guide — it is part of the tension."
            ],
            video: "assets/img/Gameplay/04.mp4"
          },
          {
            kicker: "HORROR",
            title: "Unstable Spaces",
            body: [
              "Lighting, sound and narrow rooms make every movement less safe.",
              "The game pushes you to listen before you act."
            ],
            video: "assets/img/Gameplay/05.mp4"
          },
          {
            kicker: "ESCAPE",
            title: "Break Contact",
            body: [
              "Sometimes survival means leaving the fight instead of winning it.",
              "Choose when to stand, when to move and when to run."
            ],
            video: "assets/img/Gameplay/06.mp4"
          }
        ]
      }
    ];

    groups.forEach((group) => {
      if (!group.video || !group.slides.length) return;

      let index = 0;

      function setVideo(src) {
        let source = group.video.querySelector("source");

        if (!source) {
          source = document.createElement("source");
          source.type = "video/mp4";
          group.video.appendChild(source);
        }

        source.src = src;
        group.video.load();
      }

      function render() {
        const slide = group.slides[index];

        if (group.text.kicker) {
          group.text.kicker.textContent = slide.kicker;
        }

        if (group.text.title) {
          group.text.title.textContent = slide.title;
        }

        if (group.text.body) {
          group.text.body.innerHTML = "";

          slide.body.forEach((line) => {
            const p = document.createElement("p");
            p.textContent = line;
            group.text.body.appendChild(p);
          });
        }

        if (group.line) {
          const step = 100 / group.slides.length;
          group.line.style.transform = `translate(${index * step}%, -50%)`;
        }

        setVideo(slide.video);

        if (group.preview) {
          group.preview.classList.remove("is-playing");
          group.preview.classList.remove("is-hidden");
        }
      }

      function next() {
        index = (index + 1) % group.slides.length;
        render();
      }

      function prev() {
        index = (index - 1 + group.slides.length) % group.slides.length;
        render();
      }

      group.next?.addEventListener("click", next);
      group.prev?.addEventListener("click", prev);

      group.preview?.addEventListener("click", async () => {
        try {
          if (group.video.paused) {
            await group.video.play();
            group.preview.classList.add("is-playing");
          } else {
            group.video.pause();
            group.preview.classList.remove("is-playing");
          }
        } catch (err) {
          console.error("Video play error:", err);
        }
      });

      group.video.addEventListener("play", () => {
        group.preview?.classList.add("is-playing");
      });

      group.video.addEventListener("pause", () => {
        group.preview?.classList.remove("is-playing");
      });

      render();
    });
  }

  function initReveal() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) return;

    const items = document.querySelectorAll(
      ".section, .news-card, .tr-card, .re-char-thumb, .loc-album-card, .prod-block, .prod-panel"
    );

    if (!items.length || !("IntersectionObserver" in window)) return;

    document.body.classList.add("reveal-on");

    items.forEach((item, index) => {
      item.classList.add("reveal-item");
      item.style.setProperty("--reveal-delay", `${Math.min(index * 14, 90)}ms`);
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    items.forEach((item) => observer.observe(item));
  }

function initAboutSection() {
  const hero = document.getElementById("aboutHero");
  const heroBg = document.getElementById("aboutHeroBg");
  const title = document.getElementById("aboutTitle");
  const text = document.getElementById("aboutText");
  const strip = document.getElementById("aboutStrip");

  if (!hero || !heroBg || !title || !text || !strip) return;

  const thumbs = Array.from(strip.querySelectorAll(".about-cap-thumb"));
  if (!thumbs.length) return;

  function setContent(btn) {
    const bg = btn.dataset.bg || "";
    const titleData = btn.dataset.title || "";
    const textData = btn.dataset.text || "";

    thumbs.forEach((item) => item.classList.remove("active"));
    btn.classList.add("active");

    hero.classList.add("is-changing");
    title.classList.add("about-cap-fade");
    text.classList.add("about-cap-fade");

    setTimeout(() => {
      heroBg.style.backgroundImage = `url("${bg}")`;

      const titleParts = titleData.split("|");
      title.innerHTML = titleParts.join("<br>");

      const paragraphs = textData
        .split("||")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => `<p>${item}</p>`)
        .join("");

      text.innerHTML = paragraphs;
    }, 180);

    setTimeout(() => {
      title.classList.remove("about-cap-fade");
      text.classList.remove("about-cap-fade");
      hero.classList.remove("is-changing");
    }, 380);
  }

  thumbs.forEach((btn) => {
    btn.addEventListener("click", () => {
      setContent(btn);
    });
  });

  setContent(thumbs[0]);
}

  document.addEventListener("DOMContentLoaded", async () => {
    await initUserMenu();

    initLang();
    initSideNav();
    initSmoothSite();

    initNewsSlider();
    initTrailerSlider();
    initStoryCp();
    initStoryStack();
    initCharacters();
    initSupportForm();
    initProductsTabs();
    initSysReqModal();
    initLocationsAlbum();
    initGameplay();
    initReveal();
    initAboutSection();
  });
})();