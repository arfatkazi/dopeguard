let tf = null;
let nsfwjs = null;

console.log("DopeGuard: Waiting for TF…");

function waitForTF(timeoutMs = 8000) {
  const start = Date.now();

  return new Promise((resolve) => {
    const check = () => {
      if (window.tf && window.nsfwjs && typeof window.tf.ready === "function") {
        tf = window.tf;
        nsfwjs = window.nsfwjs;
        console.log("DopeGuard: TensorFlow + NSFWJS ready");
        try {
          if (tf && typeof tf.env === "function") {
            const env = tf.env();
            if (env?.set) {
              // Required for CSP-safe WASM backend when available
              env.set("IS_BROWSER", true);
              env.set("IS_NODE", false);
            }
          }
        } catch (e) {
          console.warn("TF env not ready", e);
        }
        resolve(true);

        return;
      }

      if (Date.now() - start > timeoutMs) {
        console.warn("DopeGuard: TensorFlow stack not available (timeout)");
        resolve(false);
        return;
      }

      setTimeout(check, 50);
    };

    check();
  });
}

try {
  if (tf?.disableDeprecationWarnings) tf.disableDeprecationWarnings();
} catch (e) {
  console.log(e);
}

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

chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.action === "dg_logout") {
    disableShield();
  }
});

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

const ADULT_KEYWORDS = window.ADULT_KEYWORDS || [];

const TF_SCRIPTS = [
  "libs/tf-core.min.js",
  "libs/tf-converter.min.js",
  "libs/tf-backend-cpu.min.js",
  "libs/nsfwjs.min.js",
];

const CAN_EVAL = (() => {
  try {
    // CSP that blocks eval will throw here
    new Function("return true")();
    return true;
  } catch {
    return false;
  }
})();

let tfStackPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = safeURL(src);
    script.onload = () => resolve(true);
    script.onerror = (err) => reject(err);
    (document.head || document.documentElement).appendChild(script);
  });
}

async function ensureTFStack() {
  if (tfStackPromise) return tfStackPromise;

  tfStackPromise = (async () => {
    if (!CAN_EVAL) {
      console.warn(
        "DopeGuard: Page CSP blocks eval — running keyword-only protection."
      );
      return false;
    }

    try {
      for (const script of TF_SCRIPTS) {
        await loadScript(script);
      }

      return waitForTF();
    } catch (err) {
      console.warn("DopeGuard: Failed to load TensorFlow stack", err);
      return false;
    }
  })();

  return tfStackPromise;
}
/* =============================================================
   CONFIG
   ============================================================= */
const PRED_THRESHOLD = 0.6;
const SCAN_INTERVAL_MS = 700;
const MIN_IMAGE_SIZE = 80;
const SRC_CACHE = new Map();
let nsfwModel = null;
window.__DOPEGUARD_ACTIVE = false;

const BLOCKED_SOCIALS = new Set([
  "instagram.com",
  "www.instagram.com",
  "tiktok.com",
  "www.tiktok.com",
  "snapchat.com",
  "www.snapchat.com",
  "x.com",
  "twitter.com",
  "www.twitter.com",
  //social media often used for adult content sharing
  "https://x.com/",
  "x.com",
  "twitter",
  "twitter.com",
  "www.twitter.com",
  "https://www.snapchat.com/",
  "snapchat",
  "snapchat.com",
  "www.snapchat.com",
  "https://www.instagram.com/",
  "instagram",
  "instagram.com",
  "www.instagram.com",
  "insta",
  "instagr.am",
  "https://www.facebook.com/",
  "https://www.reddit.com/",
  "tiktok",
  "tiktok.com",
  "www.tiktok.com",
  "vm.tiktok.com", // shortlinks
  "t.co", // twitter shortlinks (optional)
  "m.tiktok.com",
  "vm.tiktok.com",
]);

// Model file (must exist inside extension/model/)
const MODEL_PATH = safeURL("model/model.json");

/* =============================================================
   SAFE_DOMAINS PLACEHOLDER (YOU WILL PASTE IT HERE)
   ============================================================= */
