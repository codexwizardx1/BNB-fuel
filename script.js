const img = document.getElementById('station');
const overlay = document.querySelector('.dark-overlay');

function setOff(isOff) {
  img.classList.toggle('off', isOff);
  overlay.classList.toggle('off', isOff);
}

/* Faster, more natural “buzzing neon” */
function burstFlicker() {
  const burstCount = Math.floor(Math.random() * 3) + 1; // 1–3 quick blinks
  let i = 0;

  const burst = setInterval(() => {
    const off = Math.random() > 0.5; // toggle within the burst
    setOff(off);
    i++;
    if (i >= burstCount) {
      clearInterval(burst);
      // ensure it settles ON most of the time
      setOff(Math.random() > 0.85 ? true : false);
      // schedule next burst quickly for a “fast” feel
      const nextBurst = 100 + Math.random() * 300; // 100–400ms
      setTimeout(burstFlicker, nextBurst);
    }
  }, 60); // SPEED of each mini-flash (40–80ms feels snappy)
}

burstFlicker();
