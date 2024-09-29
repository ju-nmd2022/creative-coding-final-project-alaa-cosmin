class BlackHole {
    constructor(x, y) {
      this.pos = createVector(x, y);
      this.radius = random(175, 225); // Random size for variation
      this.mass = this.radius * 2; // Mass affects gravitational pull
      this.absorbedParticles = []; // Store absorbed particles for possible ejection
      this.vel = p5.Vector.random2D().mult(random(0.2, 0.5));
      this.lifespan = random(300, 600); // Lifespan in frames (approx. 5-10 seconds at 60fps)
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
      let minDistance = 5;
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
        particles.splice(index, 1);
      }
    }
  
    possiblyEjectParticles() {
      if (random(1) < 0.001 && this.absorbedParticles.length > 0) {
        for (let i = 0; i < this.absorbedParticles.length; i++) {
          let p = this.absorbedParticles[i];
          p.pos = createVector(width - this.pos.x, this.pos.y);
          p.vel = p5.Vector.random2D().mult(random(2, 5));
          particles.push(p);
        }
        this.absorbedParticles = [];
      }
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