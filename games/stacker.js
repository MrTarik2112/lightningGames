// Stacker - Enhanced tower stacking game with combos, power-ups, and difficulty levels
class StackerGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.stack = [];
        this.active = null;
        this.dir = 1;
        this.baseSpeed = 180;
        this.speed = 180;
        this.level = 0;
        this.score = 0;
        this.gameOver = false;
        this._keyHandler = null;
        this.particles = [];
        
        // Enhanced features
        this.combo = 0;
        this.maxCombo = 0;
        this.perfectCount = 0;
        this.scoreMultiplier = 1;
        this.powerUps = [];
        this.activePowerUp = null;
        this.powerUpTimer = 0;
        this.difficulty = 'normal'; // easy, normal, hard, extreme
        this.trail = [];
        this.shakeAmount = 0;
        this.colorTheme = 0;
        this.maxHeight = 0;
        this.totalBlocks = 0;
        this.narrowCount = 0;
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.stack = [];
        this.particles = [];
        this.powerUps = [];
        this.trail = [];
        this.gameOver = false;
        this.level = 0;
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.perfectCount = 0;
        this.scoreMultiplier = 1;
        this.activePowerUp = null;
        this.powerUpTimer = 0;
        this.shakeAmount = 0;
        this.maxHeight = 0;
        this.totalBlocks = 0;
        this.narrowCount = 0;

        // Get difficulty from settings
        if (window.gameManager && window.gameManager.settings) {
            this.difficulty = window.gameManager.settings.difficulty || 'normal';
        }

        // Set base speed based on difficulty
        const speedMap = { easy: 140, normal: 180, hard: 220, extreme: 280 };
        this.baseSpeed = speedMap[this.difficulty] || 180;
        this.speed = this.baseSpeed;

        const baseWidth = Math.min(220, canvas.width * 0.7);
        const h = 18;
        const y = canvas.height - h - 20;
        this.stack.push({ x: (canvas.width - baseWidth) / 2, y, w: baseWidth, h });
        this._spawnBlock();
        this._bindKeys();
        
        if (window.soundManager) window.soundManager.playStart?.();
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        this._keyHandler = (e) => {
            if (this.gameOver) return;
            if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowUp') {
                this._drop();
                e.preventDefault();
            }
            // Cheat codes for testing
            if (e.key === 'p' && e.ctrlKey) {
                this._spawnPowerUp();
            }
        };
        document.addEventListener('keydown', this._keyHandler);
    }

    _spawnBlock() {
        const last = this.stack[this.stack.length - 1];
        const w = last.w;
        const h = last.h;
        const y = last.y - h - 4;
        this.active = {
            x: 0,
            y,
            w,
            h,
            targetY: y
        };
        this.dir = this.level % 2 === 0 ? 1 : -1;
        if (this.dir > 0) {
            this.active.x = -w;
        } else {
            this.active.x = this.canvas.width;
        }
        this.level++;
        
        // Speed increase based on difficulty
        const speedIncrease = { easy: 5, normal: 8, hard: 12, extreme: 16 };
        this.speed += speedIncrease[this.difficulty] || 8;
        
        // Apply slow power-up
        if (this.activePowerUp === 'slow') {
            this.speed *= 0.5;
        }
        
        // Spawn power-up randomly (5% chance)
        if (Math.random() < 0.05 && this.level > 3) {
            this._spawnPowerUp();
        }
        
        this.totalBlocks++;
    }

    _spawnPowerUp() {
        const types = ['slow', 'wide', 'magnet'];
        const type = types[Math.floor(Math.random() * types.length)];
        const last = this.stack[this.stack.length - 1];
        const x = Math.random() * (this.canvas.width - 40) + 20;
        const y = last.y - 60;
        
        this.powerUps.push({
            type,
            x,
            y,
            size: 20,
            collected: false,
            pulse: 0
        });
    }

    _checkPowerUpCollision() {
        if (!this.active) return;
        
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const p = this.powerUps[i];
            if (p.collected) continue;
            
            // Check collision with active block
            if (this.active.x < p.x + p.size &&
                this.active.x + this.active.w > p.x &&
                this.active.y < p.y + p.size &&
                this.active.y + this.active.h > p.y) {
                
                this._collectPowerUp(p);
                this.powerUps.splice(i, 1);
            }
        }
    }

    _collectPowerUp(powerUp) {
        this.activePowerUp = powerUp.type;
        this.powerUpTimer = 5; // 5 seconds
        
        if (window.soundManager) window.soundManager.playPowerUp?.();
        this._spawnParticles(powerUp.x, powerUp.y, '#ffcc00', 20);
        
        // Apply immediate effects
        if (powerUp.type === 'slow') {
            this.speed *= 0.5;
        } else if (powerUp.type === 'wide') {
            this.active.w = Math.min(this.active.w * 1.3, this.canvas.width * 0.8);
        }
    }

    _spawnParticles(x, y, color, count = 12) {
        const maxParticles = 200;
        if (this.particles.length > maxParticles) return;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 200,
                vy: (Math.random() - 0.5) * 200 - 50,
                life: 1,
                decay: 1.5 + Math.random(),
                size: Math.random() * 4 + 2,
                color
            });
        }
    }

    _drop() {
        if (!this.active) return;
        const last = this.stack[this.stack.length - 1];
        const left = Math.max(this.active.x, last.x);
        const right = Math.min(this.active.x + this.active.w, last.x + last.w);
        const overlap = right - left;

        // Magnet power-up: snap to perfect if close
        let finalOverlap = overlap;
        if (this.activePowerUp === 'magnet') {
            const center = this.active.x + this.active.w / 2;
            const lastCenter = last.x + last.w / 2;
            const diff = Math.abs(center - lastCenter);
            if (diff < 15) {
                // Snap to perfect
                finalOverlap = Math.min(this.active.w, last.w);
            }
        }

        if (finalOverlap <= 4) {
            this._triggerGameOver();
            return;
        }

        // Check for perfect placement
        const isPerfect = Math.abs(finalOverlap - last.w) < 3;
        
        if (isPerfect) {
            this.combo++;
            this.perfectCount++;
            this.scoreMultiplier = 1 + (this.combo * 0.2);
            if (window.soundManager) window.soundManager.playMatch?.();
            this._spawnParticles(left + finalOverlap / 2, this.active.y, '#ffff00', 24);
        } else {
            if (this.combo > 0) {
                if (window.soundManager) window.soundManager.playDing?.();
            }
            this.combo = 0;
            this.scoreMultiplier = 1;
            this.narrowCount++;
        }
        
        this.maxCombo = Math.max(this.maxCombo, this.combo);

        this.stack.push({
            x: left,
            y: this.active.y,
            w: finalOverlap,
            h: this.active.h
        });
        
        // Calculate score with multiplier
        const baseScore = Math.floor(finalOverlap / 5);
        const bonusScore = isPerfect ? 50 : 0;
        const comboBonus = this.combo * 10;
        this.score += Math.floor((baseScore + bonusScore + comboBonus) * this.scoreMultiplier);
        
        this._spawnParticles(left + finalOverlap / 2, this.active.y, '#00ffcc', 16);
        if (window.gameManager) window.gameManager.shakeScreen(isPerfect ? 0.4 : 0.2);
        this.shakeAmount = isPerfect ? 0.6 : 0.3;
        
        if (window.soundManager) {
            if (isPerfect) {
                window.soundManager.playAchievement?.();
            } else {
                window.soundManager.playPlace?.();
            }
        }
        
        this.maxHeight = Math.max(this.maxHeight, this.stack.length);
        this.active = null;
        this._spawnBlock();
    }

    update(dt) {
        if (this.gameOver) return;
        
        // Update active block
        if (this.active) {
            // Trail effect
            if (this.trail.length < 10) {
                this.trail.push({
                    x: this.active.x,
                    y: this.active.y,
                    w: this.active.w,
                    h: this.active.h,
                    alpha: 0.3
                });
            } else {
                this.trail.shift();
                this.trail.push({
                    x: this.active.x,
                    y: this.active.y,
                    w: this.active.w,
                    h: this.active.h,
                    alpha: 0.3
                });
            }
            
            this.active.x += this.dir * this.speed * dt;
            if (this.active.x <= -this.active.w) {
                this.dir = 1;
                this.active.x = -this.active.w;
            }
            if (this.active.x >= this.canvas.width) {
                this.dir = -1;
                this.active.x = this.canvas.width;
            }
            
            this._checkPowerUpCollision();
        }

        // Update power-up timer
        if (this.activePowerUp) {
            this.powerUpTimer -= dt;
            if (this.powerUpTimer <= 0) {
                this.activePowerUp = null;
                this.speed = this.baseSpeed + (this.level * (this.difficulty === 'extreme' ? 16 : 8));
            }
        }
        
        // Update power-ups
        this.powerUps.forEach(p => {
            p.pulse += dt * 3;
        });

        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 200 * dt; // Gravity
            p.life -= p.decay * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
        
        // Update trail
        this.trail.forEach(t => {
            t.alpha -= dt * 2;
        });
        this.trail = this.trail.filter(t => t.alpha > 0);
        
        // Update shake
        if (this.shakeAmount > 0) {
            this.shakeAmount -= dt * 2;
        }
        
        // Update color theme
        this.colorTheme += dt * 0.5;
    }

    _triggerGameOver() {
        if (this.gameOver) return;
        this.gameOver = true;
        if (window.soundManager) window.soundManager.playDeath();
        if (this.active) {
            this._spawnParticles(this.active.x + this.active.w / 2, this.active.y, '#ff4466', 40);
        }
        if (window.gameManager) {
            window.gameManager.shakeScreen(1);
            window.gameManager.checkAndUpdateHighScore('stacker', this.score);
        }
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

        let hs = 0; 
        if (window.gameManager) hs = window.gameManager.getHighScore('stacker');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">Tower Collapsed!</div>
            <div class="game-over-score">Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <div class="game-over-stats">
                <div>🏗️ Max Height: ${this.maxHeight}</div>
                <div>🔥 Max Combo: ${this.maxCombo}</div>
                <div>⭐ Perfect: ${this.perfectCount}</div>
                <div>📊 Accuracy: ${Math.floor((this.perfectCount / Math.max(1, this.totalBlocks)) * 100)}%</div>
            </div>
            <button class="game-over-btn" id="stacker-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#stacker-restart').addEventListener('click', () => {
            if (window.gameManager) window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.save();
        
        // Apply shake
        if (this.shakeAmount > 0) {
            ctx.translate(
                (Math.random() - 0.5) * this.shakeAmount * 10,
                (Math.random() - 0.5) * this.shakeAmount * 10
            );
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Gradient background
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#050516');
        grad.addColorStop(1, '#0a0a20');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Base line with glow
        ctx.strokeStyle = '#4444ff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#4444ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(40, canvas.height - 20);
        ctx.lineTo(canvas.width - 40, canvas.height - 20);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Trail effect
        this.trail.forEach((t, i) => {
            ctx.globalAlpha = t.alpha * (i / this.trail.length);
            ctx.fillStyle = '#00ffcc';
            ctx.beginPath();
            ctx.roundRect(t.x, t.y, t.w, t.h, 4);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Stack with dynamic colors
        this.stack.forEach((b, i) => {
            const t = i / Math.max(1, this.stack.length - 1);
            const hue = (this.colorTheme + t * 60) % 360;
            const color = `hsl(${hue}, 80%, 60%)`;
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 12;
            ctx.beginPath();
            ctx.roundRect(b.x, b.y, b.w, b.h, 4);
            ctx.fill();
            
            // Highlight top edge
            ctx.shadowBlur = 0;
            ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
            ctx.fillRect(b.x + 2, b.y, b.w - 4, 2);
        });
        ctx.shadowBlur = 0;

        // Active block with pulse
        if (this.active) {
            const pulse = Math.sin(Date.now() / 100) * 0.1 + 1;
            ctx.fillStyle = '#00ffcc';
            ctx.shadowColor = '#00ffcc';
            ctx.shadowBlur = 14 * pulse;
            ctx.beginPath();
            ctx.roundRect(this.active.x, this.active.y, this.active.w, this.active.h, 4);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            // Highlight
            ctx.fillStyle = `rgba(255, 255, 255, 0.4)`;
            ctx.fillRect(this.active.x + 2, this.active.y, this.active.w - 4, 2);
        }

        // Power-ups
        this.powerUps.forEach(p => {
            const pulse = Math.sin(p.pulse) * 0.2 + 1;
            const colors = {
                slow: '#4488ff',
                wide: '#ff8844',
                magnet: '#ff44ff'
            };
            const icons = {
                slow: '⏱️',
                wide: '↔️',
                magnet: '🧲'
            };
            
            ctx.save();
            ctx.translate(p.x + p.size / 2, p.y + p.size / 2);
            ctx.scale(pulse, pulse);
            
            ctx.fillStyle = colors[p.type];
            ctx.shadowColor = colors[p.type];
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(icons[p.type], 0, 0);
            
            ctx.restore();
        });

        // Particles
        this.particles.forEach(p => {
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        // UI - Score with glow
        ctx.font = 'bold 28px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00ffcc';
        ctx.shadowBlur = 10;
        ctx.fillText(`Score: ${this.score}`, 20, 40);
        ctx.shadowBlur = 0;

        // Combo indicator
        if (this.combo > 0) {
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            const comboColor = this.combo >= 5 ? '#ffff00' : '#00ffcc';
            ctx.fillStyle = comboColor;
            ctx.shadowColor = comboColor;
            ctx.shadowBlur = 15;
            ctx.fillText(`${this.combo}x COMBO!`, canvas.width / 2, 40);
            ctx.shadowBlur = 0;
            
            // Multiplier
            ctx.font = '16px Arial';
            ctx.fillStyle = '#ffffff';
            ctx.fillText(`×${this.scoreMultiplier.toFixed(1)}`, canvas.width / 2, 65);
        }

        // Power-up indicator
        if (this.activePowerUp) {
            const icons = { slow: '⏱️ SLOW', wide: '↔️ WIDE', magnet: '🧲 MAGNET' };
            ctx.font = 'bold 18px Arial';
            ctx.textAlign = 'right';
            ctx.fillStyle = '#ffcc00';
            ctx.shadowColor = '#ffcc00';
            ctx.shadowBlur = 10;
            ctx.fillText(`${icons[this.activePowerUp]} (${Math.ceil(this.powerUpTimer)}s)`, canvas.width - 20, 40);
            ctx.shadowBlur = 0;
        }

        // Level indicator
        ctx.font = '16px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#aaaaaa';
        ctx.fillText(`Level ${this.level}`, 20, 70);
        
        // Difficulty badge
        const diffColors = { easy: '#44ff44', normal: '#ffaa00', hard: '#ff4444', extreme: '#ff00ff' };
        ctx.fillStyle = diffColors[this.difficulty];
        ctx.fillText(this.difficulty.toUpperCase(), 20, 90);

        ctx.restore();
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { /* no-op */ }
    resume() { /* no-op */ }
    
    destroy() {
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            this._keyHandler = null;
        }
    }
}

if (window.gameManager) {
    window.gameManager.registerGame('stacker', StackerGame, {
        name: 'Stacker',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
