// =============================================================
// 🧠 DopaGuard — Extreme Defense Mode (v3.0)
// =============================================================
// 🛡️ Fully unbypassable AI content shield
// - Blocks base64, lazy-loaded, and canvas NSFW
// - Detects adult keywords (even “sexxxxxx”, “fuckkkk”)
// - Self-heals and protects visual layer

import * as tf from "@tensorflow/tfjs";
import * as nsfwjs from "nsfwjs";
import { ADULT_KEYWORDS } from "./adult_keywords.js";

// =============================================================
// ⚙️ CONFIGURATION
// =============================================================
const PRED_THRESHOLD = 0.6;
const SCAN_INTERVAL_MS = 700;
const MIN_IMAGE_SIZE = 80;
const srcCache = new Map();
window.__DopaGuardActive = true;
let nsfwModel = null;

const SAFE_DOMAINS = [
  // 💼 Productivity / Work
  "gmail.com",
  "outlook.com",
  "office.com",
  "microsoft365.com",
  "notion.so",
  "slack.com",
  "zoom.us",
  "meet.google.com",
  "drive.google.com",
  "docs.google.com",
  "sheets.google.com",
  "forms.google.com",
  "calendar.google.com",
  "dropbox.com",
  "asana.com",
  "trello.com",
  "clickup.com",
  "calendly.com",
  "todoist.com",
  "airtable.com",

  // 📚 Education / Knowledge
  "wikipedia.org",
  "stackoverflow.com",
  "geeksforgeeks.org",
  "tutorialspoint.com",
  "w3schools.com",
  "javatpoint.com",
  "khanacademy.org",
  "byjus.com",
  "coursera.org",
  "udemy.com",
  "edx.org",
  "skillshare.com",
  "brilliant.org",
  "kaggle.com",
  "codecademy.com",
  "freecodecamp.org",
  "developer.mozilla.org",
  "mdn.dev",
  "medium.com",
  "quora.com",

  // 💳 Payments / Banking
  "razorpay.com",
  "stripe.com",
  "paypal.com",
  "paytm.com",
  "phonepe.com",
  "cashfree.com",
  "ccavenue.com",
  "payu.in",
  "googlepay.com",
  "amazonpay.in",
  "icicibank.com",
  "hdfcbank.com",
  "axisbank.com",
  "sbi.co.in",
  "kotak.com",
  "yesbank.in",
  "federalbank.co.in",
  "indusind.com",
  "bankofbaroda.in",
  "canarabank.com",
  "idfcfirstbank.com",

  // 🤖 AI / Tools
  "chat.openai.com",
  "openai.com",
  "gemini.google.com",
  "claude.ai",
  "perplexity.ai",
  "copilot.microsoft.com",
  "huggingface.co",
  "anthropic.com",
  "replit.com",
  "cursor.sh",
  "aicodebuddy.com",

  // 🧠 Developer / Tech
  "github.com",
  "gitlab.com",
  "bitbucket.org",
  "npmjs.com",
  "vercel.com",
  "railway.app",
  "netlify.app",
  "cloudflare.com",
  "digitalocean.com",
  "render.com",
  "supabase.com",
  "firebase.google.com",
  "mongodb.com",
  "atlas.mongodb.com",
  "postman.com",
  "swagger.io",
  "figma.com",
  "canva.com",

  // 🎬 Safe Media / Entertainment (Non-adult)
  "youtube.com",
  "music.youtube.com",
  "spotify.com",
  "netflix.com",
  "hotstar.com",
  "primevideo.com",
  "sonyliv.com",
  "zee5.com",
  "jiosaavn.com",
  "gaana.com",
  "wynk.in",

  // 🛒 Shopping / E-commerce
  "amazon.in",
  "amazon.com",
  "flipkart.com",
  "myntra.com",
  "ajio.com",
  "meesho.com",
  "nykaa.com",
  "bigbasket.com",
  "swiggy.com",
  "zomato.com",
  "blinkit.com",
  "dunzo.com",
  "tatacliq.com",
  "snapdeal.com",
  "croma.com",

  // 🗞️ News / Finance / Business
  "bbc.com",
  "cnn.com",
  "reuters.com",
  "bloomberg.com",
  "ndtv.com",
  "indiatimes.com",
  "timesofindia.com",
  "economictimes.indiatimes.com",
  "moneycontrol.com",
  "business-standard.com",
  "forbes.com",
  "investopedia.com",
  "marketwatch.com",

  // 🧾 Government / Utilities (India)
  "uidai.gov.in",
  "incometax.gov.in",
  "passportindia.gov.in",
  "digilocker.gov.in",
  "parivahan.gov.in",
  "rbi.org.in",
  "sebi.gov.in",
  "mygov.in",
  "india.gov.in",

  // 🏥 Health & Wellness
  "practo.com",
  "1mg.com",
  "pharmeasy.in",
  "healthline.com",
  "webmd.com",
  "mayoclinic.org",
  "who.int",
  "cdc.gov",

  // 🌍 Travel / Maps / Transport
  "irctc.co.in",
  "makemytrip.com",
  "goibibo.com",
  "yatra.com",
  "cleartrip.com",
  "booking.com",
  "tripadvisor.com",
  "airindia.com",
  "indigo.in",
  "goindigo.in",
  "googlemaps.com",
  "maps.google.com",
  "uber.com",
  "olaelectric.com",
  "olacabs.com",

  // 💡 Misc Safe Utilities
  "weather.com",
  "speedtest.net",
  "archive.org",
];

