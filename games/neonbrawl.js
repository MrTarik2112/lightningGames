// Neon Brawl - Beat 'em Up Arcade
class NeonBrawl {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.player = null;
        this.enemies = [];
        this.particles = [];
        this.powerups = [];
        
        this.wave = 1;
        this.waveTimer = 0;
        this.enemySpawnTimer = 0;
        
        this.combo = 0;
        this.comboTimer = 0;
        this.comboMax = 4;
        this.isRageMode = false;
        this.rageTimer = 0;
        
        this.screenShake = 0;
        this.screenShakeIntensity = 0;
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.wave = 1;
        this.waveTimer = 0;
        this.enemySpawnTimer = 0;
        
        this.combo = 0;
        this.comboTimer = 0;
        this.isRageMode = false;
        this.rageTimer = 0;
        
        this.screenShake = 0;
        
        this.player = {
            x: 100,
            y: canvas.height - 120,
            width: 50,
            height: 70,
            vx: 0,
            vy: 0,
            speed: 280,
            jumpForce: -450,
            grounded: true,
            health: 100,
            maxHealth: 100,
            facing: 1,
            attacking: false,
            attackTimer: 0,
            attackFrame: 0,
            dashTimer: 0,
            invincible: 0,
            hurtTimer: 0
        };
        
        this.enemies = [];
        this.particles = [];
        this.powerups = [];
        
        this._bindEvents();
        this.spawnWave();
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.keydown = (e) => {
            if (this.gameOver) {
                if (e.code === 'Space' || e.code === 'Enter') {
                    this.init(this.canvas, this.ctx);
                }
                return;
            }
            
            switch(e.code) {
                case 'ArrowLeft': case 'KeyA':
                    this.player.moveLeft = true;
                    this.player.facing = -1;
                    break;
                case 'ArrowRight': case 'KeyD':
                    this.player.moveRight = true;
                    this.player.facing = 1;
                    break;
                case 'ArrowUp': case 'KeyW':
                    if (this.player.grounded) {
                        this.player.vy = this.player.jumpForce;
                        this.player.grounded = false;
                        this._spawnParticles(this.player.x + this.player.width/2, this.player.y + this.player.height, '#00d4ff', 5);
                        if (window.soundManager) window.soundManager.playJump();
                    }
                    break;
                case 'Space':
                    this._attack();
                    break;
                case 'ShiftLeft': case 'ShiftRight':
                    this._dash();
                    break;
            }
        };
        
        this._handlers.keyup = (e) => {
            switch(e.code) {
                case 'ArrowLeft': case 'KeyA':
                    this.player.moveLeft = false;
                    break;
                case 'ArrowRight': case 'KeyD':
                    this.player.moveRight = false;
                    break;
            }
        };
        
