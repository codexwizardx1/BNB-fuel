window.addEventListener('DOMContentLoaded', () => {
  const tank = document.querySelector('.tank');
  const text = document.getElementById('fuelText');

  const FILL_DURATION = 4000; // total time in ms (4s)
  const START_DELAY = 500;    // delay before filling starts
  const STEP_TIME = FILL_DURATION / 100; // time per 1% increment

  // Start the fill animation after short delay
  setTimeout(() => {
    tank.classList.add('filling');
  }, START_DELAY);

  // Percentage counter animation
  let percent = 0;
  const interval = setInterval(() => {
    percent++;
    text.textContent = `${percent}%`;

    if (percent >= 100) {
      clearInterval(interval);
      text.textContent = 'FULL';

      setTimeout(() => {
        // redirect to main site
        window.location.href = 'index.html';
      }, 800);
    }
  }, STEP_TIME);
});
