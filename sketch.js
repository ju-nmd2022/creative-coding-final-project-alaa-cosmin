let handPose;
let video;
let hands = [];
let gravityStrength = 0.1;
let stars = [];
let boids = [];
let explodingStars = [];
let blackHoles = [];
let comet;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("canvasContainer");

  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handPose = ml5.handPose(video, modelReady);

  // Create boids (stars)
  for (let i = 0; i < 100; i++) {
    boids.push(new Boid(random(width), random(height)));
  }

  comet = new Comet();
}

function modelReady() {
  console.log("HandPose model loaded.");
  handPose.detectStart(video, gotHands);
}

function draw() {
  background(10, 10, 30);
  noStroke();

  //Setting the mood of the system based on the number of hands detected.
  let mood = getMood();
  // Limit the number of boids on the canvas
  let maxBoids = 400;
  if (boids.length > maxBoids) {
    boids.splice(0, boids.length - maxBoids);
  }

  // Update and display each Boid based on the current mood
  for (let boid of boids) {
    switch (mood) {
      case "one-hand":
        boid.maxSpeed = 7;
        applyCreativeMovement(boid); // Apply creative movement behavior
        break;
      case "two-hands":
        boid.maxSpeed = 12;
        applyCreativeMovement(boid); // Apply creative movement behavior
        break;
      default: // No hands
        boid.maxSpeed = 2;
        break;
    }
    boid.update();
    boid.edges();
    boid.show();
  }

  // Handle black hole interactions based on mood
  for (let i = blackHoles.length - 1; i >= 0; i--) {
    let blackHole = blackHoles[i];
    blackHole.update();
    blackHole.show();

    // Random gravity strength for the black holes
    let gravityStrength = random(0.05, 0.5);

    // Interact with boids based on mood and creative decisions
    for (let j = boids.length - 1; j >= 0; j--) {
      let boid = boids[j];

      // Add variation to gravity so some particles move faster towards the black hole
      let variedGravityStrength = random(0.1, 0.5) * gravityStrength;

      // In "no-hands" mood, attract only nearby particles
      if (mood === "no-hands") {
        let distance = dist(
          blackHole.pos.x,
          blackHole.pos.y,
          boid.pos.x,
          boid.pos.y
        );
        if (distance < blackHole.radius) {
          blackHole.attract(boid, variedGravityStrength);
        }
      } else {
        blackHole.attract(boid, variedGravityStrength); // Attract all particles in other moods
      }

      if (mood === "no-hands") {
        let blackHoleAction = random(1);
        if (blackHoleAction < 0.33) {
          // Absorb particle
          blackHole.checkAbsorption(boid, j);
        } else if (blackHoleAction < 0.66) {
          // Spin particles
          boid.vel.rotate(random(-PI / 4, PI / 4));
        }
      } else if (mood === "one-hand") {
        if (random(1) < 0.6) {
          blackHole.checkAbsorption(boid, j); // Absorb particle with 60% chance
        } else {
          boid.vel.mult(1.5); // Increase boid speed
        }
      } else if (mood === "two-hands") {
        let distance = dist(
          blackHole.pos.x,
          blackHole.pos.y,
          boid.pos.x,
          boid.pos.y
        );
        if (distance < blackHole.radius / 2) {
          if (random(1) < 0.5) {
            boid.vel.mult(0); // Stop the particle if it touches the black hole
          } else {
            boid.vel.rotate(random(-PI / 4, PI / 4)); // Apply random spin
          }
        }
      }
    }

    // Interact with exploding stars
    for (let k = explodingStars.length - 1; k >= 0; k--) {
      let star = explodingStars[k];
      let distance = dist(
        blackHole.pos.x,
        blackHole.pos.y,
        star.pos.x,
        star.pos.y
      );

      // Increase the chance for black holes to absorb exploding stars
      if (distance < blackHole.radius / 2 && random(1) < 0.7) {
        blackHole.checkAbsorption(star, k);
      }

      // Add effects to the exploding stars
      if (distance < blackHole.radius / 2) {
        if (random(1) < 0.5) {
          star.size = min(star.size * 1.3, 150); // Limit maximum size  and lifespan of exploding stars
          star.lifeSpan = min(star.lifeSpan, 180);
        }
      }
    }

    // If black hole lifespan reaches 0,  regroup the stars and remove black hole
    if (blackHole.lifespan <= 0) {
      blackHole.regenerateParticles();

      // Particles regroup after black hole disappears
      if (random(1) < 0.5) {
        // Group particles shape
        groupParticlesInShape("circle");
      } else {
        // Group particles shape
        groupParticlesInShape("triangle");
      }

      // Explosion effect that covers the whole canvas on blackhole death
      let largeExplodingStar = new ExplodingStar(width / 2, height / 2);
      largeExplodingStar.size = max(width, height) * 1.5;
      largeExplodingStar.lifeSpan = 10;

      explodingStars.push(largeExplodingStar);

      blackHoles.splice(i, 1);
    }
  }

  // Adding new blackhole after a certain amount of time
  if (frameCount % 250 === 0) {
    blackHoles.push(new BlackHole(random(width), random(height)));
  }

  // Switch function for the exploding stars and comet
  switch (mood) {
    case "one-hand":
      for (let star of explodingStars) {
        star.update();
        applyCreativeExplodingStar(star);
        star.show();
      }

      if (frameCount % 60 === 0 && explodingStars.length < 3) {
        explodingStars.push(new ExplodingStar(8, 20));
      }

      let handPos = getHandPosition();
      let force = p5.Vector.sub(handPos, comet.pos);
      force.setMag(0.02); // Attraction force of the comet to the hand position
      comet.applyForce(force);
      comet.update();
      comet.display();
      break;

    case "two-hands":
      if (frameCount % 30 === 0) {
        let numberOfStars = int(random(2, 5)); // Random number of stars to create
        for (let i = 0; i < numberOfStars; i++) {
          explodingStars.push(new ExplodingStar(8, 20));
        }
      }

      for (let i = explodingStars.length - 1; i >= 0; i--) {
        let star = explodingStars[i];
        star.update();
        star.show();

        if (star.toRemove) {
          explodingStars.splice(i, 1);
        }
      }

      // Add comet behavior for two hands
      let hand1Pos = getHandPosition(0);
      let hand2Pos = getHandPosition(1); // Second hand
      let closestHand =
        comet.pos.dist(hand1Pos) < comet.pos.dist(hand2Pos)
          ? hand1Pos
          : hand2Pos;

      let twoHandsForce = p5.Vector.sub(closestHand, comet.pos); // Attraction to the closest hand
      twoHandsForce.setMag(0.05); // Stronger pull
      comet.applyForce(twoHandsForce); // Apply force toward the closest hand

      // Add random movement for chaotic behavior
      let randomForce = p5.Vector.random2D().mult(0.1);
      comet.applyForce(randomForce);
      comet.update();
      comet.display();

      break;

    default: // No hands
      for (let star of explodingStars) {
        star.update();
        star.show();
      }

      if (frameCount % 90 === 0 && explodingStars.length < 3) {
        explodingStars.push(new ExplodingStar(8, 20));
      }

      comet.update();
      comet.display();
      break;
  }

  // Remove exploded stars
  for (let i = explodingStars.length - 1; i >= 0; i--) {
    if (explodingStars[i].toRemove) {
      explodingStars.splice(i, 1);
    }
  }

  // Hand hints drawn on fingers 
  drawHandHints();
}

