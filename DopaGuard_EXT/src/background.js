// =============================================================
// 🧠 DopeGuard — Background Service Worker (v3 Extreme Defense)
// =============================================================
// Handles block counters, mode persistence, and auto-reset
// Keeps DopeGuard alive, stable, and ready for real-time AI defense

chrome.runtime.onInstalled.addListener((details) => {
  console.log("🧠 DopeGuard Installed — Always ON Protection");

  // Initialize storage values
  chrome.storage.local.set({
    blocksToday: 0,
    mode: "Auto",
    lastReset: Date.now(),
  });

  if (details.reason === "install") {
    console.log("✨ Fresh install detected");
  }
});

// =============================================================
// 📊 Handle Messages from Content Script
// =============================================================
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.action) return false;

  switch (msg.action) {
    // Increment block counter
    case "incrementBlock":
      chrome.storage.local.get(["blocksToday"], (data) => {
        const updated = (data.blocksToday || 0) + 1;
        chrome.storage.local.set({ blocksToday: updated }, () => {
          console.log(`🚫 Block count incremented → ${updated}`);
        });
      });
      break;

    // Return stats to popup
    case "getStats":
      chrome.storage.local.get(["blocksToday", "mode", "lastReset"], (data) => {
        sendResponse({
          blocksToday: data.blocksToday || 0,
          mode: data.mode || "Auto",
          lastReset: data.lastReset || Date.now(),
        });
      });
      return true; // keeps message channel alive

    // Manual counter reset (optional from popup)
    case "resetCounter":
      chrome.storage.local.set(
        { blocksToday: 0, lastReset: Date.now() },
        () => {
          console.log("♻️ Manual counter reset by user");
          sendResponse({ success: true });
        }
      );
      return true;

    default:
      console.warn("⚠️ Unknown message:", msg);
  }

  sendResponse({ success: true });
  return true;
});

// =============================================================
// ⏰ Auto-reset block counter every 24 hours
// =============================================================
const ONE_HOUR = 60 * 60 * 1000;
setInterval(() => {
  chrome.storage.local.get(["lastReset"], (data) => {
    const now = Date.now();
    if (!data.lastReset || now - data.lastReset > 24 * 60 * 60 * 1000) {
      chrome.storage.local.set({ blocksToday: 0, lastReset: now });
      console.log("🕛 DopeGuard: Block counter reset for new day");
    }
  });
}, ONE_HOUR);

// =============================================================
// ❤️ Keep service worker alive (heartbeat ping)
// =============================================================
setInterval(() => {
  chrome.runtime.getPlatformInfo(() => {});
}, 5 * 60 * 1000);
