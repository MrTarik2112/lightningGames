// Orb Collector - move with ok tuşları, sarı küreleri topla, kırmızı mayınlardan kaç
class OrbCollectorGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.player = { x: 0, y: 0, r: 14, vx: 0, vy: 0 };
        this.speed = 260;
        this.friction = 0.86;
        this.keys = { up: false, down: false, left: false, right: false };
        this.orbs = [];
        this.mines = [];
        this.particles = [];
        this.score = 0;
        this.gameOver = false;
        this._keyDown = null;
        this._keyUp = null;
        this.spawnTimer = 0;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.player.x = canvas.width / 2;
        this.player.y = canvas.height / 2;
        this.player.vx = 0;
        this.player.vy = 0;
        this.orbs = [];
        this.mines = [];
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

    _spawnOrb() {
        const margin = 24;
        this.orbs.push({
            x: margin + Math.random() * (this.canvas.width - margin * 2),
            y: margin + Math.random() * (this.canvas.height - margin * 2),
            r: 9
        });
    }

    _spawnMine() {
        const margin = 24;
        this.mines.push({
            x: margin + Math.random() * (this.canvas.width - margin * 2),
            y: margin + Math.random() * (this.canvas.height - margin * 2),
            r: 13,
            phase: Math.random() * Math.PI * 2
        });
    }

    _spawnParticles(x, y, color, count = 10) {
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
        if (this.keys.up) p.vy -= this.speed * dt;
        if (this.keys.down) p.vy += this.speed * dt;
        if (this.keys.left) p.vx -= this.speed * dt;
        if (this.keys.right) p.vx += this.speed * dt;

        p.vx *= this.friction;
        p.vy *= this.friction;
        p.x += p.vx * dt * 60 / 16;
        p.y += p.vy * dt * 60 / 16;

        const margin = p.r + 4;
        if (p.x < margin) p.x = margin;
        if (p.x > this.canvas.width - margin) p.x = this.canvas.width - margin;
        if (p.y < margin) p.y = margin;
        if (p.y > this.canvas.height - margin) p.y = this.canvas.height - margin;

        this.spawnTimer += dt;
        if (this.spawnTimer > 0.8) {
            this.spawnTimer = 0;
            if (this.orbs.length < 4) this._spawnOrb();
            if (this.mines.length < 5 && Math.random() < 0.5) this._spawnMine();
        }

        // Mines pulsate
        this.mines.forEach(m => m.phase += dt * 3);

        // Collect orbs
        for (let i = this.orbs.length - 1; i >= 0; i--) {
            const o = this.orbs[i];
            const dx = o.x - p.x;
            const dy = o.y - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < p.r + o.r) {
                this.orbs.splice(i, 1);
                this.score += 15;
                if (window.soundManager) window.soundManager.playEat();
                this._spawnParticles(o.x, o.y, '#ffdd55', 16);
                if (window.gameManager) window.gameManager.shakeScreen(0.2);
            }
        }

        // Hit mines
        for (let m of this.mines) {
            const dx = m.x - p.x;
            const dy = m.y - p.y;
            const dist = Math.hypot(dx, dy);
            if (dist < p.r + m.r * 0.8) {
                this._triggerGameOver();
                break;
            }
        }

        // Update particles
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
        this._spawnParticles(this.player.x, this.player.y, '#ff4466', 28);
        if (window.gameManager) {
            window.gameManager.shakeScreen(1);
            window.gameManager.checkAndUpdateHighScore('orbcollector', this.score);
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

        let hs = 0;
        if (window.gameManager) hs = window.gameManager.getHighScore('orbcollector');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Toplama Bitti</div>
            <div class="game-over-score">Skor: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 YENİ REKOR!</div>' : `<div class="game-over-highscore">🏆 Rekor: ${hs}</div>`}
            <button class="game-over-btn" id="orbcollector-restart">↻ Tekrar Oyna</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#orbcollector-restart').addEventListener('click', () => {
            if (window.gameManager) window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#060616';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Mild grid
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
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

        // Orbs
        this.orbs.forEach(o => {
            ctx.shadowColor = '#ffdd55';
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#ffdd55';
            ctx.beginPath();
            ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Mines
        this.mines.forEach(m => {
            const pulse = 0.6 + Math.sin(m.phase) * 0.2;
            ctx.fillStyle = '#ff3355';
            ctx.shadowColor = '#ff3355';
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.r * pulse, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Player
        ctx.fillStyle = '#00e0ff';
        ctx.shadowColor = '#00e0ff';
        ctx.shadowBlur = 18;
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
    pause() { /* hareket yokken de sorun yok */ }
    resume() { /* nothing */ }
}

if (window.gameManager) {
    window.gameManager.registerGame('orbcollector', OrbCollectorGame, {
        name: 'Orb Collector',
        canvasWidth: 880,
        canvasHeight: 540
    });
}

