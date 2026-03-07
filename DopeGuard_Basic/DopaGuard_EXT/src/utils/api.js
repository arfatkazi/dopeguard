// src/utils/api.js  (BASIC extension)

const API_BASE = "http://127.0.0.1:5000"; // same as your backend dev URL

export async function verifyEssentialKey() {
  // read key that user pasted in extension (you already store it somewhere)
  const { essentialKey } = await chrome.storage.local.get("essentialKey");

  if (!essentialKey) {
    return {
      ok: true,
      status: 200,
      data: {
        valid: false,
        reason: "no_key",
      },
    };
  }

  try {
    const res = await fetch(
      `${API_BASE}/api/extension/starter/verify?key=${encodeURIComponent(
        essentialKey
      )}`,
      {
        method: "GET",
      }
    );

    const data = await res.json().catch(() => ({}));

    return {
      ok: res.ok,
      status: res.status,
      data,
    };
  } catch (error) {
    console.error("DopeGuard Essential: verify call failed", error);
    return {
      ok: false,
      status: 0,
      data: {
        valid: false,
        reason: "network_error",
      },
      error: error?.message || String(error),
    };
  }
}
