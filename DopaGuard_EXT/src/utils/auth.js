const API = "http://127.0.0.1:5000";

export function saveToken(token) {
  return chrome.storage.local.set({ dg_token: token });
}

export function getToken() {
  return new Promise((res) => {
    chrome.storage.local.get(["dg_token"], (d) => {
      res(d.dg_token || null);
    });
  });
}

export function clearToken() {
  return chrome.storage.local.remove("dg_token");
}

function getDeviceId() {
  return new Promise((res) => {
    chrome.storage.local.get(["dg_device"], (d) => {
      if (d.dg_device) return res(d.dg_device);

      const id = "dg_" + Math.random().toString(36).slice(2);
      chrome.storage.local.set({ dg_device: id }, () => res(id));
    });
  });
}

export async function extensionLogin(email, password) {
  const deviceId = await getDeviceId();

  const r = await fetch(`${API}/api/extension/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      deviceInfo: {
        deviceId,
        os: navigator.userAgent,
        browser: "Chrome Extension",
      },
    }),
  });

  const data = await r.json();
  if (!data.success) throw new Error(data.message);

  await saveToken(data.token);
  return data;
}

export async function verifyExtensionToken() {
  const token = await getToken();
  if (!token) return { success: false };

  const r = await fetch(`${API}/api/extension/verify`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return await r.json();
}
