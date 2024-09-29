class Particle {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = p5.Vector.random2D().mult(random(1, 3));
        this.acc = createVector(0, 0);
        this.lifespan = 150 + random(55);
        this.mass = 1; // Mass property
    }

    applyForce(force) {
        this.acc.add(p5.Vector.div(force, this.mass));
    }

    update() {
        // Noise-based movement
        let noiseScale = 0.01;
        let noiseX = noise(this.pos.x * noiseScale, frameCount * noiseScale);
        let noiseY = noise(this.pos.y * noiseScale, frameCount * noiseScale);
        let angle = map(noiseX, 0, 1, 0, TWO_PI);
        let speed = map(noiseY, 0, 1, 0.5, 2);
        let noiseVel = p5.Vector.fromAngle(angle).mult(speed);
        this.vel.add(noiseVel);

        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.lifespan -= 2;
    }

    show() {
        noStroke();
        fill(255, 255, 255, this.lifespan);
        ellipse(this.pos.x, this.pos.y, 4); // Base circle

        // Add a glowing twinkling effect
        if (random(1) < 0.1) {
            fill(255, 255, 255, this.lifespan / 2);
            ellipse(this.pos.x, this.pos.y, 8);
        }
    }

    isFinished() {
        return this.lifespan <= 0;
    }
}