// Color Rush - run to the correct color, don't tap the wrong color
class ColorRushGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.lanes = [];
        this.playerLane = 1;
        this.playerY = 0;
        this.speed = 240;
        this.score = 0;
        this.gameOver = false;
        this.tiles = [];
        this.particles = [];
        this._keyHandler = null;
        this.currentTarget = null;
        this.timer = 0;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        const laneWidth = canvas.width / 3;
        this.lanes = [laneWidth * 0.5, laneWidth * 1.5, laneWidth * 2.5];
        this.playerLane = 1;
        this.playerY = canvas.height - 70;
        this.speed = 260;
        this.score = 0;
        this.gameOver = false;
        this.tiles = [];
        this.particles = [];
        this.currentTarget = this._randomLane();
        this.timer = 0;
        this._bindKeys();
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        this._keyHandler = (e) => {
            if (this.gameOver) return;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                this.playerLane = Math.max(0, this.playerLane - 1);
            }
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                this.playerLane = Math.min(2, this.playerLane + 1);
            }
        };
        document.addEventListener('keydown', this._keyHandler);
    }

    _randomLane() {
        return Math.floor(Math.random() * 3);
    }

    _spawnRow() {
        const targetLane = this.currentTarget;
        for (let i = 0; i < 3; i++) {
            this.tiles.push({
                lane: i,
                y: -40,
                good: i === targetLane
            });
        }
        this.currentTarget = this._randomLane();
    }

    _spawnParticles(x, y, color, count = 10) {
        const maxParticles = 100;
        if (this.particles.length > maxParticles) return;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 220,
                vy: (Math.random() - 0.5) * 220,
                life: 1,
                decay: 1.6 + Math.random(),
                size: Math.random() * 3 + 2,
                color
            });
        }
    }

    update(dt) {
        if (this.gameOver) return;

        this.timer += dt;
        if (this.timer > 0.8) {
            this.timer = 0;
            this._spawnRow();
        }

        for (let i = this.tiles.length - 1; i >= 0; i--) {
            const t = this.tiles[i];
            t.y += this.speed * dt;
            if (t.y > this.canvas.height + 40) {
                this.tiles.splice(i, 1);
                continue;
            }

            // Collision when tile crosses player row
            const tileCenterY = t.y + 20;
            if (tileCenterY > this.playerY - 10 && tileCenterY < this.playerY + 10 && t.lane === this.playerLane) {
                if (t.good) {
                    this.score += 15;
                if (window.soundManager) window.soundManager.playEat();
                    this._spawnParticles(this.lanes[t.lane], this.playerY, '#55ffcc', 14);
                    if (window.gameManager) window.gameManager.shakeScreen(0.15);
                } else {
                    this._triggerGameOver();
                }
                this.tiles.splice(i, 1);
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
        this._spawnParticles(this.lanes[this.playerLane], this.playerY, '#ff4466', 24);
        if (window.gameManager) {
            window.gameManager.shakeScreen(1);
            window.gameManager.checkAndUpdateHighScore('colorrush', this.score);
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

        let hs = 0; if (window.gameManager) hs = window.gameManager.getHighScore('colorrush');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Wrong Color!</div>
            <div class="game-over-score">Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="colorrush-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#colorrush-restart').addEventListener('click', () => {
            if (window.gameManager) window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#060616';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const laneWidth = canvas.width / 3;
        const colors = ['#ff4466', '#55ffcc', '#ffdd55'];

        // Lanes bg
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = 'rgba(255,255,255,0.02)';
            ctx.fillRect(i * laneWidth, 0, laneWidth, canvas.height);
        }

        // Current target indicator at top
        if (this.currentTarget != null) {
            ctx.fillStyle = colors[this.currentTarget];
            ctx.fillRect(this.currentTarget * laneWidth + 10, 10, laneWidth - 20, 8);
        }

        // Tiles
        this.tiles.forEach(t => {
            const x = t.lane * laneWidth + 12;
            const y = t.y;
            const w = laneWidth - 24;
            const h = 28;
            ctx.fillStyle = t.good ? '#55ffcc' : '#ff4466';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.roundRect(x, y, w, h, 6);
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Player
        const px = this.lanes[this.playerLane];
        const py = this.playerY;
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
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
    pause() { /* no-op */ }
    resume() { /* no-op */ }
}

if (window.gameManager) {
    window.gameManager.registerGame('colorrush', ColorRushGame, {
        name: 'Color Rush',
        canvasWidth: 880,
        canvasHeight: 540
    });
}

