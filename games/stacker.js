// Stacker - stack blocks on top of each other, narrows as you miss
class StackerGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.stack = [];
        this.active = null;
        this.dir = 1;
        this.speed = 180;
        this.level = 0;
        this.score = 0;
        this.gameOver = false;
        this._keyHandler = null;
        this.particles = [];
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.stack = [];
        this.particles = [];
        this.gameOver = false;
        this.level = 0;
        this.score = 0;

        const baseWidth = Math.min(220, canvas.width * 0.7);
        const h = 18;
        const y = canvas.height - h - 20;
        this.stack.push({ x: (canvas.width - baseWidth) / 2, y, w: baseWidth, h });
        this._spawnBlock();
        this._bindKeys();
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        this._keyHandler = (e) => {
            if (this.gameOver) return;
            if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowUp') {
                this._drop();
                e.preventDefault();
            }
        };
        document.addEventListener('keydown', this._keyHandler);
    }

    _spawnBlock() {
        const last = this.stack[this.stack.length - 1];
        const w = last.w;
        const h = last.h;
        const y = last.y - h - 4;
        this.active = {
            x: 0,
            y,
            w,
            h
        };
        this.dir = this.level % 2 === 0 ? 1 : -1;
        if (this.dir > 0) {
            this.active.x = -w;
        } else {
            this.active.x = this.canvas.width;
        }
        this.level++;
        this.speed += 8;
    }

    _spawnParticles(x, y, color, count = 12) {
        const maxParticles = 100;
        if (this.particles.length > maxParticles) return;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 1,
                decay: 1.5 + Math.random(),
                size: Math.random() * 3 + 2,
                color
            });
        }
    }

    _drop() {
        if (!this.active) return;
        const last = this.stack[this.stack.length - 1];
        const left = Math.max(this.active.x, last.x);
        const right = Math.min(this.active.x + this.active.w, last.x + last.w);
        const overlap = right - left;

        if (overlap <= 4) {
            this._triggerGameOver();
            return;
        }

        this.stack.push({
            x: left,
            y: this.active.y,
            w: overlap,
            h: this.active.h
        });
        this.score += Math.floor(overlap / 5);
        this._spawnParticles(left + overlap / 2, this.active.y, '#00ffcc', 16);
        if (window.gameManager) window.gameManager.shakeScreen(0.2);
        this.active = null;
        this._spawnBlock();
    }

    update(dt) {
        if (this.gameOver) return;
        if (this.active) {
            this.active.x += this.dir * this.speed * dt;
            if (this.active.x <= -this.active.w) {
                this.dir = 1;
                this.active.x = -this.active.w;
            }
            if (this.active.x >= this.canvas.width) {
                this.dir = -1;
                this.active.x = this.canvas.width;
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
        if (this.active) {
            this._spawnParticles(this.active.x + this.active.w / 2, this.active.y, '#ff4466', 24);
        }
        if (window.gameManager) {
            window.gameManager.shakeScreen(1);
            window.gameManager.checkAndUpdateHighScore('stacker', this.score);
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

        let hs = 0; if (window.gameManager) hs = window.gameManager.getHighScore('stacker');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Tower Collapsed!</div>
            <div class="game-over-score">Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="stacker-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#stacker-restart').addEventListener('click', () => {
            if (window.gameManager) window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#050516';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Base line
        ctx.strokeStyle = '#222244';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(40, canvas.height - 20);
        ctx.lineTo(canvas.width - 40, canvas.height - 20);
        ctx.stroke();

        // Stack
        this.stack.forEach((b, i) => {
            const t = i / Math.max(1, this.stack.length - 1);
            const color = `rgba(${40 + t * 140}, ${180 - t * 80}, 255, 1)`;
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.roundRect(b.x, b.y, b.w, b.h, 4);
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Active block
        if (this.active) {
            ctx.fillStyle = '#00ffcc';
            ctx.shadowColor = '#00ffcc';
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.roundRect(this.active.x, this.active.y, this.active.w, this.active.h, 4);
            ctx.fill();
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
    pause() { /* no-op */ }
    resume() { /* no-op */ }
}

if (window.gameManager) {
    window.gameManager.registerGame('stacker', StackerGame, {
        name: 'Stacker',
        canvasWidth: 880,
        canvasHeight: 540
    });
}

