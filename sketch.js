// Particle System with Hand Detection and Black Holes

let handPose;
let video;
let hands = [];
let particles = [];
let wind = 0;
let gravityStrength = 0.1;
let stars = [];
let blackHoles = [];
let fireworks = [];
let fireworkTriggers = [];

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent('canvasContainer');

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handPose = ml5.handPose(video, modelReady);

  // background stars
  for (let i = 0; i < 200; i++) {
    stars.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      brightness: random(150, 255)
    });
  }
}

function modelReady() {
  console.log('HandPose model loaded.');
  handPose.detectStart(video, gotHands);
}

function draw() {
  // Night sky background
  background(10, 10, 30);
  noStroke();
  for (let star of stars) {
    fill(255, 255, 255, star.brightness);
    ellipse(star.x, star.y, star.size);
  }

  // Black holes
  createBlackHoles();
  updateBlackHoles();

  // Firework triggers
  createFireworkTriggers();
  showFireworkTriggers();
  updateFireworks();

  // Particle collision with triggers
  checkFireworkTriggers();

  // Hand hints
  drawHandHints();

  // Generate particles from open hands
  generateParticlesFromHands();

  // Draw particles
  updateParticles();
}

function drawHandHints() {
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];

    // Draw shining stars at fingertips
    let fingertipIndexes = [4, 8, 12, 16, 20];
    for (let index of fingertipIndexes) {
      let tip = hand.keypoints[index];
      if (tip) {
        // Flip the x-coordinate
        let flippedX = width - tip.x;
        // Draw a star at the fingertip position
        drawStar(flippedX, tip.y, 5, 10, 5);
      }
    }
  }
}

// Helper function to draw a star shape
// this part is done with help of chatgpt
function drawStar(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  fill(255, 215, 0, 200); // Gold color
  noStroke();
  beginShape();
  for (let a = 0; a < TWO_PI; a += angle) {
    let sx = x + cos(a) * radius2;
    let sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a + halfAngle) * radius1;
    sy = y + sin(a + halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

function generateParticlesFromHands() {
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    if (isHandOpen(hand)) {
      let fingertipIndexes = [4, 8, 12, 16, 20]; // Fingertips

      for (let index of fingertipIndexes) {
        let tip = hand.keypoints[index];
        if (tip) {
          let flippedX = width - tip.x;
          particles.push(new Particle(flippedX, tip.y));
        }
      }
    }
  }
}

function isHandOpen(hand) {
  let wrist = hand.keypoints[0];
  if (!wrist) return false;

  let wristX = width - wrist.x;
  let wristY = wrist.y;
  let extendedFingers = 0;

  let fingerBases = [2, 5, 9, 13, 17];
  let fingerTips = [4, 8, 12, 16, 20];

  for (let i = 0; i < fingerBases.length; i++) {
    let fingerBase = hand.keypoints[fingerBases[i]];
    let fingerTip = hand.keypoints[fingerTips[i]];

    if (!fingerBase || !fingerTip) continue;

    let baseX = width - fingerBase.x;
    let baseY = fingerBase.y;
    let tipX = width - fingerTip.x;
    let tipY = fingerTip.y;

    let baseToTip = dist(baseX, baseY, tipX, tipY);
    let baseToWrist = dist(baseX, baseY, wristX, wristY);

    if (baseToTip > baseToWrist * 0.7) {
      extendedFingers++;
    }
  }

  return extendedFingers >= 3;
}

function updateParticles() {
  applyRandomEnvironmentalEffects();

  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];

    let gravity = createVector(0, gravityStrength);
    p.applyForce(gravity);

    let windForce = createVector(wind, 0);
    p.applyForce(windForce);

    p.update();
    p.show();

    if (p.isFinished()) {
      particles.splice(i, 1);
    }
  }
}

function applyRandomEnvironmentalEffects() {
  if (frameCount % 180 === 0) {
    wind = random(-0.2, 0.2);
  }
  if (frameCount % 300 === 0) {
    gravityStrength = random(-0.1, 0.2);
  }
}

function createBlackHoles() {
  if (random(1) < 0.002) {
    let x = random(width);
    let y = random(height);
    blackHoles.push(new BlackHole(width - x, y));
  }
}

function updateBlackHoles() {
  for (let i = blackHoles.length - 1; i >= 0; i--) {
    let blackHole = blackHoles[i];
    blackHole.update();
    blackHole.show();

    for (let j = particles.length - 1; j >= 0; j--) {
      let p = particles[j];
      blackHole.attract(p);
      blackHole.checkAbsorption(p, j);
    }

    blackHole.possiblyEjectParticles();
    if (blackHole.lifespan <= 0) {
      blackHoles.splice(i, 1);
    }
  }
}

function updateFireworks() {
  for (let i = fireworks.length - 1; i >= 0; i--) {
    let fw = fireworks[i];
    fw.update();
    fw.show();
    if (fw.isFinished()) {
      fireworks.splice(i, 1);
    }
  }
}

function gotHands(results) {
  hands = results;

  hands = hands.filter(hand => {
    let wrist = hand.keypoints[0];
    if (!wrist) return true;
    let wristX = width - wrist.x;
    let wristY = wrist.y;

    for (let i = 0; i < blackHoles.length; i++) {
      let blackHole = blackHoles[i];
      let blackHoleX = width - blackHole.pos.x;
      let distance = dist(wristX, wristY, blackHoleX, blackHole.pos.y);
      if (distance < blackHole.radius / 2) {
        // Hand is inside black hole
        return false; // Exclude this hand
      }
    }
    return true; // Keep the hand
  });
}

function createFireworkTriggers() {
  if (random(1) < 0.005) {
    let x = random(width);
    let y = random(height);
    fireworkTriggers.push({ x: x, y: y });
  }
}

function checkFireworkTriggers() {
  for (let i = fireworkTriggers.length - 1; i >= 0; i--) {
    let trigger = fireworkTriggers[i];
    for (let j = particles.length - 1; j >= 0; j--) {
      let p = particles[j];
      let d = dist(trigger.x, trigger.y, p.pos.x, p.pos.y);
      if (d < 10) { // Collision threshold
        fireworks.push(new Firework(trigger.x, trigger.y));
        fireworkTriggers.splice(i, 1);
        break; // Only trigger once per particle
      }
    }
  }
}

function showFireworkTriggers() {
  noStroke();
  fill(255, 0, 0, 150);
  for (let trigger of fireworkTriggers) {
    ellipse(trigger.x, trigger.y, 10);
  }
}