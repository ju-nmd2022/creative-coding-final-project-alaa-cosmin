class BlackHole {
    constructor(x, y) {
      this.pos = createVector(x, y);
      this.radius = random(175, 225);
      this.mass = this.radius * 2;
      this.absorbedParticles = [];
      this.vel = p5.Vector.random2D().mult(random(0.2, 0.5));
      this.lifespan = 180;
    }
  
    update() {
      this.pos.add(this.vel);
      if (this.pos.x < 0 || this.pos.x > width) this.vel.x *= -1;
      if (this.pos.y < 0 || this.pos.y > height) this.vel.y *= -1;
      this.lifespan--;
    }
  
    attract(particle) {
      let blackHoleX = width - this.pos.x;
      let force = createVector(blackHoleX - particle.pos.x, this.pos.y - particle.pos.y);
      let distance = force.mag();
      let minDistance = 2;
      distance = constrain(distance, minDistance, this.radius);
      force.normalize();
  
      let strength = (this.mass * particle.mass) / (distance * distance);
      force.mult(strength);
      particle.applyForce(force);
    }
  
    checkAbsorption(particle, index) {
      let blackHoleX = width - this.pos.x;
      let distance = dist(blackHoleX, this.pos.y, particle.pos.x, particle.pos.y);
      if (distance < this.radius / 2) {
        this.absorbedParticles.push(particle);
        boids.splice(index, 1); // Remove the particle from boids
      }
    }
  
    regenerateParticles() {
      for (let i = 0; i < this.absorbedParticles.length; i++) {
        let p = this.absorbedParticles[i];
        p.pos = createVector(width - this.pos.x, this.pos.y);
        p.vel = p5.Vector.random2D().mult(random(2, 5)); // Random velocity
        boids.push(p); // Return the particle back to boids
      }
      this.absorbedParticles = []; // Clear the absorbed particles
    }
  
    show() {
      let displayX = width - this.pos.x;
      push();
      translate(displayX, this.pos.y);
      noStroke();
      fill(0);
      ellipse(0, 0, this.radius);
      noFill();
      stroke(200, 100);
      strokeWeight(2);
      ellipse(0, 0, this.radius * 1);
      pop();
    }
  }