        document.addEventListener('keydown', this._handlers.keydown);
        document.addEventListener('keyup', this._handlers.keyup);
    }

    _unbindEvents() {
        document.removeEventListener('keydown', this._handlers.keydown);
        document.removeEventListener('keyup', this._handlers.keyup);
    }

    _attack() {
        if (this.player.attacking) return;
        
        this.player.attacking = true;
        this.player.attackTimer = 0.25;
        
        const comboNames = ['FIST', 'UPPERCUT', 'SPIN', 'RAGE!'];
        this.player.attackFrame = Math.min(this.combo, 3);
        
        this._spawnParticles(
            this.player.x + this.player.width/2 + this.player.facing * 40,
            this.player.y + this.player.height/2,
            this.isRageMode ? '#ff00aa' : '#00ff88',
            8
        );
        
        if (window.soundManager) window.soundManager.playShoot();
        
        // Check hits
        const attackRange = this.player.facing > 0 ? 80 : -80;
        const attackX = this.player.x + this.player.width/2 + attackRange;
        
        this.enemies.forEach(enemy => {
            if (enemy.hurt || enemy.dead) return;
            
            const enemyCenter = enemy.x + enemy.width/2;
            const dist = attackX - enemyCenter;
            
            if ((this.player.facing > 0 && dist > 0 && dist < 80) ||
                (this.player.facing < 0 && dist < 0 && dist > -80)) {
                
                const damage = this.isRageMode ? 50 : (15 + this.combo * 5);
                enemy.health -= damage;
                enemy.vx = this.player.facing * 200;
                enemy.vy = -150;
                enemy.hurt = true;
                enemy.hurtTimer = 0.3;
                
                this._spawnParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#ff4466', 10);
                
                if (enemy.health <= 0) {
                    enemy.dead = true;
                    this.score += enemy.points;
                    this.combo++;
                    this.comboTimer = 2;
                    
                    this._spawnParticles(enemy.x + enemy.width/2, enemy.y + enemy.height/2, '#ffcc00', 20);
                    window.gameManager.shakeScreen(0.5);
                    
                    if (window.soundManager) window.soundManager.playExplosion();
                    
                    // Check achievements
                    if (window.gameManager) {
                        if (this.score >= 500) {
                            window.gameManager.unlockAchievement('neonbrawl_500', 'Street Fighter', 'Scored 500 points in Neon Brawl.', '🥊', true);
                        }
                        if (this.combo >= 10) {
                            window.gameManager.unlockAchievement('neonbrawl_combo_10', 'Combo Master', 'Achieved 10x combo in Neon Brawl.', '💥', true);
                        }
                    }
                } else {
                    if (window.soundManager) window.soundManager.playHit();
                }
            }
        });
    }

    _dash() {
        if (this.player.dashTimer > 0) return;
        
        this.player.dashTimer = 0.5;
        this.player.vx = this.player.facing * 600;
        this._spawnParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#00d4ff', 12);
        
        if (window.soundManager) window.soundManager.playWhoosh();
    }

    spawnWave() {
        const baseEnemies = 2 + Math.floor(this.wave / 2);
        const numEnemies = Math.min(baseEnemies + 2, 12);
        
        for (let i = 0; i < numEnemies; i++) {
            let type = 'basic';
            if (this.wave >= 3 && Math.random() < 0.3) type = 'striker';
            if (this.wave >= 5 && Math.random() < 0.2) type = 'tank';
            
            const enemy = this._createEnemy(type);
            enemy.x = this.canvas.width + 50 + Math.random() * 200;
            enemy.y = this.canvas.height - 100 - Math.random() * 40;
            this.enemies.push(enemy);
        }
    }

    _createEnemy(type) {
        const types = {
            basic: { width: 35, height: 45, health: 30, speed: 80, points: 10, color: '#ff6644' },
            striker: { width: 40, height: 55, health: 45, speed: 120, points: 15, color: '#ffaa00' },
            tank: { width: 60, height: 80, health: 100, speed: 40, points: 25, color: '#aa44ff' }
        };
        
        const t = types[type];
        return {
            x: -100,
            y: this.canvas.height - 120,
            width: t.width,
            height: t.height,
            vx: 0,
            vy: 0,
            speed: t.speed,
            health: t.health,
            maxHealth: t.health,
            points: t.points,
            type: type,
            color: t.color,
            attacking: false,
            attackTimer: 0,
            hurt: false,
            hurtTimer: 0,
            dead: false,
            deadTimer: 2
        };
    }

    _spawnBoss() {
        const boss = {
            x: this.canvas.width + 100,
            y: this.canvas.height - 150,
            width: 100,
            height: 130,
            vx: 0,
            vy: 0,
            speed: 60,
            health: 300,
            maxHealth: 300,
            points: 100,
            type: 'boss',
            color: '#ff0066',
            attacking: false,
            attackTimer: 0,
            hurt: false,
            hurtTimer: 0,
            dead: false,
            deadTimer: 3,
            pattern: 0,
            patternTimer: 0
        };
        
        this.enemies.push(boss);
        
        if (window.soundManager) window.soundManager.playLevelUp();
    }

    _spawnParticles(x, y, color, count = 8) {
        const maxParticles = 150;
        if (this.particles.length > maxParticles) return;
        
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 300,
                vy: (Math.random() - 0.5) * 300 - 100,
                life: 1,
                decay: 1 + Math.random() * 0.5,
                size: Math.random() * 6 + 3,
                color: color
            });
        }
    }

    update(dt) {
        if (this.gameOver) return;
        
        // Player movement
        if (this.player.moveLeft) this.player.vx = -this.player.speed;
        else if (this.player.moveRight) this.player.vx = this.player.speed;
        else this.player.vx *= 0.85;
        
        // Gravity
        this.player.vy += 1200 * dt;
        
        // Apply velocity
        this.player.x += this.player.vx * dt;
        this.player.y += this.player.vy * dt;
        
        // Bounds
        if (this.player.x < 0) this.player.x = 0;
        if (this.player.x > this.canvas.width - this.player.width) {
            this.player.x = this.canvas.width - this.player.width;
        }
        if (this.player.y > this.canvas.height - this.player.height - 20) {
            this.player.y = this.canvas.height - this.player.height - 20;
            this.player.vy = 0;
            this.player.grounded = true;
        }
        
        // Attack timer
        if (this.player.attacking) {
            this.player.attackTimer -= dt;
            if (this.player.attackTimer <= 0) {
                this.player.attacking = false;
                this.player.attackFrame = 0;
            }
        }
        
        // Dash timer
        if (this.player.dashTimer > 0) {
            this.player.dashTimer -= dt;
        }
        
        // Invincibility
        if (this.player.invincible > 0) {
            this.player.invincible -= dt;
        }
        
        // Hurt timer
        if (this.player.hurtTimer > 0) {
            this.player.hurtTimer -= dt;
        }
        
        // Combo
        if (this.comboTimer > 0) {
            this.comboTimer -= dt;
            if (this.comboTimer <= 0) {
                this.combo = 0;
            }
        }
        
        // Rage mode
        if (this.isRageMode) {
            this.rageTimer -= dt;
            if (this.rageTimer <= 0) {
                this.isRageMode = false;
            }
        }
        
        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (enemy.dead) {
                enemy.deadTimer -= dt;
                if (enemy.deadTimer <= 0) {
                    this.enemies.splice(i, 1);
                }
                continue;
            }
            
            if (enemy.hurt) {
                enemy.hurtTimer -= dt;
                if (enemy.hurtTimer <= 0) {
                    enemy.hurt = false;
                }
                continue;
            }
            
            // Move towards player
            const dx = this.player.x - enemy.x;
            const dist = Math.abs(dx);
            
            if (dist > 60) {
                enemy.vx += (dx > 0 ? 1 : -1) * enemy.speed * 2 * dt;
                enemy.vx = Math.max(-enemy.speed, Math.min(enemy.speed, enemy.vx));
            } else {
                enemy.vx *= 0.9;
            }
            
            enemy.x += enemy.vx * dt;
            
            // Keep in bounds
            if (enemy.x < 0) enemy.x = 0;
            if (enemy.x > this.canvas.width - enemy.width) {
                enemy.x = this.canvas.width - enemy.width;
            }
            
            // Attack player
            if (dist < 70 && !enemy.attacking && Math.random() < 0.02) {
                enemy.attacking = true;
                enemy.attackTimer = 0.5;
                
                if (this.player.invincible <= 0) {
                    this.player.health -= enemy.type === 'boss' ? 25 : 10;
                    this.player.invincible = 0.8;
                    this.player.hurtTimer = 0.2;
                    this._spawnParticles(this.player.x + this.player.width/2, this.player.y + this.player.height/2, '#ff0000', 15);
                    this.screenShake = 0.3;
                    
                    if (window.soundManager) window.soundManager.playHit();
                    
                    if (this.player.health <= 0) {
                        this._triggerGameOver();
                    }
                }
            }
            
            if (enemy.attacking) {
                enemy.attackTimer -= dt;
                if (enemy.attackTimer <= 0) {
                    enemy.attacking = false;
                }
            }
        }
        
        // Wave management
        const aliveEnemies = this.enemies.filter(e => !e.dead);
        if (aliveEnemies.length === 0) {
            this.waveTimer += dt;
            if (this.waveTimer > 1.5) {
                this.wave++;
                this.waveTimer = 0;
                
                if (this.wave % 5 === 0) {
                    this._spawnBoss();
                } else {
                    this.spawnWave();
                }
                
                if (window.soundManager) window.soundManager.playLevelUp();
            }
        }
        
        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 400 * dt;
            p.life -= p.decay * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
        
        // Screen shake decay
        if (this.screenShake > 0) {
            this.screenShake -= dt * 2;
            if (this.screenShake < 0) this.screenShake = 0;
        }
    }

    _triggerGameOver() {
        this.gameOver = true;
        window.gameManager.shakeScreen(1);
        
        if (window.soundManager) window.soundManager.playDeath();
        
        window.gameManager.checkAndUpdateHighScore('neonbrawl', this.score);
        
        // Unlock achievements
        if (window.gameManager) {
            window.gameManager.unlockAchievement('neonbrawl_first', 'First Brawl', 'Won your first Neon Brawl match.', '🥊', false);
            if (this.wave >= 5) {
                window.gameManager.unlockAchievement('neonbrawl_boss', 'Boss Breaker', 'Defeated a boss in Neon Brawl.', '👑', true);
            }
        }
        
        this._unbindEvents();
        this._showGameOverOverlay();
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        
        const existing = container.querySelector('.game-over-overlay');
        if (existing) existing.remove();
        
        const hs = window.gameManager.getHighScore('neonbrawl');
        const isNew = this.score >= hs && this.score > 0;
        
        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">GAME OVER</div>
            <div class="game-over-subtitle">Wave ${this.wave}</div>
            <div class="game-over-score">Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="neonbrawl-restart">↻ Play Again</button>
        `;
        
        container.appendChild(overlay);
        overlay.querySelector('#neonbrawl-restart').addEventListener('click', () => {
            window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas } = this;
        
        // Screen shake
        ctx.save();
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake * 20;
            const shakeY = (Math.random() - 0.5) * this.screenShake * 20;
            ctx.translate(shakeX, shakeY);
        }
        
        // Background
        const bg = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bg.addColorStop(0, '#0a0a18');
        bg.addColorStop(1, '#151528');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Floor
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 20);
        ctx.lineTo(canvas.width, canvas.height - 20);
        ctx.stroke();
        
        // Grid lines on floor
        ctx.strokeStyle = 'rgba(0, 212, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - 20);
            ctx.lineTo(x - 30, canvas.height);
            ctx.stroke();
        }
        
        // Particles behind entities
        this.particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        
        // Enemies
        this.enemies.forEach(enemy => {
            if (enemy.dead) {
                ctx.globalAlpha = Math.max(0, enemy.deadTimer / 3);
            }
            
            const isHurt = enemy.hurt;
            const color = isHurt ? '#ffffff' : enemy.color;
            
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            
            // Body
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
            
            // Eyes
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 0;
            const eyeY = enemy.y + enemy.height * 0.3;
            if (enemy.type === 'boss') {
                ctx.fillRect(enemy.x + 20, eyeY, 20, 10);
                ctx.fillRect(enemy.x + enemy.width - 40, eyeY, 20, 10);
                ctx.fillStyle = '#ff0000';
                ctx.fillRect(enemy.x + 25, eyeY + 3, 10, 4);
                ctx.fillRect(enemy.x + enemy.width - 35, eyeY + 3, 10, 4);
            } else {
                ctx.fillRect(enemy.x + 8, eyeY, 6, 6);
                ctx.fillRect(enemy.x + enemy.width - 14, eyeY, 6, 6);
            }
            
            // Health bar
            if (enemy.health < enemy.maxHealth) {
                const barWidth = enemy.width;
                const barHeight = 4;
                const barY = enemy.y - 10;
                
                ctx.fillStyle = '#333';
                ctx.fillRect(enemy.x, barY, barWidth, barHeight);
                ctx.fillStyle = enemy.type === 'boss' ? '#ff0066' : '#00ff88';
                ctx.fillRect(enemy.x, barY, barWidth * (enemy.health / enemy.maxHealth), barHeight);
            }
            
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        });
        
        // Player
        const p = this.player;
        
        // Player shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(p.x + p.width/2, canvas.height - 22, p.width/2, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Invincibility flash
        if (p.invincible > 0 && Math.floor(p.invincible * 20) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        
        const playerColor = this.isRageMode ? '#ff00aa' : '#00d4ff';
        ctx.fillStyle = playerColor;
        ctx.shadowColor = playerColor;
        ctx.shadowBlur = 20;
        
        // Body
        ctx.fillRect(p.x, p.y, p.width, p.height);
        
        // Headband
        ctx.fillStyle = this.isRageMode ? '#ff0066' : '#00ff88';
        ctx.fillRect(p.x, p.y + 5, p.width, 8);
        
        // Eyes
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        const faceX = p.facing > 0 ? p.x + p.width - 18 : p.x + 8;
        ctx.fillRect(faceX, p.y + 18, 8, 8);
        
        // Attack effect
        if (p.attacking) {
            ctx.fillStyle = this.isRageMode ? '#ff00aa' : '#00ff88';
            ctx.shadowColor = this.isRageMode ? '#ff00aa' : '#00ff88';
            ctx.shadowBlur = 25;
            
            const attackX = p.x + p.width/2 + p.facing * 50;
            const attackY = p.y + p.height/2;
            ctx.beginPath();
            ctx.arc(attackX, attackY, 25, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        
        // Health bar
        ctx.fillStyle = '#333';
        ctx.fillRect(p.x - 10, p.y - 20, p.width + 20, 8);
        ctx.fillStyle = p.health > 30 ? '#00ff88' : '#ff4466';
        ctx.fillRect(p.x - 10, p.y - 20, (p.width + 20) * (p.health / p.maxHealth), 8);
        
        ctx.restore();
        
        // UI Overlay
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`WAVE ${this.wave}`, 20, 40);
        
        ctx.textAlign = 'right';
        ctx.fillText(`${this.score}`, canvas.width - 20, 40);
        
        // Combo display
        if (this.combo > 1) {
            ctx.fillStyle = `rgba(255, 204, 0, ${Math.min(1, this.comboTimer)})`;
            ctx.font = 'bold 20px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`${this.combo}x COMBO!`, canvas.width/2, 40);
        }
        
        // Rage mode indicator
        if (this.isRageMode) {
            ctx.fillStyle = `rgba(255, 0, 170, ${0.5 + Math.sin(Date.now() / 100) * 0.5})`;
            ctx.font = 'bold 18px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('RAGE MODE!', canvas.width/2, 70);
        }
        
        // Controls hint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('A/D: Move | W: Jump | SPACE: Attack | SHIFT: Dash', canvas.width/2, canvas.height - 5);
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
    destroy() { this._unbindEvents(); }
}

window.gameManager.registerGame('neonbrawl', NeonBrawl, {
    name: 'Neon Brawl',
    canvasWidth: 880,
    canvasHeight: 540
});
