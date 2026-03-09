// SkyFall - catch falling stars from above, avoid gaps
class SkyFallGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.bar = { x: 0, y: 0, w: 120, h: 14 };
        this.score = 0;
        this.gameOver = false;
        this.stars = [];
        this.hazards = [];
        this.particles = [];
        this.speed = 260;
        this._keyHandler = null;
        this.dir = 0;
        this.spawnTimer = 0;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.bar.x = canvas.width / 2 - this.bar.w / 2;
        this.bar.y = canvas.height - 40;
        this.stars = [];
        this.hazards = [];
        this.particles = [];
        this.spawnTimer = 0;
        this.dir = 0;
        this._bindKeys();
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        document.removeEventListener('keyup', this._keyUpHandler);
        this._keyHandler = (e) => {
            if (this.gameOver) return;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.dir = -1;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.dir = 1;
        };
        this._keyUpHandler = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                if (this.dir < 0) this.dir = 0;
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                if (this.dir > 0) this.dir = 0;
            }
        };
        document.addEventListener('keydown', this._keyHandler);
        document.addEventListener('keyup', this._keyUpHandler);
    }

    _spawnStar() {
        this.stars.push({
            x: Math.random() * this.canvas.width,
            y: -20,
            r: 8,
            v: 130 + Math.random() * 140
        });
    }

    _spawnHazard() {
        this.hazards.push({
            x: Math.random() * this.canvas.width,
            y: -20,
            r: 12,
            v: 170 + Math.random() * 160
        });
    }

    _spawnParticles(x, y, color, count = 10) {
        const maxParticles = 120;
        if (this.particles.length > maxParticles) return;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 180,
                vy: (Math.random() - 0.5) * 180,
                life: 1,
                decay: 1.6 + Math.random(),
                size: Math.random() * 3 + 1.5,
                color
            });
        }
    }

    update(dt) {
        if (this.gameOver) return;

        this.bar.x += this.dir * this.speed * dt;
        this.bar.x = Math.max(10, Math.min(this.canvas.width - this.bar.w - 10, this.bar.x));

        this.spawnTimer += dt;
        if (this.spawnTimer > 0.35) {
            this.spawnTimer = 0;
            if (Math.random() < 0.7) this._spawnStar();
            if (Math.random() < 0.4) this._spawnHazard();
        }

        // Update stars
        for (let i = this.stars.length - 1; i >= 0; i--) {
            const s = this.stars[i];
            s.y += s.v * dt;
            if (s.y - s.r > this.canvas.height) {
                this.stars.splice(i, 1);
                continue;
            }
            const cx = this.bar.x + this.bar.w / 2;
            const closestX = Math.max(this.bar.x, Math.min(s.x, this.bar.x + this.bar.w));
            const closestY = this.bar.y;
            const dist = Math.hypot(s.x - closestX, s.y - closestY);
            if (dist < s.r + this.bar.h / 2) {
                this.stars.splice(i, 1);
                this.score += 10;
                if (window.soundManager) window.soundManager.playEat();
                this._spawnParticles(s.x, s.y, '#ffee55', 14);
                if (window.gameManager) window.gameManager.shakeScreen(0.15);
            }
        }

        // Update hazards
        for (let i = this.hazards.length - 1; i >= 0; i--) {
            const h = this.hazards[i];
            h.y += h.v * dt;
            if (h.y - h.r > this.canvas.height) {
                this.hazards.splice(i, 1);
                continue;
            }
            const closestX = Math.max(this.bar.x, Math.min(h.x, this.bar.x + this.bar.w));
            const closestY = this.bar.y;
            const dist = Math.hypot(h.x - closestX, h.y - closestY);
            if (dist < h.r + this.bar.h / 2) {
                this._triggerGameOver();
                break;
            }
        }

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= p.decay * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    _triggerGameOver() {
        if (this.gameOver) return;
        this.gameOver = true;
        if (window.soundManager) window.soundManager.playDeath();
        this._spawnParticles(this.bar.x + this.bar.w / 2, this.bar.y, '#ff4466', 30);
        if (window.gameManager) {
            window.gameManager.shakeScreen(1.2);
            window.gameManager.checkAndUpdateHighScore('skyfall', this.score);
        }
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            document.removeEventListener('keyup', this._keyUpHandler);
            this._keyHandler = null;
        }
        this._showGameOverOverlay();
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        const existing = container.querySelector('.game-over-overlay');
        if (existing) existing.remove();

        let hs = 0; if (window.gameManager) hs = window.gameManager.getHighScore('skyfall');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">You Fell!</div>
            <div class="game-over-score">Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="skyfall-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#skyfall-restart').addEventListener('click', () => {
            if (window.gameManager) window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
        g.addColorStop(0, '#050518');
        g.addColorStop(1, '#02020a');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stars
        this.stars.forEach(s => {
            ctx.shadowColor = '#ffee55';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#ffee88';
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Hazards (mor meteor)
        this.hazards.forEach(h => {
            ctx.shadowColor = '#ff4466';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#ff4466';
            ctx.beginPath();
            ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Bar
        ctx.fillStyle = '#00e0ff';
        ctx.shadowColor = '#00e0ff';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.roundRect(this.bar.x, this.bar.y, this.bar.w, this.bar.h, 6);
        ctx.fill();
        ctx.shadowBlur = 0;

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
    pause() { /* input already lightweight */ }
    resume() { /* nothing */ }
}

if (window.gameManager) {
    window.gameManager.registerGame('skyfall', SkyFallGame, {
        name: 'SkyFall',
        canvasWidth: 880,
        canvasHeight: 540
    });
}

