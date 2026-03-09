// Breakout Game v2.0 - Premium Edition
class BreakoutGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        this.win = false;

        this.paddle = { x: 0, y: 0, width: 120, height: 15, speed: 500 };
        this.ball = { x: 0, y: 0, vx: 300, vy: -300, radius: 8 };
        this.bricks = [];
        this.brickRowCount = 5;
        this.brickColumnCount = 9;
        this.brickWidth = 80;
        this.brickHeight = 25;
        this.brickPadding = 10;
        this.brickOffsetTop = 50;
        this.brickOffsetLeft = 35;

        this._keyHandler = null;
        this._keyUpHandler = null;
        this.keys = { left: false, right: false };
        this.particles = [];
        this.colors = ['#ff00aa', '#ff8844', '#ffcc00', '#00ff88', '#00ddff'];
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.win = false;

        this.paddle.x = canvas.width / 2 - this.paddle.width / 2;
        this.paddle.y = canvas.height - 40;

        this.ball.x = canvas.width / 2;
        this.ball.y = this.paddle.y - this.ball.radius - 5;
        this.ball.vx = (Math.random() > 0.5 ? 1 : -1) * 200;
        this.ball.vy = -350;

        this.bricks = [];
        for (let c = 0; c < this.brickColumnCount; c++) {
            this.bricks[c] = [];
            for (let r = 0; r < this.brickRowCount; r++) {
                this.bricks[c][r] = { x: 0, y: 0, status: 1, color: this.colors[r] };
            }
        }

        this.keys = { left: false, right: false };
        this.particles = [];
        this._bindKeys();
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        if (this._keyUpHandler) document.removeEventListener('keyup', this._keyUpHandler);

        this._keyHandler = (e) => {
            if (this.gameOver || this.win) return;
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

    _spawnParticles(x, y, color, count = 15) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 300,
                vy: (Math.random() - 0.5) * 300,
                life: 1,
                decay: 1 + Math.random(),
                size: Math.random() * 4 + 2,
                color
            });
        }
    }

    update(dt) {
        if (this.gameOver || this.win) return;

        // Move paddle
        if (this.keys.left) this.paddle.x -= this.paddle.speed * dt;
        if (this.keys.right) this.paddle.x += this.paddle.speed * dt;

        if (this.paddle.x < 0) this.paddle.x = 0;
        if (this.paddle.x + this.paddle.width > this.canvas.width) {
            this.paddle.x = this.canvas.width - this.paddle.width;
        }

        // Move ball
        this.ball.x += this.ball.vx * dt;
        this.ball.y += this.ball.vy * dt;

        // Wall collisions
        if (this.ball.x - this.ball.radius < 0) {
            this.ball.x = this.ball.radius;
            this.ball.vx *= -1;
        } else if (this.ball.x + this.ball.radius > this.canvas.width) {
            this.ball.x = this.canvas.width - this.ball.radius;
            this.ball.vx *= -1;
        }

        if (this.ball.y - this.ball.radius < 0) {
            this.ball.y = this.ball.radius;
            this.ball.vy *= -1;
        }

        // Paddle collision
        if (this.ball.vy > 0 &&
            this.ball.y + this.ball.radius > this.paddle.y &&
            this.ball.y - this.ball.radius < this.paddle.y + this.paddle.height &&
            this.ball.x > this.paddle.x &&
            this.ball.x < this.paddle.x + this.paddle.width) {

            this.ball.vy *= -1;
            let hitPoint = (this.ball.x - (this.paddle.x + this.paddle.width / 2)) / (this.paddle.width / 2);
            this.ball.vx = hitPoint * 350;
            this._spawnParticles(this.ball.x, this.ball.y, '#00ddff', 5);
            if (window.soundManager) window.soundManager.playBounce();
        }

        // Brick collision
        let bricksLeft = 0;
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                let b = this.bricks[c][r];
                if (b.status === 1) {
                    bricksLeft++;
                    let brickX = (c * (this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
                    let brickY = (r * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop;
                    b.x = brickX;
                    b.y = brickY;

                    if (this.ball.x > brickX && this.ball.x < brickX + this.brickWidth &&
                        this.ball.y > brickY && this.ball.y < brickY + this.brickHeight) {

                        this.ball.vy *= -1;
                        b.status = 0;
                        this.score += (this.brickRowCount - r) * 10;
                        if (this.score >= 50) {
                            window.gameManager.unlockAchievement('precision', 'Precision', 'Scored 50 in Breakout without losing a ball.', '🎯', true);
                        }
                        this._spawnParticles(this.ball.x, this.ball.y, b.color, 20);
                        if (window.gameManager) window.gameManager.shakeScreen(0.2);
                        if (window.soundManager) { window.soundManager.playHit(); window.soundManager.playScore(); }
                    }
                }
            }
        }

        // Win condition
        if (bricksLeft === 0) {
            this.win = true;
            if (window.soundManager) window.soundManager.playWin();
            this._triggerGameOver();
        }

        // Bottom bounds (Game Over)
        if (this.ball.y - this.ball.radius > this.canvas.height) {
            this._spawnParticles(this.ball.x, this.canvas.height, '#ff4466', 30);
            this._triggerGameOver();
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

    _triggerGameOver() {
        this.gameOver = true;
        this._unbindKeys();
        if (window.soundManager && !this.win) window.soundManager.playDeath();
        if (window.gameManager) {
            if (!this.win) window.gameManager.shakeScreen(1.0);
            window.gameManager.checkAndUpdateHighScore('breakout', this.score);
        }
        this._showGameOverOverlay();
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;

        let hs = 0;
        if (window.gameManager) hs = window.gameManager.getHighScore('breakout');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">${this.win ? 'CONGRATULATIONS! GAME OVER' : 'Game Over!'}</div>
            <div class="game-over-score">Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="breakout-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#breakout-restart').addEventListener('click', () => {
            if (window.gameManager) window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bg.addColorStop(0, '#0a0a1a');
        bg.addColorStop(1, '#050510');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw Bricks
        for (let c = 0; c < this.brickColumnCount; c++) {
            for (let r = 0; r < this.brickRowCount; r++) {
                if (this.bricks[c][r].status === 1) {
                    let b = this.bricks[c][r];
                    ctx.fillStyle = b.color;
                    ctx.shadowColor = b.color;
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.roundRect(b.x, b.y, this.brickWidth, this.brickHeight, 4);
                    ctx.fill();
                }
            }
        }
        ctx.shadowBlur = 0;

        // Draw paddle
        ctx.fillStyle = '#00ddff';
        ctx.shadowColor = '#00ddff';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.roundRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height, 5);
        ctx.fill();

        // Draw ball
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        ctx.fill();

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
    window.gameManager.registerGame('breakout', BreakoutGame, {
        name: 'Breakout',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
