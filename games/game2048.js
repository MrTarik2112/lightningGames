// 2048 Game v2.0 - Premium Edition
class Game2048 {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.size = 4;
        this.grid = [];
        this.cellSize = 105;
        this.padding = 10;
        this.boardSize = 0;
        this.offsetX = 0;
        this.offsetY = 0;
        this._keyHandler = null;
        this.particles = [];
        this.mergeAnimations = [];

        this.TILE_COLORS = {
            2: { bg: '#1e1e3a', text: '#c0c0e0', glow: 'none' },
            4: { bg: '#28284a', text: '#d0d0f0', glow: 'none' },
            8: { bg: '#ff8844', text: '#ffffff', glow: '0 0 15px rgba(255,136,68,0.3)' },
            16: { bg: '#ff6633', text: '#ffffff', glow: '0 0 15px rgba(255,102,51,0.3)' },
            32: { bg: '#ff4422', text: '#ffffff', glow: '0 0 20px rgba(255,68,34,0.3)' },
            64: { bg: '#ff2211', text: '#ffffff', glow: '0 0 20px rgba(255,34,17,0.4)' },
            128: { bg: '#ffcc00', text: '#1a1a2e', glow: '0 0 25px rgba(255,204,0,0.3)' },
            256: { bg: '#ffc200', text: '#1a1a2e', glow: '0 0 25px rgba(255,194,0,0.35)' },
            512: { bg: '#ffb800', text: '#1a1a2e', glow: '0 0 30px rgba(255,184,0,0.4)' },
            1024: { bg: '#ff9900', text: '#1a1a2e', glow: '0 0 35px rgba(255,153,0,0.4)' },
            2048: { bg: '#00ff88', text: '#1a1a2e', glow: '0 0 40px rgba(0,255,136,0.5)' },
            4096: { bg: '#00dcff', text: '#1a1a2e', glow: '0 0 40px rgba(0,220,255,0.5)' },
            8192: { bg: '#aa55ff', text: '#ffffff', glow: '0 0 40px rgba(170,85,255,0.5)' }
        };
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.particles = [];
        this.mergeAnimations = [];

        this.boardSize = this.size * this.cellSize + (this.size + 1) * this.padding;
        this.offsetX = Math.floor((canvas.width - this.boardSize) / 2);
        this.offsetY = Math.floor((canvas.height - this.boardSize) / 2);

