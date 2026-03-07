// src/extension/utils/auth.js

import { getBackendUrl, DEFAULT_API } from "./backend.js";

let cachedApiBase = null;

async function apiBase() {
  if (cachedApiBase) return cachedApiBase;
  const resolved = await getBackendUrl();
  cachedApiBase = resolved || DEFAULT_API;
  return cachedApiBase;
}

/* ============================================================
   DEVICE ID (PERSIST FOREVER)
   ============================================================ */
export function getOrCreateDeviceId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["dg_device_id"], (res) => {
      let id = res?.dg_device_id;

      if (!id) {
        id = "dg-" + Math.random().toString(36).slice(2) + "-" + Date.now();
        chrome.storage.local.set({ dg_device_id: id });
      }

      resolve(id);
    });
  });
}

/* ============================================================
   TOKEN STORAGE HELPERS
   ============================================================ */
export function setToken(token) {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.set({ dg_token: token }, () => resolve(true));
    } catch {
      resolve(false);
    }
  });
}

export function getToken() {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get(["dg_token"], (res) => {
        resolve(res?.dg_token || null);
      });
    } catch {
      resolve(null);
    }
  });
}

export function clearToken() {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.remove(["dg_token"], () => resolve(true));
    } catch {
      resolve(false);
    }
  });
}

/* ============================================================
   EXTENSION LOGIN (EMAIL + PASSWORD)
   ============================================================ */
export async function extensionLogin(email, password) {
  try {
    const deviceId = await getOrCreateDeviceId();
    const deviceInfo = {
      deviceId,
      os: navigator.platform,
      browser: navigator.userAgent,
    };

    const api = await apiBase();
    const res = await fetch(`${api}/api/extension/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, deviceInfo }),
    });

    const data = await res.json().catch(() => ({}));

    // Login success
    if (res.ok && data.token) {
      await setToken(data.token);
      cachedApiBase = api;
      return {
        success: true,
        token: data.token,
        user: data.user,
      };
    }

    // Login failed
    return {
      success: false,
      message: data.message || "Invalid credentials",
      status: res.status,
    };
  } catch (err) {
    return {
      success: false,
      message: "Network error",
      error: err.message,
    };
  }
}

/* ============================================================
   VERIFY TOKEN WITH BACKEND
   ============================================================ */
export async function verifyExtensionToken() {
  try {
    const token = await getToken();
    if (!token) return { success: false, active: false };

    const api = await apiBase();
    const res = await fetch(`${api}/api/extension/verify`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));

    // Invalid or expired token
    if (res.status === 401 || res.status === 403) {
      await clearToken();
      return { success: false, active: false };
    }

    // Success response → return as-is
    return {
      success: true,
      active: data.active,
      user: data.user,
      message: data.message,
    };
  } catch (err) {
    return {
      success: false,
      active: false,
      message: "Network error",
    };
  }
}
