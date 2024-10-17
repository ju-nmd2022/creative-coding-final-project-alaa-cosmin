class Comet {
  constructor() {
    this.pos = createVector(random(width), random(height)); // Random starting position
    this.vel = createVector(random(-2, 2), random(-2, 2));
    this.acc = createVector(0, 0);
    this.history = []; // Store previous positions for the tail
  }

  applyForce(force) {
    this.acc.add(force);
  }

  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.acc.mult(0);

    // Add the current position to the history array
    this.history.push(createVector(this.pos.x, this.pos.y));

    // Limit the length of the tail
    if (this.history.length > 50) {
      this.history.splice(0, 1);
    }

    // Reset position when the comet moves off the screen
    if (
      this.pos.x > width ||
      this.pos.x < 0 ||
      this.pos.y > height ||
      this.pos.y < 0
    ) {
      this.resetComet(); // Call resetComet method to reposition it randomly offscreen
    }
  }

  resetComet() {
    // Decide from which side the comet should enter (randomly pick one of 4 sides)
    let side = floor(random(4));

    if (side === 0) {
      // Comet comes from the left
      this.pos = createVector(0, random(height));
      this.vel = createVector(random(1, 3), random(-1, 1)); // Move right
    } else if (side === 1) {
      // Comet comes from the right
      this.pos = createVector(width, random(height));
      this.vel = createVector(random(-1, -3), random(-1, 1)); // Move left
    } else if (side === 2) {
      // Comet comes from the top
      this.pos = createVector(random(width), 0);
      this.vel = createVector(random(-1, 1), random(1, 3)); // Move down
    } else {
      // Comet comes from the bottom
      this.pos = createVector(random(width), height);
      this.vel = createVector(random(-1, 1), random(-1, -3)); // Move up
    }

    this.history = []; // Clear the tail history to start fresh
  }

  display() {
    noStroke();
    fill(103, 235, 211);
    ellipse(this.pos.x, this.pos.y, 25, 25); // Comet head

    // Draw the tail using the history array
    for (let i = 0; i < this.history.length; i++) {
      let pos = this.history[i];
      fill(
        random(103, 255),
        random(200, 235),
        random(190, 211),
        map(i, 0, this.history.length, 0, 150)
      );
      ellipse(pos.x, pos.y, map(i, 0, this.history.length, 5, 20)); // Tail gets thinner
    }
  }
}
