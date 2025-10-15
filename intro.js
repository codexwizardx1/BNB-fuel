window.addEventListener('DOMContentLoaded', () => {
  const tank = document.querySelector('.tank');
  const text = document.getElementById('fuelText');
  const introLayer = document.getElementById('introLayer');

  const FILL_DURATION = 4000;
  const START_DELAY = 500;
  const STEP_TIME = FILL_DURATION / 100;

  // Start filling
  setTimeout(() => {
    tank.classList.add('filling');
  }, START_DELAY);

  // % counter
  let percent = 0;
  const interval = setInterval(() => {
    percent++;
    text.textContent = `${percent}%`;
    if (percent >= 100) {
      clearInterval(interval);
      text.textContent = 'FULL';

      setTimeout(() => {
        introLayer.classList.add('slide-up');

        // redirect after slide animation
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1300);
      }, 500);
    }
  }, STEP_TIME);
});
