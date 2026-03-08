// Bouncy Ball - Physics Game
class BouncyGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;

        this.ball = { x: 0, y: 0, radius: 15, vx: 0, vy: 0 };
        this.platforms = [];
        this.stars = [];
        this.particles = [];

        this.gravity = 600;
        this.friction = 0.995;
        this.bounce = 0.75;

        this.mouseDown = false;
        this.mousePos = { x: 0, y: 0 };

        this._mouseDownHandler = null;
        this._mouseMoveHandler = null;
        this._mouseUpHandler = null;
        this._keyHandler = null;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;

        this.ball.x = canvas.width / 2;
        this.ball.y = 100;
        this.ball.vx = 0;
        this.ball.vy = 0;

        this.platforms = [];
        this.stars = [];
        this.particles = [];
        this.mouseDown = false;

        // Create platforms
        const platformWidth = 100;
        const gap = (canvas.height - 150) / 6;
        for (let i = 0; i < 6; i++) {
            this.platforms.push({
                x: 50 + Math.random() * (canvas.width - 150 - platformWidth),
                y: 150 + i * gap,
                width: platformWidth,
                height: 12,
                color: `hsl(${i * 60}, 70%, 60%)`
            });
        }

        // Create stars
        for (let i = 0; i < 30; i++) {
            this.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: 3 + Math.random() * 4,
                angle: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.03
            });
        }

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

    _spawnParticles(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 1,
                decay: 2 + Math.random(),
                size: Math.random() * 4 + 2,
                color
            });
        }
    }

    _triggerGameOver() {
        this.gameOver = true;
        if (window.soundManager) window.soundManager.playDeath();
        window.gameManager.checkAndUpdateHighScore('bouncy', this.score);
        this._removeListeners();
        this._showGameOverOverlay();
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        const existing = container.querySelector('.game-over-overlay');
        if (existing) existing.remove();

        const hs = window.gameManager.getHighScore('bouncy');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Game Over!</div>
            <div class="game-over-score">Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="bouncy-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#bouncy-restart').addEventListener('click', () => {
            window.gameManager.resetCurrentGame();
        });
    }

    update(dt) {
        if (this.gameOver) return;

        // Apply gravity
        this.ball.vy += this.gravity * dt;
        this.ball.vx *= this.friction;
        this.ball.vy *= this.friction;

        // Apply velocity
        this.ball.x += this.ball.vx * dt;
        this.ball.y += this.ball.vy * dt;

        // Bounce off walls
        if (this.ball.x - this.ball.radius < 0) {
            this.ball.x = this.ball.radius;
            this.ball.vx *= -this.bounce;
        }
        if (this.ball.x + this.ball.radius > this.canvas.width) {
            this.ball.x = this.canvas.width - this.ball.radius;
            this.ball.vx *= -this.bounce;
        }

        // Platform collision
        this.platforms.forEach(p => {
            if (this.ball.vy > 0 &&
                this.ball.y + this.ball.radius > p.y &&
                this.ball.y + this.ball.radius < p.y + p.height + 10 &&
                this.ball.x > p.x &&
                this.ball.x < p.x + p.width) {
                this.ball.y = p.y - this.ball.radius;
                this.ball.vy *= -this.bounce;
                this.ball.vx += (Math.random() - 0.5) * 50;
                this.score += 1;
                this._spawnParticles(this.ball.x, this.ball.y + this.ball.radius, p.color, 5);
                if (window.soundManager) { window.soundManager.playBounce(); window.soundManager.playScore(); }
            }
        });

        // Floor collision - game over
        if (this.ball.y + this.ball.radius > this.canvas.height) {
            this._triggerGameOver();
            return;
        }

        // Ceiling
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.y = this.ball.radius;
            this.ball.vy *= -this.bounce;
        }

        // Slingshot when mouse held
        if (this.mouseDown) {
            const dx = this.mousePos.x - this.ball.x;
            const dy = this.mousePos.y - this.ball.y;
            const dist = Math.hypot(dx, dy);
            if (dist > 30) {
                this.ball.vx += dx * 2 * dt;
                this.ball.vy += dy * 2 * dt;
            }
        }

        // Move stars
        this.stars.forEach(s => {
            s.angle += s.speed;
        });

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
        bg.addColorStop(0, '#1a0a2e');
        bg.addColorStop(1, '#0d0620');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stars
        this.stars.forEach(s => {
            const x = s.x + Math.cos(s.angle) * 20;
            const y = s.y + Math.sin(s.angle) * 10;
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.4 + Math.sin(s.angle) * 0.3;
            ctx.beginPath();
            ctx.arc(x, y, s.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Platforms
        this.platforms.forEach(p => {
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.fillRect(p.x, p.y, p.width, p.height);
            ctx.shadowBlur = 0;
        });

        // Slingshot line
        if (this.mouseDown) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(this.ball.x, this.ball.y);
            ctx.lineTo(this.mousePos.x, this.mousePos.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Ball
        ctx.fillStyle = '#ffaa00';
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        ctx.fill();

        // Ball shine
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(this.ball.x - 4, this.ball.y - 4, this.ball.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
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

        // Score
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 24px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Score: ' + this.score, 20, 40);

        // Instructions
        ctx.fillStyle = '#555577';
        ctx.font = '400 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Click and drag to slingshot the ball!', canvas.width/2, canvas.height - 20);
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._removeListeners(); }
    resume() { this._bindEvents(); }
}

window.gameManager.registerGame('bouncy', BouncyGame, {
    name: 'Bouncy Ball',
    canvasWidth: 880,
    canvasHeight: 540
});
