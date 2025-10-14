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
const TOKENOMICS = { supply: "1,000,000,000 FUEL", tax: "0%", liquidity: "Locked" };

/*****************
 * ELEMENTS
 *****************/
const stage      = document.getElementById('stage');
const stationImg = document.getElementById('station');
const overlay    = document.getElementById('overlay');

/* keep blurred bg synced to active image (from <picture>) */
function setBg(url){ document.documentElement.style.setProperty('--bg-url', `url("${url}")`); }
setBg(stationImg.currentSrc || stationImg.src);
stationImg.addEventListener('load', ()=>{ setBg(stationImg.currentSrc || stationImg.src); layout(); });

/*****************
 * DESKTOP HOTSPOT FRACTIONS (aligned on desktop)
 *****************/
const HS_LANDSCAPE = {
  tokenomics: { el: document.getElementById('hs-tokenomics'), x: 0.2000, y: 0.6470, w: 0.0960, h: 0.0360, skew: -7,  rot: -7   },
  contract:   { el: document.getElementById('hs-contract'),   x: 0.4810, y: 0.6450, w: 0.1020, h: 0.0340, skew: -4,  rot: 5.2  },
  links:      { el: document.getElementById('hs-links'),      x: 0.6610, y: 0.6710, w: 0.0480, h: 0.0290, skew: -5,  rot: 2.2  },
};

/*****************
 * DETECT WHICH IMAGE ACTUALLY LOADED
 *****************/
function usingPortraitImage(){
  const src = stationImg.currentSrc || stationImg.src;
  return (stationImg.naturalHeight > stationImg.naturalWidth) ||
         /station_mobile_1080x1920/i.test(src);
}

/* Mobile zoom */
const MOBILE_ZOOM = 1.22;

/*****************
 * LAYOUT
 * - Desktop (3:2) = COVER (edge-to-edge, your coords)
 * - Portrait mobile (9:16) = CONTAIN + zoom, with hotspot remap
 *****************/
let HS = null;

function layout(){
  const vw = window.innerWidth;
  const vh = (window.visualViewport?.height) ? Math.floor(window.visualViewport.height) : window.innerHeight;

  const iw = stationImg.naturalWidth  || 1152;
  const ih = stationImg.naturalHeight || 768;

  if (usingPortraitImage()) {
    // PORTRAIT IMAGE (mobile)
    const contain = Math.min(vw/iw, vh/ih);
    const cover   = Math.max(vw/iw, vh/ih);
    const scale   = Math.min(contain * MOBILE_ZOOM, cover);

    const dispW = Math.round(iw * scale);
    const dispH = Math.round(ih * scale);
    const offX  = Math.floor((vw - dispW) / 2);
    const offY  = Math.floor((vh - dispH) / 2);

    stage.style.left   = offX + 'px';
    stage.style.top    = offY + 'px';
    stage.style.width  = dispW + 'px';
    stage.style.height = dispH + 'px';

    // Remap desktop fractions to portrait (center 1080×720 inside 1080×1920)
    const remap = v => ({ ...v, y: 0.3125 + 0.375*v.y, h: 0.375*v.h }); // x,w same
    HS = {
      tokenomics: remap(HS_LANDSCAPE.tokenomics),
      contract:   remap(HS_LANDSCAPE.contract),
      links:      remap(HS_LANDSCAPE.links),
    };

    Object.values(HS).forEach(spec => place(spec, dispW, dispH));

  } else {
    // DESKTOP / LANDSCAPE IMAGE — COVER
    const scale = Math.max(vw/iw, vh/ih);
    const dispW = Math.round(iw * scale);
    const dispH = Math.round(ih * scale);
    const offX  = Math.floor((vw - dispW) / 2);
    const offY  = Math.floor((vh - dispH) / 2);

    stage.style.left   = offX + 'px';
    stage.style.top    = offY + 'px';
    stage.style.width  = dispW + 'px';
    stage.style.height = dispH + 'px';

    HS = JSON.parse(JSON.stringify(HS_LANDSCAPE));
    Object.values(HS).forEach(spec => place(spec, dispW, dispH));
  }
}

