import axios from "axios";

const API = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:5000";

/**
 * Simple authenticated API wrapper
 */
export async function request(path, options = {}) {
  const token = localStorage.getItem("dg_ext_token");

  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  return { ok: res.ok, status: res.status, data };
}
