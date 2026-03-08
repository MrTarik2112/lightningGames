// Whack-A-Mole Game v2.0 - Premium Edition
class WhackAMoleGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;

        this.holes = [];
        this.moles = [];
        this.particles = [];
        this.scoreTexts = [];

        this.cols = 4;
        this.rows = 3;
        this.holeRadius = 45;
        this.padding = 40;

        this.timeLeft = 30; // 30 seconds
        this.spawnTimer = 0;
        this.spawnRate = 1.0; // spawns per second

        this._clickHandler = null;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.timeLeft = 30;
        this.spawnTimer = 0;
        this.spawnRate = 0.8;

        this.holes = [];
        this.moles = [];
        this.particles = [];
        this.scoreTexts = [];

        // Setup holes
        const totalW = this.cols * this.holeRadius * 2 + (this.cols - 1) * this.padding;
        const totalH = this.rows * this.holeRadius * 2 + (this.rows - 1) * this.padding;
        const offsetX = (canvas.width - totalW) / 2 + this.holeRadius;
        const offsetY = (canvas.height - totalH) / 2 + this.holeRadius + 20;

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.holes.push({
                    x: offsetX + c * (this.holeRadius * 2 + this.padding),
                    y: offsetY + r * (this.holeRadius * 2 + this.padding),
                    activeMole: null
                });
            }
        }

        this._bindEvents();
    }

    _bindEvents() {
        if (this._clickHandler) this.canvas.removeEventListener('mousedown', this._clickHandler);
        this._clickHandler = (e) => {
            if (this.gameOver) return;
            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            for (let i = this.moles.length - 1; i >= 0; i--) {
                let m = this.moles[i];
                if (m.state !== 'hiding' && m.state !== 'whacked') {
                    // Check hit (simple radius check)
                    let dist = Math.sqrt(Math.pow(mx - m.hole.x, 2) + Math.pow(my - (m.hole.y - m.yOffset), 2));
                    if (dist < this.holeRadius) {
                        this._whackMole(m, i);
                        break; // Only hit one per click
                    }
                }
            }
        };
        this.canvas.addEventListener('mousedown', this._clickHandler);
    }

    _spawnMole() {
        // Find empty hole
        const emptyHoles = this.holes.filter(h => !h.activeMole);
        if (emptyHoles.length === 0) return;

        const hole = emptyHoles[Math.floor(Math.random() * emptyHoles.length)];
        const isGolden = Math.random() < 0.15; // 15% chance for bonus mole

        const newMole = {
            hole: hole,
            yOffset: 0,
            state: 'rising', // rising, idle, hiding, whacked
            timer: 0,
            type: isGolden ? 'golden' : 'normal',
            maxTime: isGolden ? 0.8 : 1.2 + Math.random() * 0.8 // Golden hide faster
        };

        hole.activeMole = newMole;
        this.moles.push(newMole);
    }

    _whackMole(m, index) {
        m.state = 'whacked';
        m.yOffset = -10; // Squish down

        let pts = m.type === 'golden' ? 50 : 10;
        this.score += pts;

        if (this.score >= 200) {
            window.gameManager.unlockAchievement('mole_slayer', 'Köstebek Katili', 'Whack-A-Mole\'da 200 puan yaptın.', '🔨', true);
        }

        this._spawnParticles(m.hole.x, m.hole.y - this.holeRadius, m.type === 'golden' ? '#ffdd00' : '#ff4466', 20);
        this.scoreTexts.push({ x: m.hole.x, y: m.hole.y - this.holeRadius, text: `+${pts}`, life: 1 });

        if (window.gameManager) window.gameManager.shakeScreen(m.type === 'golden' ? 0.3 : 0.1);
    }

    _spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 1) * 200, // mostly upwards
                life: 1, decay: 2 + Math.random(),
                size: Math.random() * 4 + 2, color
            });
        }
    }

    update(dt) {
        if (this.gameOver) return;

        this.timeLeft -= dt;
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this._triggerGameOver();
            return;
        }

        // Difficulty scaling
        this.spawnRate = Math.max(0.3, 0.8 - (30 - this.timeLeft) / 50);

        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
            this._spawnMole();
            this.spawnTimer = this.spawnRate;
        }

        // Update moles
        for (let i = this.moles.length - 1; i >= 0; i--) {
            let m = this.moles[i];

            if (m.state === 'rising') {
                m.yOffset += 200 * dt;
                if (m.yOffset > this.holeRadius * 1.2) {
                    m.yOffset = this.holeRadius * 1.2;
                    m.state = 'idle';
                }
            } else if (m.state === 'idle') {
                m.timer += dt;
                if (m.timer >= m.maxTime) {
                    m.state = 'hiding';
                }
            } else if (m.state === 'hiding') {
                m.yOffset -= 150 * dt;
                if (m.yOffset <= 0) {
                    m.hole.activeMole = null;
                    this.moles.splice(i, 1);
                }
            } else if (m.state === 'whacked') {
                m.timer += dt;
                if (m.timer > 0.2) {
                    m.hole.activeMole = null;
                    this.moles.splice(i, 1);
                }
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 400 * dt; // gravity
            p.life -= p.decay * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Update texts
        for (let i = this.scoreTexts.length - 1; i >= 0; i--) {
            let t = this.scoreTexts[i];
            t.y -= 50 * dt;
            t.life -= dt;
            if (t.life <= 0) this.scoreTexts.splice(i, 1);
        }
    }

    _triggerGameOver() {
        this.gameOver = true;
        if (window.soundManager) window.soundManager.playDeath();
        if (this._clickHandler) { this.canvas.removeEventListener('mousedown', this._clickHandler); this._clickHandler = null; }
        if (window.gameManager) {
            window.gameManager.shakeScreen(0.5);
            window.gameManager.checkAndUpdateHighScore('whackamole', this.score);
        }
        setTimeout(() => this._showGameOverOverlay(), 500);
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        let hs = 0; if (window.gameManager) hs = window.gameManager.getHighScore('whackamole');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Süre Bitti! ⏱️</div>
            <div class="game-over-score">Skor: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 YENİ REKOR!</div>' : `<div class="game-over-highscore">🏆 Rekor: ${hs}</div>`}
            <button class="game-over-btn" id="wam-restart">↻ Tekrar Oyna</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#wam-restart').addEventListener('click', () => {
            if (window.gameManager) window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // BG
        let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#0a1a0a');
        grad.addColorStop(1, '#050a05');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // UI
        ctx.fillStyle = '#ffffff';
        ctx.font = '24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`Kalan Süre: ${Math.ceil(this.timeLeft)}s`, canvas.width / 2, 40);

        // Draw Holes (Back)
        this.holes.forEach(h => {
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.ellipse(h.x, h.y, this.holeRadius, this.holeRadius * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw Moles (masked within hole ideally, but simple clipping or bottom ordering works)
        this.moles.forEach(m => {
            if (m.yOffset > 0 || m.state === 'whacked') {
                ctx.save();

                let mx = m.hole.x;
                let my = m.hole.y - m.yOffset;

                // Mole body
                ctx.fillStyle = m.type === 'golden' ? '#ffdd00' : '#ff4466';
                if (m.state === 'whacked') ctx.fillStyle = '#444455';

                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = 10;

                ctx.beginPath();
                ctx.roundRect(mx - this.holeRadius * 0.7, my, this.holeRadius * 1.4, m.yOffset + 10, [15, 15, 0, 0]);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Face
                if (m.state !== 'whacked') {
                    ctx.fillStyle = '#111';
                    ctx.beginPath(); ctx.arc(mx - 15, my + 15, 4, 0, Math.PI * 2); ctx.fill(); // L Eye
                    ctx.beginPath(); ctx.arc(mx + 15, my + 15, 4, 0, Math.PI * 2); ctx.fill(); // R Eye
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(mx - 8, my + 25, 16, 6); // Teeth
                } else {
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(mx - 20, my + 10); ctx.lineTo(mx - 10, my + 20); ctx.stroke(); // X
                    ctx.beginPath(); ctx.moveTo(mx - 10, my + 10); ctx.lineTo(mx - 20, my + 20); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(mx + 20, my + 10); ctx.lineTo(mx + 10, my + 20); ctx.stroke(); // X
                    ctx.beginPath(); ctx.moveTo(mx + 10, my + 10); ctx.lineTo(mx + 20, my + 20); ctx.stroke();
                }

                ctx.restore();
            }
        });

        // Draw Holes (Front Rim to hide bottom of mole)
        this.holes.forEach(h => {
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#00ff88';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.ellipse(h.x, h.y, this.holeRadius, this.holeRadius * 0.4, 0, Math.PI * 0.1, Math.PI * 0.9, false); // Just front half drawn thick
            ctx.stroke();
            ctx.shadowBlur = 0;
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

        // Score Texts
        ctx.font = 'bold 24px Arial';
        this.scoreTexts.forEach(t => {
            ctx.globalAlpha = Math.max(0, t.life);
            ctx.fillStyle = '#fff';
            ctx.fillText(t.text, t.x, t.y);
        });
        ctx.globalAlpha = 1;
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { if (this._clickHandler) { this.canvas.removeEventListener('mousedown', this._clickHandler); this._clickHandler = null; } }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('whackamole', WhackAMoleGame, {
        name: 'Whack-A-Mole',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
