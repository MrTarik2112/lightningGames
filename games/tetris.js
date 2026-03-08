// Tetris Game v2.0 - Premium Edition
class TetrisGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        this.cols = 10;
        this.rows = 20;
        this.cellSize = 26;
        this.board = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.dropTimer = 0;
        this.dropInterval = 0.5;
        this.level = 1;
        this.linesCleared = 0;
        this._keyHandler = null;
        this.offsetX = 0;
        this.offsetY = 0;
        this.particles = [];
        this.flashRows = [];
        this.flashTimer = 0;
        this.textParticles = [];
        this.pulseTime = 0;
        this.combo = 0;

        this.PIECES = {
            I: { shape: [[1, 1, 1, 1]], color: '#00dcff' },
            O: { shape: [[1, 1], [1, 1]], color: '#ffcc00' },
            T: { shape: [[0, 1, 0], [1, 1, 1]], color: '#aa55ff' },
            S: { shape: [[0, 1, 1], [1, 1, 0]], color: '#00ff88' },
            Z: { shape: [[1, 1, 0], [0, 1, 1]], color: '#ff4466' },
            J: { shape: [[1, 0, 0], [1, 1, 1]], color: '#4488ff' },
            L: { shape: [[0, 0, 1], [1, 1, 1]], color: '#ff8844' }
        };
        this.PIECE_KEYS = Object.keys(this.PIECES);
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.level = 1;
        this.linesCleared = 0;
        this.dropInterval = 0.5;
        this.dropTimer = 0;
        this.particles = [];
        this.flashRows = [];
        this.flashTimer = 0;
        this.textParticles = [];
        this.pulseTime = 0;
        this.combo = 0;

        const boardWidth = this.cols * this.cellSize;
        const boardHeight = this.rows * this.cellSize;
        this.offsetX = Math.floor((canvas.width - boardWidth) / 2) - 40;
        this.offsetY = Math.floor((canvas.height - boardHeight) / 2);

        this.board = [];
        for (let r = 0; r < this.rows; r++) {
            this.board.push(new Array(this.cols).fill(null));
        }

        this.nextPiece = this._randomPiece();
        this.spawnPiece();
        this._bindKeys();
    }

    _randomPiece() {
        const key = this.PIECE_KEYS[Math.floor(Math.random() * this.PIECE_KEYS.length)];
        const piece = this.PIECES[key];
        return {
            shape: piece.shape.map(row => [...row]),
            color: piece.color,
            key
        };
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        this._keyHandler = (e) => {
            if (this.gameOver) return;
            switch (e.key) {
                case 'ArrowLeft': case 'a': case 'A':
                    this.movePiece(-1, 0); if (window.soundManager) window.soundManager.playMove(); e.preventDefault(); break;
                case 'ArrowRight': case 'd': case 'D':
                    this.movePiece(1, 0); if (window.soundManager) window.soundManager.playMove(); e.preventDefault(); break;
                case 'ArrowDown': case 's': case 'S':
                    this.movePiece(0, 1); this.score += 1; if (window.soundManager) window.soundManager.playTick(); e.preventDefault(); break;
                case 'ArrowUp': case 'w': case 'W':
                    this.rotatePiece(); if (window.soundManager) window.soundManager.playFlip(); e.preventDefault(); break;
                case ' ':
                    this.hardDrop(); e.preventDefault(); break;
            }
        };
        document.addEventListener('keydown', this._keyHandler);
    }

    spawnPiece() {
        this.currentPiece = {
            ...this.nextPiece,
            x: Math.floor((this.cols - this.nextPiece.shape[0].length) / 2),
            y: 0
        };
        this.nextPiece = this._randomPiece();

        if (this.collides(this.currentPiece.shape, this.currentPiece.x, this.currentPiece.y)) {
            this._triggerGameOver();
        }
    }

    collides(shape, px, py) {
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (!shape[r][c]) continue;
                const nx = px + c;
                const ny = py + r;
                if (nx < 0 || nx >= this.cols || ny >= this.rows) return true;
                if (ny >= 0 && this.board[ny][nx]) return true;
            }
        }
        return false;
    }

    movePiece(dx, dy) {
        if (!this.currentPiece) return false;
        const nx = this.currentPiece.x + dx;
        const ny = this.currentPiece.y + dy;
        if (!this.collides(this.currentPiece.shape, nx, ny)) {
            this.currentPiece.x = nx;
            this.currentPiece.y = ny;
            return true;
        }
        return false;
    }

    rotatePiece() {
        if (!this.currentPiece) return;
        const shape = this.currentPiece.shape;
        const rows = shape.length;
        const cols = shape[0].length;
        const rotated = [];
        for (let c = 0; c < cols; c++) {
            rotated.push([]);
            for (let r = rows - 1; r >= 0; r--) {
                rotated[c].push(shape[r][c]);
            }
        }
        // Wall kick attempts
        const kicks = [0, -1, 1, -2, 2];
        for (const kick of kicks) {
            if (!this.collides(rotated, this.currentPiece.x + kick, this.currentPiece.y)) {
                this.currentPiece.shape = rotated;
                this.currentPiece.x += kick;
                return;
            }
        }
    }

    hardDrop() {
        if (!this.currentPiece) return;
        let dropped = 0;
        const startY = this.currentPiece.y;
        while (this.movePiece(0, 1)) { dropped++; }

        // Hard drop vertical trail effect
        for (let r = 0; r <= dropped; r++) {
            this.currentPiece.shape.forEach((row, i) => {
                row.forEach((val, c) => {
                    if (val) {
                        this.particles.push({
                            x: this.offsetX + (this.currentPiece.x + c) * this.cellSize + this.cellSize / 2,
                            y: this.offsetY + (startY + r + i) * this.cellSize + this.cellSize / 2,
                            vx: 0,
                            vy: -100 - Math.random() * 100,
                            life: 0.5,
                            decay: 2,
                            size: Math.random() * 3 + 1,
                            color: this.currentPiece.color
                        });
                    }
                });
            });
        }

        this.score += dropped * 10; // Buffed reward
        window.gameManager.shakeScreen(0.4);

        if (dropped > 0) {
            this.textParticles.push({
                x: this.offsetX + (this.currentPiece.x + this.currentPiece.shape[0].length / 2) * this.cellSize,
                y: this.offsetY + this.currentPiece.y * this.cellSize,
                text: "SLAM!",
                color: '#fff',
                life: 1.0,
                size: 20
            });
        }

        this.lockPiece();
    }

    lockPiece() {
        const { shape, x, y, color } = this.currentPiece;
        for (let r = 0; r < shape.length; r++) {
            for (let c = 0; c < shape[r].length; c++) {
                if (!shape[r][c]) continue;
                const ny = y + r;
                if (ny < 0) continue;
                this.board[ny][x + c] = color;

                // Add lock spark particles
                for (let p = 0; p < 4; p++) {
                    this.particles.push({
                        x: this.offsetX + (x + c) * this.cellSize + this.cellSize / 2,
                        y: this.offsetY + ny * this.cellSize + this.cellSize / 2,
                        vx: (Math.random() - 0.5) * 150,
                        vy: (Math.random() - 0.5) * 150,
                        life: 1,
                        decay: 2.5 + Math.random(),
                        size: Math.random() * 3 + 1,
                        color: color
                    });
                }
            }
        }
        window.gameManager.shakeScreen(0.2); // Subtle shake on lock
        if (window.soundManager) window.soundManager.playPlace();
        this.clearLines();
        this.spawnPiece();
    }

    clearLines() {
        let cleared = 0;
        const rowsToClear = [];
        for (let r = this.rows - 1; r >= 0; r--) {
            if (this.board[r].every(cell => cell !== null)) {
                rowsToClear.push(r);
            }
        }

        cleared = rowsToClear.length;
        if (cleared > 0) {
            // Spawn particles for each cleared row - massive explosion
            rowsToClear.forEach(row => {
                for (let c = 0; c < this.cols; c++) {
                    const color = this.board[row][c];
                    for (let p = 0; p < 8; p++) {
                        this.particles.push({
                            x: this.offsetX + c * this.cellSize + this.cellSize / 2,
                            y: this.offsetY + row * this.cellSize + this.cellSize / 2,
                            vx: (Math.random() - 0.5) * 400,
                            vy: (Math.random() - 0.5) * 400,
                            life: 1,
                            decay: 0.8 + Math.random() * 0.5,
                            size: Math.random() * 6 + 2,
                            color: color || '#ffffff'
                        });
                    }
                }
            });

            // Flash effect
            this.flashRows = rowsToClear;
            this.flashTimer = 0.15;

            // Remove rows
            rowsToClear.sort((a, b) => b - a);
            rowsToClear.forEach(row => {
                this.board.splice(row, 1);
                this.board.unshift(new Array(this.cols).fill(null));
            });

            this.combo++;
            let comboMult = 1 + (this.combo - 1) * 0.5;

            const points = [0, 100, 300, 500, 800];
            let rawPoints = (points[cleared] || 800) * this.level;
            let earned = Math.floor(rawPoints * comboMult);
            this.score += earned;
            this.linesCleared += cleared;
            this.level = Math.floor(this.linesCleared / 10) + 1;
            this.dropInterval = Math.max(0.05, 0.5 - (this.level - 1) * 0.04);

            // Awesome text indicators
            let texts = ["", "SINGLE", "DOUBLE!", "TRIPLE!!", "TETRIS!!!"];
            let t = texts[cleared] || "MEGA CLEAR!";
            if (this.combo > 1) t += ` x${this.combo} COMBO`;

            this.textParticles.push({
                x: this.offsetX + (this.cols * this.cellSize) / 2,
                y: this.offsetY + rowsToClear[0] * this.cellSize,
                text: t,
                color: ['#0ff', '#f0f', '#0f0', '#ff0', '#f00'][Math.min(cleared, 4)],
                life: 1.5,
                size: 24 + cleared * 4
            });
            this.textParticles.push({
                x: this.offsetX + (this.cols * this.cellSize) / 2,
                y: this.offsetY + rowsToClear[0] * this.cellSize + 30,
                text: `+${earned}`,
                color: '#fff',
                life: 1.5,
                size: 20
            });

            if (this.score >= 500) {
                window.gameManager.unlockAchievement('tetris_500', 'Architect', 'Scored 500 points in Tetris.', '🧱', false);
            }
            if (this.score >= 1000) {
                window.gameManager.unlockAchievement('pentominium', 'Pentominium', 'Scored 1000 points in Tetris.', '🧱', true);
            }

            window.gameManager.shakeScreen(cleared >= 4 ? 1 : 0.3);
            if (window.soundManager) {
                window.soundManager.playLineClear();
                if (this.combo > 1) window.soundManager.playCombo(this.combo);
            }
        } else {
            this.combo = 0;
        }
    }

    _triggerGameOver() {
        this.gameOver = true;
        window.gameManager.shakeScreen(1);
        if (window.soundManager) window.soundManager.playDeath();
        window.gameManager.checkAndUpdateHighScore('tetris', this.score);
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

        const hs = window.gameManager.getHighScore('tetris');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Game Over!</div>
            <div class="game-over-score">Score: ${this.score} • Level: ${this.level}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="tetris-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#tetris-restart').addEventListener('click', () => {
            window.gameManager.resetCurrentGame();
        });
    }

    update(dt) {
        if (this.gameOver || !this.currentPiece) return;

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 400 * dt; // stronger gravity
            p.life -= p.decay * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Update text particles
        for (let i = this.textParticles.length - 1; i >= 0; i--) {
            const p = this.textParticles[i];
            p.y -= 40 * dt; // Float up
            p.life -= dt;
            if (p.life <= 0) this.textParticles.splice(i, 1);
        }

        this.pulseTime += dt * 5;

        // Flash timer
        if (this.flashTimer > 0) this.flashTimer -= dt;

        this.dropTimer += dt;
        if (this.dropTimer >= this.dropInterval) {
            this.dropTimer = 0;
            if (!this.movePiece(0, 1)) {
                this.lockPiece();
            }
        }
    }

    draw() {
        const { ctx, canvas, cellSize, offsetX, offsetY } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#060610';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Board glow with pulse
        const glowPulse = Math.sin(this.pulseTime) * 0.05;
        ctx.shadowColor = `rgba(0, 220, 255, ${0.15 + glowPulse})`;
        ctx.shadowBlur = 40;
        ctx.strokeStyle = `rgba(0, 220, 255, ${0.25 + glowPulse})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(offsetX - 2, offsetY - 2, this.cols * cellSize + 4, this.rows * cellSize + 4, 8);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.02)';
        ctx.lineWidth = 0.5;
        for (let c = 0; c <= this.cols; c++) {
            ctx.beginPath();
            ctx.moveTo(offsetX + c * cellSize, offsetY);
            ctx.lineTo(offsetX + c * cellSize, offsetY + this.rows * cellSize);
            ctx.stroke();
        }
        for (let r = 0; r <= this.rows; r++) {
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY + r * cellSize);
            ctx.lineTo(offsetX + this.cols * cellSize, offsetY + r * cellSize);
            ctx.stroke();
        }

        // Board cells
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c]) {
                    this._drawCell(c, r, this.board[r][c]);
                }
            }
        }

        // Flash effect on cleared rows
        if (this.flashTimer > 0) {
            const alpha = this.flashTimer / 0.15;
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
            this.flashRows.forEach(row => {
                ctx.fillRect(offsetX, offsetY + row * cellSize, this.cols * cellSize, cellSize);
            });
        }

        // Ghost piece
        if (this.currentPiece) {
            let ghostY = this.currentPiece.y;
            while (!this.collides(this.currentPiece.shape, this.currentPiece.x, ghostY + 1)) {
                ghostY++;
            }
            ctx.globalAlpha = 0.15;
            this.currentPiece.shape.forEach((row, r) => {
                row.forEach((val, c) => {
                    if (val) {
                        this._drawCell(this.currentPiece.x + c, ghostY + r, this.currentPiece.color);
                    }
                });
            });
            ctx.globalAlpha = 1.0;

            // Active piece
            this.currentPiece.shape.forEach((row, r) => {
                row.forEach((val, c) => {
                    if (val) {
                        this._drawCell(this.currentPiece.x + c, this.currentPiece.y + r, this.currentPiece.color, true);
                    }
                });
            });
        }

        // Next piece preview
        const previewX = offsetX + this.cols * cellSize + 30;
        const previewY = offsetY + 10;
        ctx.fillStyle = '#8888aa';
        ctx.font = '600 11px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('NEXT', previewX, previewY);

        // Preview box
        ctx.fillStyle = 'rgba(255,255,255,0.02)';
        ctx.beginPath();
        ctx.roundRect(previewX - 5, previewY + 8, 90, 65, 6);
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
        ctx.lineWidth = 1;
        ctx.stroke();

        if (this.nextPiece) {
            const previewCellSize = 18;
            const pw = this.nextPiece.shape[0].length * previewCellSize;
            const ph = this.nextPiece.shape.length * previewCellSize;
            const pox = previewX + (80 - pw) / 2;
            const poy = previewY + 18 + (50 - ph) / 2;

            this.nextPiece.shape.forEach((row, r) => {
                row.forEach((val, c) => {
                    if (val) {
                        ctx.fillStyle = this.nextPiece.color;
                        ctx.shadowColor = this.nextPiece.color;
                        ctx.shadowBlur = 4;
                        ctx.beginPath();
                        ctx.roundRect(pox + c * previewCellSize + 1, poy + r * previewCellSize + 1, previewCellSize - 2, previewCellSize - 2, 3);
                        ctx.fill();
                        ctx.shadowBlur = 0;
                    }
                });
            });
        }

        // Side info
        ctx.fillStyle = '#8888aa';
        ctx.font = '500 12px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`LEVEL  ${this.level}`, previewX, previewY + 100);
        ctx.fillText(`LINES   ${this.linesCleared}`, previewX, previewY + 122);

        // Control hints
        ctx.fillStyle = '#333355';
        ctx.font = '400 9px Inter, sans-serif';
        ctx.fillText('↑ Rotate', previewX, previewY + 180);
        ctx.fillText('← → Move', previewX, previewY + 196);
        ctx.fillText('↓ Soft Drop', previewX, previewY + 212);
        ctx.fillText('Space Hard Drop', previewX, previewY + 228);

        // Particles
        this.particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        });

        // Text particles
        this.textParticles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 15;
            ctx.font = `900 ${p.size}px Inter, sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(p.text, p.x, p.y);

            // Stroke for readability
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = '#fff';
            ctx.shadowBlur = 0;
            ctx.strokeText(p.text, p.x, p.y);
        });

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
    }

    _drawCell(cx, cy, color, isActive = false) {
        const { ctx, cellSize, offsetX, offsetY } = this;
        const x = offsetX + cx * cellSize;
        const y = offsetY + cy * cellSize;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = isActive ? 15 + Math.sin(this.pulseTime * 2) * 5 : 5;
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, cellSize - 2, cellSize - 2, 4);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Shiny Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(x + 3, y + 3, cellSize - 6, 2);

        // Deep Inner shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fillRect(x + 3, y + cellSize - 6, cellSize - 6, 4);
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { if (this._keyHandler) { document.removeEventListener('keydown', this._keyHandler); this._keyHandler = null; } }
    resume() { this._bindKeys(); }
}

window.gameManager.registerGame('tetris', TetrisGame, {
    name: 'Tetris',
    canvasWidth: 880,
    canvasHeight: 540
});
