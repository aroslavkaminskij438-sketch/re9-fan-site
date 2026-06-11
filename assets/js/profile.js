(function () {
  const client = window.supabaseClient || null;
  const DEFAULT_AVATAR = "assets/img/avatars/avatar.png";

  const els = {
    email: document.getElementById("pEmail"),
    id: document.getElementById("pId"),
    userBig: document.getElementById("pUser"),
    username: document.getElementById("pUsername"),
    created: document.getElementById("pCreated"),
    lastSignIn: document.getElementById("pLastSignIn"),
    avatar: document.getElementById("pAvatar"),
    operator: document.getElementById("pOperator"),
    stateBox: document.getElementById("pStateBox"),
    sessionState: document.getElementById("pSessionState"),
    region: document.getElementById("pRegion"),

    usernameInput: document.getElementById("pUsernameInput"),
    favoriteInput: document.getElementById("pFavoriteCharacter"),
    favoriteView: document.getElementById("pFavoriteView"),
    bioInput: document.getElementById("pBio"),
    bioView: document.getElementById("pBioView"),
    bioCount: document.getElementById("pBioCount"),
    newPassword: document.getElementById("pNewPassword"),

    avatarGrid: document.getElementById("avatarGrid"),
    toast: document.getElementById("profileToast"),

    btnCopyId: document.getElementById("btnCopyId"),
    btnApplyAvatar: document.getElementById("btnApplyAvatar"),
    btnSaveProfile: document.getElementById("btnSaveProfile"),
    btnChangePassword: document.getElementById("btnChangePassword"),
    btnLogout: document.getElementById("btnLogoutProfile")
  };

  let currentUser = null;
  let selectedAvatar = DEFAULT_AVATAR;

  function setText(el, value, fallback = "—") {
    if (!el) return;
    el.textContent = value || fallback;
  }

  function showToast(text) {
    if (!els.toast) return;

    els.toast.textContent = text;
    els.toast.hidden = false;
    els.toast.classList.remove("show");

    void els.toast.offsetWidth;

    els.toast.classList.add("show");

    setTimeout(() => {
      els.toast.classList.remove("show");
      els.toast.hidden = true;
    }, 1400);
  }

  function setButtonLoading(button, isLoading, textWhileLoading = "Saving...") {
    if (!button) return;

    const span = button.querySelector("span");

    if (isLoading) {
      if (!button.dataset.oldText) {
        button.dataset.oldText = span ? span.textContent : button.textContent;
      }

      button.disabled = true;
      button.classList.add("profile-is-loading");

      if (span) {
        span.textContent = textWhileLoading;
      } else {
        button.textContent = textWhileLoading;
      }

      return;
    }

    button.disabled = false;
    button.classList.remove("profile-is-loading");

    const oldText = button.dataset.oldText;

    if (oldText) {
      if (span) {
        span.textContent = oldText;
      } else {
        button.textContent = oldText;
      }

      delete button.dataset.oldText;
    }
  }

  function markDirty(isDirty = true) {
    const fields = [
      els.usernameInput,
      els.favoriteInput,
      els.bioInput
    ];

    fields.forEach((field) => {
      if (!field) return;
      field.classList.toggle("profile-is-dirty", isDirty);
    });
  }

  function fmtDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString();
  }

  function getDisplayName(user, meta) {
    return (
      meta.username ||
      meta.full_name ||
      user.email?.split("@")?.[0] ||
      "User"
    );
  }

  function syncAvatarSelection() {
    document.querySelectorAll(".profile-avatar-option").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.avatar === selectedAvatar);
    });
  }

  function setProfileToPage(user) {
    const meta = user.user_metadata || {};

    const username = getDisplayName(user, meta);
    const avatar = meta.avatar_url || DEFAULT_AVATAR;
    const favorite = meta.favorite_character || "Grace Ashcroft";
    const bio = meta.bio || "";

    setText(els.email, user.email);
    setText(els.id, user.id);
    setText(els.userBig, String(username).toUpperCase());
    setText(els.username, username);
    setText(els.operator, username);
    setText(els.created, fmtDate(user.created_at));
    setText(els.lastSignIn, fmtDate(user.last_sign_in_at || user.last_sign_in));
    setText(els.stateBox, "Authenticated session detected");
    setText(els.sessionState, "Authenticated");
    setText(els.region, meta.country || "Unknown");

    if (els.avatar) {
      els.avatar.src = avatar;
      els.avatar.onerror = () => {
        els.avatar.src = DEFAULT_AVATAR;
      };
    }

    selectedAvatar = avatar;

    if (els.usernameInput) {
      els.usernameInput.value = username;
    }

    if (els.favoriteInput) {
      els.favoriteInput.value = favorite;
    }

    setText(els.favoriteView, favorite);

    if (els.bioInput) {
      els.bioInput.value = bio;
    }

    setText(els.bioView, bio || "No bio yet.");

    if (els.bioCount) {
      els.bioCount.textContent = String(bio.length);
    }

    syncAvatarSelection();
    markDirty(false);
  }

  async function getFreshUser() {
    if (!client) {
      throw new Error("Supabase client not found");
    }

    const { data, error } = await client.auth.getUser();

    if (error) {
      throw error;
    }

    if (!data?.user) {
      throw new Error("No authenticated user");
    }

    currentUser = data.user;

    return data.user;
  }

  async function updateUserMetadata(patch) {
    const freshUser = await getFreshUser();
    const freshMeta = freshUser.user_metadata || {};

    const { data, error } = await client.auth.updateUser({
      data: {
        ...freshMeta,
        ...patch
      }
    });

    if (error) {
      throw error;
    }

    currentUser = data.user;

    setProfileToPage(currentUser);

    return data.user;
  }

  async function initProfile() {
    if (!client) {
      setText(els.stateBox, "Supabase client not found.");
      setText(els.sessionState, "Unavailable");
      showToast("Supabase config error");
      return;
    }

    setText(els.stateBox, "Checking Supabase session...");
    setText(els.sessionState, "Checking...");

    const { data, error } = await client.auth.getSession();

    if (error) {
      console.error("Session error:", error);
      setText(els.stateBox, "Session error");
      setText(els.sessionState, "Error");
      showToast("Session error");
      return;
    }

    if (!data?.session) {
      location.href = "login.html";
      return;
    }

    try {
      const user = await getFreshUser();
      setProfileToPage(user);
    } catch (err) {
      console.error("Profile load error:", err);
      showToast("Profile load failed");
      location.href = "login.html";
    }
  }

  els.avatarGrid?.addEventListener("click", (event) => {
    const btn = event.target.closest(".profile-avatar-option");

    if (!btn) return;

    selectedAvatar = btn.dataset.avatar || DEFAULT_AVATAR;

    if (els.avatar) {
      els.avatar.src = selectedAvatar;
    }

    syncAvatarSelection();
  });

  els.btnApplyAvatar?.addEventListener("click", async () => {
    setButtonLoading(els.btnApplyAvatar, true, "Saving...");

    try {
      await updateUserMetadata({
        avatar_url: selectedAvatar
      });

      showToast("Avatar saved");
    } catch (err) {
      console.error("Avatar save error:", err);
      showToast("Avatar save failed");
    } finally {
      setButtonLoading(els.btnApplyAvatar, false);
    }
  });

  els.btnSaveProfile?.addEventListener("click", async () => {
    const username = els.usernameInput?.value.trim() || "";
    const favorite = els.favoriteInput?.value || "Grace Ashcroft";
    const bio = els.bioInput?.value.trim() || "";

    if (username.length < 3) {
      showToast("Nickname min 3 chars");
      return;
    }

    if (bio.length > 160) {
      showToast("Bio max 160 chars");
      return;
    }

    setButtonLoading(els.btnSaveProfile, true, "Saving...");

    try {
      await updateUserMetadata({
        username,
        favorite_character: favorite,
        bio
      });

      showToast("Profile saved");
      markDirty(false);
    } catch (err) {
      console.error("Profile save error:", err);
      showToast("Profile save failed");
    } finally {
      setButtonLoading(els.btnSaveProfile, false);
    }
  });

  els.btnChangePassword?.addEventListener("click", async () => {
    const password = els.newPassword?.value || "";

    if (password.length < 8) {
      showToast("Password min 8 chars");
      return;
    }

    if (!client) {
      showToast("Supabase config error");
      return;
    }

    setButtonLoading(els.btnChangePassword, true, "Updating...");

    try {
      const { error } = await client.auth.updateUser({
        password
      });

      if (error) {
        throw error;
      }

      if (els.newPassword) {
        els.newPassword.value = "";
      }

      showToast("Password updated");
    } catch (err) {
      console.error("Password update error:", err);
      showToast("Password update failed");
    } finally {
      setButtonLoading(els.btnChangePassword, false);
    }
  });

  els.btnCopyId?.addEventListener("click", async () => {
    const id = els.id?.textContent || "";

    if (!id || id === "—") {
      showToast("No User ID");
      return;
    }

    setButtonLoading(els.btnCopyId, true, "Copying...");

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(id);
      } else {
        const textarea = document.createElement("textarea");

        textarea.value = id;
        document.body.appendChild(textarea);
        textarea.select();

        document.execCommand("copy");
        textarea.remove();
      }

      showToast("User ID copied");
    } catch (err) {
      console.error("Copy error:", err);
      showToast("Copy failed");
    } finally {
      setButtonLoading(els.btnCopyId, false);
    }
  });

  els.btnLogout?.addEventListener("click", async () => {
    if (!client) {
      location.href = "login.html";
      return;
    }

    setButtonLoading(els.btnLogout, true, "Logging out...");

    try {
      await client.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      location.href = "login.html";
    }
  });

  els.bioInput?.addEventListener("input", () => {
    const length = els.bioInput.value.length;

    if (els.bioCount) {
      els.bioCount.textContent = String(length);
    }

    markDirty(true);

    if (length > 150) {
      els.bioCount?.classList.add("warning");
    } else {
      els.bioCount?.classList.remove("warning");
    }
  });

  els.usernameInput?.addEventListener("input", () => {
    markDirty(true);
  });

  els.favoriteInput?.addEventListener("change", () => {
    markDirty(true);
  });

  initProfile();
})();