// Jewel Match - Match-3 Puzzle Game
class JewelMatchGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;

        this.ROWS = 8;
        this.COLS = 8;
        this.TILE_SIZE = 55;

        this.JEWEL_COLORS = [
            '#ff5555', // Red
            '#55ff55', // Green
            '#5555ff', // Blue
            '#ffff55', // Yellow
            '#ff55ff', // Magenta
            '#55ffff'  // Cyan
        ];

        this.grid = [];
        this.selected = null;
        this.swapping = false;
        this.falling = false;
        this.fallDelay = 0;
        this.scorePopup = null;
        this.scorePopupTimer = 0;
        this.particles = [];

        this.offsetX = 0;
        this.offsetY = 0;

        this._clickHandler = null;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.selected = null;
        this.swapping = false;
        this.falling = false;
        this.scorePopup = null;
        this.particles = [];

        // Center the grid
        const gridWidth = this.COLS * this.TILE_SIZE;
        const gridHeight = this.ROWS * this.TILE_SIZE;
        this.offsetX = Math.floor((canvas.width - gridWidth) / 2);
        this.offsetY = Math.floor((canvas.height - gridHeight) / 2) - 20;

        this.initializeGrid();
        this._bindEvents();
    }

    initializeGrid() {
        this.grid = [];
        for (let r = 0; r < this.ROWS; r++) {
            this.grid[r] = [];
            for (let c = 0; c < this.COLS; c++) {
                let color;
                do {
                    color = Math.floor(Math.random() * this.JEWEL_COLORS.length);
                } while (this.wouldMatch(r, c, color));
                this.grid[r][c] = { color, x: c * this.TILE_SIZE, y: r * this.TILE_SIZE };
            }
        }

        // Clear initial matches
        while (this.findMatches().length > 0) {
            this.removeMatches(this.findMatches());
            this.fillEmpty();
        }
    }

    wouldMatch(r, c, color) {
        if (c >= 2 && this.grid[r] && this.grid[r][c-1] && this.grid[r][c-2] &&
            this.grid[r][c-1].color === color && this.grid[r][c-2].color === color) return true;
        if (r >= 2 && this.grid[r-1] && this.grid[r-2] &&
            this.grid[r-1][c] && this.grid[r-2][c] &&
            this.grid[r-1][c].color === color && this.grid[r-2][c].color === color) return true;
        return false;
    }

    findMatches() {
        let matched = [];

        // Horizontal matches
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS - 2; c++) {
                if (!this.grid[r][c]) continue;
                let color = this.grid[r][c].color;
                if (this.grid[r][c+1] && this.grid[r][c+2] &&
                    this.grid[r][c+1].color === color && this.grid[r][c+2].color === color) {
                    let match = [{r, c}, {r, c: c+1}, {r, c: c+2}];
                    let i = c + 3;
                    while (i < this.COLS && this.grid[r][i] && this.grid[r][i].color === color) {
                        match.push({r, c: i});
                        i++;
                    }
                    matched.push(...match);
                }
            }
        }

        // Vertical matches
        for (let c = 0; c < this.COLS; c++) {
            for (let r = 0; r < this.ROWS - 2; r++) {
                if (!this.grid[r][c]) continue;
                let color = this.grid[r][c].color;
                if (this.grid[r+1] && this.grid[r+2] &&
                    this.grid[r+1][c] && this.grid[r+2][c] &&
                    this.grid[r+1][c].color === color && this.grid[r+2][c].color === color) {
                    let match = [{r, c}, {r: r+1, c}, {r: r+2, c}];
                    let i = r + 3;
                    while (i < this.ROWS && this.grid[i][c] && this.grid[i][c].color === color) {
                        match.push({r: i, c});
                        i++;
                    }
                    matched.push(...match);
                }
            }
        }

        // Remove duplicates
        return matched.filter((m, i, a) => a.findIndex(x => x.r === m.r && x.c === m.c) === i);
    }

    removeMatches(matched) {
        let points = matched.length * 10;
        if (matched.length >= 4) points += 50;
        if (matched.length >= 5) points += 100;

        this.score += points;

        // Score popup
        const m = matched[matched.length - 1];
        this.scorePopup = { r: m.r, c: m.c, score: points };
        this.scorePopupTimer = 1;

        // Spawn particles
        matched.forEach(cell => {
            const jewel = this.grid[cell.r][cell.c];
            if (jewel) {
                this._spawnParticles(
                    this.offsetX + jewel.x + this.TILE_SIZE/2,
                    this.offsetY + jewel.y + this.TILE_SIZE/2,
                    this.JEWEL_COLORS[jewel.color],
                    5
                );
            }
            this.grid[cell.r][cell.c] = null;
        });

        if (window.soundManager) { window.soundManager.playMatch(); window.soundManager.playScore(); }
        window.gameManager.shakeScreen(matched.length >= 4 ? 0.5 : 0.2);
    }

    _spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200,
                life: 1,
                decay: 2 + Math.random(),
                size: Math.random() * 5 + 2,
                color
            });
        }
    }

    fillEmpty() {
        for (let c = 0; c < this.COLS; c++) {
            let empty = 0;
            for (let r = this.ROWS - 1; r >= 0; r--) {
                if (this.grid[r][c] === null) {
                    empty++;
                } else if (empty > 0) {
                    this.grid[r + empty][c] = this.grid[r][c];
                    this.grid[r + empty][c].targetY = (r + empty) * this.TILE_SIZE;
                    this.grid[r][c] = null;
                }
            }

            for (let r = 0; r < empty; r++) {
                this.grid[r][c] = {
                    color: Math.floor(Math.random() * this.JEWEL_COLORS.length),
                    x: c * this.TILE_SIZE,
                    y: -this.TILE_SIZE * (empty - r),
                    targetY: r * this.TILE_SIZE
                };
            }
        }
        this.falling = true;
    }

    _bindEvents() {
        if (this._clickHandler) {
            this.canvas.removeEventListener('click', this._clickHandler);
        }

        this._clickHandler = (e) => this.onClick(e);
        this.canvas.addEventListener('click', this._clickHandler);
    }

    onClick(e) {
        if (this.gameOver || this.falling) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) * (this.canvas.width / rect.width) - this.offsetX;
        const y = (e.clientY - rect.top) * (this.canvas.height / rect.height) - this.offsetY;

        const c = Math.floor(x / this.TILE_SIZE);
        const r = Math.floor(y / this.TILE_SIZE);

        if (r >= 0 && r < this.ROWS && c >= 0 && c < this.COLS && this.grid[r][c]) {
            if (!this.selected) {
                this.selected = { r, c };
            } else {
                const dr = Math.abs(this.selected.r - r);
                const dc = Math.abs(this.selected.c - c);

                if (dr + dc === 1) {
                    // Swap
                    const temp = this.grid[this.selected.r][this.selected.c];
                    this.grid[this.selected.r][this.selected.c] = this.grid[r][c];
                    this.grid[r][c] = temp;

                    // Check match
                    const matches = this.findMatches();
                    if (matches.length > 0) {
                        this.selected = null;
                        this.removeMatches(matches);
                        this.fillEmpty();
                    } else {
                        // Swap back
                        const temp2 = this.grid[this.selected.r][this.selected.c];
                        this.grid[this.selected.r][this.selected.c] = this.grid[r][c];
                        this.grid[r][c] = temp2;
                        this.selected = null;
                    }
                } else {
                    this.selected = { r, c };
                }
            }
        }
    }

    _removeListeners() {
        if (this._clickHandler) {
            this.canvas.removeEventListener('click', this._clickHandler);
            this._clickHandler = null;
        }
    }

    update(dt) {
        if (this.gameOver) return;

        // Animate falling
        if (this.falling) {
            let moving = false;
            for (let r = 0; r < this.ROWS; r++) {
                for (let c = 0; c < this.COLS; c++) {
                    if (this.grid[r][c]) {
                        const targetY = r * this.TILE_SIZE;
                        if (this.grid[r][c].y < targetY) {
                            this.grid[r][c].y += 400 * dt;
                            if (this.grid[r][c].y > targetY) this.grid[r][c].y = targetY;
                            moving = true;
                        }
                    }
                }
            }

            if (!moving) {
                this.falling = false;
                const matches = this.findMatches();
                if (matches.length > 0) {
                    this.removeMatches(matches);
                    this.fillEmpty();
                }
            }
        }

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= p.decay * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        if (this.scorePopupTimer > 0) {
            this.scorePopupTimer -= dt;
        }
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Title
        ctx.fillStyle = '#55aaff';
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('JEWEL MATCH', canvas.width/2, 40);

        // Background grid
        ctx.fillStyle = '#161b22';
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                if ((r + c) % 2 === 0) {
                    ctx.fillRect(this.offsetX + c * this.TILE_SIZE, this.offsetY + r * this.TILE_SIZE, this.TILE_SIZE, this.TILE_SIZE);
                }
            }
        }

        // Draw jewels
        for (let r = 0; r < this.ROWS; r++) {
            for (let c = 0; c < this.COLS; c++) {
                if (this.grid[r][c]) {
                    const j = this.grid[r][c];
                    const x = this.offsetX + j.x;
                    const y = this.offsetY + j.y;

                    // Selection highlight
                    if (this.selected && this.selected.r === r && this.selected.c === c) {
                        ctx.fillStyle = 'rgba(255,255,255,0.3)';
                        ctx.fillRect(x, y, this.TILE_SIZE, this.TILE_SIZE);
                    }

                    const cx = x + this.TILE_SIZE/2;
                    const cy = y + this.TILE_SIZE/2;

                    ctx.fillStyle = this.JEWEL_COLORS[j.color];
                    ctx.shadowColor = this.JEWEL_COLORS[j.color];
                    ctx.shadowBlur = 10;

                    // Different shapes based on color
                    ctx.beginPath();
                    if (j.color === 0) { // Red - Circle
                        ctx.arc(cx, cy, 20, 0, Math.PI * 2);
                    } else if (j.color === 1) { // Green - Square
                        ctx.roundRect(cx - 18, cy - 18, 36, 36, 4);
                    } else if (j.color === 2) { // Blue - Diamond
                        ctx.moveTo(cx, cy - 22);
                        ctx.lineTo(cx + 22, cy);
                        ctx.lineTo(cx, cy + 22);
                        ctx.lineTo(cx - 22, cy);
                    } else if (j.color === 3) { // Yellow - Triangle
                        ctx.moveTo(cx, cy - 20);
                        ctx.lineTo(cx + 20, cy + 15);
                        ctx.lineTo(cx - 20, cy + 15);
                    } else if (j.color === 4) { // Magenta - Hexagon
                        for (let i = 0; i < 6; i++) {
                            const angle = i * Math.PI / 3;
                            const px = cx + Math.cos(angle) * 20;
                            const py = cy + Math.sin(angle) * 20;
                            if (i === 0) ctx.moveTo(px, py);
                            else ctx.lineTo(px, py);
                        }
                    } else { // Cyan - Star
                        for (let i = 0; i < 5; i++) {
                            const angle = i * Math.PI * 2 / 5 - Math.PI/2;
                            const px = cx + Math.cos(angle) * 22;
                            const py = cy + Math.sin(angle) * 22;
                            if (i === 0) ctx.moveTo(px, py);
                            else ctx.lineTo(px, py);
                            const innerAngle = angle + Math.PI/5;
                            const ix = cx + Math.cos(innerAngle) * 9;
                            const iy = cy + Math.sin(innerAngle) * 9;
                            ctx.lineTo(ix, iy);
                        }
                    }
                    ctx.closePath();
                    ctx.fill();
                    ctx.shadowBlur = 0;

                    // Shine
                    ctx.fillStyle = 'rgba(255,255,255,0.4)';
                    ctx.beginPath();
                    ctx.arc(cx - 5, cy - 5, 6, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
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

        // Score popup
        if (this.scorePopup && this.scorePopupTimer > 0) {
            const sp = this.scorePopup;
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 24px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.globalAlpha = Math.min(1, this.scorePopupTimer);
            ctx.fillText('+' + sp.score, this.offsetX + sp.c * this.TILE_SIZE + this.TILE_SIZE/2, this.offsetY + sp.r * this.TILE_SIZE - 10);
            ctx.globalAlpha = 1;
        }

        // Score
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 20px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Score: ' + this.score, 20, 35);

        // Instructions
        ctx.fillStyle = '#555577';
        ctx.font = '400 12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Click adjacent jewels to swap and match 3+!', canvas.width/2, canvas.height - 15);
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._removeListeners(); }
    resume() { this._bindEvents(); }
}

window.gameManager.registerGame('jewels', JewelMatchGame, {
    name: 'Jewel Match',
    canvasWidth: 880,
    canvasHeight: 540
});
