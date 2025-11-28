// src/content_entry.js
// DopeGuard — Extreme Defense Mode (v3.0, FINAL)
// ⚠ Unbypassable edition — lazy model loaded from local extension model folder
// Load TF + NSFW as global scripts

function safeURL(path) {
  try {
    return chrome?.runtime?.getURL(path) || path;
  } catch (e) {
    return path;
  }
}

function injectScript(filePath) {
  const s = document.createElement("script");
  s.src = safeURL(filePath);
  s.type = "text/javascript";
  document.documentElement.appendChild(s);
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
window.__DopaGuardActive = true;

// MODEL: local path inside extension (you must include model files in extension/model/)
const MODEL_PATH = chrome?.runtime?.getURL
  ? safeURL("model/model.json")
  : "model/model.json";

/* =============================================================
   SAFE DOMAINS (your curated list)
   ============================================================= */
const SAFE_DOMAINS = new Set([
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
   RISKY DOMAINS: precompile regexes to avoid allocating per navigation
   (keeps semantics identical to your big list but faster)
   ============================================================= */
const RISKY_WORDS = [
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

// compile into a single regex anchored word boundaries — safer and faster to test
const RISKY_REGEX = new RegExp(
  RISKY_WORDS.map(
    (w) =>
      w
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&") // escape meta
        .replace(/\\\./g, "\\.") // keep literal dots
  ).join("|"),
  "i"
);

/* =============================================================
   UTILITIES
   ============================================================= */
function safeGetURL(path) {
  try {
    if (chrome?.runtime?.getURL) return safeURL(path);
  } catch {}
  return path;
}

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
    const imgUrl = safeGetURL("dopeguard.jpg");
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
    const imgs = Array.from(document.querySelectorAll("img"));
    imgs.forEach((el) => {
      try {
        const src = el.src || "";
        if (src.startsWith("data:image/") && !isSafeElement(el))
          replaceWithBlocked(el);
      } catch {}
    });
  } catch {}
}

function detectCanvasDrawings() {
  try {
    const canvases = Array.from(document.querySelectorAll("canvas"));
    canvases.forEach((canvas) => {
      try {
        const data = canvas.toDataURL && canvas.toDataURL("image/png");
        if (data && data.includes("base64")) replaceWithBlocked(canvas);
      } catch {}
    });
  } catch {}
}

function detectVideoPreviews() {
  try {
    const videos = Array.from(document.querySelectorAll("video"));
    videos.forEach((v) => {
      try {
        const poster = v.getAttribute && v.getAttribute("poster");
        if (
          poster &&
          ADULT_KEYWORDS.some((kw) => poster.toLowerCase().includes(kw))
        ) {
          replaceWithBlocked(v);
        }
      } catch {}
    });
  } catch {}
}

function scanByKeywords() {
  try {
    const imgs = Array.from(
      document.querySelectorAll("img, [style*='background-image']")
    );
    imgs.forEach((el) => {
      try {
        if (isSafeElement(el)) return;
        const src = (getImageSrc(el) || "").toLowerCase();
        if (!src) return;
        if (ADULT_KEYWORDS.some((kw) => src.includes(kw)))
          replaceWithBlocked(el);
      } catch {}
    });
  } catch {}
}

/* =============================================================
   RISKY DOMAIN / SEARCH / FUZZY CHECK
   ============================================================= */
function shouldActivate() {
  try {
    const url = (window.location.href || "").toLowerCase();
    const title = (document.title || "").toLowerCase();

    // Skip safe domains
    for (const d of SAFE_DOMAINS) {
      if (url.includes(d)) return false;
    }

    // Direct risky domain regex (fast)
    if (RISKY_REGEX.test(url)) return true;

    // Search query detection (Google/Bing)
    try {
      const q = new URLSearchParams(window.location.search).get("q") || "";
      if (q.match(/sex|porn|fuck|xxx|nude|hentai|adult/i)) return true;
    } catch {}

    // Fuzzy ADULT_KEYWORDS detection (collapse repeated letters)
    for (const kw of ADULT_KEYWORDS) {
      const fuzzy = kw.replace(/(.)\1+/g, "$1").replace(/[^a-z0-9]/gi, "");
      const normalizedUrl = url.replace(/(.)\1+/g, "$1");
      const normalizedTitle = title.replace(/(.)\1+/g, "$1");
      if (
        (fuzzy &&
          normalizedUrl.includes(fuzzy) &&
          /porn|sex|fuck|xxx|nude|hentai|nsfw|adult/.test(normalizedUrl)) ||
        (fuzzy &&
          normalizedTitle.includes(fuzzy) &&
          /porn|sex|fuck|xxx|nude|hentai|nsfw|adult/.test(normalizedTitle))
      ) {
        return true;
      }
    }
  } catch {}
  return false;
}

/* =============================================================
   SHIELD (UNBYPASSABLE): UI, DevTools trap, console override, self-heal
   ============================================================= */
function createShield() {
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
  return shield;
}

function enforceShield() {
  try {
    if (document.getElementById("dopa-blackout")) return;
    const shield = createShield();
    document.documentElement.appendChild(shield);
    requestAnimationFrame(() => (shield.style.opacity = "1"));

    // Disable interactions
    const prevent = (e) => {
      try {
        e.preventDefault();
        e.stopImmediatePropagation();
      } catch {}
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

    // MutationObserver: restore shield if removed
    const obs = new MutationObserver(() => {
      if (!document.getElementById("dopa-blackout")) {
        try {
          document.documentElement.appendChild(shield);
        } catch {}
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });

    // Integrity interval: reattach if missing
    const integrity = setInterval(() => {
      if (!document.contains(shield)) {
        try {
          document.documentElement.appendChild(shield);
        } catch {}
      }
    }, 500);

    // DevTools trap — highly aggressive: forces about:blank if devtools open
    const devtoolsCheck = () => {
      try {
        const devtools = /./;
        devtools.toString = function () {
          // When String(devtools) is requested by console, this executes
          try {
            console.warn("🚫 DevTools detected! Locking page.");
          } catch {}
          try {
            location.href = "about:blank";
          } catch {}
        };
        // trigger console evaluation — if console open, this will call toString
        console.log("%c", devtools);
      } catch {}
    };
    const devtoolsInterval = setInterval(devtoolsCheck, 2000);

    // Disable console methods to make debugging harder
    ["log", "warn", "error", "info", "debug", "clear"].forEach((fn) => {
      try {
        console[fn] = function () {};
      } catch {}
    });

    // ensure cleanup is not possible by user code
    // keep references alive on window
    try {
      window.__DG_SHIELD = { obs, integrity, devtoolsInterval, shield };
    } catch {}
  } catch {}
}

/* =============================================================
   AI MODEL LOADING (lazy) — loads from local MODEL_PATH
   ============================================================= */

async function ensureModel() {
  if (window.__DGModel) return window.__DGModel;
  if (nsfwModel) return nsfwModel;

  // Build the extension-local model.json URL
  const modelUrl = (() => {
    try {
      return chrome?.runtime?.getURL
        ? safeURL("model/model.json")
        : "model/model.json";
    } catch (e) {
      return "model/model.json";
    }
  })();

  try {
    console.log("🧠 DopeGuard — loading local NSFW model from:", modelUrl);

    // Ensure TF backend (prefer webgl)
    await tf.setBackend("wasm");
    await tf.ready();

    // IMPORTANT: pass the explicit model.json URL so nsfwjs loads from the extension
    nsfwModel = await nsfwjs.load(modelUrl, { size: 224 });
    window.__DGModel = nsfwModel;
    console.log("✅ DopeGuard — local model ready");
    return nsfwModel;
  } catch (err) {
    console.warn("DopeGuard — model load failed:", err);
    return null;
  }
}

async function classifyElement(el) {
  try {
    const src = getImageSrc(el);
    if (!src) return false;
    if (SRC_CACHE.has(src)) return SRC_CACHE.get(src);

    // fetch the image into an HTMLImageElement
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;

    await new Promise((res, rej) => {
      img.onload = res;
      img.onerror = rej;
      setTimeout(res, 2000);
    });

    const model = await ensureModel();
    if (!model) return false;

    const preds = await model.classify(img);
    const bad = preds.some(
      (p) =>
        ["Porn", "Hentai", "Sexy"].includes(p.className) &&
        p.probability >= PRED_THRESHOLD
    );
    SRC_CACHE.set(src, bad);
    return bad;
  } catch (err) {
    return false;
  }
}

/* =============================================================
   HEURISTICS & CLASSIFICATION LOOP
   ============================================================= */
function instantHeuristicBlock(el) {
  try {
    const src = (getImageSrc(el) || "").toLowerCase();
    const alt = (el.alt || "").toLowerCase();
    const textAround =
      (
        el.closest &&
        (el.closest("a,div,figure")?.innerText || "")
      ).toLowerCase() || "";

    if (!src) return false;

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
    for (const w of badHints) {
      if (src.includes(w) || alt.includes(w) || textAround.includes(w)) {
        replaceWithBlocked(el);
        return true;
      }
    }

    if (src.startsWith("data:image/") || src.includes("base64")) {
      replaceWithBlocked(el);
      return true;
    }

    if (el.clientWidth > 400 && el.clientHeight > 300 && !isSafeElement(el)) {
      try {
        el.style.filter = "blur(25px)";
        el.dataset.dg_tempBlur = "1";
      } catch {}
      return false;
    }
  } catch {}
  return false;
}

async function classifyBatch(elements) {
  try {
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

          await new Promise((r, rej) => {
            img.onload = r;
            img.onerror = rej;
            setTimeout(r, 2000);
          });

          const preds = await model.classify(img);
          const bad = preds.some(
            (r) =>
              ["Porn", "Hentai", "Sexy"].includes(r.className) &&
              r.probability >= PRED_THRESHOLD
          );

          SRC_CACHE.set(src, bad);
          if (bad) replaceWithBlocked(el);
        } catch {}
      })
    ); // <-- Correct closing
  } catch {}
}

