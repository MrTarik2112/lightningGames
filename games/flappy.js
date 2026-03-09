// Flappy Bird Game v2.0 - Premium Edition
class FlappyGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        this.started = false;

        this.bird = { x: 0, y: 0, vy: 0, size: 18 };
        this.gravity = 820;
        this.flapForce = -285;

        this.pipes = [];
        this.pipeWidth = 52;
        this.pipeGap = 148;
        this.pipeSpeed = 185;
        this.pipeTimer = 0;
        this.pipeInterval = 1.7;

        this._keyHandler = null;
        this._clickHandler = null;

        // Visuals
        this.particles = [];
        this.stars = [];
        this.parallaxOffset = 0;
        this.groundOffset = 0;
        this.flapParticles = [];
        this.medals = ['', '🥉', '🥈', '🥇', '💎'];
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.started = false;
        this.particles = [];
        this.flapParticles = [];
        this.parallaxOffset = 0;
        this.groundOffset = 0;

        this.bird = {
            x: canvas.width * 0.22,
            y: canvas.height / 2,
            vy: 0,
            size: 18
        };

        this.pipes = [];
        this.pipeTimer = 0;

        // Generate stars
        this.stars = [];
        for (let i = 0; i < 40; i++) {
            this.stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * (canvas.height * 0.7),
                size: Math.random() * 1.5 + 0.3,
                twinkle: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 2
            });
        }

        this._bindKeys();
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        if (this._clickHandler && this.canvas) this.canvas.removeEventListener('click', this._clickHandler);

        this._keyHandler = (e) => {
            if (e.key === ' ' || e.code === 'Space') {
                e.preventDefault();
                this._flap();
            }
        };

        this._clickHandler = () => { this._flap(); };

        document.addEventListener('keydown', this._keyHandler);
        this.canvas.addEventListener('click', this._clickHandler);
    }

    _flap() {
        if (this.gameOver) return;
        if (!this.started) this.started = true;
        this.bird.vy = this.flapForce;
        if (window.soundManager) window.soundManager.playJump();

        // Spawn flap particles
        for (let i = 0; i < 5; i++) {
            this.flapParticles.push({
                x: this.bird.x - 8,
                y: this.bird.y + 4,
                vx: -50 - Math.random() * 60,
                vy: 20 + Math.random() * 40,
                life: 1,
                size: Math.random() * 3 + 1
            });
        }
    }

    _spawnPipe() {
        const minTop = 70;
        const maxTop = this.canvas.height - this.pipeGap - 70;
        const topHeight = minTop + Math.random() * (maxTop - minTop);

        this.pipes.push({
            x: this.canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            scored: false
        });
    }

    _getMedal() {
        if (this.score >= 40) return this.medals[4];
        if (this.score >= 30) return this.medals[3];
        if (this.score >= 20) return this.medals[2];
        if (this.score >= 10) return this.medals[1];
        return '';
    }

    update(dt) {
        if (this.gameOver) {
            // Continue updating particles
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.x += p.vx * dt;
                p.y += p.vy * dt;
                p.vy += 300 * dt;
                p.life -= 2 * dt;
                if (p.life <= 0) this.particles.splice(i, 1);
            }
            return;
        }

        if (!this.started) {
            // Idle bob
            this.bird.y = this.canvas.height / 2 + Math.sin(Date.now() / 300) * 8;
            return;
        }

        // Bird physics
        this.bird.vy += this.gravity * dt;
        this.bird.y += this.bird.vy * dt;

        // Ceiling
        if (this.bird.y - this.bird.size < 0) {
            this._triggerGameOver();
            return;
        }

        // Floor
        if (this.bird.y + this.bird.size > this.canvas.height - 30) {
            this._triggerGameOver();
            return;
        }

        // Parallax
        this.parallaxOffset += dt * 20;
        this.groundOffset += this.pipeSpeed * dt;

        // Pipe spawn
        this.pipeTimer += dt;
        if (this.pipeTimer >= this.pipeInterval) {
            this.pipeTimer = 0;
            this._spawnPipe();
        }

        // Move pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed * dt;

            if (!pipe.scored && pipe.x + this.pipeWidth < this.bird.x) {
                pipe.scored = true;
                this.score++;
                if (window.soundManager) window.soundManager.playScore();

                // Score particle burst
                for (let j = 0; j < 6; j++) {
                    this.particles.push({
                        x: this.bird.x,
                        y: this.bird.y - 25,
                        vx: (Math.random() - 0.5) * 80,
                        vy: -60 - Math.random() * 40,
                        life: 1,
                        size: Math.random() * 3 + 1,
                        color: '#ffcc00'
                    });
                }
            }

            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }

            if (this._checkCollision(pipe)) {
                this._triggerGameOver();
                return;
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= 2 * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Flap particles
        for (let i = this.flapParticles.length - 1; i >= 0; i--) {
            const p = this.flapParticles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= 3 * dt;
            if (p.life <= 0) this.flapParticles.splice(i, 1);
        }

        // Star twinkling
        this.stars.forEach(s => {
            s.twinkle += dt * s.speed;
        });
    }

    _checkCollision(pipe) {
        const b = this.bird;
        if (b.x + b.size > pipe.x && b.x - b.size < pipe.x + this.pipeWidth) {
            if (b.y - b.size < pipe.topHeight) return true;
            if (b.y + b.size > pipe.bottomY) return true;
        }
        return false;
    }

    _triggerGameOver() {
        this.gameOver = true;
        window.gameManager.shakeScreen(1);
        if (window.soundManager) window.soundManager.playDeath();
        window.gameManager.checkAndUpdateHighScore('flappy', this.score);

        // Death particles
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: this.bird.x,
                y: this.bird.y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 1,
                size: Math.random() * 4 + 2,
                color: '#ffcc00'
            });
        }

        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
        if (this._clickHandler && this.canvas) {
            this.canvas.removeEventListener('click', this._clickHandler);
            this._clickHandler = null;
        }

        setTimeout(() => this._showGameOverOverlay(), 500);
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        const existing = container.querySelector('.game-over-overlay');
        if (existing) existing.remove();

        const hs = window.gameManager.getHighScore('flappy');
        const isNew = this.score >= hs && this.score > 0;
        const medal = this._getMedal();

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Game Over!</div>
            ${medal ? `<div style="font-size:40px">${medal}</div>` : ''}
            <div class="game-over-score">Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="flappy-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#flappy-restart').addEventListener('click', () => {
            window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Sky gradient (dark theme)
        const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGrad.addColorStop(0, '#050515');
        skyGrad.addColorStop(0.5, '#0a0a25');
        skyGrad.addColorStop(1, '#0c1a28');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stars with twinkling
        this.stars.forEach(s => {
            const alpha = 0.2 + Math.sin(s.twinkle) * 0.15;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fill();
        });

        // Background mountains (parallax layer 1)
        ctx.fillStyle = 'rgba(15, 15, 35, 0.8)';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 30);
        for (let x = 0; x <= canvas.width; x += 60) {
            const h = 80 + Math.sin((x + this.parallaxOffset * 0.3) / 120) * 40 + Math.sin((x + this.parallaxOffset * 0.3) / 60) * 20;
            ctx.lineTo(x, canvas.height - 30 - h);
        }
        ctx.lineTo(canvas.width, canvas.height - 30);
        ctx.closePath();
        ctx.fill();

        // Background hills (parallax layer 2)
        ctx.fillStyle = 'rgba(12, 12, 28, 0.9)';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 30);
        for (let x = 0; x <= canvas.width; x += 40) {
            const h = 40 + Math.sin((x + this.parallaxOffset * 0.6) / 80) * 25 + Math.sin((x + this.parallaxOffset * 0.6) / 40) * 12;
            ctx.lineTo(x, canvas.height - 30 - h);
        }
        ctx.lineTo(canvas.width, canvas.height - 30);
        ctx.closePath();
        ctx.fill();

        // Ground
        ctx.fillStyle = '#0e1e2a';
        ctx.fillRect(0, canvas.height - 30, canvas.width, 30);
        // Ground line
        ctx.strokeStyle = 'rgba(0, 220, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 30);
        ctx.lineTo(canvas.width, canvas.height - 30);
        ctx.stroke();

        // Ground pattern
        ctx.fillStyle = 'rgba(0, 220, 255, 0.03)';
        for (let x = -this.groundOffset % 20; x < canvas.width; x += 20) {
            ctx.fillRect(x, canvas.height - 28, 8, 2);
        }

        // Pipes with premium styling
        this.pipes.forEach(pipe => {
            // Top pipe
            const pipeGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + this.pipeWidth, 0);
            pipeGrad.addColorStop(0, '#0d3a28');
            pipeGrad.addColorStop(0.3, '#1a6644');
            pipeGrad.addColorStop(0.7, '#1a6644');
            pipeGrad.addColorStop(1, '#0d3a28');

            ctx.fillStyle = pipeGrad;
            ctx.beginPath();
            ctx.roundRect(pipe.x, 0, this.pipeWidth, pipe.topHeight, [0, 0, 6, 6]);
            ctx.fill();

            // Top pipe cap
            ctx.fillStyle = '#22aa66';
            ctx.shadowColor = '#22aa66';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.roundRect(pipe.x - 4, pipe.topHeight - 22, this.pipeWidth + 8, 22, [5, 5, 0, 0]);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Pipe highlight
            ctx.fillStyle = 'rgba(255,255,255,0.06)';
            ctx.fillRect(pipe.x + 4, 0, 6, pipe.topHeight - 22);

            // Bottom pipe
            ctx.fillStyle = pipeGrad;
            ctx.beginPath();
            ctx.roundRect(pipe.x, pipe.bottomY, this.pipeWidth, canvas.height - 30 - pipe.bottomY, [6, 6, 0, 0]);
            ctx.fill();

            // Bottom pipe cap
            ctx.fillStyle = '#22aa66';
            ctx.shadowColor = '#22aa66';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.roundRect(pipe.x - 4, pipe.bottomY, this.pipeWidth + 8, 22, [0, 0, 5, 5]);
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.fillStyle = 'rgba(255,255,255,0.06)';
            ctx.fillRect(pipe.x + 4, pipe.bottomY + 22, 6, canvas.height - pipe.bottomY - 52);
        });

        // Flap particles
        this.flapParticles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Bird
        const b = this.bird;
        ctx.save();
        ctx.translate(b.x, b.y);
        const angle = this.started ? Math.max(-0.5, Math.min(0.6, this.bird.vy / 350)) : Math.sin(Date.now() / 300) * 0.1;
        ctx.rotate(angle);

        // Bird shadow/glow
        ctx.shadowColor = '#ffcc00';
        ctx.shadowBlur = 20;

        // Body
        ctx.fillStyle = '#ffc800';
        ctx.beginPath();
        ctx.ellipse(0, 0, b.size, b.size * 0.78, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Belly
        ctx.fillStyle = '#ffe166';
        ctx.beginPath();
        ctx.ellipse(2, 4, b.size * 0.55, b.size * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wing
        const wingAngle = this.started ? Math.sin(Date.now() / 50) * 0.4 : Math.sin(Date.now() / 150) * 0.2;
        ctx.fillStyle = '#ff9900';
        ctx.save();
        ctx.rotate(wingAngle);
        ctx.beginPath();
        ctx.ellipse(-6, 0, b.size * 0.55, b.size * 0.3, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Eye
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(9, -5, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(10.5, -4.5, 2.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(11.5, -5.5, 1, 0, Math.PI * 2);
        ctx.fill();

        // Beak
        ctx.fillStyle = '#ff4444';
        ctx.beginPath();
        ctx.moveTo(b.size - 2, -1);
        ctx.lineTo(b.size + 10, 3);
        ctx.lineTo(b.size - 2, 7);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

        // Score particles
        this.particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color || '#ffcc00';
            ctx.shadowColor = p.color || '#ffcc00';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        // Start prompt
        if (!this.started && !this.gameOver) {
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            ctx.font = '600 16px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Press Space or Click to start', canvas.width / 2, canvas.height / 2 + 70);

            // Animated arrow
            const arrowY = canvas.height / 2 + 40 + Math.sin(Date.now() / 300) * 5;
            ctx.fillStyle = 'rgba(255, 204, 0, 0.5)';
            ctx.font = '24px sans-serif';
            ctx.fillText('↑', canvas.width / 2, arrowY);
        }

        // Score display (in-game)
        if (this.started) {
            ctx.fillStyle = '#ffffff';
            ctx.font = '900 40px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = 4;
            ctx.strokeText(this.score, canvas.width / 2, 55);
            ctx.fillText(this.score, canvas.width / 2, 55);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }

    pause() {
        if (this._keyHandler) { document.removeEventListener('keydown', this._keyHandler); this._keyHandler = null; }
        if (this._clickHandler && this.canvas) { this.canvas.removeEventListener('click', this._clickHandler); this._clickHandler = null; }
    }

    resume() { this._bindKeys(); }
}

window.gameManager.registerGame('flappy', FlappyGame, {
    name: 'Flappy Bird',
    canvasWidth: 880,
    canvasHeight: 540
});
