/*****************
 * CONFIG
 *****************/
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // <-- replace
const LINKS = {
  BUY:        "https://example.com/buy",
  CHART:      "https://example.com/chart",
  DEXTOOLS:   "https://www.dextools.io",
  TELEGRAM:   "https://t.me/yourchannel",
  TWITTER:    "https://x.com/yourhandle",
  WHITEPAPER: "https://example.com/whitepaper.pdf",
};
const TOKENOMICS = {
  supply: "1,000,000,000 FUEL",
  tax: "0%",
  liquidity: "Locked",
};

/*****************
 * ELEMENTS
 *****************/
const stage      = document.getElementById('stage');
const stationImg = document.getElementById('station');
const overlay    = document.getElementById('overlay');

/* update blurred background to match active image */
function setBg(url){ document.documentElement.style.setProperty('--bg-url', `url("${url}")`); }
setBg(stationImg.currentSrc || stationImg.src);

/* when <picture> swaps source (mobile ↔ desktop), update bg + layout */
stationImg.addEventListener('load', ()=>{
  setBg(stationImg.currentSrc || stationImg.src);
  layoutContain();
});

/*****************
 * HOTSPOT FRACTIONS (desktop/original values you aligned)
 * x,y,w,h are fractions of the ORIGINAL image (0..1).
 *****************/
const HS_LANDSCAPE = {
  tokenomics: { el: document.getElementById('hs-tokenomics'), x: 0.2,   y: 0.647, w: 0.096, h: 0.036, skew: -7,  rot: -7   },
  contract:   { el: document.getElementById('hs-contract'),   x: 0.481, y: 0.645, w: 0.102, h: 0.034, skew: -4,  rot: 5.2  },
  links:      { el: document.getElementById('hs-links'),      x: 0.661, y: 0.671, w: 0.048, h: 0.029, skew: -5,  rot: 2.2  },
};

/* Build HS for the currently loaded image:
   - Desktop 3:2: use values as-is
   - Mobile 9:16: center 1080x720 inside 1080x1920 → remap y & h
     y' = 0.3125 + 0.375*y   (600px top pad / 1920; 720/1920 content)
     h' = 0.375*h
*/
let HS = null;
function buildHSForCurrentImage(){
  const usingPortrait = stationImg.naturalHeight > stationImg.naturalWidth; // 1920 > 1080 on mobile

  const base = JSON.parse(JSON.stringify(HS_LANDSCAPE));
  if (!usingPortrait){
    HS = base;
  } else {
    const remap = v => ({ ...v, y: 0.3125 + 0.375*v.y, h: 0.375*v.h });
    HS = {
      tokenomics: remap(base.tokenomics),
      contract:   remap(base.contract),
      links:      remap(base.links),
    };
  }
}

/*****************
 * LAYOUT (CONTAIN) — fit full image and place hotspots
 *****************/
function layoutContain(){
  const vw = window.innerWidth;
  const vh = (window.visualViewport && window.visualViewport.height)
             ? Math.floor(window.visualViewport.height)
             : window.innerHeight;

  const iw = stationImg.naturalWidth  || 1152;  // original file dimensions
  const ih = stationImg.naturalHeight || 768;

  // CONTAIN: fit entire image; blurred bg (CSS) fills the rest
  const scale = Math.min(vw / iw, vh / ih);
  const dispW = Math.round(iw * scale);
  const dispH = Math.round(ih * scale);
  const offX  = Math.floor((vw - dispW) / 2);
  const offY  = Math.floor((vh - dispH) / 2);

  stage.style.left   = offX + 'px';
  stage.style.top    = offY + 'px';
  stage.style.width  = dispW + 'px';
  stage.style.height = dispH + 'px';

  buildHSForCurrentImage();
  Object.values(HS).forEach(spec => placeHotspot(spec, dispW, dispH));
}

function placeHotspot(spec, dispW, dispH){
  const el = spec.el;
  const x = spec.x * dispW;
  const y = spec.y * dispH;
  const w = spec.w * dispW;
  const h = spec.h * dispH;
  el.style.left = (x - w/2) + 'px';
  el.style.top  = (y - h/2) + 'px';
  el.style.width  = w + 'px';
  el.style.height = h + 'px';
  el.style.transform = `skewX(${spec.skew}deg) rotate(${spec.rot}deg)`;
}

// Run layout
if (stationImg.complete) layoutContain();
else stationImg.addEventListener('load', layoutContain);
window.addEventListener('resize', layoutContain);
if (window.visualViewport){
  visualViewport.addEventListener('resize', layoutContain);
  visualViewport.addEventListener('scroll',  layoutContain);
}

/*****************
 * FAST FLICKER (single-image method)
 *****************/
function setOff(isOff){
  stationImg.classList.toggle('off', isOff);
  overlay.classList.toggle('off', isOff);
}
let flickerTimer = null, burstTimer = null;
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
document.addEventListener('visibilitychange', ()=>{
  if(!document.hidden && !flickerTimer && !burstTimer) startFlicker();
});

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

const open  = m => m.setAttribute('aria-hidden','false');
const close = m => m.setAttribute('aria-hidden','true');

document.getElementById('hs-contract')  .addEventListener('click', ()=>open(mContract));
document.getElementById('hs-links')     .addEventListener('click', ()=>open(mLinks));
document.getElementById('hs-tokenomics').addEventListener('click', ()=>open(mTok));

document.querySelectorAll('.modal').forEach(mod=>{
  mod.addEventListener('click', e=>{
    if(e.target.matches('[data-close]') || e.target.classList.contains('modal-backdrop')) close(mod);
  });
});
document.addEventListener('keydown', e=>{
  if(e.key==='Escape'){ [mContract,mLinks,mTok].forEach(m=>m.getAttribute('aria-hidden')==='false' && close(m)); }
});

document.getElementById('copyContract').addEventListener('click', async ()=>{
  try{
    await navigator.clipboard.writeText(CONTRACT_ADDRESS);
    const btn = document.getElementById('copyContract');
    btn.textContent = 'Copied!'; setTimeout(()=>btn.textContent='Copy', 900);
  }catch{
    const btn = document.getElementById('copyContract');
    btn.textContent = 'Copy failed'; setTimeout(()=>btn.textContent='Copy', 1200);
  }
});
