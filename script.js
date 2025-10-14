const lightsOn = document.getElementById('lights');

function flicker() {
  // Random chance for the light to turn off
  if (Math.random() > 0.8) {
    lightsOn.style.opacity = 0; // off
  } else {
    lightsOn.style.opacity = 1; // on
  }

  // Random interval between flickers
  const nextFlicker = 200 + Math.random() * 800;
  setTimeout(flicker, nextFlicker);
}

flicker();
