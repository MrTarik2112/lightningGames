// Doodle Jump Style Game v2.0 - Premium Edition
class DoodleJumpGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;

        this.player = { x: 0, y: 0, vx: 0, vy: 0, size: 20, color: '#00ff88' };
        this.platforms = [];
        this.particles = [];

        this.gravity = 800;
        this.jumpForce = -600;
        this.cameraY = 0;

        this._keyHandler = null;
        this._keyUpHandler = null;
        this.keys = { left: false, right: false };
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.cameraY = 0;

        this.player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: 0, vy: 0, size: 20, color: '#00ff88'
        };

        this.platforms = [];
        this.particles = [];

        // Initial platforms
        this.platforms.push({ x: canvas.width / 2 - 40, y: canvas.height - 100, w: 80, h: 10, type: 'normal' });

        for (let i = 1; i < 20; i++) {
            this._spawnPlatform(canvas.height - 100 - (i * 120));
        }

        this._bindKeys();
    }

    _spawnPlatform(yStart) {
        let isMoving = Math.random() < 0.2;
        let isBreakable = Math.random() < 0.1;
        let type = 'normal';
        let w = 80;

        if (isBreakable) { type = 'break'; w = 60; }
        else if (isMoving) { type = 'moving'; w = 70; }

        this.platforms.push({
            x: Math.random() * (this.canvas.width - w),
            y: yStart,
            w: w, h: 10,
            type: type,
            vx: isMoving ? (Math.random() > 0.5 ? 100 : -100) : 0,
            broken: false
        });
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

    _spawnParticles(x, y, color, count, upward = false) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 150,
                vy: upward ? -Math.random() * 200 : (Math.random() - 0.5) * 150,
                life: 1, decay: 1.5 + Math.random(),
                size: Math.random() * 4 + 2, color
            });
        }
    }

    update(dt) {
        if (this.gameOver) return;

        // Player physics
        if (this.keys.left) this.player.vx = -400;
        else if (this.keys.right) this.player.vx = 400;
        else this.player.vx = 0;

        this.player.vy += this.gravity * dt;
        this.player.x += this.player.vx * dt;
        this.player.y += this.player.vy * dt;

        // Wrap around
        if (this.player.x < -this.player.size) this.player.x = this.canvas.width;
        if (this.player.x > this.canvas.width) this.player.x = -this.player.size;

        // Platform collisions (falling only)
        if (this.player.vy > 0) {
            for (let p of this.platforms) {
                if (!p.broken &&
                    this.player.y + this.player.size / 2 >= p.y &&
                    this.player.y + this.player.size / 2 <= p.y + p.h + this.player.vy * dt &&
                    this.player.x + this.player.size / 2 > p.x &&
                    this.player.x - this.player.size / 2 < p.x + p.w) {

                    if (p.type === 'break') {
                        p.broken = true;
                        this._spawnParticles(p.x + p.w / 2, p.y, '#555', 20);
                        if (window.gameManager) window.gameManager.shakeScreen(0.1);
                        if (window.soundManager) window.soundManager.playHit();
                    } else {
                        this.player.vy = this.jumpForce;
                        this.player.y = p.y - this.player.size / 2;
                        this._spawnParticles(this.player.x, p.y, '#00ff88', 10, true);
                        if (window.gameManager) window.gameManager.shakeScreen(0.05);
                        if (window.soundManager) window.soundManager.playBounce();
                    }
                }
            }
        }

        // Move camera (scroll up)
        if (this.player.y < this.cameraY + this.canvas.height / 2) {
            let diff = (this.cameraY + this.canvas.height / 2) - this.player.y;
            this.cameraY -= diff;
            // More intuitive score: height reached
            let currentScore = Math.floor(-this.cameraY / 10);
            if (currentScore > this.score) {
                this.score = currentScore;
                if (this.score >= 10000) {
                    window.gameManager.unlockAchievement('high_jumper', 'Yüksek Atlamacı', 'Neon Jump\'ta 10000 yüksekliğe ulaştın.', '🚀', true);
                }
            }
        }

        // Update platforms (moving ones and recycling)
        for (let i = this.platforms.length - 1; i >= 0; i--) {
            let p = this.platforms[i];

            if (p.type === 'moving' && !p.broken) {
                p.x += p.vx * dt;
                if (p.x < 0 || p.x + p.w > this.canvas.width) p.vx *= -1;
            }

            // Remove off-screen (below camera)
            if (p.y > this.cameraY + this.canvas.height + 100) {
                this.platforms.splice(i, 1);
                // Spawn new one at the top
                const topY = Math.min(...this.platforms.map(plat => plat.y));
                this._spawnPlatform(topY - 120 - Math.random() * 40);
            }
        }

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += this.gravity * 0.5 * dt;
            p.life -= p.decay * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Death
        if (this.player.y > this.cameraY + this.canvas.height) {
            this._spawnParticles(this.player.x, this.player.y, '#ff4466', 30);
            this._triggerGameOver();
        }
    }

    _triggerGameOver() {
        this.gameOver = true;
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            document.removeEventListener('keyup', this._keyUpHandler);
        }
        if (window.gameManager) {
            window.gameManager.shakeScreen(1.0);
            window.gameManager.checkAndUpdateHighScore('doodlejump', this.score);
        }
        if (window.soundManager) window.soundManager.playDeath();
        setTimeout(() => this._showGameOverOverlay(), 500);
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        let hs = 0; if (window.gameManager) hs = window.gameManager.getHighScore('doodlejump');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Düştün! 🎈</div>
            <div class="game-over-score">Skor: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 YENİ REKOR!</div>' : `<div class="game-over-highscore">🏆 Rekor: ${hs}</div>`}
            <button class="game-over-btn" id="jmp-restart">↻ Tekrar Oyna</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#jmp-restart').addEventListener('click', () => {
            if (window.gameManager) window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#111122';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid pattern
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 40) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
        for (let y = (this.cameraY % 40); y < canvas.height; y += 40) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
        ctx.stroke();

        ctx.save();
        ctx.translate(0, -this.cameraY); // Apply camera scroll

        // Platforms
        this.platforms.forEach(p => {
            if (p.broken) return;

            ctx.shadowBlur = 10;
            if (p.type === 'normal') { ctx.fillStyle = '#00ddff'; ctx.shadowColor = '#00ddff'; }
            else if (p.type === 'moving') { ctx.fillStyle = '#bd00ff'; ctx.shadowColor = '#bd00ff'; }
            else if (p.type === 'break') { ctx.fillStyle = '#ff9900'; ctx.shadowColor = 'transparent'; }

            ctx.beginPath();
            ctx.roundRect(p.x, p.y, p.w, p.h, 5);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Detail
            ctx.fillStyle = 'rgba(255,255,255,0.2)';
            ctx.fillRect(p.x, p.y, p.w, 3);
        });

        // Player
        if (!this.gameOver) {
            ctx.fillStyle = this.player.color;
            ctx.shadowColor = this.player.color;
            ctx.shadowBlur = 20;

            // Squish logic somewhat
            let scaleX = 1, scaleY = 1;
            if (this.player.vy < -200) { scaleX = 0.8; scaleY = 1.2; }
            else if (this.player.vy > 200) { scaleX = 1.1; scaleY = 0.9; }

            ctx.save();
            ctx.translate(this.player.x, this.player.y);
            ctx.scale(scaleX, scaleY);
            ctx.beginPath();
            ctx.arc(0, 0, this.player.size / 2, 0, Math.PI * 2);
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

        ctx.restore(); // Remove camera transform
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { if (this._keyHandler) { document.removeEventListener('keydown', this._keyHandler); document.removeEventListener('keyup', this._keyUpHandler); } }
    resume() { this._bindKeys(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('doodlejump', DoodleJumpGame, {
        name: 'Neon Jump', // Renamed for styling
        canvasWidth: 600, // Thinner canvas looks better
        canvasHeight: 640
    });
}
