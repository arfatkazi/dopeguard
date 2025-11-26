import {
  extensionLogin,
  verifyExtensionToken,
  clearToken,
} from "./utils/auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const status = document.getElementById("dg-status");
  const form = document.getElementById("dg-login-form");
  const logout = document.getElementById("dg-logout");

  const check = await verifyExtensionToken();

  if (check.success && check.active) {
    status.textContent = `Active Plan: ${check.user.plan}`;
    form.style.display = "none";
    logout.style.display = "block";
  } else {
    status.textContent = "Not logged in";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("dg-email").value.trim();
    const pass = document.getElementById("dg-password").value.trim();

    await extensionLogin(email, pass);

    status.textContent = "Active";
    form.style.display = "none";
    logout.style.display = "block";
  });

  logout.addEventListener("click", async () => {
    await clearToken();
    status.textContent = "Not logged in";
    form.style.display = "block";
    logout.style.display = "none";
  });
});
