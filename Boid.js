class Boid {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D().mult(0.5);
    this.acc = createVector(0, 0);
    this.maxSpeed = 0.5;
  }

  // Apply a force to the Boid
  applyForce(force) {
    this.acc.add(force);
  }


  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);
    this.pos.add(this.vel);
    this.acc.mult(0); // Reset acceleration after each frame
  }

  edges() {
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  show() {
    noStroke();
    fill(255, 255, 255, 200);
    ellipse(this.pos.x, this.pos.y, 4);
  }
}