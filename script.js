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

// Image ratio (your artwork is 1152x768 = 3:2)
const IMAGE_RATIO = 3/2;

/*****************
 * COVER-SIZE THE 3:2 FRAME (no black edges, hotspots aligned)
 *****************/
(function(){
  const frame = document.getElementById('frame');

  function sizeFrame(){
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const viewRatio = vw / vh;

    let w, h;
    if (viewRatio > IMAGE_RATIO) {
      // viewport is wider than 3:2: use full height, expand width
      h = vh;
      w = Math.ceil(h * IMAGE_RATIO);
    } else {
      // viewport is taller/narrower: use full width, expand height
      w = vw;
      h = Math.ceil(w / IMAGE_RATIO);
    }
    // center the frame
    frame.style.width  = w + 'px';
    frame.style.height = h + 'px';
    frame.style.left   = ((vw - w) / 2) + 'px';
    frame.style.top    = ((vh - h) / 2) + 'px';
  }

  window.addEventListener('resize', sizeFrame);
  sizeFrame();
})();

/*****************
 * FAST FLICKER (single-image method)
 *****************/
const img = document.getElementById('station');
const overlay = document.querySelector('.dark-overlay');

function setOff(isOff){
  img.classList.toggle('off', isOff);
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

lnkBuy.href = LINKS.BUY;
lnkChart.href = LINKS.CHART;
lnkDex.href = LINKS.DEXTOOLS;
lnkTg.href = LINKS.TELEGRAM;
lnkTw.href = LINKS.TWITTER;
lnkWp.href = LINKS.WHITEPAPER;

// Tokenomics modal
const mTok = document.getElementById('modal-tokenomics');
document.getElementById('tok-supply').textContent = TOKENOMICS.supply;
document.getElementById('tok-tax').textContent = TOKENOMICS.tax;
document.getElementById('tok-liq').textContent = TOKENOMICS.liquidity;
document.getElementById('tok-addr').textContent = CONTRACT_ADDRESS;

// Open/close wiring
const openContract   = () => mContract.setAttribute('aria-hidden','false');
const openLinks      = () => mLinks.setAttribute('aria-hidden','false');
const openTokenomics = () => mTok.setAttribute('aria-hidden','false');
const closeModal     = (m) => m.setAttribute('aria-hidden','true');

document.querySelector('.hs-contract')  .addEventListener('click', openContract);
document.querySelector('.hs-links')     .addEventListener('click', openLinks);
document.querySelector('.hs-tokenomics').addEventListener('click', openTokenomics);

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
