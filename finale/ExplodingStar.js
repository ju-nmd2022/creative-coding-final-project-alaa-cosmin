class ExplodingStar {
  constructor(minSize = 5, maxSize = 15) {
    this.pos = createVector(random(width), random(height)); // Random initial position
    this.vel = createVector(random(-0.5, 0.5), random(-0.5, 0.5)); // Slow random velocity
    this.size = random(minSize, maxSize); // Custom size range for each star
    this.lifeSpan = random(120, 240); // Time before explosion (2-4 seconds)
    this.exploded = false;
    this.toRemove = false; // Flag to remove after explosion
  }

  // Update the star's position and behavior
  update() {
    this.lifeSpan--;

    // Move the star before it explodes
    this.pos.add(this.vel);

    // Explode when the life span reaches zero
    if (this.lifeSpan <= 0 && !this.exploded) {
      this.explode();
    }
  }

  // Render the star (before explosion) or the explosion flames
  show() {
    if (!this.exploded) {
      // Draw a star on fire (before explosion)
      this.drawStarOnFire();
    } else {
      // Draw the explosion flames (after explosion)
      this.drawExplosionFlames();
    }
  }

  // Draw the star on fire with animated flickering flames
  drawStarOnFire() {
    let flameSize = random(this.size, this.size + 10); // Flickering flame size
    fill(255, random(100, 150), 0, 200); // Fiery orange color
    noStroke();
    ellipse(this.pos.x, this.pos.y, flameSize); // Draw flickering flame
  }

  // Draw the explosion flames
  drawExplosionFlames() {
    let explosionSize = this.size * random(2, 3); // Slightly random explosion size
    fill(255, random(50, 100), 0, 150); // Explosion flame color
    noStroke();
    ellipse(this.pos.x, this.pos.y, explosionSize); // Draw explosion flames
  }

  // Trigger the explosion
  explode() {
    this.exploded = true;
    setTimeout(() => {
      this.disappear(); // Remove the star after explosion
    }, 300); // Short explosion duration (300 milliseconds)
  }

  // Mark the star for removal after explosion
  disappear() {
    this.toRemove = true;
  }
}