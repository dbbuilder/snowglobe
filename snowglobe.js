const canvas = document.getElementById("snowGlobe");
const ctx = canvas.getContext("2d");

// Snowflake properties
const NUM_FLAKES = 150;
const flakes = [];
let shakeThreshold = 15;

// Image placeholder for the globe background
const globeImage = new Image();
globeImage.src = "https://via.placeholder.com/300x300"; // Replace with your image URL

// Track mouse movement
let lastMouseX = null;
let lastMouseY = null;

// Handle motion permissions for iOS
function requestMotionPermission() {
  if (typeof DeviceMotionEvent.requestPermission === "function") {
    DeviceMotionEvent.requestPermission()
      .then((response) => {
        if (response === "granted") {
          console.log("Motion access granted");
          handleShake();
        } else {
          alert("Motion access denied. Click to try again.");
        }
      })
      .catch((error) => console.error("Permission error:", error));
  } else {
    // Non-iOS devices or older browsers
    handleShake();
  }
}
// Initialize snowflakes
function createSnowflakes() {
  for (let i = 0; i < NUM_FLAKES; i++) {
    flakes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * (canvas.height - 100), // Restrict to upper part of the canvas
      radius: Math.random() * 3 + 1, // Snowflake size
      speed: Math.random() * 1 + 0.5,
      angle: Math.random() * 360,
    });
  }
}

// Draw the base of the snow globe
function drawBase() {
  ctx.fillStyle = "#8B4513"; // Wooden base color
  ctx.fillRect(75, 300, 150, 50); // Rectangle base
}

// Draw the snow globe circle and constrain the particles
function drawGlobe() {
  ctx.save();
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 150, 150, 0, Math.PI * 2); // Circle clip for snow globe
  ctx.closePath();
  ctx.clip();

  // Draw background image inside the snow globe
  ctx.drawImage(globeImage, 0, 0, 300, 300);

  // Draw snowflakes
  flakes.forEach((flake) => {
    ctx.beginPath();
    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.fill();

    // Move snowflake
    flake.y += flake.speed;
    flake.x += Math.sin(flake.angle) * 0.5;

    // Reset position if out of circle bounds
    const dx = flake.x - canvas.width / 2;
    const dy = flake.y - 150;
    if (Math.sqrt(dx * dx + dy * dy) > 150) {
      flake.y = 0;
      flake.x = Math.random() * canvas.width;
    }
  });

  ctx.restore();
}

// Simulate shake on mouse movement over the circle
function handleMouseShake() {
  // Call this function when the user interacts with the page
  canvas.addEventListener("mousemove", (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Calculate distance from the center of the globe
    const dx = mouseX - canvas.width / 2;
    const dy = mouseY - 150;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= 150) {
      // Only respond when mouse is within the globe
      if (lastMouseX !== null && lastMouseY !== null) {
        const deltaX = Math.abs(mouseX - lastMouseX);
        const deltaY = Math.abs(mouseY - lastMouseY);

        // If movement exceeds shake threshold, reset snowfall
        if (deltaX + deltaY > shakeThreshold) {
          resetSnowfall();
        }
      }
      lastMouseX = mouseX;
      lastMouseY = mouseY;
    } else {
      lastMouseX = null;
      lastMouseY = null;
    }
  });
}

// Shake detection using DeviceMotion API
function handleShake() {
  let lastX = null,
    lastY = null,
    lastZ = null;

  window.addEventListener("devicemotion", (event) => {
    const { x, y, z } = event.accelerationIncludingGravity;

    if (lastX !== null && lastY !== null && lastZ !== null) {
      const deltaX = Math.abs(x - lastX);
      const deltaY = Math.abs(y - lastY);
      const deltaZ = Math.abs(z - lastZ);

      if (deltaX + deltaY + deltaZ > shakeThreshold) {
        resetSnowfall(); // Trigger snowfall reset on shake
      }
    }

    lastX = x;
    lastY = y;
    lastZ = z;
  });
}

// Reset snowflakes on shake or mouse movement
function resetSnowfall() {
  flakes.forEach((flake) => {
    flake.y = Math.random() * canvas.height * 0.5; // Reset snowflakes to the top
    flake.x = Math.random() * canvas.width;
  });
}

// Main draw loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw the globe base
  drawBase();

  // Draw the snow globe and snowflakes
  drawGlobe();

  requestAnimationFrame(draw);
}

// Initialize
globeImage.onload = () => {
  createSnowflakes();
  handleShake();
  handleMouseShake(); // Add mouse shake handling
  draw();
};

// Request motion permission on the first user click/tap
document.addEventListener("click", requestMotionPermission);