function getMood() {
  if (hands.length === 0) {
    return "no-hands";
  } else if (hands.length === 1) {
    return "one-hand";
  } else if (hands.length >= 2) {
    return "two-hands";
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
        let maxRepelDistance = 100; // Max distance to apply repulsion to the boids
        if (distance < maxRepelDistance) {
          force.setMag(1); // Strength of repulsion
          boid.applyForce(force);
        }
      } else {
        force.setMag(-1.5); // Attraction strength
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
  let randomForce = p5.Vector.random2D().mult(0.05); // Small random force applied to the boids
  boid.applyForce(randomForce);

  if (hands.length > 0) {
    let hand = hands[0];
    let wrist = hand.keypoints[0];
    if (wrist) {
      let handPos = createVector(width - wrist.x, wrist.y);
      let gravity = p5.Vector.sub(handPos, boid.pos); // Direction of gravity
      gravity.setMag(0.1); // Control the gravity strength
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
      gravity.setMag(0.2); // Control the gravity strength
      explodingStar.pos.add(gravity);
    }
  }
}

//Function created with the assistance of ChatGpt
// Function to group particles into creative shapes at a random location on the canvas
function groupParticlesInShape(shape) {
  let centerX = random(width);
  let centerY = random(height);
  let angleStep = TWO_PI / boids.length; // Step size for angular placement

  if (shape === "circle") {
    for (let i = 0; i < boids.length; i++) {
      let angle = i * angleStep;
      let radius = random(50, 150);
      boids[i].pos.x = centerX + cos(angle) * radius;
      boids[i].pos.y = centerY + sin(angle) * radius;
    }
  } else if (shape === "triangle") {
    for (let i = 0; i < boids.length; i++) {
      let side = i % 3;
      if (side === 0) {
        boids[i].pos.set(centerX - 100, centerY - 100);
      } else if (side === 1) {
        boids[i].pos.set(centerX + 100, centerY - 100);
      } else {
        boids[i].pos.set(centerX, centerY + 100);
      }
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

// Reference to the handPose https://docs.ml5js.org/#/reference/handpose
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

  hands = hands.filter((hand) => {
    let wrist = hand.keypoints[0];
    if (!wrist) return true;
    let wristX = width - wrist.x;
    let wristY = wrist.y;

    return true;
  });
}

function getHandPosition(index = 0) {
  if (hands.length > index) {
    // Get the position of the hand
    let hand = hands[index];
    let wrist = hand.keypoints[0]; // The wrist is usually the first keypoint
    if (wrist) {
      return createVector(width - wrist.x, wrist.y); // Flip x-coordinate to match canvas and return hand position as a vector
    }
  }
  // Return a default position if no hands are detected
  return createVector(width / 2, height / 2);
}
