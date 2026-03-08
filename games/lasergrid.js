// Laser Grid - Move the square with arrow keys, avoid scanning lasers
class LaserGridGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.player = { x: 0, y: 0, r: 12 };
        this.score = 0;
        this.gameOver = false;
        this.lasers = [];
        this.particles = [];
        this.keys = { up: false, down: false, left: false, right: false };
        this._keyDown = null;
        this._keyUp = null;
        this.speed = 260;
        this.spawnTimer = 0;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.player.x = canvas.width / 2;
        this.player.y = canvas.height / 2;
        this.lasers = [];
        this.particles = [];
        this.spawnTimer = 0;
        this._bindKeys();
    }

    _bindKeys() {
        if (this._keyDown) {
            document.removeEventListener('keydown', this._keyDown);
            document.removeEventListener('keyup', this._keyUp);
        }
        this._keyDown = (e) => {
            if (this.gameOver) return;
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.keys.up = true;
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = true;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
        };
        this._keyUp = (e) => {
            if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') this.keys.up = false;
            if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') this.keys.down = false;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
        };
        document.addEventListener('keydown', this._keyDown);
        document.addEventListener('keyup', this._keyUp);
    }

    _spawnLaser() {
        const horizontal = Math.random() < 0.5;
        if (horizontal) {
            const fromTop = Math.random() < 0.5;
            this.lasers.push({
                horizontal: true,
                y: fromTop ? -10 : this.canvas.height + 10,
                x1: 0,
                x2: this.canvas.width,
                v: (fromTop ? 1 : -1) * (180 + Math.random() * 200),
                width: 10
            });
        } else {
            const fromLeft = Math.random() < 0.5;
            this.lasers.push({
                horizontal: false,
                x: fromLeft ? -10 : this.canvas.width + 10,
                y1: 0,
                y2: this.canvas.height,
                v: (fromLeft ? 1 : -1) * (180 + Math.random() * 200),
                width: 10
            });
        }
    }

    _spawnParticles(x, y, color, count = 12) {
        const maxParticles = 120;
        if (this.particles.length > maxParticles) return;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 220,
                vy: (Math.random() - 0.5) * 220,
                life: 1,
                decay: 1.5 + Math.random(),
                size: Math.random() * 3 + 2,
                color
            });
        }
    }

    update(dt) {
        if (this.gameOver) return;

        const p = this.player;
        if (this.keys.up) p.y -= this.speed * dt;
        if (this.keys.down) p.y += this.speed * dt;
        if (this.keys.left) p.x -= this.speed * dt;
        if (this.keys.right) p.x += this.speed * dt;

        const margin = p.r + 4;
        p.x = Math.max(margin, Math.min(this.canvas.width - margin, p.x));
        p.y = Math.max(margin, Math.min(this.canvas.height - margin, p.y));

        this.spawnTimer += dt;
        if (this.spawnTimer > 0.5) {
            this.spawnTimer = 0;
            if (this.lasers.length < 6) this._spawnLaser();
            this.score += 1;
        }

        // Move lasers
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            const l = this.lasers[i];
            if (l.horizontal) {
                l.y += l.v * dt;
                if (l.y < -40 || l.y > this.canvas.height + 40) {
                    this.lasers.splice(i, 1);
                    continue;
                }
                // collision
                if (Math.abs(p.y - l.y) < p.r + l.width / 2) {
                    this._triggerGameOver();
                    break;
                }
            } else {
                l.x += l.v * dt;
                if (l.x < -40 || l.x > this.canvas.width + 40) {
                    this.lasers.splice(i, 1);
                    continue;
                }
                if (Math.abs(p.x - l.x) < p.r + l.width / 2) {
                    this._triggerGameOver();
                    break;
                }
            }
        }

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const pa = this.particles[i];
            pa.x += pa.vx * dt;
            pa.y += pa.vy * dt;
            pa.life -= pa.decay * dt;
            if (pa.life <= 0) this.particles.splice(i, 1);
        }
    }

    _triggerGameOver() {
        if (this.gameOver) return;
        this.gameOver = true;
        if (window.soundManager) window.soundManager.playDeath();
        this._spawnParticles(this.player.x, this.player.y, '#ff4466', 26);
        if (window.gameManager) {
            window.gameManager.shakeScreen(1.1);
            window.gameManager.checkAndUpdateHighScore('lasergrid', this.score);
        }
        if (this._keyDown) {
            document.removeEventListener('keydown', this._keyDown);
            document.removeEventListener('keyup', this._keyUp);
            this._keyDown = null;
            this._keyUp = null;
        }
        this._showGameOverOverlay();
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        const existing = container.querySelector('.game-over-overlay');
        if (existing) existing.remove();

        let hs = 0; if (window.gameManager) hs = window.gameManager.getHighScore('lasergrid');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Scanned!</div>
            <div class="game-over-score">Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="lasergrid-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#lasergrid-restart').addEventListener('click', () => {
            if (window.gameManager) window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#050511';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid
        ctx.strokeStyle = 'rgba(0,220,255,0.08)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Lasers
        this.lasers.forEach(l => {
            ctx.shadowColor = '#ff0044';
            ctx.shadowBlur = 14;
            ctx.strokeStyle = '#ff0044';
            ctx.lineWidth = l.width;
            ctx.beginPath();
            if (l.horizontal) {
                ctx.moveTo(0, l.y);
                ctx.lineTo(canvas.width, l.y);
            } else {
                ctx.moveTo(l.x, 0);
                ctx.lineTo(l.x, canvas.height);
            }
            ctx.stroke();
        });
        ctx.shadowBlur = 0;

        // Player
        ctx.fillStyle = '#00ff99';
        ctx.shadowColor = '#00ff99';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, this.player.r, 0, Math.PI * 2);
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
    pause() { /* nothing special */ }
    resume() { /* input is stateless */ }
}

if (window.gameManager) {
    window.gameManager.registerGame('lasergrid', LaserGridGame, {
        name: 'Laser Grid',
        canvasWidth: 880,
        canvasHeight: 540
    });
}