// =============================================================
// 🚀 SMART ENTRY LOGIC
// =============================================================
function shouldActivate() {
  const url = window.location.href.toLowerCase();
  const title = (document.title || "").toLowerCase();

  // Skip safe domains entirely
  if (SAFE_DOMAINS.some((d) => url.includes(d))) return false;

  // Step 1️⃣ – Direct domain-based trigger
  const riskyDomains = [
    "porn",
    "sex",
    "xxx",
    "xvideos",
    "xhamster",
    "redtube",
    "xnxx",
    "hentai",
    "nsfw",
    "fuck",
    "nude",
    "adult",
    "cam",
    "onlyfans",
    "erome",
    // Major networks / mainstream porn sites
    "pornhub",
    "pornhub.com",
    "pornhub.net",
    "pornhubpremium",
    "xvideos",
    "xvideos.com",
    "xnxx",
    "xnxx.com",
    "xhamster",
    "xhamster.com",
    "redtube",
    "redtube.com",
    "tube8",
    "tube8.com",
    "youjizz",
    "youjizz.com",
    "youporn",
    "youporn.com",
    "porn",
    "pornsite",
    "porntube",
    "porntube.com",
    "eporner",
    "eporner.com",
    "pornhd",
    "pornhd.com",
    "pornhubpremium",
    "pornhd3x",
    "brazzers",
    "brazzers.com",
    "brazzersnetwork",
    "bangbros",
    "bangbros.com",
    "beeg",
    "beeg.com",
    "porn4days",
    "porn4days.blue",
    "fap",
    "fapster",
    "fapello",
    "brazzer",
    "horny",
    "horny.com",

    // Japanese / JAV
    "jav",
    "javhub",
    "javlibrary",
    "javhd",
    "javfinder",
    "javseen",

    // Cam / Live networks
    "chaturbate",
    "cam4",
    "camsoda",
    "camwhores",
    "camsoda.com",
    "bongacams",
    "bongacams.com",
    "livejasmin",
    "camsoda",
    "camsoda.com",

    // Aggregators / smaller networks
    "xnxx.to",
    "xhamster2",
    "xhamster2.com",
    "xvideos2",
    "xvideos3",
    "spankbang",
    "spankbang.com",
    "thumbzilla",
    "thumbzilla.com",
    "eroticmv",
    "eroticmv.com",
    "pornseed",
    "pornseed.com",
    "porndig",
    "porndig.com",
    "porntrex",
    "porntrex.com",
    "porngo",
    "porngo.com",
    "porndoe",
    "porndoe.com",
    "pornhd3x",
    "pornhd.video",
    "pornhub.org",
    "pornhub.org",

    // Adult social / creator platforms
    "onlyfans",
    "onlyfans.com",
    "fansly",
    "fansly.com",
    "manyvids",
    "onlytik",

    // Niche / legacy / mirrors
    "motherless",
    "motherless.com",
    "xmegadrive",
    "xkeezmovies",
    "porntube",
    "porntube.com",
    "hugefree",
    "porndude",
    "porndude.link",
    "porndudelive",
    "4tube",
    "4tube.com",
    "4kporn",
    "4kporn.xxx",
    "hdporn",
    "hdporn.video",
    "tubeorigin",
    "tubeorigin.com",
    "freeones",
    "freeones",
    "freeones tube",

    // Hentai / anime-specific
    "hentai",
    "animeporn",
    "hentaifox",
    "hentaigasm",
    "hentaicafe",

    // Search & indexers of adult content
    "pornsearch",
    "pornsearcher",
    "pornfinder",

    // Misc / likely abusive domains
    "coomer",
    "coomer.su",
    "coomer.party",
    "nude",
    "nudostar",
    "nudostar.com",
    "sex",
    "sex.com",
    "sexvid",
    "sexvid.xxx",
    "sextu",
    "sexu",
    "sexhub",
    "xxx",
    "xxxhub",
    "xxxbunker",
    "xxxelf",
    "xxxfiles",
    "hotmovs",
    "hotjav",
    "hotfuck",
    "hotfucking",
    "pornrabbit",
    "pornflip",
    "pornve",
    "pornky",
    "pornve.com",
    "pornve.org",
    "pornlib",
    "pornlib.com",
    "pornseed",
    "pornseed.net",
    "pornve",
    "pornvibe",

    // Dating / hookup / adult social
    "adultfriendfinder",
    "adultfriendfinder.com",
    "hookup",
    "hookupfinder",

    // Other adult portals & mirrors detected commonly
    "pornez",
    "pornez.cam",
    "perverzija",
    "pornx",
    "pornx.com",
    "pornerbros",
    "pornerbros.com",
    "pornvideo",
    "pornvideo.com",
    "porndish",
    "porndish.com",
    "pornhits",
    "pornhits.com",
    "pornhubpremium",
    "pornhubpremium.com",
    "pornone",
    "pornone.com",

    // Misc popular ones mentioned in community lists
    "erome",
    "erome.com",
    "drtuber",
    "drtuber.desi",
    "netfap",
    "netfapx",
    "hclips",
    "hclips.com",
    "xart",
    "xart.com",
    "youjizz",
    "youjizz.com",
    "motherless",
    "motherless.com",
    "spankbang",
    "spankbang.com",
    "porntrex",
    "porntrex.com",
    "fux",
    "fux.com",
    "vxxx",
    "vxxx.com",

    // Useful catchwords (domain-like)
    "pornhub",
    "pornhub",
    "xvideos",
    "xnxx",
    "xhamster",
    "redtube",
    "brazzers",
    "xham",

    // Add common TLD variants to catch mirrors
    ".xxx",
    ".porn",
    ".sex",
    ".adult",
    ".cam",
    ".tube",
    ".video",
    ".movie",

    //social media often used for adult content sharing
    "https://x.com/",
    "https://www.snapchat.com/",
    "https://www.instagram.com/",
    "https://www.facebook.com/",
    "https://www.reddit.com/",
  ];
  if (riskyDomains.some((word) => new RegExp(`\\b${word}\\b`, "i").test(url))) {
    return true;
  }

  // Step 2️⃣ – Search query detection (for Google/Bing)
  try {
    const q = new URLSearchParams(window.location.search).get("q") || "";
    if (q.match(/sex|porn|fuck|xxx|nude|hentai|adult/i)) return true;
  } catch {}

  // Step 3️⃣ – Fuzzy detection (no overblocking)
  return ADULT_KEYWORDS.some((kw) => {
    const fuzzy = kw.replace(/(.)\1+/g, "$1"); // collapse repeating letters
    const clean = fuzzy.replace(/[^a-z0-9]/gi, "");
    const normalizedUrl = url.replace(/(.)\1+/g, "$1");
    const normalizedTitle = title.replace(/(.)\1+/g, "$1");

    // Match only if it's part of a clear adult word
    return (
      (normalizedUrl.includes(clean) &&
        /porn|sex|fuck|xxx|nude|hentai|nsfw|adult/.test(normalizedUrl)) ||
      (normalizedTitle.includes(clean) &&
        /porn|sex|fuck|xxx|nude|hentai|nsfw|adult/.test(normalizedTitle))
    );
  });
}

