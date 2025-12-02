// ===============================================================
// DopeGuard — Extreme Defense Mode (v3.0, FIXED PRODUCTION BUILD)
// ===============================================================

// ----------------------------
// DISABLE SHIELD (INACTIVE PLAN)
// ----------------------------

import * as tf from "@tensorflow/tfjs";
import * as nsfwjs from "nsfwjs";

tf.disableDeprecationWarnings();

// Required for CSP-safe WASM backend:
tf.env().set("IS_BROWSER", true);
tf.env().set("IS_NODE", false);

// No WASM flags — removed

function disableShield() {
  console.log("DopeGuard: Shield disabled due to inactive subscription.");
  window.__DOPEGUARD_ACTIVE = false;

  if (window.__DG_OBSERVER) {
    window.__DG_OBSERVER.disconnect();
  }

  const blackout = document.getElementById("dopa-blackout");
  if (blackout) blackout.remove();

  console.warn("❌ DopeGuard is OFF — subscription inactive.");
}

// DO NOT block extension at global top-level (BUG FIXED)
// Now subscription check happens inside init()

// Utility URL loader
function safeURL(path) {
  try {
    return chrome?.runtime?.getURL(path) || path;
  } catch {
    return path;
  }
}

import { ADULT_KEYWORDS } from "./adult_keywords.js";

/* =============================================================
   CONFIG
   ============================================================= */
const PRED_THRESHOLD = 0.6;
const SCAN_INTERVAL_MS = 700;
const MIN_IMAGE_SIZE = 80;
const SRC_CACHE = new Map();
let nsfwModel = null;
window.__DOPEGUARD_ACTIVE = true;

// Model file (must exist inside extension/model/)
const MODEL_PATH = safeURL("model/model.json");

/* =============================================================
   SAFE_DOMAINS PLACEHOLDER (YOU WILL PASTE IT HERE)
   ============================================================= */
const SAFE_DOMAINS = new Set([
  /* ← PASTE YOUR SAFE_DOMAINS ARRAY HERE */

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
  "uidai.gov.in",
  "incometax.gov.in",
  "passportindia.gov.in",
  "digilocker.gov.in",
  "parivahan.gov.in",
  "rbi.org.in",
  "sebi.gov.in",
  "mygov.in",
  "india.gov.in",
  "practo.com",
  "1mg.com",
  "pharmeasy.in",
  "healthline.com",
  "webmd.com",
  "mayoclinic.org",
  "who.int",
  "cdc.gov",
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
  "weather.com",
  "speedtest.net",
  "archive.org",
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
]);

/* =============================================================
   RISKY_WORDS PLACEHOLDER (YOU WILL PASTE IT HERE)
   ============================================================= */
const RISKY_WORDS = [
  /* ← PASTE YOUR RISKY_WORDS ARRAY HERE */
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
  "pornhub",
  "pornhub.com",
  "pornhub.net",
  "pornhubpremium",
  "xvideos.com",
  "xnxx.com",
  "xhamster.com",
  "redtube.com",
  "tube8",
  "tube8.com",
  "youjizz",
  "youporn",
  "porntube",
  "eporner",
  "pornhd",
  "brazzers",
  "bangbros",
  "beeg",
  "porn4days",
  "fap",
  "fapster",
  "jav",
  "javhub",
  "javlibrary",
  "javhd",
  "chaturbate",
  "cam4",
  "camsoda",
  "camwhores",
  "bongacams",
  "livejasmin",
  "spankbang",
  "thumbzilla",
  "pornseed",
  "porndig",
  "porntrex",
  "porngo",
  "porndoe",
  "pornhd3x",
  "pornhub.org",
  "onlyfans.com",
  "fansly",
  "manyvids",
  "motherless",
  "xmegadrive",
  "xkeezmovies",
  "4tube",
  "4kporn",
  "hdporn",
  "freeones",
  "hentaifox",
  "pornsearch",
  "coomer",
  "nudostar",
  "adultfriendfinder",
  "hookup",
  "perverzija",
  "pornx",
  "pornvideo",
  "pornhits",
  "drtuber",
  "youjizz",
  ".xxx",
  ".porn",
  ".sex",
  ".adult",
  ".cam",
  ".tube",
  ".video",
  ".movie",
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
  // (add any other specific tokens you absolutely must include)
];

// compile regex
const RISKY_REGEX = new RegExp(
  RISKY_WORDS.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"),
  "i"
);

/* =============================================================
   UTILITIES
   ============================================================= */
