// popup.js (CSP-safe)
// Expects: ./utils/auth.js to export extensionLogin, verifyExtensionToken, clearToken
// (this file will be bundled by your build step if needed)

import {
  extensionLogin,
  verifyExtensionToken,
  clearToken,
} from "./utils/auth.js";

(function () {
  // --- Elements ---
  const statusEl = () => document.getElementById("dg-status");
  const formEl = () => document.getElementById("dg-login-form");
  const logoutEl = () => document.getElementById("dg-logout");
  const bannerEl = () => document.getElementById("inactive-banner");
  const emailEl = () => document.getElementById("dg-email");
  const passEl = () => document.getElementById("dg-password");
  const loginBtn = () => document.getElementById("dg-login-btn");
  const toggleEyeBtn = () => document.getElementById("toggle-pass");
  const eyePath = () => document.getElementById("eye-path");

  // --- SVG paths (no eval) ---
  const EYE_OPEN_PATH =
    "M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5zm0-8c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3z";
  const EYE_CLOSED_PATH =
    "M2 3l20 18M9.5 9.5C10.6 8.4 11.9 8 13 8c2.761 0 5 2.239 5 5 0 1.1-0.4 2.4-1.5 3.5M6 6C3 8.5 1 12 1 12s3.367 7 11 7c1.2 0 2.4-0.2 3.5-0.6M2 21c2 0 4-1 6-3";

  // --- Helpers ---
  function showInactiveBanner(message = "Your subscription is inactive") {
    const b = bannerEl();
    if (!b) return;
    b.style.display = "block";
    b.textContent = message;
  }

  function hideInactiveBanner() {
    const b = bannerEl();
    if (!b) return;
    b.style.display = "none";
    b.textContent = "";
  }

  function safeText(el, text) {
    if (!el) return;
    el.textContent = text;
  }

  async function safeVerify() {
    try {
      // verifyExtensionToken should return an object like { success: boolean, active: boolean, user: {...} }
      const resp = await verifyExtensionToken();
      return resp || { success: false, active: false };
    } catch (err) {
      console.warn("verifyExtensionToken failed:", err);
      return { success: false, active: false };
    }
  }

  async function updateUI() {
    const check = await safeVerify();

    if (check.success && check.active) {
      safeText(statusEl(), `Active Plan: ${check.user?.plan ?? "N/A"}`);
      hideInactiveBanner();
      if (formEl()) formEl().style.display = "none";
      if (logoutEl()) logoutEl().style.display = "block";
    } else {
      // not active OR not logged in
      if (check.success && !check.active) {
        safeText(statusEl(), "Subscription inactive");
        showInactiveBanner("Your plan has expired");
      } else {
        safeText(statusEl(), "Not logged in");
        hideInactiveBanner();
      }
      if (formEl()) formEl().style.display = "block";
      if (logoutEl()) logoutEl().style.display = "none";
    }
  }

  // --- Password eye toggle (no inline script) ---
  function setupEyeToggle() {
    const toggle = toggleEyeBtn();
    const input = passEl();
    const path = eyePath();

    if (!toggle || !input || !path) return;

    toggle.addEventListener("click", () => {
      try {
        const isPw = input.type === "password";
        input.type = isPw ? "text" : "password";
        path.setAttribute("d", isPw ? EYE_CLOSED_PATH : EYE_OPEN_PATH);
      } catch (err) {
        console.warn("eye toggle error:", err);
      }
    });
  }

  // --- Form submit / login flow ---
  function setupForm() {
    const form = formEl();
    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        safeText(statusEl(), "Checking…");
        hideInactiveBanner();

        const email = (emailEl() && emailEl().value.trim()) || "";
        const pass = (passEl() && passEl().value) || "";

        if (!email || !pass) {
          showInactiveBanner("Please enter email and password");
          safeText(statusEl(), "Not logged in");
          return;
        }

        // call extensionLogin - ensure it returns { success: bool, ... }
        let res;
        try {
          res = await extensionLogin(email, pass);
        } catch (err) {
          console.error("extensionLogin failed:", err);
          showInactiveBanner("Login failed (network)");
          safeText(statusEl(), "Login failed");
          return;
        }

        if (!res || !res.success) {
          showInactiveBanner(res?.message || "Invalid credentials");
          safeText(statusEl(), "Login failed");
          return;
        }

        // After successful login we should verify token is usable
        const check2 = await safeVerify();

        if (check2.success && check2.active) {
          hideInactiveBanner();
          safeText(statusEl(), `Active Plan: ${check2.user?.plan ?? "N/A"}`);
          if (formEl()) formEl().style.display = "none";
          if (logoutEl()) logoutEl().style.display = "block";
        } else if (check2.success && !check2.active) {
          showInactiveBanner("Your plan has expired");
          safeText(statusEl(), "Subscription inactive");
        } else {
          showInactiveBanner(
            "Login succeeded but no token saved (storage error)"
          );
          safeText(statusEl(), "Not logged in");
        }
      } catch (err) {
        console.error("login flow error:", err);
        showInactiveBanner("Unexpected error");
        safeText(statusEl(), "Not logged in");
      }
    });
  }

  // --- Logout setup ---
  function setupLogout() {
    const btn = logoutEl();
    if (!btn) return;
    btn.addEventListener("click", async () => {
      try {
        await clearToken();
      } catch (err) {
        console.warn("clearToken failed:", err);
      }
      hideInactiveBanner();
      safeText(statusEl(), "Not logged in");
      if (formEl()) formEl().style.display = "block";
      if (logoutEl()) logoutEl().style.display = "none";
    });
  }

  // --- Init ---
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      setupEyeToggle();
      setupForm();
      setupLogout();
      await updateUI();
      // extra: poll once after a short delay (helps with race conditions)
      setTimeout(updateUI, 600);
    } catch (err) {
      console.error("popup init failed:", err);
      safeText(statusEl(), "Error initializing");
    }
  });
})();
