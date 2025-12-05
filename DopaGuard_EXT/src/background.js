console.log("🧠 DopeGuard Background Loaded");

/* ============================================================
   SINGLE MESSAGE LISTENER
   Handles ALL extension events
   ============================================================ */
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.action) return false;

  /* ------------------------------------------------------------
     VERIFY TOKEN WITH BACKEND
     ------------------------------------------------------------ */
  if (msg.action === "verifyToken") {
    chrome.storage.local.get(["dg_token"], async (data) => {
      const token = data.dg_token;

      if (!token) {
        return sendResponse({ success: false, active: false });
      }

      try {
        const r = await fetch("http://127.0.0.1:5000/api/extension/verify", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await r.json();

        // If token invalid → clear it
        if (!json.success || json.active === false) {
          if (r.status === 401 || r.status === 403) {
            chrome.storage.local.remove(["dg_token"]);
          }
        }

        sendResponse(json);
      } catch (err) {
        sendResponse({ success: false, active: false });
      }
    });

    return true;
  }

  /* ------------------------------------------------------------
     INCREMENT LOCAL BLOCK COUNTER (Frontend UI Only)
     ------------------------------------------------------------ */
  if (msg.action === "incrementBlock") {
    chrome.storage.local.get(["blocksToday"], (data) => {
      const updated = (data.blocksToday || 0) + 1;
      chrome.storage.local.set({ blocksToday: updated });
    });

    sendResponse({ success: true });
    return true;
  }

  /* ------------------------------------------------------------
     SYNC BLOCKED SITE TO BACKEND (Analytics)
     ------------------------------------------------------------ */
  if (msg.action === "blockedSite") {
    chrome.storage.local.get(["dg_token"], async (st) => {
      if (!st.dg_token) return;

      try {
        await fetch("http://127.0.0.1:5000/api/activity", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${st.dg_token}`,
          },
          body: JSON.stringify({
            site: msg.site,
            duration: 0,
            blocked: true,
            timestamp: new Date().toISOString(),
          }),
        });

        console.log("📡 Synced blocked site →", msg.site);
      } catch (err) {
        console.error("❌ Activity sync failed:", err);
      }
    });

    sendResponse({ success: true });
    return true;
  }

  /* ------------------------------------------------------------
     GET LOCAL EXTENSION STATS
     ------------------------------------------------------------ */
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

  /* ------------------------------------------------------------
     RESET BLOCK COUNTER
     ------------------------------------------------------------ */
  if (msg.action === "resetCounter") {
    chrome.storage.local.set({ blocksToday: 0, lastReset: Date.now() });
    sendResponse({ success: true });
    return true;
  }

  return false;
});

/* ============================================================
   DAILY AUTO RESET
   ============================================================ */
const ONE_DAY = 24 * 60 * 60 * 1000;

setInterval(() => {
  chrome.storage.local.get(["lastReset"], (data) => {
    const now = Date.now();
    if (!data.lastReset || now - data.lastReset > ONE_DAY) {
      chrome.storage.local.set({
        blocksToday: 0,
        lastReset: now,
      });
      console.log("🕛 Daily block counter reset");
    }
  });
}, 60 * 60 * 1000);

/* ============================================================
   KEEP SERVICE WORKER ALIVE
   ============================================================ */
setInterval(() => chrome.runtime.getPlatformInfo(() => {}), 3 * 60 * 1000);

console.log("🎉 DopeGuard Background Active");
