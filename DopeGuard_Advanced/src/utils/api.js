import { getToken } from "./auth.js";
import { getBackendUrl } from "./backend.js";

async function resolveApiBase() {
  return getBackendUrl();
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

export { resolveApiBase };
