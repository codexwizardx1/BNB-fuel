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
  tokenomics: { el: hsTokenomics, x: 0.3200, y: 0.6300, w: 0.1100, h: 0.0360, skew: -7, rot: -1, label: "TOKENOMICS" },
  contract:   { el: hsContract,   x: 0.5550, y: 0.6320, w: 0.1020, h: 0.0340, skew: -4, rot: -1, label: "CONTRACT"   },
  links:      { el: hsLinks,      x: 0.6820, y: 0.6410, w: 0.0960, h: 0.0330, skew: -5, rot: -1, label: "LINKS"      },
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

/*****************
 * ===== ALIGNMENT MODE =====
 * Press "A" to toggle.
 * - Click a hotspot or press Tab to cycle selection
 * - Arrow keys      = move (hold Shift for bigger steps)
 * - Alt + Arrows    = resize (w/h)
 * - S/W             = skewX -/+
 * - R/E             = rotate -/+
 * - C               = copy HS JSON to clipboard
 *****************/
let alignOn = false;
let selectedKey = 'contract'; // start on center
const keys = Object.keys(HS);

function ensureHud(){
  if (document.getElementById('align-hud')) return;
  const hud = document.createElement('div');
  hud.id = 'align-hud';
  hud.innerHTML = `
    <div class="row"><span class="hotspot-name" id="hud-name"></span></div>
    <div class="row hint">Move: ⬆⬇⬅➡ | Resize: Alt+Arrows | Skew: S/W | Rotate: R/E | Cycle: Tab | Copy JSON: C | Toggle: A</div>
    <div class="row">x:<code id="hud-x"></code> y:<code id="hud-y"></code> w:<code id="hud-w"></code> h:<code id="hud-h"></code> skew:<code id="hud-skew"></code> rot:<code id="hud-rot"></code></div>
  `;
  document.body.appendChild(hud);
}
function updateHud(){
  if (!alignOn) return;
  const spec = HS[selectedKey];
  document.getElementById('hud-name').textContent = selectedKey.toUpperCase() + ' — ' + spec.label;
  document.getElementById('hud-x').textContent = spec.x.toFixed(6);
  document.getElementById('hud-y').textContent = spec.y.toFixed(6);
  document.getElementById('hud-w').textContent = spec.w.toFixed(6);
  document.getElementById('hud-h').textContent = spec.h.toFixed(6);
  document.getElementById('hud-skew').textContent = spec.skew.toFixed(2);
  document.getElementById('hud-rot').textContent  = spec.rot.toFixed(2);
}
function selectHotspot(key){
  selectedKey = key;
  updateHud();
}
Object.entries(HS).forEach(([key, spec])=>{
  spec.el.addEventListener('click', (e)=>{
    if (!alignOn) return;
    e.preventDefault();
    selectHotspot(key);
  });
});

function applyAndLayout(){
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const iw = stationImg.naturalWidth  || 1152;
  const ih = stationImg.naturalHeight || 768;
  const scale = Math.max(vw/iw, vh/ih);
  const dispW = Math.ceil(iw * scale);
  const dispH = Math.ceil(ih * scale);
  Object.values(HS).forEach(spec => placeHotspot(spec, dispW, dispH));
  updateHud();
}

function copyJson(){
  const out = {};
  for (const [k, v] of Object.entries(HS)){
    out[k] = { x:v.x, y:v.y, w:v.w, h:v.h, skew:v.skew, rot:v.rot };
  }
  const text = JSON.stringify(out, null, 2);
  navigator.clipboard.writeText(text).catch(()=>{});
  console.log('HS JSON copied:\n', text);
}

document.addEventListener('keydown', (e)=>{
  if (e.key.toLowerCase() === 'a') {
    alignOn = !alignOn;
    document.body.classList.toggle('debug', alignOn);
    if (alignOn) { ensureHud(); updateHud(); }
    return;
  }
  if (!alignOn) return;

  const spec = HS[selectedKey];
  const step = e.shiftKey ? 0.005 : 0.001;  // big/small nudge
  const rstep = e.shiftKey ? 0.5   : 0.2;   // rotation/skew step (deg)

  if (e.key === 'Tab') {
    e.preventDefault();
    const idx = (keys.indexOf(selectedKey) + 1) % keys.length;
    selectHotspot(keys[idx]);
    return;
  }
  // Copy JSON
  if (e.key.toLowerCase() === 'c') { copyJson(); return; }

  // Skew/Rotate
  if (e.key.toLowerCase() === 's') { spec.skew -= rstep; applyAndLayout(); return; }
  if (e.key.toLowerCase() === 'w') { spec.skew += rstep; applyAndLayout(); return; }
  if (e.key.toLowerCase() === 'r') { spec.rot  -= rstep; applyAndLayout(); return; }
  if (e.key.toLowerCase() === 'e') { spec.rot  += rstep; applyAndLayout(); return; }

  // Move or Resize
  const resize = e.altKey;
  if (!resize) {
    // Move
    if (e.key === 'ArrowLeft')  { spec.x -= step; applyAndLayout(); }
    if (e.key === 'ArrowRight') { spec.x += step; applyAndLayout(); }
    if (e.key === 'ArrowUp')    { spec.y -= step; applyAndLayout(); }
    if (e.key === 'ArrowDown')  { spec.y += step; applyAndLayout(); }
  } else {
    // Resize
    if (e.key === 'ArrowLeft')  { spec.w = Math.max(0.001, spec.w - step); applyAndLayout(); }
    if (e.key === 'ArrowRight') { spec.w += step; applyAndLayout(); }
    if (e.key === 'ArrowUp')    { spec.h = Math.max(0.001, spec.h - step); applyAndLayout(); }
    if (e.key === 'ArrowDown')  { spec.h += step; applyAndLayout(); }
  }
});

/* Recompute layout on load/resize to keep HUD current */
window.addEventListener('resize', updateHud);
if (stationImg.complete) updateHud();
else stationImg.addEventListener('load', updateHud);
