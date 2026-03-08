// Blaster - Alien Invasion Defense Game
class BlasterGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        this._keyHandler = null;
        this._keyUpHandler = null;

        this.player = { x: 0, y: 0, width: 30, height: 30, speed: 300 };
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.stars = [];
        this.enemySpawnRate = 1.2;
        this.spawnTimer = 0;
        this.difficultyTimer = 0;
        this.keys = {};
        this.frameCount = 0;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.player.x = canvas.width / 2 - this.player.width / 2;
        this.player.y = canvas.height - 80;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.stars = [];
        this.enemySpawnRate = 1.2;
        this.spawnTimer = 0;
        this.difficultyTimer = 0;
        this.keys = {};
        this.frameCount = 0;

        // Init stars
        for (let i = 0; i < 80; i++) {
            this.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 2 + 0.5,
                speed: Math.random() * 30 + 10
            });
        }

        this._bindKeys();
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        if (this._keyUpHandler) document.removeEventListener('keyup', this._keyUpHandler);

        this._keyHandler = (e) => {
            if (this.gameOver) return;
            this.keys[e.key] = true;
        };

        this._keyUpHandler = (e) => {
            this.keys[e.key] = false;
        };

        document.addEventListener('keydown', this._keyHandler);
        document.addEventListener('keyup', this._keyUpHandler);
    }

    _spawnParticles(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 300,
                vy: (Math.random() - 0.5) * 300,
                life: 1,
                decay: 1.5 + Math.random(),
                size: Math.random() * 4 + 2,
                color
            });
        }
    }

    _triggerGameOver() {
        this.gameOver = true;
        window.gameManager.shakeScreen(1);
        if (window.soundManager) window.soundManager.playDeath();
        window.gameManager.checkAndUpdateHighScore('blaster', this.score);
        this._removeListeners();
        this._showGameOverOverlay();
    }

    _removeListeners() {
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
        if (this._keyUpHandler) {
            document.removeEventListener('keyup', this._keyUpHandler);
            this._keyUpHandler = null;
        }
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        const existing = container.querySelector('.game-over-overlay');
        if (existing) existing.remove();

        const hs = window.gameManager.getHighScore('blaster');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Game Over!</div>
            <div class="game-over-score">Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="blaster-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#blaster-restart').addEventListener('click', () => {
            window.gameManager.resetCurrentGame();
        });
    }

    update(dt) {
        if (this.gameOver) return;
        this.frameCount++;

        // Update stars
        this.stars.forEach(s => {
            s.y += s.speed * dt;
            if (s.y > this.canvas.height) {
                s.y = 0;
                s.x = Math.random() * this.canvas.width;
            }
        });

        // Player movement
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) {
            this.player.x -= this.player.speed * dt;
        }
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) {
            this.player.x += this.player.speed * dt;
        }
        this.player.x = Math.max(0, Math.min(this.canvas.width - this.player.width, this.player.x));

        // Shoot
        if ((this.keys[' '] || this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) && this.frameCount % 8 === 0) {
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - 3,
                y: this.player.y,
                width: 6,
                height: 15,
                speed: 600
            });
        }

        // Update bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.y -= b.speed * dt;
            if (b.y + b.height < 0) this.bullets.splice(i, 1);
        }

        // Spawn enemies
        this.spawnTimer += dt;
        this.difficultyTimer += dt;
        if (this.spawnTimer >= this.enemySpawnRate) {
            this.spawnTimer = 0;
            const size = 25 + Math.random() * 15;
            this.enemies.push({
                x: Math.random() * (this.canvas.width - size),
                y: -size,
                width: size,
                height: size,
                speed: 80 + Math.random() * 80 + this.difficultyTimer * 5,
                hp: Math.floor(size / 15),
                maxHp: Math.floor(size / 15)
            });
        }

        // Increase difficulty
        if (this.difficultyTimer > 10) {
            this.difficultyTimer = 0;
            this.enemySpawnRate = Math.max(0.3, this.enemySpawnRate - 0.05);
        }

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            e.y += e.speed * dt;

            // Remove off-screen
            if (e.y > this.canvas.height) {
                this.enemies.splice(i, 1);
                continue;
            }

            // Check bullet collision
            for (let bi = this.bullets.length - 1; bi >= 0; bi--) {
                const b = this.bullets[bi];
                if (b.x < e.x + e.width && b.x + b.width > e.x &&
                    b.y < e.y + e.height && b.y + b.height > e.y) {
                    this.bullets.splice(bi, 1);
                    e.hp--;
                    if (e.hp <= 0) {
                        this.score += 10 * e.maxHp;
                        this._spawnParticles(e.x + e.width/2, e.y + e.height/2, '#ff3355', 12);
                        window.gameManager.shakeScreen(0.3);
                        if (window.soundManager) window.soundManager.playScore();
                        this.enemies.splice(i, 1);
                        break;
                    }
                }
            }

            // Check player collision
            if (this.player.x < e.x + e.width && this.player.x + this.player.width > e.x &&
                this.player.y < e.y + e.height && this.player.y + this.player.height > e.y) {
                this._spawnParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#00ffff', 20);
                this._triggerGameOver();
                return;
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= p.decay * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background gradient
        const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bg.addColorStop(0, '#0a0a15');
        bg.addColorStop(1, '#1a0a2e');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stars
        ctx.fillStyle = '#ffffff';
        this.stars.forEach(s => {
            ctx.globalAlpha = 0.3 + Math.sin(this.frameCount * 0.05 + s.x) * 0.2;
            ctx.fillRect(s.x, s.y, s.size, s.size);
        });
        ctx.globalAlpha = 1;

        // Player
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(this.player.x + this.player.width/2, this.player.y);
        ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
        ctx.lineTo(this.player.x, this.player.y + this.player.height);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Bullets
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;
        this.bullets.forEach(b => {
            ctx.fillRect(b.x, b.y, b.width, b.height);
        });
        ctx.shadowBlur = 0;

        // Enemies
        this.enemies.forEach(e => {
            const hue = (e.hp * 30) % 360;
            ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
            ctx.shadowColor = `hsl(${hue}, 80%, 50%)`;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(e.x + e.width/2, e.y + e.height/2, e.width/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // HP indicator
            if (e.hp < e.maxHp) {
                ctx.fillStyle = '#333';
                ctx.fillRect(e.x, e.y - 8, e.width, 4);
                ctx.fillStyle = '#ff5555';
                ctx.fillRect(e.x, e.y - 8, e.width * (e.hp / e.maxHp), 4);
            }
        });

        // Particles
        this.particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        // Score
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 20px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('SCORE: ' + this.score, 20, 35);

        // Controls hint
        ctx.fillStyle = '#555577';
        ctx.font = '400 12px Inter, sans-serif';
        ctx.fillText('← → Move   SPACE Shoot', 20, canvas.height - 15);
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._removeListeners(); }
    resume() { this._bindKeys(); }
}

window.gameManager.registerGame('blaster', BlasterGame, {
    name: 'Blaster',
    canvasWidth: 880,
    canvasHeight: 540
});