function startOrActivate() {
  const hostname = window.location.hostname;
  const url = window.location.href;

  if (hostname.includes("google.")) {
    const q = new URLSearchParams(window.location.search).get("q") || "";
    if (shouldActivate() || /sex|porn|xxx|nude|fuck/i.test(q)) {
      activateBlackScreen();
      return;
    }
  }

  shouldActivate() ? activateBlackScreen() : startDopaGuard();
}

// Initial run
startOrActivate();

// SPA URL watcher
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    startOrActivate();
  }
}).observe(document, { childList: true, subtree: true });

// =============================================================
// 🧱 SHIELD UI
// =============================================================
function safeGetURL(path) {
  try {
    if (chrome?.runtime?.getURL) return chrome.runtime.getURL(path);
  } catch {}
  return path;
}

function activateBlackScreen() {
  if (document.getElementById("dopa-blackout")) return;

  const shield = document.createElement("div");
  shield.id = "dopa-blackout";
  shield.style.cssText = `
    position:fixed;inset:0;width:100vw;height:100vh;
    background:radial-gradient(circle at center,#0b0d12,#000);
    color:#2cf9a3;display:flex;flex-direction:column;
    align-items:center;justify-content:center;
    z-index:2147483647;text-align:center;font-family:Inter,system-ui,sans-serif;
    opacity:0;transition:opacity 0.3s ease;user-select:none;cursor:none;
  `;
  shield.innerHTML = `
    <style>
      @keyframes glow {
        0%{box-shadow:0 0 6px #2cf9a3;}
        50%{box-shadow:0 0 22px #2cf9a3;}
        100%{box-shadow:0 0 6px #2cf9a3;}
      }
    </style>
    <img src="${safeGetURL("dopeguard.jpg")}" 
         style="width:100px;height:100px;border-radius:14px;margin-bottom:20px;animation:glow 2s infinite;" />
    <h2 style="color:#cbd6e8;">🧠 DopeGuard Shield Activated</h2>
    <p style="color:#aebbd0;font-size:0.98rem;margin-top:6px;">
      Explicit or distracting content detected.<br>
      Stay focused. Protect your mind. 💪
    </p>
  `;
  document.documentElement.appendChild(shield);
  requestAnimationFrame(() => (shield.style.opacity = "1"));

  // Disable all interactions completely
  const prevent = (e) => e.preventDefault();
  ["contextmenu", "keydown", "keyup", "copy", "cut", "paste"].forEach((ev) =>
    document.addEventListener(ev, prevent, { passive: false })
  );
  document.body.style.pointerEvents = "none";
  document.body.style.overflow = "hidden";

  // 🧱 MutationObserver: instantly re-add if deleted
  const obs = new MutationObserver(() => {
    if (!document.getElementById("dopa-blackout")) {
      console.warn("⚠️ Shield removed — restoring...");
      document.documentElement.appendChild(shield);
    }
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });

  // 🧠 DevTools detection (close or reload)
  setInterval(() => {
    const devtools = /./;
    devtools.toString = function () {
      // If console is open, trigger blackout again
      console.warn("🚫 DevTools detected!");
      location.href = "about:blank"; // or window.close() if allowed
    };
    console.log("%c", devtools);
  }, 2000);

  // 🧩 Disable console entirely
  ["log", "warn", "error", "info", "clear"].forEach((fn) => {
    console[fn] = () => {};
  });

  // 🩹 Extra: periodic integrity check
  setInterval(() => {
    if (!document.contains(shield)) {
      document.documentElement.appendChild(shield);
    }
  }, 500);
}