const SAFE_DOMAINS = new Set([
  // Productivity
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

  // Education
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

  // Payments / Banking
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

  // AI Tools
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

  // Developer Tools
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

  // Safe Entertainment
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

  // E-commerce
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

  // News & Finance
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

  // Government Services
  "uidai.gov.in",
  "incometax.gov.in",
  "passportindia.gov.in",
  "digilocker.gov.in",
  "parivahan.gov.in",
  "rbi.org.in",
  "sebi.gov.in",
  "mygov.in",
  "india.gov.in",

  // Health
  "practo.com",
  "1mg.com",
  "pharmeasy.in",
  "healthline.com",
  "webmd.com",
  "mayoclinic.org",
  "who.int",
  "cdc.gov",

  // Travel / Transport
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
  "uber.com",
  "olaelectric.com",
  "olacabs.com",
  "https://chatgpt.com/",

  // Utilities
  "weather.com",
  "speedtest.net",
  "archive.org",
  "localhost",
  "127.0.0.1",
  "dopeguard.vercel.app",
]);

function isSafeDomain(hostname) {
  const host = hostname.replace("www.", "").toLowerCase();
  for (const d of SAFE_DOMAINS) {
    if (host === d || host.endsWith("." + d)) return true;
  }
  return false;
}
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

  // (add any other specific tokens you absolutely must include)
  "girl kissing",
  "girl kiss girl",
  "boy kissing",
  "boy kiss boy",
  "lesbain",
  "gay sex",
  "lesbian sex",
  "lesbian kiss",
  "lesbian kiss girl",
  "lesbian kiss boy",
  "lesbian kiss lesbian",
  "lesbian kiss lesbian",
  "lesbian kiss lesbian",
];

// compile regex
const RISKY_PATTERNS = RISKY_WORDS.map((w) => {
  const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  // For very short plain words, require word boundaries
  if (/^[a-z]+$/i.test(w) && w.length <= 4) {
    return `\\b${escaped}\\b`;
  }

  return escaped;
});

const RISKY_REGEX = new RegExp(RISKY_PATTERNS.join("|"), "i");

/* =============================================================
   UTILITIES
   ============================================================= */
