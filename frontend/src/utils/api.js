// src/utils/api.js
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

/**
 * Get auth token stored from login (web side)
 * Adjust key name if you use a different one.
 */
export function getAuthToken() {
  return localStorage.getItem("dg_ext_token") || "";
}

/**
 * Generic JSON request helper
 */
export async function apiRequest(path, options = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  const isJson = res.headers
    .get("content-type")
    ?.toLowerCase()
    .includes("application/json");

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    if (isJson) {
      const data = await res.json().catch(() => ({}));
      message = data.message || message;
    }
    throw new Error(message);
  }

  return isJson ? res.json() : res.text();
}

/**
 * Download helper for blob (zip files)
 */
export async function downloadFile(path, filename) {
  const token = getAuthToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    credentials: "include",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  if (!res.ok) {
    throw new Error(`Download failed (${res.status})`);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