        this.grid = [];
        for (let r = 0; r < this.size; r++) {
            this.grid.push(new Array(this.size).fill(0));
        }
        this.addRandomTile();
        this.addRandomTile();
        this._bindKeys();
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        this._keyHandler = (e) => {
            if (this.gameOver) return;
            let moved = false;
            switch (e.key) {
                case 'ArrowUp': case 'w': case 'W': moved = this.move('up'); e.preventDefault(); break;
                case 'ArrowDown': case 's': case 'S': moved = this.move('down'); e.preventDefault(); break;
                case 'ArrowLeft': case 'a': case 'A': moved = this.move('left'); e.preventDefault(); break;
                case 'ArrowRight': case 'd': case 'D': moved = this.move('right'); e.preventDefault(); break;
                default: return;
            }
            if (moved) {
                if (window.soundManager) window.soundManager.playMove();
                this.addRandomTile();
                if (!this.hasMovesLeft()) {
                    this._triggerGameOver();
                }
            }
        };
        document.addEventListener('keydown', this._keyHandler);
    }

    addRandomTile() {
        const empty = [];
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) empty.push({ r, c });
            }
        }
        if (empty.length === 0) return;
        const cell = empty[Math.floor(Math.random() * empty.length)];
        this.grid[cell.r][cell.c] = Math.random() < 0.9 ? 2 : 4;
    }

    move(dir) {
        let moved = false;

        const getLine = (i) => {
            let line = [];
            for (let j = 0; j < this.size; j++) {
                switch (dir) {
                    case 'left': line.push(this.grid[i][j]); break;
                    case 'right': line.push(this.grid[i][this.size - 1 - j]); break;
                    case 'up': line.push(this.grid[j][i]); break;
                    case 'down': line.push(this.grid[this.size - 1 - j][i]); break;
                }
            }
            return line;
        };

        const setLine = (i, line) => {
            for (let j = 0; j < this.size; j++) {
                let val = line[j];
                switch (dir) {
                    case 'left': this.grid[i][j] = val; break;
                    case 'right': this.grid[i][this.size - 1 - j] = val; break;
                    case 'up': this.grid[j][i] = val; break;
                    case 'down': this.grid[this.size - 1 - j][i] = val; break;
                }
            }
        };

        for (let i = 0; i < this.size; i++) {
            let line = getLine(i);
            let filtered = line.filter(v => v !== 0);

            let merged = [];
            let skip = false;
            for (let j = 0; j < filtered.length; j++) {
                if (skip) { skip = false; continue; }
                if (j + 1 < filtered.length && filtered[j] === filtered[j + 1]) {
                    const val = filtered[j] * 2;
                    merged.push(val);
                    this.score += val;

                    // Merge animation + particles
                    this._spawnMergeParticles(i, merged.length - 1, dir, val);
                    if (window.soundManager) window.soundManager.playMatch();

                    if (val === 2048 && !this.won) {
                        this.won = true;
                        window.gameManager.shakeScreen(1);
                    }
                    if (val === 4096) {
                        window.gameManager.unlockAchievement('master_2048', '2048 Master', 'Reached the 4096 tile.', '🌟', true);
                    }
                    skip = true;
                } else {
                    merged.push(filtered[j]);
                }
            }

            while (merged.length < this.size) merged.push(0);

            let orig = getLine(i);
            for (let j = 0; j < this.size; j++) {
                if (orig[j] !== merged[j]) moved = true;
            }

            setLine(i, merged);
        }

        return moved;
    }

    _spawnMergeParticles(lineIndex, pos, dir, value) {
        // Calculate the cell position
        let r, c;
        switch (dir) {
            case 'left': r = lineIndex; c = pos; break;
            case 'right': r = lineIndex; c = this.size - 1 - pos; break;
            case 'up': r = pos; c = lineIndex; break;
            case 'down': r = this.size - 1 - pos; c = lineIndex; break;
        }

        const x = this.offsetX + this.padding + c * (this.cellSize + this.padding) + this.cellSize / 2;
        const y = this.offsetY + this.padding + r * (this.cellSize + this.padding) + this.cellSize / 2;

        const colors = this.TILE_COLORS[value] || this.TILE_COLORS[2];
        const count = value >= 128 ? 12 : 6;

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 1,
                decay: 2 + Math.random(),
                size: Math.random() * 3 + 1.5,
                color: colors.bg
            });
        }

        this.mergeAnimations.push({ r, c, scale: 1.3, timer: 0.15 });
    }

    hasMovesLeft() {
        for (let r = 0; r < this.size; r++) {
            for (let c = 0; c < this.size; c++) {
                if (this.grid[r][c] === 0) return true;
                if (c + 1 < this.size && this.grid[r][c] === this.grid[r][c + 1]) return true;
                if (r + 1 < this.size && this.grid[r][c] === this.grid[r + 1][c]) return true;
            }
        }
        return false;
    }

    _triggerGameOver() {
        this.gameOver = true;
        if (window.soundManager) window.soundManager.playDeath();
        window.gameManager.checkAndUpdateHighScore('game2048', this.score);
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

        const hs = window.gameManager.getHighScore('game2048');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">${this.won ? 'You Won! 🎉' : 'Game Over!'}</div>
            <div class="game-over-score">Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="g2048-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#g2048-restart').addEventListener('click', () => {
            window.gameManager.resetCurrentGame();
        });
    }

    update(dt) {
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= p.decay * dt;
            p.vx *= 0.96;
            p.vy *= 0.96;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Update merge animations
        for (let i = this.mergeAnimations.length - 1; i >= 0; i--) {
            const a = this.mergeAnimations[i];
            a.timer -= dt;
            a.scale = 1 + (a.scale - 1) * Math.max(0, a.timer / 0.15);
            if (a.timer <= 0) this.mergeAnimations.splice(i, 1);
        }
    }

    draw() {
        const { ctx, canvas, cellSize, padding, offsetX, offsetY, size } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#060610';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Board background with glow
        ctx.fillStyle = '#0e0e22';
        ctx.shadowColor = 'rgba(0, 220, 255, 0.06)';
        ctx.shadowBlur = 40;
        ctx.beginPath();
        ctx.roundRect(offsetX, offsetY, this.boardSize, this.boardSize, 14);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw tiles
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                const x = offsetX + padding + c * (cellSize + padding);
                const y = offsetY + padding + r * (cellSize + padding);
                const val = this.grid[r][c];

                // Empty cell
                ctx.fillStyle = 'rgba(255,255,255,0.02)';
                ctx.beginPath();
                ctx.roundRect(x, y, cellSize, cellSize, 10);
                ctx.fill();

                if (val > 0) {
                    const colors = this.TILE_COLORS[val] || { bg: '#aa55ff', text: '#ffffff', glow: '0 0 30px rgba(170,85,255,0.3)' };

                    // Check for merge animation scale
                    const anim = this.mergeAnimations.find(a => a.r === r && a.c === c);
                    const scale = anim ? anim.scale : 1;

                    ctx.save();
                    if (scale !== 1) {
                        const cx = x + cellSize / 2;
                        const cy = y + cellSize / 2;
                        ctx.translate(cx, cy);
                        ctx.scale(scale, scale);
                        ctx.translate(-cx, -cy);
                    }

                    // Tile glow for high values
                    if (val >= 8) {
                        ctx.shadowColor = colors.bg;
                        ctx.shadowBlur = val >= 512 ? 20 : val >= 128 ? 14 : 8;
                    }

                    ctx.fillStyle = colors.bg;
                    ctx.beginPath();
                    ctx.roundRect(x, y, cellSize, cellSize, 10);
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    // Inner highlight
                    ctx.fillStyle = 'rgba(255,255,255,0.08)';
                    ctx.beginPath();
                    ctx.roundRect(x + 3, y + 3, cellSize - 6, cellSize / 3, [8, 8, 0, 0]);
                    ctx.fill();

                    // Text
                    ctx.fillStyle = colors.text;
                    const fontSize = val >= 1024 ? 24 : val >= 128 ? 28 : 34;
                    ctx.font = `900 ${fontSize}px Inter, sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(val, x + cellSize / 2, y + cellSize / 2 + 1);

                    ctx.restore();
                }
            }
        }

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

        // Control hints
        ctx.fillStyle = '#333355';
        ctx.font = '400 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Slide with ← ↑ → ↓', canvas.width / 2, offsetY + this.boardSize + 30);
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { if (this._keyHandler) { document.removeEventListener('keydown', this._keyHandler); this._keyHandler = null; } }
    resume() { this._bindKeys(); }
}

window.gameManager.registerGame('game2048', Game2048, {
    name: '2048',
    canvasWidth: 880,
    canvasHeight: 540
});
