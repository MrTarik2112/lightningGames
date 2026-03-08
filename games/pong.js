class PongGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;

        this.paddle = { x: 0, y: 0, width: 100, height: 15, vx: 0, speed: 600 };
        this.ball = { x: 0, y: 0, vx: 300, vy: -300, radius: 8 };

        this._keyHandler = null;
        this._keyUpHandler = null;
        this.keys = { left: false, right: false };
        this.particles = [];
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;

        this.paddle.x = canvas.width / 2 - this.paddle.width / 2;
        this.paddle.y = canvas.height - 40;

        this.ball.x = canvas.width / 2;
        this.ball.y = canvas.height / 2;

        // Random initial direction
        this.ball.vx = (Math.random() > 0.5 ? 1 : -1) * (200 + Math.random() * 100);
        this.ball.vy = -300;

        this.keys = { left: false, right: false };
        this.particles = [];
        this._bindKeys();
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        if (this._keyUpHandler) document.removeEventListener('keyup', this._keyUpHandler);

        this._keyHandler = (e) => {
            if (this.gameOver) return;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
        };
        this._keyUpHandler = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
        };

        document.addEventListener('keydown', this._keyHandler);
        document.addEventListener('keyup', this._keyUpHandler);
    }

    _unbindKeys() {
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            document.removeEventListener('keyup', this._keyUpHandler);
            this._keyHandler = null;
            this._keyUpHandler = null;
        }
    }

    _spawnParticles(x, y, color, count = 10, speed = 200) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * speed,
                vy: (Math.random() - 0.5) * speed,
                life: 1,
                decay: 1.5 + Math.random(),
                size: Math.random() * 4 + 2,
                color
            });
        }
    }

    update(dt) {
        if (this.gameOver) return;

        // Move paddle
        if (this.keys.left) this.paddle.x -= this.paddle.speed * dt;
        if (this.keys.right) this.paddle.x += this.paddle.speed * dt;

        // Constrain paddle
        if (this.paddle.x < 0) this.paddle.x = 0;
        if (this.paddle.x + this.paddle.width > this.canvas.width) {
            this.paddle.x = this.canvas.width - this.paddle.width;
        }

        // Move ball
        this.ball.x += this.ball.vx * dt;
        this.ball.y += this.ball.vy * dt;

        // Wall collisions
        if (this.ball.x - this.ball.radius < 0) {
            this.ball.x = this.ball.radius;
            this.ball.vx *= -1;
            this._spawnParticles(this.ball.x, this.ball.y, '#00ddff', 5);
            if (window.soundManager) window.soundManager.playBounce();
        } else if (this.ball.x + this.ball.radius > this.canvas.width) {
            this.ball.x = this.canvas.width - this.ball.radius;
            this.ball.vx *= -1;
            this._spawnParticles(this.ball.x, this.ball.y, '#00ddff', 5);
            if (window.soundManager) window.soundManager.playBounce();
        }

        if (this.ball.y - this.ball.radius < 0) {
            this.ball.y = this.ball.radius;
            this.ball.vy *= -1;
            this._spawnParticles(this.ball.x, this.ball.y, '#00ddff', 5);
            if (window.soundManager) window.soundManager.playBounce();
        }

        // Paddle collision
        if (this.ball.vy > 0 &&
            this.ball.y + this.ball.radius > this.paddle.y &&
            this.ball.y - this.ball.radius < this.paddle.y + this.paddle.height &&
            this.ball.x > this.paddle.x &&
            this.ball.x < this.paddle.x + this.paddle.width) {

            // Hit!
            this.ball.vy *= -1.05; // Increase vertical speed slightly

            // Allow english (spin) depending on where it hit on the paddle
            let hitFactor = (this.ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
            this.ball.vx = hitFactor * 400 + (Math.random() * 50 - 25);

            this.score += 10;
            this._spawnParticles(this.ball.x, this.ball.y, '#00ff88', 15);
            if (window.gameManager) window.gameManager.shakeScreen(0.3);
            if (window.soundManager) { window.soundManager.playBounce(); window.soundManager.playScore(); }

            // Cap speed
            if (this.ball.vy < -800) this.ball.vy = -800;
        }

        // Bottom bounds (Game Over)
        if (this.ball.y - this.ball.radius > this.canvas.height) {
            this._spawnParticles(this.ball.x, this.canvas.height, '#ff4466', 30);
            this._triggerGameOver();
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= p.decay * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    _triggerGameOver() {
        this.gameOver = true;
        this._unbindKeys();
        if (window.soundManager) window.soundManager.playDeath();
        if (window.gameManager) {
            window.gameManager.shakeScreen(1.0);
            window.gameManager.onGameOver(this.score);
        }
    }



    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bg.addColorStop(0, '#060610');
        bg.addColorStop(1, '#0a0a1a');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw paddle
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.roundRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height, 5);
        ctx.fill();

        // Draw ball
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw particles
        this.particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindKeys(); }
    resume() { this._bindKeys(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('pong', PongGame, {
        name: 'Pong',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
