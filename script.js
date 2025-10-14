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
// Optional tokenomics values (used to fill the modal)
const TOKENOMICS = {
  supply: "1,000,000,000 FUEL",
  tax: "0%",
  liquidity: "Locked",
};

/*****************
 * FAST FLICKER (single-image method)
 *****************/
const img = document.getElementById('station');
const overlay = document.querySelector('.dark-overlay');

function setOff(isOff){
  img.classList.toggle('off', isOff);
  overlay.classList.toggle('off', isOff);
}
function burstFlicker(){
  const burstCount = Math.floor(Math.random()*3)+1; // 1–3 quick blinks
  let i=0;
  const burst = setInterval(()=>{
    setOff(Math.random()>0.5);
    i++;
    if(i>=burstCount){
      clearInterval(burst);
      // settle mostly ON
      setOff(Math.random()>0.85);
      setTimeout(burstFlicker, 100 + Math.random()*300);
    }
  }, 60); // faster feel (40–80ms is zippy)
}
burstFlicker();

/*****************
 * MODAL HELPERS
 *****************/
function openModal(el){ el.setAttribute('aria-hidden','false'); }
function closeModal(el){ el.setAttribute('aria-hidden','true'); }

// contract modal
const mContract = document.getElementById('modal-contract');
const contractValue = document.getElementById('contract-value');
const copyBtn = document.getElementById('copyContract');

// links modal
const mLinks = document.getElementById('modal-links');
const lnkBuy = document.getElementById('lnk-buy');
const lnkChart = document.getElementById('lnk-chart');
const lnkDex = document.getElementById('lnk-dextools');
const lnkTg = document.getElementById('lnk-telegram');
const lnkTw = document.getElementById('lnk-twitter');
const lnkWp = document.getElementById('lnk-whitepaper');

// tokenomics modal
const mTok = document.getElementById('modal-tokenomics');
const tokSupply = document.getElementById('tok-supply');
const tokTax = document.getElementById('tok-tax');
const tokLiq = document.getElementById('tok-liq');
const tokAddr = document.getElementById('tok-addr');

// fill dynamic values
contractValue.textContent = CONTRACT_ADDRESS;
tokSupply.textContent = TOKENOMICS.supply;
tokTax.textContent = TOKENOMICS.tax;
tokLiq.textContent = TOKENOMICS.liquidity;
tokAddr.textContent = CONTRACT_ADDRESS;

// set link hrefs
lnkBuy.href = LINKS.BUY;
lnkChart.href = LINKS.CHART;
lnkDex.href = LINKS.DEXTOOLS;
lnkTg.href = LINKS.TELEGRAM;
lnkTw.href = LINKS.TWITTER;
lnkWp.href = LINKS.WHITEPAPER;

// open/close listeners
document.querySelector('.hs-contract').addEventListener('click', ()=>openModal(mContract));
document.querySelector('.hs-links').addEventListener('click', ()=>openModal(mLinks));
document.querySelector('.hs-tokenomics').addEventListener('click', ()=>openModal(mTok));

document.querySelectorAll('.modal').forEach(mod=>{
  mod.addEventListener('click', (e)=>{
    if(e.target.matches('[data-close]') || e.target.classList.contains('modal-backdrop')){
      closeModal(mod);
    }
  });
});

document.addEventListener('keydown',(e)=>{
  if(e.key==='Escape'){
    [mContract,mLinks,mTok].forEach(m=>{ if(m.getAttribute('aria-hidden')==='false') closeModal(m); });
  }
});

// copy to clipboard
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
