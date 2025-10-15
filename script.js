/*****************
 * CONFIG
 *****************/
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // <- replace
const LINKS = {
  BUY:        "https://example.com/buy",
  CHART:      "https://example.com/chart",
  DEXTOOLS:   "https://www.dextools.io",
  TELEGRAM:   "https://t.me/yourchannel",
  TWITTER:    "https://x.com/yourhandle",
  WHITEPAPER: "https://example.com/whitepaper.pdf",
};
const TOKENOMICS = { supply: "1,000,000,000 FUEL", tax: "0%", liquidity: "Locked" };

/*****************
 * ELEMENTS
 *****************/
const stage      = document.getElementById('stage');
const stationImg = document.getElementById('station');
const overlay    = document.getElementById('overlay');

/* Sync blurred bg */
function setBg(url){ document.documentElement.style.setProperty('--bg-url', `url("${url}")`); }
setBg(stationImg.currentSrc || stationImg.src);
stationImg.addEventListener('load', ()=>{ setBg(stationImg.currentSrc || stationImg.src); layout(); });

/*****************
 * DESKTOP FRACTIONS (starting values)
 *****************/
const HS_LANDSCAPE = {
  tokenomics: { el: document.getElementById('hs-tokenomics'), x: 0.2000, y: 0.6470, w: 0.0960, h: 0.0360, skew: -7,  rot: -7   },
  contract:   { el: document.getElementById('hs-contract'),   x: 0.4810, y: 0.6450, w: 0.1020, h: 0.0340, skew: -4,  rot: 5.2  },
  links:      { el: document.getElementById('hs-links'),      x: 0.6610, y: 0.6710, w: 0.0480, h: 0.0290, skew: -5,  rot: 2.2  },
};

/*****************
 * DETECT PORTRAIT (mobile)
 *****************/
function traitImage(){
  const src = stationImg.currentSrc || stationImg.src;
  return (stationImg.naturalHeight > stationImg.naturalWidth) ||
         /station_mobile_1080x1920/i.test(src);
}
const MOBILE_ZOOM = 1.22;

/*****************
 * LAYOUT (exposed for Align toggle)
 *****************/
let HS = null;

window.layout = function layout(){
  const vw = window.innerWidth;
  const vh = (window.visualViewport?.height) ? Math.floor(window.visualViewport.height) : window.innerHeight;

  // Use image natural size if present, else desktop fallback
  const iw = stationImg.naturalWidth  || 1152;
  const ih = stationImg.naturalHeight || 768;

  const ALIGN_DEBUG = !!window.__ALIGN_DEBUG;

  if (usingPortraitImage() && !ALIGN_DEBUG) {

    /* PORTRAIT (mobile) */
    const contain = Math.min(vw/iw, vh/ih);
    const cover   = Math.max(vw/iw, vh/ih);
    const scale   = Math.min(contain * MOBILE_ZOOM, cover);

    const dispW = Math.round(iw * scale);
    const dispH = Math.round(ih * scale);
    const offX  = Math.floor((vw - dispW) / 2);
    const offY  = Math.floor((vh - dispH) / 2);

    Object.assign(stage.style, { left: offX+'px', top: offY+'px', width: dispW+'px', height: dispH+'px' });

    // Remap desktop fractions to portrait (center 1080×720 inside 1080×1920)
    const remap = v => ({ ...v, y: 0.3125 + 0.375*v.y, h: 0.375*v.h }); // x,w unchanged
    HS = { tokenomics: remap(HS_LANDSCAPE.tokenomics), contract: remap(HS_LANDSCAPE.contract), links: remap(HS_LANDSCAPE.links) };
    Object.values(HS).forEach(spec => place(spec, dispW, dispH, ALIGN_DEBUG));

  } else {
    /* DESKTOP COVER (and forced during Align) */
    let dispW, dispH, offX, offY;

    if (ALIGN_DEBUG) {
      // FORCE: fill viewport so boxes always show
      dispW = vw; dispH = vh; offX = 0; offY = 0;
      Object.assign(stage.style, { left:'0px', top:'0px', width: vw+'px', height: vh+'px' });
    } else {
      // Normal cover math
      const scale = Math.max(vw/iw, vh/ih);
      dispW = Math.round(iw * scale);
      dispH = Math.round(ih * scale);
      offX  = Math.floor((vw - dispW) / 2);
      offY  = Math.floor((vh - dispH) / 2);
      Object.assign(stage.style, { left: offX+'px', top: offY+'px', width: dispW+'px', height: dispH+'px' });
    }

    HS = JSON.parse(JSON.stringify(HS_LANDSCAPE));
    Object.values(HS).forEach(spec => place(spec, dispW, dispH, ALIGN_DEBUG));
  }
};

