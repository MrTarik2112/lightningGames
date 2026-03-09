// Asteroids Game v2.0 - Premium Edition
class AsteroidsGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;

        this.ship = { x: 0, y: 0, a: -Math.PI / 2, r: 15, thrusting: false, thrust: { x: 0, y: 0 }, rot: 0 };
        this.asteroids = [];
        this.lasers = [];
        this.particles = [];

        this.level = 1;
        this.friction = 0.7;
        this.shipThrust = 1000;
        this.turnSpeed = 360;
        this.laserSpeed = 500;

        this._keyHandler = null;
        this._keyUpHandler = null;
        this.keys = { left: false, right: false, up: false, shoot: false };
        this.lastShot = 0;
        this.survivalTime = 0;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.level = 1;
        this.gameOver = false;

        this.ship.x = canvas.width / 2;
        this.ship.y = canvas.height / 2;
        this.ship.thrust.x = 0;
        this.ship.thrust.y = 0;
        this.ship.a = -Math.PI / 2;

        this.asteroids = [];
        this.lasers = [];
        this.particles = [];
        this.keys = { left: false, right: false, up: false, shoot: false };
        this.survivalTime = 0;

        this._createAsteroids();
        this._bindKeys();
    }

    _createAsteroids() {
        this.asteroids = [];
        let x, y;
        for (let i = 0; i < this.level + 3; i++) {
            do {
                x = Math.random() * this.canvas.width;
                y = Math.random() * this.canvas.height;
            } while (this._distBetweenPoints(this.ship.x, this.ship.y, x, y) < 100);

            this.asteroids.push({
                x, y,
                vx: (Math.random() - 0.5) * 100 * (1 + this.level * 0.1),
                vy: (Math.random() - 0.5) * 100 * (1 + this.level * 0.1),
                r: 40,
                a: Math.random() * Math.PI * 2,
                verts: Math.floor(Math.random() * 5 + 5),
                offs: Array.from({ length: 10 }, () => Math.random() * 0.4 + 0.8)
            });
        }
    }

    _distBetweenPoints(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        if (this._keyUpHandler) document.removeEventListener('keyup', this._keyUpHandler);

        this._keyHandler = (e) => {
            if (this.gameOver) return;
            switch (e.key) {
                case 'ArrowLeft': case 'a': case 'A': this.keys.left = true; break;
                case 'ArrowRight': case 'd': case 'D': this.keys.right = true; break;
                case 'ArrowUp': case 'w': case 'W': this.keys.up = true; break;
                case ' ': this.keys.shoot = true; e.preventDefault(); break;
            }
        };
        this._keyUpHandler = (e) => {
            switch (e.key) {
                case 'ArrowLeft': case 'a': case 'A': this.keys.left = false; break;
                case 'ArrowRight': case 'd': case 'D': this.keys.right = false; break;
                case 'ArrowUp': case 'w': case 'W': this.keys.up = false; break;
                case ' ': this.keys.shoot = false; break;
            }
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

    _spawnParticles(x, y, color, count = 10, speed = 100) {
        const maxParticles = 150;
        if (this.particles.length > maxParticles) return;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * speed,
                vy: (Math.random() - 0.5) * speed,
                life: 1,
                decay: 1.5 + Math.random(),
                size: Math.random() * 3 + 1,
                color
            });
        }
    }

    update(dt) {
        if (this.gameOver) return;
        this.survivalTime += dt;
        if (this.survivalTime >= 180) {
            window.gameManager.unlockAchievement('indestructible', 'Indestructible', 'Survived 3 minutes in Asteroids.', '💎', true);
        }

        // Thrust
        if (this.keys.up) {
            this.ship.thrust.x += this.shipThrust * Math.cos(this.ship.a) * dt;
            this.ship.thrust.y += this.shipThrust * Math.sin(this.ship.a) * dt;
            if (Math.random() > 0.5) {
                this._spawnParticles(
                    this.ship.x - this.ship.r * Math.cos(this.ship.a),
                    this.ship.y - this.ship.r * Math.sin(this.ship.a),
                    '#ffdd00', 2, 50
                );
            }
        } else {
            this.ship.thrust.x -= this.friction * this.ship.thrust.x * dt;
            this.ship.thrust.y -= this.friction * this.ship.thrust.y * dt;
        }

        // Rotate
        if (this.keys.left) this.ship.a -= this.turnSpeed * Math.PI / 180 * dt;
        if (this.keys.right) this.ship.a += this.turnSpeed * Math.PI / 180 * dt;

        // Move ship
        this.ship.x += this.ship.thrust.x * dt;
        this.ship.y += this.ship.thrust.y * dt;

        // Screen wrap
        if (this.ship.x < 0 - this.ship.r) this.ship.x = this.canvas.width + this.ship.r;
        else if (this.ship.x > this.canvas.width + this.ship.r) this.ship.x = 0 - this.ship.r;
        if (this.ship.y < 0 - this.ship.r) this.ship.y = this.canvas.height + this.ship.r;
        else if (this.ship.y > this.canvas.height + this.ship.r) this.ship.y = 0 - this.ship.r;

        // Shoot
        this.lastShot += dt;
        if (this.keys.shoot && this.lastShot > 0.25) {
            this.lasers.push({
                x: this.ship.x + this.ship.r * Math.cos(this.ship.a),
                y: this.ship.y + this.ship.r * Math.sin(this.ship.a),
                vx: this.laserSpeed * Math.cos(this.ship.a),
                vy: this.laserSpeed * Math.sin(this.ship.a),
                dist: 0
            });
            this.lastShot = 0;
            if (window.gameManager) window.gameManager.shakeScreen(0.1);
            if (window.soundManager) window.soundManager.playShoot();
        }

        // Move lasers
        for (let i = this.lasers.length - 1; i >= 0; i--) {
            let l = this.lasers[i];
            l.x += l.vx * dt;
            l.y += l.vy * dt;
            l.dist += Math.sqrt(Math.pow(l.vx * dt, 2) + Math.pow(l.vy * dt, 2));

            if (l.x < 0) l.x = this.canvas.width;
            else if (l.x > this.canvas.width) l.x = 0;
            if (l.y < 0) l.y = this.canvas.height;
            else if (l.y > this.canvas.height) l.y = 0;

            if (l.dist > this.canvas.width) {
                this.lasers.splice(i, 1);
            }
        }

        // Move asteroids
        for (let a of this.asteroids) {
            a.x += a.vx * dt;
            a.y += a.vy * dt;
            if (a.x < 0 - a.r) a.x = this.canvas.width + a.r;
            else if (a.x > this.canvas.width + a.r) a.x = 0 - a.r;
            if (a.y < 0 - a.r) a.y = this.canvas.height + a.r;
            else if (a.y > this.canvas.height + a.r) a.y = 0 - a.r;
        }

        // Detect laser hits
        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            let a = this.asteroids[i];
            for (let j = this.lasers.length - 1; j >= 0; j--) {
                let l = this.lasers[j];
                if (this._distBetweenPoints(a.x, a.y, l.x, l.y) < a.r) {
                    this.lasers.splice(j, 1);
                    this._destroyAsteroid(i);
                    break;
                }
            }
        }

        // Detect ship collision
        for (let a of this.asteroids) {
            if (this._distBetweenPoints(this.ship.x, this.ship.y, a.x, a.y) < this.ship.r + a.r) {
                this._spawnParticles(this.ship.x, this.ship.y, '#ff4466', 50, 400);
                this._triggerGameOver();
                return;
            }
        }

        // Next level
        if (this.asteroids.length === 0) {
            this.level++;
            this._createAsteroids();
            if (window.soundManager) window.soundManager.playLevelUp();
        }

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= p.decay * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    _destroyAsteroid(index) {
        let a = this.asteroids[index];
        this._spawnParticles(a.x, a.y, '#8888aa', 20, 150);
        if (window.gameManager) window.gameManager.shakeScreen(0.3);
        if (window.soundManager) window.soundManager.playExplosion();

        // Remove the asteroid first to avoid index issues
        this.asteroids.splice(index, 1);

        if (a.r > 20) {
            this.asteroids.push({
                x: a.x, y: a.y,
                vx: a.vx * 1.5 + (Math.random() - 0.5) * 50,
                vy: a.vy * 1.5 + (Math.random() - 0.5) * 50,
                r: a.r / 2, a: Math.random() * Math.PI * 2,
                verts: Math.floor(Math.random() * 5 + 5),
                offs: Array.from({ length: 10 }, () => Math.random() * 0.4 + 0.8)
            });
            this.asteroids.push({
                x: a.x, y: a.y,
                vx: a.vx * 1.5 + (Math.random() - 0.5) * 50,
                vy: a.vy * 1.5 + (Math.random() - 0.5) * 50,
                r: a.r / 2, a: Math.random() * Math.PI * 2,
                verts: Math.floor(Math.random() * 5 + 5),
                offs: Array.from({ length: 10 }, () => Math.random() * 0.4 + 0.8)
            });
            this.score += 20;
        } else {
            this.score += 50;
        }

        if (window.gameManager) {
            window.gameManager.trackAsteroidDestroyed();
        }
    }

    _triggerGameOver() {
        this.gameOver = true;
        this._unbindKeys();
        if (window.soundManager) window.soundManager.playDeath();
        if (window.gameManager) {
            window.gameManager.shakeScreen(1.5);
            window.gameManager.checkAndUpdateHighScore('asteroids', this.score);
        }
        this._showGameOverOverlay();
    }

    _showGameOverOverlay() {
        // Remove any existing overlay first
        const existingOverlay = document.querySelector('.game-over-overlay');
        if (existingOverlay) existingOverlay.remove();

        const container = document.querySelector('.game-canvas-container');
        if (!container) return;

        let hs = 0; if (window.gameManager) hs = window.gameManager.getHighScore('asteroids');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Ship Destroyed!</div>
            <div class="game-over-score">Score: ${this.score} • Level: ${this.level}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="ast-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#ast-restart').addEventListener('click', () => {
            if (window.gameManager) window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // BG
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (!this.gameOver) {
            // Ship
            ctx.strokeStyle = '#00ddff';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#00ddff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(
                this.ship.x + this.ship.r * Math.cos(this.ship.a),
                this.ship.y + this.ship.r * Math.sin(this.ship.a)
            );
            ctx.lineTo(
                this.ship.x - this.ship.r * (Math.cos(this.ship.a) + Math.sin(this.ship.a)),
                this.ship.y - this.ship.r * (Math.sin(this.ship.a) - Math.cos(this.ship.a))
            );
            ctx.lineTo(
                this.ship.x - this.ship.r * (Math.cos(this.ship.a) - Math.sin(this.ship.a)),
                this.ship.y - this.ship.r * (Math.sin(this.ship.a) + Math.cos(this.ship.a))
            );
            ctx.closePath();
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Lasers
        ctx.fillStyle = '#00ff88';
        ctx.shadowColor = '#00ff88';
        ctx.shadowBlur = 8;
        for (let l of this.lasers) {
            ctx.beginPath();
            ctx.arc(l.x, l.y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Asteroids
        ctx.strokeStyle = '#8888aa';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(136,136,170,0.5)';
        ctx.shadowBlur = 10;
        for (let a of this.asteroids) {
            ctx.beginPath();
            for (let j = 0; j < a.verts; j++) {
                ctx.lineTo(
                    a.x + a.r * a.offs[j] * Math.cos(a.a + j * Math.PI * 2 / a.verts),
                    a.y + a.r * a.offs[j] * Math.sin(a.a + j * Math.PI * 2 / a.verts)
                );
            }
            ctx.closePath();
            ctx.stroke();

            // Inner glow
            ctx.fillStyle = 'rgba(255,255,255,0.02)';
            ctx.fill();
        }
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
    pause() { this._unbindKeys(); }
    resume() { this._bindKeys(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('asteroids', AsteroidsGame, {
        name: 'Asteroids',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
