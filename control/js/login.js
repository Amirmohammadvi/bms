/* ============================================================
   Login overlay - demo mode (ظاهری، بدون بررسی واقعی رمز عبور)
   ============================================================ */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const overlay = $("loginOverlay");
  if (!overlay) return;

  const form = $("loginForm");
  const user = $("loginUser");
  const pass = $("loginPass");
  const err = $("loginError");
  const box = overlay.querySelector(".login-box");
  const btn = $("loginBtn");
  const btnText = $("loginBtnText");
  const spinner = $("loginSpinner");

  function showError(msg) {
    err.querySelector("span").textContent = msg;
    err.classList.add("show");
    box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake");
  }

  $("loginTogglePass").addEventListener("click", () => {
    const isPw = pass.type === "password";
    pass.type = isPw ? "text" : "password";
    $("loginTogglePass").innerHTML = `<i class="fa-regular ${isPw ? "fa-eye-slash" : "fa-eye"}"></i>`;
  });

  $("loginForgot").addEventListener("click", (e) => {
    e.preventDefault();
    showError("برای بازیابی رمز عبور با پشتیبانی سیستم تماس بگیرید.");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    err.classList.remove("show");

    if (!user.value.trim() || !pass.value.trim()) {
      showError("لطفاً نام کاربری و رمز عبور را وارد کنید.");
      return;
    }

    // دمو: هر نام کاربری/رمز عبوری پذیرفته می‌شود (بررسی واقعی بعداً به WinCC/بک‌اند وصل می‌شود)
    btn.disabled = true;
    btnText.textContent = "در حال ورود...";
    spinner.style.display = "inline-block";

    setTimeout(() => {
      overlay.classList.add("hidden");
      btn.disabled = false;
      btnText.textContent = "ورود به سامانه";
      spinner.style.display = "none";
    }, 700);
  });

  window.BankBMSLogin = {
    show: () => overlay.classList.remove("hidden"),
    hide: () => overlay.classList.add("hidden"),
  };
})();
