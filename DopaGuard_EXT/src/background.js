console.log("🧠 DopeGuard Background Loaded");

// SINGLE MESSAGE LISTENER FOR EVERYTHING
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.action) return false;

  // -------------------------
  // 🔐 Verify Extension Token
  // -------------------------
  if (msg.action === "verifyToken") {
    chrome.storage.local.get(["dg_token"], async (data) => {
      const token = data.dg_token;
      if (!token) {
        return sendResponse({ success: false, active: false });
      }

      try {
        const r = await fetch("http://127.0.0.1:5000/api/extension/verify", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await r.json();
        sendResponse(json);
      } catch (err) {
        sendResponse({ success: false, active: false });
      }
    });
    return true;
  }

  // -------------------------
  // 🚫 Increment Block Counter
  // -------------------------
  if (msg.action === "incrementBlock") {
    chrome.storage.local.get(["blocksToday"], (data) => {
      const updated = (data.blocksToday || 0) + 1;
      chrome.storage.local.set({ blocksToday: updated }, () => {
        console.log(`🚫 Block count incremented → ${updated}`);
      });
    });
    sendResponse({ success: true });
    return true;
  }

  // -------------------------
  // 📊 Get Stats (popup)
  // -------------------------
  if (msg.action === "getStats") {
    chrome.storage.local.get(["blocksToday", "mode", "lastReset"], (data) => {
      sendResponse({
        blocksToday: data.blocksToday || 0,
        mode: data.mode || "Auto",
        lastReset: data.lastReset || Date.now(),
      });
    });
    return true;
  }

  // -------------------------
  // ♻️ Reset block counter
  // -------------------------
  if (msg.action === "resetCounter") {
    chrome.storage.local.set({ blocksToday: 0, lastReset: Date.now() }, () => {
      console.log("♻️ Counter reset");
      sendResponse({ success: true });
    });
    return true;
  }

  return false;
});

// -----------------------------------------
// ⏰ Auto-reset daily
// -----------------------------------------
const ONE_HOUR = 60 * 60 * 1000;
setInterval(() => {
  chrome.storage.local.get(["lastReset"], (data) => {
    const now = Date.now();
    if (!data.lastReset || now - data.lastReset > 24 * 60 * 60 * 1000) {
      chrome.storage.local.set({ blocksToday: 0, lastReset: now });
      console.log("🕛 Block counter reset for new day");
    }
  });
}, ONE_HOUR);

// -----------------------------------------
// ❤️ Keep SW alive
// -----------------------------------------
setInterval(() => chrome.runtime.getPlatformInfo(() => {}), 3 * 60 * 1000);
