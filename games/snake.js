// Snake Game v2.0 - Premium Edition
class SnakeGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        this.gridSize = 20;
        this.snake = [];
        this.food = null;
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.moveTimer = 0;
        this.moveInterval = 0.11;
        this._keyHandler = null;
        this.particles = [];
        this.foodPulse = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.trail = [];
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.cols = Math.floor(canvas.width / this.gridSize);
        this.rows = Math.floor(canvas.height / this.gridSize);
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.moveTimer = 0;
        this.moveInterval = 0.11;
        this.particles = [];
        this.foodPulse = 0;
        this.combo = 0;
        this.comboTimer = 0;
        this.trail = [];

        const cx = Math.floor(this.cols / 2);
        const cy = Math.floor(this.rows / 2);
        this.snake = [
            { x: cx, y: cy },
            { x: cx - 1, y: cy },
            { x: cx - 2, y: cy },
            { x: cx - 3, y: cy }
        ];

        this.spawnFood();
        this._bindKeys();
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        this._keyHandler = (e) => {
            if (this.gameOver) return;
            switch (e.key) {
                case 'ArrowUp': case 'w': case 'W':
                    if (this.direction.y !== 1) { this.nextDirection = { x: 0, y: -1 }; if (window.soundManager) window.soundManager.playMove(); }
                    e.preventDefault(); break;
                case 'ArrowDown': case 's': case 'S':
                    if (this.direction.y !== -1) { this.nextDirection = { x: 0, y: 1 }; if (window.soundManager) window.soundManager.playMove(); }
                    e.preventDefault(); break;
                case 'ArrowLeft': case 'a': case 'A':
                    if (this.direction.x !== 1) { this.nextDirection = { x: -1, y: 0 }; if (window.soundManager) window.soundManager.playMove(); }
                    e.preventDefault(); break;
                case 'ArrowRight': case 'd': case 'D':
                    if (this.direction.x !== -1) { this.nextDirection = { x: 1, y: 0 }; if (window.soundManager) window.soundManager.playMove(); }
                    e.preventDefault(); break;
            }
        };
        document.addEventListener('keydown', this._keyHandler);
    }

    spawnFood() {
        let pos;
        let isFull = false;
        let iterations = 0;
        const maxIterations = this.cols * this.rows;

        do {
            pos = {
                x: Math.floor(Math.random() * this.cols),
                y: Math.floor(Math.random() * this.rows)
            };
            iterations++;
            if (iterations > maxIterations) {
                isFull = true;
                break;
            }
        } while (this.snake.some(s => s.x === pos.x && s.y === pos.y));

        if (!isFull) {
            this.food = pos;
        } else {
            // Board is full, handle win or just don't spawn
            this.food = { x: -1, y: -1 };
        }
    }

    _spawnParticles(x, y, color, count = 8) {
        const maxParticles = 120;
        if (this.particles.length > maxParticles) return;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x * this.gridSize + this.gridSize / 2,
                y: y * this.gridSize + this.gridSize / 2,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 1,
                decay: 1.5 + Math.random(),
                size: Math.random() * 4 + 2,
                color
            });
        }
    }

    update(dt) {
        if (this.gameOver) return;

        this.foodPulse += dt * 3;
        this.moveTimer += dt;
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) this.combo = 0;

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= p.decay * dt;
            p.vx *= 0.95;
            p.vy *= 0.95;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Update trail
        for (let i = this.trail.length - 1; i >= 0; i--) {
            this.trail[i].life -= dt * 3;
            if (this.trail[i].life <= 0) this.trail.splice(i, 1);
        }

        if (this.moveTimer < this.moveInterval) return;
        this.moveTimer = 0;

        this.direction = { ...this.nextDirection };
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows) {
            this._spawnParticles(this.snake[0].x, this.snake[0].y, '#ff4466', 15);
            this._triggerGameOver();
            return;
        }

        if (this.snake.some(s => s.x === head.x && s.y === head.y)) {
            this._spawnParticles(head.x, head.y, '#ff4466', 15);
            this._triggerGameOver();
            return;
        }

        // Add trail
        this.trail.push({
            x: this.snake[0].x, y: this.snake[0].y, life: 1
        });

        this.snake.unshift(head);

        if (head.x === this.food.x && head.y === this.food.y) {
            this.combo++;
            this.comboTimer = 3;
            const points = 10 * Math.max(1, this.combo);
            this.score += points;
            this._spawnParticles(head.x, head.y, '#00ff88', 12);
            window.gameManager.shakeScreen(0.5);
            if (window.soundManager) window.soundManager.playEat();
            if (window.soundManager) window.soundManager.playScore();

            // Snake Ultra Achievements
            if (window.gameManager) {
                if (this.score >= 100) {
                    window.gameManager.unlockAchievement('snake_100', 'Snake Tamer', 'Scored 100 points in Snake.', '🐍', false);
                }
                if (this.score >= 250) {
                    window.gameManager.unlockAchievement('snake_charmer', 'Snake Charmer', 'Scored 250 points in Snake.', '🐍', true);
                }
                if (this.combo >= 10) {
                    window.gameManager.unlockAchievement('reflex_master', 'Reflex Master', 'Achieved a 10x combo in Snake.', '💨', true);
                }
            }

            this.spawnFood();
            this.moveInterval = Math.max(0.04, this.moveInterval - 0.002);
        } else {
            this.snake.pop();
        }
    }

    _triggerGameOver() {
        this.gameOver = true;
        window.gameManager.shakeScreen(1);
        if (window.soundManager) window.soundManager.playDeath();
        window.gameManager.checkAndUpdateHighScore('snake', this.score);
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

        const hs = window.gameManager.getHighScore('snake');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Game Over!</div>
            <div class="game-over-score">Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="snake-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#snake-restart').addEventListener('click', () => {
            window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas, gridSize } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bg.addColorStop(0, '#060610');
        bg.addColorStop(1, '#0a0a1a');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Grid dots
        ctx.fillStyle = 'rgba(255,255,255,0.02)';
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                ctx.fillRect(x * gridSize + gridSize / 2 - 0.5, y * gridSize + gridSize / 2 - 0.5, 1, 1);
            }
        }

        // Trail
        this.trail.forEach(t => {
            ctx.fillStyle = `rgba(0, 255, 136, ${t.life * 0.08})`;
            ctx.beginPath();
            ctx.roundRect(t.x * gridSize + 3, t.y * gridSize + 3, gridSize - 6, gridSize - 6, 4);
            ctx.fill();
        });

        // Snake body with gradient
        this.snake.forEach((seg, i) => {
            const t = i / this.snake.length;
            const r = Math.round(0 + t * 0);
            const g = Math.round(255 - t * 100);
            const b = Math.round(136 - t * 80);
            const alpha = 1 - t * 0.4;

            if (i === 0) {
                // Head glow
                ctx.shadowColor = '#00ff88';
                ctx.shadowBlur = 18;
                ctx.fillStyle = '#00ff88';
            } else {
                ctx.shadowBlur = 0;
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }

            ctx.beginPath();
            ctx.roundRect(seg.x * gridSize + 1, seg.y * gridSize + 1, gridSize - 2, gridSize - 2, i === 0 ? 6 : 4);
            ctx.fill();

            // Inner highlight
            if (i < 3) {
                ctx.fillStyle = `rgba(255, 255, 255, ${(0.2 - t * 0.2)})`;
                ctx.fillRect(seg.x * gridSize + 3, seg.y * gridSize + 3, gridSize - 6, 2);
            }
        });
        ctx.shadowBlur = 0;

        // Eyes on head
        if (this.snake.length > 0) {
            const head = this.snake[0];
            const eyeSize = 3;
            ctx.fillStyle = '#ffffff';

            let e1x, e1y, e2x, e2y;
            const cx = head.x * gridSize + gridSize / 2;
            const cy = head.y * gridSize + gridSize / 2;

            if (this.direction.x === 1) { e1x = cx + 4; e1y = cy - 4; e2x = cx + 4; e2y = cy + 4; }
            else if (this.direction.x === -1) { e1x = cx - 4; e1y = cy - 4; e2x = cx - 4; e2y = cy + 4; }
            else if (this.direction.y === -1) { e1x = cx - 4; e1y = cy - 4; e2x = cx + 4; e2y = cy - 4; }
            else { e1x = cx - 4; e1y = cy + 4; e2x = cx + 4; e2y = cy + 4; }

            ctx.beginPath(); ctx.arc(e1x, e1y, eyeSize, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(e2x, e2y, eyeSize, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#0a0a1a';
            ctx.beginPath(); ctx.arc(e1x + this.direction.x, e1y + this.direction.y, 1.5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(e2x + this.direction.x, e2y + this.direction.y, 1.5, 0, Math.PI * 2); ctx.fill();
        }

        // Food with pulse
        const pulse = Math.sin(this.foodPulse) * 0.15 + 1;
        const foodX = this.food.x * gridSize + gridSize / 2;
        const foodY = this.food.y * gridSize + gridSize / 2;
        const foodR = (gridSize / 2 - 2) * pulse;

        // Food glow
        ctx.shadowColor = '#ff5555';
        ctx.shadowBlur = 15 + Math.sin(this.foodPulse) * 5;
        ctx.fillStyle = '#ff5555';
        ctx.beginPath();
        ctx.arc(foodX, foodY, foodR, 0, Math.PI * 2);
        ctx.fill();

        // Food inner highlight
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.beginPath();
        ctx.arc(foodX - 2, foodY - 2, foodR * 0.4, 0, Math.PI * 2);
        ctx.fill();

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

        // Combo display
        if (this.combo > 1) {
            ctx.fillStyle = `rgba(0, 255, 136, ${Math.min(1, this.comboTimer / 2)})`;
            ctx.font = '600 16px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`${this.combo}x Combo!`, canvas.width - 16, 28);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { if (this._keyHandler) { document.removeEventListener('keydown', this._keyHandler); this._keyHandler = null; } }
    resume() { this._bindKeys(); }
}

window.gameManager.registerGame('snake', SnakeGame, {
    name: 'Snake',
    canvasWidth: 880,
    canvasHeight: 540
});