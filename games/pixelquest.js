// Pixel Quest - Dungeon Adventure Game
class PixelQuestGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        this._keyHandler = null;
        this._keyUpHandler = null;

        this.TILE_SIZE = 30;
        this.MAP_WIDTH = 24;
        this.MAP_HEIGHT = 16;

        this.player = { x: 0, y: 0, size: 20, speed: 180, hp: 100, maxHp: 100 };
        this.enemies = [];
        this.coins = [];
        this.particles = [];
        this.keys = {};
        this.level = 1;
        this.map = [];
        this.offsetX = 0;
        this.offsetY = 0;
        this.attackCooldown = 0;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.level = 1;
        this.keys = {};
        this.particles = [];
        this.attackCooldown = 0;

        // Center the map
        this.offsetX = Math.floor((canvas.width - this.MAP_WIDTH * this.TILE_SIZE) / 2);
        this.offsetY = Math.floor((canvas.height - this.MAP_HEIGHT * this.TILE_SIZE) / 2);

        this.generateMap();
        this.player.x = this.TILE_SIZE * 1.5;
        this.player.y = this.TILE_SIZE * 1.5;
        this.player.hp = this.player.maxHp;

        this.spawnEnemies(3);
        this.spawnCoins(5);

        this._bindKeys();
    }

    generateMap() {
        this.map = [];
        for (let y = 0; y < this.MAP_HEIGHT; y++) {
            this.map[y] = [];
            for (let x = 0; x < this.MAP_WIDTH; x++) {
                if (x === 0 || x === this.MAP_WIDTH - 1 || y === 0 || y === this.MAP_HEIGHT - 1) {
                    this.map[y][x] = 1;
                } else if (Math.random() < 0.12) {
                    this.map[y][x] = 1;
                } else {
                    this.map[y][x] = 0;
                }
            }
        }
        // Clear spawn area
        this.map[1][1] = 0;
        this.map[1][2] = 0;
        this.map[2][1] = 0;
    }

    spawnEnemies(count) {
        for (let i = 0; i < count; i++) {
            let ex, ey;
            let attempts = 0;
            do {
                ex = Math.floor(Math.random() * (this.MAP_WIDTH - 2)) + 1;
                ey = Math.floor(Math.random() * (this.MAP_HEIGHT - 2)) + 1;
                attempts++;
            } while ((this.map[ey][ex] === 1 || Math.abs(ex * this.TILE_SIZE - this.player.x) < 120) && attempts < 50);

            this.enemies.push({
                x: ex * this.TILE_SIZE + this.TILE_SIZE/2,
                y: ey * this.TILE_SIZE + this.TILE_SIZE/2,
                size: 15,
                speed: 60 + Math.random() * 40 + this.level * 10,
                hp: 2 + Math.floor(this.level / 2),
                maxHp: 2 + Math.floor(this.level / 2)
            });
        }
    }

    spawnCoins(count) {
        for (let i = 0; i < count; i++) {
            let cx, cy;
            let attempts = 0;
            do {
                cx = Math.floor(Math.random() * (this.MAP_WIDTH - 2)) + 1;
                cy = Math.floor(Math.random() * (this.MAP_HEIGHT - 2)) + 1;
                attempts++;
            } while (this.map[cy][cx] === 1 && attempts < 50);

            this.coins.push({
                x: cx * this.TILE_SIZE + this.TILE_SIZE/2,
                y: cy * this.TILE_SIZE + this.TILE_SIZE/2,
                size: 8,
                collected: false,
                pulse: Math.random() * Math.PI * 2
            });
        }
    }

    canMove(x, y, size) {
        const tx1 = Math.floor((x - size/2) / this.TILE_SIZE);
        const ty1 = Math.floor((y - size/2) / this.TILE_SIZE);
        const tx2 = Math.floor((x + size/2) / this.TILE_SIZE);
        const ty2 = Math.floor((y + size/2) / this.TILE_SIZE);

        if (tx1 < 0 || tx2 >= this.MAP_WIDTH || ty1 < 0 || ty2 >= this.MAP_HEIGHT) return false;

        return this.map[ty1][tx1] === 0 && this.map[ty1][tx2] === 0 &&
               this.map[ty2][tx1] === 0 && this.map[ty2][tx2] === 0;
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        if (this._keyUpHandler) document.removeEventListener('keyup', this._keyUpHandler);

        this._keyHandler = (e) => {
            if (this.gameOver) return;
            this.keys[e.key] = true;
        };

        this._keyUpHandler = (e) => {
            this.keys[e.key] = false;
        };

        document.addEventListener('keydown', this._keyHandler);
        document.addEventListener('keyup', this._keyUpHandler);
    }

    _spawnParticles(x, y, color, count = 6) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 150,
                vy: (Math.random() - 0.5) * 150,
                life: 1,
                decay: 1.5 + Math.random(),
                size: Math.random() * 4 + 2,
                color
            });
        }
    }

    _triggerGameOver() {
        this.gameOver = true;
        window.gameManager.shakeScreen(1);
        if (window.soundManager) window.soundManager.playDeath();
        window.gameManager.checkAndUpdateHighScore('pixelquest', this.score);
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

        const hs = window.gameManager.getHighScore('pixelquest');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Game Over!</div>
            <div class="game-over-score">Level ${this.level} • Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="pixelquest-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#pixelquest-restart').addEventListener('click', () => {
            window.gameManager.resetCurrentGame();
        });
    }

    update(dt) {
        if (this.gameOver) return;

        // Attack cooldown
        if (this.attackCooldown > 0) this.attackCooldown -= dt;

        // Player movement
        let dx = 0, dy = 0;
        if (this.keys['ArrowUp'] || this.keys['w'] || this.keys['W']) dy = -this.player.speed * dt;
        if (this.keys['ArrowDown'] || this.keys['s'] || this.keys['S']) dy = this.player.speed * dt;
        if (this.keys['ArrowLeft'] || this.keys['a'] || this.keys['A']) dx = -this.player.speed * dt;
        if (this.keys['ArrowRight'] || this.keys['d'] || this.keys['D']) dx = this.player.speed * dt;

        if (this.canMove(this.player.x + dx, this.player.y, this.player.size)) this.player.x += dx;
        if (this.canMove(this.player.x, this.player.y + dy, this.player.size)) this.player.y += dy;

        // Collect coins
        this.coins.forEach(c => {
            if (!c.collected) {
                const dist = Math.hypot(this.player.x - c.x, this.player.y - c.y);
                if (dist < this.player.size/2 + c.size + 5) {
                    c.collected = true;
                    this.score += 50;
                    this._spawnParticles(c.x, c.y, '#ffd700', 8);
                    if (window.soundManager) window.soundManager.playScore();
                }
            }
            c.pulse += dt * 3;
        });

        // Check level complete
        const allCollected = this.coins.every(c => c.collected);
        if (allCollected && this.enemies.length === 0) {
            this.level++;
            this.score += 100 * this.level;
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + 25);
            this.generateMap();
            this.player.x = this.TILE_SIZE * 1.5;
            this.player.y = this.TILE_SIZE * 1.5;
            this.spawnEnemies(2 + this.level);
            this.spawnCoins(5);
            window.gameManager.shakeScreen(0.5);
        }

        // Attack with space
        if (this.keys[' '] && this.attackCooldown <= 0) {
            this.attackCooldown = 0.3;
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const e = this.enemies[i];
                const dist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
                if (dist < 60) {
                    e.hp--;
                    this._spawnParticles(e.x, e.y, '#ff4444', 5);
                    if (e.hp <= 0) {
                        this.score += 25 * this.level;
                        this._spawnParticles(e.x, e.y, '#ff4444', 12);
                        this.enemies.splice(i, 1);
                        if (window.soundManager) window.soundManager.playScore();
                    }
                }
            }
        }

        // Move enemies
        this.enemies.forEach(e => {
            const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
            let ex = Math.cos(angle) * e.speed * dt;
            let ey = Math.sin(angle) * e.speed * dt;

            if (this.canMove(e.x + ex, e.y, e.size)) e.x += ex;
            if (this.canMove(e.x, e.y + ey, e.size)) e.y += ey;

            // Damage player
            const dist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
            if (dist < this.player.size/2 + e.size/2) {
                this.player.hp -= 30 * dt;
                if (this.player.hp <= 0) {
                    this._spawnParticles(this.player.x, this.player.y, '#44ff44', 20);
                    this._triggerGameOver();
                }
            }
        });

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
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw map
        for (let y = 0; y < this.MAP_HEIGHT; y++) {
            for (let x = 0; x < this.MAP_WIDTH; x++) {
                const px = this.offsetX + x * this.TILE_SIZE;
                const py = this.offsetY + y * this.TILE_SIZE;
                if (this.map[y][x] === 1) {
                    ctx.fillStyle = '#4a4a6a';
                    ctx.fillRect(px, py, this.TILE_SIZE, this.TILE_SIZE);
                    ctx.strokeStyle = '#2a2a4a';
                    ctx.strokeRect(px, py, this.TILE_SIZE, this.TILE_SIZE);
                } else {
                    ctx.fillStyle = ((x + y) % 2 === 0) ? '#252538' : '#2a2a40';
                    ctx.fillRect(px, py, this.TILE_SIZE, this.TILE_SIZE);
                }
            }
        }

        // Draw coins
        this.coins.forEach(c => {
            if (!c.collected) {
                const pulse = Math.sin(c.pulse) * 2;
                ctx.fillStyle = '#ffd700';
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 10 + pulse;
                ctx.beginPath();
                ctx.arc(this.offsetX + c.x, this.offsetY + c.y, c.size + pulse/2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });

        // Draw enemies
        this.enemies.forEach(e => {
            ctx.fillStyle = '#ff4444';
            ctx.shadowColor = '#ff4444';
            ctx.shadowBlur = 8;
            ctx.fillRect(this.offsetX + e.x - e.size/2, this.offsetY + e.y - e.size/2, e.size, e.size);
            ctx.shadowBlur = 0;

            // HP bar
            if (e.hp < e.maxHp) {
                ctx.fillStyle = '#333';
                ctx.fillRect(this.offsetX + e.x - 10, this.offsetY + e.y - e.size/2 - 8, 20, 4);
                ctx.fillStyle = '#ff4444';
                ctx.fillRect(this.offsetX + e.x - 10, this.offsetY + e.y - e.size/2 - 8, 20 * (e.hp / e.maxHp), 4);
            }
        });

        // Draw player
        ctx.fillStyle = '#44ff44';
        ctx.shadowColor = '#44ff44';
        ctx.shadowBlur = 15;
        ctx.fillRect(this.offsetX + this.player.x - this.player.size/2, this.offsetY + this.player.y - this.player.size/2, this.player.size, this.player.size);
        ctx.shadowBlur = 0;

        // Attack indicator
        if (this.attackCooldown > 0) {
            ctx.strokeStyle = 'rgba(68, 255, 68, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(this.offsetX + this.player.x, this.offsetY + this.player.y, 60, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Particles
        this.particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(this.offsetX + p.x, this.offsetY + p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Draw HP bar
        const hpBarX = 20;
        const hpBarY = 20;
        ctx.fillStyle = '#333';
        ctx.fillRect(hpBarX, hpBarY, 120, 18);
        ctx.fillStyle = this.player.hp > 30 ? '#44ff44' : '#ff4444';
        ctx.fillRect(hpBarX, hpBarY, (this.player.hp / this.player.maxHp) * 120, 18);
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1;
        ctx.strokeRect(hpBarX, hpBarY, 120, 18);

        // Info
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 16px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Level: ${this.level}`, 20, 55);
        ctx.fillText(`Score: ${this.score}`, 20, 75);
        ctx.fillText(`Coins: ${this.coins.filter(c => c.collected).length}/${this.coins.length}`, 20, 95);

        // Controls hint
        ctx.fillStyle = '#555577';
        ctx.font = '400 12px Inter, sans-serif';
        ctx.fillText('WASD/Arrows Move • SPACE Attack', 20, canvas.height - 15);
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._removeListeners(); }
    resume() { this._bindKeys(); }
}

window.gameManager.registerGame('pixelquest', PixelQuestGame, {
    name: 'Pixel Quest',
    canvasWidth: 880,
    canvasHeight: 540
});
