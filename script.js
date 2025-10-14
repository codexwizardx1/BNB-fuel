/*****************
 * CONFIG
 *****************/
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"; // <-- put your real address
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
 * COVER LAYOUT + HOTSPOT DEFINITIONS (fractions of original image)
 *****************/
const stationImg = document.getElementById('station');
const stage      = document.getElementById('stage');
const overlay    = document.getElementById('overlay');

const hsTokenomics = document.getElementById('hs-tokenomics');
const hsContract   = document.getElementById('hs-contract');
const hsLinks      = document.getElementById('hs-links');

/* Fractions (0..1) relative to ORIGINAL image.
   Start values; we’ll fine-tune live in Alignment Mode. */
const HS = {
  tokenomics: {
    el: document.getElementById('hs-tokenomics'),
    x: 0.2,
    y: 0.647,
    w: 0.096,
    h: 0.036,
    skew: -7,
    rot: -7
  },
  contract: {
    el: document.getElementById('hs-contract'),
    x: 0.481,
    y: 0.645,
    w: 0.102,
    h: 0.034,
    skew: -4,
    rot: 5.2
  },
  links: {
    el: document.getElementById('hs-links'),
    x: 0.661,
    y: 0.671,
    w: 0.048,
    h: 0.029,
    skew: -5,
    rot: 2.2
  }
};


function layoutCover(){
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const iw = stationImg.naturalWidth  || 1152; // fallback if not loaded
  const ih = stationImg.naturalHeight || 768;

  // CSS "cover" math
  const scale = Math.max(vw/iw, vh/ih);
  const dispW = Math.ceil(iw * scale);
  const dispH = Math.ceil(ih * scale);
  const offX  = Math.floor((vw - dispW) / 2);
  const offY  = Math.floor((vh - dispH) / 2);

  // Stage is exactly where the image is drawn
  stage.style.left   = offX + 'px';
  stage.style.top    = offY + 'px';
  stage.style.width  = dispW + 'px';
  stage.style.height = dispH + 'px';

  // Place all hotspots
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

// Run layout after image loads, and on resize
if (stationImg.complete) layoutCover();
else stationImg.addEventListener('load', layoutCover);
window.addEventListener('resize', layoutCover);

/*****************
 * FAST FLICKER (single-image method)
 *****************/
function setOff(isOff){
  stationImg.classList.toggle('off', isOff);
  overlay.classList.toggle('off', isOff);
}

let flickerTimer = null;
let burstTimer   = null;

function stopFlicker(){
  clearTimeout(flickerTimer); flickerTimer = null;
  clearInterval(burstTimer);  burstTimer   = null;
}

function startFlicker(){
  stopFlicker();
  const burstCount = Math.floor(Math.random()*3)+1; // 1–3 quick blinks
  let i = 0;

  burstTimer = setInterval(()=>{
    setOff(Math.random()>0.5);
    i++;
    if(i>=burstCount){
      clearInterval(burstTimer); burstTimer = null;
      // settle mostly ON
      setOff(Math.random()>0.85);
      const next = 100 + Math.random()*300; // quick cycle
      flickerTimer = setTimeout(startFlicker, next);
    }
  }, 60); // 40–80ms feels snappy
}

// kick it off & keep it alive
startFlicker();
document.addEventListener('visibilitychange', ()=>{
  if(!document.hidden && !flickerTimer && !burstTimer) startFlicker();
});

/*****************
 * MODALS + DATA
 *****************/
// Contract modal
const mContract = document.getElementById('modal-contract');
const contractValue = document.getElementById('contract-value');
const copyBtn = document.getElementById('copyContract');
contractValue.textContent = CONTRACT_ADDRESS;

// Links modal
const mLinks = document.getElementById('modal-links');
const lnkBuy = document.getElementById('lnk-buy');
const lnkChart = document.getElementById('lnk-chart');
const lnkDex = document.getElementById('lnk-dextools');
const lnkTg = document.getElementById('lnk-telegram');
const lnkTw = document.getElementById('lnk-twitter');
const lnkWp = document.getElementById('lnk-whitepaper');

lnkBuy.href   = LINKS.BUY;
lnkChart.href = LINKS.CHART;
lnkDex.href   = LINKS.DEXTOOLS;
lnkTg.href    = LINKS.TELEGRAM;
lnkTw.href    = LINKS.TWITTER;
lnkWp.href    = LINKS.WHITEPAPER;

// Tokenomics modal
const mTok = document.getElementById('modal-tokenomics');
document.getElementById('tok-supply').textContent = TOKENOMICS.supply;
document.getElementById('tok-tax').textContent    = TOKENOMICS.tax;
document.getElementById('tok-liq').textContent    = TOKENOMICS.liquidity;
document.getElementById('tok-addr').textContent   = CONTRACT_ADDRESS;

// Open/close wiring
const openContract   = () => mContract.setAttribute('aria-hidden','false');
const openLinks      = () => mLinks.setAttribute('aria-hidden','false');
const openTokenomics = () => mTok.setAttribute('aria-hidden','false');
const closeModal     = (m) => m.setAttribute('aria-hidden','true');

hsContract  .addEventListener('click', openContract);
hsLinks     .addEventListener('click', openLinks);
hsTokenomics.addEventListener('click', openTokenomics);

document.querySelectorAll('.modal').forEach(mod=>{
  mod.addEventListener('click', (e)=>{
    if(e.target.matches('[data-close]') || e.target.classList.contains('modal-backdrop')){
      closeModal(mod);
    }
  });
});
document.addEventListener('keydown', (e)=>{
  if(e.key==='Escape'){
    [mContract,mLinks,mTok].forEach(m=>{
      if(m.getAttribute('aria-hidden')==='false') closeModal(m);
    });
  }
});

// Copy button
copyBtn.addEventListener('click', async ()=>{
  try{
    await navigator.clipboard.writeText(CONTRACT_ADDRESS);
    copyBtn.textContent = 'Copied!';
    setTimeout(()=>copyBtn.textContent='Copy', 1000);
  }catch{
    copyBtn.textContent = 'Copy failed';
    setTimeout(()=>copyBtn.textContent='Copy', 1200);
  }
});

