(function () {
  const client = window.supabaseClient;
  const out = document.getElementById("out");

  if (!client) {
    console.error("Supabase client not found. Check supabase-config.js.");
    return;
  }

  function getSafeMessage(obj) {
    if (!obj) return null;

    if (typeof obj === "string") {
      return { message: obj };
    }

    if (obj.message) {
      return { message: obj.message };
    }

    return obj;
  }

  function setOut(label, obj, state = "") {
    if (!out) return;

    out.classList.remove("success", "error");

    if (state) {
      out.classList.add(state);
    }

    const safe = getSafeMessage(obj);
    out.textContent = label + (safe ? "\n" + JSON.stringify(safe, null, 2) : "");
  }

  function isRecoveryUrl() {
    const href = location.href.toLowerCase();

    return (
      href.includes("type=recovery") ||
      href.includes("password_recovery") ||
      href.includes("access_token")
    );
  }

  function getCleanLoginUrl() {
    const url = new URL(location.href);

    url.hash = "";
    url.search = "";

    return url.toString();
  }

  async function redirectIfLoggedIn() {
    const { data, error } = await client.auth.getSession();

    if (error) {
      console.error("Session check error:", error);
      return;
    }

    if (data?.session && !isRecoveryUrl()) {
      location.href = "index.html";
    }
  }

  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");
  const formLogin = document.getElementById("form-login");
  const formSignup = document.getElementById("form-signup");
  const goLoginBtn = document.getElementById("go-login");

  function openLogin() {
    tabLogin?.classList.add("active");
    tabSignup?.classList.remove("active");
    formLogin?.classList.add("active");
    formSignup?.classList.remove("active");
  }

  function openSignup() {
    tabSignup?.classList.add("active");
    tabLogin?.classList.remove("active");
    formSignup?.classList.add("active");
    formLogin?.classList.remove("active");
  }

  tabLogin?.addEventListener("click", openLogin);
  tabSignup?.addEventListener("click", openSignup);
  goLoginBtn?.addEventListener("click", openLogin);

  document.querySelectorAll(".toggle-pass").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.target);

      if (!target) return;

      const isPassword = target.type === "password";

      target.type = isPassword ? "text" : "password";
      btn.textContent = isPassword ? "🙈" : "👁";
    });
  });

  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");

  const ruleLength = document.getElementById("rule-length");
  const ruleUpper = document.getElementById("rule-upper");
  const ruleLower = document.getElementById("rule-lower");
  const ruleNumber = document.getElementById("rule-number");
  const ruleSpecial = document.getElementById("rule-special");
  const ruleMatch = document.getElementById("rule-match");

  function setRule(el, ok) {
    if (!el) return;
    el.classList.toggle("ok", Boolean(ok));
  }

  function validatePasswordUI() {
    if (!passwordInput || !confirmPasswordInput) return false;

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    const checks = {
      length: password.length >= 8,
      upper: /[A-ZА-ЯЁ]/.test(password),
      lower: /[a-zа-яё]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-zА-Яа-яЁё0-9]/.test(password),
      match: password.length > 0 && password === confirmPassword
    };

    setRule(ruleLength, checks.length);
    setRule(ruleUpper, checks.upper);
    setRule(ruleLower, checks.lower);
    setRule(ruleNumber, checks.number);
    setRule(ruleSpecial, checks.special);
    setRule(ruleMatch, checks.match);

    return Object.values(checks).every(Boolean);
  }

  passwordInput?.addEventListener("input", validatePasswordUI);
  confirmPasswordInput?.addEventListener("input", validatePasswordUI);

  document.getElementById("signup")?.addEventListener("click", async () => {
    const email = document.getElementById("email")?.value.trim();
    const username = document.getElementById("username")?.value.trim();
    const password = document.getElementById("password")?.value;
    const confirmPassword = document.getElementById("confirm-password")?.value;

    if (!email || !username || !password || !confirmPassword) {
      setOut("SIGNUP ERROR:", { message: "Заполни все поля регистрации." }, "error");
      return;
    }

    if (!validatePasswordUI()) {
      setOut("SIGNUP ERROR:", { message: "Пароль слабый или подтверждение не совпадает." }, "error");
      return;
    }

    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          avatar_url: "assets/img/avatars/avatar.png"
        }
      }
    });

    if (error) {
      setOut("SIGNUP ERROR:", error, "error");
      return;
    }

    setOut("SIGNUP SUCCESS:", { message: "Account created. Check your email if confirmation is required." }, "success");

    if (data?.session) {
      location.href = "index.html";
    } else {
      openLogin();
    }
  });

  document.getElementById("login")?.addEventListener("click", async () => {
    const email = document.getElementById("login-email")?.value.trim();
    const password = document.getElementById("login-password")?.value;

    if (!email || !password) {
      setOut("LOGIN ERROR:", { message: "Введи email и password." }, "error");
      return;
    }

    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setOut("LOGIN ERROR:", error, "error");
      return;
    }

    setOut("LOGIN SUCCESS", { message: "Logged in successfully." }, "success");
    location.href = "index.html";
  });

  document.getElementById("logout")?.addEventListener("click", async () => {
    const { error } = await client.auth.signOut();

    if (error) {
      setOut("LOGOUT ERROR:", error, "error");
      return;
    }

    setOut("LOGOUT RESULT:", { ok: true }, "success");
  });

  document.getElementById("reset-password")?.addEventListener("click", async () => {
    const email = document.getElementById("login-email")?.value.trim();

    if (!email) {
      setOut("RESET ERROR:", { message: "Сначала введи email в поле Login." }, "error");
      return;
    }

    const { data, error } = await client.auth.resetPasswordForEmail(email, {
      redirectTo: getCleanLoginUrl()
    });

    if (error) {
      setOut("RESET ERROR:", error, "error");
      return;
    }

    setOut("RESET EMAIL SENT:", { message: `Письмо восстановления отправлено на ${email}.` }, "success");
  });

  const recoveryBox = document.getElementById("recoveryBox");
  const recoveryPasswordInput = document.getElementById("recovery-password");
  const recoveryConfirmInput = document.getElementById("recovery-confirm");
  const applyNewPasswordBtn = document.getElementById("apply-new-password");

  function openRecoveryMode() {
    if (recoveryBox) {
      recoveryBox.hidden = false;
    }

    openLogin();

    setOut("RECOVERY MODE:", {
      message: "Введи новый пароль и сохрани."
    }, "success");
  }

  if (isRecoveryUrl()) {
    openRecoveryMode();
  }

  client.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
      openRecoveryMode();
    }
  });

  applyNewPasswordBtn?.addEventListener("click", async () => {
    const password = recoveryPasswordInput?.value || "";
    const confirm = recoveryConfirmInput?.value || "";

    if (!password || !confirm) {
      setOut("RECOVERY ERROR:", { message: "Заполни оба поля нового пароля." }, "error");
      return;
    }

    if (password.length < 8) {
      setOut("RECOVERY ERROR:", { message: "Минимум 8 символов." }, "error");
      return;
    }

    if (password !== confirm) {
      setOut("RECOVERY ERROR:", { message: "Пароли не совпадают." }, "error");
      return;
    }

    const { data, error } = await client.auth.updateUser({
      password
    });

    if (error) {
      setOut("RECOVERY ERROR:", error, "error");
      return;
    }

    setOut("PASSWORD UPDATED:", { message: "Password updated successfully." }, "success");

    setTimeout(() => {
      location.href = "index.html";
    }, 700);
  });

  redirectIfLoggedIn();
})();