let handPose;
let video;
let hands = [];
let gravityStrength = 0.1;
let stars = [];
let boids = [];
let explodingStars = [];

function setup() {
  let canvas = createCanvas(640, 480);
  canvas.parent('canvasContainer');

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handPose = ml5.handPose(video, modelReady);

  // Create a flock of boids (stars)
  for (let i = 0; i < 100; i++) {
    boids.push(new Boid(random(width), random(height)));
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

  // Mood based on the number of hands detected
  let mood = getMood();

  // Update and display each Boid based on the current mood
  for (let boid of boids) {
    switch (mood) {
      case 'one-hand':
        boid.maxSpeed = 4; // Slower speed when one hand is detected
        break;
      case 'two-hands':
        boid.maxSpeed = 6; // Faster and more creative movement for two hands
        applyCreativeMovement(boid); // Additional creative behavior
        break;
      default: // No hands
        boid.maxSpeed = 2; // Normal speed when no hands are detected
        break;
    }
    boid.update(); // Update position
    boid.edges();
    boid.show(); // Draw as a star
  }

  // Handle exploding stars for all moods
  switch (mood) {
    case 'one-hand':
      for (let star of explodingStars) {
        star.update();
        applyCreativeExplodingStar(star); // Creative behavior for one hand
        star.show();
      }

      if (frameCount % 60 === 0 && explodingStars.length < 3) {
        explodingStars.push(new ExplodingStar(8, 20)); // Add a new star every 60 frames
      }
      break;

    case 'two-hands':
      if (frameCount % 30 === 0) {
        let numberOfStars = int(random(2, 5)); // Random number of stars to create
        for (let i = 0; i < numberOfStars; i++) {
          explodingStars.push(new ExplodingStar(8, 20)); // Add new stars to the array
        }
      }

      for (let i = explodingStars.length - 1; i >= 0; i--) {
        let star = explodingStars[i];
        star.update();
        star.show();

        if (star.toRemove) {
          explodingStars.splice(i, 1); // Remove from array
        }
      }
      break;

    default: // No hands
      for (let star of explodingStars) {
        star.update();
        star.show();
      }

      if (frameCount % 90 === 0 && explodingStars.length < 3) {
        explodingStars.push(new ExplodingStar(8, 20)); // Add a new star every 90 frames
      }
      break;
  }

  // Remove exploded stars
  for (let i = explodingStars.length - 1; i >= 0; i--) {
    if (explodingStars[i].toRemove) {
      explodingStars.splice(i, 1); // Remove from array
    }
  }

  // Hand hints
  drawHandHints();
}

function getMood() {
  if (hands.length === 0) {
    return 'no-hands'; // No hands detected
  } else if (hands.length === 1) {
    return 'one-hand'; // One hand detected
  } else if (hands.length >= 2) {
    return 'two-hands'; // Two hands detected
  }
}

function drawHandHints() {
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    let handOpen = isHandOpen(hand);

    let wrist = hand.keypoints[0];
    if (!wrist) continue;

    let wristX = width - wrist.x; // Flip the x-coordinate for mirroring
    let wristY = wrist.y;
    let handPos = createVector(wristX, wristY);

    for (let boid of boids) {
      let force = p5.Vector.sub(boid.pos, handPos); // Vector from hand to boid
      let distance = force.mag(); // Distance between boid and hand

      if (handOpen) {
        let maxRepelDistance = 100; // Max distance to apply repulsion
        if (distance < maxRepelDistance) {
          force.setMag(0.1); // Strength of repulsion
          boid.applyForce(force);
        }
      } else {
        force.setMag(-0.1); // Attraction strength
        boid.applyForce(force);
      }
    }

    let fingertipIndexes = [4, 8, 12, 16, 20];
    for (let index of fingertipIndexes) {
      let tip = hand.keypoints[index];
      if (tip) {
        let flippedX = width - tip.x;
        drawStar(flippedX, tip.y, 5, 10, 5);
      }
    }
  }
}

function applyCreativeMovement(boid) {
  let randomForce = p5.Vector.random2D().mult(0.05); // Small random force
  boid.applyForce(randomForce);

  if (hands.length > 0) {
    let hand = hands[0];
    let wrist = hand.keypoints[0];
    if (wrist) {
      let handPos = createVector(width - wrist.x, wrist.y);
      let gravity = p5.Vector.sub(handPos, boid.pos); // Direction of gravity
      gravity.setMag(0.05); // Control the gravity strength
      boid.applyForce(gravity);
    }
  }
}

function applyCreativeExplodingStar(explodingStar) {
  let randomOffset = p5.Vector.random2D().mult(1); // Small random offset
  explodingStar.pos.add(randomOffset);

  explodingStar.size += random(-0.5, 0.5);

  if (hands.length > 0) {
    let hand = hands[0];
    let wrist = hand.keypoints[0];
    if (wrist) {
      let handPos = createVector(width - wrist.x, wrist.y);
      let gravity = p5.Vector.sub(handPos, explodingStar.pos); // Direction of gravity
      gravity.setMag(0.05); // Control the gravity strength
      explodingStar.pos.add(gravity);
    }
  }
}

function drawStar(x, y, radius1, radius2, npoints) {
  let angle = TWO_PI / npoints;
  let halfAngle = angle / 2.0;
  fill(255, 215, 0, 200);
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

function gotHands(results) {
  hands = results;

  hands = hands.filter(hand => {
    let wrist = hand.keypoints[0];
    if (!wrist) return true;
    let wristX = width - wrist.x;
    let wristY = wrist.y;

    return true; // Keep the hand
  });
}