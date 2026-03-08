// Rhythm Tap - Beat Timing Game
class RhythmTapGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        this._keyHandler = null;
        this._keyUpHandler = null;

        this.lanes = [
            { x: 200, key: 'a', color: '#ff5555', label: 'A' },
            { x: 360, key: 's', color: '#55ff55', label: 'S' },
            { x: 520, key: 'd', color: '#5555ff', label: 'D' },
            { x: 680, key: 'f', color: '#ffff55', label: 'F' }
        ];

        this.notes = [];
        this.combo = 0;
        this.maxCombo = 0;
        this.bpm = 100;
        this.beatInterval = 60 / 100;
        this.beatTimer = 0;
        this.lanePressed = [false, false, false, false];
        this.particles = [];
        this.hitFeedback = '';
        this.hitFeedbackTimer = 0;
        this.hitFeedbackColor = '#ffffff';

        this.targetY = 420;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.notes = [];
        this.combo = 0;
        this.maxCombo = 0;
        this.bpm = 100;
        this.beatInterval = 60 / 100;
        this.beatTimer = 0;
        this.lanePressed = [false, false, false, false];
        this.particles = [];
        this.hitFeedback = '';
        this.hitFeedbackTimer = 0;

        // Center lanes
        const totalWidth = this.lanes[this.lanes.length - 1].x - this.lanes[0].x;
        const offsetX = (canvas.width - totalWidth) / 2 - this.lanes[0].x + 160;
        this.lanes.forEach(l => l.x += offsetX);

        this._bindKeys();
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        if (this._keyUpHandler) document.removeEventListener('keyup', this._keyUpHandler);

        this._keyHandler = (e) => {
            if (this.gameOver) return;
            const keyIdx = this.lanes.findIndex(l => l.key === e.key.toLowerCase());
            if (keyIdx !== -1) {
                this.lanePressed[keyIdx] = true;
                this._checkHit(keyIdx);
            }
        };

        this._keyUpHandler = (e) => {
            const keyIdx = this.lanes.findIndex(l => l.key === e.key.toLowerCase());
            if (keyIdx !== -1) {
                this.lanePressed[keyIdx] = false;
            }
        };

        document.addEventListener('keydown', this._keyHandler);
        document.addEventListener('keyup', this._keyUpHandler);
    }

    _checkHit(laneIdx) {
        // Find closest note in lane
        let closestNote = null;
        let closestDist = Infinity;

        this.notes.forEach(n => {
            if (n.lane === laneIdx && !n.hit) {
                const dist = Math.abs(n.y - this.targetY);
                if (dist < closestDist) {
                    closestDist = dist;
                    closestNote = n;
                }
            }
        });

        if (closestNote && closestDist < 60) {
            let points = 0;
            closestNote.hit = true;

            if (closestDist < 15) {
                points = 100;
                this.hitFeedback = 'PERFECT!';
                this.hitFeedbackColor = '#ffff00';
                this._spawnParticles(this.lanes[laneIdx].x, this.targetY, this.lanes[laneIdx].color, 15);
                window.gameManager.shakeScreen(0.2);
            } else if (closestDist < 30) {
                points = 50;
                this.hitFeedback = 'GOOD!';
                this.hitFeedbackColor = '#55ff55';
                this._spawnParticles(this.lanes[laneIdx].x, this.targetY, this.lanes[laneIdx].color, 8);
            } else {
                points = 20;
                this.hitFeedback = 'OK';
                this.hitFeedbackColor = '#55aaff';
                this._spawnParticles(this.lanes[laneIdx].x, this.targetY, this.lanes[laneIdx].color, 5);
            }

            this.combo++;
            this.maxCombo = Math.max(this.maxCombo, this.combo);
            this.score += points * Math.max(1, Math.floor(this.combo / 10));
            this.hitFeedbackTimer = 0.5;

            if (window.soundManager) { window.soundManager.playTick(); window.soundManager.playScore(); }

            // Remove note
            const idx = this.notes.indexOf(closestNote);
            if (idx !== -1) this.notes.splice(idx, 1);
        }
    }

    _spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 300,
                vy: (Math.random() - 0.5) * 300,
                life: 1,
                decay: 2 + Math.random(),
                size: Math.random() * 5 + 2,
                color
            });
        }
    }

    spawnNote() {
        const laneIdx = Math.floor(Math.random() * this.lanes.length);
        this.notes.push({
            lane: laneIdx,
            y: -30,
            speed: 250 + this.bpm * 2,
            hit: false
        });
    }

    _triggerGameOver() {
        this.gameOver = true;
        if (window.soundManager) window.soundManager.playDeath();
        window.gameManager.checkAndUpdateHighScore('rhythmtap', this.score);
        this._removeListeners();
        this._showGameOverOverlay();
    }

    _removeListeners() {
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
        if (this._keyUpHandler) {
            document.removeEventListener('keyup', this._keyUpHandler);
            this._keyUpHandler = null;
        }
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        const existing = container.querySelector('.game-over-overlay');
        if (existing) existing.remove();

        const hs = window.gameManager.getHighScore('rhythmtap');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Game Over!</div>
            <div class="game-over-score">Max Combo: ${this.maxCombo} • Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="rhythmtap-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#rhythmtap-restart').addEventListener('click', () => {
            window.gameManager.resetCurrentGame();
        });
    }

    update(dt) {
        if (this.gameOver) return;

        // Spawn notes on beat
        this.beatTimer += dt;
        if (this.beatTimer >= this.beatInterval) {
            this.beatTimer = 0;
            if (Math.random() < 0.7) this.spawnNote();

            // Increase difficulty
            if (this.bpm < 160) {
                this.bpm += 0.5;
                this.beatInterval = 60 / this.bpm;
            }
        }

        // Update notes
        for (let i = this.notes.length - 1; i >= 0; i--) {
            const n = this.notes[i];
            n.y += n.speed * dt;

            // Miss
            if (n.y > this.canvas.height + 20 && !n.hit) {
                this.combo = 0;
                this.hitFeedback = 'MISS';
                this.hitFeedbackColor = '#ff4444';
                this.hitFeedbackTimer = 0.3;
                this.notes.splice(i, 1);
            }
        }

        // Update hit feedback
        if (this.hitFeedbackTimer > 0) {
            this.hitFeedbackTimer -= dt;
        }

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

        // Background
        ctx.fillStyle = '#0a0a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Beat line pulse
        const pulse = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;

        // Draw lanes
        this.lanes.forEach((lane, i) => {
            // Lane background
            ctx.fillStyle = this.lanePressed[i] ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)';
            ctx.fillRect(lane.x - 50, 0, 100, canvas.height);

            // Target circle
            ctx.strokeStyle = lane.color;
            ctx.lineWidth = 3;
            ctx.globalAlpha = pulse;
            ctx.beginPath();
            ctx.arc(lane.x, this.targetY, 30, 0, Math.PI * 2);
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Inner circle
            ctx.fillStyle = this.lanePressed[i] ? lane.color : 'transparent';
            ctx.beginPath();
            ctx.arc(lane.x, this.targetY, 15, 0, Math.PI * 2);
            ctx.fill();

            // Key label
            ctx.fillStyle = '#666';
            ctx.font = 'bold 18px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(lane.label, lane.x, this.targetY + 55);
        });

        // Draw notes
        this.notes.forEach(n => {
            const lane = this.lanes[n.lane];
            ctx.fillStyle = lane.color;
            ctx.shadowColor = lane.color;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(lane.x, n.y, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Inner circle
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(lane.x, n.y, 8, 0, Math.PI * 2);
            ctx.fill();
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

        // Hit feedback
        if (this.hitFeedback && this.hitFeedbackTimer > 0) {
            ctx.fillStyle = this.hitFeedbackColor;
            ctx.font = 'bold 32px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.globalAlpha = Math.min(1, this.hitFeedbackTimer * 2);
            ctx.fillText(this.hitFeedback, canvas.width/2, 320);
            ctx.globalAlpha = 1;
        }

        // Combo
        if (this.combo > 1) {
            ctx.fillStyle = '#ff55ff';
            ctx.font = 'bold 42px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(this.combo + 'x COMBO!', canvas.width/2, 120);
        }

        // Score and BPM
        ctx.fillStyle = '#ffffff';
        ctx.font = '500 20px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Score: ' + this.score, 20, 35);
        ctx.fillStyle = '#8888aa';
        ctx.font = '500 14px Inter, sans-serif';
        ctx.fillText('BPM: ' + Math.floor(this.bpm), 20, 55);

        // Title
        ctx.fillStyle = '#ff55ff';
        ctx.font = 'bold 26px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('RHYTHM TAP', canvas.width/2, 45);

        // Instructions
        ctx.fillStyle = '#555577';
        ctx.font = '400 12px Inter, sans-serif';
        ctx.fillText('Press A S D F when notes hit the circles!', canvas.width/2, canvas.height - 15);
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._removeListeners(); }
    resume() { this._bindKeys(); }
}

window.gameManager.registerGame('rhythmtap', RhythmTapGame, {
    name: 'Rhythm Tap',
    canvasWidth: 880,
    canvasHeight: 540
});
