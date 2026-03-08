// Ninja Slice - Fruit Ninja Style Game
class NinjaSliceGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;

        this.fruits = [];
        this.sliceTrail = [];
        this.particles = [];
        this.bomb = null;

        this.lives = 3;
        this.spawnRate = 1.0;
        this.spawnTimer = 0;
        this.difficulty = 1;
        this.gameTime = 0;

        this.mouseDown = false;
        this.mousePos = { x: 0, y: 0 };

        this._mouseDownHandler = null;
        this._mouseMoveHandler = null;
        this._mouseUpHandler = null;
        this._keyHandler = null;

        this.FRUIT_TYPES = [
            { color: '#ff5555', radius: 25, points: 10, emoji: '🍎' },
            { color: '#ffaa00', radius: 25, points: 10, emoji: '🍊' },
            { color: '#ffff55', radius: 25, points: 10, emoji: '🍋' },
            { color: '#55ff55', radius: 25, points: 10, emoji: '🍏' },
            { color: '#ff55ff', radius: 22, points: 15, emoji: '🍇' },
            { color: '#ff8855', radius: 28, points: 20, emoji: '🍉' }
        ];
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;

        this.fruits = [];
        this.sliceTrail = [];
        this.particles = [];
        this.bomb = null;

        this.lives = 3;
        this.spawnRate = 1.0;
        this.spawnTimer = 0;
        this.difficulty = 1;
        this.gameTime = 0;
        this.mouseDown = false;

        this._bindEvents();
    }

    _bindEvents() {
        this._removeListeners();

        this._mouseDownHandler = (e) => {
            if (this.gameOver) return;
            this.mouseDown = true;
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            this.mousePos.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        };

        this._mouseMoveHandler = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos.x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            this.mousePos.y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
        };

        this._mouseUpHandler = () => {
            this.mouseDown = false;
            this.sliceTrail = [];
        };

        this._keyHandler = (e) => {
            if (e.key === 'r' || e.key === 'R') {
                if (this.gameOver) {
                    window.gameManager.resetCurrentGame();
                }
            }
        };

        this.canvas.addEventListener('mousedown', this._mouseDownHandler);
        this.canvas.addEventListener('mousemove', this._mouseMoveHandler);
        this.canvas.addEventListener('mouseup', this._mouseUpHandler);
        this.canvas.addEventListener('mouseleave', this._mouseUpHandler);
        document.addEventListener('keydown', this._keyHandler);
    }

    _removeListeners() {
        if (this._mouseDownHandler) {
            this.canvas.removeEventListener('mousedown', this._mouseDownHandler);
        }
        if (this._mouseMoveHandler) {
            this.canvas.removeEventListener('mousemove', this._mouseMoveHandler);
        }
        if (this._mouseUpHandler) {
            this.canvas.removeEventListener('mouseup', this._mouseUpHandler);
            this.canvas.removeEventListener('mouseleave', this._mouseUpHandler);
        }
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
        }
    }

    spawnFruit() {
        const type = this.FRUIT_TYPES[Math.floor(Math.random() * this.FRUIT_TYPES.length)];
        const x = 80 + Math.random() * (this.canvas.width - 160);
        const angle = -Math.PI/2 + (Math.random() - 0.5) * 0.8;
        const speed = 350 + Math.random() * 200 + this.difficulty * 50;

        this.fruits.push({
            x: x,
            y: this.canvas.height + 40,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            rotation: 0,
            rotationSpeed: (Math.random() - 0.5) * 4,
            radius: type.radius,
            color: type.color,
            points: type.points,
            emoji: type.emoji,
            sliced: false,
            half: null
        });
    }

    spawnBomb() {
        this.bomb = {
            x: 80 + Math.random() * (this.canvas.width - 160),
            y: this.canvas.height + 40,
            vx: (Math.random() - 0.5) * 200,
            vy: -500 - Math.random() * 200,
            radius: 30,
            rotation: 0,
            sliced: false
        };
    }

    _spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 400,
                vy: (Math.random() - 0.5) * 400 - 100,
                life: 1,
                decay: 1 + Math.random(),
                radius: 3 + Math.random() * 5,
                color: color
            });
        }
    }

    _triggerGameOver() {
        this.gameOver = true;
        window.gameManager.shakeScreen(1);
        if (window.soundManager) window.soundManager.playDeath();
        window.gameManager.checkAndUpdateHighScore('ninja', this.score);
        this._removeListeners();
        this._showGameOverOverlay();
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        const existing = container.querySelector('.game-over-overlay');
        if (existing) existing.remove();

        const hs = window.gameManager.getHighScore('ninja');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Game Over!</div>
            <div class="game-over-score">Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="ninja-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#ninja-restart').addEventListener('click', () => {
            window.gameManager.resetCurrentGame();
        });
    }

    update(dt) {
        if (this.gameOver) return;

        this.gameTime += dt;

        // Update difficulty
        if (this.gameTime > 10) {
            this.gameTime = 0;
            this.difficulty++;
            this.spawnRate = Math.max(0.4, this.spawnRate - 0.1);
        }

        // Spawn
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnRate) {
            this.spawnTimer = 0;
            this.spawnFruit();
            if (Math.random() < 0.15 * this.difficulty) {
                this.spawnFruit();
            }
            if (Math.random() < 0.1 * this.difficulty && !this.bomb) {
                this.spawnBomb();
            }
        }

        // Update slice trail
        if (this.mouseDown) {
            this.sliceTrail.push({ x: this.mousePos.x, y: this.mousePos.y });
            if (this.sliceTrail.length > 12) this.sliceTrail.shift();
        }

        // Update fruits
        for (let i = this.fruits.length - 1; i >= 0; i--) {
            const f = this.fruits[i];
            f.x += f.vx * dt;
            f.y += f.vy * dt;
            f.vy += 400 * dt; // Gravity
            f.rotation += f.rotationSpeed * dt;

            // Check slice
            if (!f.sliced && this.mouseDown && this.sliceTrail.length > 1) {
                const last = this.sliceTrail[this.sliceTrail.length - 1];
                const dist = Math.hypot(f.x - last.x, f.y - last.y);
                if (dist < f.radius + 15) {
                    f.sliced = true;
                    this.score += f.points;
                    this._spawnParticles(f.x, f.y, f.color, 12);
                    if (window.soundManager) { window.soundManager.playSlice(); window.soundManager.playScore(); }

                    // Create two halves
                    this.fruits.push({
                        ...f,
                        vx: f.vx - 100,
                        sliced: true,
                        half: 'left'
                    });
                    this.fruits.push({
                        ...f,
                        x: f.x,
                        vx: f.vx + 100,
                        sliced: true,
                        half: 'right'
                    });
                    this.fruits.splice(i, 1);
                    continue;
                }
            }

            // Remove off-screen
            if (f.y > this.canvas.height + 60) {
                // Missed fruit
                if (!f.sliced && !f.half) {
                    this.lives--;
                    if (this.lives <= 0) {
                        this._triggerGameOver();
                        return;
                    }
                }
                this.fruits.splice(i, 1);
            }
        }

        // Update bomb
        if (this.bomb) {
            this.bomb.x += this.bomb.vx * dt;
            this.bomb.y += this.bomb.vy * dt;
            this.bomb.vy += 400 * dt;
            this.bomb.rotation += 3 * dt;

            if (!this.bomb.sliced && this.mouseDown && this.sliceTrail.length > 1) {
                const last = this.sliceTrail[this.sliceTrail.length - 1];
                const dist = Math.hypot(this.bomb.x - last.x, this.bomb.y - last.y);
                if (dist < this.bomb.radius + 15) {
                    this.bomb.sliced = true;
                    this.lives--;
                    this._spawnParticles(this.bomb.x, this.bomb.y, '#ff0000', 25);
                    window.gameManager.shakeScreen(0.8);
                    this.bomb = null;
                    if (this.lives <= 0) {
                        this._triggerGameOver();
                        return;
                    }
                }
            }

            if (this.bomb && this.bomb.y > this.canvas.height + 60) {
                this.bomb = null;
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 300 * dt;
            p.life -= p.decay * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background gradient
        const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bg.addColorStop(0, '#1a1a2e');
        bg.addColorStop(1, '#0d0d1a');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Bamboo background pattern
        ctx.strokeStyle = '#2a2a4e';
        ctx.lineWidth = 2;
        for (let i = 0; i < 12; i++) {
            const x = 70 + i * 75;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        // Draw fruits
        this.fruits.forEach(f => {
            ctx.save();
            ctx.translate(f.x, f.y);
            ctx.rotate(f.rotation);

            if (f.sliced && f.half) {
                ctx.globalAlpha = 0.8;
                ctx.fillStyle = f.color;
                ctx.beginPath();
                if (f.half === 'left') {
                    ctx.arc(0, 0, f.radius, Math.PI/2, -Math.PI/2);
                } else {
                    ctx.arc(0, 0, f.radius, -Math.PI/2, Math.PI/2);
                }
                ctx.fill();
            } else if (!f.sliced) {
                // Glow
                ctx.shadowColor = f.color;
                ctx.shadowBlur = 15;
                ctx.fillStyle = f.color;
                ctx.beginPath();
                ctx.arc(0, 0, f.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Emoji
                ctx.font = '22px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(f.emoji, 0, 0);
            }
            ctx.restore();
        });

        // Draw bomb
        if (this.bomb && !this.bomb.sliced) {
            ctx.save();
            ctx.translate(this.bomb.x, this.bomb.y);
            ctx.rotate(this.bomb.rotation);

            ctx.fillStyle = '#333';
            ctx.shadowColor = '#ff0000';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(0, 0, this.bomb.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Skull icon
            ctx.fillStyle = '#ff0000';
            ctx.font = '24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('💀', 0, 0);

            ctx.restore();
        }

        // Draw particles
        this.particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Draw slice trail
        if (this.sliceTrail.length > 1) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowColor = '#00ffff';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.moveTo(this.sliceTrail[0].x, this.sliceTrail[0].y);
            for (let i = 1; i < this.sliceTrail.length; i++) {
                ctx.lineTo(this.sliceTrail[i].x, this.sliceTrail[i].y);
            }
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Lives
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Inter, sans-serif';
        ctx.textAlign = 'left';
        for (let i = 0; i < this.lives; i++) {
            ctx.fillText('❤️', 20 + i * 30, 40);
        }

        // Score
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 24px Inter, sans-serif';
        ctx.fillText('Score: ' + this.score, 20, 75);

        // Title
        ctx.fillStyle = '#ff5555';
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('NINJA SLICE', canvas.width/2, 45);

        // Instructions
        if (this.gameTime < 3) {
            ctx.fillStyle = '#666';
            ctx.font = '400 16px Inter, sans-serif';
            ctx.fillText('Click and drag to slice! Avoid the bombs!', canvas.width/2, canvas.height - 25);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._removeListeners(); }
    resume() { this._bindEvents(); }
}

window.gameManager.registerGame('ninja', NinjaSliceGame, {
    name: 'Ninja Slice',
    canvasWidth: 880,
    canvasHeight: 540
});