function getImageSrc(el) {
  try {
    const bg = getComputedStyle(el).backgroundImage || "";
    const bgUrl = bg.replace(/.*url\(["']?(.+?)["']?\).*/, "$1");

    return (
      el.currentSrc ||
      el.src ||
      el.getAttribute("src") ||
      el.getAttribute("data-src") ||
      el.getAttribute("data-uri") ||
      el.getAttribute("data-img") ||
      bgUrl ||
      ""
    ).toString();
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
      chrome.runtime.sendMessage({
        action: "blockedSite",
        site: location.hostname,
      });
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

      let src =
        el.currentSrc ||
        el.src ||
        el.getAttribute("srcset") ||
        el.getAttribute("data-thumb") ||
        el.getAttribute("data-preview") ||
        el.getAttribute("data-src") ||
        el.getAttribute("data-original") ||
        getImageSrc(el) ||
        "";

      src = src.toLowerCase();

      if (!src) return;

      if (ADULT_KEYWORDS.some((kw) => src.includes(kw))) {
        replaceWithBlocked(el);
      }
    });
  } catch {}
}

function isPornDomain() {
  const h = location.hostname.replace("www.", "").toLowerCase();
  if (isSafeDomain(h)) return false;
  return RISKY_REGEX.test(h) || RISKY_REGEX.test(location.href.toLowerCase());
}

/* =============================================================
   DOMAIN DETECTION
   ============================================================= */
function shouldActivate() {
  try {
    const host = location.hostname.replace("www.", "").toLowerCase();

    // Skip whitelisted domains completely
    if (isSafeDomain(host)) return false;

    if (BLOCKED_SOCIALS.has(host)) return true;

    if (isPornDomain()) return true;

    // // Explicitly block social media surfaces
    // for (const social of BLOCKED_SOCIALS) {
    //   if (host === social || host.endsWith("." + social.replace(/^\*\./, ""))) {
    //     return true;
    //   }
    // }

    // 🚀 New: Very strong porn detection

    // Query parameters (Google search)
    const q = new URLSearchParams(location.search).get("q") || "";
    if (q && RISKY_REGEX.test(q)) return true;

    // Page title
    if (RISKY_REGEX.test(document.title.toLowerCase())) return true;

    // Page contains explicit text
    if (pageContainsNSFWText()) return true;

    return false;
  } catch (e) {
    return false;
  }
}

/* =============================================================
   SHIELD BLOCKING
   ============================================================= */
function createShield() {
  if (!window.__DOPEGUARD_ACTIVE) return null;
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
  if (!window.__DOPEGUARD_ACTIVE) return;
  if (document.getElementById("dopa-blackout")) return;

  const shield = createShield();
  if (!shield) return;
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
   AI MODEL LOADING — safer (NO wasm forced)
   ============================================================= */
/* =============================================================
   AI MODEL LOADING — safer (NO wasm forced)
   ============================================================= */
async function ensureModel() {
  // If model already loaded globally, reuse it
  if (window.__DGModel) return window.__DGModel;

  try {
    // Make sure TF is present
    if (typeof window.tf === "undefined") {
      console.error("DopeGuard: tf (TensorFlow) not found on page.");
      return null;
    }

    // Use CPU backend (safer & CSP-friendly); webgl can be used if available
    // Note: tf-backend-cpu script must be loaded before this runs (we set run_at document_end)
    try {
      await tf.setBackend("cpu");
    } catch (e) {
      console.warn("tf.setBackend('cpu') failed — continuing:", e);
    }

    // Wait until tf is ready
    if (tf.ready) await tf.ready();

    // Load nsfwjs model (nsfwjs should be loaded as window.nsfwjs)
    if (typeof window.nsfwjs === "undefined") {
      console.error("DopeGuard: nsfwjs not found on page.");
      return null;
    }

    nsfwModel = await nsfwjs.load(safeURL("model/model.json"), { size: 224 });
    window.__DGModel = nsfwModel;
    console.log("DopeGuard: model loaded");
    return nsfwModel;
  } catch (e) {
    console.error("DopeGuard: Model load failed:", e);
    return null;
  }
}

/* =============================================================
   MAIN SCANNING LOOP
   ============================================================= */
async function classifyBatch(elements) {
  if (!window.__DOPEGUARD_ACTIVE) return;
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

// TEXT NSFW DETECTOR
// =======================
function pageContainsNSFWText() {
  try {
    if (isSafeDomain(location.hostname)) return false;
    // 1) URL check (strong)
    const url = location.href.toLowerCase();
    if (RISKY_REGEX.test(url)) return true;

    // 2) Query parameter check
    const q = new URLSearchParams(location.search).get("q") || "";
    if (q && RISKY_REGEX.test(q.toLowerCase())) return true;

    // 3) Search-box value (Google, X, Instagram, TikTok)
    const inputs = document.querySelectorAll("input, textarea");
    for (const i of inputs) {
      const v = (i.value || "").toLowerCase();
      if (v && RISKY_REGEX.test(v)) return true;
    }

    // 4) Body text (limit size)
    const text = (document.body?.innerText || "").toLowerCase();
    if (text.length < 250000 && RISKY_REGEX.test(text)) return true;

    return false;
  } catch (e) {
    return false;
  }
}

async function scanLoop() {
  try {
    if (!window.__DOPEGUARD_ACTIVE) return;
    if (document.hidden) return;

    const host = location.hostname.toLowerCase();
    if (isSafeDomain(host)) return;
    if (pageContainsNSFWText()) {
      enforceShield();
      return;
    }

    /* 🔥 NEW — BLOCK IFRAME PORN IMMEDIATELY */
    document.querySelectorAll("iframe").forEach((frame) => {
      try {
        const src = (frame.src || "").toLowerCase();
        if (src && RISKY_REGEX.test(src)) {
          console.log("DopeGuard: Porn iframe detected → blocking", src);
          enforceShield();
        }
      } catch {}
    });

    detectBase64Images();
    detectCanvasDrawings();
    detectVideoPreviews();
    scanByKeywords();

    const imgs = Array.from(
      document.querySelectorAll("img, [style*='background-image']")
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
    const tfReady = await ensureTFStack();
    if (!tfReady) {
      console.warn(
        "DopeGuard: TensorFlow blocked by CSP — using keyword-only detection."
      );
    }

    const res = await chrome.runtime.sendMessage({ action: "verifyToken" });

    if (res?.active === false) {
      console.warn(
        "❌ Subscription inactive or user logged out — disabling DopeGuard"
      );
      disableShield();
      return;
    }

    if (!res?.success) {
      console.warn(
        "DopeGuard: could not verify subscription (network/timeout) — continuing in keyword mode"
      );
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
      if (shouldActivate() || pageContainsNSFWText()) {
        enforceShield();
      } else {
        scanLoop();
      }
    } catch {
      console.warn("❌ DopeGuard init failed:", err);
    }
  }
})();
