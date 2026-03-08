// Simon Says Game v2.0 - Premium Edition
class SimonGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;

        this.colors = ['#ff4466', '#00ddff', '#00ff88', '#ffdd00'];
        this.buttons = [];
        this.sequence = [];
        this.playerStep = 0;

        this.state = 'idle'; // idle, showing, waiting, wrong
        this.activeLitIndex = -1;
        this.animTimer = 0;
        this.showIndex = 0;

        this.particles = [];
        this._clickHandler = null;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.sequence = [];
        this.playerStep = 0;
        this.particles = [];
        this.state = 'idle';
        this.activeLitIndex = -1;

        // Create 4 buttons (quadrants of circle)
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const rOuter = 200;
        const rInner = 80;

        this.buttons = [
            { id: 0, color: this.colors[0], sAng: Math.PI, eAng: Math.PI * 1.5 },   // Top-Left RED
            { id: 1, color: this.colors[1], sAng: Math.PI * 1.5, eAng: 0 },         // Top-Right BLUE
            { id: 2, color: this.colors[2], sAng: 0, eAng: Math.PI * 0.5 },         // Bot-Right GREEN
            { id: 3, color: this.colors[3], sAng: Math.PI * 0.5, eAng: Math.PI }    // Bot-Left YELLOW
        ];

        this.buttons.forEach(b => {
            b.cx = cx; b.cy = cy; b.rOuter = rOuter; b.rInner = rInner;
        });

        this._bindEvents();
        setTimeout(() => this._nextRound(), 1000);
    }

    _nextRound() {
        this.sequence.push(Math.floor(Math.random() * 4));
        this.playerStep = 0;
        this.showIndex = 0;
        this.state = 'showing';
        this.animTimer = 0.5; // Initial delay
    }

    _bindEvents() {
        if (this._clickHandler) this.canvas.removeEventListener('mousedown', this._clickHandler);
        this._clickHandler = (e) => {
            if (this.gameOver || this.state !== 'waiting') return;
            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            let clickedId = this._getClickedButton(mx, my);
            if (clickedId !== -1) {
                this._handlePlayerClick(clickedId);
            }
        };
        this.canvas.addEventListener('mousedown', this._clickHandler);
    }

    _getClickedButton(x, y) {
        let cx = this.canvas.width / 2, cy = this.canvas.height / 2;
        let dx = x - cx, dy = y - cy;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > this.buttons[0].rInner && dist < this.buttons[0].rOuter) {
            let angle = Math.atan2(dy, dx);
            if (angle < 0) angle += Math.PI * 2; // Normalize to 0 - 2PI

            for (let b of this.buttons) {
                let s = b.sAng < 0 ? b.sAng + Math.PI * 2 : b.sAng;
                let e = b.eAng <= 0 ? b.eAng + Math.PI * 2 : b.eAng;
                if (e === 0) e = Math.PI * 2; // fix Top-Right (270 to 360)

                if (s < e) {
                    if (angle >= s && angle <= e) return b.id;
                } else {
                    // Handles crossing 0 if needed, though with our quadrant setup, eAng=0 is handled above
                    if (angle >= s || angle <= e) return b.id;
                }
            }
        }
        return -1;
    }

    _handlePlayerClick(id) {
        this._lightButton(id);

        if (id !== this.sequence[this.playerStep]) {
            // Wrong
            this.state = 'wrong';
            this._spawnParticles(this.canvas.width / 2, this.canvas.height / 2, '#ff4466', 50);
            if (window.soundManager) window.soundManager.playBuzz();
            this._triggerGameOver();
        } else {
            // Correct
            this.playerStep++;
            if (window.soundManager) window.soundManager.playDing();
            if (this.playerStep === this.sequence.length) {
                this.score = this.sequence.length;
                if (this.score >= 10) {
                    window.gameManager.unlockAchievement('simon_10', 'Hafıza Çırağı', 'Memotron\'da 10 puan yaptın.', '🧠', false);
                }
                if (this.score >= 20) {
                    window.gameManager.unlockAchievement('simons_rival', 'Simon\'un Rakibi', 'Memotron\'da 20 puan yaptın.', '🧠', true);
                }
                this.state = 'idle';
                if (window.soundManager) window.soundManager.playLevelUp();
                setTimeout(() => this._nextRound(), 1000);
            }
        }
    }

    _lightButton(id) {
        this.activeLitIndex = id;
        this.animTimer = 0.4;
        let b = this.buttons[id];

        // Approx center of quadrant for particles
        let midAng = b.sAng + (b.eAng === 0 ? Math.PI * 2 - b.sAng : b.eAng - b.sAng) / 2;
        if (b.id === 1) midAng = Math.PI * 1.75; // specific fix

        let px = b.cx + Math.cos(midAng) * (b.rOuter + b.rInner) / 2;
        let py = b.cy + Math.sin(midAng) * (b.rOuter + b.rInner) / 2;
        this._spawnParticles(px, py, b.color, 15);

        if (window.gameManager) window.gameManager.shakeScreen(0.05);
    }

    _spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 1, decay: 2 + Math.random(),
                size: Math.random() * 4 + 2, color
            });
        }
    }

    update(dt) {
        if (this.gameOver) return;

        if (this.state === 'showing') {
            this.animTimer -= dt;
            if (this.animTimer <= 0) {
                if (this.activeLitIndex !== -1) {
                    // Finished showing a light, wait before next
                    this.activeLitIndex = -1;
                    this.animTimer = 0.2; // gap between lights
                } else {
                    if (this.showIndex < this.sequence.length) {
                        this._lightButton(this.sequence[this.showIndex]);
                        this.showIndex++;
                        this.animTimer = 0.6; // Light duration
                    } else {
                        this.state = 'waiting';
                    }
                }
            }
        } else if (this.state === 'waiting' || this.state === 'idle') {
            if (this.animTimer > 0) {
                this.animTimer -= dt;
                if (this.animTimer <= 0) this.activeLitIndex = -1; // Turn off player tap light
            }
        }

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
        if (this._clickHandler) { this.canvas.removeEventListener('mousedown', this._clickHandler); this._clickHandler = null; }
        if (window.gameManager) {
            window.gameManager.shakeScreen(1.0);
            window.gameManager.checkAndUpdateHighScore('simon', this.score);
        }
        if (window.soundManager) window.soundManager.playDeath();
        setTimeout(() => this._showGameOverOverlay(), 800);
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        let hs = 0; if (window.gameManager) hs = window.gameManager.getHighScore('simon');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Yanlış Tuş! ❌</div>
            <div class="game-over-score">Seviye: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 YENİ REKOR!</div>' : `<div class="game-over-highscore">🏆 Rekor: ${hs}</div>`}
            <button class="game-over-btn" id="smn-restart">↻ Tekrar Oyna</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#smn-restart').addEventListener('click', () => {
            if (window.gameManager) window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Center console
        ctx.fillStyle = '#111115';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, this.buttons[0].rOuter + 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Buttons
        const gap = 0.05; // gap in radians

        this.buttons.forEach(b => {
            let isLit = this.activeLitIndex === b.id;

            ctx.fillStyle = isLit ? '#ffffff' : b.color;
            ctx.shadowColor = b.color;
            ctx.shadowBlur = isLit ? 40 : 10;

            // Draw arc path
            ctx.beginPath();
            ctx.arc(b.cx, b.cy, b.rOuter, b.sAng + gap, (b.eAng === 0 ? Math.PI * 2 : b.eAng) - gap, false);
            ctx.arc(b.cx, b.cy, b.rInner, (b.eAng === 0 ? Math.PI * 2 : b.eAng) - gap, b.sAng + gap, true);
            ctx.closePath();

            ctx.globalAlpha = isLit ? 1 : 0.6;
            ctx.fill();

            // Stroke inner lines for premium look
            ctx.strokeStyle = 'rgba(255,255,255,0.4)';
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        });

        // Center piece
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, this.buttons[0].rInner - 10, 0, Math.PI * 2);
        ctx.fill();

        // Status Text in center
        ctx.fillStyle = '#00ddff';
        ctx.font = 'bold 36px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        if (this.gameOver) ctx.fillText('X', canvas.width / 2, canvas.height / 2);
        else ctx.fillText(this.score || '-', canvas.width / 2, canvas.height / 2);

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
    pause() { if (this._clickHandler) { this.canvas.removeEventListener('mousedown', this._clickHandler); this._clickHandler = null; } }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('simon', SimonGame, {
        name: 'Memotron',
        canvasWidth: 600,
        canvasHeight: 600
    });
}