// =============================================================
// 🤖 AI MODEL & CLASSIFICATION
// =============================================================
async function ensureModel() {
  if (window.__DGModel) return window.__DGModel;
  console.log("🧠 Loading NSFW model...");
  await tf.setBackend("webgl").catch(() => tf.setBackend("wasm"));

  await tf.ready();
  window.__DGModel = await nsfwjs.load(undefined, { size: 224 });
  console.log("✅ Model ready");
  return window.__DGModel;
}

function getImageSrc(el) {
  return (
    el.currentSrc ||
    el.src ||
    el.srcset ||
    (getComputedStyle(el).backgroundImage || "").replace(
      /url\\(["']?(.+?)["']?\\)/,
      "$1"
    ) ||
    ""
  );
}

function isSafeElement(el) {
  const src = getImageSrc(el).toLowerCase();
  const cls = el.className || "";
  const id = el.id || "";
  return (
    src.includes("logo") ||
    src.includes("icon") ||
    src.includes("profile") ||
    src.includes("avatar") ||
    cls.match(/(logo|icon|avatar|thumbnail)/i) ||
    id.match(/(logo|icon|avatar)/i)
  );
}

function replaceWithBlocked(el) {
  const imgUrl = safeGetURL("dopeguard.jpg");
  if (el.tagName === "IMG") {
    el.src = imgUrl;
    el.srcset = "";
  } else {
    el.style.background = `url('${imgUrl}') center / contain no-repeat !important`;
  }
  el.style.filter = "none";
  try {
    chrome.runtime.sendMessage({ action: "incrementBlock" });
  } catch {}
}

// =============================================================
// ⚡ EXTREME DEFENSE: Base64, Canvas, Lazy Videos
// =============================================================
function detectBase64Images() {
  const base64Els = [...document.querySelectorAll("img")].filter((el) =>
    el.src.startsWith("data:image/")
  );
  base64Els.forEach(replaceWithBlocked);
}

function detectCanvasDrawings() {
  const canvases = [...document.querySelectorAll("canvas")];
  canvases.forEach((canvas) => {
    try {
      const data = canvas.toDataURL("image/png");
      if (data.includes("base64")) replaceWithBlocked(canvas);
    } catch {}
  });
}

function detectVideoPreviews() {
  const videos = [...document.querySelectorAll("video")];
  videos.forEach((v) => {
    const poster = v.getAttribute("poster");
    if (poster && ADULT_KEYWORDS.some((kw) => poster.includes(kw))) {
      replaceWithBlocked(v);
    }
  });
}

// =============================================================
// ⚡ INSTANT HEURISTIC BLOCK (FAST DETECTOR)
// =============================================================
function instantHeuristicBlock(el) {
  const src = getImageSrc(el)?.toLowerCase();
  const alt = (el.alt || "").toLowerCase();
  const textAround = el.closest("a,div,figure")?.innerText?.toLowerCase() || "";

  if (!src) return false;

  // 1️⃣ Check file name or URL hints
  const badHints = [
    "porn",
    "sex",
    "boobs",
    "nude",
    "hentai",
    "xxx",
    "fuck",
    "anal",
    "ass",
    "pussy",
    "nsfw",
    "adult",
    "dick",
    "cock",
    "naked",
    "milf",
    "cam",
    "bj",
  ];
  if (
    badHints.some(
      (w) => src.includes(w) || alt.includes(w) || textAround.includes(w)
    )
  ) {
    replaceWithBlocked(el);
    return true;
  }

  // 2️⃣ Base64 or suspicious domain
  if (src.startsWith("data:image/") || src.includes("base64")) {
    replaceWithBlocked(el);
    return true;
  }

  // 3️⃣ Unusually large media (often explicit)
  if (el.clientWidth > 400 && el.clientHeight > 300 && !isSafeElement(el)) {
    el.style.filter = "blur(25px)";
    el.dataset.dg_tempBlur = "1";
    return false; // mark for deeper scan
  }

  return false;
}

// =============================================================
// 🧩 MAIN AI LOOP
// =============================================================
async function classifyBatch(elements) {
  const model = await ensureModel();
  const batch = elements.slice(0, 20);
  await Promise.all(
    batch.map(async (el) => {
      try {
        const src = getImageSrc(el);
        if (!src || srcCache.has(src)) return;
        srcCache.set(src, false);

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        await new Promise((r, rej) => {
          img.onload = r;
          img.onerror = rej;
          setTimeout(rej, 2000);
        });

        const preds = await model.classify(img);
        const bad = preds.some(
          (r) =>
            ["Porn", "Hentai", "Sexy"].includes(r.className) &&
            r.probability >= PRED_THRESHOLD
        );

        srcCache.set(src, bad);
        if (bad) replaceWithBlocked(el);
      } catch {}
    })
  );
}

async function scanLoop() {
  if (document.hidden) return;
  const host = window.location.hostname.toLowerCase();
  if (SAFE_DOMAINS.some((d) => host.includes(d))) return; // ✅ skip safe domains like YouTube

  detectBase64Images();
  detectCanvasDrawings();
  detectVideoPreviews();

  const imgs = [
    ...document.querySelectorAll("img,[style*='background-image']"),
  ];

  if (imgs.length > 300) return; // Skip pages with tons of media (e.g., YouTube)
  const candidates = imgs.filter(
    (el) =>
      !el.dataset.dg_scanned &&
      el.clientWidth > MIN_IMAGE_SIZE &&
      el.clientHeight > MIN_IMAGE_SIZE &&
      !isSafeElement(el)
  );

  if (!candidates.length) return;

  // ✅ Loop through each new image candidate
  for (const el of candidates) {
    el.dataset.dg_scanned = "1";

    // ⚡ Instant heuristic block (super fast)
    const instantlyBlocked = instantHeuristicBlock(el);
    if (instantlyBlocked) continue; // already blocked, skip AI check
  }

  // 🧠 Run AI model after 300ms to verify blurred or unknown ones
  setTimeout(() => classifyBatch(candidates), 300);
}

function startDopaGuard() {
  const target = document.body || document.documentElement;
  if (!target) return setTimeout(startDopaGuard, 500);

  new MutationObserver(scanLoop).observe(target, {
    childList: true,
    subtree: true,
  });

  setInterval(scanLoop, SCAN_INTERVAL_MS);
  console.log("🛡️ DopeGuard Extreme Mode Active");
}
