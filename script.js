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
 * HOTSPOTS (store IDs; resolve elements later)
 *****************/
const HS_LANDSCAPE = {
  tokenomics: { id:'hs-tokenomics', x:0.2000, y:0.6470, w:0.0960, h:0.0360, skew:-7,  rot:-7   },
  contract:   { id:'hs-contract',   x:0.4810, y:0.6450, w:0.1020, h:0.0340, skew:-4,  rot:5.2  },
  links:      { id:'hs-links',      x:0.6610, y:0.6710, w:0.0480, h:0.0290, skew:-5,  rot:2.2  },
};

function hydrate(map){
  Object.values(map).forEach(s=>{
    s.el = document.getElementById(s.id) || null;
    if (!s.el && !s._warned){
      console.warn(`⚠️ Missing hotspot element: #${s.id}`);
      s._warned = true;
    }
  });
}

/*****************
 * DETECT PORTRAIT (mobile)
 *****************/
function usingPortraitImage(){
  const src = stationImg.currentSrc || stationImg.src;
  return (stationImg.naturalHeight > stationImg.naturalWidth) ||
         /station_mobile_1080x1920/i.test(src);
}
const MOBILE_ZOOM = 1.5;

/*****************
 * LAYOUT
 *****************/
let HS = null;

window.layout = function layout(){
  const vw = window.innerWidth;
  const vh = (window.visualViewport?.height) ? Math.floor(window.visualViewport.height) : window.innerHeight;

  const iw = stationImg.naturalWidth  || 1152;
  const ih = stationImg.naturalHeight || 768;

  const ALIGN_DEBUG = !!window.__ALIGN_DEBUG;

  if (usingPortraitImage() && !ALIGN_DEBUG) {
    // Portrait (mobile)
   const contain = Math.min(vw/iw, vh/ih);
const cover   = Math.max(vw/iw, vh/ih);

// 💥 Allow zoom beyond cover:
const scale   = contain * MOBILE_ZOOM;

    const dispW = Math.round(iw * scale);
    const dispH = Math.round(ih * scale);
    const offX  = Math.floor((vw - dispW) / 2);
    const offY  = Math.floor((vh - dispH) / 2);

    Object.assign(stage.style, { left: offX+'px', top: offY+'px', width: dispW+'px', height: dispH+'px' });

    const remap = v => v ? ({ ...v, y: 0.3125 + 0.375*v.y, h: 0.375*v.h }) : null;
    HS = {
      tokenomics: remap(HS_LANDSCAPE.tokenomics),
      contract:   remap(HS_LANDSCAPE.contract),
      links:      remap(HS_LANDSCAPE.links)
    };
  } else {
    // Desktop (and forced during Align)
    const scale = Math.max(vw/iw, vh/ih);
    const dispW = Math.round(iw * scale);
    const dispH = Math.round(ih * scale);
    const offX  = Math.floor((vw - dispW) / 2);
    const offY  = Math.floor((vh - dispH) / 2);

    Object.assign(stage.style, { left: offX+'px', top: offY+'px', width: dispW+'px', height: dispH+'px' });

    HS = JSON.parse(JSON.stringify(HS_LANDSCAPE));
  }

  // Resolve elements **now**, every layout, then place
  hydrate(HS);
  const rect = stage.getBoundingClientRect();
  const dispW = rect.width;
  const dispH = rect.height;

  Object.values(HS)
    .filter(spec => spec && spec.el)  // skip missing safely
    .forEach(spec => place(spec, dispW, dispH, ALIGN_DEBUG));
};

function place(spec, dispW, dispH, ALIGN_DEBUG){
  // safety: if no el, skip
  if (!spec || !spec.el) return;

  const x = spec.x * dispW;
  const y = spec.y * dispH;
  let   w = spec.w * dispW;
  let   h = spec.h * dispH;

  if (ALIGN_DEBUG) {
    if (!w || w < 20) w = 140;
    if (!h || h < 10) h = 40;
  }

  Object.assign(spec.el.style, {
    position: 'absolute',
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
if (window.visualViewport){
  visualViewport.addEventListener('resize', layout);
  visualViewport.addEventListener('scroll', layout);
}

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

const open  = m => m.setAttribute('aria-hidden','false');
const close = m => m.setAttribute('aria-hidden','true');
const onOpen = (modal) => (e) => { e.stopPropagation(); e.preventDefault(); open(modal); };

// attach only if element exists
function wireClicks(){
  const t = document.getElementById('hs-tokenomics');
  const c = document.getElementById('hs-contract');
  const l = document.getElementById('hs-links');
  if (t) t.addEventListener('click', onOpen(mTok));
  if (c) c.addEventListener('click', onOpen(mContract));
  if (l) l.addEventListener('click', onOpen(mLinks));
}
document.addEventListener('DOMContentLoaded', wireClicks);

document.querySelectorAll('.modal').forEach(mod=>{
  mod.addEventListener('click', (e)=>{
    if(e.target.matches('[data-close]') || e.target.classList.contains('modal-backdrop')) close(mod);
  }, { capture:true });
});
document.addEventListener('keydown', (e)=>{
  if(e.key==='Escape'){ [mContract,mLinks,mTok].forEach(m=>{ if(m.getAttribute('aria-hidden')==='false') close(m); }); }
});

/*****************
 * ALIGNMENT MODE (desktop)
 *****************/
(function(){
  const order = ['tokenomics','contract','links'];
  let idx = 0;

  const hud = document.getElementById('align-hud');
  const hudName = document.getElementById('hud-name');

  function currentKey(){ return order[idx]; }
  function current(){ return HS_LANDSCAPE[currentKey()]; }
  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
  function updateHUD(){ if(hud) hudName.textContent = currentKey(); }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'a' || e.key === 'A') {
      window.__ALIGN_DEBUG = !window.__ALIGN_DEBUG;
      document.body.classList.toggle('debug', window.__ALIGN_DEBUG);
      layout();
    }
  });

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
    navigator.clipboard.writeText(JSON.stringify(out, null, 2)).catch(()=>{});
    if (hud) { hud.style.boxShadow = '0 0 0 2px #F3BA2F inset'; setTimeout(()=>hud.style.boxShadow='none', 350); }
  }

  function nudge(e){
    if (!window.__ALIGN_DEBUG) return;
    const v = current();
    const baseStep = 0.002;
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
    if(handled){ e.preventDefault(); layout(); updateHUD(); }
  }

  function keyHandler(e){
    if(e.key==='Tab' && window.__ALIGN_DEBUG){
      e.preventDefault();
      idx = (idx + (e.shiftKey? order.length-1 : 1)) % order.length;
      updateHUD();
      return;
    }
    if((e.key==='c' || e.key==='C') && window.__ALIGN_DEBUG){
      e.preventDefault(); copyJSON(); return;
    }
    nudge(e);
  }

  window.addEventListener('keydown', keyHandler, true);
  document.addEventListener('keydown', keyHandler, true);

  ['hs-tokenomics','hs-contract','hs-links'].forEach((id, i)=>{
    const el = document.getElementById(id);
    if(!el) return;
    el.addEventListener('click', ()=>{
      if(window.__ALIGN_DEBUG){ idx = i; updateHUD(); }
    }, true);
  });
})();
