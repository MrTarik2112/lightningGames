// Pixel Quest v2.0 - Enhanced Dungeon Adventure
class PixelQuestGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        this._keyHandler = null;
        this._keyUpHandler = null;

        this.TILE_SIZE = 32;
        this.MAP_WIDTH = 24;
        this.MAP_HEIGHT = 16;

        this.player = { 
            x: 0, y: 0, size: 22, speed: 200, 
            hp: 100, maxHp: 100,
            invulnerable: 0, flashTimer: 0,
            attackRange: 70, attackDamage: 35
        };
        this.enemies = [];
        this.coins = [];
        this.particles = [];
        this.healthPacks = [];
        this.keys = {};
        this.level = 1;
        this.map = [];
        this.offsetX = 0;
        this.offsetY = 0;
        this.attackCooldown = 0;
        this.attackAnimation = 0;
        this.enemiesKilled = 0;
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
        this.attackAnimation = 0;
        this.enemiesKilled = 0;

        // Center the map
        this.offsetX = Math.floor((canvas.width - this.MAP_WIDTH * this.TILE_SIZE) / 2);
        this.offsetY = Math.floor((canvas.height - this.MAP_HEIGHT * this.TILE_SIZE) / 2);

        this.generateMap();
        this.player.x = this.TILE_SIZE * 1.5;
        this.player.y = this.TILE_SIZE * 1.5;
        this.player.hp = this.player.maxHp;
        this.player.invulnerable = 0;
        this.player.flashTimer = 0;

        this.spawnEnemies(4 + this.level);
        this.spawnCoins(6);
        this.spawnHealthPacks(2);

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
            } while ((this.map[ey][ex] === 1 || Math.abs(ex * this.TILE_SIZE - this.player.x) < 150) && attempts < 50);

            const enemyType = Math.random();
            let type, speed, hp, size, color;
            
            if (enemyType < 0.6) {
                // Normal enemy
                type = 'normal';
                speed = 70 + Math.random() * 30 + this.level * 8;
                hp = 2 + Math.floor(this.level / 2);
                size = 16;
                color = '#ff4444';
            } else if (enemyType < 0.85) {
                // Fast enemy
                type = 'fast';
                speed = 120 + Math.random() * 40 + this.level * 10;
                hp = 1;
                size = 12;
                color = '#ff8844';
            } else {
                // Tank enemy
                type = 'tank';
                speed = 40 + Math.random() * 20 + this.level * 5;
                hp = 4 + Math.floor(this.level / 1.5);
                size = 20;
                color = '#8844ff';
            }

            this.enemies.push({
                x: ex * this.TILE_SIZE + this.TILE_SIZE/2,
                y: ey * this.TILE_SIZE + this.TILE_SIZE/2,
                size, speed, hp,
                maxHp: hp,
                type, color,
                stunned: 0
            });
        }
    }

    spawnHealthPacks(count) {
        for (let i = 0; i < count; i++) {
            let hx, hy;
            let attempts = 0;
            do {
                hx = Math.floor(Math.random() * (this.MAP_WIDTH - 2)) + 1;
                hy = Math.floor(Math.random() * (this.MAP_HEIGHT - 2)) + 1;
                attempts++;
            } while (this.map[hy][hx] === 1 && attempts < 50);

            this.healthPacks.push({
                x: hx * this.TILE_SIZE + this.TILE_SIZE/2,
                y: hy * this.TILE_SIZE + this.TILE_SIZE/2,
                size: 10,
                collected: false,
                pulse: Math.random() * Math.PI * 2
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

        // Update timers
        if (this.attackCooldown > 0) this.attackCooldown -= dt;
        if (this.attackAnimation > 0) this.attackAnimation -= dt;
        if (this.player.invulnerable > 0) {
            this.player.invulnerable -= dt;
            this.player.flashTimer += dt * 15;
        }

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
                if (dist < this.player.size/2 + c.size + 8) {
                    c.collected = true;
                    this.score += 50;
                    this._spawnParticles(c.x, c.y, '#ffd700', 10);
                    if (window.soundManager) window.soundManager.playScore();
                }
            }
            c.pulse += dt * 3;
        });

        // Collect health packs
        this.healthPacks.forEach(h => {
            if (!h.collected) {
                const dist = Math.hypot(this.player.x - h.x, this.player.y - h.y);
                if (dist < this.player.size/2 + h.size + 8) {
                    h.collected = true;
                    this.player.hp = Math.min(this.player.maxHp, this.player.hp + 30);
                    this._spawnParticles(h.x, h.y, '#44ff44', 12);
                    if (window.soundManager) window.soundManager.playPowerUp();
                }
            }
            h.pulse += dt * 4;
        });

        // Check level complete
        const allCollected = this.coins.every(c => c.collected);
        if (allCollected && this.enemies.length === 0) {
            this.level++;
            this.score += 150 * this.level;
            this.player.hp = Math.min(this.player.maxHp, this.player.hp + 35);
            this.generateMap();
            this.player.x = this.TILE_SIZE * 1.5;
            this.player.y = this.TILE_SIZE * 1.5;
            this.spawnEnemies(3 + this.level);
            this.spawnCoins(6);
            this.spawnHealthPacks(2);
            if (window.gameManager) window.gameManager.shakeScreen(0.5);
            if (window.soundManager) window.soundManager.playLevelUp();
        }

        // Attack with space
        if (this.keys[' '] && this.attackCooldown <= 0) {
            this.attackCooldown = 0.35;
            this.attackAnimation = 0.2;
            let hitEnemy = false;
            
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const e = this.enemies[i];
                const dist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
                if (dist < this.player.attackRange) {
                    e.hp -= this.player.attackDamage;
                    e.stunned = 0.3;
                    hitEnemy = true;
                    this._spawnParticles(e.x, e.y, e.color, 8);
                    
                    if (e.hp <= 0) {
                        const points = e.type === 'tank' ? 50 : e.type === 'fast' ? 20 : 30;
                        this.score += points * this.level;
                        this.enemiesKilled++;
                        this._spawnParticles(e.x, e.y, e.color, 20);
                        this.enemies.splice(i, 1);
                        if (window.soundManager) window.soundManager.playExplosion();
                    } else {
                        if (window.soundManager) window.soundManager.playHit();
                    }
                }
            }
            
            if (hitEnemy && window.gameManager) window.gameManager.shakeScreen(0.15);
        }

        // Move enemies
        this.enemies.forEach(e => {
            if (e.stunned > 0) {
                e.stunned -= dt;
                return;
            }
            
            const angle = Math.atan2(this.player.y - e.y, this.player.x - e.x);
            let ex = Math.cos(angle) * e.speed * dt;
            let ey = Math.sin(angle) * e.speed * dt;

            if (this.canMove(e.x + ex, e.y, e.size)) e.x += ex;
            if (this.canMove(e.x, e.y + ey, e.size)) e.y += ey;

            // Damage player
            if (this.player.invulnerable <= 0) {
                const dist = Math.hypot(this.player.x - e.x, this.player.y - e.y);
                if (dist < this.player.size/2 + e.size/2 + 2) {
                    const damage = e.type === 'tank' ? 25 : e.type === 'fast' ? 15 : 20;
                    this.player.hp -= damage;
                    this.player.invulnerable = 1.0;
                    this._spawnParticles(this.player.x, this.player.y, '#ff4444', 12);
                    if (window.gameManager) window.gameManager.shakeScreen(0.3);
                    if (window.soundManager) window.soundManager.playHit();
                    
                    if (this.player.hp <= 0) {
                        this._spawnParticles(this.player.x, this.player.y, '#44ff44', 30);
                        this._triggerGameOver();
                    }
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

        // Background gradient
        const gradient = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
        gradient.addColorStop(0, '#2a2a4e');
        gradient.addColorStop(1, '#1a1a2e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw map
        for (let y = 0; y < this.MAP_HEIGHT; y++) {
            for (let x = 0; x < this.MAP_WIDTH; x++) {
                const px = this.offsetX + x * this.TILE_SIZE;
                const py = this.offsetY + y * this.TILE_SIZE;
                
                if (this.map[y][x] === 1) {
                    // Wall
                    ctx.fillStyle = '#4a4a6a';
                    ctx.fillRect(px, py, this.TILE_SIZE, this.TILE_SIZE);
                    ctx.strokeStyle = '#3a3a5a';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(px, py, this.TILE_SIZE, this.TILE_SIZE);
                    
                    // Wall highlight
                    ctx.fillStyle = 'rgba(255,255,255,0.1)';
                    ctx.fillRect(px + 2, py + 2, this.TILE_SIZE - 4, 4);
                } else {
                    // Floor
                    ctx.fillStyle = ((x + y) % 2 === 0) ? '#252538' : '#2a2a40';
                    ctx.fillRect(px, py, this.TILE_SIZE, this.TILE_SIZE);
                }
            }
        }

        // Draw health packs
        this.healthPacks.forEach(h => {
            if (!h.collected) {
                const pulse = Math.sin(h.pulse) * 3;
                ctx.fillStyle = '#44ff44';
                ctx.shadowColor = '#44ff44';
                ctx.shadowBlur = 12 + pulse;
                ctx.beginPath();
                ctx.arc(this.offsetX + h.x, this.offsetY + h.y, h.size + pulse/2, 0, Math.PI * 2);
                ctx.fill();
                
                // Cross symbol
                ctx.shadowBlur = 0;
                ctx.fillStyle = '#fff';
                ctx.fillRect(this.offsetX + h.x - 1, this.offsetY + h.y - 5, 2, 10);
                ctx.fillRect(this.offsetX + h.x - 5, this.offsetY + h.y - 1, 10, 2);
            }
        });

        // Draw coins
        this.coins.forEach(c => {
            if (!c.collected) {
                const pulse = Math.sin(c.pulse) * 2;
                ctx.fillStyle = '#ffd700';
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 12 + pulse;
                ctx.beginPath();
                ctx.arc(this.offsetX + c.x, this.offsetY + c.y, c.size + pulse/2, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                
                // Inner circle
                ctx.fillStyle = '#ffed4e';
                ctx.beginPath();
                ctx.arc(this.offsetX + c.x, this.offsetY + c.y, (c.size + pulse/2) * 0.5, 0, Math.PI * 2);
                ctx.fill();
            }
        });

        // Draw enemies
        this.enemies.forEach(e => {
            const flash = e.stunned > 0 ? Math.sin(e.stunned * 30) * 0.5 + 0.5 : 1;
            ctx.globalAlpha = flash;
            
            ctx.fillStyle = e.color;
            ctx.shadowColor = e.color;
            ctx.shadowBlur = 10;
            
            if (e.type === 'tank') {
                ctx.fillRect(this.offsetX + e.x - e.size/2, this.offsetY + e.y - e.size/2, e.size, e.size);
            } else {
                ctx.beginPath();
                ctx.arc(this.offsetX + e.x, this.offsetY + e.y, e.size/2, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;

            // HP bar
            if (e.hp < e.maxHp) {
                const barWidth = e.size + 8;
                ctx.fillStyle = '#333';
                ctx.fillRect(this.offsetX + e.x - barWidth/2, this.offsetY + e.y - e.size/2 - 10, barWidth, 4);
                ctx.fillStyle = e.color;
                ctx.fillRect(this.offsetX + e.x - barWidth/2, this.offsetY + e.y - e.size/2 - 10, barWidth * (e.hp / e.maxHp), 4);
            }
        });

        // Draw player
        const playerFlash = this.player.invulnerable > 0 ? Math.sin(this.player.flashTimer) * 0.5 + 0.5 : 1;
        ctx.globalAlpha = playerFlash;
        
        ctx.fillStyle = '#44ff44';
        ctx.shadowColor = '#44ff44';
        ctx.shadowBlur = 18;
        ctx.fillRect(
            this.offsetX + this.player.x - this.player.size/2, 
            this.offsetY + this.player.y - this.player.size/2, 
            this.player.size, 
            this.player.size
        );
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Attack indicator
        if (this.attackAnimation > 0) {
            const alpha = this.attackAnimation / 0.2;
            ctx.strokeStyle = `rgba(68, 255, 68, ${alpha * 0.6})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(this.offsetX + this.player.x, this.offsetY + this.player.y, this.player.attackRange, 0, Math.PI * 2);
            ctx.stroke();
        } else if (this.attackCooldown <= 0) {
            ctx.strokeStyle = 'rgba(68, 255, 68, 0.3)';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.arc(this.offsetX + this.player.x, this.offsetY + this.player.y, this.player.attackRange, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Particles
        this.particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(this.offsetX + p.x, this.offsetY + p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        // UI Panel
        const panelHeight = 120;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, panelHeight);

        // HP bar
        const hpBarX = 20;
        const hpBarY = 20;
        const hpBarWidth = 200;
        ctx.fillStyle = '#222';
        ctx.fillRect(hpBarX, hpBarY, hpBarWidth, 22);
        
        const hpPercent = this.player.hp / this.player.maxHp;
        const hpColor = hpPercent > 0.5 ? '#44ff44' : hpPercent > 0.25 ? '#ffaa00' : '#ff4444';
        ctx.fillStyle = hpColor;
        ctx.fillRect(hpBarX, hpBarY, hpBarWidth * hpPercent, 22);
        
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.strokeRect(hpBarX, hpBarY, hpBarWidth, 22);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${Math.ceil(this.player.hp)} / ${this.player.maxHp}`, hpBarX + hpBarWidth/2, hpBarY + 16);

        // Info
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 18px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Level ${this.level}`, 20, 65);
        ctx.fillText(`Score: ${this.score}`, 20, 90);
        
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`💰 ${this.coins.filter(c => c.collected).length}/${this.coins.length}`, 150, 65);
        
        ctx.fillStyle = '#ff4444';
        ctx.fillText(`👾 ${this.enemiesKilled}`, 150, 90);

        // Attack cooldown indicator
        if (this.attackCooldown > 0) {
            const cooldownPercent = 1 - (this.attackCooldown / 0.35);
            ctx.fillStyle = '#333';
            ctx.fillRect(canvas.width - 120, 20, 100, 20);
            ctx.fillStyle = '#44ff44';
            ctx.fillRect(canvas.width - 120, 20, 100 * cooldownPercent, 20);
            ctx.strokeStyle = '#555';
            ctx.strokeRect(canvas.width - 120, 20, 100, 20);
            
            ctx.fillStyle = '#fff';
            ctx.font = '12px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('ATTACK', canvas.width - 70, 35);
        } else {
            ctx.fillStyle = '#44ff44';
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚔️ READY', canvas.width - 70, 35);
        }

        // Controls hint
        ctx.fillStyle = '#666688';
        ctx.font = '400 13px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('WASD/Arrows: Move • SPACE: Attack', 20, canvas.height - 15);
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
