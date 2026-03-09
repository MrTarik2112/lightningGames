// Doodle Jump Style Game v3.0 - Enhanced Edition
class DoodleJumpGame {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;

        this.player = { 
            x: 0, y: 0, vx: 0, vy: 0, 
            size: 24, color: '#00ff88',
            rotation: 0, targetRotation: 0,
            combo: 0, comboTimer: 0
        };
        this.platforms = [];
        this.particles = [];
        this.powerups = [];
        this.springs = [];
        this.clouds = [];

        this.gravity = 800;
        this.jumpForce = -600;
        this.cameraY = 0;
        this.highestY = 0;
        this.speedMultiplier = 1;
        this.speedBoostTimer = 0;

        this._keyHandler = null;
        this._keyUpHandler = null;
        this.keys = { left: false, right: false };
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        this.cameraY = 0;
        this.highestY = 0;
        this.speedMultiplier = 1;
        this.speedBoostTimer = 0;

        this.player = {
            x: canvas.width / 2,
            y: canvas.height / 2,
            vx: 0, vy: 0, size: 24, color: '#00ff88',
            rotation: 0, targetRotation: 0,
            combo: 0, comboTimer: 0
        };

        this.platforms = [];
        this.particles = [];
        this.powerups = [];
        this.springs = [];
        this.clouds = [];

