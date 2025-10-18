/*****************
 * CONFIG
 *****************/
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";
const LINKS = {
  BUY: "https://example.com/buy",
  CHART: "https://example.com/chart",
  DEXTOOLS: "https://www.dextools.io",
  TELEGRAM: "https://t.me/yourchannel",
  TWITTER: "https://x.com/yourhandle",
  WHITEPAPER: "https://example.com/whitepaper.pdf",
};
const TOKENOMICS = { supply: "1,000,000,000 FUEL", tax: "0%", liquidity: "Locked" };

/*****************
 * HERO IMAGES
 *****************/
const HERO_IMAGES = {
  default: "station_on.png",
  off: "station_off.png",
  mobile_default: "station_mobile_on.png",
  mobile_off: "station_mobile_off.png",
  tokenomics: "station_hover_tokenomics.png",
  contract: "station_hover_contract.png",
  links: "station_hover_links.png",
};

Object.values(HERO_IMAGES).forEach((src) => { if (src) new Image().src = src; });

/*****************
 * ELEMENTS
 *****************/
const stage = document.getElementById("stage");
const stationImg = document.getElementById("station");
const stationOverlay = document.getElementById("stationOverlay");

if (window.innerWidth <= 768 && window.innerHeight > window.innerWidth) {
  stationImg.src = HERO_IMAGES.mobile_default;
} else {
  stationImg.src = HERO_IMAGES.default;
}

function setBg(url) {
  document.documentElement.style.setProperty("--bg-url", `url("${url}")`);
}
setBg(stationImg.currentSrc || stationImg.src);
stationImg.addEventListener("load", () => { setBg(stationImg.currentSrc || stationImg.src); layout(); });

/*****************
 * HOTSPOTS
 *****************/
const HS_LANDSCAPE = {
  tokenomics: { id: "hs-tokenomics", x: 0.2000, y: 0.6470, w: 0.0960, h: 0.0360, skew: -7, rot: -7 },
  contract:  { id: "hs-contract",  x: 0.4810, y: 0.6450, w: 0.1020, h: 0.0340, skew: -4, rot: 5.2 },
  links:     { id: "hs-links",     x: 0.6610, y: 0.6710, w: 0.0480, h: 0.0290, skew: -5, rot: 2.2 },
};

function hydrate(map) {
  Object.values(map).forEach((s) => s.el = document.getElementById(s.id) || null);
}

function usingPortraitImage() {
  return window.innerWidth <= 768 && window.innerHeight > window.innerWidth;
}

const MOBILE_ZOOM = 1.3;
let HS = null;

/*****************
 * LAYOUT — height-fit for desktop (your original behavior)
 *****************/
window.layout = function layout() {
  const vw = window.innerWidth;
  const vh = window.visualViewport?.height ? Math.floor(window.visualViewport.height) : window.innerHeight;
  const iw = stationImg.naturalWidth || 1152;
  const ih = stationImg.naturalHeight || 768;

  if (usingPortraitImage()) {
    // ✅ Mobile
    const contain = Math.min(vw / iw, vh / ih);
    const scale = contain * MOBILE_ZOOM;
    const dispW = Math.round(iw * scale);
    const dispH = Math.round(ih * scale);
    const offX = Math.floor((vw - dispW) / 2);
    const offY = Math.floor((vh - dispH) / 2);

    Object.assign(stage.style, { left: offX + "px", top: offY + "px", width: dispW + "px", height: dispH + "px" });

    const remap = (v) => v ? ({ ...v, y: 0.3125 + 0.375 * v.y, h: 0.375 * v.h }) : null;
    HS = {
      tokenomics: remap(HS_LANDSCAPE.tokenomics),
      contract: remap(HS_LANDSCAPE.contract),
      links: remap(HS_LANDSCAPE.links),
    };
  } else {
    // ✅ Desktop: Fill height, center horizontally (your original behavior)
    const scaleH = vh / ih;
    const dispH = vh;
    const dispW = Math.round(iw * scaleH);
    const offX = Math.floor((vw - dispW) / 2);
    const offY = 0;

    Object.assign(stage.style, {
      left: offX + 'px',
      top: offY + 'px',
      width: dispW + 'px',
      height: dispH + 'px'
    });

    HS = JSON.parse(JSON.stringify(HS_LANDSCAPE));
  }

  hydrate(HS);
  const rect = stage.getBoundingClientRect();
  const dispW = rect.width;
  const dispH = rect.height;
  Object.values(HS).filter(s => s && s.el).forEach(spec => place(spec, dispW, dispH));
};

