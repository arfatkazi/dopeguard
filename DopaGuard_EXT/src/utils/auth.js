// src/utils/auth.js

const API = "http://127.0.0.1:5000"; // backend API

// ------------------------------
//  DEVICE ID GENERATION
// ------------------------------
async function getOrCreateDeviceId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["dg_device_id"], (res) => {
      let id = res?.dg_device_id;

      if (!id) {
        id = "dg-" + Math.random().toString(36).slice(2) + Date.now();
        chrome.storage.local.set({ dg_device_id: id });
      }

      resolve(id);
    });
  });
}

// ------------------------------
// TOKEN STORAGE HELPERS
// ------------------------------
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

// ------------------------------
//  EXTENSION LOGIN (FIXED)
// ------------------------------
export async function extensionLogin(email, password) {
  try {
    // Collect device info (WHAT BACKEND NEEDS)
    const deviceId = await getOrCreateDeviceId();
    const deviceInfo = {
      deviceId,
      os: navigator.platform,
      browser: navigator.userAgent,
    };

    const res = await fetch(`${API}/api/extension/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, deviceInfo }),
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && data.token) {
      await setToken(data.token);
      return { success: true, data };
    }

    return { success: false, data };
  } catch (err) {
    return { success: false, error: err.message || "Network error" };
  }
}

// ------------------------------
//  VERIFY TOKEN
// ------------------------------
export async function verifyExtensionToken() {
  try {
    const token = await getToken();
    if (!token) return { success: false, message: "No token" };

    const res = await fetch(`${API}/api/extension/verify`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) await clearToken();
      return { success: false, data, status: res.status };
    }

    return { success: true, ...data };
  } catch (err) {
    return { success: false, error: err.message || "Network error" };
  }
}
