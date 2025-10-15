window.addEventListener('DOMContentLoaded', () => {
  const tank = document.querySelector('.tank');
  const text = document.getElementById('fuelText');

  const FILL_DURATION = 4000; // total ms for fill
  const START_DELAY = 500;
  const STEP_TIME = FILL_DURATION / 100;

  // Start wave fill
  setTimeout(() => {
    tank.classList.add('filling');
  }, START_DELAY);

  // Counter
  let percent = 0;
  const interval = setInterval(() => {
    percent++;
    text.textContent = `${percent}%`;

    if (percent >= 100) {
      clearInterval(interval);
      text.textContent = 'FULL';
      setTimeout(() => {
        window.location.href = 'main.html';
      }, 800);
    }
  }, STEP_TIME);
});
