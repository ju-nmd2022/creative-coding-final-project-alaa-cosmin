let handPose;
let video;
let hands = [];
let gravityStrength = 0.1;
let stars = [];
let boids = [];
let explodingStars = [];
let blackHoles = [];

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
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

  // Limit the number of boids (particles) on the screen
  let maxBoids = 300; // Set a maximum number of particles
  if (boids.length > maxBoids) {
    boids.splice(0, boids.length - maxBoids); // Remove the oldest particles
  }

  // Update and display each Boid based on the current mood
  for (let boid of boids) {
    switch (mood) {
      case 'one-hand':
        boid.maxSpeed = 7; // Slower speed when one hand is detected
        applyCreativeMovement(boid); // Apply creative movement behavior
        break;
      case 'two-hands':
        boid.maxSpeed = 12; // Faster and more creative movement for two hands
        applyCreativeMovement(boid); // Apply creative movement behavior
        break;
      default: // No hands
        boid.maxSpeed = 2; // Use similar speed to 'one-hand' for no-hands mood
        break;
    }
    boid.update(); // Update position
    boid.edges();
    boid.show(); // Draw as a star
  }

  // Handle black hole interactions based on mood and creative decisions
  for (let i = blackHoles.length - 1; i >= 0; i--) {
    let blackHole = blackHoles[i];
    blackHole.update();
    blackHole.show();

    // Make gravity strength unique for each black hole
    let gravityStrength = random(0.05, 0.5); // Different gravity for each black hole

    // Interact with boids based on mood and creative decisions
    for (let j = boids.length - 1; j >= 0; j--) {
      let boid = boids[j];

      // Add variation to gravity so some particles move faster towards the black hole
      let variedGravityStrength = random(0.1, 0.5) * gravityStrength;

      // Selectively apply gravity or leave particles unaffected
      if (random(1) < 0.7) { // 70% chance to apply gravity, 30% to leave unaffected
        blackHole.attract(boid, variedGravityStrength); // Apply creative gravitational pull
      }

      // In no-hands mood, black holes randomly absorb, spin, or leave particles unaffected
      if (mood === 'no-hands') {
        let blackHoleAction = random(1);
        if (blackHoleAction < 0.33) {
          // Absorb particle
          blackHole.checkAbsorption(boid, j);
        } else if (blackHoleAction < 0.66) {
          // Spin particles for creative effect
          boid.vel.rotate(random(-PI / 4, PI / 4));
        }
      } else if (mood === 'one-hand') {
        if (random(1) < 0.6) {
          blackHole.checkAbsorption(boid, j); // Absorb particle with 60% chance
        } else {
          boid.vel.mult(1.5); // Increase boid speed for more dynamic interaction
        }
      } else if (mood === 'two-hands') {
        let distance = dist(blackHole.pos.x, blackHole.pos.y, boid.pos.x, boid.pos.y);
        if (distance < blackHole.radius / 2) {
          if (random(1) < 0.5) {
            boid.vel.mult(0); // Stop the particle if it touches the black hole
          } else {
            boid.vel.rotate(random(-PI / 4, PI / 4)); // Apply random spin for creativity
          }
        }
      }
    }

    // Interact with exploding stars for creative effects
    for (let k = explodingStars.length - 1; k >= 0; k--) {
      let star = explodingStars[k];
      let distance = dist(blackHole.pos.x, blackHole.pos.y, star.pos.x, star.pos.y);

      // Increase the chance for black holes to absorb exploding stars
      if (distance < blackHole.radius / 2 && random(1) < 0.7) {
        blackHole.checkAbsorption(star, k); // Higher chance to absorb exploding star
      }

      // Apply creative effects to exploding stars: increase size, reduce lifespan
      if (distance < blackHole.radius / 2) {
        if (random(1) < 0.5) {
          star.size = min(star.size * 1.3, 100); // Limit maximum size of exploding stars
          star.lifeSpan = min(star.lifeSpan, 180); // Limit duration to 180 frames
        }
      }
    }

    // If black hole lifespan reaches 0, regenerate particles and remove black hole
    if (blackHole.lifespan <= 0) {
      blackHole.regenerateParticles(); // Release absorbed particles
      blackHoles.splice(i, 1); // Remove black hole from array
    }
  }

  // Shortened interval for black hole creation
  if (frameCount % 300 === 0) { // Black holes appear more frequently now
    blackHoles.push(new BlackHole(random(width), random(height)));
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