function getImageSrc(el) {
  try {
    const styleBg = getComputedStyle(el).backgroundImage || "";
    const bg = styleBg.replace(/url\(["']?(.+?)["']?\)/, "$1") || "";
    return (el.currentSrc || el.src || el.srcset || bg || "").toString();
  } catch {
    return "";
  }
}

function isSafeElement(el) {
  try {
    const src = (getImageSrc(el) || "").toLowerCase();
    const cls = (el.className || "").toString();
    const id = (el.id || "").toString();
    return (
      src.includes("logo") ||
      src.includes("icon") ||
      src.includes("profile") ||
      src.includes("avatar") ||
      /(logo|icon|avatar|thumbnail)/i.test(cls) ||
      /(logo|icon|avatar)/i.test(id)
    );
  } catch {
    return false;
  }
}

function replaceWithBlocked(el) {
  try {
    const imgUrl = safeURL("dopeguard.jpg");
    if (!el) return;

    if (el.tagName === "IMG") {
      el.src = imgUrl;
      el.srcset = "";
      el.alt = "Blocked by DopeGuard";
    } else {
      el.style.setProperty(
        "background",
        `url('${imgUrl}') center / contain no-repeat`,
        "important"
      );
      el.innerHTML = "";
    }

    el.style.filter = "none";

    try {
      chrome.runtime.sendMessage({ action: "incrementBlock" });
    } catch {}
  } catch {}
}

/* =============================================================
   DETECTORS
   ============================================================= */
function detectBase64Images() {
  try {
    document.querySelectorAll("img").forEach((el) => {
      const src = el.src || "";
      if (src.startsWith("data:image/") && !isSafeElement(el)) {
        replaceWithBlocked(el);
      }
    });
  } catch {}
}

function detectCanvasDrawings() {
  try {
    document.querySelectorAll("canvas").forEach((canvas) => {
      try {
        const data = canvas.toDataURL?.("image/png");
        if (data && data.includes("base64")) replaceWithBlocked(canvas);
      } catch {}
    });
  } catch {}
}

function detectVideoPreviews() {
  try {
    document.querySelectorAll("video").forEach((v) => {
      const poster = v.getAttribute("poster");
      if (
        poster &&
        ADULT_KEYWORDS.some((kw) => poster.toLowerCase().includes(kw))
      ) {
        replaceWithBlocked(v);
      }
    });
  } catch {}
}

function scanByKeywords() {
  try {
    const imgs = document.querySelectorAll("img, [style*='background-image']");
    imgs.forEach((el) => {
      if (isSafeElement(el)) return;
      const src = (getImageSrc(el) || "").toLowerCase();
      if (!src) return;

      if (ADULT_KEYWORDS.some((kw) => src.includes(kw))) {
        replaceWithBlocked(el);
      }
    });
  } catch {}
}

/* =============================================================
   DOMAIN DETECTION
   ============================================================= */
function shouldActivate() {
  try {
    const url = location.href.toLowerCase();
    const title = document.title.toLowerCase();

    // SAFE domains skip scanning entirely
    for (const d of SAFE_DOMAINS) {
      if (url.includes(d)) return false;
    }

    // RISKY domain detection
    if (RISKY_REGEX.test(url)) return true;

    // Search engines
    try {
      const q = new URLSearchParams(window.location.search).get("q") || "";
      if (q.match(/sex|porn|fuck|xxx|nude|hentai|adult/i)) return true;
    } catch {}

    // fuzzy keyword detection
    for (const kw of ADULT_KEYWORDS) {
      const fuzzy = kw.replace(/(.)\1+/g, "$1");
      if (url.includes(fuzzy) || title.includes(fuzzy)) {
        if (/porn|sex|xxx|nsfw|hentai|adult|fuck|nude/.test(url + title))
          return true;
      }
    }
  } catch {}

  return false;
}

/* =============================================================
   SHIELD BLOCKING
   ============================================================= */
function createShield() {
  const shield = document.createElement("div");
  shield.id = "dopa-blackout";
  shield.style.cssText = `
    position:fixed;inset:0;z-index:2147483647;
    background:radial-gradient(circle at center,#0b0d12,#000);
    color:#2cf9a3;display:flex;flex-direction:column;
    align-items:center;justify-content:center;
    font-family:Inter,system-ui,sans-serif;opacity:0;
    transition:opacity .3s ease;user-select:none;cursor:none;
  `;

  shield.innerHTML = `
    <img src="${safeURL("dopeguard.jpg")}"
         style="width:100px;height:100px;border-radius:14px;margin-bottom:20px;">
    <h2 style="color:#cbd6e8;">🧠 DopeGuard Shield Activated</h2>
    <p style="color:#aebbd0;font-size:.95rem;">Explicit/distracting content detected.</p>
  `;

  return shield;
}

function enforceShield() {
  if (document.getElementById("dopa-blackout")) return;

  const shield = createShield();
  document.documentElement.appendChild(shield);

  requestAnimationFrame(() => (shield.style.opacity = "1"));

  // disable interactions
  const prevent = (e) => {
    e.preventDefault();
    e.stopImmediatePropagation();
    return false;
  };

  [
    "contextmenu",
    "keydown",
    "keyup",
    "copy",
    "cut",
    "paste",
    "click",
    "mousedown",
    "mouseup",
  ].forEach((ev) =>
    document.addEventListener(ev, prevent, { capture: true, passive: false })
  );

  try {
    document.body.style.pointerEvents = "none";
    document.body.style.overflow = "hidden";
  } catch {}

  // Self-heal observer
  const obs = new MutationObserver(() => {
    if (!document.getElementById("dopa-blackout")) {
      document.documentElement.appendChild(shield);
    }
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });

  window.__DG_OBSERVER = obs;
}

/* =============================================================
   AI MODEL LOADING
   ============================================================= */
async function ensureModel() {
  if (window.__DGModel) return window.__DGModel;
  if (nsfwModel) return nsfwModel;

  try {
    await tf.setBackend("wasm");
    await tf.ready();

    nsfwModel = await nsfwjs.load(MODEL_PATH, { size: 224 });
    window.__DGModel = nsfwModel;

    return nsfwModel;
  } catch (err) {
    console.warn("⚠ NSFW model failed to load:", err);
    return null;
  }
}

/* =============================================================
   MAIN SCANNING LOOP
   ============================================================= */
async function classifyBatch(elements) {
  const model = await ensureModel();
  if (!model) return;

  const batch = elements.slice(0, 20);

  await Promise.all(
    batch.map(async (el) => {
      try {
        const src = getImageSrc(el);
        if (!src || SRC_CACHE.has(src)) return;

        SRC_CACHE.set(src, false);

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;

        await new Promise((r) => {
          img.onload = r;
          img.onerror = r;
          setTimeout(r, 1500);
        });

        const preds = await model.classify(img);
        const bad = preds.some(
          (p) =>
            ["Porn", "Hentai", "Sexy"].includes(p.className) &&
            p.probability >= PRED_THRESHOLD
        );

        SRC_CACHE.set(src, bad);
        if (bad) replaceWithBlocked(el);
      } catch {}
    })
  );
}

async function scanLoop() {
  try {
    if (document.hidden) return;

    const host = location.hostname.toLowerCase();
    for (const d of SAFE_DOMAINS) if (host.includes(d)) return;

    detectBase64Images();
    detectCanvasDrawings();
    detectVideoPreviews();
    scanByKeywords();

    const imgs = Array.from(
      document.querySelectorAll("img,[style*='background-image']")
    );

    if (imgs.length > 300) return;

    const candidates = imgs.filter(
      (el) =>
        !el.dataset.dg_scanned &&
        el.clientWidth > MIN_IMAGE_SIZE &&
        el.clientHeight > MIN_IMAGE_SIZE &&
        !isSafeElement(el)
    );

    if (!candidates.length) return;

    candidates.forEach((el) => {
      el.dataset.dg_scanned = "1";
    });

    classifyBatch(candidates);
  } catch {}
}

/* =============================================================
   INIT (subscription check FIXED)
   ============================================================= */
(async function init() {
  try {
    const res = await chrome.runtime.sendMessage({ action: "verifyToken" });

    if (!res.success || !res.active) {
      console.warn("❌ Subscription inactive — disabling DopeGuard");
      disableShield();
      return;
    }

    window.__DOPEGUARD_ACTIVE = true;

    if (shouldActivate()) {
      enforceShield();
      return;
    }

    const target = document.body || document.documentElement;
    if (!target) {
      setTimeout(init, 500);
      return;
    }

    new MutationObserver(scanLoop).observe(target, {
      childList: true,
      subtree: true,
    });

    setInterval(scanLoop, SCAN_INTERVAL_MS);
    scanLoop();

    // SPA navigation watcher
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;

        if (shouldActivate()) enforceShield();
        else scanLoop();
      }
    }).observe(document, { childList: true, subtree: true });

    console.log("🛡️ DopeGuard Extreme Mode Active");
  } catch (err) {
    try {
      if (shouldActivate()) enforceShield();
    } catch {}
  }
})();