async function scanLoop() {
  try {
    if (document.hidden) return;
    const host = (window.location.hostname || "").toLowerCase();
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

    for (const el of candidates) {
      try {
        el.dataset.dg_scanned = "1";
        if (instantHeuristicBlock(el)) continue;
      } catch {}
    }

    setTimeout(() => classifyBatch(candidates), 300);
  } catch {}
}

/* =============================================================
   START / SPA WATCHER
   ============================================================= */
(async function init() {
  try {
    const res = await chrome.runtime.sendMessage({ action: "verifyToken" });
    if (!res.success || !res.active) {
      // not active — do not run shield
      console.warn("DopeGuard disabled — no subscription");
      return;
    }

    // If shouldActivate decides the page is risky, immediately enforce shield (domain-level blocking)
    if (shouldActivate()) {
      enforceShield();
      return;
    }

    // Otherwise, start scanning loop and keep watchers
    const target = document.body || document.documentElement;
    if (!target) {
      setTimeout(init, 500);
      return;
    }

    new MutationObserver(() => {
      try {
        scanLoop();
      } catch {}
    }).observe(target, { childList: true, subtree: true });

    setInterval(scanLoop, SCAN_INTERVAL_MS);
    // initial scan
    scanLoop();

    // SPA URL watcher: run shouldActivate on navigation, and lock if necessary
    let lastUrl = location.href;
    new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        try {
          if (shouldActivate()) enforceShield();
          else scanLoop();
        } catch {}
      }
    }).observe(document, { childList: true, subtree: true });

    console.log("🛡️ DopeGuard Extreme Mode Active");
  } catch (err) {
    // fail-safe: if anything throws, ensure we do not leave the page unguarded in certain cases
    try {
      if (shouldActivate()) enforceShield();
    } catch {}
  }
})();
