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
  tokenomics: "station_hover_tokenomics.png",
  contract: "station_hover_contract.png",
  links: "station_hover_links.png",
};

/*****************
 * PRELOAD IMAGES
 *****************/
Object.values(HERO_IMAGES).forEach((src) => { if (src) new Image().src = src; });

/*****************
 * ELEMENTS
 *****************/
const stage = document.getElementById("stage");
const stationImg = document.getElementById("station");
const stationOverlay = document.getElementById("stationOverlay");

function setBg(url) {
  document.documentElement.style.setProperty("--bg-url", `url("${url}")`);
}
setBg(stationImg.currentSrc || stationImg.src);
stationImg.addEventListener("load", () => {
  setBg(stationImg.currentSrc || stationImg.src);
  layout();
});

/*****************
 * HOTSPOTS MAP
 *****************/
const HS_LANDSCAPE = {
  tokenomics: { id: "hs-tokenomics", x: 0.2000, y: 0.6470, w: 0.0960, h: 0.0360, skew: -7, rot: -7 },
  contract: { id: "hs-contract", x: 0.4810, y: 0.6450, w: 0.1020, h: 0.0340, skew: -4, rot: 5.2 },
  links: { id: "hs-links", x: 0.6610, y: 0.6710, w: 0.0480, h: 0.0290, skew: -5, rot: 2.2 },
};

function hydrate(map) { Object.values(map).forEach((s) => { s.el = document.getElementById(s.id) || null; }); }

/*****************
 * DETECT PORTRAIT
 *****************/
function usingPortraitImage() {
  const src = stationImg.currentSrc || stationImg.src;
  return stationImg.naturalHeight > stationImg.naturalWidth || /station_mobile_1080x1920/i.test(src);
}
const MOBILE_ZOOM = 1.0; // keep overlays aligned; raise only if you want intentional crop

/*****************
 * LAYOUT  (FIXED: preserve aspect ratio; no distortion)
 *****************/
let HS = null;

window.layout = function layout() {
  const vw = window.innerWidth;
  const vh = window.visualViewport?.height ? Math.floor(window.visualViewport.height) : window.innerHeight;

  const iw = stationImg.naturalWidth || 1152;
  const ih = stationImg.naturalHeight || 768;

  if (usingPortraitImage()) {
    const scale = Math.min(vw / iw, vh / ih) * MOBILE_ZOOM;
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
    // ✅ DESKTOP: scale BOTH axes with the SAME factor (no distortion)
    const scale = Math.min(vw / iw, vh / ih);
    const dispW = Math.round(iw * scale);
    const dispH = Math.round(ih * scale);
    const offX = Math.floor((vw - dispW) / 2);
    const offY = Math.floor((vh - dispH) / 2);

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

  Object.values(HS).filter((spec) => spec && spec.el).forEach((spec) => place(spec, dispW, dispH));
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
 * FLICKER LIGHTS (on/off image swap)
 *****************/
let flickerTimer = null;
let flickerBurst = null;
function setStationState(isOff) { stationImg.src = isOff ? HERO_IMAGES.off : HERO_IMAGES.default; }
function stopFlicker() {
  clearTimeout(flickerTimer);
  clearInterval(flickerBurst);
  flickerTimer = null; flickerBurst = null;
  setStationState(false);
}
function startFlicker() {
  stopFlicker();
  const bursts = Math.floor(Math.random() * 3) + 1;
  let count = 0;
  flickerBurst = setInterval(() => {
    setStationState(Math.random() > 0.5);
    count++;
    if (count >= bursts) {
      clearInterval(flickerBurst); flickerBurst = null;
      setStationState(Math.random() > 0.85);
      flickerTimer = setTimeout(startFlicker, 200 + Math.random() * 400);
    }
  }, 60);
}
document.addEventListener("visibilitychange", () => { if (document.hidden) stopFlicker(); else if (!flickerTimer && !flickerBurst) startFlicker(); });
startFlicker();

/*****************
 * MODALS + DATA
 *****************/
const mContract = document.getElementById("modal-contract");
const mLinks = document.getElementById("modal-links");
const mTok = document.getElementById("modal-tokenomics");

document.getElementById("tok-supply").textContent = TOKENOMICS.supply;
document.getElementById("tok-tax").textContent = TOKENOMICS.tax;
document.getElementById("tok-liq").textContent = TOKENOMICS.liquidity;
document.getElementById("contract-value").textContent = CONTRACT_ADDRESS;

document.getElementById("lnk-buy").href = LINKS.BUY;
document.getElementById("lnk-chart").href = LINKS.CHART;
document.getElementById("lnk-dextools").href = LINKS.DEXTOOLS;
document.getElementById("lnk-telegram").href = LINKS.TELEGRAM;
document.getElementById("lnk-twitter").href = LINKS.TWITTER;
document.getElementById("lnk-whitepaper").href = LINKS.WHITEPAPER;

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

/*****************
 * HOVER IMAGE OVERLAY (tokenomics/contract/links)
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
 * MODAL CLOSE
 *****************/
document.querySelectorAll(".modal").forEach((mod) => {
  mod.addEventListener("click", (e) => {
    if (e.target.matches("[data-close]") || e.target.classList.contains("modal-backdrop")) close(mod);
  }, { capture: true });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") [mContract, mLinks, mTok].forEach((m) => {
    if (m.getAttribute("aria-hidden") === "false") close(m);
  });
});

/*****************
 * COPY CONTRACT BUTTON
 *****************/
const copyBtn = document.getElementById("copyContract");
if (copyBtn) {
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS)
      .then(() => { copyBtn.textContent = "Copied!"; setTimeout(() => { copyBtn.textContent = "Copy"; }, 2000); })
      .catch(() => { alert("Failed to copy address. Please copy manually."); });
  });
}
