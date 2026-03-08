// Memory Match Game v2.0 - Premium Edition
class MemoryGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;

        this.cols = 6;
        this.rows = 4;
        this.cardW = 90;
        this.cardH = 100;
        this.padding = 15;
        this.offsetX = 0;
        this.offsetY = 0;

        this.cards = [];
        this.flipped = [];
        this.locked = false;
        this.matches = 0;
        this.particles = [];

        this._clickHandler = null;

        this.icons = ['💎', '🚀', '🔥', '⚡', '🌟', '🎮', '👾', '🌀', '🎧', '🏆', '🎯', '🧩'];
        this.gameTime = 0;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.matches = 0;
        this.particles = [];
        this.flipped = [];
        this.locked = false;
        this.gameTime = 0;

        let totalW = this.cols * this.cardW + (this.cols - 1) * this.padding;
        let totalH = this.rows * this.cardH + (this.rows - 1) * this.padding;
        this.offsetX = (canvas.width - totalW) / 2;
        this.offsetY = (canvas.height - totalH) / 2;

        let deck = [...this.icons, ...this.icons];
        deck.sort(() => Math.random() - 0.5); // Shuffle

        this.cards = [];
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.cards.push({
                    r, c,
                    x: this.offsetX + c * (this.cardW + this.padding),
                    y: this.offsetY + r * (this.cardH + this.padding),
                    icon: deck.pop(),
                    isFlipped: false,
                    isMatched: false,
                    anim: 0 // scale anim
                });
            }
        }

        this._bindEvents();
    }

    _bindEvents() {
        if (this._clickHandler) this.canvas.removeEventListener('mousedown', this._clickHandler);
        this._clickHandler = (e) => {
            if (this.gameOver || this.locked) return;
            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            for (let card of this.cards) {
                if (!card.isFlipped && !card.isMatched &&
                    mx >= card.x && mx <= card.x + this.cardW &&
                    my >= card.y && my <= card.y + this.cardH) {

                    card.isFlipped = true;
                    this.flipped.push(card);

                    if (this.flipped.length === 2) {
                        this.locked = true;
                        setTimeout(() => this._checkMatch(), 600);
                    }
                    break;
                }
            }
        };
        this.canvas.addEventListener('mousedown', this._clickHandler);
    }

    _checkMatch() {
        if (this.flipped[0].icon === this.flipped[1].icon) {
            // Match
            this.flipped.forEach(c => {
                c.isMatched = true;
                c.anim = 1; // Trigger match animation
                this._spawnParticles(c.x + this.cardW / 2, c.y + this.cardH / 2, '#00ff88', 15);
            });
            this.score += 50;
            this.matches++;
            if (window.gameManager) window.gameManager.shakeScreen(0.2);

            if (this.matches === this.icons.length) {
                this.score += 200; // Bonus
                this._triggerGameOver();
            }
        } else {
            // No match
            this.flipped.forEach(c => c.isFlipped = false);
            this.score = Math.max(0, this.score - 5);
        }

        this.flipped = [];
        this.locked = false;
    }

    _spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 150,
                vy: (Math.random() - 0.5) * 150,
                life: 1, decay: 2 + Math.random(),
                size: Math.random() * 3 + 2, color
            });
        }
    }

    update(dt) {
        if (this.gameOver) return;
        this.gameTime += dt;

        // Anim scale
        this.cards.forEach(c => {
            if (c.anim > 0) c.anim -= dt * 3;
            if (c.anim < 0) c.anim = 0;
        });

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
        if (window.soundManager) window.soundManager.playDeath();
        if (this._clickHandler) { this.canvas.removeEventListener('mousedown', this._clickHandler); this._clickHandler = null; }
        if (window.gameManager) {
            window.gameManager.shakeScreen(0.5);
            window.gameManager.checkAndUpdateHighScore('memory', this.score);
            if (this.gameTime < 30) {
                window.gameManager.unlockAchievement('memory_god', 'Hafıza Tanrısı', 'Memory Match\'i 30 saniyenin altında bitirdin.', '⚡', true);
            }
        }
        setTimeout(() => this._showGameOverOverlay(), 500);
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        let hs = 0; if (window.gameManager) hs = window.gameManager.getHighScore('memory');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Tamamlandı! 🧠</div>
            <div class="game-over-score">Skor: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 YENİ REKOR!</div>' : `<div class="game-over-highscore">🏆 Rekor: ${hs}</div>`}
            <button class="game-over-btn" id="mem-restart">↻ Tekrar Oyna</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#mem-restart').addEventListener('click', () => {
            if (window.gameManager) window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#060612';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cards
        this.cards.forEach(c => {
            if (c.isMatched && c.anim === 0) {
                // Dimmatched
                ctx.fillStyle = 'rgba(255,255,255,0.05)';
                ctx.beginPath();
                ctx.roundRect(c.x, c.y, this.cardW, this.cardH, 10);
                ctx.fill();
                return;
            }

            ctx.save();
            let scale = 1 + Math.sin(c.anim * Math.PI) * 0.2;
            ctx.translate(c.x + this.cardW / 2, c.y + this.cardH / 2);
            ctx.scale(scale, scale);
            ctx.translate(-(c.x + this.cardW / 2), -(c.y + this.cardH / 2));

            if (c.isFlipped) {
                ctx.fillStyle = c.isMatched ? '#00ff88' : '#222244';
                ctx.shadowColor = c.isMatched ? 'rgba(0,255,136,0.5)' : 'none';
                ctx.shadowBlur = c.isMatched ? 15 : 0;
            } else {
                ctx.fillStyle = '#111122';
                ctx.strokeStyle = '#333355';
                ctx.lineWidth = 2;
            }

            ctx.beginPath();
            ctx.roundRect(c.x, c.y, this.cardW, this.cardH, 12);
            ctx.fill();
            if (!c.isFlipped) ctx.stroke();
            ctx.shadowBlur = 0;

            if (c.isFlipped) {
                ctx.font = '40px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(c.icon, c.x + this.cardW / 2, c.y + this.cardH / 2 + 5);
            } else {
                // Card back pattern
                ctx.fillStyle = 'rgba(255,255,255,0.05)';
                ctx.fillText('⚡', c.x + this.cardW / 2, c.y + this.cardH / 2 + 5);
            }
            ctx.restore();
        });

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
    window.gameManager.registerGame('memory', MemoryGame, {
        name: 'Memory Match',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