function place(spec, dispW, dispH){
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

// Ensure layout runs when DOM is ready + on image load/resize
document.addEventListener('DOMContentLoaded', layout);
if (stationImg.complete) layout(); else stationImg.addEventListener('load', layout);
window.addEventListener('resize', layout);
if (window.visualViewport){
  visualViewport.addEventListener('resize', layout);
  visualViewport.addEventListener('scroll',  layout);
}

/*****************
 * FAST FLICKER
 *****************/
function setOff(isOff){
  stationImg.classList.toggle('off', isOff);
  overlay.classList.toggle('off', isOff);
}
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

/* Open/close wiring with capture + pointerdown (can’t be swallowed) */
const open  = m => m.setAttribute('aria-hidden','false');
const close = m => m.setAttribute('aria-hidden','true');

const onOpen = (modal) => (e) => { e.stopPropagation(); e.preventDefault(); open(modal); };

document.getElementById('hs-contract')
  .addEventListener('pointerdown', onOpen(mContract), { capture:true });
document.getElementById('hs-links')
  .addEventListener('pointerdown', onOpen(mLinks), { capture:true });
document.getElementById('hs-tokenomics')
  .addEventListener('pointerdown', onOpen(mTok), { capture:true });

document.querySelectorAll('.modal').forEach(mod=>{
  mod.addEventListener('click', (e)=>{
    if(e.target.matches('[data-close]') || e.target.classList.contains('modal-backdrop')){
      close(mod);
    }
  }, { capture:true });
});
document.addEventListener('keydown', (e)=>{
  if(e.key==='Escape'){
    [mContract,mLinks,mTok].forEach(m=>{
      if(m.getAttribute('aria-hidden')==='false') close(m);
    });
  }
});

/* Keyboard activation for hotspots */
['hs-contract','hs-links','hs-tokenomics'].forEach(id=>{
  const el = document.getElementById(id);
  el.setAttribute('tabindex','0');
  el.addEventListener('keydown', (e)=>{
    if(e.key==='Enter' || e.key===' '){
      e.preventDefault();
      if(id==='hs-contract')  open(mContract);
      if(id==='hs-links')     open(mLinks);
      if(id==='hs-tokenomics')open(mTok);
    }
  }, { capture:true });
});

/*****************
 * ===== ALIGNMENT MODE v2 =====
 * Toggle: Button (top-right), Key "A", or URL (#align or ?align=1)
 * Target cycle: Tab (tokenomics → contract → links)
 * Nudge:  arrows       (x/y)
 * Resize: Shift+arrows (w/h)
 * Skew:   [ / ]
 * Rotate: ; / '
 * Copy:   C  (copies JSON for HS_LANDSCAPE)
 *****************/
(function(){
  const order = ['tokenomics','contract','links'];
  let idx = 0;
  let DEBUG = false;

  const hud = document.getElementById('align-hud');
  const hudName = document.getElementById('hud-name');
  const btn = document.getElementById('align-toggle');

  function currentKey(){ return order[idx]; }
  function current(){ return HS_LANDSCAPE[currentKey()]; }
  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

  function updateHUD(){
    if(!hud) return;
    hudName.textContent = currentKey();
    btn?.setAttribute('aria-pressed', String(DEBUG));
  }

  function applyAndRefresh(){
    if (usingPortraitImage && usingPortraitImage()) return; // align only on desktop image
    layout();
    updateHUD();
  }

  function toggleDebug(force){
    DEBUG = typeof force === 'boolean' ? force : !DEBUG;
    document.body.classList.toggle('debug', DEBUG);
    updateHUD();
  }

  function copyJSON(){
    const out = {};
    order.forEach(k=>{
      const v = HS_LANDSCAPE[k];
      out[k] = {
        x:+v.x.toFixed(4), y:+v.y.toFixed(4),
        w:+v.w.toFixed(4), h:+v.h.toFixed(4),
        skew:+Number(v.skew||0).toFixed(2), rot:+Number(v.rot||0).toFixed(2)
      };
    });
    const text = JSON.stringify(out, null, 2);
    navigator.clipboard.writeText(text).catch(()=>{});
    if (hud) { hud.style.boxShadow = '0 0 0 2px #F3BA2F inset'; setTimeout(()=>hud.style.boxShadow='none', 350); }
  }

  function nudge(e){
    if(!DEBUG) return;
    if (usingPortraitImage && usingPortraitImage()) return;

    const v = current();
    const baseStep = 0.002;      // 0.2% per tap
    const big = e.shiftKey ? 0.010 : baseStep;

    let handled = true;
    switch(e.key){
      case 'ArrowLeft':  if(e.shiftKey) v.w = clamp(v.w - big, 0.01, 1); else v.x = clamp(v.x - baseStep, 0, 1); break;
      case 'ArrowRight': if(e.shiftKey) v.w = clamp(v.w + big, 0.01, 1); else v.x = clamp(v.x + baseStep, 0, 1); break;
      case 'ArrowUp':    if(e.shiftKey) v.h = clamp(v.h - big, 0.01, 1); else v.y = clamp(v.y - baseStep, 0, 1); break;
      case 'ArrowDown':  if(e.shiftKey) v.h = clamp(v.h + big, 0.01, 1); else v.y = clamp(v.y + baseStep, 0, 1); break;
      case '[': v.skew = (v.skew||0) - 0.5; break;
      case ']': v.skew = (v.skew||0) + 0.5; break;
      case ';': v.rot  = (v.rot||0)  - 0.5; break;
      case "'": v.rot  = (v.rot||0)  + 0.5; break;
      default: handled = false;
    }
    if(handled){ e.preventDefault(); applyAndRefresh(); }
  }

  function keyHandler(e){
    if(e.key==='a' || e.key==='A'){ toggleDebug(); return; }
    if(!DEBUG) return;

    if(e.key==='Tab'){
      e.preventDefault();
      idx = (idx + (e.shiftKey? order.length-1 : 1)) % order.length;
      updateHUD();
      return;
    }
    if(e.key==='c' || e.key==='C'){ e.preventDefault(); copyJSON(); return; }
    nudge(e);
  }
  window.addEventListener('keydown', keyHandler, true);
  document.addEventListener('keydown', keyHandler, true);

  // Button toggle
  btn?.addEventListener('click', ()=>toggleDebug(), {capture:true});

  // URL toggles: #align or ?align=1
  function autoEnableFromURL(){
    const hash = (location.hash||'').toLowerCase();
    const params = new URLSearchParams(location.search);
    if(hash.includes('align') || params.get('align')==='1'){ toggleDebug(true); }
  }
  document.addEventListener('DOMContentLoaded', autoEnableFromURL);
  autoEnableFromURL();

  // Click a hotspot to select it in debug
  ['hs-tokenomics','hs-contract','hs-links'].forEach((id, i)=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('pointerdown', ()=>{
      if(document.body.classList.contains('debug')){ idx = i; updateHUD(); }
    }, true);
  });
})();
