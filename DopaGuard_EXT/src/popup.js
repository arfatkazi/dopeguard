// =======================================================
// DopeGuard — popup.js (Stable / Final Version)
// =======================================================

import {
  extensionLogin,
  verifyExtensionToken,
  clearToken,
} from "./utils/auth.js";

// -------------------------------
// GET ELEMENT SAFE
// -------------------------------
const q = (x) => document.getElementById(x);

const el = {
  status: () => q("dg-status"),
  form: () => q("dg-login-form"),
  logout: () => q("dg-logout"),
  banner: () => q("inactive-banner"),
  email: () => q("dg-email"),
  pass: () => q("dg-password"),
  loginBtn: () => q("dg-login-btn"),
  toggleEye: () => q("toggle-pass"),
  eyePath: () => q("eye-path"),
};

// -------------------------------
// ICON PATHS
// -------------------------------
const EYE_OPEN =
  "M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12c-2.761 0-5-2.239-5-5s2.239-5 5-5 5 2.239 5 5-2.239 5-5 5zm0-8c-1.654 0-3 1.346-3 3s1.346 3 3 3 3-1.346 3-3-1.346-3-3-3z";

const EYE_CLOSED =
  "M2 3l20 18M9.5 9.5C10.6 8.4 11.9 8 13 8c2.761 0 5 2.239 5 5 0 1.1-0.4 2.4-1.5 3.5M6 6C3 8.5 1 12 1 12s3.367 7 11 7c1.2 0 2.4-0.2 3.5-0.6M2 21c2 0 4-1 6-3";

// -------------------------------
// UTIL
// -------------------------------
function text(elm, msg) {
  if (elm) elm.textContent = msg;
}

function show(elm) {
  if (elm) elm.style.display = "block";
}

function hide(elm) {
  if (elm) elm.style.display = "none";
}

function banner(msg) {
  if (!el.banner()) return;
  el.banner().textContent = msg;
  el.banner().style.display = "block";
}

function hideBanner() {
  if (!el.banner()) return;
  el.banner().style.display = "none";
  el.banner().textContent = "";
}

// -------------------------------
// MAIN UI UPDATE
// -------------------------------
async function updateUI() {
  const check = await verifyExtensionToken();

  if (check.success && check.active) {
    hideBanner();

    text(el.status(), `Active Plan: ${check.user?.plan ?? "Premium"}`);

    hide(el.form());
    show(el.logout());

    return;
  }

  // If logged in but subscription inactive
  if (check.success && !check.active) {
    banner("Your plan has expired");
    text(el.status(), "Subscription inactive");

    show(el.form());
    hide(el.logout());
    return;
  }

  // Not logged in
  text(el.status(), "Not logged in");
  hideBanner();

  show(el.form());
  hide(el.logout());
}

// -------------------------------
// LOGIN HANDLER
// -------------------------------
function setupLogin() {
  const form = el.form();
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideBanner();
    text(el.status(), "Checking…");

    const email = el.email()?.value.trim();
    const pass = el.pass()?.value;

    if (!email || !pass) {
      banner("Enter email & password");
      text(el.status(), "Not logged in");
      return;
    }

    let res;
    try {
      res = await extensionLogin(email, pass);
    } catch {
      banner("Network error");
      text(el.status(), "Login failed");
      return;
    }

    if (!res.success) {
      banner(res?.data?.message || "Invalid credentials");
      text(el.status(), "Login failed");
      return;
    }

    // Re-verify after storing token
    await new Promise((r) => setTimeout(r, 300));

    await updateUI();
  });
}

// -------------------------------
// LOGOUT HANDLER
// -------------------------------
function setupLogout() {
  const btn = el.logout();
  if (!btn) return;

  btn.addEventListener("click", async () => {
    await clearToken();

    hideBanner();
    text(el.status(), "Not logged in");

    show(el.form());
    hide(el.logout());
  });
}

// -------------------------------
// PASSWORD TOGGLE
// -------------------------------
function setupEye() {
  const toggle = el.toggleEye();
  const input = el.pass();
  const path = el.eyePath();

  if (!toggle || !input || !path) return;

  toggle.addEventListener("click", () => {
    const pw = input.type === "password";
    input.type = pw ? "text" : "password";
    path.setAttribute("d", pw ? EYE_CLOSED : EYE_OPEN);
  });
}

// -------------------------------
// INIT
// -------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  setupEye();
  setupLogin();
  setupLogout();

  await updateUI();
  setTimeout(updateUI, 300); // refresh after race
});
