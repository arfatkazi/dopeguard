import { getToken } from "./auth.js";

const API = "http://127.0.0.1:5000";

export async function request(path, options = {}) {
  const token = await getToken();

  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  return { ok: res.ok, status: res.status, data };
}

export function verifyPlan() {
  return request("/api/extension/verify");
}
