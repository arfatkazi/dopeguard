import { getToken } from "./auth.js";

const DEFAULT_API = "http://127.0.0.1:5000";

async function resolveApiBase() {
  try {
    if (typeof chrome !== "undefined" && chrome.storage?.sync) {
      const stored = await new Promise((resolve) => {
        try {
          chrome.storage.sync.get(["backend_url"], resolve);
        } catch (err) {
          resolve({ error: err });
        }
      });

      const configured = stored?.backend_url;
      if (configured && typeof configured === "string") {
        return configured.replace(/\/+$/, "");
      }
    }
  } catch (error) {
    console.warn("DopeGuard: failed to read backend URL", error);
  }

  return DEFAULT_API;
}

export async function request(path, options = {}) {
  const token = await getToken();
  const apiBase = await resolveApiBase();

  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${apiBase}${path}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    console.error("DopeGuard: API request failed", error);
    return {
      ok: false,
      status: 0,
      data: { message: "Unable to reach DopeGuard backend." },
      error: error?.message || String(error),
    };
  }
}

export function verifyPlan() {
  return request("/api/extension/verify");
}
