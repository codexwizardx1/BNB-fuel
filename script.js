const lightsOn = document.getElementById('lights');

function burstFlicker() {
  // number of quick flickers in one burst
  const burstCount = Math.floor(Math.random() * 3) + 1;
  let i = 0;

  const burst = setInterval(() => {
    lightsOn.style.opacity = Math.random() > 0.5 ? 0 : 1;
    i++;
    if (i >= burstCount) clearInterval(burst);
  }, 70); // SPEED of each mini flicker (lower = faster)

  // time between bursts
  const nextBurst = 100 + Math.random() * 400;
  setTimeout(burstFlicker, nextBurst);
}

burstFlicker();
