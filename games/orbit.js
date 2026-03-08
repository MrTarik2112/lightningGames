// Orbit - Guide the ship orbiting the center, avoid incoming shards
class OrbitGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.center = { x: 0, y: 0 };
        this.radius = 120;
        this.angle = 0;
        this.angularVel = 0;
        this.score = 0;
        this.gameOver = false;
        this.shards = [];
        this.particles = [];
        this._keyHandler = null;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.center.x = canvas.width / 2;
        this.center.y = canvas.height / 2;
        this.radius = Math.min(canvas.width, canvas.height) * 0.28;
        this.angle = -Math.PI / 2;
        this.angularVel = 0;
        this.score = 0;
        this.gameOver = false;
        this.shards = [];
        this.particles = [];
        this._bindKeys();
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        this._keyHandler = (e) => {
            if (this.gameOver) return;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.angularVel = -2.8;
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.angularVel = 2.8;
            }
        };
        document.addEventListener('keydown', this._keyHandler);
        // friction applied continuously; key just "kickers"
    }

    _spawnShard() {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.max(this.canvas.width, this.canvas.height) * 0.6;
        const speed = 140 + Math.random() * 160;
        const tx = this.center.x + Math.cos(angle) * this.radius;
        const ty = this.center.y + Math.sin(angle) * this.radius;
        const dirX = tx - (this.center.x + Math.cos(angle) * dist);
        const dirY = ty - (this.center.y + Math.sin(angle) * dist);
        const len = Math.hypot(dirX, dirY) || 1;
        const vx = (dirX / len) * speed;
        const vy = (dirY / len) * speed;

        this.shards.push({
            x: this.center.x + Math.cos(angle) * dist,
            y: this.center.y + Math.sin(angle) * dist,
            vx, vy,
            r: 10 + Math.random() * 6
        });
    }

    _spawnParticles(x, y, color, count = 14) {
        const maxParticles = 120;
        if (this.particles.length > maxParticles) return;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 260,
                vy: (Math.random() - 0.5) * 260,
                life: 1,
                decay: 1.7 + Math.random(),
                size: Math.random() * 3 + 2,
                color
            });
        }
    }

    update(dt) {
        if (this.gameOver) return;

        // friction on angular velocity
        this.angularVel *= 0.9;
        this.angle += this.angularVel * dt;

        // Spawn incoming shards
        if (Math.random() < 0.04 + dt * 2) {
            this._spawnShard();
        }

        for (let i = this.shards.length - 1; i >= 0; i--) {
            const s = this.shards[i];
            s.x += s.vx * dt;
            s.y += s.vy * dt;
            // remove far ones
            if (Math.hypot(s.x - this.center.x, s.y - this.center.y) > Math.max(this.canvas.width, this.canvas.height)) {
                this.shards.splice(i, 1);
                this.score += 2;
                continue;
            }
        }

        const shipX = this.center.x + Math.cos(this.angle) * this.radius;
        const shipY = this.center.y + Math.sin(this.angle) * this.radius;

        // Collision
        for (let s of this.shards) {
            const dist = Math.hypot(shipX - s.x, shipY - s.y);
            if (dist < s.r + 10) {
                this._triggerGameOver(shipX, shipY);
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

    _triggerGameOver(x, y) {
        if (this.gameOver) return;
        this.gameOver = true;
        if (window.soundManager) window.soundManager.playDeath();
        this._spawnParticles(x, y, '#ff4466', 30);
        if (window.gameManager) {
            window.gameManager.shakeScreen(1.2);
            window.gameManager.checkAndUpdateHighScore('orbit', this.score);
        }
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
        this._showGameOverOverlay();
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        const existing = container.querySelector('.game-over-overlay');
        if (existing) existing.remove();

        let hs = 0; if (window.gameManager) hs = window.gameManager.getHighScore('orbit');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">De-orbited!</div>
            <div class="game-over-score">Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="orbit-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#orbit-restart').addEventListener('click', () => {
            if (window.gameManager) window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const g = ctx.createRadialGradient(this.center.x, this.center.y, 10, this.center.x, this.center.y, this.radius * 2.2);
        g.addColorStop(0, '#050510');
        g.addColorStop(1, '#010107');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Orbit circle
        ctx.strokeStyle = 'rgba(0,220,255,0.35)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Shards
        this.shards.forEach(s => {
            ctx.fillStyle = '#ffdd88';
            ctx.shadowColor = '#ffdd88';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(s.x + s.r, s.y);
            ctx.lineTo(s.x - s.r, s.y - s.r / 2);
            ctx.lineTo(s.x - s.r / 2, s.y + s.r);
            ctx.closePath();
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Ship
        const shipX = this.center.x + Math.cos(this.angle) * this.radius;
        const shipY = this.center.y + Math.sin(this.angle) * this.radius;
        ctx.strokeStyle = '#00e0ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00e0ff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(shipX, shipY);
        ctx.lineTo(
            shipX - 10 * Math.cos(this.angle - 0.4),
            shipY - 10 * Math.sin(this.angle - 0.4)
        );
        ctx.lineTo(
            shipX - 10 * Math.cos(this.angle + 0.4),
            shipY - 10 * Math.sin(this.angle + 0.4)
        );
        ctx.closePath();
        ctx.stroke();
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
    pause() { /* no-op */ }
    resume() { /* no-op */ }
}

if (window.gameManager) {
    window.gameManager.registerGame('orbit', OrbitGame, {
        name: 'Orbit',
        canvasWidth: 880,
        canvasHeight: 540
    });
}

