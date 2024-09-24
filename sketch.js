let video;
let poseNet;
let handpose;
let poses = [];
let hands = [];
let synth;
let modelsLoaded = 0;

// Setup function runs once at the start
function setup() {
  createCanvas(windowWidth, windowHeight);
  // Create a video capture
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide(); // Hide the HTML video element

  // Initialize Tone.js synth
  synth = new Tone.Synth().toDestination();

  // Load the PoseNet model
  let poseNetOptions = {
    detectionType: 'single'
  };
  ml5.poseNet(video, poseNetOptions).then(function(poseNetModel) {
    poseNet = poseNetModel;
    poseNet.on('pose', function(results) {
      poses = results;
    });
    console.log('PoseNet model loaded');
    modelsLoaded++;
  });

  // Load the Handpose model
  ml5.handpose(video).then(function(handposeModel) {
    handpose = handposeModel;
    handpose.on('predict', function(results) {
      hands = results;
    });
    console.log('Handpose model loaded');
    modelsLoaded++;
  });
}

// Draw function runs in a loop
function draw() {
  // Wait until both models are loaded
  if (modelsLoaded < 2) {
    background(0);
    fill(255);
    textSize(32);
    textAlign(CENTER, CENTER);
    text('Loading models...', width / 2, height / 2);
    return;
  }

  // Display the video feed (mirror image)
  push();
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0, width, height);
  pop();

  // Semi-transparent overlay for trail effect
  fill(0, 25);
  rect(0, 0, width, height);

  // Draw visuals based on poses
  drawPoses();

  // Draw visuals based on hands
  drawHands();
}

// Function to draw visuals based on body poses
function drawPoses() {
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i].pose;

    // Randomly generate colors based on nose position
    if (pose.keypoints) {
      let nose = pose.keypoints.find(k => k.part === 'nose');
      if (nose && nose.score > 0.5) {
        let x = nose.position.x;
        let y = nose.position.y;
        let col = color(random(255), random(255), random(255));
        fill(col);
        noStroke();
        ellipse(x, y, 50, 50);

        // Play sound when nose moves significantly
        if (frameCount % 60 === 0) {
          let freq = map(x, 0, width, 100, 1000);
          synth.triggerAttackRelease(freq, '8n');
        }
      }
    }
  }
}

// Function to draw visuals based on hand positions
function drawHands() {
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];

    // Draw circles on landmarks
    for (let j = 0; j < hand.landmarks.length; j++) {
      let [x, y, z] = hand.landmarks[j];
      let size = map(z, -50, 50, 10, 30);
      let col = color(random(255), random(255), random(255));
      fill(col);
      noStroke();
      ellipse(width - x, y, size, size);
    }

    // Create random lines between fingers
    let fingers = Object.keys(hand.annotations);
    for (let f = 0; f < fingers.length; f++) {
      let finger = hand.annotations[fingers[f]];
      for (let k = 0; k < finger.length - 1; k++) {
        let [x1, y1] = finger[k];
        let [x2, y2] = finger[k + 1];
        stroke(random(255), random(255), random(255));
        strokeWeight(2);
        line(width - x1, y1, width - x2, y2);
      }
    }
  }
}