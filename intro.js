window.addEventListener('load', () => {
  const tank = document.querySelector('.tank');
  const text = document.getElementById('fuelText');

  // Start filling
  setTimeout(() => {
    tank.classList.add('filling');
  }, 500);

  // % counter animation
  let percent = 0;
  const interval = setInterval(() => {
    percent++;
    text.textContent = `${percent}%`;
    if (percent >= 100) {
      clearInterval(interval);
      text.textContent = 'FULL';
      setTimeout(() => {
        // redirect to main site
        window.location.href = 'main.html';
      }, 800);
    }
  }, 40); // ~4 seconds
});