function place(spec, dispW, dispH, ALIGN_DEBUG){
  const x = spec.x * dispW;
  const y = spec.y * dispH;
  let   w = spec.w * dispW;
  let   h = spec.h * dispH;

  // In Align mode, guarantee visible size even if something collapses
  if (ALIGN_DEBUG) {
    if (!w || w < 20) w = 140;
    if (!h || h < 10) h = 40;
  }

  Object.assign(spec.el.style, {
    left:  (x - w/2) + 'px',
    top:   (y - h/2) + 'px',
    width:  w + 'px',
    height: h + 'px',
    transform: `skewX(${spec.skew}deg) rotate(${spec.rot}deg)`
  });
}

/* Run layout */
document.addEventListener('DOMContentLoaded', layout);
if (stationImg.complete) layout(); else stationImg.addEventListener('load', layout);
window.addEventListener('resize', layout);
if (window.visualViewport){ visualViewport.addEventListener('resize', layout); visualViewport.addEventListener('scroll', layout); }

/*****************
 * FAST FLICKER
 *****************/
function setOff(isOff){ stationImg.classList.toggle('off', isOff); overlay.classList.toggle('off', isOff); }
let flickerTimer=null, burstTimer=null;
function stopFlicker(){ clearTimeout(flickerTimer); flickerTimer=null; clearInterval(burstTimer); burstTimer=null; }
function startFlicker(){
  stopFlicker();
  const burstCount = Math.floor(Math.random()*3)+1;
  let i=0;
  burstTimer = setInterval(()=>{
    setOff(Math.random()>0.5);
    if(++i>=burstCount){
      clearInterval(burstTimer); burstTimer=null;
      setOff(Math.random()>0.85);
      flickerTimer = setTimeout(startFlicker, 100 + Math.random()*300);
    }
  }, 60);
}
startFlicker();
document.addEventListener('visibilitychange', ()=>{ if(!document.hidden && !flickerTimer && !burstTimer) startFlicker(); });

/*****************
 * MODALS + DATA
 *****************/
const mContract = document.getElementById('modal-contract');
const mLinks    = document.getElementById('modal-links');
const mTok      = document.getElementById('modal-tokenomics');

document.getElementById('tok-supply').textContent = TOKENOMICS.supply;
document.getElementById('tok-tax').textContent    = TOKENOMICS.tax;
document.getElementById('tok-liq').textContent    = TOKENOMICS.liquidity;

const contractValue = document.getElementById('contract-value');
contractValue.textContent = CONTRACT_ADDRESS;
document.getElementById('tok-addr').textContent   = CONTRACT_ADDRESS;

document.getElementById('lnk-buy').href        = LINKS.BUY;
document.getElementById('lnk-chart').href      = LINKS.CHART;
document.getElementById('lnk-dextools').href   = LINKS.DEXTOOLS;
document.getElementById('lnk-telegram').href   = LINKS.TELEGRAM;
document.getElementById('lnk-twitter').href    = LINKS.TWITTER;
document.getElementById('lnk-whitepaper').href = LINKS.WHITEPAPER;

/* Open/close wiring */
const open  = m => m.setAttribute('aria-hidden','false');
const close = m => m.setAttribute('aria-hidden','true');
const onOpen = (modal) => (e) => { e.stopPropagation(); e.preventDefault(); open(modal); };

document.getElementById('hs-contract').addEventListener('pointerdown', onOpen(mContract), { capture:true });
document.getElementById('hs-links')   .addEventListener('pointerdown', onOpen(mLinks),    { capture:true });
document.getElementById('hs-tokenomics').addEventListener('pointerdown', onOpen(mTok),    { capture:true });

document.querySelectorAll('.modal').forEach(mod=>{
  mod.addEventListener('click', (e)=>{
    if(e.target.matches('[data-close]') || e.target.classList.contains('modal-backdrop')) close(mod);
  }, { capture:true });
});
document.addEventListener('keydown', (e)=>{
  if(e.key==='Escape'){ [mContract,mLinks,mTok].forEach(m=>{ if(m.getAttribute('aria-hidden')==='false') close(m); }); }
});

/*****************
/*****************
 * ALIGNMENT MODE TOGGLE (press A)
 *****************/
document.addEventListener('keydown', (e) => {
  if (e.key === 'a' || e.key === 'A') {
    window.__ALIGN_DEBUG = !window.__ALIGN_DEBUG;
    document.body.classList.toggle('debug', window.__ALIGN_DEBUG);
    layout();
  }
});

