const DEFAULT_API = "http://127.0.0.1:5000";

export async function getBackendUrl() {
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

export { DEFAULT_API };
