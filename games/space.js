// Space Shooter Game v2.0 - Premium Edition
class SpaceShooterGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;

        this.player = { x: 0, y: 0, width: 30, height: 40, speed: 400 };
        this.bullets = [];
        this.enemies = [];
        this.particles = [];

        this.shootTimer = 0;
        this.shootInterval = 0.2; // Auto-shoot every 0.2 seconds

        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 1.0;
        this.enemySpeedMult = 1.0;

        this._keyHandler = null;
        this._keyUpHandler = null;
        this.keys = { left: false, right: false };
        this.survivalTime = 0;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;

        this.player.x = canvas.width / 2 - this.player.width / 2;
        this.player.y = canvas.height - 60;

        this.bullets = [];
        this.enemies = [];
        this.particles = [];

        this.shootTimer = 0;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 1.0;
        this.enemySpeedMult = 1.0;
        this.survivalTime = 0;

        this.keys = { left: false, right: false };
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

    _spawnParticles(x, y, color, count = 15, speed = 200) {
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

        // Difficulty progression
        this.enemySpeedMult = Math.min(2.5, this.enemySpeedMult + dt * 0.01);
        this.enemySpawnInterval = Math.max(0.4, this.enemySpawnInterval - dt * 0.005);
        this.survivalTime += dt;
        if (this.survivalTime >= 60) {
            window.gameManager.unlockAchievement('bulletproof', 'Bulletproof', 'Survived 1 minute in Space Shooter without getting hit.', '🧥', true);
        }

        // Move player
        if (this.keys.left) this.player.x -= this.player.speed * dt;
        if (this.keys.right) this.player.x += this.player.speed * dt;

        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x + this.player.width > this.canvas.width) {
            this.player.x = this.canvas.width - this.player.width;
        }

        // Auto Shoot
        this.shootTimer += dt;
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            if (window.soundManager) window.soundManager.playShoot();
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - 2,
                y: this.player.y,
                width: 4,
                height: 15,
                vy: -600
            });

            // Player engine flare particle
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height,
                vx: (Math.random() - 0.5) * 50,
                vy: 100 + Math.random() * 50,
                life: 0.5,
                decay: 3,
                size: Math.random() * 3 + 1,
                color: '#ffdd00'
            });
        }

        // Move Bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            let b = this.bullets[i];
            b.y += b.vy * dt;
            if (b.y + b.height < 0) this.bullets.splice(i, 1);
        }

        // Spawn Enemies
        this.enemySpawnTimer += dt;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.enemySpawnTimer = 0;
            let width = 30 + Math.random() * 20;
            this.enemies.push({
                x: Math.random() * (this.canvas.width - width),
                y: -50,
                width: width,
                height: 30,
                vy: (150 + Math.random() * 100) * this.enemySpeedMult,
                hp: Math.floor(width / 15)
            });
        }

        // Move Enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let e = this.enemies[i];
            e.y += e.vy * dt;

            // Check Collision with Player
            if (e.y + e.height > this.player.y &&
                e.y < this.player.y + this.player.height &&
                e.x + e.width > this.player.x &&
                e.x < this.player.x + this.player.width) {

                this._spawnParticles(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#00ddff', 50, 400);
                this._spawnParticles(e.x + e.width / 2, e.y + e.height / 2, '#ff4466', 30);
                this._triggerGameOver();
                return;
            }

            // Off screen
            if (e.y > this.canvas.height) {
                // Optionally penalize score or lose life here. For now just remove.
                this.enemies.splice(i, 1);
            }
        }

        // Bullet & Enemy Collision
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            let b = this.bullets[i];
            let hit = false;

            for (let j = this.enemies.length - 1; j >= 0; j--) {
                let e = this.enemies[j];

                if (b.x < e.x + e.width &&
                    b.x + b.width > e.x &&
                    b.y < e.y + e.height &&
                    b.y + b.height > e.y) {

                    e.hp--;
                    hit = true;
                    this._spawnParticles(b.x, b.y, '#ffffaa', 5, 100);

                    if (e.hp <= 0) {
                        this.score += Math.floor(e.width);
                        this._spawnParticles(e.x + e.width / 2, e.y + e.height / 2, '#ff4466', 20);
                        if (window.soundManager) window.soundManager.playExplosion();
                        if (window.gameManager) {
                            window.gameManager.shakeScreen(0.3);
                        }
                        this.enemies.splice(j, 1);
                    }
                    break;
                }
            }
            if (hit) this.bullets.splice(i, 1);
        }

        // Move particles
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
        if (window.soundManager) window.soundManager.playDeath();
        this._unbindKeys();
        if (window.gameManager) {
            window.gameManager.shakeScreen(1.5);
            window.gameManager.checkAndUpdateHighScore('space', this.score);
        }
        this._showGameOverOverlay();
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;

        let hs = 0;
        if (window.gameManager) hs = window.gameManager.getHighScore('space');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Ship Destroyed!</div>
            <div class="game-over-score">Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="space-restart">↻ Return to Flight</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#space-restart').addEventListener('click', () => {
            if (window.gameManager) window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bg.addColorStop(0, '#00000a');
        bg.addColorStop(1, '#060618');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Moving stary background could go here...

        // Draw Player
        ctx.fillStyle = '#00ddff';
        ctx.shadowColor = '#00ddff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(this.player.x + this.player.width / 2, this.player.y);
        ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
        ctx.lineTo(this.player.x + this.player.width / 2, this.player.y + this.player.height - 10);
        ctx.lineTo(this.player.x, this.player.y + this.player.height);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Bullets
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffffaa';
        ctx.shadowBlur = 10;
        this.bullets.forEach(b => {
            ctx.fillRect(b.x, b.y, b.width, b.height);
        });
        ctx.shadowBlur = 0;

        // Draw Enemies
        this.enemies.forEach(e => {
            ctx.fillStyle = '#ff4466';
            ctx.shadowColor = '#ff4466';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.roundRect(e.x, e.y, e.width, e.height, 5);
            ctx.fill();

            // Draw HP indicator (simple inner highlight)
            ctx.fillStyle = `rgba(0,0,0,0.4)`;
            ctx.fillRect(e.x + 2, e.y + 2, (e.width - 4) * (Math.max(0, e.hp) / (e.width / 15)), 4);
        });
        ctx.shadowBlur = 0;

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
    window.gameManager.registerGame('space', SpaceShooterGame, {
        name: 'Space Shooter',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
