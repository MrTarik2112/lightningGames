// Runner Game v2.0 - Premium Edition
class RunnerGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;

        this.player = { x: 100, y: 0, vx: 0, vy: 0, r: 15, onGround: true };
        this.obstacles = [];
        this.particles = [];
        this.groundY = 400;
        this.speed = 400; // world scroll speed

        this.gravity = 1500;
        this.jumpForce = -600;

        this._keyHandler = null;
        this.gameTime = 0;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.speed = 500;

        this.groundY = canvas.height - 80;
        this.player.y = this.groundY - this.player.r;
        this.player.vy = 0;
        this.player.onGround = true;

        this.obstacles = [];
        this.particles = [];
        this.gameTime = 0;

        this._bindKeys();
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);

        this._keyHandler = (e) => {
            if (this.gameOver) return;
            if ((e.key === 'ArrowUp' || e.key === ' ' || e.key === 'w' || e.key === 'W') && this.player.onGround) {
                this.player.vy = this.jumpForce;
                this.player.onGround = false;
                this._spawnParticles(this.player.x, this.groundY, '#ffffff', 10);
                if (window.gameManager) window.gameManager.shakeScreen(0.05);
                if (window.soundManager) window.soundManager.playJump();
            }
        };

        document.addEventListener('keydown', this._keyHandler);
    }

    _spawnObstacle() {
        // Vary width and height
        let w = 20 + Math.random() * 30;
        let h = 40 + Math.random() * 50;
        this.obstacles.push({
            x: this.canvas.width + w,
            y: this.groundY - h,
            w: w, h: h,
            passed: false
        });
    }

    _spawnParticles(x, y, color, count) {
        const maxParticles = 120;
        if (this.particles.length > maxParticles) return;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: -this.speed * 0.5 + (Math.random() - 0.5) * 100, // trail behind
                vy: (Math.random() - 0.5) * 200,
                life: 1, decay: 2 + Math.random(),
                size: Math.random() * 4 + 2, color
            });
        }
    }

    update(dt) {
        if (this.gameOver) return;

        // Speed increase over time
        this.speed += 10 * dt;
        this.gameTime += dt;

        if (this.score >= 500 && this.gameTime <= 60) {
            window.gameManager.unlockAchievement('speedrunner', 'Speedrunner', 'Scored 500 in Neon Runner within 1 minute.', '🏎️', true);
        }

        // Player physics
        this.player.vy += this.gravity * dt;
        this.player.y += this.player.vy * dt;

        if (this.player.y >= this.groundY - this.player.r) {
            this.player.y = this.groundY - this.player.r;
            this.player.vy = 0;
            if (!this.player.onGround) {
                this.player.onGround = true;
                this._spawnParticles(this.player.x, this.groundY, '#555', 5);
                if (window.gameManager) window.gameManager.shakeScreen(0.1);
                if (window.soundManager) window.soundManager.playLand();
            }
        }

        // Spawn obstacles
        if (this.obstacles.length === 0 || this.canvas.width - this.obstacles[this.obstacles.length - 1].x > (400 + Math.random() * 300)) {
            if (Math.random() < 0.05 + dt) {
                this._spawnObstacle();
            }
        }

        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            let ob = this.obstacles[i];
            ob.x -= this.speed * dt;

            if (!ob.passed && ob.x + ob.w < this.player.x - this.player.r) {
                ob.passed = true;
                this.score += 10;
                if (this.score >= 500) {
                    window.gameManager.unlockAchievement('runner_high', 'Fast Runner', 'Scored 500 in Neon Runner.', '🦖', false);
                }
                this._spawnParticles(ob.x + ob.w / 2, ob.y, '#00ff88', 5);
                if (window.soundManager) window.soundManager.playScore();
            }

            // AABB Collision approx
            let px = this.player.x; let py = this.player.y; let r = this.player.r;
            // Get closest point on rect to circle center
            let testX = px; let testY = py;
            if (px < ob.x) testX = ob.x; else if (px > ob.x + ob.w) testX = ob.x + ob.w;
            if (py < ob.y) testY = ob.y; else if (py > ob.y + ob.h) testY = ob.y + ob.h;

            let dist = Math.sqrt(Math.pow(px - testX, 2) + Math.pow(py - testY, 2));
            if (dist <= r) {
                this._triggerGameOver();
            }

            if (ob.x + ob.w < 0) this.obstacles.splice(i, 1);
        }

        // Run trail particles
        if (this.player.onGround && Math.random() < 0.2) {
            this._spawnParticles(this.player.x, this.groundY, '#00ddff', 1);
        }

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
        this._spawnParticles(this.player.x, this.player.y, '#ff4466', 40);
        if (this._keyHandler) { document.removeEventListener('keydown', this._keyHandler); this._keyHandler = null; }
        if (window.gameManager) {
            window.gameManager.shakeScreen(1.5);
            window.gameManager.checkAndUpdateHighScore('runner', this.score);
        }
        if (window.soundManager) window.soundManager.playDeath();
        setTimeout(() => this._showGameOverOverlay(), 500);
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        let hs = 0; if (window.gameManager) hs = window.gameManager.getHighScore('runner');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Crashed! 💥</div>
            <div class="game-over-score">Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="run-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#run-restart').addEventListener('click', () => {
            if (window.gameManager) window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#11101a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Ground line glowing
        ctx.strokeStyle = '#00ddff';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#00ddff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(0, this.groundY);
        ctx.lineTo(canvas.width, this.groundY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Ground fill
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, this.groundY, canvas.width, canvas.height - this.groundY);

        // Obstacles
        ctx.fillStyle = '#ff4466';
        ctx.shadowColor = '#ff4466';
        ctx.shadowBlur = 10;
        this.obstacles.forEach(ob => {
            ctx.beginPath();
            ctx.roundRect(ob.x, ob.y, ob.w, ob.h, 5);
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Player
        if (!this.gameOver) {
            ctx.fillStyle = '#00ff88';
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 15;

            // Squash stretch
            ctx.save();
            ctx.translate(this.player.x, this.player.y);
            let sX = 1, sY = 1;
            if (!this.player.onGround) {
                if (this.player.vy < 0) { sX = 0.8; sY = 1.2; }
                else { sX = 1.1; sY = 0.9; }
            }
            ctx.scale(sX, sY);

            ctx.beginPath();
            ctx.arc(0, 0, this.player.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.shadowBlur = 0;
        }

        // Particles
        this.particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler); }
    resume() { this._bindKeys(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('runner', RunnerGame, {
        name: 'Neon Runner',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
