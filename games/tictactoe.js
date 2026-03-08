// Tic-Tac-Toe Game v2.0 - Premium Edition
class TicTacToeGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;

        this.board = Array(9).fill(null);
        this.cellSize = 120;
        this.padding = 10;
        this.offsetX = 0;
        this.offsetY = 0;

        this.playerTurn = true; // true=Player(X), false=AI(O)
        this.winLine = null;
        this.particles = [];
        this.animTimer = 0;

        this._clickHandler = null;
        this.gameTime = 0;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.board = Array(9).fill(null);
        this.playerTurn = true;
        this.winLine = null;
        this.particles = [];
        this.animTimer = 0;
        this.gameTime = 0;

        const totalSize = 3 * this.cellSize + 2 * this.padding;
        this.offsetX = (canvas.width - totalSize) / 2;
        this.offsetY = (canvas.height - totalSize) / 2;

        this._bindEvents();
    }

    _bindEvents() {
        if (this._clickHandler) this.canvas.removeEventListener('mousedown', this._clickHandler);
        this._clickHandler = (e) => {
            if (this.gameOver || !this.playerTurn) return;
            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;

            for (let i = 0; i < 9; i++) {
                let r = Math.floor(i / 3);
                let c = i % 3;
                let x = this.offsetX + c * (this.cellSize + this.padding);
                let y = this.offsetY + r * (this.cellSize + this.padding);

                if (mx > x && mx < x + this.cellSize && my > y && my < y + this.cellSize) {
                    if (this.board[i] === null) {
                        this._makeMove(i, 'X');
                        break;
                    }
                }
            }
        };
        this.canvas.addEventListener('mousedown', this._clickHandler);
    }

    _makeMove(index, symbol) {
        this.board[index] = symbol;
        this._spawnParticles(index, symbol === 'X' ? '#00dcff' : '#ff4466');

        if (this._checkWin()) return;
        if (this.board.every(cell => cell !== null)) {
            this._triggerGameOver('draw');
            return;
        }

        this.playerTurn = !this.playerTurn;
        if (!this.playerTurn) {
            setTimeout(() => this._aiMove(), 500); // Small AI delay
        }
    }

    _aiMove() {
        if (this.gameOver) return;
        // Simple random AI for now
        const available = [];
        this.board.forEach((val, i) => { if (val === null) available.push(i); });

        if (available.length > 0) {
            // Very basic winning logic or random
            let move = available[Math.floor(Math.random() * available.length)];
            this._makeMove(move, 'O');
        }
    }

    _checkWin() {
        const lines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
            [0, 4, 8], [2, 4, 6]           // diagonals
        ];

        for (let line of lines) {
            const [a, b, c] = line;
            if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                this.winLine = line;
                if (this.board[a] === 'X') {
                    this.score += 100;
                    if (this.gameTime < 10) {
                        window.gameManager.unlockAchievement('triple_threat', 'Üçlü Tehdit', 'Tic-Tac-Toe\'yu 10 saniyenin altında kazandın.', '🔥', true);
                    }
                    this._triggerGameOver('win');
                } else {
                    this._triggerGameOver('lose');
                }
                return true;
            }
        }
        return false;
    }

    _spawnParticles(index, color) {
        let r = Math.floor(index / 3);
        let c = index % 3;
        let px = this.offsetX + c * (this.cellSize + this.padding) + this.cellSize / 2;
        let py = this.offsetY + r * (this.cellSize + this.padding) + this.cellSize / 2;

        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: px, y: py,
                vx: (Math.random() - 0.5) * 300,
                vy: (Math.random() - 0.5) * 300,
                life: 1, decay: 2 + Math.random(),
                size: Math.random() * 4 + 2, color
            });
        }
        if (window.gameManager) window.gameManager.shakeScreen(0.1);
    }

    update(dt) {
        if (this.gameOver) return;
        this.gameTime += dt;
        this.animTimer += dt;

        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vx *= 0.95; // friction
            p.vy *= 0.95;
            p.life -= p.decay * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    _triggerGameOver(result) {
        this.gameOver = true;
        if (window.soundManager) window.soundManager.playDeath();
        if (this._clickHandler) { this.canvas.removeEventListener('mousedown', this._clickHandler); this._clickHandler = null; }
        if (window.gameManager) {
            window.gameManager.shakeScreen(result === 'win' ? 0.5 : 1.0);
            if (result === 'win') window.gameManager.checkAndUpdateHighScore('tictactoe', this.score);
        }

        let title = result === 'win' ? 'Kazandın! 🎉' : (result === 'lose' ? 'Kaybettin 💀' : 'Berabere 🤝');

        setTimeout(() => {
            const container = document.querySelector('.game-canvas-container');
            if (!container) return;
            const overlay = document.createElement('div');
            overlay.className = 'game-over-overlay';
            overlay.innerHTML = `
                <div class="game-over-title">${title}</div>
                <div class="game-over-score">Skor: ${this.score}</div>
                <button class="game-over-btn" id="ttt-restart">↻ Tekrar Oyna</button>
            `;
            container.appendChild(overlay);
            overlay.querySelector('#ttt-restart').addEventListener('click', () => {
                if (window.gameManager) window.gameManager.resetCurrentGame();
            });
        }, 1000); // Wait for anim
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#060610';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        for (let i = 0; i < 9; i++) {
            let r = Math.floor(i / 3);
            let c = i % 3;
            let x = this.offsetX + c * (this.cellSize + this.padding);
            let y = this.offsetY + r * (this.cellSize + this.padding);

            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            ctx.beginPath();
            ctx.roundRect(x, y, this.cellSize, this.cellSize, 12);
            ctx.fill();

            if (this.board[i]) {
                const isWinCell = this.winLine && this.winLine.includes(i);
                ctx.font = '90px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                if (this.board[i] === 'X') {
                    ctx.fillStyle = isWinCell && Math.floor(this.animTimer * 10) % 2 === 0 ? '#ffffff' : '#00dcff';
                    ctx.shadowColor = '#00dcff';
                } else {
                    ctx.fillStyle = isWinCell && Math.floor(this.animTimer * 10) % 2 === 0 ? '#ffffff' : '#ff4466';
                    ctx.shadowColor = '#ff4466';
                }
                ctx.shadowBlur = isWinCell ? 20 : 10;
                ctx.fillText(this.board[i], x + this.cellSize / 2, y + this.cellSize / 2 + 5);
                ctx.shadowBlur = 0;
            }
        }

        // Draw lines
        ctx.strokeStyle = 'rgba(255,255,255,0.1)';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        // V lines
        ctx.moveTo(this.offsetX + this.cellSize + this.padding / 2, this.offsetY);
        ctx.lineTo(this.offsetX + this.cellSize + this.padding / 2, this.offsetY + 3 * this.cellSize + 2 * this.padding);
        ctx.moveTo(this.offsetX + 2 * this.cellSize + 1.5 * this.padding, this.offsetY);
        ctx.lineTo(this.offsetX + 2 * this.cellSize + 1.5 * this.padding, this.offsetY + 3 * this.cellSize + 2 * this.padding);
        // H lines
        ctx.moveTo(this.offsetX, this.offsetY + this.cellSize + this.padding / 2);
        ctx.lineTo(this.offsetX + 3 * this.cellSize + 2 * this.padding, this.offsetY + this.cellSize + this.padding / 2);
        ctx.moveTo(this.offsetX, this.offsetY + 2 * this.cellSize + 1.5 * this.padding);
        ctx.lineTo(this.offsetX + 3 * this.cellSize + 2 * this.padding, this.offsetY + 2 * this.cellSize + 1.5 * this.padding);
        ctx.stroke();

        // Win Line Strike
        if (this.winLine) {
            ctx.strokeStyle = this.board[this.winLine[0]] === 'X' ? '#00dcff' : '#ff4466';
            ctx.lineWidth = 10;
            ctx.shadowColor = ctx.strokeStyle;
            ctx.shadowBlur = 15;

            let p1r = Math.floor(this.winLine[0] / 3), p1c = this.winLine[0] % 3;
            let p2r = Math.floor(this.winLine[2] / 3), p2c = this.winLine[2] % 3;

            ctx.beginPath();
            ctx.moveTo(
                this.offsetX + p1c * (this.cellSize + this.padding) + this.cellSize / 2,
                this.offsetY + p1r * (this.cellSize + this.padding) + this.cellSize / 2
            );
            ctx.lineTo(
                this.offsetX + p2c * (this.cellSize + this.padding) + this.cellSize / 2,
                this.offsetY + p2r * (this.cellSize + this.padding) + this.cellSize / 2
            );
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        // Particles
        this.particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Status Text
        ctx.fillStyle = '#555577';
        ctx.font = '16px Inter, sans-serif';
        ctx.textAlign = 'center';
        if (!this.gameOver) {
            ctx.fillText(this.playerTurn ? 'Senin Sıran (X)' : 'Rakip Bekleniyor (O)...', canvas.width / 2, this.offsetY - 30);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { if (this._clickHandler) { this.canvas.removeEventListener('mousedown', this._clickHandler); this._clickHandler = null; } }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('tictactoe', TicTacToeGame, {
        name: 'Tic-Tac-Toe',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
