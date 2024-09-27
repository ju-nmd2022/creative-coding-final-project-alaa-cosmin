let handPose;
let video;
let predictions = [];

function setup() {
  createCanvas(640, 480);
  
  // Initialize video capture
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  
  // Initialize handpose model
  handPose = ml5.handpose(video, modelReady);
  
  // Listen for predictions from the handpose model
  handPose.on('predict', (results) => {
    predictions = results; // Store the results in predictions array
  });
}

function modelReady() {
  console.log("Model ready!");
}

function draw() {
  image(video, 0, 0, width, height);
  
  // Draw detected hands
  drawHands(predictions);
}

function drawHands(hands) {
  // Check if there are any hands detected
  for (let i = 0; i < hands.length && i < 2; i++) { // Ensure a maximum of two hands are processed
    let hand = hands[i];
    
    // Draw key points for the hand
    for (let j = 0; j < hand.landmarks.length; j++) {
      let [x, y, z] = hand.landmarks[j];
      fill(0, 255, 0);
      noStroke();
      ellipse(x, y, 10, 10); // Draw each point on the hand
    }

    // Draw connection between thumb tip and index finger tip
    let thumbTip = hand.annotations.thumb[3]; // Thumb tip landmark
    let indexTip = hand.annotations.indexFinger[3]; // Index finger tip landmark

    // Calculate center between thumb tip and index finger tip
    let centerX = (thumbTip[0] + indexTip[0]) / 2;
    let centerY = (thumbTip[1] + indexTip[1]) / 2;

    // Draw ellipse based on the distance between the tips
    let distance = dist(thumbTip[0], thumbTip[1], indexTip[0], indexTip[1]);
    fill(255, 0, 0);
    ellipse(centerX, centerY, distance);
  }
}
