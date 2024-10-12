class ExplodingStar {
  constructor(minSize = 5, maxSize = 15) {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(random(-0.5, 0.5), random(-0.5, 0.5));
    this.size = random(minSize, maxSize);
    this.lifeSpan = random(120, 240);
    this.exploded = false;
    this.toRemove = false;
  }

  update() {
    this.lifeSpan--;

    // Move the star before it explodes
    this.pos.add(this.vel);

    // Explode when the life span reaches zero
    if (this.lifeSpan <= 0 && !this.exploded) {
      this.explode();
    }
  }

  show() {
    if (!this.exploded) {
      this.drawStarOnFire();
    } else {
      // Draw the explosion flames
      this.drawExplosionFlames();
    }
  }

  drawStarOnFire() {
    let flameSize = random(this.size, this.size + 10);
    fill(255, random(100, 150), 0, 200);
    noStroke();
    ellipse(this.pos.x, this.pos.y, flameSize);
  }

  drawExplosionFlames() {
    let explosionSize = this.size * random(2, 3);
    fill(255, random(50, 100), 0, 150);
    noStroke();
    ellipse(this.pos.x, this.pos.y, explosionSize);
  }

  // Trigger the explosion
  explode() {
    this.exploded = true;
    setTimeout(() => {
      this.disappear();
    }, 300);
  }

  disappear() {
    this.toRemove = true;
  }
}