document.addEventListener("DOMContentLoaded", () => {
  const blocksEl = document.getElementById("blocks");
  const modeEl = document.getElementById("mode");

  const keyInput = document.getElementById("essentialKeyInput");
  const saveBtn = document.getElementById("saveKeyBtn");
  const statusEl = document.getElementById("essentialStatus");

  // ===============================
  // 🔢 Stats (existing behavior)
  // ===============================
  function updatePopupStats() {
    chrome.storage.local.get(["blocksToday", "mode"], (data) => {
      const blocks = data.blocksToday || 0;
      const mode = data.mode || "Auto";
      blocksEl.textContent = `Blocks today: ${blocks}`;
      modeEl.textContent = `Mode: ${mode}`;
    });
  }

  // ===============================
  // 🔑 Load current Essential state
  // ===============================
  function loadEssentialStatus() {
    chrome.storage.local.get(
      ["essentialKey", "essentialActive", "essentialReason"],
      (data) => {
        // Pre-fill input if key already stored
        if (data.essentialKey) {
          keyInput.value = data.essentialKey;
        }

        let text = "Status: unknown";

        if (data.essentialActive === true) {
          text = "Status: ✅ Active";
        } else if (data.essentialActive === false) {
          text = `Status: ❌ Inactive (${data.essentialReason || "no_key"})`;
        }

        statusEl.textContent = text;
      }
    );
  }

  // ===============================
  // 💾 Save key + ask background to refresh
  // ===============================
  saveBtn.addEventListener("click", () => {
    const key = keyInput.value.trim();

    // 1️⃣ Always store whatever user typed (even empty)
    chrome.storage.local.set({ essentialKey: key }, () => {
      // 2️⃣ If key is empty → treat as "no subscription"
      if (!key) {
        chrome.storage.local.set(
          {
            essentialActive: false,
            essentialReason: "no_key",
          },
          () => {
            loadEssentialStatus(); // update text: Status: ❌ Inactive (no_key)
          }
        );
        return; // don't call backend
      }

      // 3️⃣ If key is not empty → ask background to verify with backend
      chrome.runtime.sendMessage(
        { action: "refreshEssentialStatus" },
        (resp) => {
          // After background finishes verifying, reload status
          loadEssentialStatus();
        }
      );
    });
  });

  // initial load
  updatePopupStats();
  loadEssentialStatus();

  // keep stats fresh while popup is open
  setInterval(updatePopupStats, 2000);
});
