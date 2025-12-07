document.addEventListener("DOMContentLoaded", () => {
  const blocksEl = document.getElementById("blocks");
  const modeEl = document.getElementById("mode");

  function updatePopup() {
    chrome.storage.local.get(["blocksToday", "mode"], (data) => {
      const blocks = data.blocksToday || 0;
      const mode = data.mode || "Auto";
      blocksEl.textContent = `Blocks today: ${blocks}`;
      modeEl.textContent = `Mode: ${mode}`;
    });
  }

  updatePopup();
  setInterval(updatePopup, 2000); // refresh every 2s while popup open
});
