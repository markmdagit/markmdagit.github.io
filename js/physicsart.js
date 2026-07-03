class PhysicsArt {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width; // 1920
        this.height = this.canvas.height; // 1080

        this.dots = [];
        this.traces = []; // Array of off-screen canvas paths to persist traces

        // Create an offscreen canvas to hold the permanent traces
        this.traceCanvas = document.createElement('canvas');
        this.traceCanvas.width = this.width;
        this.traceCanvas.height = this.height;
        this.traceCtx = this.traceCanvas.getContext('2d');

        this.animationId = null;
        this.lastTime = 0;

        // Bind methods
        this.animate = this.animate.bind(this);

        // Start loop
        requestAnimationFrame(this.animate);
    }

    spawnInstance() {
        const radius = 15;
        const speed = 400; // pixels per second

        // Randomly pick a y-coordinate for the collision line, keeping it somewhat central
        const collisionY = this.height / 2 + (Math.random() - 0.5) * (this.height / 2);

        // We will spawn two dots horizontally opposite to each other
        const dot1 = {
            id: Date.now(),
            x: 100,
            y: collisionY,
            vx: speed,
            vy: (Math.random() - 0.5) * speed * 0.2, // slight vertical variation
            radius: radius,
            mass: 1,
            color: this.getRandomColor(),
            hasCollided: false,
            path: []
        };

        const dot2 = {
            id: Date.now() + 1,
            x: this.width - 100,
            y: collisionY,
            vx: -speed,
            vy: (Math.random() - 0.5) * speed * 0.2,
            radius: radius,
            mass: 1,
            color: this.getRandomColor(),
            hasCollided: false,
            path: []
        };

        this.dots.push(dot1, dot2);
    }

    clearCanvas() {
        this.dots = [];
        this.traceCtx.clearRect(0, 0, this.width, this.height);
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    getRandomColor() {
        const colors = [
            '#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231',
            '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe',
            '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000',
            '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update(dt) {
        // Move dots
        for (let dot of this.dots) {
            dot.x += dot.vx * dt;
            dot.y += dot.vy * dt;

            // Wall collisions
            if (dot.x - dot.radius < 0) {
                dot.x = dot.radius;
                dot.vx *= -1;
            } else if (dot.x + dot.radius > this.width) {
                dot.x = this.width - dot.radius;
                dot.vx *= -1;
            }

            if (dot.y - dot.radius < 0) {
                dot.y = dot.radius;
                dot.vy *= -1;
            } else if (dot.y + dot.radius > this.height) {
                dot.y = this.height - dot.radius;
                dot.vy *= -1;
            }

            // Record path if collided
            if (dot.hasCollided) {
                dot.path.push({x: dot.x, y: dot.y});

                // Draw to permanent trace canvas
                if (dot.path.length > 1) {
                    const p1 = dot.path[dot.path.length - 2];
                    const p2 = dot.path[dot.path.length - 1];

                    this.traceCtx.beginPath();
                    this.traceCtx.moveTo(p1.x, p1.y);
                    this.traceCtx.lineTo(p2.x, p2.y);
                    this.traceCtx.strokeStyle = dot.color;
                    this.traceCtx.lineWidth = 3;
                    this.traceCtx.lineCap = 'round';
                    this.traceCtx.stroke();
                }
            }
        }

        // Dot collisions
        for (let i = 0; i < this.dots.length; i++) {
            for (let j = i + 1; j < this.dots.length; j++) {
                const d1 = this.dots[i];
                const d2 = this.dots[j];

                const dx = d2.x - d1.x;
                const dy = d2.y - d1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < d1.radius + d2.radius) {
                    // Collision occurred!
                    d1.hasCollided = true;
                    d2.hasCollided = true;

                    // Simple elastic collision
                    // 1. Find collision normal
                    const nx = dx / distance;
                    const ny = dy / distance;

                    // 2. Relative velocity
                    const dvx = d2.vx - d1.vx;
                    const dvy = d2.vy - d1.vy;

                    // 3. Velocity along normal
                    const velAlongNormal = dvx * nx + dvy * ny;

                    // Do not resolve if velocities are separating
                    if (velAlongNormal > 0) continue;

                    // Restitution (elasticity)
                    const e = 1.0;

                    // Impulse scalar
                    let j_impulse = -(1 + e) * velAlongNormal;
                    j_impulse /= (1/d1.mass + 1/d2.mass);

                    // Apply impulse
                    const impulseX = j_impulse * nx;
                    const impulseY = j_impulse * ny;

                    d1.vx -= 1/d1.mass * impulseX;
                    d1.vy -= 1/d1.mass * impulseY;
                    d2.vx += 1/d2.mass * impulseX;
                    d2.vy += 1/d2.mass * impulseY;

                    // Positional correction to prevent sinking
                    const percent = 0.8;
                    const slop = 0.01;
                    const penetration = d1.radius + d2.radius - distance;
                    const correction = Math.max(penetration - slop, 0) / (1/d1.mass + 1/d2.mass) * percent;
                    const cx = correction * nx;
                    const cy = correction * ny;

                    d1.x -= 1/d1.mass * cx;
                    d1.y -= 1/d1.mass * cy;
                    d2.x += 1/d2.mass * cx;
                    d2.y += 1/d2.mass * cy;
                }
            }
        }

        // Remove dots that have been traced for a long time to save performance
        // Actually, we'll keep them bouncing to continue tracing.
        // But to prevent infinite arrays, we cap path length. We are drawing to traceCtx so we don't need the path history anyway!
        for(let dot of this.dots) {
            if(dot.path.length > 2) {
                // Keep only the last point to draw from
                dot.path = [dot.path[dot.path.length - 1]];
            }
        }
    }

    draw() {
        // Clear main canvas
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw permanent traces first
        this.ctx.drawImage(this.traceCanvas, 0, 0);

        // Draw active dots
        for (let dot of this.dots) {
            this.ctx.beginPath();
            this.ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = dot.color;
            this.ctx.fill();
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // Draw a halo if it has collided
            if (dot.hasCollided) {
                this.ctx.beginPath();
                this.ctx.arc(dot.x, dot.y, dot.radius + 5, 0, Math.PI * 2);
                this.ctx.strokeStyle = dot.color;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        }
    }

    animate(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const dt = (timestamp - this.lastTime) / 1000; // delta time in seconds
        this.lastTime = timestamp;

        // Cap dt to prevent huge jumps if tab was inactive
        if (dt < 0.1) {
            this.update(dt);
            this.draw();
        }

        this.animationId = requestAnimationFrame(this.animate);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('artCanvas')) {
        const artApp = new PhysicsArt('artCanvas');

        document.getElementById('spawn-btn').addEventListener('click', () => {
            artApp.spawnInstance();
        });

        document.getElementById('clear-btn').addEventListener('click', () => {
            artApp.clearCanvas();
        });
    }
});