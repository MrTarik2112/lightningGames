// Minesweeper Game v2.0 - Premium Edition
class MinesweeperGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.cols = 16;
        this.rows = 12;
        this.mineCount = 30;
        this.cellSize = 34;
        this.grid = [];
        this.offsetX = 0;
        this.offsetY = 0;
        this.firstClick = true;
        this._clickHandler = null;
        this._contextHandler = null;
        this.flagCount = 0;
        this.revealedCount = 0;
        this.timer = 0;
        this.timerRunning = false;
        this.hoverCell = { r: -1, c: -1 };
        this._moveHandler = null;
        this.revealAnimations = [];
        this.correctFlags = 0;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.firstClick = true;
        this.flagCount = 0;
        this.revealedCount = 0;
        this.timer = 0;
        this.timerRunning = false;
        this.hoverCell = { r: -1, c: -1 };
        this.revealAnimations = [];
        this.correctFlags = 0;

        const boardW = this.cols * this.cellSize;
        const boardH = this.rows * this.cellSize;
        this.offsetX = Math.floor((canvas.width - boardW) / 2);
        this.offsetY = Math.floor((canvas.height - boardH) / 2) + 10;

        this.grid = [];
        for (let r = 0; r < this.rows; r++) {
            this.grid.push([]);
            for (let c = 0; c < this.cols; c++) {
                this.grid[r].push({
                    mine: false,
                    revealed: false,
                    flagged: false,
                    adjacent: 0
                });
            }
        }

        this._bindEvents();
    }

    _placeMines(safeR, safeC) {
        let placed = 0;
        while (placed < this.mineCount) {
            const r = Math.floor(Math.random() * this.rows);
            const c = Math.floor(Math.random() * this.cols);
            if (Math.abs(r - safeR) <= 1 && Math.abs(c - safeC) <= 1) continue;
            if (this.grid[r][c].mine) continue;
            this.grid[r][c].mine = true;
            placed++;
        }

        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c].mine) continue;
                let count = 0;
                this._forNeighbors(r, c, (nr, nc) => {
                    if (this.grid[nr][nc].mine) count++;
                });
                this.grid[r][c].adjacent = count;
            }
        }
    }

    _forNeighbors(r, c, fn) {
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                    fn(nr, nc);
                }
            }
        }
    }

    _getCellFromMouse(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const c = Math.floor((mx - this.offsetX) / this.cellSize);
        const r = Math.floor((my - this.offsetY) / this.cellSize);
        if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return null;
        return { r, c };
    }

    _bindEvents() {
        if (this._clickHandler) this.canvas.removeEventListener('click', this._clickHandler);
        if (this._contextHandler) this.canvas.removeEventListener('contextmenu', this._contextHandler);
        if (this._moveHandler) this.canvas.removeEventListener('mousemove', this._moveHandler);

        this._clickHandler = (e) => {
            if (this.gameOver) return;
            const cell = this._getCellFromMouse(e);
            if (!cell) return;
            this._reveal(cell.r, cell.c);
        };

        this._contextHandler = (e) => {
            e.preventDefault();
            if (this.gameOver) return;
            const cell = this._getCellFromMouse(e);
            if (!cell) return;
            this._toggleFlag(cell.r, cell.c);
        };

        this._moveHandler = (e) => {
            const cell = this._getCellFromMouse(e);
            this.hoverCell = cell || { r: -1, c: -1 };
        };

        this.canvas.addEventListener('click', this._clickHandler);
        this.canvas.addEventListener('contextmenu', this._contextHandler);
        this.canvas.addEventListener('mousemove', this._moveHandler);
    }

    _reveal(r, c) {
        const cell = this.grid[r][c];
        if (cell.revealed || cell.flagged) return;

        if (this.firstClick) {
            this.firstClick = false;
            this.timerRunning = true;
            this._placeMines(r, c);
        }

        cell.revealed = true;
        this.revealedCount++;
        this.score = this.revealedCount;

        // Add reveal animation
        this.revealAnimations.push({ r, c, timer: 0.2, scale: 0 });
        if (window.soundManager) window.soundManager.playMove();

        if (cell.mine) {
            this._revealAllMines();
            this._triggerGameOver(false);
            return;
        }

        if (cell.adjacent === 0) {
            this._forNeighbors(r, c, (nr, nc) => {
                this._reveal(nr, nc);
            });
        }

        const totalSafe = this.rows * this.cols - this.mineCount;
        if (this.revealedCount >= totalSafe) {
            this.won = true;
            window.gameManager.unlockAchievement('minesweeper_win', 'Mine Expert', 'Cleared a challenging minefield.', '💣', false);
            if (window.soundManager) window.soundManager.playWin();
            this._triggerGameOver(true);
        }
    }

    _toggleFlag(r, c) {
        const cell = this.grid[r][c];
        if (cell.revealed) return;
        cell.flagged = !cell.flagged;
        this.flagCount += cell.flagged ? 1 : -1;
        if (window.soundManager) window.soundManager.playFlip();

        if (cell.flagged && cell.mine) {
            this.correctFlags++;
            if (this.correctFlags >= 20) {
                window.gameManager.unlockAchievement('safe_stepper', 'Safe Stepper', 'Marked 20 mines correctly in one go.', '🛡️', true);
            }
        } else if (!cell.flagged && cell.mine) {
            this.correctFlags--;
        }
    }

    _revealAllMines() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.grid[r][c].mine) {
                    this.grid[r][c].revealed = true;
                }
            }
        }
    }

    _triggerGameOver(won) {
        this.gameOver = true;
        this.won = won;
        this.timerRunning = false;
        window.gameManager.checkAndUpdateHighScore('minesweeper', this.score);

        if (!won) window.gameManager.shakeScreen(0.8);
        if (window.soundManager) window.soundManager[won ? 'playWin' : 'playExplosion']();

        if (this._clickHandler) { this.canvas.removeEventListener('click', this._clickHandler); this._clickHandler = null; }
        if (this._contextHandler) { this.canvas.removeEventListener('contextmenu', this._contextHandler); this._contextHandler = null; }
        if (this._moveHandler) { this.canvas.removeEventListener('mousemove', this._moveHandler); this._moveHandler = null; }

        setTimeout(() => this._showGameOverOverlay(), 400);
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        const existing = container.querySelector('.game-over-overlay');
        if (existing) existing.remove();

        const hs = window.gameManager.getHighScore('minesweeper');
        const isNew = this.score >= hs && this.score > 0;
        const timeStr = this._formatTime(this.timer);

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">${this.won ? 'You Won! 🎉' : 'Hit a Mine! 💥'}</div>
            <div class="game-over-score">Cells: ${this.revealedCount} • Time: ${timeStr}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="mine-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#mine-restart').addEventListener('click', () => {
            window.gameManager.resetCurrentGame();
        });
    }

    _formatTime(t) {
        const mins = Math.floor(t / 60);
        const secs = Math.floor(t % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    update(dt) {
        if (this.timerRunning) this.timer += dt;

        // Update reveal animations
        for (let i = this.revealAnimations.length - 1; i >= 0; i--) {
            const a = this.revealAnimations[i];
            a.timer -= dt;
            a.scale = Math.min(1, 1 - a.timer / 0.2);
            if (a.timer <= 0) this.revealAnimations.splice(i, 1);
        }
    }

    draw() {
        const { ctx, canvas, cellSize, offsetX, offsetY, cols, rows } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#060610';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const NUMBER_COLORS = [
            '', '#00dcff', '#00ff88', '#ff4466', '#aa55ff',
            '#ff8844', '#00ccaa', '#eeeeff', '#888888'
        ];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const cell = this.grid[r][c];
                const x = offsetX + c * cellSize;
                const y = offsetY + r * cellSize;
                const isHover = this.hoverCell.r === r && this.hoverCell.c === c;

                // Cell background
                if (cell.revealed) {
                    if (cell.mine) {
                        ctx.fillStyle = 'rgba(255, 68, 102, 0.15)';
                    } else {
                        ctx.fillStyle = 'rgba(255,255,255,0.03)';
                    }
                } else {
                    const base = (r + c) % 2 === 0 ? 28 : 24;
                    if (isHover && !this.gameOver) {
                        ctx.fillStyle = `rgba(40, 40, 80, 0.95)`;
                    } else {
                        ctx.fillStyle = `rgba(${base}, ${base}, ${base + 30}, 0.88)`;
                    }
                }

                ctx.beginPath();
                ctx.roundRect(x + 1, y + 1, cellSize - 2, cellSize - 2, 4);
                ctx.fill();

                // Unrevealed border + hover glow
                if (!cell.revealed) {
                    if (isHover && !this.gameOver) {
                        ctx.strokeStyle = 'rgba(0, 220, 255, 0.25)';
                        ctx.lineWidth = 1.5;
                        ctx.shadowColor = 'rgba(0, 220, 255, 0.15)';
                        ctx.shadowBlur = 8;
                    } else {
                        ctx.strokeStyle = 'rgba(255,255,255,0.05)';
                        ctx.lineWidth = 0.5;
                    }
                    ctx.stroke();
                    ctx.shadowBlur = 0;

                    // 3D effect for unrevealed
                    ctx.fillStyle = 'rgba(255,255,255,0.03)';
                    ctx.fillRect(x + 2, y + 2, cellSize - 4, 2);
                }

                if (cell.revealed) {
                    if (cell.mine) {
                        // Mine with glow
                        ctx.shadowColor = '#ff4466';
                        ctx.shadowBlur = 10;
                        ctx.font = `${cellSize * 0.5}px sans-serif`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('💣', x + cellSize / 2, y + cellSize / 2 + 1);
                        ctx.shadowBlur = 0;
                    } else if (cell.adjacent > 0) {
                        ctx.fillStyle = NUMBER_COLORS[cell.adjacent] || '#ffffff';
                        ctx.shadowColor = NUMBER_COLORS[cell.adjacent] || '#ffffff';
                        ctx.shadowBlur = 4;
                        ctx.font = `700 ${cellSize * 0.45}px JetBrains Mono, monospace`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(cell.adjacent, x + cellSize / 2, y + cellSize / 2 + 1);
                        ctx.shadowBlur = 0;
                    }
                } else if (cell.flagged) {
                    ctx.font = `${cellSize * 0.45}px sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🚩', x + cellSize / 2, y + cellSize / 2 + 1);
                }
            }
        }

        // Info bar - top
        const barY = offsetY - 30;

        // Mine counter
        ctx.fillStyle = '#ff4466';
        ctx.font = '700 14px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`💣 ${this.mineCount - this.flagCount}`, offsetX, barY);

        // Timer
        ctx.fillStyle = '#8888aa';
        ctx.textAlign = 'center';
        ctx.fillText(`⏱ ${this._formatTime(this.timer)}`, offsetX + cols * cellSize / 2, barY);

        // Flag hint
        ctx.fillStyle = '#555577';
        ctx.font = '500 11px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('Left click: Open • Right click: Flag', offsetX + cols * cellSize, barY);

        // Progress bar
        const totalSafe = this.rows * this.cols - this.mineCount;
        const progress = this.revealedCount / totalSafe;
        const barWidth = cols * cellSize;
        const barHeight = 3;
        const barX = offsetX;
        const barBottom = offsetY + rows * cellSize + 12;

        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.beginPath();
        ctx.roundRect(barX, barBottom, barWidth, barHeight, 2);
        ctx.fill();

        if (progress > 0) {
            const grad = ctx.createLinearGradient(barX, 0, barX + barWidth * progress, 0);
            grad.addColorStop(0, '#00dcff');
            grad.addColorStop(1, '#00ff88');
            ctx.fillStyle = grad;
            ctx.shadowColor = '#00dcff';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.roundRect(barX, barBottom, barWidth * progress, barHeight, 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Progress text
        ctx.fillStyle = '#555577';
        ctx.font = '400 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.round(progress * 100)}%`, offsetX + cols * cellSize / 2, barBottom + 14);
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }

    pause() {
        this.timerRunning = false;
        if (this._clickHandler) { this.canvas.removeEventListener('click', this._clickHandler); this._clickHandler = null; }
        if (this._contextHandler) { this.canvas.removeEventListener('contextmenu', this._contextHandler); this._contextHandler = null; }
        if (this._moveHandler) { this.canvas.removeEventListener('mousemove', this._moveHandler); this._moveHandler = null; }
    }

    resume() {
        if (!this.firstClick && !this.gameOver) this.timerRunning = true;
        this._bindEvents();
    }
}

window.gameManager.registerGame('minesweeper', MinesweeperGame, {
    name: 'Minesweeper',
    canvasWidth: 880,
    canvasHeight: 540
});
