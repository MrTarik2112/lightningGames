// Hex Puzzle - Match hexagons
class HexPuzzle {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.hexSize = 35;
        this.grid = [];
        this.selected = null;
        this.matches = [];
        
        this.colors = ['#ff4466', '#00d4ff', '#00ff88', '#ffcc00', '#8855ff'];
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.selected = null;
        
        this._generateGrid();
        this._bindEvents();
    }

    _generateGrid() {
        this.grid = [];
        const rows = 7;
        const cols = 6;
        const startX = (this.canvas.width - cols * this.hexSize * 1.8) / 2;
        const startY = 100;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const offset = row % 2 === 0 ? 0 : this.hexSize * 0.9;
                this.grid.push({
                    row, col,
                    x: startX + col * this.hexSize * 1.8 + offset,
                    y: startY + row * this.hexSize * 1.6,
                    color: this.colors[Math.floor(Math.random() * this.colors.length)],
                    removing: false
                });
            }
        }
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.click = (e) => {
            if (this.gameOver) {
                this.init(this.canvas, this.ctx);
                return;
            }
            
            const rect = this.canvas.getBoundingClientRect();
            const mx = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const my = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            
            // Find clicked hex
            for (const hex of this.grid) {
                if (this._isPointInHex(mx, my, hex)) {
                    if (this.selected === hex) {
                        this.selected = null;
                    } else if (this.selected) {
                        // Check if adjacent
                        if (this._isAdjacent(this.selected, hex)) {
                            // Swap
                            const temp = this.selected.color;
                            this.selected.color = hex.color;
                            hex.color = temp;
                            this.selected = null;
                            
                            // Check matches
                            this._checkMatches();
                        } else {
                            this.selected = hex;
                        }
                    } else {
                        this.selected = hex;
                    }
                    if (window.soundManager) window.soundManager.playClick();
                    break;
                }
            }
        };
        
        this.canvas.addEventListener('click', this._handlers.click);
    }

    _unbindEvents() {
        this.canvas.removeEventListener('click', this._handlers.click);
    }

    _isPointInHex(px, py, hex) {
        const dx = Math.abs(px - hex.x);
        const dy = Math.abs(py - hex.y);
        return dx < this.hexSize * 0.9 && dy < this.hexSize * 0.8;
    }

    _isAdjacent(h1, h2) {
        const dr = Math.abs(h1.row - h2.row);
        const dc = Math.abs(h1.col - h2.col);
        return (dr === 1 && dc === 0) || (dr === 0 && dc === 1) || 
               (dr === 1 && dc === 1 && h1.row % 2 === h2.row % 2);
    }

    _checkMatches() {
        const matched = new Set();
        
        for (const hex of this.grid) {
            // Check horizontal
            const sameColor = this.grid.filter(h => h.row === hex.row && h.color === hex.color);
            if (sameColor.length >= 3) {
                sameColor.forEach(h => matched.add(h));
            }
            
            // Check vertical
            const sameCol = this.grid.filter(h => h.col === hex.col && h.color === hex.color);
            if (sameCol.length >= 3) {
                sameCol.forEach(h => matched.add(h));
            }
        }
        
        if (matched.size > 0) {
            this.score += matched.size * 10;
            if (window.soundManager) window.soundManager.playMatch();
            
            // Remove matched
            for (const hex of matched) {
                hex.color = null;
            }
            
            // Drop down
            setTimeout(() => this._dropDown(), 100);
        }
    }

    _dropDown() {
        const cols = Math.max(...this.grid.map(h => h.col)) + 1;
        const rows = Math.max(...this.grid.map(h => h.row)) + 1;
        
        for (let col = 0; col < cols; col++) {
            const colHex = this.grid.filter(h => h.col === col).sort((a, b) => b.row - a.row);
            let newRow = rows - 1;
            for (const hex of colHex) {
                if (hex.color) {
                    hex.row = newRow;
                    hex.y = 100 + newRow * this.hexSize * 1.6;
                    newRow--;
                }
            }
        }
        
        // Fill empty
        for (const hex of this.grid) {
            if (!hex.color) {
                hex.color = this.colors[Math.floor(Math.random() * this.colors.length)];
                hex.row = 0;
                hex.y = 100;
            }
        }
        
        // Recheck matches
        setTimeout(() => this._checkMatches(), 150);
    }

    update(dt) {}

    draw() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#080810';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw hexagons
        for (const hex of this.grid) {
            if (!hex.color) continue;
            
            this._drawHex(hex.x, hex.y, this.hexSize, hex.color);
            
            if (this.selected === hex) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                this._drawHex(hex.x, hex.y, this.hexSize + 3, '#fff');
            }
        }
        
        // UI
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('Score: ' + this.score, canvas.width / 2, 50);
        
        ctx.fillStyle = '#666';
        ctx.font = '14px Inter';
        ctx.fillText('Click to select, click adjacent to swap', canvas.width / 2, canvas.height - 20);
    }

    _drawHex(x, y, size, color) {
        const ctx = this.ctx;
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const px = x + size * Math.cos(angle);
            const py = y + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    getScore() { return this.score; }
    isGameOver() { return false; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('hexpuzzle', HexPuzzle, {
        name: 'Hex Puzzle',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
