const lightsOn = document.getElementById('lights');

function burstFlicker() {
  // do a quick burst of flickers
  const burstCount = Math.floor(Math.random() * 3) + 1;
  let i = 0;

  const burst = setInterval(() => {
    lightsOn.style.opacity = (Math.random() > 0.5) ? 0 : 1;
    i++;
    if (i >= burstCount) clearInterval(burst);
  }, 80); // speed of each mini flicker in burst

  // schedule next burst
  const nextBurst = 200 + Math.random() * 600;
  setTimeout(burstFlicker, nextBurst);
}

burstFlicker();