function place(spec, dispW, dispH) {
  const x = spec.x * dispW;
  const y = spec.y * dispH;
  const w = spec.w * dispW;
  const h = spec.h * dispH;

  Object.assign(spec.el.style, {
    position: "absolute",
    left: x - w / 2 + "px",
    top: y - h / 2 + "px",
    width: w + "px",
    height: h + "px",
    transform: `skewX(${spec.skew}deg) rotate(${spec.rot}deg)`,
    willChange: "transform, left, top, width, height"
  });
}

document.addEventListener("DOMContentLoaded", layout);
if (stationImg.complete) layout(); else stationImg.addEventListener("load", layout);
window.addEventListener("resize", layout);
if (window.visualViewport) {
  visualViewport.addEventListener("resize", layout);
  visualViewport.addEventListener("scroll", layout);
}

/*****************
 * FLICKER EFFECT
 *****************/
function setOff(isOff) {
  if (usingPortraitImage()) {
    stationImg.src = isOff ? HERO_IMAGES.mobile_off : HERO_IMAGES.mobile_default;
  } else {
    stationImg.src = isOff ? HERO_IMAGES.off : HERO_IMAGES.default;
  }
}

let flickerTimer = null;
let burstTimer = null;

function stopFlicker() {
  clearTimeout(flickerTimer);
  flickerTimer = null;
  clearInterval(burstTimer);
  burstTimer = null;
}

function startFlicker() {
  stopFlicker();
  const burstCount = Math.floor(Math.random() * 3) + 1;
  let i = 0;
  burstTimer = setInterval(() => {
    setOff(Math.random() > 0.5);
    if (++i >= burstCount) {
      clearInterval(burstTimer);
      burstTimer = null;
      setOff(Math.random() > 0.85);
      flickerTimer = setTimeout(startFlicker, 100 + Math.random() * 300);
    }
  }, 60);
}

startFlicker();
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && !flickerTimer && !burstTimer) startFlicker();
});

/*****************
 * MODALS
 *****************/
const mContract = document.getElementById("modal-contract");
const mLinks    = document.getElementById("modal-links");
const mTok      = document.getElementById("modal-tokenomics");

document.getElementById("tok-supply").textContent = TOKENOMICS.supply;
document.getElementById("tok-tax").textContent    = TOKENOMICS.tax;
document.getElementById("tok-liq").textContent    = TOKENOMICS.liquidity;
document.getElementById("contract-value").textContent = CONTRACT_ADDRESS;

document.getElementById("lnk-buy").href       = LINKS.BUY;
document.getElementById("lnk-chart").href     = LINKS.CHART;
document.getElementById("lnk-dextools").href  = LINKS.DEXTOOLS;
document.getElementById("lnk-telegram").href  = LINKS.TELEGRAM;
document.getElementById("lnk-twitter").href   = LINKS.TWITTER;
document.getElementById("lnk-whitepaper").href= LINKS.WHITEPAPER;

const open = (m) => m.setAttribute("aria-hidden", "false");
const close = (m) => m.setAttribute("aria-hidden", "true");
const onOpen = (modal) => (e) => { e.stopPropagation(); e.preventDefault(); open(modal); };

["hs-contract", "hs-links", "hs-tokenomics"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) {
    const modal = id === "hs-contract" ? mContract : id === "hs-links" ? mLinks : mTok;
    el.addEventListener("click", onOpen(modal));
  }
});

document.querySelectorAll("[data-close]").forEach(el => {
  el.addEventListener("click", () => {
    const modal = el.closest(".modal");
    if (modal) close(modal);
  });
});

/*****************
 * HOVER IMAGE OVERLAY
 *****************/
const swapHero = (key) => {
  const img = HERO_IMAGES[key];
  if (img) { stationOverlay.src = img; stationOverlay.style.opacity = "1"; }
};
const clearHero = () => { stationOverlay.style.opacity = "0"; };

["tokenomics", "contract", "links"].forEach((key) => {
  const el = document.getElementById(`hs-${key}`);
  if (el && HERO_IMAGES[key]) {
    el.addEventListener("mouseenter", () => swapHero(key));
    el.addEventListener("mouseleave", clearHero);
  }
});

/*****************
 * COPY CONTRACT
 *****************/
const copyBtn = document.getElementById("copyContract");
if (copyBtn) {
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS)
      .then(() => { copyBtn.textContent = "Copied!"; setTimeout(() => { copyBtn.textContent = "Copy"; }, 2000); })
      .catch(() => { alert("Failed to copy address. Please copy manually."); });
  });
}
