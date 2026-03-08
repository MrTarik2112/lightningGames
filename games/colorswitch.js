// Color Switch - Switch colors to survive
class ColorSwitch {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.score = 0;
        this.gameOver = false;
        
        this.player = { x: 0, y: 0, radius: 18 };
        this.obstacles = [];
        this.particles = [];
        
        this.colors = ['#ff4466', '#00d4ff', '#00ff88', '#ffcc00'];
        this.playerColor = 0;
        this.direction = 1;
        
        this.speed = 180;
        this.spawnTimer = 0;
        
        this._handlers = {};
    }

    init(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.gameOver = false;
        
        this.player = { x: canvas.width / 2, y: canvas.height - 120, radius: 18 };
        this.obstacles = [];
        this.particles = [];
        this.playerColor = 0;
        this.direction = 1;
        this.speed = 180;
        
        this._bindEvents();
    }

    _bindEvents() {
        this._unbindEvents();
        
        this._handlers.click = () => {
            if (this.gameOver) {
                this.init(this.canvas, this.ctx);
                return;
            }
            this.playerColor = (this.playerColor + 1) % this.colors.length;
            this._spawnParticles(this.player.x, this.player.y, this.colors[this.playerColor], 5);
            if (window.soundManager) window.soundManager.playClick();
        };
        
        this._handlers.keydown = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                this._handlers.click();
            }
        };
        
        this.canvas.addEventListener('click', this._handlers.click);
        document.addEventListener('keydown', this._handlers.keydown);
    }

    _unbindEvents() {
        this.canvas.removeEventListener('click', this._handlers.click);
        document.removeEventListener('keydown', this._handlers.keydown);
    }

    update(dt) {
        if (this.gameOver) return;
        
        // Move player left/right
        this.player.x += this.direction * this.speed * dt * 0.8;
        
        // Bounce off walls
        if (this.player.x < this.player.radius) {
            this.player.x = this.player.radius;
            this.direction = 1;
        }
        if (this.player.x > this.canvas.width - this.player.radius) {
            this.player.x = this.canvas.width - this.player.radius;
            this.direction = -1;
        }
        
        // Spawn obstacles
        this.spawnTimer += dt;
        if (this.spawnTimer > 1.8) {
            this.spawnTimer = 0;
            const gapWidth = 100 + Math.random() * 60;
            const gapX = 80 + Math.random() * (this.canvas.width - 160 - gapWidth);
            const colorIdx = Math.floor(Math.random() * 4);
            
            this.obstacles.push({
                y: -40,
                height: 35,
                gapX: gapX,
                gapWidth: gapWidth,
                color: colorIdx,
                passed: false
            });
            
            this.speed += 5;
        }
        
        // Update obstacles
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.y += this.speed * dt;
            
            // Check collision
            const playerTop = this.player.y - this.player.radius;
            const playerBottom = this.player.y + this.player.radius;
            
            if (obs.y + obs.height > playerTop && obs.y < playerBottom) {
                // In obstacle zone
                const inGap = this.player.x > obs.gapX && this.player.x < obs.gapX + obs.gapWidth;
                
                if (!inGap) {
                    if (obs.color === this.playerColor) {
                        // Match! Pass through
                        if (!obs.passed) {
                            obs.passed = true;
                            this.score += 15;
                            this._spawnParticles(this.player.x, this.player.y, this.colors[this.playerColor], 8);
                            if (window.soundManager) window.soundManager.playScore();
                        }
                    } else {
                        // Wrong color - Game Over
                        this.gameOver = true;
                        this._spawnParticles(this.player.x, this.player.y, '#fff', 20);
                        if (window.soundManager) window.soundManager.playDeath();
                        this._unbindEvents();
                    }
                }
            }
            
            if (obs.y > this.canvas.height) {
                this.obstacles.splice(i, 1);
            }
        }
        
        // Update particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 300 * dt;
            p.life -= dt * 2;
            if (p.life <= 0) this.particles.splice(i, 1);
        }
    }

    _spawnParticles(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 80 + Math.random() * 120;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 50,
                life: 1,
                color: color
            });
        }
    }

    draw() {
        const { ctx, canvas } = this;
        
        ctx.fillStyle = '#0a0a15';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Background grid
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        for (let x = 0; x < canvas.width; x += 30) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        
        // Draw obstacles
        for (const obs of this.obstacles) {
            const color = this.colors[obs.color];
            
            // Left bar
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = obs.passed ? 0 : 15;
            ctx.fillRect(0, obs.y, obs.gapX, obs.height);
            
            // Right bar
            ctx.fillRect(obs.gapX + obs.gapWidth, obs.y, canvas.width - obs.gapX - obs.gapWidth, obs.height);
            
            // Gap highlight
            if (!obs.passed) {
                ctx.fillStyle = '#0a0a15';
                ctx.fillRect(obs.gapX - 5, obs.y - 2, obs.gapWidth + 10, obs.height + 4);
            }
            ctx.shadowBlur = 0;
        }
        
        // Draw player
        const playerColor = this.colors[this.playerColor];
        ctx.fillStyle = playerColor;
        ctx.shadowColor = playerColor;
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Inner ring
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(this.player.x, this.player.y, this.player.radius - 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        
        // Particles
        for (const p of this.particles) {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        // UI
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 28px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(this.score, canvas.width / 2, 50);
        
        // Color indicator
        const colorBoxSize = 25;
        const colorStartX = canvas.width / 2 - (this.colors.length * (colorBoxSize + 8)) / 2;
        for (let i = 0; i < this.colors.length; i++) {
            const x = colorStartX + i * (colorBoxSize + 8);
            ctx.fillStyle = this.colors[i];
            if (i === this.playerColor) {
                ctx.shadowColor = this.colors[i];
                ctx.shadowBlur = 15;
            }
            ctx.beginPath();
            ctx.arc(x + colorBoxSize/2, 85, colorBoxSize/2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        if (this.gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.75)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4466';
            ctx.font = 'bold 48px Inter';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 30);
            ctx.fillStyle = '#fff';
            ctx.font = '24px Inter';
            ctx.fillText('Score: ' + this.score, canvas.width / 2, canvas.height / 2 + 20);
            ctx.font = '18px Inter';
            ctx.fillStyle = '#888';
            ctx.fillText('Click to restart', canvas.width / 2, canvas.height / 2 + 70);
        } else {
            ctx.fillStyle = '#555';
            ctx.font = '14px Inter';
            ctx.fillText('Click or Space to switch color', canvas.width / 2, canvas.height - 25);
        }
    }

    getScore() { return this.score; }
    isGameOver() { return this.gameOver; }
    pause() { this._unbindEvents(); }
    resume() { this._bindEvents(); }
}

if (window.gameManager) {
    window.gameManager.registerGame('colorswitch', ColorSwitch, {
        name: 'Color Switch',
        canvasWidth: 880,
        canvasHeight: 540
    });
}