        // Generate background clouds
        for (let i = 0; i < 8; i++) {
            this.clouds.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - 500,
                size: 30 + Math.random() * 40,
                speed: 10 + Math.random() * 20,
                opacity: 0.1 + Math.random() * 0.15
            });
        }

        // Initial platforms
        this.platforms.push({ x: canvas.width / 2 - 40, y: canvas.height - 100, w: 80, h: 12, type: 'normal' });

        for (let i = 1; i < 25; i++) {
            this._spawnPlatform(canvas.height - 100 - (i * 110));
        }

        this._bindKeys();
    }

    _spawnPlatform(yStart) {
        const difficulty = Math.min(1, Math.abs(yStart) / 5000);
        let isMoving = Math.random() < (0.15 + difficulty * 0.15);
        let isBreakable = Math.random() < (0.08 + difficulty * 0.07);
        let hasSpring = Math.random() < 0.12 && !isBreakable;
        let hasPowerup = Math.random() < 0.08 && !isBreakable && !hasSpring;
        
        let type = 'normal';
        let w = 80;

        if (isBreakable) { type = 'break'; w = 60; }
        else if (isMoving) { type = 'moving'; w = 70; }

        const platform = {
            x: Math.random() * (this.canvas.width - w),
            y: yStart,
            w: w, h: 12,
            type: type,
            vx: isMoving ? (Math.random() > 0.5 ? 120 : -120) : 0,
            broken: false,
            pulse: Math.random() * Math.PI * 2
        };

        this.platforms.push(platform);

        // Add spring
        if (hasSpring) {
            this.springs.push({
                x: platform.x + platform.w / 2,
                y: platform.y - 15,
                size: 12,
                compressed: 0,
                active: true
            });
        }

        // Add powerup
        if (hasPowerup) {
            const powerupType = Math.random() < 0.5 ? 'speed' : 'shield';
            this.powerups.push({
                x: platform.x + platform.w / 2,
                y: platform.y - 25,
                size: 14,
                type: powerupType,
                collected: false,
                pulse: Math.random() * Math.PI * 2,
                float: 0
            });
        }
    }

    _bindKeys() {
        if (this._keyHandler) document.removeEventListener('keydown', this._keyHandler);
        if (this._keyUpHandler) document.removeEventListener('keyup', this._keyUpHandler);

        this._keyHandler = (e) => {
            if (this.gameOver) return;
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = true;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = true;
        };
        this._keyUpHandler = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') this.keys.left = false;
            if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') this.keys.right = false;
        };

        document.addEventListener('keydown', this._keyHandler);
        document.addEventListener('keyup', this._keyUpHandler);
    }

    _spawnParticles(x, y, color, count, upward = false) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 150,
                vy: upward ? -Math.random() * 200 : (Math.random() - 0.5) * 150,
                life: 1, decay: 1.5 + Math.random(),
                size: Math.random() * 4 + 2, color
            });
        }
    }

    update(dt) {
        if (this.gameOver) return;

        // Update timers
        if (this.player.comboTimer > 0) {
            this.player.comboTimer -= dt;
            if (this.player.comboTimer <= 0) this.player.combo = 0;
        }
        if (this.speedBoostTimer > 0) {
            this.speedBoostTimer -= dt;
            if (this.speedBoostTimer <= 0) this.speedMultiplier = 1;
        }

        // Player physics
        const moveSpeed = 450 * this.speedMultiplier;
        if (this.keys.left) {
            this.player.vx = -moveSpeed;
            this.player.targetRotation = -0.15;
        } else if (this.keys.right) {
            this.player.vx = moveSpeed;
            this.player.targetRotation = 0.15;
        } else {
            this.player.vx = 0;
            this.player.targetRotation = 0;
        }

        // Smooth rotation
        this.player.rotation += (this.player.targetRotation - this.player.rotation) * 8 * dt;

        this.player.vy += this.gravity * dt;
        this.player.x += this.player.vx * dt;
        this.player.y += this.player.vy * dt;

        // Wrap around
        if (this.player.x < -this.player.size) this.player.x = this.canvas.width;
        if (this.player.x > this.canvas.width) this.player.x = -this.player.size;

        // Update clouds
        this.clouds.forEach(c => {
            c.y += c.speed * dt;
            if (c.y > this.cameraY + this.canvas.height + 100) {
                c.y = this.cameraY - 100;
                c.x = Math.random() * this.canvas.width;
            }
        });

        // Platform collisions (falling only)
        if (this.player.vy > 0) {
            for (let p of this.platforms) {
                if (!p.broken &&
                    this.player.y + this.player.size / 2 >= p.y &&
                    this.player.y + this.player.size / 2 <= p.y + p.h + this.player.vy * dt &&
                    this.player.x + this.player.size / 2 > p.x &&
                    this.player.x - this.player.size / 2 < p.x + p.w) {

                    if (p.type === 'break') {
                        p.broken = true;
                        this._spawnParticles(p.x + p.w / 2, p.y, '#ff9900', 25);
                        if (window.gameManager) window.gameManager.shakeScreen(0.15);
                        if (window.soundManager) window.soundManager.playHit();
                    } else {
                        this.player.vy = this.jumpForce * this.speedMultiplier;
                        this.player.y = p.y - this.player.size / 2;
                        
                        // Combo system
                        this.player.combo++;
                        this.player.comboTimer = 1.5;
                        const comboBonus = Math.min(this.player.combo * 2, 20);
                        this.score += comboBonus;
                        
                        this._spawnParticles(this.player.x, p.y, '#00ff88', 12, true);
                        if (window.gameManager) window.gameManager.shakeScreen(0.05);
                        if (window.soundManager) window.soundManager.playBounce();
                    }
                }
            }

            // Spring collisions
            for (let s of this.springs) {
                if (s.active) {
                    const dist = Math.hypot(this.player.x - s.x, this.player.y - s.y);
                    if (dist < this.player.size / 2 + s.size) {
                        this.player.vy = this.jumpForce * 1.8;
                        s.compressed = 1;
                        this.player.combo += 3;
                        this.score += 30;
                        this._spawnParticles(s.x, s.y, '#00ddff', 20, true);
                        if (window.gameManager) window.gameManager.shakeScreen(0.2);
                        if (window.soundManager) window.soundManager.playPowerUp();
                    }
                }
            }
        }

        // Powerup collisions
        for (let p of this.powerups) {
            if (!p.collected) {
                const dist = Math.hypot(this.player.x - p.x, this.player.y - p.y);
                if (dist < this.player.size / 2 + p.size) {
                    p.collected = true;
                    this.score += 50;
                    
                    if (p.type === 'speed') {
                        this.speedMultiplier = 1.5;
                        this.speedBoostTimer = 5;
                        this._spawnParticles(p.x, p.y, '#ffdd00', 20);
                    } else if (p.type === 'shield') {
                        this.player.combo += 5;
                        this._spawnParticles(p.x, p.y, '#00ddff', 20);
                    }
                    
                    if (window.soundManager) window.soundManager.playAchievement();
                }
            }
            p.pulse += dt * 4;
            p.float = Math.sin(p.pulse) * 5;
        }

        // Move camera (scroll up)
        if (this.player.y < this.cameraY + this.canvas.height / 2) {
            let diff = (this.cameraY + this.canvas.height / 2) - this.player.y;
            this.cameraY -= diff;
            
            // Track highest point
            if (this.player.y < this.highestY) {
                this.highestY = this.player.y;
                const heightScore = Math.floor(-this.highestY / 8);
                if (heightScore > this.score) {
                    this.score = heightScore;
                    if (this.score >= 10000) {
                        window.gameManager.unlockAchievement('high_jumper', 'High Jumper', 'Reached 10000 height in Neon Jump.', '🚀', true);
                    }
                }
            }
        }

        // Update platforms (moving ones and recycling)
        for (let i = this.platforms.length - 1; i >= 0; i--) {
            let p = this.platforms[i];
            p.pulse += dt * 2;

            if (p.type === 'moving' && !p.broken) {
                p.x += p.vx * dt;
                if (p.x < 0 || p.x + p.w > this.canvas.width) p.vx *= -1;
            }

            // Remove off-screen (below camera)
            if (p.y > this.cameraY + this.canvas.height + 100) {
                this.platforms.splice(i, 1);
                // Spawn new one at the top
                const topY = Math.min(...this.platforms.map(plat => plat.y));
                this._spawnPlatform(topY - 100 - Math.random() * 50);
            }
        }

        // Update springs
        for (let i = this.springs.length - 1; i >= 0; i--) {
            const s = this.springs[i];
            if (s.compressed > 0) {
                s.compressed -= dt * 3;
                if (s.compressed < 0) s.compressed = 0;
            }
            
            // Remove off-screen springs
            if (s.y > this.cameraY + this.canvas.height + 100) {
                this.springs.splice(i, 1);
            }
        }

        // Remove off-screen powerups
        for (let i = this.powerups.length - 1; i >= 0; i--) {
            if (this.powerups[i].y > this.cameraY + this.canvas.height + 100) {
                this.powerups.splice(i, 1);
            }
        }

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += this.gravity * 0.5 * dt;
            p.life -= p.decay * dt;
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Death
        if (this.player.y > this.cameraY + this.canvas.height) {
            this._spawnParticles(this.player.x, this.player.y, '#ff4466', 30);
            this._triggerGameOver();
        }
    }

    _triggerGameOver() {
        this.gameOver = true;
        if (this._keyHandler) {
            document.removeEventListener('keydown', this._keyHandler);
            document.removeEventListener('keyup', this._keyUpHandler);
        }
        if (window.gameManager) {
            window.gameManager.shakeScreen(1.0);
            window.gameManager.checkAndUpdateHighScore('doodlejump', this.score);
        }
        if (window.soundManager) window.soundManager.playDeath();
        setTimeout(() => this._showGameOverOverlay(), 500);
    }

    _showGameOverOverlay() {
        const container = document.querySelector('.game-canvas-container');
        if (!container) return;
        let hs = 0; if (window.gameManager) hs = window.gameManager.getHighScore('doodlejump');
        const isNew = this.score >= hs && this.score > 0;

        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        overlay.innerHTML = `
            <div class="game-over-title">You Fell! 🎈</div>
            <div class="game-over-score">Score: ${this.score}</div>
            ${isNew ? '<div class="game-over-new">🎉 NEW RECORD!</div>' : `<div class="game-over-highscore">🏆 Record: ${hs}</div>`}
            <button class="game-over-btn" id="jmp-restart">↻ Play Again</button>
        `;
        container.appendChild(overlay);
        overlay.querySelector('#jmp-restart').addEventListener('click', () => {
            if (window.gameManager) window.gameManager.resetCurrentGame();
        });
    }

    draw() {
        const { ctx, canvas } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Gradient background
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, '#0a0a1e');
        gradient.addColorStop(1, '#1a1a3e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw clouds
        this.clouds.forEach(c => {
            ctx.globalAlpha = c.opacity;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.ellipse(c.x, c.y - this.cameraY, c.size, c.size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Grid pattern
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 50) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
        for (let y = (this.cameraY % 50); y < canvas.height; y += 50) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
        ctx.stroke();

        ctx.save();
        ctx.translate(0, -this.cameraY);

        // Platforms
        this.platforms.forEach(p => {
            if (p.broken) return;

            const pulse = Math.sin(p.pulse) * 2;
            ctx.shadowBlur = 12 + pulse;
            
            if (p.type === 'normal') { 
                ctx.fillStyle = '#00ddff'; 
                ctx.shadowColor = '#00ddff'; 
            } else if (p.type === 'moving') { 
                ctx.fillStyle = '#bd00ff'; 
                ctx.shadowColor = '#bd00ff'; 
            } else if (p.type === 'break') { 
                ctx.fillStyle = '#ff9900'; 
                ctx.shadowColor = '#ff9900'; 
            }

            ctx.beginPath();
            ctx.roundRect(p.x, p.y, p.w, p.h, 6);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.3)';
            ctx.fillRect(p.x + 2, p.y + 1, p.w - 4, 3);
        });

        // Springs
        this.springs.forEach(s => {
            if (!s.active) return;
            const compression = s.compressed;
            ctx.fillStyle = '#00ddff';
            ctx.shadowColor = '#00ddff';
            ctx.shadowBlur = 10;
            
            // Spring coil effect
            ctx.beginPath();
            ctx.moveTo(s.x - 8, s.y + 10 * compression);
            ctx.lineTo(s.x - 4, s.y - 5 + 10 * compression);
            ctx.lineTo(s.x + 4, s.y - 5 + 10 * compression);
            ctx.lineTo(s.x + 8, s.y + 10 * compression);
            ctx.lineWidth = 3;
            ctx.strokeStyle = '#00ddff';
            ctx.stroke();
            ctx.shadowBlur = 0;
        });

        // Powerups
        this.powerups.forEach(p => {
            if (p.collected) return;
            const pulse = Math.sin(p.pulse) * 3;
            const y = p.y + p.float;
            
            if (p.type === 'speed') {
                ctx.fillStyle = '#ffdd00';
                ctx.shadowColor = '#ffdd00';
            } else {
                ctx.fillStyle = '#00ddff';
                ctx.shadowColor = '#00ddff';
            }
            
            ctx.shadowBlur = 15 + pulse;
            ctx.beginPath();
            ctx.arc(p.x, y, p.size + pulse / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Icon
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.type === 'speed' ? '⚡' : '🛡', p.x, y);
        });

        // Player
        if (!this.gameOver) {
            ctx.save();
            ctx.translate(this.player.x, this.player.y);
            ctx.rotate(this.player.rotation);
            
            // Speed boost aura
            if (this.speedBoostTimer > 0) {
                ctx.strokeStyle = 'rgba(255, 221, 0, 0.5)';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(0, 0, this.player.size / 2 + 8, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            ctx.fillStyle = this.player.color;
            ctx.shadowColor = this.player.color;
            ctx.shadowBlur = 25;

            // Squish effect
            let scaleX = 1, scaleY = 1;
            if (this.player.vy < -300) { scaleX = 0.85; scaleY = 1.15; }
            else if (this.player.vy > 300) { scaleX = 1.1; scaleY = 0.9; }

            ctx.scale(scaleX, scaleY);
            ctx.beginPath();
            ctx.arc(0, 0, this.player.size / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Eyes
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-5, -3, 2, 0, Math.PI * 2);
            ctx.arc(5, -3, 2, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }

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
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        ctx.restore();

        // UI
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 8;
        ctx.fillText(`${this.score}`, 20, 45);
        ctx.shadowBlur = 0;

        // Combo indicator
        if (this.player.combo > 1) {
            ctx.fillStyle = '#ffdd00';
            ctx.font = 'bold 20px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#000';
            ctx.shadowBlur = 6;
            ctx.fillText(`${this.player.combo}x COMBO!`, canvas.width / 2, 40);
            ctx.shadowBlur = 0;
        }

        // Speed boost indicator
        if (this.speedBoostTimer > 0) {
            ctx.fillStyle = '#ffdd00';
            ctx.font = '16px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.fillText(`⚡ SPEED ${this.speedBoostTimer.toFixed(1)}s`, canvas.width - 20, 40);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { if (this._keyHandler) { document.removeEventListener('keydown', this._keyHandler); document.removeEventListener('keyup', this._keyUpHandler); } }
    resume() { this._bindKeys(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('doodlejump', DoodleJumpGame, {
        name: 'Neon Jump', // Renamed for styling
        canvasWidth: 600, // Thinner canvas looks better
        canvasHeight: 640
    });
}
