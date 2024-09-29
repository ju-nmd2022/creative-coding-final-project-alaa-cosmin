class Firework {
    constructor(x, y) {
        this.pos = createVector(x, y);
        this.particles = [];
        this.lifespan = 50;

        for (let i = 0; i < 50; i++) {
            let angle = random(TWO_PI);
            let speed = random(2, 5);
            let vel = p5.Vector.fromAngle(angle).mult(speed);
            this.particles.push({
                pos: this.pos.copy(),
                vel: vel,
                lifespan: 255
        });
    }
    }

    update() {
        for (let p of this.particles) {
            p.vel.mult(0.98);
            p.pos.add(p.vel);
            p.lifespan -= 4;
        }
        this.lifespan -= 2;
    }

    show() {
        noStroke();
        for (let p of this.particles) {
            fill(255, random(100, 255), 0, p.lifespan);
            ellipse(p.pos.x, p.pos.y, 4);
        }
    }

    isFinished() {
        return this.lifespan <= 0;
    }
}