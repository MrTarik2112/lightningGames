// Frogger Game v2.0 - Premium Edition
class FroggerGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;

        this.gridSize = 40;
        this.rows = 13; // 540 / 40 ~ 13.5
        this.cols = 22; // 880 / 40 = 22

        this.frog = { x: 11, y: 12, size: 30, dead: false };
        this.lanes = [];
        this.particles = [];
        this.won = false;

        this._keyHandler = null;
        this.moveTimer = 0;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.won = false;

        this.frog = { x: 11, y: 12, size: 30, dead: false };
        this.particles = [];
        this.moveTimer = 0;

        // Setup lanes
        this.lanes = [
            { y: 1, type: 'safe', speed: 0, density: 0 }, // Win area
            { y: 2, type: 'water', speed: 2, density: 0.3, dir: 1, length: 3 }, // Log/Turtle
            { y: 3, type: 'water', speed: 3, density: 0.2, dir: -1, length: 2 },
            { y: 4, type: 'water', speed: 1.5, density: 0.4, dir: 1, length: 4 },
            { y: 5, type: 'water', speed: 4, density: 0.2, dir: -1, length: 2 },
            { y: 6, type: 'water', speed: 2.5, density: 0.3, dir: 1, length: 3 },
            { y: 7, type: 'safe', speed: 0, density: 0 }, // Middle safe zone
            { y: 8, type: 'road', speed: 3, density: 0.2, dir: -1, length: 1 }, // Cars
            { y: 9, type: 'road', speed: 2, density: 0.3, dir: 1, length: 1 },
            { y: 10, type: 'road', speed: 4, density: 0.15, dir: -1, length: 1 },
            { y: 11, type: 'road', speed: 2.5, density: 0.25, dir: 1, length: 2 }, // Truck
            { y: 12, type: 'safe', speed: 0, density: 0 }  // Start
        ];

        this.entities = [];
        this.lanes.forEach(lane => {
            if (lane.speed === 0) return;
            let gap = Math.floor(1 / lane.density);
            for (let i = 0; i < this.cols; i += gap) {
                if (Math.random() < 0.7) {
                    this.entities.push({
                        lane: lane,
                        x: i,
                        y: lane.y
                    });
                }
            }
        });

        this._bindKeys();
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        this._keyHandler = (e) => {
            if (this.gameOver) return;
            if (this.moveTimer > 0) return; // simple cooldown

            let moved = false;
            switch (e.key) {
                case 'ArrowUp': case 'w': case 'W':
                    this.frog.y--; moved = true; this.score += 10; break;
                case 'ArrowDown': case 's': case 'S':
                    if (this.frog.y < 12) { this.frog.y++; moved = true; } break;
                case 'ArrowLeft': case 'a': case 'A':
                    if (this.frog.x > 0) { this.frog.x--; moved = true; } break;
                case 'ArrowRight': case 'd': case 'D':
                    if (this.frog.x < this.cols - 1) { this.frog.x++; moved = true; } break;
            }

            if (moved) {
                this.moveTimer = 0.1;
                if (window.soundManager) window.soundManager.playJump();
                this._spawnParticles(
                    this.frog.x * this.gridSize + this.gridSize / 2,
                    this.frog.y * this.gridSize + this.gridSize / 2 + 10,
                    '#00ff88', 5, 50
                );

                if (this.frog.y === 1) {
                    this.score += 500;
                    this.won = true;
                    window.gameManager.unlockAchievement('frogger_master', 'Frogger Master', 'Successfully crossed in Frogger!', '👑', true);
                    if (window.soundManager) window.soundManager.playWin();
                    this._triggerGameOver();
                }
            }
        };
        document.addEventListener('keydown', this._keyHandler);
    }

    _spawnParticles(x, y, color, count, speed = 100) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y, vx: (Math.random() - 0.5) * speed, vy: (Math.random() - 0.5) * speed,
                life: 1, decay: 2 + Math.random(), size: Math.random() * 3 + 1, color
            });
        }
    }

    update(dt) {
        if (this.gameOver) return;
        if (this.moveTimer > 0) this.moveTimer -= dt;

        let onLog = false;
        let logSpeed = 0;

        // Move entities
        this.entities.forEach(ent => {
            ent.x += ent.lane.speed * ent.lane.dir * dt;

            // Wrap around
            if (ent.lane.dir === 1 && ent.x > this.cols) ent.x = -ent.lane.length;
            if (ent.lane.dir === -1 && ent.x < -ent.lane.length) ent.x = this.cols;

            // Collision detection
            if (Math.floor(this.frog.y) === ent.y) {
                if (this.frog.x >= ent.x - 0.5 && this.frog.x < ent.x + ent.lane.length - 0.5) {
                    if (ent.lane.type === 'road') {
                        // Hit by car
                        this.frog.dead = true;
                        this._spawnParticles(this.frog.x * this.gridSize, this.frog.y * this.gridSize, '#ff4466', 30, 200);
                        this._triggerGameOver();
                    } else if (ent.lane.type === 'water') {
                        // On log
                        onLog = true;
                        logSpeed = ent.lane.speed * ent.lane.dir * dt;
                    }
                }
            }
        });

        // Water death
        const currentLane = this.lanes.find(l => l.y === Math.floor(this.frog.y));
        if (currentLane && currentLane.type === 'water') {
            if (!onLog) {
                this.frog.dead = true;
                this._spawnParticles(this.frog.x * this.gridSize, this.frog.y * this.gridSize, '#00ddff', 30, 100);
                this._triggerGameOver();
            } else {
                this.frog.x += logSpeed;
                if (this.frog.x < 0 || this.frog.x >= this.cols) {
                    this.frog.dead = true; // Rode off screen
                    this._triggerGameOver();
                }
            }
        }

        // Particle update
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
        if (this._keyHandler) { document.removeEventListener('keydown', this._keyHandler); this._keyHandler = null; }
        if (window.soundManager) window.soundManager[this.won ? 'playWin' : 'playDeath']();
        if (window.gameManager) {
            window.gameManager.shakeScreen(this.won ? 0.3 : 1.5);
            window.gameManager.checkAndUpdateHighScore('frogger', this.score);
        }
        setTimeout(() => this._showGameOverOverlay(), 500);
    }

    _showGameOverOverlay() {
        // Remove any existing overlay first
        const existingOverlay = document.querySelector('.game-over-overlay');
        if (existingOverlay) existingOverlay.remove();

        const container = document.querySelector('.game-canvas-container');
        if (!container) return;

        let hs = 0; if (window.gameManager) hs = window.gameManager.getHighScore('frogger');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">${this.won ? 'You Crossed! 🎉' : 'Squashed! 🐸'}</div>
            <div class="game-over-score">Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="frog-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#frog-restart').addEventListener('click', () => {
            if (window.gameManager) window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Lanes Backgrounds
        this.lanes.forEach(l => {
            if (l.type === 'water') {
                ctx.fillStyle = 'rgba(0, 100, 255, 0.1)';
            } else if (l.type === 'road') {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            } else {
                ctx.fillStyle = 'rgba(0, 255, 100, 0.05)'; // Safe
            }
            ctx.fillRect(0, l.y * this.gridSize, canvas.width, this.gridSize);
        });

        // Draw Entities
        this.entities.forEach(ent => {
            let px = ent.x * this.gridSize;
            let py = ent.y * this.gridSize + 5;
            let w = ent.lane.length * this.gridSize;

            if (ent.lane.type === 'water') {
                // Log
                ctx.fillStyle = '#aa6633';
                ctx.beginPath();
                ctx.roundRect(px, py, w - 5, this.gridSize - 10, 8);
                ctx.fill();
            } else {
                // Car
                ctx.fillStyle = ent.lane.dir === 1 ? '#ff4466' : '#00ddff';
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.roundRect(px, py, w - 5, this.gridSize - 10, 4);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });

        // Draw Frog
        if (!this.frog.dead) {
            // Clamp frog position to valid grid range
            const clampedX = Math.max(0, Math.min(this.cols - 1, this.frog.x));
            const clampedY = Math.max(0, Math.min(this.rows - 1, this.frog.y));

            let fx = clampedX * this.gridSize + this.gridSize / 2;
            let fy = clampedY * this.gridSize + this.gridSize / 2 + 5; // +5 offset for visual centering
            ctx.fillStyle = '#00ff88';
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(fx, fy, this.frog.size / 2, 0, Math.PI * 2);
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
    pause() { if (this._keyHandler) { document.removeEventListener('keydown', this._keyHandler); this._keyHandler = null; } }
    resume() { this._bindKeys(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('frogger', FroggerGame, {
        name: 'Frogger',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
