const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let width, height;
let particles = [];
const celebrateBtn = document.getElementById('celebrateBtn');

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resize);
resize();

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        // Random velocity
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.gravity = 0.05;
        this.friction = 0.98;
        this.life = 1.0;
        this.decay = Math.random() * 0.01 + 0.005;
        this.size = Math.random() * 3 + 1;
    }

    update() {
        this.vx *= this.friction;
        this.vy *= this.friction;
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.size *= 0.96;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Firework {
    constructor() {
        this.x = Math.random() * width;
        this.y = height;
        this.targetY = Math.random() * (height * 0.5);
        this.speed = Math.random() * 3 + 8;
        this.angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.hue = Math.random() * 360;
        this.exploded = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15; // Gravity

        if (this.vy >= 0 || this.y <= this.targetY) {
            this.explode();
            return false;
        }
        return true;
    }

    draw() {
        ctx.fillStyle = `hsl(${this.hue}, 100%, 50%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    explode() {
        this.exploded = true;
        for (let i = 0; i < 100; i++) {
            particles.push(new Particle(this.x, this.y, `hsl(${this.hue}, 100%, 50%)`));
        }
    }
}

let fireworks = [];
let isCelebrating = false;

function animate() {
    ctx.fillStyle = 'rgba(5, 5, 16, 0.2)'; // Trail effect
    ctx.fillRect(0, 0, width, height);

    // Random fireworks - Intense mode if celebrating
    let chance = isCelebrating ? 0.2 : 0.05;
    if (Math.random() < chance) {
        fireworks.push(new Firework());
    }

    fireworks = fireworks.filter(firework => {
        if (!firework.exploded) {
            firework.draw();
            return firework.update();
        }
        return false;
    });

    particles = particles.filter(p => {
        p.update();
        p.draw();
        return p.life > 0;
    });

    requestAnimationFrame(animate);
}

// Button interaction
celebrateBtn.addEventListener('click', (e) => {
    isCelebrating = true;
    document.body.classList.add('celebrate-mode');

    // Blast fireworks from center
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const f = new Firework();
            f.x = width / 2;
            f.y = height;
            f.targetY = height * 0.2 + Math.random() * 300;
            f.hue = Math.random() * 360;
            fireworks.push(f);
        }, i * 50);
    }

    // Confetti burst from button
    const rectal = celebrateBtn.getBoundingClientRect();
    const bx = rectal.left + rectal.width / 2;
    const by = rectal.top + rectal.height / 2;

    for (let i = 0; i < 100; i++) {
        particles.push(new Particle(bx, by, `hsl(${Math.random() * 360}, 100%, 60%)`));
    }
});

animate();
